/**
 * PROJ-23 · Vergleichs-Merker — E2E.
 *
 * Ein laufendes Tasting mit 10 Whiskies. Seriell, weil global nur EIN aktives Tasting existiert.
 */
import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  closeAllActiveEvents,
  createDisposableAdmin,
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
const LOC = (tag: string) => `QA23-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(120_000))

type U = { id: string; email: string }
let admin: U
let host: U
let pa: U
let ev = ''

async function setPosition(position: number) {
  await serviceClient().from('tasting_events').update({ current_position: position }).eq('id', ev)
}

async function openRating(page: Page) {
  await page.goto(`/tastings/${ev}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
}

const marker = (page: Page) => page.getByRole('group', { name: 'Vergleichen mit' })
const markBtn = (page: Page, n: number) => marker(page).getByRole('button', { name: `Whisky ${n}`, exact: true })
/** Tippen und warten, bis gespeichert ist (Knöpfe sind während des Speicherns gesperrt). */
async function tap(page: Page, n: number) {
  await markBtn(page, n).click()
  await expect(marker(page).getByRole('button').first()).toBeEnabled({ timeout: 15_000 })
}
const goTo = (page: Page, n: number) =>
  page.getByRole('list', { name: 'Whisky-Positionen' }).getByRole('button', { name: new RegExp(`^Whisky ${n}(,|$)`) }).click()

test.beforeAll(async () => {
  if (!hasServiceClient) return
  test.setTimeout(180_000)
  admin = await createDisposableAdmin(`a23${STAMP}`)
  host = await createDisposableUser(`h23${STAMP}`)
  pa = await createDisposableUser(`p23${STAMP}`)
  ev = await createEventDirect({ hostId: host.id, createdBy: admin.id, location: LOC('main') })
  await addParticipant(ev, pa.id)
  const svc = serviceClient()
  for (let i = 1; i <= 10; i++) {
    const { data } = await svc.from('whiskies').insert({ event_id: ev, position: i }).select('id').single()
    await svc.from('whisky_details').insert({ whisky_id: data!.id, event_id: ev, name: `W${i}`, brought_by: host.id })
  }
  await startEventDirect(ev, 1)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA23-${STAMP}-`)
  for (const u of [host, pa, admin]) if (u) await deleteUser(u.id)
})

// ===========================================================================
test('nur Whisky 1 ausgeschenkt: Hinweis statt Knöpfe', async ({ page }) => {
  await login(page, pa.email)
  await openRating(page)
  await expect(page.getByRole('heading', { name: 'Vergleichen mit' })).toBeVisible()
  await expect(page.getByText('… sobald weitere Whiskies ausgeschenkt sind.')).toBeVisible()
  await expect(marker(page)).toHaveCount(0)
})

test('Live: Weiterschalten macht neue Whiskies ohne Neuladen wählbar', async ({ page }) => {
  await login(page, pa.email)
  await openRating(page)
  await page.waitForTimeout(1500) // Live-Kanal steht
  await setPosition(4)
  await expect(marker(page).getByRole('button')).toHaveCount(3, { timeout: 20_000 })
  for (const n of [1, 2, 3]) await expect(markBtn(page, n)).toBeVisible()
})

test('Gruppe bilden, erweitern, bei allen Whiskies sehen, nach Neuladen noch da', async ({ page }) => {
  await setPosition(7)
  await login(page, pa.email)
  await openRating(page)

  // bei Whisky 7: 2 und 5
  await tap(page, 2)
  await expect(page.getByText('In Gruppe mit 2', { exact: true })).toBeVisible()
  await tap(page, 5)
  await expect(page.getByText('In Gruppe mit 2 und 5')).toBeVisible()
  await expect(markBtn(page, 2)).toHaveAttribute('aria-pressed', 'true')
  await expect(markBtn(page, 3)).toHaveAttribute('aria-pressed', 'false')

  // bei Whisky 2: 5 und 7 markiert
  await goTo(page, 2)
  await expect(page.getByText('In Gruppe mit 5 und 7')).toBeVisible()
  await expect(markBtn(page, 7)).toHaveAttribute('aria-pressed', 'true')

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByText('In Gruppe mit 2 und 5')).toBeVisible()
})

test('verschmelzen, herausnehmen, auflösen', async ({ page }) => {
  await login(page, pa.email)
  await openRating(page)
  // bei Whisky 3: 5 antippen → 2·3·5·7
  await goTo(page, 3)
  await tap(page, 5)
  await expect(page.getByText('In Gruppe mit 2, 5 und 7')).toBeVisible()
  // bei 3 die 7 herausnehmen → 2·3·5
  await tap(page, 7)
  await expect(page.getByText('In Gruppe mit 2 und 5')).toBeVisible()
  // bei 7: nichts mehr
  await goTo(page, 7)
  await expect(page.getByText(/^In Gruppe mit/)).toHaveCount(0)
  await expect(page.getByText('Nur du siehst das.', { exact: false })).toBeVisible()
  // bei 3: 2 und 5 herausnehmen → Gruppe aufgelöst
  await goTo(page, 3)
  await tap(page, 2)
  await expect(page.getByText('In Gruppe mit 5', { exact: true })).toBeVisible()
  await tap(page, 5)
  await expect(page.getByText(/^In Gruppe mit/)).toHaveCount(0)
  await goTo(page, 5)
  await expect(page.getByText(/^In Gruppe mit/)).toHaveCount(0)
})

test('eine ungespeicherte Bewertung bleibt beim Merken unberührt', async ({ page }) => {
  await login(page, pa.email)
  await openRating(page)
  await page.getByRole('button', { name: 'Nasenpunkte erhöhen' }).click()
  await page.getByRole('button', { name: 'Nasenpunkte erhöhen' }).click()
  await expect(page.getByRole('slider', { name: 'Nasenpunkte' })).toHaveAttribute('aria-valuenow', '2')
  await tap(page, 1)
  await expect(page.getByText('In Gruppe mit 1', { exact: true })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Nasenpunkte' })).toHaveAttribute('aria-valuenow', '2')
  await expect(page.getByText('Bewertung gespeichert.')).toHaveCount(0)
  // aufräumen
  await tap(page, 1)
  await expect(page.getByText(/^In Gruppe mit/)).toHaveCount(0)
})

test('ohne Verbindung: Knopf springt zurück, Meldung, Seite bleibt bedienbar', async ({ page, context }) => {
  await login(page, pa.email)
  await openRating(page)
  await context.setOffline(true)
  await markBtn(page, 4).click()
  await expect(page.getByText('Verbindung fehlgeschlagen — Merker nicht gespeichert.')).toBeVisible()
  await expect(markBtn(page, 4)).toHaveAttribute('aria-pressed', 'false')
  await context.setOffline(false)
  await tap(page, 4)
  await expect(page.getByText('In Gruppe mit 4', { exact: true })).toBeVisible()
})

test('10 Whiskies, 360 px: 9 Knöpfe ohne horizontales Scrollen', async ({ browser }) => {
  await setPosition(10)
  const ctx = await browser.newContext({ viewport: { width: 360, height: 900 } })
  const page = await ctx.newPage()
  await login(page, pa.email)
  await openRating(page)
  await expect(marker(page).getByRole('button')).toHaveCount(9)
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(sw).toBeLessThanOrEqual(360)
  await ctx.close()
})

test('nach dem Abschluss: keine Merker mehr', async ({ page }) => {
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', ev)
  const { count } = await serviceClient()
    .from('compare_marks')
    .select('whisky_id', { count: 'exact', head: true })
    .eq('event_id', ev)
  expect(count).toBe(0)
  await login(page, pa.email)
  await openRating(page)
  await expect(page.getByText(/eingefroren/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vergleichen mit' })).toHaveCount(0)
})
