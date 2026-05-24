// ============================================================
// WORLD CUP 2026 — TypeScript Types
// ============================================================

export type TeamCode = string // ISO alpha-2

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  points: number
  created_at: string
}

export interface Team {
  id: number
  name: string
  code: string
  fifa_code: string | null
  group_letter: string | null
  flag_url: string | null
  coach: string | null
  fifa_ranking: number | null
  confederation: string | null
}

export interface Player {
  id: number
  team_id: number
  name: string
  position: 'GK' | 'DF' | 'MF' | 'FW' | null
  number: number | null
  birth_date: string | null
  club: string | null
  photo_url: string | null
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HALFTIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'

export type MatchStage =
  | 'GROUP'
  | 'ROUND_32'
  | 'ROUND_16'
  | 'QUARTER'
  | 'SEMI'
  | 'THIRD'
  | 'FINAL'

export interface Match {
  id: number
  external_id: number | null
  stage: MatchStage
  group_letter: string | null
  home_team_id: number
  away_team_id: number
  home_score: number | null
  away_score: number | null
  home_penalties: number | null
  away_penalties: number | null
  status: MatchStatus
  minute: number | null
  match_date: string
  venue: string | null
  city: string | null
  updated_at: string
  home_team?: Team
  away_team?: Team
}

export interface HeadToHead {
  id: number
  team1_id: number
  team2_id: number
  team1_wins: number
  team2_wins: number
  draws: number
  last_match_date: string | null
  matches_data: H2HMatch[] | null
}

export interface H2HMatch {
  date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  competition: string
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  locked: boolean
  created_at: string
  updated_at: string
  match?: Match
}

export interface StagePrediction {
  id: number
  user_id: string
  stage: string
  group_letter: string | null
  predicted_team_id: number
  is_correct: boolean | null
  points_earned: number
  locked: boolean
  created_at: string
  team?: Team
}

export interface PushSubscription {
  id: number
  user_id: string
  subscription: PushSubscriptionJSON
  created_at: string
}

export interface MatchAlert {
  id: number
  user_id: string
  match_id: number
  alert_1h_before: boolean
  alert_kickoff: boolean
  alert_final: boolean
}

// Standings
export interface GroupStanding {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

// Scoring
export interface ScoreResult {
  exact: boolean      // 5 pts
  correct: boolean    // 3 pts
  oneTeam: boolean    // 1 pt
  points: number
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number
  profile: Profile
  total_predictions: number
  correct_predictions: number
}

// Notification
export type NotificationType = 'MATCH_START' | 'MATCH_END' | 'SCORE_UPDATE' | 'PREDICTION_LOCKED'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  match_id?: number
  read: boolean
  created_at: string
}
