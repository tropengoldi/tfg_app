import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  fillField,
  hasServiceClient,
  login,
  logout,
  serviceClient,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA5-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')

// Mehrere Server-Action-Roundtrips pro Test; unter Last (zwei Projekt-Worker am
// selben prod-Server) reicht der 30-s-Default nicht.
test.beforeEach(() => {
  test.setTimeout(90_000)
})

let adminId = ''
let member: { id: string; email: string }
let other: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  member = await createDisposableUser(`w5m${STAMP}`, { active: true })
  other = await createDisposableUser(`w5o${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA5-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (other) await deleteUser(other.id)
})

async function openWhiskies(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/whiskies`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Meine Whiskys' }).waitFor()
  // Die Sektion re-rendert nach der Navigation kurz clientseitig neu (Hydration);
  // ohne Settle racen Assertions gegen ein transientes Doppel-DOM (siehe QA-Bug).
  await expect(page.getByRole('button', { name: /Whisky hinzufügen/ }).or(
    page.getByText('Das Eintragen für diesen Abend ist geschlossen.'),
  ).first()).toBeVisible()
}

async function openAddDialog(page: Page, name: string, videoUrl?: string) {
  await page.getByRole('button', { name: 'Whisky hinzufügen' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await fillField(page, 'Name', name)
  if (videoUrl !== undefined) await fillField(page, 'Video-Link (optional)', videoUrl)
  return dialog
}

/**
 * Fügt einen Whisky hinzu, wartet auf das Schliessen des Dialogs und lädt die
 * Seite frisch — verlässt sich nicht auf `router.refresh()` (unter Last auf
 * WebKit unzuverlässig).
 */
async function addWhiskyViaUi(page: Page, eventId: string, name: string, videoUrl?: string) {
  const dialog = await openAddDialog(page, name, videoUrl)
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })
  await openWhiskies(page, eventId)
}

// ===========================================================================
test('„Tastings"-Tab listet die eigenen Abende', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('list'),
  })
  await login(page, member.email)
  await page.goto('/tastings')
  const row = page.getByRole('listitem').filter({ hasText: LOC('list') })
  await expect(row).toBeVisible()
  await row.getByRole('link').first().click()
  await expect(page).toHaveURL(new RegExp(`/tastings/${evId}/whiskies$`))
  void evId
})

test('Nicht-Teilnehmer bekommt „Seite nicht gefunden"', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: other.id,
    createdBy: adminId,
    location: LOC('forbidden'),
  })
  await login(page, member.email)
  await page.goto(`/tastings/${evId}/whiskies`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Name ist Pflicht', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('required'),
  })
  await login(page, member.email)
  await openWhiskies(page, evId)
  await page.getByRole('button', { name: 'Whisky hinzufügen' }).click()
  await page.getByRole('dialog').waitFor()
  await page.getByRole('dialog').getByRole('button', { name: 'Eintragen' }).click()
  await expect(page.getByText('Name ist erforderlich')).toBeVisible()
})

test('Video-Link ohne http(s) wird abgelehnt', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('badurl'),
  })
  await login(page, member.email)
  await openWhiskies(page, evId)
  const dialog = await openAddDialog(page, 'Ardbeg Uigeadail', 'youtube.com/watch?v=abc')
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(dialog.getByText(/http:\/\/ oder https:\/\//)).toBeVisible()
  await expect(dialog).toBeVisible()
})

test('Whisky anlegen → erscheint in der Liste; andere Teilnehmer sehen ihn nicht', async ({
  page,
}) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('blind'),
  })
  await addParticipant(evId, other.id)
  const secret = `Geheim-${STAMP}`

  await login(page, member.email)
  await openWhiskies(page, evId)
  await addWhiskyViaUi(page, evId, secret)
  await expect(
    page.getByRole('listitem').filter({ hasText: secret }),
  ).toBeVisible({ timeout: 15_000 })

  // Zweiter Teilnehmer desselben Events sieht den Eintrag nicht.
  await logout(page)
  await login(page, other.email)
  await openWhiskies(page, evId)
  // Sektion ist gerendert …
  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toBeVisible()
  // … aber der fremde Eintrag taucht nirgends auf.
  await expect(page.getByText(secret)).toHaveCount(0)
  await expect(page.getByRole('listitem').filter({ hasText: secret })).toHaveCount(0)
})

test('Kontingent: bei erreichtem Limit ist „Whisky hinzufügen" deaktiviert', async ({
  page,
}) => {
  const evId = await createEventDirect({
    hostId: adminId,
    createdBy: adminId,
    location: LOC('limit'),
    maxWhiskies: 1,
  })
  await addParticipant(evId, member.id)

  await login(page, member.email)
  await openWhiskies(page, evId)
  await addWhiskyViaUi(page, evId, `Limit-${STAMP}`)
  await expect(
    page.getByRole('listitem').filter({ hasText: `Limit-${STAMP}` }),
  ).toBeVisible({ timeout: 15_000 })

  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toBeDisabled()
  await expect(page.getByText(/Limit für diesen Abend ist erreicht/).first()).toBeVisible()
})

test('Gastgeber-Bonus: bei Limit 1 darf der Gastgeber zwei eintragen', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('bonus'),
    maxWhiskies: 1,
  })
  await login(page, member.email)
  await openWhiskies(page, evId)
  await expect(page.getByText(/Bonus-Whisky/).first()).toBeVisible()

  await addWhiskyViaUi(page, evId, `Bonus-A-${STAMP}`)
  await expect(
    page.getByRole('listitem').filter({ hasText: `Bonus-A-${STAMP}` }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toBeEnabled()

  await addWhiskyViaUi(page, evId, `Bonus-B-${STAMP}`)
  await expect(
    page.getByRole('listitem').filter({ hasText: `Bonus-B-${STAMP}` }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toBeDisabled()
})

test('Whisky bearbeiten', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('edit'),
  })
  await login(page, member.email)
  await openWhiskies(page, evId)
  await addWhiskyViaUi(page, evId, `Edit-alt-${STAMP}`)
  const row = page.getByRole('listitem').filter({ hasText: `Edit-alt-${STAMP}` })
  await expect(row).toBeVisible()

  await row.getByRole('button', { name: /bearbeiten/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').waitFor()
  await fillField(page, 'Name', `Edit-neu-${STAMP}`)
  await dialog.getByRole('button', { name: 'Änderungen speichern' }).click()
  await expect(dialog).toBeHidden({ timeout: 15_000 })

  await expect(
    page.getByRole('listitem').filter({ hasText: `Edit-neu-${STAMP}` }),
  ).toBeVisible({ timeout: 15_000 })
})

test('Whisky entfernen (mit Bestätigung)', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('remove'),
  })
  await login(page, member.email)
  await openWhiskies(page, evId)
  await addWhiskyViaUi(page, evId, `Weg-${STAMP}`)
  const row = page.getByRole('listitem').filter({ hasText: `Weg-${STAMP}` })
  await expect(row).toBeVisible()

  await row.getByRole('button', { name: /entfernen/ }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toContainText('endgültig')
  await dialog.getByRole('button', { name: 'Entfernen' }).click()

  await expect(page.getByRole('listitem').filter({ hasText: `Weg-${STAMP}` })).toHaveCount(0, {
    timeout: 15_000,
  })
})

test('Abgeschlossenes Event: „Eintragen geschlossen", keine Aktionen', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('closed'),
    status: 'closed',
  })
  // einen Whisky vor dem „Abschluss" ist über den geschlossenen Status hinweg
  // nicht mehr eintragbar — daher direkt als Draft-Whisky? Nein: nur Anzeige testen.
  await login(page, member.email)
  await openWhiskies(page, evId)
  await expect(
    page.getByText('Das Eintragen für diesen Abend ist geschlossen.'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toHaveCount(0)
})

test('Abgeschlossenes Event: eigene Einträge bleiben als reine Anzeige', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('closed-ro'),
  })
  await addWhiskyAs(member.email, evId, `RO-${STAMP}`)
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', started_at: new Date().toISOString(), closed_at: new Date().toISOString() })
    .eq('id', evId)

  await login(page, member.email)
  await openWhiskies(page, evId)
  const row = page.getByRole('listitem').filter({ hasText: `RO-${STAMP}` })
  await expect(row).toBeVisible()
  await expect(row.getByRole('button')).toHaveCount(0)
})
