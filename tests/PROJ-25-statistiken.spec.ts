import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  closeAllActiveEvents,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  fillField,
  hasServiceClient,
  insertRatingDirect,
  login,
  serviceClient,
  whiskyIdsByPosition,
} from './helpers/auth'

/**
 * PROJ-25 · Erweiterte Ergebnis-Statistiken — E2E.
 * Formular-Felder (Alkohol/Alter/Preis), Rangliste (#, Dein Platz, Angaben),
 * Statistik-Karten, Balken-/Punktdiagramm, 360 px, Historie-Sieger bei 0-Punkten.
 * Die Rechenregeln prüft `src/lib/result-stats.test.ts`, die Freigabe erst nach
 * dem Abschluss `src/lib/supabase/__tests__/results-stats.integration.test.ts`.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA25-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
let a: { id: string; email: string } // Gastgeber, bewertet
let b: { id: string; email: string } // bewertet
let c: { id: string; email: string } // bewertet
let outsider: { id: string; email: string } // nicht dabei
let mainId = ''

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

async function setDetails(
  whiskyId: string,
  d: { abv?: number | null; age_years?: number | null; price_eur?: number | null },
) {
  const { error } = await serviceClient().from('whisky_details').update(d).eq('whisky_id', whiskyId)
  if (error) throw error
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
  a = await createDisposableUser(`a25${STAMP}`, { active: true })
  b = await createDisposableUser(`b25${STAMP}`, { active: true })
  c = await createDisposableUser(`c25${STAMP}`, { active: true })
  outsider = await createDisposableUser(`o25${STAMP}`, { active: true })

  // Haupt-Event: 3 Whiskies (#1 Ardbeg, #2 Talisker, #3 Glenfarclas), 3 Bewerter.
  mainId = await createEventDirect({
    hostId: a.id,
    createdBy: adminId,
    location: LOC('main'),
    eventDate: '2025-06-14',
  })
  // Halbe Punkte (8,5 / 9,5) sind nur in einem 0,5er-Tasting erlaubt (PROJ-19, TS021).
  await serviceClient().from('tasting_events').update({ rating_step: 0.5 }).eq('id', mainId)
  await addParticipant(mainId, b.id)
  await addParticipant(mainId, c.id)
  await addWhiskyAs(a.email, mainId, 'Ardbeg Uigeadail')
  await addWhiskyAs(b.email, mainId, 'Talisker 10')
  await addWhiskyAs(c.email, mainId, 'Glenfarclas 12')
  const [w1, w2, w3] = await whiskyIdsByPosition(mainId)
  await setDetails(w1, { abv: 54.2, age_years: null, price_eur: 65 })
  await setDetails(w2, { abv: 45.8, age_years: 10, price_eur: 35 })
  await setDetails(w3, { abv: null, age_years: 12, price_eur: null })

  // Ardbeg: einig hoch (Nase stark), Talisker: umstritten, Glenfarclas: mittel.
  const R = (whiskyId: string, profileId: string, nose: number, taste: number) =>
    insertRatingDirect({ whiskyId, eventId: mainId, profileId, nose, taste })
  await R(w1, a.id, 5, 9)
  await R(w1, b.id, 5, 9)
  await R(w1, c.id, 5, 8.5)
  await R(w2, a.id, 1, 2)
  await R(w2, b.id, 4, 10)
  await R(w2, c.id, 3, 6)
  await R(w3, a.id, 2, 9.5) // a: Glenfarclas 11,5 > Ardbeg 14? nein → Ardbeg Platz 1
  await R(w3, b.id, 3, 7)
  await R(w3, c.id, 2, 7)
  await closeEvent(mainId)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA25-${STAMP}-`)
  for (const u of [a, b, c, outsider]) if (u) await deleteUser(u.id)
})

async function openResults(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)
}

const ranking = (page: Page) => page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem')

// ===========================================================================
// Eintrage-Formular
// ===========================================================================
test('Formular: Alkohol/Alter/Preis eintragen (Komma), Bearbeiten zeigt sie vorausgefüllt', async ({
  page,
}) => {
  const evId = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC('form') })
  await login(page, a.email)
  await page.goto(`/tastings/${evId}/whiskies`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Meine Whiskys' }).waitFor()

  await page.getByRole('button', { name: 'Whisky hinzufügen' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await expect(dialog.getByText('Alkohol, Alter und Preis werden nach dem Abschluss')).toBeVisible()
  await fillField(page, 'Name', 'Springbank 15')
  await fillField(page, 'Alkohol (%)', '46,3')
  await fillField(page, 'Alter (J.)', '15')
  await fillField(page, 'Preis (€)', '109,90')
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })

  const { data } = await serviceClient()
    .from('whisky_details')
    .select('abv, age_years, price_eur')
    .eq('event_id', evId)
    .single()
  expect(Number(data!.abv)).toBe(46.3)
  expect(data!.age_years).toBe(15)
  expect(Number(data!.price_eur)).toBe(109.9)

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText('46,3 % · 15 J. · 109,90 €')).toBeVisible()
  await page.getByRole('button', { name: '„Springbank 15" bearbeiten' }).click()
  await expect(page.getByRole('dialog').getByLabel('Alkohol (%)')).toHaveValue('46,3')
  await expect(page.getByRole('dialog').getByLabel('Preis (€)')).toHaveValue('109,9')
})

test('Formular: ungültige Werte zeigen eine Meldung, nichts wird gespeichert', async ({ page }) => {
  const evId = await createEventDirect({ hostId: a.id, createdBy: adminId, location: LOC('invalid') })
  await login(page, a.email)
  await page.goto(`/tastings/${evId}/whiskies`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Meine Whiskys' }).waitFor()
  await page.getByRole('button', { name: 'Whisky hinzufügen' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await fillField(page, 'Name', 'Zu viel')
  await fillField(page, 'Alkohol (%)', '46,35')
  await fillField(page, 'Alter (J.)', '12,5')
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog.getByText('höchstens eine Nachkommastelle')).toBeVisible()
  await expect(dialog.getByText('Alter in ganzen Jahren')).toBeVisible()
  const { count } = await serviceClient()
    .from('whiskies')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', evId)
  expect(count).toBe(0)
})

// ===========================================================================
// Rangliste
// ===========================================================================
test('Rangliste: Ausschank-Nummer, „Dein Platz" und Angaben je Whisky', async ({ page }) => {
  await login(page, a.email)
  await openResults(page, mainId)

  const first = ranking(page).first()
  await expect(first).toContainText('#1')
  await expect(first).toContainText('Ardbeg Uigeadail')
  await expect(first).toContainText('54,2 % · 65 €')
  await expect(first).toContainText('Dein Platz: 1')
  // a: Ardbeg 14 > Glenfarclas 11,5 > Talisker 3
  await expect(ranking(page).filter({ hasText: 'Glenfarclas' })).toContainText('Dein Platz: 2')
  await expect(ranking(page).filter({ hasText: 'Talisker' })).toContainText('Dein Platz: 3')
  await expect(ranking(page).filter({ hasText: 'Talisker' })).toContainText('#2')
})

test('Nicht-Teilnehmer: kein „Dein Platz", keine Übereinstimmungs-Karte', async ({ page }) => {
  await login(page, outsider.email)
  await openResults(page, mainId)
  await expect(page.getByText('Dein Platz')).toHaveCount(0)
  await expect(page.getByText('Deine Übereinstimmung')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Statistiken' })).toBeVisible()
})

// ===========================================================================
// Statistik-Karten
// ===========================================================================
test('Karten: Preis-Leistung, Konsens, umstritten, Nase gegen Gaumen, Übereinstimmung', async ({
  page,
}) => {
  await login(page, a.email)
  await openResults(page, mainId)
  const stats = page.getByRole('region', { name: 'Statistiken' })

  // Preis-Leistung: Ardbeg 41,5/65 → 6,4; Talisker 26/35 → 7,4 → Talisker
  await expect(stats.getByText('Preis-Leistungs-Sieger')).toBeVisible()
  await expect(stats).toContainText('#2 Talisker 10')
  await expect(stats).toContainText('7,4 Punkte pro 10 €')
  await expect(stats.getByText('Konsens-Whisky')).toBeVisible()
  await expect(stats.getByText('Umstrittenster Whisky')).toBeVisible()
  await expect(stats.getByText('Deine Übereinstimmung')).toBeVisible()
  await expect(stats).toContainText('landete in der Runde auf Platz 1')
  // a ordnet genau wie die Runde: Ardbeg > Glenfarclas > Talisker
  await expect(stats).toContainText('Deine Reihenfolge stimmte genau mit der Runde überein.')
})

// ===========================================================================
// Diagramme
// ===========================================================================
test('Balkendiagramm: Umschalter, „keine Angabe" und „angenommen"', async ({ page }) => {
  await login(page, b.email)
  await openResults(page, mainId)
  const stats = page.getByRole('region', { name: 'Statistiken' })

  await expect(stats.getByRole('tab', { name: 'Platzierung' })).toHaveAttribute('data-state', 'active')
  await stats.getByRole('tab', { name: 'Alkohol (%)' }).click()
  await expect(stats.getByText('54,2 %')).toBeVisible()
  await expect(stats.getByText('keine Angabe')).toBeVisible()

  await stats.getByRole('tab', { name: 'Alter (Jahre)' }).click()
  await expect(stats.getByText('3 J. (angenommen)')).toBeVisible()
  await expect(stats.getByText('12 J.', { exact: true })).toBeVisible()
})

test('Punktdiagramm: Start Alter × Gesamtpunkte; Preis-Achse lässt Whisky ohne Angabe weg', async ({
  page,
}) => {
  await login(page, b.email)
  await openResults(page, mainId)

  await expect(page.getByLabel('Waagerecht')).toContainText('Alter (Jahre)')
  await expect(page.getByLabel('Senkrecht')).toContainText('Gesamtpunkte')
  await expect(page.getByText('Blasse Punkte: Alter nicht angegeben')).toBeVisible()

  await page.getByLabel('Waagerecht').click()
  await page.getByRole('option', { name: 'Preis (€)' }).click()
  await expect(page.getByText('1 Whisky ohne Angabe nicht dargestellt.')).toBeVisible()
})

test('360 px: Ergebnisseite mit Statistiken ohne horizontales Scrollen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await login(page, a.email)
  await openResults(page, mainId)
  await page.getByRole('heading', { name: 'Statistiken' }).scrollIntoViewIfNeeded()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('Dark Mode: Diagramme werden gerendert', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await login(page, a.email)
  await openResults(page, mainId)
  const stats = page.getByRole('region', { name: 'Statistiken' })
  await expect(stats.locator('.recharts-bar-rectangle').first()).toBeVisible()
  await expect(stats.locator('.recharts-scatter-symbol').first()).toBeVisible()
})

// ===========================================================================
// Historie (PROJ-19 BUG-2)
// ===========================================================================
test('Historie: nur 0-Punkte vergeben → Sieger wird trotzdem genannt', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: a.id,
    createdBy: adminId,
    location: LOC('zero'),
    eventDate: '2025-03-03',
  })
  await addWhiskyAs(a.email, evId, 'Null-Dram')
  const [w] = await whiskyIdsByPosition(evId)
  await insertRatingDirect({ whiskyId: w, eventId: evId, profileId: a.id, nose: 0, taste: 0 })
  await closeEvent(evId)

  await login(page, a.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  const row = page
    .getByRole('list', { name: 'Vergangene Tastings' })
    .getByRole('listitem')
    .filter({ hasText: LOC('zero') })
  await expect(row).toContainText('Null-Dram')
  await expect(row).not.toContainText('kein Sieger')
})
