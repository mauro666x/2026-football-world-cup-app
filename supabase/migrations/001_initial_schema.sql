-- ============================================================
-- MUNDIAL FIFA 2026 — Schema inicial
-- ============================================================

-- Usuarios (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Selecciones
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  fifa_code TEXT,
  group_letter CHAR(1),
  flag_url TEXT,
  coach TEXT,
  fifa_ranking INT,
  confederation TEXT
);

-- Jugadores
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  team_id INT REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT CHECK (position IN ('GK', 'DF', 'MF', 'FW')),
  number INT,
  birth_date DATE,
  club TEXT,
  photo_url TEXT,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0
);

-- Partidos
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  external_id INT,
  stage TEXT NOT NULL CHECK (stage IN ('GROUP','ROUND_32','ROUND_16','QUARTER','SEMI','THIRD','FINAL')),
  group_letter CHAR(1),
  home_team_id INT REFERENCES teams(id),
  away_team_id INT REFERENCES teams(id),
  home_score INT,
  away_score INT,
  home_penalties INT,
  away_penalties INT,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','LIVE','HALFTIME','FINISHED','POSTPONED','CANCELLED')),
  minute INT,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  city TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id) WHERE external_id IS NOT NULL;

-- Head to head
CREATE TABLE IF NOT EXISTS head_to_head (
  id SERIAL PRIMARY KEY,
  team1_id INT REFERENCES teams(id),
  team2_id INT REFERENCES teams(id),
  team1_wins INT DEFAULT 0,
  team2_wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  last_match_date DATE,
  matches_data JSONB,
  UNIQUE(team1_id, team2_id)
);

-- Predicciones de partido
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL,
  predicted_away_score INT NOT NULL,
  points_earned INT DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);

-- Predicciones de fase
CREATE TABLE IF NOT EXISTS stage_predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  group_letter CHAR(1),
  predicted_team_id INT REFERENCES teams(id),
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stage, group_letter, predicted_team_id)
);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Match alerts
CREATE TABLE IF NOT EXISTS match_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  alert_1h_before BOOLEAN DEFAULT true,
  alert_kickoff BOOLEAN DEFAULT true,
  alert_final BOOLEAN DEFAULT true,
  UNIQUE(user_id, match_id)
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams (public read)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_read_all" ON teams FOR SELECT USING (true);

-- Players (public read)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_read_all" ON players FOR SELECT USING (true);

-- Matches (public read)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_read_all" ON matches FOR SELECT USING (true);

-- Head to head (public read)
ALTER TABLE head_to_head ENABLE ROW LEVEL SECURITY;
CREATE POLICY "h2h_read_all" ON head_to_head FOR SELECT USING (true);

-- Predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions_read_own" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON predictions FOR UPDATE USING (auth.uid() = user_id AND locked = false);

-- Stage predictions
ALTER TABLE stage_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_preds_read_own" ON stage_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stage_preds_insert_own" ON stage_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stage_preds_update_own" ON stage_predictions FOR UPDATE USING (auth.uid() = user_id AND locked = false);

-- Push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_manage_own" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Match alerts
ALTER TABLE match_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_manage_own" ON match_alerts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Helper functions
-- ============================================================

-- Incrementar puntos del usuario (llamada desde sync-scores)
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET points = points + p_points WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
