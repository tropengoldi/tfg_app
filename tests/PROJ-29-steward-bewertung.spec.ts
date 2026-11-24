import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  hasServiceClient,
  login,
  serviceClient,
  startEventDirect,
} from './helpers/auth'

/**
 * PROJ-29 · Steward-Bewertung durch Teilnehmer — E2E.
 * Karte in der Bewertungsansicht (setzen, wiederöffnen, ändern, zurückziehen,
 * 0-Rückfrage, Kommentar-Limit, Hinweis beim letzten Whisky), Sichtbarkeit nach
 * Rolle/Status, Abschnitt auf der Ergebnisseite, Bilanz + Schalter, 360 px.
 * DB-Regeln (Geheimhaltung, TS028, Testkonten) prüft `steward-scores.integration.test.ts`.
 *
 * Achtung: schaltet Tastings auf „läuft". Bricht ab, wenn ein fremdes Tasting läuft
 * (nie einen echten Abend beenden). Mit `--workers=1` ausführen, damit sich die
 * Browser-Projekte nicht gegenseitig das laufende Tasting schliessen.
 */

const STAMP = `${Date.now()}p${process.pid}`
const PREFIX = `QA29-${STAMP}-`
const LOC = (tag: string) => `${PREFIX}${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

type U = { id: string; email: string }
let adminId = ''
let a: U // Gastgeber, verkostet mit
let b: U // Teilnehmer
let steward: U
let liveId = ''
let draftId = ''
let mainId = '' // abgeschlossen, zwei Noten
let noScoresId = '' // abgeschlossen, Steward, keine Note

const nameOf = (tag: string) => `QA ${tag}${STAMP}`

async function assertNoForeignActive() {
  const { data } = await serviceClient().from('tasting_events').select('id, location').eq('status', 'active')
  const foreign = (data ?? []).filter((e) => !String(e.location).startsWith(PREFIX))
  if (foreign.length > 0) {
    throw new Error(`Abbruch: fremdes Tasting läuft (${foreign.map((e) => e.location).join(', ')}).`)
  }
}

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

/** Event mit Steward (optional), Teilnehmer a (Gastgeber) + b, zwei Whiskies. */
async function stewardEvent(tag: string, withSteward = true, eventDate = '2025-06-01') {
  const id = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC(tag), eventDate })
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({ helper_id: withSteward ? steward.id : null, rating_step: 0.5 })
    .eq('id', id)
  if (error) throw error
  await addParticipant(id, b.id)
  await addWhiskyAs(a.email, id, `Lagavulin ${tag}`)
  await addWhiskyAs(b.email, id, `Oban ${tag}`)
  return id
}

async function scoreDirect(eventId: string, profileId: string, score: number, comment: string | null) {
  const { error } = await serviceClient()
    .from('steward_scores')
    .upsert({ event_id: eventId, profile_id: profileId, score, comment })
  if (error) throw error
}

async function openRating(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
}

const card = (page: Page) => page.getByRole('button', { name: /Den Steward bewerten/ })
const plus = (page: Page) => page.getByRole('button', { name: /^Note für .* erhöhen$/ })

test.beforeAll(async () => {
  if (!hasServiceClient) return
  await assertNoForeignActive()
  const { data } = await serviceClient().from('profiles').select('id').eq('role', 'admin').limit(1).single()
  adminId = data!.id
  a = await createDisposableUser(`a${STAMP}`)
  b = await createDisposableUser(`b${STAMP}`)
  steward = await createDisposableUser(`s${STAMP}`)

  mainId = await stewardEvent('main', true, '2025-06-01')
  await scoreDirect(mainId, a.id, 7, null)
  await scoreDirect(mainId, b.id, 9.5, 'Perfekt ausgeschenkt')
  await closeEvent(mainId)

  noScoresId = await stewardEvent('noscores', true, '2025-05-01')
  await closeEvent(noScoresId)

  draftId = await stewardEvent('draft')

  liveId = await stewardEvent('live')
  await startEventDirect(liveId, 1)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(PREFIX)
  for (const u of [a, b, steward]) if (u) await deleteUser(u.id)
})

// ===========================================================================
test('Entwurf: keine Steward-Karte', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, draftId)
  await expect(page.getByText('Der Abend hat noch nicht begonnen.')).toBeVisible()
  await expect(card(page)).toHaveCount(0)
})

test('laufend mit Steward: Karte mit Name, zugeklappt, Hinweis beim Aufklappen', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await expect(card(page)).toBeVisible()
  await expect(card(page)).toContainText(nameOf('s'))
  await expect(card(page)).toContainText('Noch nicht bewertet')
  await expect(page.getByLabel('Kommentar (optional)')).toHaveCount(0)

  await card(page).click()
  await expect(page.getByText(/mit deinem Namen für alle sichtbar/)).toBeVisible()
  await expect(page.getByText(new RegExp(`auch nicht ${nameOf('s')}`))).toBeVisible()
  await expect(page.getByRole('slider', { name: /^Note für/ })).toBeVisible()
})

test('0 Punkte: Rückfrage, „Zurück" speichert nicht', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await card(page).click()
  await page.getByRole('button', { name: 'Note speichern' }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toContainText('0 Punkte vergeben?')
  await dialog.getByRole('button', { name: 'Zurück' }).click()
  await expect(dialog).toBeHidden()
  await expect(card(page)).toContainText('Noch nicht bewertet')
})

test('Kommentar über 500 Zeichen: Zähler rot, Speichern gesperrt', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await card(page).click()
  await plus(page).click()
  await page.getByLabel('Kommentar (optional)').fill('x'.repeat(501))
  await expect(page.getByText('501/500')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Note speichern' })).toBeDisabled()
})

test('Note + Kommentar speichern, nach Neuladen sichtbar, ändern, zurückziehen', async ({ page }) => {
  await login(page, b.email)
  await openRating(page, liveId)
  await card(page).click()
  for (let i = 0; i < 17; i++) await plus(page).click() // 0,5er-Schritte → 8,5
  await page.getByLabel('Kommentar (optional)').fill('Ruhig und souverän')
  await page.getByRole('button', { name: 'Note speichern' }).click()
  await expect(card(page)).toContainText('Deine Note: 8,5', { timeout: 15_000 })

  // Wiederöffnen: gespeicherter Stand.
  await openRating(page, liveId)
  await expect(card(page)).toContainText('Deine Note: 8,5')
  await card(page).click()
  await expect(page.getByLabel('Kommentar (optional)')).toHaveValue('Ruhig und souverän')
  await expect(page.getByRole('button', { name: 'Note ändern' })).toBeDisabled()

  // Ändern.
  await plus(page).click()
  await page.getByRole('button', { name: 'Note ändern' }).click()
  await expect(card(page)).toContainText('Deine Note: 9', { timeout: 15_000 })
  const { data } = await serviceClient()
    .from('steward_scores')
    .select('score, comment')
    .eq('event_id', liveId)
    .eq('profile_id', b.id)
    .single()
  expect(Number(data!.score)).toBe(9)
  expect(data!.comment).toBe('Ruhig und souverän')

  // Zurückziehen mit Rückfrage.
  await page.getByRole('button', { name: 'Bewertung zurückziehen' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Zurückziehen' }).click()
  await expect(card(page)).toContainText('Noch nicht bewertet', { timeout: 15_000 })
  const { data: gone } = await serviceClient()
    .from('steward_scores')
    .select('score')
    .eq('event_id', liveId)
    .eq('profile_id', b.id)
  expect(gone ?? []).toHaveLength(0)
})

test('auch der Gastgeber (verkostet mit) bewertet', async ({ page }) => {
  await login(page, a.email)
  await openRating(page, liveId)
  await card(page).click()
  for (let i = 0; i < 14; i++) await plus(page).click()
  await page.getByRole('button', { name: 'Note speichern' }).click()
  await expect(card(page)).toContainText('Deine Note: 7', { timeout: 15_000 })
})

test('Steward: keine Bewertungsseite, Live-Einblick ohne Steward-Noten', async ({ page }) => {
  await scoreDirect(liveId, b.id, 10, 'Geheimer Kommentar QA29')
  await login(page, steward.email)
  await page.goto(`/tastings/${liveId}/bewerten`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
  await page.goto(`/tastings/${liveId}/gastgeber`, { waitUntil: 'networkidle' })
  await expect(page.getByText('Geheimer Kommentar QA29')).toHaveCount(0)
  await expect(page.getByText(/Den Steward bewerten/)).toHaveCount(0)
})

test('letzter Whisky im Glas: „Noch nicht bewertet" als Hinweis hervorgehoben', async ({ page }) => {
  await serviceClient().from('steward_scores').delete().eq('event_id', liveId).eq('profile_id', b.id)
  await serviceClient().from('tasting_events').update({ current_position: 2 }).eq('id', liveId)
  await login(page, b.email)
  await openRating(page, liveId)
  const hint = card(page).getByText('Noch nicht bewertet')
  await expect(hint).toBeVisible()
  await expect(hint).toHaveClass(/text-gold/)
})

test('360 px: Bewertungsseite mit Steward-Karte ohne horizontales Scrollen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await login(page, b.email)
  await openRating(page, liveId)
  await card(page).click()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('nach dem Abschluss: Karte weg', async ({ page }) => {
  await closeEvent(liveId)
  await login(page, b.email)
  await openRating(page, liveId)
  await expect(page.getByText(/Der Abend ist abgeschlossen/)).toBeVisible()
  await expect(card(page)).toHaveCount(0)
})

test('Ergebnisseite: Schnitt, Stimmen, Noten mit Namen und Kommentar, nach Note sortiert', async ({ page }) => {
  await login(page, a.email)
  await page.goto(`/tastings/${mainId}/ergebnisse`, { waitUntil: 'networkidle' })
  const section = page.getByRole('region', { name: 'Whisky-Steward' })
  await expect(section).toContainText(nameOf('s'))
  await expect(section).toContainText('8,3 von 10 · 2 Stimmen')
  const items = section.getByRole('listitem')
  await expect(items).toHaveCount(2)
  await expect(items.nth(0)).toContainText(nameOf('b'))
  await expect(items.nth(0)).toContainText('9,5')
  await expect(items.nth(0)).toContainText('Perfekt ausgeschenkt')
  await expect(items.nth(1)).toContainText(nameOf('a'))
  await expect(items.nth(1)).toContainText('7')
})

test('Ergebnisseite ohne Steward-Note: kein Abschnitt', async ({ page }) => {
  await login(page, a.email)
  await page.goto(`/tastings/${noScoresId}/ergebnisse`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Ergebnisse' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Whisky-Steward' })).toHaveCount(0)
})

test('Bilanz: „Als Whisky-Steward" im fremden Profil; Schalter aus → verborgen, Besitzer sieht es weiter', async ({
  page,
}) => {
  // Steward-Abende: main, noscores, live (jetzt abgeschlossen) = 3; Noten: 7, 9,5, 7 (live: a) → Ø 7,8
  await login(page, a.email)
  await page.goto(`/profil/${steward.id}`, { waitUntil: 'networkidle' })
  await expect(page.getByText('Als Whisky-Steward')).toBeVisible()
  await expect(page.getByText('Ø 7,8')).toBeVisible()
  await expect(page.getByText('3 Abende')).toBeVisible()

  // Steward schaltet die Steward-Bilanz aus.
  await page.context().clearCookies()
  await login(page, steward.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  const toggle = page.getByRole('switch', { name: 'Steward-Bilanz' })
  await expect(toggle).toBeChecked()
  await toggle.click()
  await expect(toggle).not.toBeChecked()
  await expect.poll(async () => {
    const { data } = await serviceClient().from('profiles').select('show_steward_balance').eq('id', steward.id).single()
    return data?.show_steward_balance
  }).toBe(false)
  // Besitzer sieht die eigene Kennzahl weiterhin.
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText('Als Whisky-Steward')).toBeVisible()

  await page.context().clearCookies()
  await login(page, a.email)
  await page.goto(`/profil/${steward.id}`, { waitUntil: 'networkidle' })
  await expect(page.getByText('Als Whisky-Steward')).toHaveCount(0)
  // Ergebnisseite bleibt unberührt.
  await page.goto(`/tastings/${mainId}/ergebnisse`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('region', { name: 'Whisky-Steward' })).toBeVisible()
})

test('Tasting ohne Steward: keine Karte', async ({ page }) => {
  await assertNoForeignActive()
  const id = await stewardEvent('nosteward', false)
  await startEventDirect(id, 1)
  try {
    await login(page, b.email)
    await openRating(page, id)
    await expect(page.getByText(/Whisky 1 von 2/)).toBeVisible()
    await expect(card(page)).toHaveCount(0)
  } finally {
    await closeEvent(id)
  }
})
