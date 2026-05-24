-- Fix: el trigger no debe nunca bloquear el registro de auth
-- Si falla la inserción del perfil, el error se traga y el usuario se crea igual
-- El perfil se crea luego desde el cliente

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca fallar: si el perfil no se pudo crear aquí,
  -- el cliente lo intentará de nuevo en el paso siguiente
  RAISE WARNING 'handle_new_user error (ignorado): %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
