/**
 * PROJ-28 · Whisky-Fotos — DB- und Bucket-Regeln.
 *   - set_whisky_photo: nur Bringer oder Admin, in jedem Status; Pfad-Prüfung (TS027);
 *     liefert die alten Pfade; kein Direkt-Update an whisky_details
 *   - Bucket: Anlegen nur Bringer/Admin bzw. eigener Sammlungs-Ordner; kaputte Pfade abgelehnt
 *   - Blindheit: vor dem Abschluss nur Bringer, Gastgeber ohne Steward, Steward, Admin;
 *     nach dem Abschluss jedes aktive Mitglied (gemeinsames Archiv)
 *   - whisky_rankings reicht die Pfade durch
 *   - Sammlung: Ordner-Prüfung, Sichtbarkeit nach „Sammlung sichtbar", Kopie aus dem Tasting
 *
 * Bewusst KEIN Event auf „aktiv": die Tests laufen gegen die eine Live-DB, und ein
 * Start würde ein echtes laufendes Tasting stören. Die Regeln für „läuft" sind dieselben
 * wie für „Entwurf" (nur der Abschluss schaltet um).
 *
 * Ausführen:  npm run test:rls
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '../types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const RUN = Boolean(SUPABASE_URL && ANON && SERVICE)

const BUCKET = 'whisky-photos'
const PASSWORD = 'whisky-photos-2026!'
const stamp = Date.now()
const email = (tag: string) => `photo-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const FUTURE = '2026-12-24'
// Kein echtes Bild nötig — der Bucket prüft Größe und Content-Type.
const JPEG = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })

type Client = SupabaseClient<Database>
let service: Client
const userIds: string[] = []
const eventIds: string[] = []

interface Person {
  id: string
  client: Client
}

async function makeUser(tag: string): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `PHOTO ${tag}` },
  })
  if (error || !data.user) throw error ?? new Error('createUser')
  userIds.push(data.user.id)
  const client = createClient<Database>(SUPABASE_URL!, ANON!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const s = await client.auth.signInWithPassword({ email: email(tag), password: PASSWORD })
  if (s.error) throw s.error
  await sleep(100)
  return { id: data.user.id, client }
}

let admin: Person
let host: Person
let pa: Person
let pb: Person
let steward: Person
let outsider: Person

let seq = 0
function pair(folder: string) {
  const t = 1732300000000 + ++seq
  return { photo: `${folder}/${t}-full.jpg`, thumb: `${folder}/${t}-thumb.jpg` }
}

async function upload(p: Person, path: string) {
  return p.client.storage.from(BUCKET).upload(path, JPEG, { contentType: 'image/jpeg', upsert: false })
}

async function canRead(p: Person, path: string): Promise<boolean> {
  const { data, error } = await p.client.storage.from(BUCKET).createSignedUrl(path, 60)
  return !error && Boolean(data?.signedUrl)
}

async function draftEvent(location: string, helper: string | null): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    ...(helper ? { p_helper_id: helper } : {}),
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id, pb.id],
  })
  if (pErr) throw pErr
  return evId
}

async function addWhisky(p: Person, evId: string, name: string): Promise<string> {
  const { data, error } = await p.client.rpc('add_whisky', { p_event: evId, p_name: name })
  if (error) throw error
  return data as string
}

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
  if (error) throw error
  host = await makeUser('host')
  pa = await makeUser('pa')
  pb = await makeUser('pb')
  steward = await makeUser('steward')
  outsider = await makeUser('outsider')
}, 120_000)

afterAll(async () => {
  if (!RUN || !service) return
  // Dateien zuerst (die DB-Kaskade räumt den Bucket nicht).
  const prefixes = [
    ...eventIds.map((id) => `tasting/${id}`),
    ...userIds.map((id) => `collection/${id}`),
  ]
  for (const prefix of prefixes) {
    const { data: dirs } = await service.storage.from(BUCKET).list(prefix, { limit: 1000 })
    for (const d of dirs ?? []) {
      const sub = `${prefix}/${d.name}`
      const { data: files } = await service.storage.from(BUCKET).list(sub, { limit: 1000 })
      const names = (files ?? []).filter((f) => f.id !== null).map((f) => `${sub}/${f.name}`)
      if (names.length > 0) await service.storage.from(BUCKET).remove(names)
    }
  }
  for (const id of eventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Whisky-Fotos', () => {
  let ev = ''
  let wPa = ''
  let first = { photo: '', thumb: '' }
  let current = { photo: '', thumb: '' }

  it('Bringer lädt hoch und trägt ein; alte Pfade zunächst leer', async () => {
    ev = await draftEvent(`PHOTO-main-${stamp}`, null)
    wPa = await addWhisky(pa, ev, 'PHOTO-Pa')
    first = pair(`tasting/${ev}/${wPa}`)
    expect((await upload(pa, first.photo)).error).toBeNull()
    expect((await upload(pa, first.thumb)).error).toBeNull()

    const { data, error } = await pa.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: first.photo,
      p_thumb_path: first.thumb,
    })
    expect(error).toBeNull()
    expect(data?.[0]?.old_photo_path ?? null).toBeNull()
    current = first
  })

  it('andere Teilnehmer und der Gastgeber dürfen weder hochladen noch eintragen', async () => {
    const p = pair(`tasting/${ev}/${wPa}`)
    expect((await upload(pb, p.photo)).error).not.toBeNull()
    expect((await upload(host, p.photo)).error).not.toBeNull()
    expect((await upload(outsider, p.photo)).error).not.toBeNull()
    for (const who of [pb, host, outsider, steward]) {
      const { error } = await who.client.rpc('set_whisky_photo', { p_whisky: wPa })
      expect(error?.code).toBe('TS004')
    }
  })

  it('kaputte oder fremde Pfade werden abgelehnt (Bucket + TS027)', async () => {
    for (const bad of [
      `tasting/${ev}/${wPa}/x/1732300000999-full.jpg`,
      `tasting/${ev}/${wPa}/1732300000999-full.png`,
      `tasting/${eventIds[0]}/${pa.id}/1732300000999-full.jpg`,
      `elsewhere/1732300000999-full.jpg`,
    ]) {
      expect((await upload(pa, bad)).error).not.toBeNull()
    }

    const foreign = pair(`tasting/${ev}/${pa.id}`)
    const r1 = await pa.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: foreign.photo,
      p_thumb_path: foreign.thumb,
    })
    expect(r1.error?.code).toBe('TS027')

    const a = pair(`tasting/${ev}/${wPa}`)
    const b = pair(`tasting/${ev}/${wPa}`)
    const r2 = await pa.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: a.photo,
      p_thumb_path: b.thumb,
    })
    expect(r2.error?.code).toBe('TS027')

    const r3 = await pa.client.rpc('set_whisky_photo', { p_whisky: wPa, p_photo_path: a.photo })
    expect(r3.error?.code).toBe('TS027')
  })

  it('kein Direkt-Update der Foto-Spalten an whisky_details', async () => {
    const { data, error } = await pa.client
      .from('whisky_details')
      .update({ photo_path: null, photo_thumb_path: null })
      .eq('whisky_id', wPa)
      .select('whisky_id')
    expect(error !== null || (data ?? []).length === 0).toBe(true)
    const { data: still } = await service
      .from('whisky_details')
      .select('photo_path')
      .eq('whisky_id', wPa)
      .single()
    expect(still?.photo_path).toBe(current.photo)
  })

  it('vor dem Abschluss: Bringer, Gastgeber (ohne Steward), Admin sehen es — sonst niemand', async () => {
    expect(await canRead(pa, current.thumb)).toBe(true)
    expect(await canRead(host, current.thumb)).toBe(true)
    expect(await canRead(admin, current.photo)).toBe(true)
    expect(await canRead(pb, current.thumb)).toBe(false)
    expect(await canRead(pb, current.photo)).toBe(false)
    expect(await canRead(outsider, current.photo)).toBe(false)

    const { data } = await pb.client.from('whisky_details').select('photo_path').eq('whisky_id', wPa)
    expect(data ?? []).toHaveLength(0)
  })

  it('Ersetzen liefert die alten Pfade zurück', async () => {
    const next = pair(`tasting/${ev}/${wPa}`)
    await upload(pa, next.photo)
    await upload(pa, next.thumb)
    const { data, error } = await pa.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: next.photo,
      p_thumb_path: next.thumb,
    })
    expect(error).toBeNull()
    expect(data?.[0]).toEqual({ old_photo_path: first.photo, old_thumb_path: first.thumb })
    // Die App löscht die alten Dateien — der Bringer darf das.
    const rm = await pa.client.storage.from(BUCKET).remove([first.photo, first.thumb])
    expect(rm.error).toBeNull()
    current = next
  })

  it('nach dem Abschluss: jedes aktive Mitglied sieht das Foto, Rangliste führt die Pfade', async () => {
    await service
      .from('tasting_events')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', ev)

    expect(await canRead(pb, current.photo)).toBe(true)
    expect(await canRead(outsider, current.thumb)).toBe(true)

    const { data } = await outsider.client
      .from('whisky_rankings')
      .select('whisky_id, photo_path, photo_thumb_path')
      .eq('whisky_id', wPa)
      .single()
    expect(data?.photo_path).toBe(current.photo)
    expect(data?.photo_thumb_path).toBe(current.thumb)
  })

  it('nach dem Abschluss: Bringer und Admin dürfen weiter pflegen, andere nicht', async () => {
    expect((await pb.client.rpc('set_whisky_photo', { p_whisky: wPa })).error?.code).toBe('TS004')

    const byAdmin = pair(`tasting/${ev}/${wPa}`)
    expect((await upload(admin, byAdmin.photo)).error).toBeNull()
    expect((await upload(admin, byAdmin.thumb)).error).toBeNull()
    const r = await admin.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: byAdmin.photo,
      p_thumb_path: byAdmin.thumb,
    })
    expect(r.error).toBeNull()
    await admin.client.storage.from(BUCKET).remove([current.photo, current.thumb])
    current = byAdmin

    // Bringer entfernt (beide null)
    const del = await pa.client.rpc('set_whisky_photo', { p_whisky: wPa })
    expect(del.error).toBeNull()
    expect(del.data?.[0]?.old_photo_path).toBe(byAdmin.photo)
    expect((await pa.client.storage.from(BUCKET).remove([byAdmin.photo, byAdmin.thumb])).error).toBeNull()

    // wieder eins für die Kopier-Tests
    const again = pair(`tasting/${ev}/${wPa}`)
    await upload(pa, again.photo)
    await upload(pa, again.thumb)
    await pa.client.rpc('set_whisky_photo', {
      p_whisky: wPa,
      p_photo_path: again.photo,
      p_thumb_path: again.thumb,
    })
    current = again
  })

  it('mit Steward: Gastgeber verkostet blind und sieht nichts, der Steward schon', async () => {
    const evS = await draftEvent(`PHOTO-steward-${stamp}`, steward.id)
    const w = await addWhisky(pa, evS, 'PHOTO-S')
    const p = pair(`tasting/${evS}/${w}`)
    await upload(pa, p.photo)
    await upload(pa, p.thumb)
    expect(
      (await pa.client.rpc('set_whisky_photo', { p_whisky: w, p_photo_path: p.photo, p_thumb_path: p.thumb }))
        .error,
    ).toBeNull()

    expect(await canRead(steward, p.thumb)).toBe(true)
    expect(await canRead(host, p.thumb)).toBe(false)
    expect(await canRead(pb, p.thumb)).toBe(false)
    // Steward darf sehen, aber nicht pflegen
    expect((await upload(steward, pair(`tasting/${evS}/${w}`).photo)).error).not.toBeNull()
  })

  describe('Sammlung', () => {
    let entryPa = ''
    let entryPb = ''

    it('eigener Ordner: hochladen und eintragen; fremder Ordner abgelehnt', async () => {
      const { data, error } = await pa.client
        .from('collection_entries')
        .insert({ profile_id: pa.id, name: 'PHOTO-Coll' })
        .select('id')
        .single()
      expect(error).toBeNull()
      entryPa = data!.id

      const p = pair(`collection/${pa.id}/${entryPa}`)
      expect((await upload(pa, p.photo)).error).toBeNull()
      expect((await upload(pa, p.thumb)).error).toBeNull()
      const up = await pa.client
        .from('collection_entries')
        .update({ photo_path: p.photo, photo_thumb_path: p.thumb })
        .eq('id', entryPa)
        .select('id')
      expect(up.error).toBeNull()
      expect(up.data ?? []).toHaveLength(1)

      expect((await upload(pb, pair(`collection/${pa.id}/${entryPa}`).photo)).error).not.toBeNull()

      // Spalten dürfen nicht auf einen fremden Ordner zeigen
      const foreign = pair(`collection/${pb.id}/${entryPa}`)
      const bad = await pa.client
        .from('collection_entries')
        .update({ photo_path: foreign.photo, photo_thumb_path: foreign.thumb })
        .eq('id', entryPa)
      expect(bad.error?.code).toBe('23514')
    })

    it('fremde Sammlung: sichtbar nur mit „Sammlung sichtbar"', async () => {
      const { data: row } = await pa.client
        .from('collection_entries')
        .select('photo_thumb_path')
        .eq('id', entryPa)
        .single()
      const thumb = row!.photo_thumb_path!

      await pa.client.from('profiles').update({ show_collection: true }).eq('id', pa.id)
      expect(await canRead(pb, thumb)).toBe(true)
      await pa.client.from('profiles').update({ show_collection: false }).eq('id', pa.id)
      expect(await canRead(pb, thumb)).toBe(false)
      expect(await canRead(pa, thumb)).toBe(true)
      await pa.client.from('profiles').update({ show_collection: true }).eq('id', pa.id)
    })

    it('Kopie aus dem abgeschlossenen Tasting in die eigene Sammlung; nicht in fremde', async () => {
      const { data } = await pb.client
        .from('collection_entries')
        .insert({ profile_id: pb.id, name: 'PHOTO-Copy' })
        .select('id')
        .single()
      entryPb = data!.id

      const dest = pair(`collection/${pb.id}/${entryPb}`)
      const c1 = await pb.client.storage.from(BUCKET).copy(current.photo, dest.photo)
      expect(c1.error).toBeNull()
      expect(await canRead(pb, dest.photo)).toBe(true)

      const c2 = await pb.client.storage
        .from(BUCKET)
        .copy(current.photo, pair(`collection/${pa.id}/${entryPa}`).photo)
      expect(c2.error).not.toBeNull()
    })
  })
})
