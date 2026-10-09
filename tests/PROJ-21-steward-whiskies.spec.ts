/**
 * PROJ-21 · Whisky-Steward bringt Whiskies mit — E2E.
 *
 * Ein Abend im Entwurf (Limit 1) mit Steward; der Steward trägt über die Oberfläche ein.
 * Seriell, weil später ein Tasting gestartet und abgeschlossen wird (global nur EIN aktives).
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
  insertRatingDirect,
  login,
  serviceClient,
  startEventDirect,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA21-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(120_000))

type U = { id: string; email: string }
let admin: U
let host: U
let pa: U
let steward: U
let steward2: U
let ev = ''

async function setName(id: string, name: string) {
  await serviceClient().from('profiles').update({ display_name: name }).eq('id', id)
}

function stat(page: Page, label: string) {
  return page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd[1]')
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  test.setTimeout(180_000)
  admin = await createDisposableAdmin(`a21${STAMP}`)
  host = await createDisposableUser(`h21${STAMP}`)
  pa = await createDisposableUser(`p21${STAMP}`)
  steward = await createDisposableUser(`s21${STAMP}`)
  steward2 = await createDisposableUser(`t21${STAMP}`)
  await setName(host.id, 'Gastgeberin Gerda')
  await setName(pa.id, 'Anna')
  await setName(steward.id, 'Stewart')
  await setName(steward2.id, 'Zweitsteward')

  ev = await createEventDirect({
    hostId: host.id,
    createdBy: admin.id,
    location: LOC('main'),
    maxWhiskies: 1,
  })
  await serviceClient().from('tasting_events').update({ helper_id: steward.id }).eq('id', ev)
  await addParticipant(ev, pa.id)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA21-${STAMP}-`)
  for (const u of [host, pa, steward, steward2, admin]) if (u) await deleteUser(u.id)
})

// ===========================================================================
test('Dashboard: Steward sieht „Nächster Abend" mit „Meine Whiskys"', async ({ page }) => {
  await login(page, steward.email)
  await expect(page.getByText(new RegExp(`Nächster Abend.*${LOC('main')}`))).toBeVisible()
  await expect(page.getByRole('link', { name: 'Meine Whiskys' })).toHaveAttribute(
    'href',
    `/tastings/${ev}/whiskies`,
  )
})

test('Steward trägt über „Meine Tastings" einen Whisky ein; das Limit gilt ohne Bonus', async ({
  page,
}) => {
  await login(page, steward.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  const row = page.locator('li', { hasText: LOC('main') })
  await expect(row.getByRole('link', { name: 'Steuern' })).toBeVisible()
  await row.getByRole('link', { name: 'Meine Whiskys' }).click()
  await page.waitForURL(`**/tastings/${ev}/whiskies`)

  await expect(page.getByText('Trag ein, was du mitbringst — sieht außer dir niemand.')).toBeVisible()
  await page.getByRole('button', { name: /Whisky hinzufügen/ }).first().click()
  await expect(page.getByText('Außer dir sieht das niemand — bis der Abend abgeschlossen ist.')).toBeVisible()
  await page.getByRole('textbox', { name: 'Name' }).fill('Springbank 10')
  await page.getByRole('button', { name: 'Eintragen' }).click()
  await expect(page.getByText('Whisky eingetragen.')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Meine Whiskys' })).toContainText('Springbank 10')

  // Limit 1, kein Gastgeber-Bonus → erreicht
  await expect(page.getByText(/Dein Limit für diesen Abend ist erreicht \(1 Whisky\)/)).toBeVisible()
  await expect(page.getByRole('button', { name: /Whisky hinzufügen/ }).first()).toBeDisabled()
})

test('Teilnehmer: Hinweis „sieht außer dir nur der Whisky-Steward"', async ({ page }) => {
  await login(page, pa.email)
  await page.goto(`/tastings/${ev}/whiskies`, { waitUntil: 'networkidle' })
  await expect(
    page.getByText('Trag ein, was du mitbringst — sieht außer dir nur der Whisky-Steward.'),
  ).toBeVisible()
})

test('Abend ohne Steward: Hinweis bleibt „nur der Gastgeber"', async ({ page }) => {
  const ev2 = await createEventDirect({ hostId: host.id, createdBy: admin.id, location: LOC('plain') })
  await addParticipant(ev2, pa.id)
  await login(page, pa.email)
  await page.goto(`/tastings/${ev2}/whiskies`, { waitUntil: 'networkidle' })
  await expect(
    page.getByText('Trag ein, was du mitbringst — sieht außer dir nur der Gastgeber.'),
  ).toBeVisible()
})

test('Außenstehender bekommt „Meine Whiskys" des Abends nicht', async ({ page }) => {
  await login(page, steward2.email)
  await page.goto(`/tastings/${ev}/whiskies`, { waitUntil: 'networkidle' })
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Whisky hinzufügen/ })).toHaveCount(0)
})

test('Admin: Steward-Wechsel wird abgelehnt, solange der Steward Whiskies eingetragen hat', async ({
  page,
}) => {
  await login(page, admin.email)
  await page.goto(`/admin/events/${ev}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Änderungen speichern' }).waitFor()
  await expect(
    page.getByText('Gilt auch für den Whisky-Steward; der Gastgeber darf einen mehr.', { exact: false }),
  ).toBeVisible()
  await page.getByLabel('Whisky-Steward (optional)').click()
  await page.getByRole('option', { name: 'Zweitsteward' }).click()
  await page.getByRole('button', { name: 'Änderungen speichern' }).click()
  await expect(
    page.getByRole('main').getByText(/Der bisherige Whisky-Steward hat schon Whiskies eingetragen/),
  ).toBeVisible()
  const { data } = await serviceClient().from('tasting_events').select('helper_id').eq('id', ev).single()
  expect(data?.helper_id).toBe(steward.id)
})

test('nach dem Abschluss: Rangliste „mitgebracht von Stewart"; Bilanz zählt mitgebracht, nicht Tastings', async ({
  browser,
}) => {
  // Ausschank: Gastgeber bringt auch einen, damit es eine Rangliste gibt
  const svc = serviceClient()
  const { data: w } = await svc.from('whiskies').insert({ event_id: ev, position: 2 }).select('id').single()
  await svc.from('whisky_details').insert({ whisky_id: w!.id, event_id: ev, name: 'Oban 14', brought_by: host.id })
  await startEventDirect(ev, 2)
  const { data: rows } = await svc.from('whiskies').select('id, position').eq('event_id', ev).order('position')
  const stewardWhisky = rows!.find((r) => r.position === 1)!.id as string
  await insertRatingDirect({ whiskyId: stewardWhisky, eventId: ev, profileId: pa.id, nose: 5, taste: 9 })
  await insertRatingDirect({ whiskyId: w!.id as string, eventId: ev, profileId: pa.id, nose: 2, taste: 4 })
  await svc.from('tasting_events').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', ev)

  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await login(page, pa.email)
  await page.goto(`/tastings/${ev}/ergebnisse`, { waitUntil: 'networkidle' })
  const winner = page.getByRole('listitem').filter({ hasText: 'Springbank 10' }).first()
  await expect(winner).toContainText('mitgebracht von Stewart')
  await ctx.close()

  const sctx = await browser.newContext()
  const sp = await sctx.newPage()
  await login(sp, steward.email)
  await sp.goto('/profil', { waitUntil: 'networkidle' })
  await expect(stat(sp, 'Mitgebrachte Whiskys')).toHaveText('1')
  await expect(stat(sp, 'Tastings')).toHaveText('0')
  await expect(stat(sp, 'Beste Platzierung')).toContainText('1.')
  await sctx.close()
})
