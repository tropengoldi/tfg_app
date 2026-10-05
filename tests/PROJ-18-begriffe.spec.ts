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
 * PROJ-18 · Begriffe: Gaumenpunkte & Whisky-Steward — E2E.
 *
 * Deckt die Bewertungsansicht (volle Form) und die Rangliste (Kurzform,
 * einzeilig auf 360 px) ab. Die „Whisky-Steward"-Stellen in Admin-Formular,
 * Admin-Liste und Ergebnis-Kopf prüft `PROJ-11-neutraler-helfer.spec.ts`,
 * die Einzelwertungen `PROJ-9-ergebnisse-historie.spec.ts`, die DB-Meldungen
 * die Integrationstests (`helper-role` / `rls`).
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA18-${STAMP}-${tag}`
const LONG_NAME =
  'Glenfarclas 25 Jahre Family Cask Sherry Butt Single Cask Strength Edition'

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
let member: { id: string; email: string }
let other: { id: string; email: string }
let closedId = ''

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  member = await createDisposableUser(`b18m${STAMP}`, { active: true })
  other = await createDisposableUser(`b18o${STAMP}`, { active: true })

  // Abgeschlossenes Event: ein Whisky mit sehr langem Namen, zwei Bewertungen.
  closedId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('closed'),
    eventDate: '2025-06-14',
  })
  await addParticipant(closedId, other.id)
  await addWhiskyAs(other.email, closedId, LONG_NAME)
  const [w] = await whiskyIdsByPosition(closedId)
  await insertRatingDirect({ whiskyId: w, eventId: closedId, profileId: member.id, nose: 5, taste: 9 })
  await insertRatingDirect({ whiskyId: w, eventId: closedId, profileId: other.id, nose: 4, taste: 8 })
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({
      status: 'closed',
      started_at: new Date(Date.now() - 3_600_000).toISOString(),
      closed_at: new Date().toISOString(),
    })
    .eq('id', closedId)
  if (error) throw error
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA18-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (other) await deleteUser(other.id)
})

async function openResults(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)
}

// ===========================================================================
test('Bewertungsansicht: Slider heißen „Nasenpunkte" und „Gaumenpunkte" (sichtbar + Screenreader)', async ({
  page,
}) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('rate'),
  })
  await addWhiskyAs(member.email, evId, 'Rate-W1')
  await startEventDirect(evId, 1)

  await login(page, member.email)
  await page.goto(`/tastings/${evId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()

  await expect(page.getByText('Nasenpunkte', { exact: true })).toBeVisible()
  await expect(page.getByText('Gaumenpunkte', { exact: true })).toBeVisible()
  // Bezeichnung am Slider-Container (aria-label) ist umbenannt.
  await expect(page.locator('[aria-label="Nasenpunkte"]')).toHaveCount(1)
  await expect(page.locator('[aria-label="Gaumenpunkte"]')).toHaveCount(1)

  // Alte Begriffe sind weg.
  await expect(page.getByText('Geschmack', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Nase', { exact: true })).toHaveCount(0)
  await expect(page.locator('[aria-label="Geschmackspunkte"]')).toHaveCount(0)
})

// PROJ-18 BUG-1 (vorbestehend seit PROJ-7): das role="slider"-Element selbst hat
// keinen zugänglichen Namen — das aria-label sitzt am Container (generic),
// Screenreader sagen nur „Schieberegler". Nach dem Fix .fixme entfernen.
test.fixme('Screenreader: die Slider selbst heißen „Nasenpunkte" / „Gaumenpunkte" (BUG-1)', async ({
  page,
}) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('a11y'),
  })
  await addWhiskyAs(member.email, evId, 'A11y-W1')
  await startEventDirect(evId, 1)
  await login(page, member.email)
  await page.goto(`/tastings/${evId}/bewerten`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('slider', { name: 'Nasenpunkte' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Gaumenpunkte' })).toBeVisible()
})

test('Rangliste: Summenzeile lautet „Nase X · Gaumen Y"', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, closedId)

  const row = page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem').first()
  await expect(row).toContainText('Nase 9 · Gaumen 17')
  await expect(row).not.toContainText('Geschmack')
})

test('Rangliste auf 360 px: Summenzeile bleibt trotz langem Namen einzeilig', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await login(page, member.email)
  await openResults(page, closedId)

  const summary = page
    .getByRole('list', { name: 'Rangliste' })
    .getByRole('listitem')
    .first()
    .getByText('Nase 9 · Gaumen 17')
  await expect(summary).toBeVisible()
  const box = await summary.boundingBox()
  const lineHeight = await summary.evaluate((el) =>
    parseFloat(getComputedStyle(el).lineHeight),
  )
  expect(box).not.toBeNull()
  // Einzeilig: Höhe höchstens eine Zeilenhöhe (+ Rundungstoleranz).
  expect(box!.height).toBeLessThanOrEqual(lineHeight * 1.2)

  // Keine horizontale Scrollbar auf der Seite.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
