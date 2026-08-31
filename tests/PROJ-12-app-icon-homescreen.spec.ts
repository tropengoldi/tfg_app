import { expect, test } from '@playwright/test'

/**
 * PROJ-12 — App-Icon & Homescreen. Alles statische `<head>`-Metadaten +
 * Asset-Dateien; kein Login nötig, beide Projekte.
 */

test('Head: Manifest-, Icon- und Apple-Touch-Links + Theme-Color', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('head link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/manifest.webmanifest',
  )
  await expect(page.locator('head link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/icon.svg',
  )
  await expect(page.locator('head link[rel="icon"][type="image/png"]')).toHaveAttribute(
    'href',
    '/favicon-32.png',
  )
  await expect(page.locator('head link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-icon.png',
  )
  await expect(page.locator('head meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#161310',
  )
})

test('Head: iOS-Homescreen-Metadaten (Name „Whizzky“, capable)', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('head meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'Whizzky',
  )
  await expect(page.locator('head meta[name="mobile-web-app-capable"]')).toHaveAttribute(
    'content',
    'yes',
  )
  await expect(page.locator('head meta[name="application-name"]')).toHaveAttribute(
    'content',
    'Whizzky',
  )
})

test('Titel folgt dem Template „<Seite> · Whizzky“', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle('Anmelden · Whizzky')
})

test('/manifest.webmanifest ist ohne Login erreichbar und valide', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('manifest')

  const m = (await res.json()) as Record<string, unknown>
  expect(m.name).toBe('Whizzky – Treffpunkt feiner Geister')
  expect(m.short_name).toBe('Whizzky')
  expect(m.display).toBe('standalone')
  expect(m.orientation).toBe('portrait')
  expect(m.theme_color).toBe('#161310')
  expect(m.background_color).toBe('#161310')

  const icons = m.icons as Array<{ src: string; sizes: string; purpose?: string }>
  expect(icons.map((i) => i.sizes)).toEqual(['192x192', '512x512', '512x512'])
  expect(icons.some((i) => i.purpose === 'maskable')).toBe(true)
})

test('Alle Icon-Dateien werden ausgeliefert (ohne Login, richtiger Typ)', async ({ request }) => {
  const cases: Array<[string, string]> = [
    ['/icon.svg', 'image/svg+xml'],
    ['/favicon-32.png', 'image/png'],
    ['/apple-icon.png', 'image/png'],
    ['/icon-192.png', 'image/png'],
    ['/icon-512.png', 'image/png'],
    ['/icon-512-maskable.png', 'image/png'],
  ]
  for (const [path, type] of cases) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
    expect(res.headers()['content-type'], path).toContain(type)
    expect(Number(res.headers()['content-length'] ?? '1'), path).toBeGreaterThan(0)
  }
})

test('Der Manifest-Request wird NICHT auf /login umgeleitet', async ({ request }) => {
  // proxy.ts-Matcher-Ausnahme: die Auth-Middleware darf hier nicht greifen.
  const res = await request.get('/manifest.webmanifest', { maxRedirects: 0 })
  expect(res.status()).toBe(200)
})
