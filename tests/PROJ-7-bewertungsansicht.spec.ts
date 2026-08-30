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
  logout,
  serviceClient,
  startEventDirect,
  whiskyIdsByPosition,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA7-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

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
  member = await createDisposableUser(`r7m${STAMP}`, { active: true })
  other = await createDisposableUser(`r7o${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA7-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (other) await deleteUser(other.id)
})

/** Draft-Event mit `n` Whiskys, dann direkt auf „läuft" bei `position`. */
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

async function openBewerten(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
  await page.waitForTimeout(400)
}

function positionBtn(page: Page, n: number) {
  return page
    .getByRole('list', { name: 'Whisky-Positionen' })
    .getByRole('button', { name: new RegExp(`^Whisky ${n}(,|$)`) })
}

// ===========================================================================
test('Nicht-Teilnehmer bekommt „Seite nicht gefunden"', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('forbidden'),
  })
  await login(page, other.email)
  await page.goto(`/tastings/${evId}/bewerten`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Event „In Vorbereitung": Hinweis „hat noch nicht begonnen"', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('draft'),
  })
  await login(page, member.email)
  await openBewerten(page, evId)
  await expect(page.getByText('Der Abend hat noch nicht begonnen.')).toBeVisible()
  await expect(page.getByRole('slider')).toHaveCount(0)
})

test.describe('Laufendes Event', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'ein globales aktives Event → nur Chromium')
  test.beforeAll(async () => {
    if (hasServiceClient) await closeAllActiveEvents()
  })

  test('„Tastings"-Zeile führt bei laufendem Event auf /bewerten', async ({ page }) => {
    const evId = await activeEvent('row', 3, 1)
    await login(page, member.email)
    await page.goto('/tastings', { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const rowLoc = page.getByRole('listitem').filter({ hasText: LOC('row') })
    await expect(rowLoc.getByRole('link', { name: 'Whiskys' })).toBeVisible({ timeout: 15_000 })
    await rowLoc.getByRole('link', { name: new RegExp(LOC('row')) }).first().click()
    await expect(page).toHaveURL(new RegExp(`/tastings/${evId}/bewerten$`), { timeout: 15_000 })
  })

  test('aktuellen Whisky bewerten und speichern → Haken', async ({ page }) => {
    const evId = await activeEvent('save', 3, 1)
    await login(page, member.email)
    await openBewerten(page, evId)

    await expect(page.getByText('Noch nicht bewertet.')).toBeVisible()
    const sliders = page.getByRole('slider')
    await sliders.first().focus()
    await sliders.first().press('ArrowRight')
    await sliders.nth(1).focus()
    await sliders.nth(1).press('ArrowRight')
    await sliders.nth(1).press('ArrowRight')

    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Bewertung gespeichert.')).toBeVisible({ timeout: 15_000 })

    await openBewerten(page, evId)
    await expect(positionBtn(page, 1)).toHaveAccessibleName(/bewertet/, { timeout: 15_000 })
    await expect(page.getByText('Gespeichert', { exact: false })).toBeVisible()
  })

  test('gespeicherte Bewertung erneut öffnen → Werte stehen', async ({ page }) => {
    const evId = await activeEvent('reopen', 2, 1)
    const [w1] = await whiskyIdsByPosition(evId)
    await insertRatingDirect({
      whiskyId: w1,
      eventId: evId,
      profileId: member.id,
      nose: 4,
      taste: 8,
    })
    await login(page, member.email)
    await openBewerten(page, evId)
    await expect(page.getByText('4', { exact: true })).toBeVisible()
    await expect(page.getByText('8', { exact: true })).toBeVisible()
    await expect(page.getByText('Gespeichert', { exact: false })).toBeVisible()
  })

  test('Positionsleiste: nicht ausgeschenkte Position ist nicht anklickbar', async ({ page }) => {
    const evId = await activeEvent('bar', 4, 2)
    await login(page, member.email)
    await openBewerten(page, evId)
    await expect(positionBtn(page, 1)).toBeEnabled()
    await expect(positionBtn(page, 2)).toBeEnabled()
    await expect(positionBtn(page, 3)).toBeDisabled()
    await expect(positionBtn(page, 4)).toBeDisabled()
  })

  test('zu einer früheren Position springen und zurück zum aktuellen', async ({ page }) => {
    const evId = await activeEvent('nav', 3, 3)
    await login(page, member.email)
    await openBewerten(page, evId)

    await positionBtn(page, 1).click()
    await expect(page.getByText('Whisky 1 von 3')).toBeVisible()
    await expect(page.getByText('Du siehst Whisky 1 — aktuell ist Whisky 3.')).toBeVisible()
    await page.getByRole('button', { name: 'Zum aktuellen Whisky' }).click()
    await expect(page.getByText('Whisky 3 von 3')).toBeVisible()
  })

  test('ungespeicherter Positionswechsel zeigt den Dialog', async ({ page }) => {
    const evId = await activeEvent('dirty', 3, 3)
    await login(page, member.email)
    await openBewerten(page, evId)

    await page.getByRole('slider').first().focus()
    await page.getByRole('slider').first().press('ArrowRight')

    await positionBtn(page, 1).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('Nicht gespeicherte Bewertung')
    await dialog.getByRole('button', { name: 'Hier bleiben' }).click()
    await expect(page.getByText('Whisky 3 von 3')).toBeVisible()

    await positionBtn(page, 1).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Wechseln' }).click()
    await expect(page.getByText('Whisky 1 von 3')).toBeVisible()
  })

  test('Blindheit: ein anderer Teilnehmer sieht die fremden Werte nicht', async ({ page }) => {
    const evId = await activeEvent('blind', 3, 1)
    await addParticipant(evId, other.id)
    const [w1] = await whiskyIdsByPosition(evId)
    await insertRatingDirect({
      whiskyId: w1,
      eventId: evId,
      profileId: member.id,
      nose: 5,
      taste: 9,
    })
    await login(page, other.email)
    await openBewerten(page, evId)
    // other sieht Standardwerte, keinen Haken bei Position 1
    await expect(page.getByText('Noch nicht bewertet.')).toBeVisible()
    await expect(positionBtn(page, 1)).not.toHaveAccessibleName(/bewertet/)
  })

  test('abgeschlossenes Event: eingefroren, nur Anzeige', async ({ page }) => {
    const evId = await activeEvent('closed', 2, 1)
    const [w1] = await whiskyIdsByPosition(evId)
    await insertRatingDirect({
      whiskyId: w1,
      eventId: evId,
      profileId: member.id,
      nose: 3,
      taste: 6,
    })
    await serviceClient()
      .from('tasting_events')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', evId)

    await login(page, member.email)
    await openBewerten(page, evId)
    await expect(page.getByText('Bewertungen sind eingefroren.', { exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Speichern' })).toHaveCount(0)
    await expect(page.getByRole('slider').first()).toHaveAttribute('data-disabled')
  })
})
