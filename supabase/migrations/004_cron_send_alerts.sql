-- Cron: llamar send-alerts cada 5 minutos
SELECT cron.schedule(
  'send-alerts-every-5min',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://hevwcntzwmkpvbgatwby.supabase.co/functions/v1/send-alerts',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ROTATED_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
