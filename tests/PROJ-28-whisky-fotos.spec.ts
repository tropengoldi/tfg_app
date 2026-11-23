import path from 'node:path'

import { expect, test, type Locator, type Page } from '@playwright/test'
import sharp from 'sharp'

import {
  addParticipant,
  addWhiskyAs,
  createDisposableAdmin,
  createDisposableUser,
  createEventDirect,
  deleteUser,
  fillField,
  hasServiceClient,
  insertRatingDirect,
  login,
  SEED_PASSWORD,
  serviceClient,
} from './helpers/auth'

/**
 * PROJ-28 · Whisky-Fotos — E2E.
 * Fixture: 3000×2000 JPEG mit EXIF-Drehung 6 (hochkant anzuzeigen) und GPS-Daten.
 * Erwartet nach dem Upload: große Fassung 1067×1600, Vorschau 160×240, keine EXIF-Daten.
 *
 * Kein Event wird „aktiv" geschaltet (Live-DB, ein-aktives-Event-Regel).
 */

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA28-${STAMP}-${tag}`
const BUCKET = 'whisky-photos'
const PHOTO = path.join(__dirname, 'fixtures', 'whisky-photo.jpg')
const NOT_IMAGE = path.join(__dirname, 'fixtures', 'not-an-image.txt')

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(120_000))

let admin: { id: string; email: string }
let host: { id: string; email: string }
let pa: { id: string; email: string }
let pb: { id: string; email: string }
let ev = ''

const W1 = `QA28 Bringer-Whisky ${STAMP}`
const W2 = `QA28 Dialog-Whisky ${STAMP}`
const WH = `QA28 Gastgeber-Whisky ${STAMP}`

async function whiskyRow(name: string) {
  const { data } = await serviceClient()
    .from('whisky_details')
    .select('whisky_id, photo_path, photo_thumb_path')
    .eq('event_id', ev)
    .eq('name', name)
    .single()
  return data as { whisky_id: string; photo_path: string | null; photo_thumb_path: string | null }
}

async function download(p: string): Promise<Buffer> {
  const { data, error } = await serviceClient().storage.from(BUCKET).download(p)
  if (error || !data) throw error ?? new Error('download')
  return Buffer.from(await data.arrayBuffer())
}

async function exists(p: string): Promise<boolean> {
  const dir = p.slice(0, p.lastIndexOf('/'))
  const file = p.slice(p.lastIndexOf('/') + 1)
  const { data } = await serviceClient().storage.from(BUCKET).list(dir, { limit: 100 })
  return (data ?? []).some((f) => f.name === file)
}

async function removeFolder(prefix: string) {
  const svc = serviceClient()
  const walk = async (dir: string): Promise<string[]> => {
    const { data } = await svc.storage.from(BUCKET).list(dir, { limit: 1000 })
    const out: string[] = []
    for (const it of data ?? []) {
      const p = `${dir}/${it.name}`
      if (it.id === null) out.push(...(await walk(p)))
      else out.push(p)
    }
    return out
  }
  const files = await walk(prefix)
  if (files.length > 0) await svc.storage.from(BUCKET).remove(files)
}

async function closeEvent(eventId: string) {
  const now = new Date().toISOString()
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', started_at: now, closed_at: now })
    .eq('id', eventId)
  if (error) throw error
}

function myWhiskyItem(page: Page, name: string): Locator {
  return page.getByRole('list', { name: 'Meine Whiskys' }).getByRole('listitem').filter({ hasText: name })
}

function rankingItem(page: Page, name: string): Locator {
  return page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem').filter({ hasText: name }).first()
}

async function openWhiskies(page: Page) {
  await page.goto(`/tastings/${ev}/whiskies`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: 'Meine Whiskys' }).waitFor()
}

async function openResults(page: Page) {
  await page.goto(`/tastings/${ev}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('list', { name: 'Rangliste' }).waitFor()
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  admin = await createDisposableAdmin('qa28-admin')
  host = await createDisposableUser('qa28-host')
  pa = await createDisposableUser('qa28-pa')
  pb = await createDisposableUser('qa28-pb')
  ev = await createEventDirect({ hostId: host.id, createdBy: admin.id, location: LOC('main') })
  await addParticipant(ev, pa.id)
  await addParticipant(ev, pb.id)
  await addWhiskyAs(pa.email, ev, W1)
  await addWhiskyAs(host.email, ev, WH)
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  const svc = serviceClient()
  await removeFolder(`tasting/${ev}`).catch(() => {})
  for (const u of [pa, pb]) if (u) await removeFolder(`collection/${u.id}`).catch(() => {})
  if (ev) await svc.from('tasting_events').delete().eq('id', ev)
  for (const u of [admin, host, pa, pb]) if (u) await deleteUser(u.id).catch(() => {})
})

test('AC: Bringer lädt auf „Meine Whiskys" ein Foto hoch — verkleinert, gedreht, ohne GPS', async ({ page }) => {
  await login(page, pa.email)
  await openWhiskies(page)
  const item = myWhiskyItem(page, W1)
  await expect(item.getByRole('button', { name: 'Foto hinzufügen' })).toBeVisible()
  await item.locator('input[type="file"]').setInputFiles(PHOTO)
  await expect(item.getByRole('button', { name: `Foto von „${W1}" vergrößern` })).toBeVisible({
    timeout: 30_000,
  })

  const row = await whiskyRow(W1)
  expect(row.photo_path).toMatch(new RegExp(`^tasting/${ev}/${row.whisky_id}/\\d+-full\\.jpg$`))
  const full = await sharp(await download(row.photo_path!)).metadata()
  const thumb = await sharp(await download(row.photo_thumb_path!)).metadata()
  // Hochkant (EXIF-Drehung umgesetzt) und auf die lange Kante verkleinert
  expect([full.width, full.height]).toEqual([1067, 1600])
  expect(Math.max(thumb.width ?? 0, thumb.height ?? 0)).toBe(240)
  expect(thumb.height).toBeGreaterThan(thumb.width ?? 0)
  // Metadaten (inkl. GPS) sind weg
  expect(full.exif).toBeUndefined()
  expect(thumb.exif).toBeUndefined()
})

test('AC: Foto ersetzen — altes Bild ist danach nicht mehr abrufbar', async ({ page }) => {
  const before = await whiskyRow(W1)
  await login(page, pa.email)
  await openWhiskies(page)
  const item = myWhiskyItem(page, W1)
  await item.getByRole('button', { name: 'Ersetzen' }).waitFor()
  await item.locator('input[type="file"]').setInputFiles(PHOTO)
  await expect(page.getByText('Foto ersetzt.')).toBeVisible({ timeout: 30_000 })

  const after = await whiskyRow(W1)
  expect(after.photo_path).not.toBe(before.photo_path)
  expect(await exists(before.photo_path!)).toBe(false)
  expect(await exists(before.photo_thumb_path!)).toBe(false)
  expect(await exists(after.photo_path!)).toBe(true)
})

test('AC: Nicht-Bild wird mit verständlicher Meldung abgelehnt, Zustand bleibt', async ({ page }) => {
  const before = await whiskyRow(W1)
  await login(page, pa.email)
  await openWhiskies(page)
  const item = myWhiskyItem(page, W1)
  await item.locator('input[type="file"]').setInputFiles(NOT_IMAGE)
  await expect(item.getByRole('alert')).toContainText('kein Bild')
  expect((await whiskyRow(W1)).photo_path).toBe(before.photo_path)
})

test('AC: Foto direkt beim Eintragen eines neuen Whiskys', async ({ page }) => {
  await login(page, pa.email)
  await openWhiskies(page)
  await page.getByRole('button', { name: 'Whisky hinzufügen' }).click()
  const dialog = page.getByRole('dialog')
  await fillField(page, 'Name', W2)
  await dialog.locator('input[type="file"]').setInputFiles(PHOTO)
  await expect(dialog.getByAltText('Vorschau des gewählten Fotos')).toBeVisible()
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(myWhiskyItem(page, W2).getByRole('button', { name: `Foto von „${W2}" vergrößern` })).toBeVisible({
    timeout: 30_000,
  })
  expect((await whiskyRow(W2)).photo_path).not.toBeNull()
})

test('AC: Gastgeber (ohne Steward) sieht Mini-Bilder in der Ausschankliste', async ({ page }) => {
  await login(page, host.email)
  await page.goto(`/tastings/${ev}/gastgeber`, { waitUntil: 'networkidle' })
  const list = page.getByRole('list', { name: 'Ausschankreihenfolge' })
  await expect(list.getByRole('button', { name: `Foto von „${W1}" vergrößern` })).toBeVisible()
  // eigener Whisky ohne Foto → Platzhalter, kein Vergrößern-Knopf
  await expect(list.getByRole('button', { name: `Foto von „${WH}" vergrößern` })).toHaveCount(0)
})

test('AC: Blindheit — anderer Teilnehmer bekommt vor dem Abschluss keine Bild-Datei', async () => {
  const row = await whiskyRow(W1)
  const { createClient } = await import('@supabase/supabase-js')
  const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const s = await c.auth.signInWithPassword({ email: pb.email, password: SEED_PASSWORD })
  expect(s.error).toBeNull()
  const signed = await c.storage.from(BUCKET).createSignedUrl(row.photo_path!, 60)
  expect(signed.data?.signedUrl ?? null).toBeNull()
  const dl = await c.storage.from(BUCKET).download(row.photo_path!)
  expect(dl.data).toBeNull()
})

test('AC: nach dem Abschluss — Mini-Bild in der Rangliste, Antippen öffnet Vollbild; keine Aktionen bei fremden Whiskys', async ({ page }) => {
  // Bewertung für den Sammlungs-Test muss vor dem Abschluss entstehen (danach TS001).
  const w1 = await whiskyRow(W1)
  await insertRatingDirect({ eventId: ev, whiskyId: w1.whisky_id, profileId: pb.id, nose: 3, taste: 7 })
  await closeEvent(ev)
  await login(page, pb.email)
  await openResults(page)
  const item = rankingItem(page, W1)
  const thumb = item.getByRole('button', { name: `Foto von „${W1}" vergrößern` })
  await expect(thumb).toBeVisible()
  await expect(item.getByRole('button', { name: /Foto (hinzufügen|ersetzen)/ })).toHaveCount(0)

  await thumb.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: W1 })).toBeVisible()
  const img = dialog.getByAltText(`Foto von ${W1}`)
  await expect(img).toBeVisible()
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('AC: „Meine Whiskys" nach dem Abschluss — nur das Foto bleibt änderbar', async ({ page }) => {
  await login(page, pa.email)
  await openWhiskies(page)
  await expect(page.getByText('Fotos kannst du weiterhin')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Whisky hinzufügen' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: `„${W1}" bearbeiten` })).toHaveCount(0)
  await expect(myWhiskyItem(page, W1).getByRole('button', { name: 'Ersetzen' })).toBeEnabled()
})

test('AC: Admin hinterlegt nachträglich ein Foto bei einem fremden Whisky (Ergebnisseite)', async ({ page }) => {
  await login(page, admin.email)
  await openResults(page)
  const item = rankingItem(page, WH)
  await expect(item.getByRole('button', { name: 'Foto hinzufügen' })).toBeVisible()
  await item.locator('input[type="file"]').setInputFiles(PHOTO)
  await expect(item.getByRole('button', { name: `Foto von „${WH}" vergrößern` })).toBeVisible({
    timeout: 30_000,
  })
  expect((await whiskyRow(WH)).photo_path).not.toBeNull()
})

test('AC: „Zur Sammlung hinzufügen" übernimmt das Foto als eigene Kopie', async ({ page }) => {
  const src = await whiskyRow(W1)

  await login(page, pb.email)
  await openResults(page)
  await rankingItem(page, W1).getByRole('button', { name: 'Zur Sammlung hinzufügen' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Ohne eigene Auswahl wird das Foto aus dem Tasting übernommen.')).toBeVisible()
  await dialog.getByRole('button', { name: 'Eintragen' }).click()
  await expect(page.getByText('Eintrag gespeichert.')).toBeVisible({ timeout: 20_000 })

  const { data: entry } = await serviceClient()
    .from('collection_entries')
    .select('id, photo_path, photo_thumb_path')
    .eq('profile_id', pb.id)
    .single()
  expect(entry?.photo_path).toMatch(new RegExp(`^collection/${pb.id}/${entry?.id}/\\d+-full\\.jpg$`))
  expect(entry?.photo_path).not.toBe(src.photo_path)

  await page.goto('/profil/sammlung', { waitUntil: 'networkidle' })
  await expect(page.getByRole('button', { name: `Foto von „${W1}" vergrößern` })).toBeVisible()
})

test('AC: Bringer entfernt das Tasting-Foto — die Sammlungs-Kopie bleibt', async ({ page }) => {
  const before = await whiskyRow(W1)
  await login(page, pa.email)
  await openResults(page)
  const item = rankingItem(page, W1)
  await item.getByRole('button', { name: `Foto von „${W1}" entfernen` }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.getByText('Foto entfernt.')).toBeVisible({ timeout: 20_000 })
  await expect(item.getByRole('button', { name: 'Foto hinzufügen' })).toBeVisible()

  expect((await whiskyRow(W1)).photo_path).toBeNull()
  expect(await exists(before.photo_path!)).toBe(false)

  const { data: entry } = await serviceClient()
    .from('collection_entries')
    .select('photo_path')
    .eq('profile_id', pb.id)
    .single()
  expect(await exists(entry!.photo_path!)).toBe(true)
})

test('AC: Sammlungs-Eintrag löschen löscht auch sein Foto', async ({ page }) => {
  const { data: entry } = await serviceClient()
    .from('collection_entries')
    .select('id, name, photo_path')
    .eq('profile_id', pb.id)
    .single()
  await login(page, pb.email)
  await page.goto('/profil/sammlung', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Aktionen für „${entry!.name}"` }).click()
  await page.getByRole('menuitem', { name: 'Löschen' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()
  await expect(page.getByText('Eintrag gelöscht.')).toBeVisible({ timeout: 20_000 })
  expect(await exists(entry!.photo_path!)).toBe(false)
})
