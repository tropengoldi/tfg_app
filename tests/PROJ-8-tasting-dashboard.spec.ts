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
  login,
  serviceClient,
  startEventDirect,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA8-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
let member: { id: string; email: string }
/** Ein Nutzer ohne jedes Event — für die „nichts läuft"-Fälle. */
let loner: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  member = await createDisposableUser(`d8m${STAMP}`, { active: true })
  loner = await createDisposableUser(`d8l${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA8-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (loner) await deleteUser(loner.id)
})

async function activeEvent(tag: string, n: number, position: number) {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC(tag),
  })
  for (let i = 1; i <= n; i++) await addWhiskyAs(member.email, evId, `${tag}-W${i}`)
  await startEventDirect(evId, position)
  return evId
}

async function openDashboard(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)
}

function glasses(page: Page) {
  return page.getByRole('list', { name: 'Whisky-Fortschritt' }).getByRole('listitem')
}

// ===========================================================================
test('kein Tasting: „Gerade läuft kein Tasting."', async ({ page }) => {
  await closeAllActiveEvents()
  await login(page, loner.email)
  await openDashboard(page)
  await expect(page.getByText('Gerade läuft kein Tasting.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vergangene Tastings' })).toBeVisible()
})

test('bevorstehendes Draft-Event: Vorschau-Karte', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: adminId,
    createdBy: adminId,
    location: LOC('preview'),
    eventDate: '2099-12-24',
  })
  await addParticipant(evId, loner.id)
  await login(page, loner.email)
  await openDashboard(page)
  await expect(page.getByText(new RegExp(`Nächster Abend.*${LOC('preview')}`))).toBeVisible()
  await expect(page.getByRole('link', { name: 'Meine Whiskys' })).toBeVisible()
})

test('Nicht-Teilnehmer eines laufenden Events sieht „kein Tasting"', async ({ page }) => {
  await activeEvent('hidden', 3, 1)
  await login(page, loner.email)
  await openDashboard(page)
  await expect(page.getByText('Gerade läuft kein Tasting.')).toBeVisible()
  await expect(glasses(page)).toHaveCount(0)
})

test.describe('Laufendes Event', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'ein globales aktives Event → nur Chromium')
  test.beforeAll(async () => {
    if (hasServiceClient) await closeAllActiveEvents()
  })

  test('Dashboard zeigt Gläserstreifen, Fortschritt und Absprünge', async ({ page }) => {
    await activeEvent('board', 4, 2)
    await login(page, member.email)
    await openDashboard(page)

    await expect(glasses(page)).toHaveCount(4)
    await expect(page.getByText('Whisky 2 von 4')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jetzt bewerten' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Steuern' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Meine Whiskys' })).toBeVisible()
    // Teilnehmerliste mit markiertem Gastgeber
    await expect(page.getByText('Wer ist dabei', { exact: false })).toBeVisible()
    await expect(page.getByText('Gastgeber', { exact: true })).toBeVisible()
  })

  test('Live: Weiterschalten aktualisiert den Streifen ohne Neuladen', async ({ page }) => {
    const evId = await activeEvent('live', 3, 1)
    await login(page, member.email)
    await openDashboard(page)
    await expect(page.getByText('Whisky 1 von 3')).toBeVisible()

    // Weiterschalten „von außen" (out of band) — löst ein Realtime-Ereignis aus.
    await serviceClient()
      .from('tasting_events')
      .update({ current_position: 2 })
      .eq('id', evId)

    await expect(page.getByText('Whisky 2 von 3')).toBeVisible({ timeout: 20_000 })
  })

  test('Live: Abschluss wechselt in den Abschluss-Zustand', async ({ page }) => {
    const evId = await activeEvent('close', 2, 2)
    await login(page, member.email)
    await openDashboard(page)
    await expect(page.getByText('Whisky 2 von 2')).toBeVisible()

    await serviceClient()
      .from('tasting_events')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', evId)

    await expect(page.getByText('Der Abend ist abgeschlossen.')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('link', { name: 'Zur Rangliste' })).toBeVisible()
  })

  test('Live: die Bewertungsansicht zieht beim Weiterschalten mit', async ({ page }) => {
    const evId = await activeEvent('rate', 3, 1)
    await login(page, member.email)
    await page.goto(`/tastings/${evId}/bewerten`, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
    await expect(page.getByText('Whisky 1 von 3')).toBeVisible()

    await serviceClient()
      .from('tasting_events')
      .update({ current_position: 2 })
      .eq('id', evId)

    await expect(page.getByText('Whisky 2 von 3')).toBeVisible({ timeout: 20_000 })
  })

  test('abgeschlossenes Event (frisch): Gläser leer, „Zur Rangliste"', async ({ page }) => {
    const evId = await activeEvent('done', 3, 3)
    await serviceClient()
      .from('tasting_events')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', evId)
    await login(page, member.email)
    await openDashboard(page)
    await expect(page.getByText('Der Abend ist abgeschlossen.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Zur Rangliste' })).toBeVisible()
    await expect(glasses(page)).toHaveCount(3)
  })
})
