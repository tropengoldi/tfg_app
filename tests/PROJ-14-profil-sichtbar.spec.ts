import { expect, test, type Page } from '@playwright/test'

import {
  ADMIN_EMAIL,
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
  setActive,
  whiskyIdsByPosition,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA14-${STAMP}-${tag}`
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
/** Wird von `viewer` besucht; bringt einen Whisky, bekommt eine Bewertung. */
let owner: { id: string; email: string }
/** Besucht fremde Profile. */
let viewer: { id: string; email: string }
/** Hostet ein abgeschlossenes Event, wird danach deaktiviert. */
let formerHost: { id: string; email: string }
/** Testet ausschliesslich die eigenen Sichtbarkeits-Schalter. */
let switcher: { id: string; email: string }

let ev1 = '' // geschlossen, owner bringt einen Whisky, viewer bewertet ihn
let ev2 = '' // 'active', damit die Dashboard-Teilnehmerliste einen Namen zeigt
let ev3 = '' // geschlossen, formerHost ist Gastgeber

async function closeEvent(eventId: string) {
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({
      status: 'closed',
      started_at: new Date(Date.now() - 3_600_000).toISOString(),
      closed_at: new Date().toISOString(),
    })
    .eq('id', eventId)
  if (error) throw error
}

type VisibilityColumn =
  | 'show_favorite_dram'
  | 'show_favorite_region'
  | 'show_bio'
  | 'show_tasting_count'
  | 'show_whisky_count'
  | 'show_best_placement'
  | 'show_avg_points'

async function setVisibility(userId: string, patch: Partial<Record<VisibilityColumn, boolean>>) {
  const { error } = await serviceClient().from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}

async function readVisibility(userId: string, column: VisibilityColumn): Promise<boolean> {
  const { data } = await serviceClient().from('profiles').select('*').eq('id', userId).single()
  return (data as unknown as Record<string, boolean>)[column]
}

/** Der <dd>-Wert neben einem <dt> (Stammdaten- und Bilanz-Karten teilen die Struktur). */
function field(page: Page, label: string) {
  return page
    .locator('dt', { hasText: label })
    .locator('xpath=following-sibling::dd[1]')
    .first()
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()

  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id

  owner = await createDisposableUser(`r14o${STAMP}`, { active: true })
  viewer = await createDisposableUser(`r14v${STAMP}`, { active: true })
  formerHost = await createDisposableUser(`r14h${STAMP}`, { active: true })
  switcher = await createDisposableUser(`r14s${STAMP}`, { active: true })

  const { error: stammdatenErr } = await serviceClient()
    .from('profiles')
    .update({
      bio: 'Torfliebhaber seit Jahren.',
      favorite_dram: 'Lagavulin 16',
      favorite_region: 'Islay',
    })
    .eq('id', owner.id)
  if (stammdatenErr) throw stammdatenErr

  // ev1: owner bringt einen Whisky, viewer bewertet ihn → Bilanz hat Inhalt.
  ev1 = await createEventDirect({
    hostId: owner.id,
    createdBy: adminId,
    location: LOC('ev1'),
    eventDate: '2025-05-01',
  })
  await addWhiskyAs(owner.email, ev1, 'Owner Dram')
  const w1 = await whiskyIdsByPosition(ev1)
  await insertRatingDirect({
    whiskyId: w1[0],
    eventId: ev1,
    profileId: viewer.id,
    nose: 4,
    taste: 7,
  })
  await closeEvent(ev1)

  // ev3: formerHost hostet, danach deaktiviert.
  ev3 = await createEventDirect({
    hostId: formerHost.id,
    createdBy: adminId,
    location: LOC('ev3'),
    eventDate: '2025-04-01',
  })
  await closeEvent(ev3)
  await setActive(formerHost.id, false)

  // ev2: aktives Event, damit die Dashboard-Teilnehmerliste einen Namen zeigt.
  ev2 = await createEventDirect({
    hostId: owner.id,
    createdBy: adminId,
    location: LOC('ev2'),
    status: 'active',
    eventDate: '2026-12-24',
  })
  await addParticipant(ev2, viewer.id)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA14-${STAMP}-`)
  if (owner) await deleteUser(owner.id)
  if (viewer) await deleteUser(viewer.id)
  if (formerHost) await deleteUser(formerHost.id)
  if (switcher) await deleteUser(switcher.id)
})

// ===========================================================================
// Fremdes Profil ansehen
// ===========================================================================

test('Ergebnisliste: „mitgebracht von" führt zum Profil des Bringers', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto(`/tastings/${ev1}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await page.getByRole('link', { name: /QA r14o/ }).first().click()
  await expect(page).toHaveURL(new RegExp(`/profil/${owner.id}`))
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`QA r14o${STAMP}`)
})

test('Sichtbare Felder erscheinen, Bilanz zeigt echte Werte', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(field(page, 'Lieblings-Dram')).toHaveText('Lagavulin 16')
  await expect(field(page, 'Lieblingsregion')).toHaveText('Islay')
  await expect(page.getByText('Torfliebhaber seit Jahren.')).toBeVisible()

  await expect(field(page, 'Tastings')).toHaveText('1')
  await expect(field(page, 'Mitgebrachte Whiskys')).toHaveText('1')
  await expect(field(page, 'Beste Platzierung')).toContainText('1. Platz')
  await expect(field(page, 'Ø vergebene Punkte')).toHaveText('—')
})

test('Verborgenes Feld fehlt komplett, andere bleiben sichtbar', async ({ page }) => {
  await setVisibility(owner.id, { show_bio: false })

  await login(page, viewer.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(page.getByText('Torfliebhaber seit Jahren.')).not.toBeVisible()
  await expect(field(page, 'Lieblings-Dram')).toHaveText('Lagavulin 16')

  await setVisibility(owner.id, { show_bio: true })
})

test('Alle Felder verborgen → nur der Anzeigename', async ({ page }) => {
  await setVisibility(owner.id, {
    show_favorite_dram: false,
    show_favorite_region: false,
    show_bio: false,
    show_tasting_count: false,
    show_whisky_count: false,
    show_best_placement: false,
    show_avg_points: false,
  })

  await login(page, viewer.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(page.getByRole('heading', { level: 1 })).toContainText(`QA r14o${STAMP}`)
  await expect(page.getByText('Lieblings-Dram')).not.toBeVisible()
  await expect(page.getByText('Bilanz', { exact: true })).not.toBeVisible()

  await setVisibility(owner.id, {
    show_favorite_dram: true,
    show_favorite_region: true,
    show_bio: true,
    show_tasting_count: true,
    show_whisky_count: true,
    show_best_placement: true,
    show_avg_points: true,
  })
})

test('Ganz neues Mitglied ohne Historie wird fremd besucht: 0/— ohne den Eigenansicht-Hinweistext', async ({
  page,
}) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${switcher.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(field(page, 'Tastings')).toHaveText('0')
  await expect(field(page, 'Ø vergebene Punkte')).toHaveText('—')
  await expect(page.getByText(/füllt sich/i)).not.toBeVisible()
})

test('Admin sieht ein fremdes Profil genauso eingeschränkt wie jedes Mitglied', async ({
  page,
}) => {
  await setVisibility(owner.id, { show_favorite_dram: false })

  await login(page, ADMIN_EMAIL)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  await expect(page.getByText('Lieblings-Dram')).not.toBeVisible()
  await expect(field(page, 'Lieblingsregion')).toHaveText('Islay')

  await setVisibility(owner.id, { show_favorite_dram: true })
})

test('Der eigene Name führt zur bearbeitbaren Profilseite, nicht zur Fremdansicht', async ({
  page,
}) => {
  await login(page, owner.email)
  await page.goto(`/profil/${owner.id}`, { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/profil$/)
})

test('Unbekannte Profil-ID → „Seite nicht gefunden“', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto(`/profil/${UNKNOWN_ID}`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Deaktiviertes Mitglied: Profil über den Historie-Link weiterhin aufrufbar', async ({
  page,
}) => {
  await login(page, viewer.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  const row = page
    .getByRole('list', { name: 'Vergangene Tastings' })
    .getByRole('listitem')
    .filter({ hasText: LOC('ev3') })
  await expect(row).toBeVisible()

  await row.getByRole('link', { name: /QA r14h/ }).click()
  await expect(page).toHaveURL(new RegExp(`/profil/${formerHost.id}`))
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`QA r14h${STAMP}`)
})

test('Dashboard-Teilnehmerliste: der Name führt zum Profil', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  const link = page.getByRole('link', { name: /QA r14o/ })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(new RegExp(`/profil/${owner.id}`))
})

// ===========================================================================
// Sichtbarkeits-Einstellungen im eigenen Profil
// ===========================================================================

test('Neues Mitglied: alle sieben Schalter stehen auf „sichtbar"', async ({ page }) => {
  await login(page, switcher.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()
  await page.waitForTimeout(400)

  for (const label of [
    'Lieblings-Dram',
    'Lieblingsregion',
    'Kurzbeschreibung',
    'Anzahl Tastings',
    'Mitgebrachte Whiskys',
    'Beste Platzierung',
    'Ø vergebene Punkte',
  ]) {
    await expect(page.getByRole('switch', { name: label, exact: true })).toBeChecked()
  }
})

test('Schalter umlegen speichert sofort, ohne Speichern-Knopf', async ({ page }) => {
  await login(page, switcher.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()
  await page.waitForTimeout(400)

  const dram = page.getByRole('switch', { name: 'Lieblings-Dram', exact: true })
  await dram.click()

  await expect(page.getByText('Gespeichert.')).toBeVisible({ timeout: 15_000 })
  expect(await readVisibility(switcher.id, 'show_favorite_dram')).toBe(false)

  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await expect(page.getByRole('switch', { name: 'Lieblings-Dram', exact: true })).not.toBeChecked()

  await dram.click()
  await expect(page.getByText('Gespeichert.')).toBeVisible({ timeout: 15_000 })
  expect(await readVisibility(switcher.id, 'show_favorite_dram')).toBe(true)
})

// ===========================================================================
// Community-Übersicht
// ===========================================================================

test('Profilseite verlinkt „Die Runde ansehen"', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto('/profil', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Profil' }).waitFor()

  await page.getByRole('link', { name: 'Die Runde ansehen' }).click()
  await expect(page).toHaveURL(/\/community$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Die Runde' })).toBeVisible()
})

test('Community-Liste zeigt aktive Mitglieder, deaktivierte fehlen', async ({ page }) => {
  await login(page, viewer.email)
  await page.goto('/community', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Die Runde' }).waitFor()
  await page.waitForTimeout(400)

  await expect(page.getByRole('link', { name: /QA r14o/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /QA r14h/ })).toHaveCount(0)
})

test('Community-Liste: der eigene Eintrag führt zur bearbeitbaren Profilseite', async ({
  page,
}) => {
  await login(page, owner.email)
  await page.goto('/community', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Die Runde' }).waitFor()
  await page.waitForTimeout(400)

  await page.getByRole('link', { name: /QA r14o/ }).click()
  await expect(page).toHaveURL(/\/profil$/)
})
