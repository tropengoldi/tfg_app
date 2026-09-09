import { expect, test, type Page } from '@playwright/test'

import {
  addWhiskyAs,
  closeAllActiveEvents,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  hasServiceClient,
  login,
  serviceClient,
  setRole,
  signInOnce,
  startEventDirect,
  whiskyIdsByPosition,
} from './helpers/auth'

/**
 * PROJ-11 · Neutraler Helfer pro Event — E2E.
 *
 * Deckt die UI-/Navigations-Ebene ab (Formularfeld + Ausschlusslogik, Anzeige
 * „Helfer: {Name}", die „Steuern"-Sichtbarkeit für Helfer vs. Gastgeber-mit-
 * Helfer, die abgespeckte Eckdaten-Seite des Gastgeber-mit-Helfer,
 * Ergebnis-Kopf). Die DB-erzwungene Blindheit prüft
 * `src/lib/supabase/__tests__/helper-role.integration.test.ts`.
 *
 * Eigener Wegwerf-Admin — unabhängig von den Seed-Konten.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA11-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let admin: { id: string; email: string }
let host: { id: string; email: string }
let helper: { id: string; email: string }
let guest: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  admin = await createDisposableUser(`a${STAMP}`, { active: true })
  await setRole(admin.id, 'admin')
  await signInOnce(admin.email)
  host = await createDisposableUser(`h${STAMP}`, { active: true })
  helper = await createDisposableUser(`x${STAMP}`, { active: true })
  guest = await createDisposableUser(`g${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA11-${STAMP}-`)
  for (const u of [host, helper, guest, admin]) if (u) await deleteUser(u.id)
})

/** Draft-Event mit Helfer + Teilnehmern; Whiskys werden von guest eingetragen. */
async function eventWithHelper(tag: string, whiskyCount = 2): Promise<string> {
  const evId = await createEventDirect({
    hostId: host.id,
    createdBy: admin.id,
    location: LOC(tag),
  })
  const svc = serviceClient()
  await svc.from('event_participants').insert({ event_id: evId, profile_id: guest.id })
  await svc.from('tasting_events').update({ helper_id: helper.id }).eq('id', evId)
  for (let i = 0; i < whiskyCount; i++) {
    await addWhiskyAs(guest.email, evId, `${tag}-Dram-${i + 1}`)
  }
  return evId
}

async function gotoForm(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Tasting anlegen|Änderungen speichern/ }).waitFor()
  await expect(page.getByLabel('Ort')).toHaveCount(1)
}

// ===========================================================================
test('Event-Formular: „Helfer"-Feld vorhanden, Gastgeber ist dort nicht wählbar (AC1/AC2)', async ({
  page,
}) => {
  await login(page, admin.email)
  await gotoForm(page, '/admin/events/neu')

  // Feld ist da, Default „Kein Helfer".
  const helferField = page.getByLabel('Helfer (optional)')
  await expect(helferField).toBeVisible()
  await expect(helferField).toHaveText(/Kein Helfer/)

  // Gastgeber wählen …
  await page.getByLabel('Gastgeber').click()
  await page.getByRole('option', { name: `QA h${STAMP}` }).click()

  // … dann taucht dieselbe Person im Helfer-Feld nicht auf.
  await helferField.click()
  await expect(page.getByRole('option', { name: 'Kein Helfer' })).toBeVisible()
  await expect(page.getByRole('option', { name: `QA h${STAMP}` })).toHaveCount(0)
  // Der Helfer-Kandidat (nicht Gastgeber, kein Teilnehmer) ist wählbar.
  await expect(page.getByRole('option', { name: `QA x${STAMP}` })).toBeVisible()
})

test('Admin-Liste zeigt „Helfer: {Name}" (AC4)', async ({ page }) => {
  const evId = await eventWithHelper('list', 0)
  await login(page, admin.email)
  await page.goto('/admin/events', { waitUntil: 'networkidle' })

  const row = page.locator('li', { hasText: LOC('list') })
  await expect(row).toContainText(`Helfer: QA x${STAMP}`)
  expect(evId).toBeTruthy()
})

test('Helfer sieht „Steuern" auf der /tastings-Zeile und öffnet die Steuern-Seite (AC7/AC9)', async ({
  page,
}) => {
  const evId = await eventWithHelper('run', 2)
  await startEventDirect(evId)

  await login(page, helper.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })

  const row = page.locator('li', { hasText: LOC('run') })
  const steuern = row.getByRole('link', { name: 'Steuern' })
  await expect(steuern).toBeVisible()
  await steuern.click()

  await page.waitForURL(`**/tastings/${evId}/gastgeber`)
  await expect(page.getByRole('heading', { name: 'Steuern' })).toBeVisible()
  // Der Helfer sieht die Whisky-Namen in der Reihenfolge-Liste.
  await expect(page.getByText('run-Dram-1')).toBeVisible()

  await closeAllActiveEvents()
})

test('Gastgeber-mit-Helfer: kein „Steuern", aber Eckdaten pflegbar (AC14/AC16, Verfeinerung)', async ({
  page,
}) => {
  const evId = await eventWithHelper('lock', 2)
  await startEventDirect(evId)

  await login(page, host.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })

  const row = page.locator('li', { hasText: LOC('lock') })
  await expect(row).toBeVisible()
  // Kein „Steuern" — den Ablauf hat der Helfer.
  await expect(row.getByRole('link', { name: 'Steuern' })).toHaveCount(0)
  // „Jetzt bewerten" bleibt (der Gastgeber verkostet blind mit).
  await expect(row.getByRole('link', { name: /Bewerten|Whiskys/ }).first()).toBeVisible()
  // … aber ein „Eckdaten"-Absprung ist da.
  const eckdaten = row.getByRole('link', { name: 'Eckdaten' })
  await expect(eckdaten).toBeVisible()
  await eckdaten.click()

  await page.waitForURL(`**/tastings/${evId}/gastgeber`)
  // Abgespeckte Seite: Eckdaten-Formular ja, Ablauf-Steuerung nein.
  await expect(page.getByRole('heading', { name: 'Eckdaten' })).toBeVisible()
  await expect(page.getByLabel(/Info zum Essen/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Nächste Runde|Tasting abschließen|Tasting starten/ }),
  ).toHaveCount(0)
  await expect(page.getByRole('list', { name: 'Ausschankreihenfolge' })).toHaveCount(0)
  // Keine geheimen Whisky-Namen.
  await expect(page.getByText('lock-Dram-1')).toHaveCount(0)

  // Essen eintragen und speichern.
  await page.getByLabel(/Info zum Essen/).fill('Raclette')
  await page.getByRole('button', { name: /Eckdaten speichern/ }).click()
  await expect(page.getByText(/Eckdaten gespeichert/)).toBeVisible()

  await closeAllActiveEvents()
})

test('Ergebnis-Kopf zeigt „Helfer: {Name}", nicht in „Wer war dabei" (AC21)', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: host.id,
    createdBy: admin.id,
    location: LOC('res'),
    status: 'closed',
  })
  const svc = serviceClient()
  await svc.from('event_participants').insert({ event_id: evId, profile_id: guest.id })
  await svc.from('tasting_events').update({ helper_id: helper.id }).eq('id', evId)
  // Ein Whisky direkt in das abgeschlossene Event (guest als Bringer).
  const { data: w } = await svc
    .from('whiskies')
    .insert({ event_id: evId, position: 1 })
    .select('id')
    .single()
  await svc.from('whisky_details').insert({
    whisky_id: w!.id,
    event_id: evId,
    brought_by: guest.id,
    name: 'res-Dram',
  })

  await login(page, guest.email)
  await page.goto(`/tastings/${evId}/ergebnisse`, { waitUntil: 'networkidle' })

  await expect(page.getByText(`Helfer: QA x${STAMP}`)).toBeVisible()
  await expect(page.getByText(`Gastgeber: QA h${STAMP}`)).toBeVisible()

  // Der Helfer steht nicht in „Wer war dabei".
  const dabei = page.getByText('Wer war dabei').locator('..')
  await expect(dabei).not.toContainText(`QA x${STAMP}`)

  expect(await whiskyIdsByPosition(evId)).toHaveLength(1)
})
