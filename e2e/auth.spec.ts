import { test, expect } from '@playwright/test'

/**
 * Auth E2E tests — login, logout y protección de rutas.
 * Usa credenciales de prueba (cuenta de staging, no de producción).
 */
const TEST_EMAIL    = process.env.E2E_TEST_EMAIL    ?? 'e2e@test.mundial2026.app'
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'Test1234!'

test.describe('Autenticación', () => {
  test('login exitoso redirige al inicio', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Contraseña').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Después del login, sale de /login (redirige a / o la ruta protegida)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('wrong@email.com')
    await page.getByLabel('Contraseña').fill('wrongpassword')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(
      page.getByText(/incorrectos|inválid|error/i)
    ).toBeVisible({ timeout: 8000 })
  })

  test('usuario autenticado puede acceder a predicciones', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Contraseña').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 8000 })

    // Acceder a predicciones — no debe redirigir a login
    await page.goto('/predictions')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveTitle(/Predicciones/i)
  })
})
