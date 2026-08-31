import { expect, test, type Page } from '@playwright/test'

import { createDisposableUser, deleteUser, hasServiceClient, login } from './helpers/auth'

/**
 * PROJ-13 — Marken-Auftritt (Whizzky). Rein visuell: Marken-Block auf den
 * Auth-Seiten + dezente Deko-Flächen. Kein Login für die Auth-Tests nötig.
 */

/** WCAG-Kontrastverhältnis zwischen zwei „rgb(r, g, b)"-Strings bzw. Tripeln. */
async function contrastOfElement(page: Page, selector: string, bgHex = '#161310') {
  return page.evaluate(
    ({ selector, bgHex }) => {
      const el = document.querySelector(selector)
      if (!el) return null
      const parse = (s: string): [number, number, number] => {
        if (s.startsWith('#')) {
          const h = s.slice(1)
          return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
        }
        const m = s.match(/(\d+(?:\.\d+)?)/g)!.map(Number)
        return [m[0], m[1], m[2]]
      }
      const lum = (rgb: [number, number, number]) => {
        const a = rgb.map((v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
      }
      const fg = parse(getComputedStyle(el).color)
      const bg = parse(bgHex)
      const l1 = lum(fg)
      const l2 = lum(bg)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    },
    { selector, bgHex },
  )
}

// ===========================================================================
// Marken-Block (Auth-Seiten)
// ===========================================================================
test('Login zeigt „Whizzky" + „Treffpunkt feiner Geister", nicht mehr „Whisky-Tasting"', async ({
  page,
}) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Whizzky', { exact: true })).toBeVisible()
  await expect(page.getByText('Treffpunkt feiner Geister')).toBeVisible()
  await expect(page.getByText('Whisky-Tasting')).toHaveCount(0)
})

test('Derselbe Marken-Block auf „Passwort vergessen"', async ({ page }) => {
  await page.goto('/passwort-vergessen', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Whizzky', { exact: true })).toBeVisible()
  await expect(page.getByText('Treffpunkt feiner Geister')).toBeVisible()
})

test('Marken-Text erfüllt WCAG AA über der Grundfläche', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  // „Whizzky" = große Überschrift → ≥ 3:1; die Unterzeile ist Fließtext → ≥ 4,5:1.
  const whizzky = await contrastOfElement(page, 'p.font-display.text-primary')
  const tagline = await contrastOfElement(page, 'p.text-muted-foreground')
  expect(whizzky ?? 0).toBeGreaterThanOrEqual(4.5)
  expect(tagline ?? 0).toBeGreaterThanOrEqual(4.5)
})

// ===========================================================================
// Deko-Flächen
// ===========================================================================
test('Auth-Hintergrund ist vorhanden, aria-hidden und klick-inert', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  const layer = page.locator('.brand-surface')
  await expect(layer).toHaveCount(1)
  await expect(layer).toHaveAttribute('aria-hidden', 'true')
  const style = await layer.evaluate((el) => {
    const s = getComputedStyle(el)
    return { pe: s.pointerEvents, bgImg: s.backgroundImage }
  })
  expect(style.pe).toBe('none')
  expect(style.bgImg).toContain('radial-gradient')
})

test('Im Druck-Modus verschwindet die Deko-Fläche', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.brand-surface')).toHaveCSS('display', 'none')
})

test('320 px: die Unterzeile wird nicht abgeschnitten', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  const tag = page.getByText('Treffpunkt feiner Geister')
  await expect(tag).toBeVisible()
  const overflow = await tag.evaluate((el) => el.scrollWidth - el.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

// ===========================================================================
// Band hinter dem PageHeader (angemeldete App)
// ===========================================================================
test.describe('App-Seiten', () => {
  test.skip(!hasServiceClient, 'Service-Client nötig')
  let user: { id: string; email: string }

  test.beforeAll(async () => {
    if (!hasServiceClient) return
    user = await createDisposableUser(`r13${Date.now()}`, { active: true })
  })
  test.afterAll(async () => {
    if (user) await deleteUser(user.id)
  })

  test('Der PageHeader trägt das header-band mit einem ::before-Verlauf', async ({ page }) => {
    await login(page, user.email)
    await page.goto('/profil', { waitUntil: 'networkidle' })
    const header = page.locator('header.header-band').first()
    await expect(header).toBeVisible()
    await expect(header.getByRole('heading', { level: 1, name: 'Profil' })).toBeVisible()

    const before = await header.evaluate((el) => {
      const s = getComputedStyle(el, '::before')
      return { content: s.content, bg: s.backgroundImage, pos: s.position }
    })
    expect(before.content).not.toBe('none')
    expect(before.bg).toContain('gradient')
    expect(before.pos).toBe('absolute')

    // Der Titel bleibt gut lesbar auf dem Band.
    const c = await contrastOfElement(page, 'header.header-band h1')
    expect(c ?? 0).toBeGreaterThanOrEqual(4.5)
  })
})
