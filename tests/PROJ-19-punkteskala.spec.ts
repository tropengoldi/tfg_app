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
  setRole,
  signInOnce,
  startEventDirect,
  whiskyIdsByPosition,
} from './helpers/auth'

/**
 * PROJ-19 · Flexible Punkteskala — E2E.
 * Slider-Start 0, Schrittweite je Tasting, −/+, 0/0-Rückfrage, Anzeige halber
 * Punkte (Rangliste, Sammlung), Admin-Einstellung, Dashboard-Hinweis.
 * Die DB-Regeln prüft `src/lib/supabase/__tests__/rating-scale.integration.test.ts`,
 * die Screenreader-Namen `tests/PROJ-18-begriffe.spec.ts`.
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA19-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let admin: { id: string; email: string }
let member: { id: string; email: string }
let other: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  admin = await createDisposableUser(`a19${STAMP}`, { active: true })
  await setRole(admin.id, 'admin')
  await signInOnce(admin.email)
  member = await createDisposableUser(`m19${STAMP}`, { active: true })
  other = await createDisposableUser(`o19${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA19-${STAMP}-`)
  for (const u of [member, other, admin]) if (u) await deleteUser(u.id)
})

async function setStep(eventId: string, step: 1 | 0.5) {
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({ rating_step: step })
    .eq('id', eventId)
  if (error) throw error
}

/** Laufendes Tasting mit einem Whisky, member ist Gastgeber + Teilnehmer. */
async function runningEvent(tag: string, step: 1 | 0.5) {
  const evId = await createEventDirect({ hostId: member.id, createdBy: admin.id, location: LOC(tag) })
  await setStep(evId, step)
  await addWhiskyAs(member.email, evId, `${tag}-W1`)
  await startEventDirect(evId, 1)
  return evId
}

async function openBewerten(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
  await page.waitForTimeout(400)
}

const nose = (page: Page) => page.getByRole('slider', { name: 'Nasenpunkte' })
const taste = (page: Page) => page.getByRole('slider', { name: 'Gaumenpunkte' })

// ===========================================================================
// Bewertungsansicht
// ===========================================================================
test('Slider starten bei 0, „−" ist dort deaktiviert', async ({ page }) => {
  const evId = await runningEvent('start', 1)
  await login(page, member.email)
  await openBewerten(page, evId)

  await expect(nose(page)).toHaveAttribute('aria-valuenow', '0')
  await expect(taste(page)).toHaveAttribute('aria-valuenow', '0')
  await expect(page.getByRole('button', { name: 'Nasenpunkte verringern' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Gaumenpunkte verringern' })).toBeDisabled()
})

test('ganze Punkte: „+" und Pfeiltaste gehen 1er-Schritte, „+" endet beim Maximum', async ({
  page,
}) => {
  const evId = await runningEvent('whole', 1)
  await login(page, member.email)
  await openBewerten(page, evId)

  const plus = page.getByRole('button', { name: 'Nasenpunkte erhöhen' })
  await plus.click()
  await expect(nose(page)).toHaveAttribute('aria-valuenow', '1')
  await nose(page).focus()
  await nose(page).press('ArrowRight')
  await expect(nose(page)).toHaveAttribute('aria-valuenow', '2')
  for (let i = 0; i < 3; i++) await plus.click()
  await expect(nose(page)).toHaveAttribute('aria-valuenow', '5')
  await expect(plus).toBeDisabled()
})

test('halbe Punkte: „+" geht 0,5er-Schritte, Anzeige mit Komma, Speichern klappt', async ({
  page,
}) => {
  const evId = await runningEvent('half', 0.5)
  await login(page, member.email)
  await openBewerten(page, evId)

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Nasenpunkte erhöhen' }).click()
  }
  await expect(nose(page)).toHaveAttribute('aria-valuenow', '2.5')
  await expect(nose(page)).toHaveAttribute('aria-valuetext', '2,5')
  await expect(page.getByText('2,5', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Nasenpunkte verringern' }).click()
  await expect(nose(page)).toHaveAttribute('aria-valuenow', '2')

  for (let i = 0; i < 15; i++) {
    await page.getByRole('button', { name: 'Gaumenpunkte erhöhen' }).click()
  }
  await expect(taste(page)).toHaveAttribute('aria-valuenow', '7.5')

  await page.getByRole('button', { name: 'Speichern' }).click()
  await expect(page.getByText('Bewertung gespeichert.')).toBeVisible({ timeout: 15_000 })

  const [w] = await whiskyIdsByPosition(evId)
  const { data } = await serviceClient()
    .from('ratings')
    .select('nose_points, taste_points')
    .eq('whisky_id', w)
    .eq('profile_id', member.id)
    .single()
  expect(Number(data!.nose_points)).toBe(2)
  expect(Number(data!.taste_points)).toBe(7.5)
})

test('0/0: Rückfrage erscheint; „Zurück" speichert nicht, „Ja, speichern" schon', async ({
  page,
}) => {
  const evId = await runningEvent('zero', 1)
  await login(page, member.email)
  await openBewerten(page, evId)

  await page.getByRole('button', { name: 'Speichern' }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toContainText('Wirklich 0 Nasen- und 0 Gaumenpunkte vergeben?')
  await dialog.getByRole('button', { name: 'Zurück' }).click()
  await expect(dialog).toBeHidden()

  const [w] = await whiskyIdsByPosition(evId)
  const count = async () =>
    (
      await serviceClient()
        .from('ratings')
        .select('id', { count: 'exact', head: true })
        .eq('whisky_id', w)
    ).count
  expect(await count()).toBe(0)

  await page.getByRole('button', { name: 'Speichern' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Ja, speichern' }).click()
  await expect(page.getByText('Bewertung gespeichert.')).toBeVisible({ timeout: 15_000 })
  expect(await count()).toBe(1)
})

test('nur eine Kategorie 0: Speichern ohne Rückfrage', async ({ page }) => {
  const evId = await runningEvent('onezero', 1)
  await login(page, member.email)
  await openBewerten(page, evId)

  await page.getByRole('button', { name: 'Gaumenpunkte erhöhen' }).click()
  await page.getByRole('button', { name: 'Speichern' }).click()
  await expect(page.getByText('Bewertung gespeichert.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
})

test('360 px: Slider und −/+ ohne horizontales Scrollen, Tasten ≥ 44 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  const evId = await runningEvent('mobile', 0.5)
  await login(page, member.email)
  await openBewerten(page, evId)

  for (const name of ['Nasenpunkte erhöhen', 'Gaumenpunkte verringern']) {
    const box = await page.getByRole('button', { name }).boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

// ===========================================================================
// Dashboard & Ergebnisse
// ===========================================================================
test('Dashboard zeigt „Bewertung in halben Punkten" nur bei 0,5er-Tastings', async ({ page }) => {
  await runningEvent('dash', 0.5)
  await addParticipant((await activeId())!, other.id)
  // login() landet bereits auf „/" — kein zusätzliches goto('/'): das kollidiert
  // unter WebKit mit der noch laufenden Navigation („interrupted by another navigation").
  await login(page, other.email)
  await expect(page.getByText('in halben Punkten')).toBeVisible({ timeout: 15_000 })

  await closeAllActiveEvents()
  await runningEvent('dash1', 1)
  await addParticipant((await activeId())!, other.id)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText('Wer ist dabei')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('in halben Punkten')).toHaveCount(0)
})

async function activeId(): Promise<string | null> {
  const { data } = await serviceClient()
    .from('tasting_events')
    .select('id')
    .eq('status', 'active')
    .maybeSingle()
  return (data?.id as string) ?? null
}

test('Rangliste: halbe Punkte mit Komma, ganze ohne Nachkommastelle', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: admin.id,
    location: LOC('ranking'),
    eventDate: '2025-06-14',
  })
  await setStep(evId, 0.5)
  await addParticipant(evId, other.id)
  await addWhiskyAs(other.email, evId, 'Talisker 10')
  const [w] = await whiskyIdsByPosition(evId)
  await insertRatingDirect({ whiskyId: w, eventId: evId, profileId: member.id, nose: 4.5, taste: 8.5 })
  await insertRatingDirect({ whiskyId: w, eventId: evId, profileId: other.id, nose: 5, taste: 8.5 })
  await serviceClient()
    .from('tasting_events')
    .update({
      status: 'closed',
      started_at: new Date(Date.now() - 3_600_000).toISOString(),
      closed_at: new Date().toISOString(),
    })
    .eq('id', evId)

  await login(page, member.email)
  await page.goto(`/tastings/${evId}/ergebnisse`, { waitUntil: 'networkidle' })
  const row = page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem').first()
  await expect(row).toContainText('Nase 9,5 · Gaumen 17')
  await expect(row).toContainText('26,5')
  await row.getByRole('button', { name: /Einzelbewertungen/ }).click()
  await expect(row).toContainText('Nase 4,5 · Gaumen 8,5')
  await expect(row).not.toContainText('17,0')
})

// ===========================================================================
// Admin-Einstellung
// ===========================================================================
test('Event-Formular: „Bewertung in" mit Voreinstellung ganzen Punkten; halbe Punkte werden gespeichert', async ({
  page,
}) => {
  await login(page, admin.email)
  await page.goto('/admin/events/neu', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Tasting anlegen' }).waitFor()

  await expect(page.getByRole('radio', { name: 'ganzen Punkten' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'halben Punkten' })).not.toBeChecked()

  // Bestehendes Entwurfs-Event bearbeiten und auf halbe Punkte umstellen.
  const evId = await createEventDirect({ hostId: member.id, createdBy: admin.id, location: LOC('form') })
  await page.goto(`/admin/events/${evId}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Änderungen speichern' }).waitFor()
  await page.getByRole('radio', { name: 'halben Punkten' }).click()
  await page.getByRole('button', { name: 'Änderungen speichern' }).click()
  await page.waitForURL((u) => new URL(u).pathname === '/admin/events', { timeout: 20_000 })

  const { data } = await serviceClient()
    .from('tasting_events')
    .select('rating_step')
    .eq('id', evId)
    .single()
  expect(Number(data!.rating_step)).toBe(0.5)

  await page.goto(`/admin/events/${evId}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('radio', { name: 'halben Punkten' })).toBeChecked()
})

// ===========================================================================
// Private Sammlung
// ===========================================================================
test('Sammlung: Note 7,5 wählbar und als „7,5/10" angezeigt; 0 bleibt „0/10"', async ({
  page,
}) => {
  await login(page, member.email)
  await page.goto('/profil/sammlung', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Meine Sammlung' }).waitFor()

  for (const [name, option] of [
    ['Caol Ila 12', '7,5 / 10'],
    ['Nullnummer', '0 / 10'],
  ] as const) {
    await page.getByRole('button', { name: 'Neuer Eintrag' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Name').waitFor()
    await fillField(page, 'Name', name)
    await dialog.getByRole('combobox').click()
    await page.getByRole('option', { name: option, exact: true }).click()
    await dialog.getByRole('button', { name: 'Eintragen' }).click()
    await expect(dialog).toBeHidden({ timeout: 15_000 })
  }

  await expect(page.getByText('7,5/10')).toBeVisible()
  await expect(page.getByText('0/10')).toBeVisible()

  const { data } = await serviceClient()
    .from('collection_entries')
    .select('name, rating')
    .eq('profile_id', member.id)
  const byName = new Map((data ?? []).map((r) => [r.name, Number(r.rating)]))
  expect(byName.get('Caol Ila 12')).toBe(7.5)
  expect(byName.get('Nullnummer')).toBe(0)
})
