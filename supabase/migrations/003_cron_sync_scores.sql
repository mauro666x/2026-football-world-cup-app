-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron: llamar la Edge Function sync-scores cada minuto
SELECT cron.schedule(
  'sync-scores-every-minute',
  '* * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hevwcntzwmkpvbgatwby.supabase.co/functions/v1/sync-scores',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ROTATED_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
