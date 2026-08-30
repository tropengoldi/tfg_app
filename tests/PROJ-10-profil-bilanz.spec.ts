import { expect, test, type Page } from '@playwright/test'

import {
  addWhiskyAs,
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

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA10-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
/** „Reiches" Mitglied mit Historie. */
let veteran: { id: string; email: string }
/** Frisches Mitglied ohne jede Historie. */
let rookie: { id: string; email: string }

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

async function openProfil(page: Page) {
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()
  await page.waitForTimeout(400)
}

async function readProfile(id: string) {
  const { data } = await serviceClient()
    .from('profiles')
    .select('display_name, favorite_dram, favorite_region, bio')
    .eq('id', id)
    .single()
  return data!
}

/** Der <dd>-Wert neben einem <dt> in der Bilanz-Karte. */
function stat(page: Page, label: string) {
  return page
    .locator('dt', { hasText: label })
    .locator('xpath=following-sibling::dd[1]')
    .first()
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

  veteran = await createDisposableUser(`r10v${STAMP}`, { active: true })
  rookie = await createDisposableUser(`r10r${STAMP}`, { active: true })

  // #1 „gut": Ardbeg (Rang 1, bewertet) + Filler (Rang 2, bewertet).
  const ev1 = await createEventDirect({
    hostId: veteran.id, createdBy: adminId, location: LOC('gut'),
    eventDate: '2025-06-14', maxWhiskies: 5,
  })
  await addWhiskyAs(veteran.email, ev1, 'Ardbeg Uigeadail')
  await addWhiskyAs(veteran.email, ev1, 'Filler A')
  const w1 = await whiskyIdsByPosition(ev1)
  await insertRatingDirect({ whiskyId: w1[0], eventId: ev1, profileId: veteran.id, nose: 5, taste: 9 })
  await insertRatingDirect({ whiskyId: w1[1], eventId: ev1, profileId: veteran.id, nose: 2, taste: 4 })
  await closeEvent(ev1)

  // #2 „leer": Talisker steht auf Rang 1, aber NIEMAND bewertet →
  // darf die beste Platzierung NICHT stellen.
  const ev2 = await createEventDirect({
    hostId: veteran.id, createdBy: adminId, location: LOC('leer'),
    eventDate: '2025-09-01', maxWhiskies: 5,
  })
  await addWhiskyAs(veteran.email, ev2, 'Talisker 10')
  await closeEvent(ev2)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA10-${STAMP}-`)
  if (veteran) await deleteUser(veteran.id)
  if (rookie) await deleteUser(rookie.id)
})

// ===========================================================================
// Stammdaten bearbeiten
// ===========================================================================
test('Formular ist mit den gespeicherten Werten vorbefüllt; E-Mail und Rolle sind Anzeige', async ({
  page,
}) => {
  await serviceClient()
    .from('profiles')
    .update({ favorite_dram: 'Lagavulin 16', favorite_region: 'Islay', bio: 'Torfkopf.' })
    .eq('id', rookie.id)

  await login(page, rookie.email)
  await openProfil(page)

  await expect(page.getByLabel('Anzeigename')).toHaveValue(/QA r10r/)
  await expect(page.getByLabel('Lieblings-Dram (optional)')).toHaveValue('Lagavulin 16')
  await expect(page.getByLabel('Lieblingsregion (optional)')).toHaveValue('Islay')
  await expect(page.getByLabel('Kurzbeschreibung (optional)')).toHaveValue('Torfkopf.')
  await expect(page.getByText(rookie.email)).toBeVisible()
  await expect(page.getByText('Teilnehmer', { exact: true })).toBeVisible()

  await serviceClient()
    .from('profiles')
    .update({ favorite_dram: null, favorite_region: null, bio: null })
    .eq('id', rookie.id)
})

test('Werte ändern und speichern → Bestätigung, DB aktualisiert', async ({ page }) => {
  await login(page, rookie.email)
  await openProfil(page)

  await fillField(page, 'Anzeigename', 'Rookie Neu')
  await fillField(page, 'Lieblings-Dram (optional)', 'Springbank 10')
  await page.getByRole('button', { name: 'Speichern' }).click()

  await expect(page.getByText('Profil gespeichert.')).toBeVisible({ timeout: 15_000 })
  const p = await readProfile(rookie.id)
  expect(p.display_name).toBe('Rookie Neu')
  expect(p.favorite_dram).toBe('Springbank 10')
})

test('Leerer / nur-Leerzeichen-Anzeigename → Pflichtfehler, nichts wird gespeichert', async ({
  page,
}) => {
  await serviceClient().from('profiles').update({ display_name: 'Behalten' }).eq('id', rookie.id)

  await login(page, rookie.email)
  await openProfil(page)

  await fillField(page, 'Anzeigename', '   ')
  await page.getByRole('button', { name: 'Speichern' }).click()

  await expect(page.getByText('Anzeigename ist erforderlich')).toBeVisible()
  expect((await readProfile(rookie.id)).display_name).toBe('Behalten')
})

test('Optionales Feld leeren → wird als „nicht gesetzt“ (NULL) gespeichert', async ({ page }) => {
  await serviceClient()
    .from('profiles')
    .update({ display_name: 'Rookie', favorite_dram: 'Wird geleert' })
    .eq('id', rookie.id)

  await login(page, rookie.email)
  await openProfil(page)

  await fillField(page, 'Lieblings-Dram (optional)', '')
  await page.getByRole('button', { name: 'Speichern' }).click()

  await expect(page.getByText('Profil gespeichert.')).toBeVisible({ timeout: 15_000 })
  expect((await readProfile(rookie.id)).favorite_dram).toBeNull()
})

test('Anzeigename wirkt rückwirkend: neuer Name in einem abgeschlossenen Tasting', async ({ page }) => {
  const { data: ev } = await serviceClient()
    .from('tasting_events')
    .select('id')
    .eq('location', LOC('gut'))
    .single()

  await serviceClient()
    .from('profiles')
    .update({ display_name: 'Der Torfmeister' })
    .eq('id', veteran.id)

  await login(page, veteran.email)
  await page.goto(`/tastings/${ev!.id}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(
    page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem').first(),
  ).toContainText('mitgebracht von Der Torfmeister')
})

// ===========================================================================
// Persönliche Bilanz
// ===========================================================================
test('Frisches Mitglied: Nullwerte, „noch keine Platzierung“, „—“ und der Hinweis', async ({
  page,
}) => {
  await login(page, rookie.email)
  await openProfil(page)

  await expect(
    page.getByText('Deine Bilanz füllt sich, sobald dein erstes Tasting abgeschlossen ist.'),
  ).toBeVisible()
  await expect(stat(page, 'Tastings')).toHaveText('0')
  await expect(stat(page, 'Mitgebrachte Whiskys')).toHaveText('0')
  await expect(page.getByText('noch keine Platzierung')).toBeVisible()
  await expect(page.getByText('noch nichts bewertet')).toBeVisible()
})

test('Mitglied mit Historie: Anzahl Tastings und mitgebrachte Whiskys stimmen', async ({ page }) => {
  await login(page, veteran.email)
  await openProfil(page)

  await expect(stat(page, 'Tastings')).toHaveText('2')
  await expect(stat(page, 'Mitgebrachte Whiskys')).toHaveText('3')
})

test('Beste Platzierung zählt nur bewertete Whiskys: „1. Platz“ mit Ardbeg, nicht der ungewertete Talisker', async ({
  page,
}) => {
  await login(page, veteran.email)
  await openProfil(page)

  await expect(stat(page, 'Beste Platzierung')).toHaveText('1. Platz')
  await expect(page.getByText('Ardbeg Uigeadail')).toBeVisible()
  await expect(page.getByText('Talisker 10')).toHaveCount(0)
})

test('Ø vergebene Punkte: Mittel der Gesamtpunkte + Anzahl', async ({ page }) => {
  await login(page, veteran.email)
  await openProfil(page)

  // Bewertungen 5+9=14 und 2+4=6 → Ø 10,0 aus 2 Bewertungen
  await expect(stat(page, 'Ø vergebene Punkte')).toHaveText('Ø 10,0')
  await expect(page.getByText('aus 2 Bewertungen')).toBeVisible()
})
