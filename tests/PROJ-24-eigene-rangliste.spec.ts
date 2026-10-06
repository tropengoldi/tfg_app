import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  closeAllActiveEvents,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  hasServiceClient,
  insertRatingDirect,
  login,
  serviceClient,
  startEventDirect,
  whiskyIdsByPosition,
} from './helpers/auth'

/**
 * PROJ-24 · Eigene Live-Rangliste — E2E.
 * Aufklappbereich in der Bewertungsansicht: Grundzustand + Merken, Zeilen und
 * Reihenfolge, Neuordnen nach dem Speichern, Zeile → Whisky (inkl. Rückfrage),
 * Pokal-Knopf ↔ Tipp-Feld, Fehlerfall, nach dem Abschluss mit Namen, Blindheit,
 * 360 px mit 10 Whiskies, gesperrter Gerätespeicher.
 * Die Platzierungsregel prüft `src/lib/own-ranking.test.ts`.
 *
 * Startet aktive Events (one-active-event-Regel) → nicht während eines echten
 * Tastings laufen lassen, und mit `--workers=1`.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA24-${STAMP}-${tag}`
const NAMES = ['Ardbeg Uigeadail', 'Talisker 10', 'Glenfarclas 105', 'Springbank 15', 'Lagavulin 16']

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

type U = { id: string; email: string }
let adminId = ''
let a: U // Gastgeber, hat bewertet
let b: U // hat nichts bewertet
let steward: U
let liveId = ''
let w: string[] = []

async function openRating(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
}

const toggle = (page: Page) => page.getByRole('button', { name: /^Meine Rangliste/ })
const list = (page: Page) => page.getByRole('list', { name: 'Meine Rangliste' })
const rows = (page: Page) => list(page).getByRole('listitem')
const tipTrigger = (page: Page) => page.getByRole('combobox', { name: 'Dein Sieger-Tipp' })
const pokal = (page: Page, n: number) =>
  list(page).getByRole('button', {
    name: new RegExp(`^(Dein Tipp: Whisky ${n}|Whisky ${n} als Sieger tippen|Whisky ${n}, nicht getippt)$`),
  })

async function expand(page: Page) {
  if ((await toggle(page).getAttribute('aria-expanded')) !== 'true') await toggle(page).click()
  await expect(list(page).or(page.getByText(/^Noch nichts bewertet/))).toBeVisible()
}

async function storedTip(eventId: string, profileId: string): Promise<number | null> {
  const { data } = await serviceClient()
    .from('winner_tips')
    .select('whisky_id')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .maybeSingle()
  if (!data) return null
  return (await whiskyIdsByPosition(eventId)).indexOf(data.whisky_id) + 1
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient().from('profiles').select('id').eq('role', 'admin').limit(1).single()
  adminId = data!.id
  a = await createDisposableUser(`a24${STAMP}`)
  b = await createDisposableUser(`b24${STAMP}`)
  steward = await createDisposableUser(`s24${STAMP}`)

  liveId = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC('live') })
  await serviceClient()
    .from('tasting_events')
    .update({ rating_step: 0.5, helper_id: steward.id })
    .eq('id', liveId)
  await addParticipant(liveId, b.id)
  for (const [i, n] of NAMES.entries()) await addWhiskyAs(i % 2 ? b.email : a.email, liveId, n)
  w = await whiskyIdsByPosition(liveId)
  // a: W3 13,5 > W1 12 > W2 9,5; W4/W5 unbewertet.
  const R = (i: number, nose: number, taste: number) =>
    insertRatingDirect({ whiskyId: w[i], eventId: liveId, profileId: a.id, nose, taste })
  await R(0, 4, 8)
  await R(1, 3, 6.5)
  await R(2, 4.5, 9)
  await serviceClient().from('winner_tips').upsert({ event_id: liveId, profile_id: a.id, whisky_id: w[0] })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA24-${STAMP}-`)
  for (const u of [a, b, steward]) if (u) await deleteUser(u.id)
})

// ===========================================================================
// Kein Bereich
// ===========================================================================
test('Tasting in Vorbereitung: keine Rangliste', async ({ page }) => {
  const draftId = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC('draft') })
  await login(page, a.email)
  await openRating(page, draftId)
  await expect(page.getByText('Der Abend hat noch nicht begonnen.')).toBeVisible()
  await expect(toggle(page)).toHaveCount(0)
})

test('Tasting läuft, aber noch kein Whisky ausgeschenkt: keine Rangliste', async ({ page }) => {
  await startEventDirect(liveId, 0)
  await login(page, a.email)
  await openRating(page, liveId)
  await expect(page.getByText(/warte auf den ersten Whisky/)).toBeVisible()
  await expect(toggle(page)).toHaveCount(0)
  // Ab hier läuft das Haupt-Event bei Whisky 4 (bleibt aktiv, nur weiterschalten).
  await serviceClient().from('tasting_events').update({ current_position: 4 }).eq('id', liveId)
})

test('Whisky-Steward erreicht die Bewertungsansicht nicht → keine Rangliste', async ({ page }) => {
  await login(page, steward.email)
  await page.goto(`/tastings/${liveId}/bewerten`, { waitUntil: 'networkidle' })
  await expect(toggle(page)).toHaveCount(0)
  await expect(page.getByRole('combobox', { name: 'Dein Sieger-Tipp' })).toHaveCount(0)
})

// ===========================================================================
// Anzeige
// ===========================================================================
test('Grundzustand zugeklappt, Kopf „Meine Rangliste (3 von 5 bewertet)"', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expect(toggle(page)).toHaveText('Meine Rangliste (3 von 5 bewertet)')
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
  await expect(list(page)).toBeHidden()
})

test('Zeilen: nur bewertete, Reihenfolge nach Punkten, halbe Punkte mit Komma', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await expect(rows(page)).toHaveCount(3)
  await expect(rows(page).nth(0)).toContainText('1.')
  await expect(rows(page).nth(0)).toContainText('Whisky 3')
  await expect(rows(page).nth(0)).toContainText('Nase 4,5 · Gaumen 9')
  await expect(rows(page).nth(0)).toContainText('13,5')
  await expect(rows(page).nth(1)).toContainText('Whisky 1')
  await expect(rows(page).nth(1)).toContainText('12')
  await expect(rows(page).nth(2)).toContainText('Whisky 2')
  await expect(rows(page).nth(2)).toContainText('9,5')
  await expect(list(page)).not.toContainText('Whisky 4')
  await expect(list(page)).not.toContainText('Whisky 5')
})

test('Auf/Zu wird pro Gerät gemerkt — über Neuladen und Whisky-Wechsel', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')
  await expect(list(page)).toBeVisible()

  await page.getByRole('button', { name: /^Whisky 2,/ }).click()
  await expect(page.getByText('Whisky 2 von 5')).toBeVisible()
  await expect(list(page)).toBeVisible()

  await toggle(page).click()
  await page.reload({ waitUntil: 'networkidle' })
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
})

test('Noch nichts bewertet → Leerzustand', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await expect(toggle(page)).toHaveText('Meine Rangliste (0 von 5 bewertet)')
  await expand(page)
  await expect(
    page.getByText('Noch nichts bewertet — deine Rangliste füllt sich mit jeder Bewertung.'),
  ).toBeVisible()
})

test('Blindheit: im laufenden Tasting stehen keine Whisky-Namen in der ausgelieferten Seite', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  const html = await page.content()
  for (const n of NAMES) expect(html).not.toContain(n)
})

// ===========================================================================
// Zeile antippen
// ===========================================================================
test('Zeile antippen → Bewertungskarte zeigt diesen Whisky mit gespeicherten Werten', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await rows(page).nth(0).getByRole('button', { name: /^Platz 1: Whisky 3/ }).click()
  await expect(page.getByText('Whisky 3 von 5')).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Nasenpunkte' })).toHaveAttribute('aria-valuenow', '4.5')
  await expect(page.getByRole('slider', { name: 'Gaumenpunkte' })).toHaveAttribute('aria-valuenow', '9')
})

test('Ungespeicherte Änderung + Zeile antippen → Rückfrage wie bei der Positionsleiste', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await expect(page.getByText('Whisky 4 von 5')).toBeVisible()
  await page.getByRole('button', { name: 'Nasenpunkte erhöhen' }).click()
  await rows(page).nth(1).getByRole('button', { name: /^Platz 2: Whisky 1/ }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toContainText('Nicht gespeicherte Bewertung')
  await dialog.getByRole('button', { name: 'Hier bleiben' }).click()
  await expect(page.getByText('Whisky 4 von 5')).toBeVisible()
})

// ===========================================================================
// Neuordnen
// ===========================================================================
test('Ungespeichertes ändert die Liste nicht; nach dem Speichern ordnet sie sich sofort neu', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await expect(page.getByText('Whisky 4 von 5')).toBeVisible()

  const nose = page.getByRole('slider', { name: 'Nasenpunkte' })
  const taste = page.getByRole('slider', { name: 'Gaumenpunkte' })
  await nose.focus()
  await page.keyboard.press('End')
  await taste.focus()
  await page.keyboard.press('End')
  await expect(page.getByText('Noch nicht gespeichert.')).toBeVisible()
  await expect(rows(page)).toHaveCount(3)

  await page.getByRole('button', { name: 'Speichern', exact: true }).click()
  await expect(page.getByText('Bewertung gespeichert.')).toBeVisible()
  await expect(rows(page)).toHaveCount(4)
  await expect(rows(page).nth(0)).toContainText('Whisky 4')
  await expect(rows(page).nth(0)).toContainText('15')
  await expect(toggle(page)).toHaveText('Meine Rangliste (4 von 5 bewertet)')
})

// ===========================================================================
// Sieger-Tipp
// ===========================================================================
test('Pokal markiert den Tipp; Pokal in anderer Zeile setzt den Tipp, Feld zieht mit', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'true')
  await expect(pokal(page, 3)).toHaveAttribute('aria-pressed', 'false')

  await pokal(page, 3).click()
  await expect(page.getByText('Tipp gespeichert: Whisky 3')).toBeVisible()
  await expect(pokal(page, 3)).toHaveAttribute('aria-pressed', 'true')
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'false')
  await expect(tipTrigger(page)).toHaveText(/Whisky 3/)
  await expect.poll(() => storedTip(liveId, a.id)).toBe(3)
})

test('Tipp über das Feld ändern → Pokal wandert mit; unbewerteter Tipp → kein Pokal in der Liste', async ({
  page,
}) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)

  await tipTrigger(page).click()
  await page.getByRole('option', { name: 'Whisky 2', exact: true }).click()
  await expect(page.getByText('Tipp gespeichert: Whisky 2')).toBeVisible()
  await expect(pokal(page, 2)).toHaveAttribute('aria-pressed', 'true')
  await expect(pokal(page, 3)).toHaveAttribute('aria-pressed', 'false')

  // Whisky 5 ist nicht bewertet → steht nicht in der Liste.
  await tipTrigger(page).click()
  await page.getByRole('option', { name: 'Whisky 5', exact: true }).click()
  await expect(page.getByText('Tipp gespeichert: Whisky 5')).toBeVisible()
  await expect(list(page).locator('[aria-pressed="true"]')).toHaveCount(0)
  await expect(tipTrigger(page)).toHaveText(/Whisky 5/)
})

test('Eigenen Tipp-Pokal erneut antippen → nichts passiert', async ({ page }) => {
  await serviceClient().from('winner_tips').upsert({ event_id: liveId, profile_id: a.id, whisky_id: w[0] })
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'true')
  await pokal(page, 1).click()
  await page.waitForTimeout(800)
  await expect(page.getByText(/Tipp gespeichert/)).toHaveCount(0)
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'true')
  expect(await storedTip(liveId, a.id)).toBe(1)
})

test('Tipp per Pokal schlägt fehl → Fehlermeldung, Pokal bleibt beim alten Tipp', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  await page.route(`**/tastings/${liveId}/bewerten`, (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  await pokal(page, 3).click()
  await expect(page.getByText('Verbindung fehlgeschlagen — Tipp nicht gespeichert.')).toBeVisible()
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'true')
  await expect(pokal(page, 3)).toHaveAttribute('aria-pressed', 'false')
  await expect(tipTrigger(page)).toHaveText(/Whisky 1/)
  await page.unroute(`**/tastings/${liveId}/bewerten`)
  expect(await storedTip(liveId, a.id)).toBe(1)
})

test('Gesperrter Gerätespeicher: Liste startet zu, lässt sich trotzdem öffnen, keine Fehlerseite', async ({
  browser,
}) => {
  const ctx = await browser.newContext()
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError')
      },
    })
  })
  const page = await ctx.newPage()
  await login(page, a.email)
  await openRating(page, liveId)
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false')
  await toggle(page).click()
  await expect(list(page)).toBeVisible()
  await expect(page.getByText('liess sich gerade nicht laden')).toHaveCount(0)
  await ctx.close()
})

// ===========================================================================
// Nach dem Abschluss
// ===========================================================================
test('Abgeschlossen: Namen erscheinen, Pokale gesperrt, Tipp bleibt markiert; Plätze = „Dein Platz"', async ({
  page,
}) => {
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', liveId)

  await login(page, a.email)
  await openRating(page, liveId)
  await expand(page)
  // a: W4 15 > W3 13,5 > W1 12 > W2 9,5
  const expected: [number, string][] = [
    [4, NAMES[3]],
    [3, NAMES[2]],
    [1, NAMES[0]],
    [2, NAMES[1]],
  ]
  for (const [i, [pos, name]] of expected.entries()) {
    await expect(rows(page).nth(i)).toContainText(`Whisky ${pos}`)
    await expect(rows(page).nth(i)).toContainText(name)
  }
  await expect(pokal(page, 1)).toHaveAttribute('aria-pressed', 'true')
  await expect(pokal(page, 1)).toBeDisabled()
  await expect(pokal(page, 3)).toBeDisabled()
  // BUG-2: gesperrter Pokal nennt keine Aktion mehr.
  await expect(pokal(page, 3)).toHaveAccessibleName('Whisky 3, nicht getippt')
  // BUG-1 (aus PROJ-7): eingefrorene Karte fordert nicht mehr zum Ändern auf.
  await expect(page.getByText('Gespeichert.', { exact: true })).toBeVisible()
  await expect(page.getByText(/du kannst die Werte noch ändern/)).toHaveCount(0)

  // Ergebnisseite: „Dein Platz" stimmt mit der eigenen Rangliste überein.
  await page.goto(`/tastings/${liveId}/ergebnisse`, { waitUntil: 'networkidle' })
  const ranking = page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem')
  for (const [i, [, name]] of expected.entries()) {
    await expect(ranking.filter({ hasText: name })).toContainText(`Dein Platz: ${i + 1}`)
  }
})

// ===========================================================================
// Mobil
// ===========================================================================
test('360 px, 10 bewertete Whiskies: ohne horizontales Scrollen, alle Zeilen ohne inneres Scrollen, ≥ 44 px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  const ev = await createEventDirect({
    hostId: a.id,
    createdBy: adminId,
    location: LOC('ten'),
    maxWhiskies: 10,
  })
  for (let i = 1; i <= 10; i++) await addWhiskyAs(a.email, ev, `Glenfarclas Family Cask ${1980 + i}`)
  const ids = await whiskyIdsByPosition(ev)
  for (const [i, id] of ids.entries()) {
    await insertRatingDirect({ whiskyId: id, eventId: ev, profileId: a.id, nose: (i % 5) + 0, taste: 10 - i })
  }
  await startEventDirect(ev, 10)

  await login(page, a.email)
  await openRating(page, ev)
  await expand(page)
  await expect(rows(page)).toHaveCount(10)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
  const inner = await list(page).evaluate((el) => el.scrollHeight - el.clientHeight)
  expect(inner).toBeLessThanOrEqual(0)
  for (let i = 0; i < 10; i++) {
    const rowBox = await rows(page).nth(i).boundingBox()
    expect(rowBox!.height).toBeGreaterThanOrEqual(44)
    expect(rowBox!.x + rowBox!.width).toBeLessThanOrEqual(360)
  }
  const pBox = await pokal(page, 1).boundingBox()
  expect(pBox!.width).toBeGreaterThanOrEqual(44)
  expect(pBox!.height).toBeGreaterThanOrEqual(44)
})
