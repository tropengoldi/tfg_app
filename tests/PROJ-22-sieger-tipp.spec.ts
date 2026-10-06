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
 * PROJ-22 · Sieger-Tipp & „Kenner der Woche" — E2E.
 * Tipp-Feld (Bewertungsansicht), Dashboard-Hinweis, Kenner + „Alle Tipps" auf der
 * Ergebnisseite, Bilanz-Zähler + Sichtbarkeits-Schalter, Steward ohne Tipp, 360 px.
 * Blindheit und Schreibregeln prüft `winner-tips.integration.test.ts`, die
 * Hinweis-Logik `src/lib/winner-tips.test.ts`.
 *
 * Achtung: legt aktive Events an und schliesst dabei jedes andere aktive Event
 * (one-active-event-Regel) — nicht während eines echten Tastings laufen lassen,
 * und mit `--workers=1`, damit sich die Browser-Projekte nicht gegenseitig schliessen.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA22-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

type U = { id: string; email: string }
let adminId = ''
let a: U // Gastgeber, tippt richtig
let b: U // tippt falsch
let c: U // tippt richtig
let d: U // dabei, tippt nicht
let steward: U
let liveId = '' // läuft: 3 Whiskies, Position 1
let mainId = '' // abgeschlossen: Tipps a✓ b✗ c✓, d ohne Tipp
let noKennerId = '' // abgeschlossen: Tipps, keiner richtig
let noTipsId = '' // abgeschlossen: keine Tipps
let noRatingsId = '' // abgeschlossen: Tipps, aber keine Bewertung

const nameOf = (tag: string) => `QA ${tag}${STAMP}`

async function closeEvent(eventId: string) {
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({
      status: 'closed',
      started_at: new Date(Date.now() - 3_600_000).toISOString(),
      closed_at: new Date().toISOString(),
    })
    .eq('id', eventId)
  if (error) throw error
}

async function tipDirect(eventId: string, profileId: string, whiskyId: string) {
  const { error } = await serviceClient()
    .from('winner_tips')
    .upsert({ event_id: eventId, profile_id: profileId, whisky_id: whiskyId })
  if (error) throw error
}

/** Event mit drei Whiskies (#1 von a, #2 von b, #3 von c), Teilnehmer a–d. */
async function threeWhiskyEvent(tag: string, eventDate = '2025-05-10'): Promise<[string, string[]]> {
  const id = await createEventDirect({
    hostId: a.id,
    createdBy: adminId,
    location: LOC(tag),
    eventDate,
  })
  for (const u of [b, c, d]) await addParticipant(id, u.id)
  await addWhiskyAs(a.email, id, `Ardbeg ${tag}`)
  await addWhiskyAs(b.email, id, `Talisker ${tag}`)
  await addWhiskyAs(c.email, id, `Glenfarclas ${tag}`)
  return [id, await whiskyIdsByPosition(id)]
}

/** #1 gewinnt klar vor #2 und #3. */
async function rateWinnerFirst(eventId: string, w: string[]) {
  for (const u of [a, b, c]) {
    await insertRatingDirect({ whiskyId: w[0], eventId, profileId: u.id, nose: 5, taste: 9 })
    await insertRatingDirect({ whiskyId: w[1], eventId, profileId: u.id, nose: 3, taste: 6 })
    await insertRatingDirect({ whiskyId: w[2], eventId, profileId: u.id, nose: 2, taste: 4 })
  }
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  a = await createDisposableUser(`a${STAMP}`)
  b = await createDisposableUser(`b${STAMP}`)
  c = await createDisposableUser(`c${STAMP}`)
  d = await createDisposableUser(`d${STAMP}`)
  steward = await createDisposableUser(`s${STAMP}`)

  // Abgeschlossenes Haupt-Event mit Kennern.
  let w: string[]
  ;[mainId, w] = await threeWhiskyEvent('main', '2025-05-10')
  await rateWinnerFirst(mainId, w)
  await tipDirect(mainId, a.id, w[0])
  await tipDirect(mainId, b.id, w[1])
  await tipDirect(mainId, c.id, w[0])
  await closeEvent(mainId)

  // Tipps, aber keiner richtig.
  ;[noKennerId, w] = await threeWhiskyEvent('nokenner', '2025-04-10')
  await rateWinnerFirst(noKennerId, w)
  await tipDirect(noKennerId, a.id, w[2])
  await tipDirect(noKennerId, b.id, w[1])
  await closeEvent(noKennerId)

  // Keine Tipps (wie ein Tasting vor PROJ-22).
  ;[noTipsId, w] = await threeWhiskyEvent('notips', '2025-03-10')
  await rateWinnerFirst(noTipsId, w)
  await closeEvent(noTipsId)

  // Tipps, aber niemand hat bewertet.
  ;[noRatingsId, w] = await threeWhiskyEvent('noratings', '2025-02-10')
  await tipDirect(noRatingsId, a.id, w[0])
  await closeEvent(noRatingsId)

  // Laufendes Event mit Steward — zuletzt, damit es das aktive bleibt.
  ;[liveId] = await threeWhiskyEvent('live', '2026-10-06')
  await serviceClient().from('tasting_events').update({ helper_id: steward.id }).eq('id', liveId)
  await startEventDirect(liveId, 1)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA22-${STAMP}-`)
  for (const u of [a, b, c, d, steward]) if (u) await deleteUser(u.id)
})

async function openRating(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
}

async function openResults(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Rangliste' }).waitFor()
}

const tipTrigger = (page: Page) => page.getByRole('combobox', { name: 'Dein Sieger-Tipp' })

async function chooseTip(page: Page, n: number) {
  await tipTrigger(page).click()
  await page.getByRole('option', { name: `Whisky ${n}`, exact: true }).click()
}

async function storedTipPosition(eventId: string, profileId: string): Promise<number | null> {
  const { data } = await serviceClient()
    .from('winner_tips')
    .select('whisky_id')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
  if (!data || data.length === 0) return null
  expect(data).toHaveLength(1)
  const ids = await whiskyIdsByPosition(eventId)
  return ids.indexOf(data[0].whisky_id) + 1
}

/** Der <dd>-Wert neben einem <dt> mit genau diesem Text. */
const statValue = (page: Page, label: string) =>
  page.locator('dt', { hasText: new RegExp(`^${label}$`) }).locator('xpath=following-sibling::dd[1]')

// ===========================================================================
// Dashboard (vor dem ersten Tipp)
// ===========================================================================
test('Dashboard: ohne Tipp „Noch kein Sieger-Tipp abgegeben" mit Absprung zur Bewertung', async ({
  page,
}) => {
  await login(page, b.email)
  await expect(page.getByText('Noch kein Sieger-Tipp abgegeben')).toBeVisible()
  await page.getByRole('link', { name: 'Jetzt tippen' }).click()
  await page.waitForURL(`**/tastings/${liveId}/bewerten`)
  await expect(tipTrigger(page)).toBeVisible()
})

// ===========================================================================
// Tippen
// ===========================================================================
test('Tipp-Feld zeigt Whisky 1 … N inkl. nicht ausgeschenkter, ist ≥ 44 px hoch', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  const trigger = tipTrigger(page)
  await expect(trigger).toHaveText(/Whisky wählen/)
  const box = await trigger.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)

  await trigger.click()
  const options = page.getByRole('option')
  await expect(options).toHaveText(['Whisky 1', 'Whisky 2', 'Whisky 3'])
  await page.keyboard.press('Escape')
})

test('Tipp wird sofort gespeichert, ersetzt den alten und ist nach Neuladen vorausgewählt', async ({
  page,
}) => {
  await login(page, b.email)
  await openRating(page, liveId)

  // Whisky 3 ist noch nicht ausgeschenkt (Position 1) — trotzdem tippbar.
  await chooseTip(page, 3)
  await expect(page.getByText('Tipp gespeichert: Whisky 3')).toBeVisible()
  await expect.poll(() => storedTipPosition(liveId, b.id)).toBe(3)

  // Eigener Whisky (#2 von b) ist erlaubt; ersetzt den Tipp.
  await chooseTip(page, 2)
  await expect(page.getByText('Tipp gespeichert: Whisky 2')).toBeVisible()
  await expect.poll(() => storedTipPosition(liveId, b.id)).toBe(2)

  await page.reload({ waitUntil: 'networkidle' })
  await expect(tipTrigger(page)).toHaveText(/Whisky 2/)
})

test('Gespeicherter Tipp ist auf einem anderen Gerät vorausgewählt; Dashboard zeigt ihn', async ({
  browser,
}) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await login(page, b.email)
  await expect(page.getByText('Dein Tipp:')).toContainText('Whisky 2')
  await expect(page.getByText('Noch kein Sieger-Tipp abgegeben')).toHaveCount(0)
  await openRating(page, liveId)
  await expect(tipTrigger(page)).toHaveText(/Whisky 2/)
  await ctx.close()
})

test('Tipp ändern verwirft keine ungespeicherte Bewertung', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  const notes = page.getByLabel('Notiz für dich (optional)')
  await notes.fill('Torf, Jod, Seetang')
  await chooseTip(page, 3)
  await expect(page.getByText('Tipp gespeichert: Whisky 3')).toBeVisible()
  await page.waitForLoadState('networkidle')
  await expect(notes).toHaveValue('Torf, Jod, Seetang')
  await expect(page.getByText('Noch nicht gespeichert.')).toBeVisible()
  // Zurück auf Whisky 2, damit die folgenden Tests ihren Stand haben.
  await chooseTip(page, 2)
  await expect(page.getByText('Tipp gespeichert: Whisky 2')).toBeVisible()
})

test('Gastgeber verkostet mit und darf tippen', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await chooseTip(page, 1)
  await expect(page.getByText('Tipp gespeichert: Whisky 1')).toBeVisible()
  await expect.poll(() => storedTipPosition(liveId, a.id)).toBe(1)
})

// BUG-1 (PROJ-22 QA, behoben): früher ersetzte die Fehlergrenze die ganze Ansicht.
test('Speichern schlägt fehl → Fehlermeldung, Auswahl springt auf den gespeicherten Tipp zurück', async ({
  page,
}) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await expect(tipTrigger(page)).toHaveText(/Whisky 2/)

  // Server-Actions laufen als POST auf die Seiten-URL → Netzwerkfehler simulieren.
  await page.route(`**/tastings/${liveId}/bewerten`, (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  await chooseTip(page, 1)
  await expect(page.getByText('Verbindung fehlgeschlagen — Tipp nicht gespeichert.')).toBeVisible()
  await expect(tipTrigger(page)).toHaveText(/Whisky 2/)
  await expect(page.getByRole('heading', { name: 'Bewerten' })).toBeVisible()
  await page.unroute(`**/tastings/${liveId}/bewerten`)
  expect(await storedTipPosition(liveId, b.id)).toBe(2)
})

test('Bewertung speichern schlägt fehl → Fehlermeldung, Eingaben bleiben stehen', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  const notes = page.getByLabel('Notiz für dich (optional)')
  await notes.fill('Vanille, Honig')

  await page.route(`**/tastings/${liveId}/bewerten`, (route) =>
    route.request().method() === 'POST' ? route.abort('failed') : route.continue(),
  )
  await page.getByRole('button', { name: 'Speichern' }).click()
  // 0/0 → Rückfrage (PROJ-19) bestätigen.
  await page.getByRole('button', { name: 'Ja, speichern' }).click()
  await expect(
    page.getByText('Verbindung fehlgeschlagen — Bewertung nicht gespeichert.'),
  ).toBeVisible()
  await expect(notes).toHaveValue('Vanille, Honig')
  await expect(page.getByText('Noch nicht gespeichert.')).toBeVisible()
  await page.unroute(`**/tastings/${liveId}/bewerten`)
})

// ===========================================================================
// Whisky-Steward
// ===========================================================================
test('Whisky-Steward: kein Tipp-Feld, kein Dashboard-Hinweis', async ({ page }) => {
  await login(page, steward.email)
  await expect(page.getByRole('link', { name: 'Steuern' })).toBeVisible()
  await expect(page.getByText('Noch kein Sieger-Tipp abgegeben')).toHaveCount(0)
  await expect(page.getByText('Dein Tipp:')).toHaveCount(0)

  await page.goto(`/tastings/${liveId}/bewerten`, { waitUntil: 'networkidle' })
  await expect(tipTrigger(page)).toHaveCount(0)
})

// ===========================================================================
// Entwurf / abgeschlossen
// ===========================================================================
test('Tasting in Vorbereitung: kein Tipp-Feld', async ({ page }) => {
  const draftId = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC('draft') })
  await login(page, a.email)
  await openRating(page, draftId)
  await expect(page.getByText('Der Abend hat noch nicht begonnen.')).toBeVisible()
  await expect(tipTrigger(page)).toHaveCount(0)
})

test('Abgeschlossen: eigener Tipp sichtbar, Feld gesperrt', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, mainId)
  await expect(page.getByText('Der Abend ist abgeschlossen — Bewertungen sind eingefroren.')).toBeVisible()
  await expect(tipTrigger(page)).toHaveText(/Whisky 2/)
  await expect(tipTrigger(page)).toBeDisabled()
})

// ===========================================================================
// Ergebnisseite
// ===========================================================================
test('Ergebnis: Sieger-Zeile nennt die Kenner alphabetisch, verlinkt auf die Profile', async ({
  page,
}) => {
  await login(page, d.email)
  await openResults(page, mainId)
  const winner = page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem').first()
  await expect(winner).toContainText(`Kenner der Woche: ${nameOf('a')}, ${nameOf('c')}`)
  // a hat den Sieger auch mitgebracht → nur in der Kenner-Zeile suchen.
  const kennerLine = winner.locator('p', { hasText: 'Kenner der Woche:' })
  await expect(kennerLine.getByRole('link', { name: nameOf('a') })).toHaveAttribute(
    'href',
    `/profil/${a.id}`,
  )
  await expect(kennerLine.getByRole('link', { name: nameOf('c') })).toHaveAttribute(
    'href',
    `/profil/${c.id}`,
  )
})

test('Ergebnis: „Alle Tipps" aufklappbar, eine Zeile je Tipp, richtige hervorgehoben, Nicht-Tipper fehlen', async ({
  page,
}) => {
  await login(page, d.email)
  await openResults(page, mainId)
  const trigger = page.getByRole('button', { name: 'Alle Tipps (3)' })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const section = page.locator('section', { has: page.getByRole('heading', { name: 'Sieger-Tipps' }) })
  const rows = section.getByRole('listitem')
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0)).toHaveText(`${nameOf('a')} → #1 Ardbeg main (Platz 1)`)
  await expect(rows.nth(1)).toHaveText(`${nameOf('b')} → #2 Talisker main (Platz 2)`)
  await expect(rows.nth(2)).toHaveText(`${nameOf('c')} → #1 Ardbeg main (Platz 1)`)
  await expect(rows.nth(0).getByLabel('richtig getippt')).toBeVisible()
  await expect(rows.nth(1).getByLabel('richtig getippt')).toHaveCount(0)
  await expect(section).not.toContainText(nameOf('d'))
})

test('Ergebnis: Tipps, aber keiner richtig → „Diesmal kein Kenner"', async ({ page }) => {
  await login(page, d.email)
  await openResults(page, noKennerId)
  await expect(page.getByText('Diesmal kein Kenner')).toBeVisible()
  await expect(page.getByText('Kenner der Woche:')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Alle Tipps (2)' })).toBeVisible()
})

test('Ergebnis: ohne Tipps weder Kenner-Hinweis noch „Alle Tipps"', async ({ page }) => {
  await login(page, d.email)
  await openResults(page, noTipsId)
  await expect(page.getByText(/Kenner/)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Sieger-Tipps' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Alle Tipps/ })).toHaveCount(0)
})

test('Ergebnis: Tipps, aber keine Bewertung → „Kein Sieger — keine Kenner"', async ({ page }) => {
  await login(page, d.email)
  await openResults(page, noRatingsId)
  await expect(page.getByText('Kein Sieger — keine Kenner.')).toBeVisible()
  await expect(page.getByText('Kenner der Woche:')).toHaveCount(0)
})

// ===========================================================================
// Bilanz & Sichtbarkeit
// ===========================================================================
test('Bilanz: „Kenner der Woche" als n× (1× bzw. 0×)', async ({ page }) => {
  await login(page, a.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Kenner der Woche')).toHaveText('1×')

  await page.context().clearCookies()
  await login(page, b.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Kenner der Woche')).toHaveText('0×')
})

test('Sichtbarkeit: Schalter „Kenner der Woche" (Default an) blendet den Zähler nur für andere aus', async ({
  page,
}) => {
  // Fremde Ansicht vorher: sichtbar.
  await login(page, b.email)
  await page.goto(`/profil/${a.id}`, { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Kenner der Woche')).toHaveText('1×')

  await page.context().clearCookies()
  await login(page, a.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  const sw = page.getByRole('switch', { name: 'Kenner der Woche', exact: true })
  await expect(sw).toBeChecked()
  await sw.click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
  await expect(sw).not.toBeChecked()
  // Eigene Ansicht zeigt ihn weiterhin.
  await page.reload({ waitUntil: 'networkidle' })
  await expect(statValue(page, 'Kenner der Woche')).toHaveText('1×')

  await page.context().clearCookies()
  await login(page, b.email)
  await page.goto(`/profil/${a.id}`, { waitUntil: 'networkidle' })
  await expect(page.getByText(nameOf('a')).first()).toBeVisible()
  await expect(page.getByText('Kenner der Woche')).toHaveCount(0)
})

// ===========================================================================
// Mobil
// ===========================================================================
test('360 px: Tipp-Feld, Dashboard-Hinweis und „Alle Tipps" ohne horizontales Scrollen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

  await login(page, c.email)
  await expect(page.getByText('Noch kein Sieger-Tipp abgegeben')).toBeVisible()
  expect(await overflow()).toBeLessThanOrEqual(0)

  await openRating(page, liveId)
  const box = await tipTrigger(page).boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  expect(box!.x + box!.width).toBeLessThanOrEqual(360)
  expect(await overflow()).toBeLessThanOrEqual(0)

  await openResults(page, mainId)
  await page.getByRole('button', { name: 'Alle Tipps (3)' }).click()
  expect(await overflow()).toBeLessThanOrEqual(0)
})
