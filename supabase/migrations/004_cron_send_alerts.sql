-- Cron: llamar send-alerts cada 5 minutos
-- La Authorization key se lee de Supabase Vault (nunca hardcodeada)
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
