-- =============================================================================
-- MIGRACIÓN DE SEGURIDAD: Mover service_role_key a Supabase Vault
-- =============================================================================
-- ANTES DE APLICAR ESTA MIGRACIÓN:
--   1. Rotar la Service Role Key en Supabase Dashboard:
--      Project Settings → API → Service role secret → "Roll key"
--   2. Insertar la NUEVA key en Vault ejecutando en SQL Editor:
--      SELECT vault.create_secret('<NUEVA_SERVICE_ROLE_KEY>', 'service_role_key');
-- =============================================================================

-- Eliminar los cron jobs existentes (que usan la key comprometida hardcodeada)
SELECT cron.unschedule('sync-scores-every-minute');
SELECT cron.unschedule('send-alerts-every-5min');

-- Recrear sync-scores leyendo la key desde Vault
SELECT cron.schedule(
  'sync-scores-every-minute',
  '* * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hevwcntzwmkpvbgatwby.supabase.co/functions/v1/sync-scores',
      headers := format(
        '{"Content-Type": "application/json", "Authorization": "Bearer %s"}',
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
      )::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Recrear send-alerts leyendo la key desde Vault
SELECT cron.schedule(
  'send-alerts-every-5min',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hevwcntzwmkpvbgatwby.supabase.co/functions/v1/send-alerts',
      headers := format(
        '{"Content-Type": "application/json", "Authorization": "Bearer %s"}',
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
      )::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
