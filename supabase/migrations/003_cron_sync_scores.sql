-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron: llamar la Edge Function sync-scores cada minuto
-- La Authorization key se lee de Supabase Vault (nunca hardcodeada)
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
