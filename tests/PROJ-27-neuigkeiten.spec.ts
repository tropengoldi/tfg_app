/**
 * PROJ-27 · Release-Notes-Seite „Neuigkeiten“ — E2E.
 * Öffentlich ohne Anmeldung, auch für Angemeldete; noindex; 360 px ohne horizontales Scrollen.
 */
import { expect, test } from '@playwright/test'

import { createDisposableUser, deleteUser, hasServiceClient, login } from './helpers/auth'

const SECTIONS = [
  'Neue Begriffe: Nase, Gaumen, Steward',
  'Punkte: jetzt auch null und halb',
  'Der Whisky-Steward wird mächtiger',
  'Sieger-Tipp und „Kenner der Woche“',
  'Neu während des Abends',
  'Neu nach dem Abend: Statistik für Nerds',
  'Hinter den Kulissen',
  'Zum Wohl',
]

test('ohne Anmeldung: Seite lädt mit allen Abschnitten, keine Umleitung', async ({ page }) => {
  await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
  expect(new URL(page.url()).pathname).toBe('/neuigkeiten')
  await expect(page.getByRole('heading', { level: 1, name: /Was gibt.s Neues im Glas/ })).toBeVisible()
  await expect(page.getByText('Stand 9. Oktober 2026')).toBeVisible()
  for (const s of SECTIONS) {
    await expect(page.getByRole('heading', { level: 2, name: s })).toBeVisible()
  }
})

test('noindex für Suchmaschinen', async ({ page }) => {
  await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})

test('360 px: kein horizontales Scrollen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('„Zur App“ ohne Anmeldung führt zur Anmeldung', async ({ page }) => {
  await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Zur App' }).click()
  await page.waitForURL((u) => new URL(u).pathname === '/login')
})

test('angemeldet: Seite bleibt erreichbar, keine Umleitung', async ({ page }) => {
  test.skip(!hasServiceClient, 'Service-Client nötig')
  const u = await createDisposableUser(`n27${Date.now()}`)
  try {
    await login(page, u.email)
    await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
    expect(new URL(page.url()).pathname).toBe('/neuigkeiten')
    await expect(page.getByRole('heading', { level: 1, name: /Was gibt.s Neues im Glas/ })).toBeVisible()
  } finally {
    await deleteUser(u.id)
  }
})

test('Sichtprüfung: Screenshot (nur mit SHOT_DIR)', async ({ page }) => {
  test.skip(!process.env.SHOT_DIR, 'nur für die manuelle Sichtprüfung')
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/neuigkeiten', { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${process.env.SHOT_DIR}/p27-mobile.png`, fullPage: false })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({ path: `${process.env.SHOT_DIR}/p27-desktop.png`, fullPage: false })
})
