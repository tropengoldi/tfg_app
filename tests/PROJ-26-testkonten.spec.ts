import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  createDisposableAdmin,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  deleteUsersByPrefix,
  fillField,
  hasServiceClient,
  insertRatingDirect,
  login,
  serviceClient,
  whiskyIdsByPosition,
} from './helpers/auth'

/**
 * PROJ-26 · Testkonten für normale Nutzer unsichtbar — E2E.
 * Admin: Einladen mit Häkchen, Schalter + Rückfrage, kein „Zum Admin machen",
 * Mischwarnung im Event-Formular, Abzeichen. Normales Mitglied: Community,
 * direkte Aufrufe, Meine Tastings, Historie, Bilanz, Nachrichten. Testkonto:
 * sieht alles + Test-Welt mit Abzeichen, schreibt nur Testkonten an.
 * Die DB-Regeln prüft `test-accounts.integration.test.ts`.
 *
 * Achtung: echte (unmarkierte) Wegwerf-Konten sind während des Laufs für die
 * Runde sichtbar — nur so lässt sich „normales Mitglied" prüfen.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA26-${STAMP}-${tag}`
const INVITE_PREFIX = `qa26-inv-${STAMP}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

type U = { id: string; email: string }
let admin: U
let realA: U // echt, Gastgeber des echten Tastings
let realB: U // echt, Teilnehmer im echten UND im gemischten Tasting
let tester: U // Testkonto, Gastgeber des gemischten Tastings
let tester2: U // Testkonto, unbeteiligt
let realEv = ''
let testEv = ''
const name = (tag: string) => `QA ${tag}${STAMP}`

async function closedEvent(tag: string, host: U, others: U[]): Promise<string> {
  const id = await createEventDirect({
    hostId: host.id,
    createdBy: admin.id,
    location: LOC(tag),
    eventDate: '2025-07-01',
  })
  for (const o of others) await addParticipant(id, o.id)
  await addWhiskyAs(host.email, id, `Glenfarclas ${tag}`)
  const [w] = await whiskyIdsByPosition(id)
  for (const p of [host, ...others]) {
    await insertRatingDirect({ whiskyId: w, eventId: id, profileId: p.id, nose: 3, taste: 7 })
  }
  const now = new Date().toISOString()
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', started_at: now, closed_at: now })
    .eq('id', id)
  return id
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  admin = await createDisposableAdmin(`adm26${STAMP}`)
  realA = await createDisposableUser(`realA${STAMP}`, { test: false })
  realB = await createDisposableUser(`realB${STAMP}`, { test: false })
  tester = await createDisposableUser(`tester${STAMP}`)
  tester2 = await createDisposableUser(`tester2${STAMP}`)
  realEv = await closedEvent('real', realA, [realB, admin])
  testEv = await closedEvent('mixed', tester, [realB, admin])
  await serviceClient().from('collection_entries').insert({ profile_id: tester.id, name: 'QA26 Sammlung' })
  await serviceClient().from('profiles').update({ show_collection: true }).eq('id', tester.id)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA26-${STAMP}-`)
  await deleteUsersByPrefix(`${INVITE_PREFIX}`)
  for (const u of [realA, realB, tester, tester2, admin]) if (u) await deleteUser(u.id)
})

async function as(page: Page, u: U) {
  await page.context().clearCookies()
  await login(page, u.email)
}

const memberRow = (page: Page, tag: string) =>
  page.getByRole('listitem').filter({ hasText: name(tag) })

/** Der <dd>-Wert neben einem <dt> mit genau diesem Text. */
const statValue = (page: Page, label: string) =>
  page.locator('dt', { hasText: new RegExp(`^${label}$`) }).locator('xpath=following-sibling::dd[1]')

async function isTest(id: string): Promise<boolean> {
  const { data } = await serviceClient().from('profiles').select('is_test').eq('id', id).single()
  return Boolean(data?.is_test)
}

// ===========================================================================
// Admin › Teilnehmer
// ===========================================================================
test('Einladen mit Häkchen „Testkonto" legt ein Testkonto an', async ({ page }) => {
  await as(page, admin)
  await page.goto('/admin/teilnehmer', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Teilnehmer einladen' }).click()
  const dialog = page.getByRole('dialog')
  const email = `${INVITE_PREFIX}@example.com`
  await fillField(page, 'E-Mail', email)
  await dialog.getByLabel('Testkonto').check()
  await dialog.getByRole('button', { name: 'Einladen' }).click()
  await expect(page.getByText('Einladung verschickt (Testkonto).')).toBeVisible()

  const { data } = await serviceClient().auth.admin.listUsers({ perPage: 500 })
  const invited = data.users.find((u) => u.email === email)
  expect(invited).toBeTruthy()
  expect(await isTest(invited!.id)).toBe(true)
})

test('Teilnehmerliste: Abzeichen + Schalter; Admin-Konto ohne Schalter; Testkonto ohne „Zum Admin machen"', async ({
  page,
}) => {
  await as(page, admin)
  await page.goto('/admin/teilnehmer', { waitUntil: 'networkidle' })
  const t = memberRow(page, 'tester')
  await expect(t.getByText('Test', { exact: true })).toBeVisible()
  await expect(t.getByRole('switch', { name: 'Testkonto' })).toBeChecked()
  await expect(memberRow(page, 'realA').getByRole('switch', { name: 'Testkonto' })).not.toBeChecked()
  await expect(memberRow(page, 'adm26').getByRole('switch')).toHaveCount(0)

  await t.getByRole('button', { name: /^Aktionen für/ }).click()
  await expect(page.getByRole('menuitem', { name: 'Zum Admin machen' })).toHaveCount(0)
  await page.keyboard.press('Escape')
})

test('Markieren mit Rückfrage (1 Tasting wird ausgeblendet), dann Entfernen', async ({ page }) => {
  await as(page, admin)
  await page.goto('/admin/teilnehmer', { waitUntil: 'networkidle' })
  const sw = memberRow(page, 'realA').getByRole('switch', { name: 'Testkonto' })

  await sw.click()
  const dlg = page.getByRole('alertdialog')
  await expect(dlg).toContainText('Als Testkonto markieren?')
  await expect(dlg).toContainText('1 Tasting wird für die Runde ausgeblendet.')
  await dlg.getByRole('button', { name: 'Markieren' }).click()
  await expect(page.getByText('Als Testkonto markiert.')).toBeVisible()
  await expect.poll(() => isTest(realA.id)).toBe(true)

  await sw.click()
  await expect(dlg).toContainText('Markierung entfernen?')
  await expect(dlg).toContainText('1 Tasting wird für die Runde sichtbar.')
  await dlg.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.getByText('Markierung entfernt.')).toBeVisible()
  await expect.poll(() => isTest(realA.id)).toBe(false)
})

test('Rückfrage abbrechen ändert nichts', async ({ page }) => {
  await as(page, admin)
  await page.goto('/admin/teilnehmer', { waitUntil: 'networkidle' })
  await memberRow(page, 'realB').getByRole('switch', { name: 'Testkonto' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Abbrechen' }).click()
  await expect(memberRow(page, 'realB').getByRole('switch', { name: 'Testkonto' })).not.toBeChecked()
  expect(await isTest(realB.id)).toBe(false)
})

// ===========================================================================
// Admin › Events
// ===========================================================================
test('Event-Liste: Test-Tasting trägt „Test", echtes nicht', async ({ page }) => {
  await as(page, admin)
  await page.goto('/admin/events', { waitUntil: 'networkidle' })
  const mixed = page.getByRole('listitem').filter({ hasText: LOC('mixed') })
  const real = page.getByRole('listitem').filter({ hasText: LOC('real') })
  await expect(mixed.getByText('Test', { exact: true })).toBeVisible()
  await expect(real.getByText('Test', { exact: true })).toHaveCount(0)
})

test('Event-Formular: Mischung echte Mitglieder + Testkonto → Hinweis und Rückfrage beim Speichern', async ({
  page,
}) => {
  await as(page, admin)
  await page.goto('/admin/events/neu', { waitUntil: 'networkidle' })
  await fillField(page, 'Ort', LOC('form'))
  await page.getByRole('combobox', { name: 'Gastgeber' }).click()
  await page.getByRole('option', { name: name('realA') }).click()
  await expect(page.getByText(/echte Mitglieder und Testkonten gemischt/)).toHaveCount(0)

  await page.getByLabel(new RegExp(name('tester2'))).check()
  await expect(page.getByText(/echte Mitglieder und Testkonten gemischt/)).toBeVisible()

  // Datum ist Pflicht — ohne Datum greift die Validierung vor der Rückfrage.
  // (gleiche Kalender-Bedienung wie in PROJ-4: letzten wählbaren Tag nehmen)
  await page.getByRole('button', { name: 'Datum', exact: true }).click()
  const dayButtons = await page.getByRole('gridcell').getByRole('button').all()
  for (let i = dayButtons.length - 1; i >= 0; i--) {
    if (await dayButtons[i].isEnabled()) {
      await dayButtons[i].click()
      break
    }
  }
  await page.getByRole('button', { name: 'Tasting anlegen' }).click()
  const dlg = page.getByRole('alertdialog')
  await expect(dlg).toContainText('Tasting wird unsichtbar')
  await dlg.getByRole('button', { name: 'Zurück' }).click()
  await expect(page).toHaveURL(/\/admin\/events\/neu$/)
  const { data } = await serviceClient().from('tasting_events').select('id').eq('location', LOC('form'))
  expect(data).toEqual([])
})

// ===========================================================================
// Normales Mitglied
// ===========================================================================
test('Normales Mitglied: Community ohne Testkonten', async ({ page }) => {
  await as(page, realB)
  await page.goto('/community', { waitUntil: 'networkidle' })
  await expect(page.getByText(name('realA'))).toBeVisible()
  await expect(page.getByText(name('tester'), { exact: true })).toHaveCount(0)
  await expect(page.getByText(name('tester2'))).toHaveCount(0)
  await expect(page.getByText('Test', { exact: true })).toHaveCount(0)
})

test('Normales Mitglied: Profil und Sammlung eines Testkontos → „nicht gefunden"', async ({ page }) => {
  await as(page, realB)
  await page.goto(`/profil/${tester.id}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible()
  await page.goto(`/profil/${tester.id}/sammlung`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible()
})

test('Normales Mitglied: Test-Tasting fehlt in „Meine Tastings" und Historie, obwohl Teilnehmer', async ({
  page,
}) => {
  await as(page, realB)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await expect(page.getByText(LOC('real')).first()).toBeVisible()
  await expect(page.getByText(LOC('mixed'))).toHaveCount(0)
})

test('Normales Mitglied: direkte Aufrufe eines Test-Tastings → „nicht gefunden"', async ({ page }) => {
  await as(page, realB)
  for (const path of ['ergebnisse', 'bewerten', 'whiskies']) {
    await page.goto(`/tastings/${testEv}/${path}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' }), path).toBeVisible()
  }
})

test('Normales Mitglied: Bilanz zählt nur das echte Tasting', async ({ page }) => {
  await as(page, realB)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Tastings')).toHaveText('1')
})

test('Normales Mitglied: keine Testkonten als Nachrichten-Empfänger', async ({ page }) => {
  await as(page, realB)
  await page.goto('/nachrichten', { waitUntil: 'networkidle' })
  await expect(page.getByLabel(name('realA'))).toBeVisible()
  await expect(page.getByLabel(name('tester'), { exact: true })).toHaveCount(0)
  await expect(page.getByText(/nur andere Testkonten anschreiben/)).toHaveCount(0)
})

// ===========================================================================
// Testkonto
// ===========================================================================
test('Testkonto: Community mit echten Mitgliedern und Testkonten (mit Abzeichen)', async ({ page }) => {
  await as(page, tester2)
  await page.goto('/community', { waitUntil: 'networkidle' })
  const real = page.getByRole('listitem').filter({ hasText: name('realA') })
  const test1 = page.getByRole('listitem').filter({ hasText: name('tester') }).first()
  await expect(real).toBeVisible()
  await expect(real.getByText('Test', { exact: true })).toHaveCount(0)
  await expect(test1.getByText('Test', { exact: true })).toBeVisible()
})

test('Testkonto: abgeschlossenes Test-Tasting in der Historie und im Ergebnis-Kopf mit „Test"', async ({
  page,
}) => {
  await as(page, tester2)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  const row = page.getByRole('listitem').filter({ hasText: LOC('mixed') })
  await expect(row.getByText('Test', { exact: true })).toBeVisible()
  await page.goto(`/tastings/${testEv}/ergebnisse`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Rangliste' })).toBeVisible()
  await expect(page.getByText('Test', { exact: true }).first()).toBeVisible()
})

test('Testkonto: Nachrichten nur an Testkonten, mit Hinweis', async ({ page }) => {
  await as(page, tester)
  await page.goto('/nachrichten', { waitUntil: 'networkidle' })
  await expect(page.getByText(/nur andere Testkonten anschreiben/)).toBeVisible()
  await expect(page.getByLabel(name('tester2'))).toBeVisible()
  await expect(page.getByLabel(name('realA'))).toHaveCount(0)
})

test('Testkonto: eigene Bilanz zählt das Test-Tasting', async ({ page }) => {
  await as(page, tester)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Tastings')).toHaveText('1')
})

// ===========================================================================
// Admin sieht alles, Bilanz ohne Test
// ===========================================================================
test('Admin: Historie zeigt beide Tastings, Test-Tasting mit Abzeichen; eigene Bilanz zählt nur das echte', async ({
  page,
}) => {
  await as(page, admin)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await expect(page.getByText(LOC('real')).first()).toBeVisible()
  const mixed = page.getByRole('listitem').filter({ hasText: LOC('mixed') }).first()
  await expect(mixed.getByText('Test', { exact: true })).toBeVisible()

  await page.goto('/profil', { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Tastings')).toHaveText('1')
})

test('Admin: Profil eines echten Mitglieds — Bilanz ohne Test-Tasting', async ({ page }) => {
  await as(page, admin)
  await page.goto(`/profil/${realB.id}`, { waitUntil: 'networkidle' })
  await expect(statValue(page, 'Tastings')).toHaveText('1')
})

// ===========================================================================
// Mobil
// ===========================================================================
test('360 px: Admin-Teilnehmerliste mit Schaltern ohne horizontales Scrollen, Schalter-Zeile ≥ 44 px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await as(page, admin)
  await page.goto('/admin/teilnehmer', { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
  const box = await memberRow(page, 'tester')
    .getByRole('switch', { name: 'Testkonto' })
    .locator('xpath=..')
    .boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
})
