import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  hasServiceClient,
  login,
  serviceClient,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA16-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let sender: { id: string; email: string }
let recipient: { id: string; email: string }
let outsider: { id: string; email: string }
/** Nie an einem Tasting beteiligt, nie eine Nachricht verschickt. */
let freshMember: { id: string; email: string }
/** Helfer (PROJ-11) des Tastings — steht nicht in der Teilnehmerliste,
 * muss aber trotzdem als Empfänger wählbar sein (Post-Deploy-Fund). */
let helper: { id: string; email: string }

let evId = ''

async function openMessages(page: Page) {
  await page.goto('/nachrichten', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Nachrichten' }).waitFor()
  await page.waitForTimeout(400)
}

test.beforeAll(async () => {
  if (!hasServiceClient) return

  sender = await createDisposableUser(`r16s${STAMP}`, { active: true })
  recipient = await createDisposableUser(`r16r${STAMP}`, { active: true })
  outsider = await createDisposableUser(`r16o${STAMP}`, { active: true })
  freshMember = await createDisposableUser(`r16f${STAMP}`, { active: true })
  helper = await createDisposableUser(`r16h${STAMP}`, { active: true })

  evId = await createEventDirect({
    hostId: sender.id,
    createdBy: sender.id,
    location: LOC('ev1'),
    eventDate: '2026-11-11',
  })
  await addParticipant(evId, recipient.id)
  await serviceClient().from('tasting_events').update({ helper_id: helper.id }).eq('id', evId)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA16-${STAMP}-`)
  if (sender) await deleteUser(sender.id)
  if (recipient) await deleteUser(recipient.id)
  if (outsider) await deleteUser(outsider.id)
  if (freshMember) await deleteUser(freshMember.id)
  if (helper) await deleteUser(helper.id)
})

// ===========================================================================
// Einstiegspunkt & Modus
// ===========================================================================

test('Profilseite verlinkt „Nachrichten"', async ({ page }) => {
  await login(page, sender.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()

  await page.getByRole('link', { name: 'Nachrichten' }).click()
  await expect(page).toHaveURL(/\/nachrichten$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Nachrichten' })).toBeVisible()
})

test('Standardmodus ist „Allgemein" mit leerer Empfängerauswahl', async ({ page }) => {
  await login(page, sender.email)
  await openMessages(page)

  await expect(page.getByRole('tab', { name: 'Allgemein' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  const recipientCheckbox = page.getByRole('checkbox', { name: `QA r16r${STAMP}` })
  await expect(recipientCheckbox).toBeVisible()
  await expect(recipientCheckbox).not.toBeChecked()
  // Der Absender selbst steht nicht in der Liste.
  await expect(page.getByRole('checkbox', { name: `QA r16s${STAMP}` })).toHaveCount(0)
})

// ===========================================================================
// Allgemeine Nachricht
// ===========================================================================

test('Allgemein: senden → Erfolg, erscheint in der Gesendet-Liste', async ({ page }) => {
  await login(page, sender.email)
  await openMessages(page)

  await page.getByRole('checkbox', { name: `QA r16r${STAMP}` }).click()
  await page.getByLabel('Nachricht').fill('Hallo an alle!')
  await page.getByRole('button', { name: 'Senden' }).click()

  await expect(page.getByText('Nachricht verschickt.')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Hallo an alle!')).toBeVisible()
  await expect(page.getByText('1 Empfänger')).toBeVisible()
})

test('Allgemein: kein Empfänger gewählt → Hinweis, nichts verschickt', async ({ page }) => {
  await login(page, sender.email)
  await openMessages(page)

  await page.getByLabel('Nachricht').fill('Das darf nicht rausgehen.')
  await page.getByRole('button', { name: 'Senden' }).click()

  await expect(page.getByText('Bitte mindestens einen Empfänger wählen.')).toBeVisible()
  // Nichts wurde abgeschickt → der Text bleibt im Formular stehen (nicht
  // geleert) und es erscheint keine Erfolgsmeldung.
  await expect(page.getByLabel('Nachricht')).toHaveValue('Das darf nicht rausgehen.')
  await expect(page.getByText('Nachricht verschickt.')).toHaveCount(0)
})

test('Allgemein: leerer Text → Pflichtfeld-Hinweis, nichts verschickt', async ({ page }) => {
  await login(page, sender.email)
  await openMessages(page)

  await page.getByRole('checkbox', { name: `QA r16r${STAMP}` }).click()
  await page.getByRole('button', { name: 'Senden' }).click()

  await expect(page.getByText('Bitte eine Nachricht eingeben.')).toBeVisible()
})

// ===========================================================================
// Tasting-bezogene Nachricht
// ===========================================================================

test('Tasting-Modus: eigenes Tasting mit vorausgewählten Teilnehmern, Außenstehende fehlen', async ({
  page,
}) => {
  await login(page, sender.email)
  await openMessages(page)

  await page.getByRole('tab', { name: 'Zu einem Tasting' }).click()
  await page.getByLabel('Tasting').click()
  await page.getByRole('option', { name: new RegExp(LOC('ev1')) }).click()

  const recipientCheckbox = page.getByRole('checkbox', { name: `QA r16r${STAMP}` })
  await expect(recipientCheckbox).toBeChecked()
  await expect(page.getByRole('checkbox', { name: `QA r16o${STAMP}` })).toHaveCount(0)

  // Post-Deploy-Fund: der Helfer steht nicht in der Teilnehmerliste, muss
  // aber trotzdem als Empfänger vorausgewählt auftauchen.
  await expect(page.getByRole('checkbox', { name: `QA r16h${STAMP}` })).toBeChecked()
})

test('Tasting-Modus: ohne eigene Tastings erscheint ein Hinweis', async ({ page }) => {
  await login(page, freshMember.email)
  await openMessages(page)

  await page.getByRole('tab', { name: 'Zu einem Tasting' }).click()
  await expect(page.getByText('Du bist noch an keinem Tasting beteiligt.')).toBeVisible()
})

test('Tasting-Modus: senden → Erfolg, Gesendet-Liste zeigt den Tasting-Bezug', async ({
  page,
}) => {
  await login(page, sender.email)
  await openMessages(page)

  await page.getByRole('tab', { name: 'Zu einem Tasting' }).click()
  await page.getByLabel('Tasting').click()
  await page.getByRole('option', { name: new RegExp(LOC('ev1')) }).click()
  await page.getByLabel('Nachricht').fill('Bringt noch ein Glas mit!')
  await page.getByRole('button', { name: 'Senden' }).click()

  await expect(page.getByText('Nachricht verschickt.')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Bringt noch ein Glas mit!')).toBeVisible()
  // Die Tasting-Auswahl selbst nennt den Ort auch — deshalb gezielt in der
  // Gesendet-Zeile suchen, nicht irgendwo auf der Seite.
  const sentEntry = page.getByText('Bringt noch ein Glas mit!').locator('..')
  await expect(sentEntry.getByText(new RegExp(LOC('ev1')))).toBeVisible()
})

// ===========================================================================
// Gesendet-Liste
// ===========================================================================

test('Gesendet-Liste: Leerzustand für ein Mitglied ohne verschickte Nachrichten', async ({
  page,
}) => {
  await login(page, freshMember.email)
  await openMessages(page)

  await expect(page.getByText('Du hast noch keine Nachricht geschickt.')).toBeVisible()
})
