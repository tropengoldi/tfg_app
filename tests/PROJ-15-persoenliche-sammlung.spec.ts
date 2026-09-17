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
const LOC = (tag: string) => `QA15-${STAMP}-${tag}`
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
/** Pflegt manuell mehrere Sammlungs-Einträge; wird von `viewer` besucht. */
let owner: { id: string; email: string }
/** Besucht fremde Sammlungen. */
let viewer: { id: string; email: string }
/** Bleibt ohne Einträge — Leerzustand + Default-Sichtbarkeit. */
let emptyMember: { id: string; email: string }

let ev1 = '' // geschlossen; owner bringt 2 Whiskys, bewertet nur den ersten

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

async function readShowCollection(userId: string): Promise<boolean> {
  const { data } = await serviceClient()
    .from('profiles')
    .select('show_collection')
    .eq('id', userId)
    .single()
  return Boolean(data?.show_collection)
}

async function openSammlung(page: Page) {
  await page.goto('/profil/sammlung', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Meine Sammlung' }).waitFor()
  await page.waitForTimeout(300)
}

/** Öffnet den Anlegen-Dialog und füllt nur den Namen. */
async function openAddDialog(page: Page, name: string) {
  await page.getByRole('button', { name: 'Neuer Eintrag' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await fillField(page, 'Name', name)
  return dialog
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

  owner = await createDisposableUser(`r15o${STAMP}`, { active: true })
  viewer = await createDisposableUser(`r15v${STAMP}`, { active: true })
  emptyMember = await createDisposableUser(`r15e${STAMP}`, { active: true })

  ev1 = await createEventDirect({
    hostId: owner.id,
    createdBy: adminId,
    location: LOC('ev1'),
    eventDate: '2025-06-01',
  })
  await addWhiskyAs(owner.email, ev1, 'Owner Dram Rated')
  await addWhiskyAs(owner.email, ev1, 'Owner Dram Unrated')
  const [w1] = await whiskyIdsByPosition(ev1)
  await insertRatingDirect({
    whiskyId: w1,
    eventId: ev1,
    profileId: owner.id,
    nose: 4,
    taste: 7,
    notes: 'Torfig, meine Notiz.',
  })
  await closeEvent(ev1)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA15-${STAMP}-`)
  if (owner) await deleteUser(owner.id)
  if (viewer) await deleteUser(viewer.id)
  if (emptyMember) await deleteUser(emptyMember.id)
})

// ===========================================================================
// Eigene Sammlung ansehen & pflegen
// ===========================================================================

test('Profilseite verlinkt „Meine Sammlung"', async ({ page }) => {
  await login(page, owner.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()

  await page.getByRole('link', { name: 'Meine Sammlung' }).click()
  await expect(page).toHaveURL(/\/profil\/sammlung$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Meine Sammlung' })).toBeVisible()
})

test('Leere Sammlung zeigt Leerzustand mit Anlegen-Hinweis', async ({ page }) => {
  await login(page, emptyMember.email)
  await openSammlung(page)

  await expect(page.getByText('Deine Sammlung ist noch leer.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Neuer Eintrag' })).toBeVisible()
})

test('Name ist beim Anlegen Pflicht', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  await page.getByRole('button', { name: 'Neuer Eintrag' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await dialog.getByRole('button', { name: 'Eintragen' }).click()

  await expect(dialog.getByText('Name ist erforderlich')).toBeVisible()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
})

test('Eintrag mit allen Feldern anlegen', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  const dialog = await openAddDialog(page, 'Ardbeg Uigeadail')
  await fillField(page, 'Destillerie (optional)', 'Ardbeg')
  await fillField(page, 'Region (optional)', 'Islay')
  await fillField(page, 'Alter/Jahrgang (optional)', '16 Jahre')
  await fillField(page, 'Preis-Leistung (optional)', 'Fairer Preis')
  await fillField(page, 'Notizen (optional)', 'Rauchig und torfig.')

  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: '9 / 10' }).click()

  await dialog.getByRole('switch').click() // Besitze ich

  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })

  await expect(page.getByText('Ardbeg Uigeadail')).toBeVisible()
  await expect(page.getByText('Ardbeg · Islay · 16 Jahre')).toBeVisible()
  await expect(page.getByText('Besitze ich')).toBeVisible()
  await expect(page.getByText('9/10')).toBeVisible()
  await expect(page.getByText('Fairer Preis')).toBeVisible()
})

test('Zweiter Eintrag erscheint oben (neueste zuerst)', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  const dialog = await openAddDialog(page, 'Talisker Skye')
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })
  await expect(page.getByText('Talisker Skye')).toBeVisible({ timeout: 15_000 })

  const names = await page.locator('p.font-display').allTextContents()
  const talisker = names.indexOf('Talisker Skye')
  const ardbeg = names.indexOf('Ardbeg Uigeadail')
  expect(talisker).toBeGreaterThanOrEqual(0)
  expect(ardbeg).toBeGreaterThan(talisker)
})

test('Name über 200 Zeichen wird abgelehnt', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  const dialog = await openAddDialog(page, 'x'.repeat(201))
  await dialog.getByRole('button', { name: 'Eintragen' }).click()

  await expect(dialog.getByText('Höchstens 200 Zeichen')).toBeVisible()
  await page.keyboard.press('Escape')
})

test('Suche filtert nach Name', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  const search = page.getByPlaceholder('Name oder Destillerie suchen')
  await search.fill('Ardbeg')
  await expect(page.getByText('Ardbeg Uigeadail')).toBeVisible()
  await expect(page.getByText('Talisker Skye')).not.toBeVisible()

  await search.fill('nichts-passt-hier')
  await expect(page.getByText('Keine Treffer.')).toBeVisible()

  await search.fill('')
})

test('Eintrag bearbeiten — Felder vorbefüllt, Änderung gespeichert', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  await page.getByRole('button', { name: /Aktionen für „Ardbeg Uigeadail"/ }).click()
  await page.getByRole('menuitem', { name: 'Bearbeiten' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('Name')).toHaveValue('Ardbeg Uigeadail')
  await expect(dialog.getByLabel('Destillerie (optional)')).toHaveValue('Ardbeg')

  await fillField(page, 'Notizen (optional)', 'Aktualisierte Notiz.')
  await dialog.getByRole('button', { name: 'Änderungen speichern' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })

  await expect(page.getByText('Aktualisierte Notiz.')).toBeVisible()
})

test('Eintrag löschen — Bestätigungsdialog, dann endgültig weg', async ({ page }) => {
  await login(page, owner.email)
  await openSammlung(page)

  await page.getByRole('button', { name: /Aktionen für „Talisker Skye"/ }).click()
  await page.getByRole('menuitem', { name: 'Löschen' }).click()

  const confirm = page.getByRole('alertdialog')
  await expect(confirm.getByText('Eintrag löschen?')).toBeVisible()
  await confirm.getByRole('button', { name: 'Löschen' }).click()

  await expect(page.getByText('Eintrag gelöscht.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Talisker Skye')).not.toBeVisible()
})

// ===========================================================================
// Sichtbarkeit für andere
// ===========================================================================

test('Achter Schalter „Sammlung" steht bei neuen Mitgliedern auf sichtbar', async ({ page }) => {
  await login(page, emptyMember.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()
  await page.waitForTimeout(300)

  await expect(page.getByRole('switch', { name: 'Sammlung', exact: true })).toBeChecked()
})

test('Schalter „Sammlung" umlegen speichert sofort', async ({ page }) => {
  await login(page, emptyMember.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()
  await page.waitForTimeout(300)

  // Beide Klicks lösen denselben Toast-Text „Gespeichert." aus — als Beleg für
  // den zweiten Round-Trip taugt der Toast allein nicht (könnte noch der vom
  // ersten Klick sein). Stattdessen direkt auf den DB-Wert pollen.
  const sw = page.getByRole('switch', { name: 'Sammlung', exact: true })
  await sw.click()
  await expect.poll(() => readShowCollection(emptyMember.id), { timeout: 15_000 }).toBe(false)
  await expect(sw).not.toBeChecked()

  await sw.click()
  await expect.poll(() => readShowCollection(emptyMember.id), { timeout: 15_000 }).toBe(true)
  await expect(sw).toBeChecked()
})

// ===========================================================================
// Fremde Sammlung ansehen
// ===========================================================================

test('Sichtbare Sammlung: Link „Sammlung ansehen" führt zur read-only Liste', async ({
  page,
}) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(300)

  const link = page.getByRole('link', { name: 'Sammlung ansehen' })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(new RegExp(`/profil/${owner.id}/sammlung$`))

  await expect(page.getByText('Ardbeg Uigeadail')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Neuer Eintrag' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Aktionen für/ })).toHaveCount(0)
})

test('Verborgene Sammlung: Link fehlt, direkter Aufruf zeigt neutralen Hinweis', async ({
  page,
}) => {
  await serviceClient()
    .from('profiles')
    .update({ show_collection: false })
    .eq('id', owner.id)

  await login(page, viewer.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(300)
  await expect(page.getByRole('link', { name: 'Sammlung ansehen' })).toHaveCount(0)

  await page.goto(`/profil/${owner.id}/sammlung`, { waitUntil: 'networkidle' })
  await expect(page.getByText('Diese Sammlung ist nicht sichtbar.')).toBeVisible()
  await expect(page.getByText('Ardbeg Uigeadail')).not.toBeVisible()

  await serviceClient().from('profiles').update({ show_collection: true }).eq('id', owner.id)
})

test('Sichtbare, aber leere fremde Sammlung zeigt „Noch keine Einträge."', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${emptyMember.id}/sammlung`, { waitUntil: 'networkidle' })
  await expect(page.getByText('Noch keine Einträge.')).toBeVisible()
})

test('Ungültige Profil-ID → „Seite nicht gefunden"', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${UNKNOWN_ID}/sammlung`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Eigene ID → Redirect zur bearbeitbaren Sammlung', async ({ page }) => {
  await login(page, owner.email)
  await page.goto(`/profil/${owner.id}/sammlung`, { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/profil\/sammlung$/)
})

// ===========================================================================
// Übernehmen-Button auf der Ergebnisseite (PROJ-9)
// ===========================================================================

test('Übernehmen-Button erscheint nur bei der eigenen Bewertung', async ({ page }) => {
  await login(page, owner.email)
  await page.goto(`/tastings/${ev1}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  const ratedRow = page.locator('li').filter({ hasText: 'Owner Dram Rated' })
  await expect(ratedRow.getByRole('button', { name: 'Zur Sammlung hinzufügen' })).toBeVisible()

  const unratedRow = page.locator('li').filter({ hasText: 'Owner Dram Unrated' })
  await expect(
    unratedRow.getByRole('button', { name: 'Zur Sammlung hinzufügen' }),
  ).toHaveCount(0)
})

test('Übernehmen füllt Name + eigene Notiz vor, Bewertung bleibt leer, setzt die Herkunft', async ({
  page,
}) => {
  await login(page, owner.email)
  await page.goto(`/tastings/${ev1}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  const ratedRow = page.locator('li').filter({ hasText: 'Owner Dram Rated' })
  await ratedRow.getByRole('button', { name: 'Zur Sammlung hinzufügen' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(/Von TFG-Tasting am/)).toBeVisible()
  await expect(dialog.getByLabel('Name')).toHaveValue('Owner Dram Rated')
  await expect(dialog.getByLabel('Notizen (optional)')).toHaveValue('Torfig, meine Notiz.')
  await expect(dialog.getByRole('combobox')).toContainText('Keine')

  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })

  await openSammlung(page)
  await expect(page.getByText('Owner Dram Rated')).toBeVisible()
  await expect(page.getByText(/Von TFG-Tasting am/)).toBeVisible()
  await expect(
    page.getByRole('link', { name: /\d{1,2}\.\s\w+\s2025/ }).first(),
  ).toHaveAttribute('href', `/tastings/${ev1}/ergebnisse`)
})
