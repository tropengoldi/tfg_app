/**
 * PROJ-20 · Whisky-Steward: Live-Einblick in Wertungen — E2E.
 *
 * Ein Tasting mit Steward, 10 Teilnehmern (Gastgeber, Anna, Bernd + 7 stille),
 * 3 Whiskies, halbe Punkte. Es darf global nur EIN aktives Tasting geben →
 * seriell; die Fälle „ohne Steward" / „Entwurf" bauen eigene Events.
 */
import { expect, test, type Browser, type Page } from '@playwright/test'

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
const LOC = (tag: string) => `QA20-${STAMP}-${tag}`
const LONG_NOTE = 'Rauchig, Pfeffer, langer Abgang mit Meersalz. '.repeat(5).trim()

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(120_000))

type U = { id: string; email: string }
let admin: U
let host: U
let anna: U
let bernd: U
let steward: U
const silent: U[] = []
let ev = ''
let whiskyIds: string[] = []

/** Whiskies direkt anlegen (spart Anmeldungen gegen das Auth-Ratenlimit). */
async function addWhiskies(eventId: string, broughtBy: string, names: string[]) {
  const svc = serviceClient()
  const ids: string[] = []
  for (const [i, name] of names.entries()) {
    const { data, error } = await svc
      .from('whiskies')
      .insert({ event_id: eventId, position: i + 1 })
      .select('id')
      .single()
    if (error) throw error
    const { error: dErr } = await svc
      .from('whisky_details')
      .insert({ whisky_id: data.id, event_id: eventId, name, brought_by: broughtBy })
    if (dErr) throw dErr
    ids.push(data.id as string)
  }
  return ids
}

async function setName(id: string, name: string) {
  await serviceClient().from('profiles').update({ display_name: name }).eq('id', id)
}

async function pageAs(browser: Browser, user: U, width = 360): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 } })
  const page = await ctx.newPage()
  await login(page, user.email)
  return page
}

async function openControl(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/gastgeber`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Steuern' }).waitFor()
}

/** Die Karte „Wertungen" = die Karte, deren Titel genau so heißt. */
function card(page: Page) {
  return page
    .getByText('Wertungen', { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"bg-card")][1]')
}

function raterRow(page: Page, name: string) {
  return card(page).getByRole('listitem').filter({ hasText: name }).first()
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  admin = await createDisposableAdmin(`a20${STAMP}`)
  host = await createDisposableUser(`h20${STAMP}`)
  anna = await createDisposableUser(`n20${STAMP}`)
  bernd = await createDisposableUser(`b20${STAMP}`)
  steward = await createDisposableUser(`s20${STAMP}`)
  for (let i = 0; i < 7; i++) silent.push(await createDisposableUser(`q20${i}${STAMP}`))
  await setName(host.id, 'Gastgeberin Gerda')
  await setName(anna.id, 'Anna')
  await setName(bernd.id, 'Bernd')
  await setName(steward.id, 'Stewart')

  ev = await createEventDirect({ hostId: host.id, createdBy: admin.id, location: LOC('main') })
  await serviceClient()
    .from('tasting_events')
    .update({ helper_id: steward.id, rating_step: 0.5 })
    .eq('id', ev)
  for (const u of [anna, bernd, ...silent]) await addParticipant(ev, u.id)
  whiskyIds = await addWhiskies(ev, host.id, ['Talisker 10', 'Lagavulin 16', 'Ardbeg Uigeadail'])
}, 180_000)

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA20-${STAMP}-`)
  for (const u of [host, anna, bernd, steward, admin, ...silent]) if (u) await deleteUser(u.id)
})

// ===========================================================================
test('Entwurf: keine Karte „Wertungen" für den Steward', async ({ browser }) => {
  const page = await pageAs(browser, steward)
  await openControl(page, ev)
  await expect(page.getByRole('button', { name: /starten/i }).first()).toBeVisible()
  await expect(card(page)).toHaveCount(0)
  await page.context().close()
})

test('laufend: Karte mit Einzelwertungen, Notiz, „noch offen", 0 Punkten und Durchschnitt', async ({
  browser,
}) => {
  await startEventDirect(ev, 2)
  await insertRatingDirect({ whiskyId: whiskyIds[0], eventId: ev, profileId: anna.id, nose: 4, taste: 7.5, notes: LONG_NOTE })
  await insertRatingDirect({ whiskyId: whiskyIds[1], eventId: ev, profileId: anna.id, nose: 3, taste: 6, notes: 'süß' })
  await insertRatingDirect({ whiskyId: whiskyIds[1], eventId: ev, profileId: bernd.id, nose: 0, taste: 0 })
  await serviceClient().from('winner_tips').insert({ event_id: ev, profile_id: anna.id, whisky_id: whiskyIds[0] })

  const page = await pageAs(browser, steward)
  await openControl(page, ev)
  const c = card(page)
  await expect(c).toBeVisible()
  await expect(c.getByText('Nur du siehst das — bis zum Abschluss.')).toBeVisible()

  // Auswahl: nur 1 und 2 (ausgeschenkt), 2 = aktuell vorausgewählt
  const group = c.getByRole('group', { name: 'Whisky wählen' })
  await expect(group.getByRole('button')).toHaveCount(2)
  await expect(group.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')

  await expect(c.getByText('#2 Lagavulin 16')).toBeVisible()
  await expect(c.getByText('Ø 4,5 · 2 von 10 bewertet')).toBeVisible()
  await expect(raterRow(page, 'Anna')).toContainText('Nase 3 · Gaumen 6 = 9')
  await expect(raterRow(page, 'Anna')).toContainText('„süß“')
  await expect(raterRow(page, 'Bernd')).toContainText('Nase 0 · Gaumen 0 = 0')
  await expect(raterRow(page, 'Gastgeberin Gerda')).toContainText('noch offen')
  // alle 10 Teilnehmer, der Steward selbst nicht
  await expect(c.getByRole('list', { name: 'Wertungen zu Whisky 2' }).getByRole('listitem')).toHaveCount(10)
  await expect(c.getByText('Stewart')).toHaveCount(0)

  // früherer Whisky: halbe Punkte, lange Notiz gekürzt mit „mehr"
  await group.getByRole('button', { name: '1' }).click()
  await expect(c.getByText('#1 Talisker 10')).toBeVisible()
  await expect(raterRow(page, 'Anna')).toContainText('Nase 4 · Gaumen 7,5 = 11,5')
  const more = raterRow(page, 'Anna').getByRole('button', { name: 'mehr' })
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await more.click()
  await expect(raterRow(page, 'Anna').getByRole('button', { name: 'weniger' })).toBeVisible()

  // Sieger-Tipps
  await c.getByText('Sieger-Tipps (1 von 10)').click()
  await expect(c.getByRole('listitem').filter({ hasText: 'Anna' }).last()).toContainText('#1 Talisker 10')
  await expect(c.getByRole('listitem').filter({ hasText: 'Bernd' }).last()).toContainText('kein Tipp')

  // 360 px, 10 Teilnehmer, lange Notiz offen: kein horizontales Scrollen
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(sw).toBeLessThanOrEqual(360)
  await page.context().close()
})

test('Teilnehmer sieht beide Hinweise mit dem Namen des Stewards', async ({ browser }) => {
  const page = await pageAs(browser, anna)
  await page.goto(`/tastings/${ev}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()
  await expect(
    page.getByText('Whisky-Steward Stewart sieht deine Punkte und Notizen bis zum Abschluss.'),
  ).toBeVisible()
  await expect(page.getByText('Whisky-Steward Stewart sieht deinen Tipp.')).toBeVisible()
  const notes = page.getByRole('textbox', { name: /Notiz/ })
  await expect(notes).toHaveAttribute('aria-describedby', 'rating-notes-steward')
  await expect(notes).not.toHaveAttribute('placeholder', /Sieht sonst niemand/)
  await page.context().close()
})

test('Live: Wertung und Tipp erscheinen ohne Neuladen, die Auswahl bleibt; Weiterschalten springt mit', async ({
  browser,
}) => {
  const sp = await pageAs(browser, steward)
  await openControl(sp, ev)
  const c = card(sp)
  const group = c.getByRole('group', { name: 'Whisky wählen' })
  await group.getByRole('button', { name: '1' }).click()
  await expect(c.getByText('#1 Talisker 10')).toBeVisible()
  await sp.waitForTimeout(1500) // Live-Kanal steht

  // Bernd bewertet Whisky 2 über die echte Oberfläche
  const bp = await pageAs(browser, bernd)
  await bp.goto(`/tastings/${ev}/bewerten`, { waitUntil: 'networkidle' })
  await bp.getByRole('heading', { name: 'Bewerten' }).waitFor()
  await bp.getByRole('button', { name: 'Nasenpunkte erhöhen' }).click()
  await bp.getByRole('textbox', { name: /Notiz/ }).fill('frisch vom Handy')
  await bp.getByRole('button', { name: 'Speichern' }).click()
  await expect(bp.getByText('Bewertung gespeichert.')).toBeVisible()

  // Steward: Auswahl bleibt auf 1, Whisky 2 zeigt Bernds neue Wertung
  await expect(group.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')
  await group.getByRole('button', { name: '2' }).click()
  await expect(raterRow(sp, 'Bernd')).toContainText('„frisch vom Handy“', { timeout: 20_000 })
  await group.getByRole('button', { name: '1' }).click()

  // Bernd tippt → erscheint beim Steward, Auswahl bleibt
  await bp.getByRole('combobox').first().click()
  await bp.getByRole('option', { name: 'Whisky 2' }).click()
  await expect(bp.getByText('Tipp gespeichert: Whisky 2')).toBeVisible()
  await c.getByText(/Sieger-Tipps \(\d+ von 10\)/).click()
  await expect(c.getByRole('listitem').filter({ hasText: 'Bernd' }).last()).toContainText(
    '#2 Lagavulin 16',
    { timeout: 20_000 },
  )
  await expect(group.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')

  // Weiterschalten → Auswahl springt auf Whisky 3
  await sp.getByRole('button', { name: /Weiter zu Whisky 3/ }).click()
  await expect(group.getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true', {
    timeout: 20_000,
  })
  await expect(c.getByText('#3 Ardbeg Uigeadail')).toBeVisible()
  await bp.context().close()
  await sp.context().close()
})

test('Admin und Gastgeber sehen keine Karte, nur den Zähler', async ({ browser }) => {
  const ap = await pageAs(browser, admin)
  await openControl(ap, ev)
  await expect(ap.getByText(/haben bewertet/)).toBeVisible()
  await expect(card(ap)).toHaveCount(0)
  await ap.context().close()

  // Gastgeber mit Steward kommt gar nicht in den Steuerbereich (PROJ-11)
  const hp = await pageAs(browser, host)
  await hp.goto(`/tastings/${ev}/gastgeber`, { waitUntil: 'networkidle' })
  await expect(card(hp)).toHaveCount(0)
  await hp.context().close()
})

test('nach dem Abschluss: keine Karte, kein Hinweis', async ({ browser }) => {
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', ev)
  const sp = await pageAs(browser, steward)
  await openControl(sp, ev)
  await expect(sp.getByText(/Der Abend ist abgeschlossen/)).toBeVisible()
  await expect(card(sp)).toHaveCount(0)
  await sp.context().close()

  const ap = await pageAs(browser, anna)
  await ap.goto(`/tastings/${ev}/bewerten`, { waitUntil: 'networkidle' })
  await expect(ap.getByText(/eingefroren/).first()).toBeVisible()
  await expect(ap.getByText(/sieht deine Punkte und Notizen/)).toHaveCount(0)
  await expect(ap.getByText(/sieht deinen Tipp/)).toHaveCount(0)
  await ap.context().close()
})

test('Tasting ohne Steward: kein Hinweis, Gastgeber ohne Karte', async ({ browser }) => {
  const ev2 = await createEventDirect({ hostId: host.id, createdBy: admin.id, location: LOC('nosteward') })
  await addParticipant(ev2, anna.id)
  await addWhiskies(ev2, host.id, ['Oban 14'])
  await startEventDirect(ev2, 1)

  const ap = await pageAs(browser, anna)
  await ap.goto(`/tastings/${ev2}/bewerten`, { waitUntil: 'networkidle' })
  await ap.getByRole('heading', { name: 'Bewerten' }).waitFor()
  await expect(ap.getByText(/sieht deine Punkte und Notizen/)).toHaveCount(0)
  await expect(ap.getByText(/sieht deinen Tipp/)).toHaveCount(0)
  await expect(ap.getByRole('textbox', { name: /Notiz/ })).toHaveAttribute(
    'placeholder',
    /Sieht sonst niemand/,
  )
  await ap.context().close()

  const hp = await pageAs(browser, host)
  await openControl(hp, ev2)
  await expect(hp.getByText(/haben bewertet/)).toBeVisible()
  await expect(card(hp)).toHaveCount(0)
  await hp.context().close()
  await closeAllActiveEvents()
})
