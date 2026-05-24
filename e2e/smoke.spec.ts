import { test, expect } from '@playwright/test'

/**
 * Smoke tests — verifican que las páginas principales cargan sin errores.
 * Se ejecutan contra la URL de preview/producción en CI.
 */
test.describe('Smoke tests', () => {
  test('home page carga y muestra "MUNDIAL"', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Mundial 2026/i)
    await expect(page.getByText('MUNDIAL', { exact: false })).toBeVisible()
    await expect(page.getByText('2026')).toBeVisible()
  })

  test('grupos muestra los 12 grupos oficiales', async ({ page }) => {
    await page.goto('/groups')
    await expect(page).toHaveTitle(/Grupos/i)
    // Los 12 grupos A-L deben estar presentes
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) {
      await expect(page.getByText(`GRUPO ${letter}`, { exact: true })).toBeVisible()
    }
  })

  test('grupos contiene equipos del sorteo oficial', async ({ page }) => {
    await page.goto('/groups')
    // Equipos clave del sorteo de diciembre 2025
    await expect(page.getByText('México')).toBeVisible()       // Grupo A
    await expect(page.getByText('Argentina')).toBeVisible()    // Grupo J
    await expect(page.getByText('Francia')).toBeVisible()      // Grupo I
    await expect(page.getByText('Alemania')).toBeVisible()     // Grupo E
    await expect(page.getByText('Panamá')).toBeVisible()       // Grupo L
  })

  test('partidos carga sin error', async ({ page }) => {
    await page.goto('/matches')
    await expect(page).toHaveTitle(/Partidos/i)
    await expect(page.locator('body')).not.toContainText('No se pudo cargar')
  })

  test('equipos carga los 48 equipos', async ({ page }) => {
    await page.goto('/teams')
    await expect(page).toHaveTitle(/Equipos/i)
    await expect(page.locator('body')).not.toContainText('No se pudo cargar')
    // Verifica que hay equipos de múltiples grupos
    await expect(page.getByText('Grupo A')).toBeVisible()
    await expect(page.getByText('Grupo L')).toBeVisible()
  })

  test('en vivo carga sin error', async ({ page }) => {
    await page.goto('/live')
    await expect(page).toHaveTitle(/En Vivo/i)
    await expect(page.locator('body')).not.toContainText('No se pudo cargar')
  })

  test('clasificación carga sin error', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page).toHaveTitle(/Clasificación/i)
    await expect(page.locator('body')).not.toContainText('No se pudo cargar')
  })

  test('página de login muestra formulario', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Iniciar Sesión/i)
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('página de registro muestra formulario', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveTitle(/Crear Cuenta/i)
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
  })

  test('navbar muestra los 6 links de navegación', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('header nav')
    for (const label of ['Inicio', 'Grupos', 'Partidos', 'En Vivo', 'Predicciones', 'Ranking']) {
      await expect(nav.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('rutas protegidas redirigen a /login', async ({ page }) => {
    await page.goto('/predictions')
    await expect(page).toHaveURL(/\/login/)
  })
})
