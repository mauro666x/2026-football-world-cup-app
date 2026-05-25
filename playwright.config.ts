import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config.
 *
 * Modos de ejecución:
 * - CI sin BASE_URL  → levanta `next start` con el build previo (job e2e en GitHub Actions)
 * - Local sin BASE_URL → levanta `next dev` automáticamente
 * - Con BASE_URL      → usa la URL indicada (ej. producción en smoke runs manuales)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Sin BASE_URL: levanta un servidor local
  // - En CI usa `next start` (build ya existe del job anterior)
  // - En local usa `next dev` para hot-reload
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: process.env.CI ? 'npm run start' : 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          // Exponer explícitamente para que next start los lea en CI
          NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          NEXT_PUBLIC_VAPID_PUBLIC_KEY:  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
          SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
          FOOTBALL_DATA_API_KEY:         process.env.FOOTBALL_DATA_API_KEY ?? '',
          VAPID_PRIVATE_KEY:             process.env.VAPID_PRIVATE_KEY ?? '',
          CRON_SECRET:                   process.env.CRON_SECRET ?? '',
        },
      },
})
