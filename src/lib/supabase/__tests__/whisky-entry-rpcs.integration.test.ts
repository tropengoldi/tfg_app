/**
 * PROJ-5 · Whisky-Erfassung: die Serverregeln hinter „Meine Whiskys".
 *   - add_whisky: Teilnahme, Status, persönliches Limit (+ Gastgeber-Bonus),
 *     Obergrenze pro Abend (neuer Code TS016)
 *   - whisky_details direkt bearbeiten: nur Bringer, nur im Draft (RLS wd_update_own)
 *   - remove_whisky: nur Bringer/Admin, nur im Draft, Positionslücke schliesst
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

const PASSWORD = 'whisky-entry-2026!'
const stamp = Date.now()
const email = (tag: string) => `whisky-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const FUTURE = '2026-12-24'

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
    user_metadata: { display_name: `WE ${tag}` },
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
let bringer: Person
let other: Person
let outsider: Person

interface EventOpts {
  hostId: string
  participants?: string[]
  maxWhiskies?: number | null
}

async function makeEvent({ hostId, participants = [], maxWhiskies = null }: EventOpts) {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: `WE-${stamp}-${Math.random().toString(36).slice(2, 8)}`,
    p_host_id: hostId,
    p_max_whiskies: maxWhiskies ?? undefined,
  })
  if (error) throw error
  const id = data as string
  eventIds.push(id)

  const ids = [...new Set([hostId, ...participants])]
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: id,
    p_profile_ids: ids,
  })
  if (pErr) throw pErr
  return id
}

async function setActive(eventId: string) {
  const now = new Date().toISOString()
  // Global darf nur ein Event aktiv sein (one_active_event_at_a_time) — ein
  // noch aktives aus einem früheren Test vorher wegschliessen.
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: now })
    .eq('status', 'active')
    .neq('id', eventId)
  const { error } = await service
    .from('tasting_events')
    .update({ status: 'active', started_at: now, current_position: 1 })
    .eq('id', eventId)
  if (error) throw error
}

async function addWhisky(person: Person, eventId: string, name: string) {
  return person.client.rpc('add_whisky', { p_event: eventId, p_name: name })
}

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  const { error } = await service
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', admin.id)
  if (error) throw error
  host = await makeUser('host')
  bringer = await makeUser('bringer')
  other = await makeUser('other')
  outsider = await makeUser('outsider')
}, 120_000)

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of eventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('add_whisky — Teilnahme & Status', () => {
  it('Nicht-Teilnehmer wird abgewiesen (TS004)', async () => {
    const ev = await makeEvent({ hostId: host.id, participants: [bringer.id] })
    const { error } = await addWhisky(outsider, ev, 'Fremd-Dram')
    expect(error?.code).toBe('TS004')
  })

  it('nach dem Start kein Eintragen mehr (TS005)', async () => {
    const ev = await makeEvent({ hostId: host.id, participants: [bringer.id] })
    await setActive(ev)
    const { error } = await addWhisky(bringer, ev, 'Zu spät')
    expect(error?.code).toBe('TS005')
  })
})

describe.skipIf(!RUN)('add_whisky — persönliches Limit & Gastgeber-Bonus', () => {
  it('Limit 1: der zweite eigene Whisky wird abgelehnt (TS003)', async () => {
    const ev = await makeEvent({
      hostId: host.id,
      participants: [bringer.id],
      maxWhiskies: 1,
    })
    expect((await addWhisky(bringer, ev, 'Erster')).error).toBeNull()
    expect((await addWhisky(bringer, ev, 'Zweiter')).error?.code).toBe('TS003')
  })

  it('Gastgeber darf bei Limit 1 zwei eintragen, der dritte wird abgelehnt', async () => {
    const ev = await makeEvent({ hostId: host.id, maxWhiskies: 1 })
    expect((await addWhisky(host, ev, 'Gastgeber A')).error).toBeNull()
    expect((await addWhisky(host, ev, 'Gastgeber B (Bonus)')).error).toBeNull()
    expect((await addWhisky(host, ev, 'Gastgeber C')).error?.code).toBe('TS003')
  })
})

describe.skipIf(!RUN)('add_whisky — Obergrenze pro Abend (TS016)', () => {
  it('der 11. Whisky eines Abends wird mit TS016 abgelehnt', async () => {
    const ev = await makeEvent({
      hostId: host.id,
      participants: [bringer.id, other.id],
      maxWhiskies: null, // kein persönliches Limit → die 10er-Obergrenze greift zuerst
    })
    for (let i = 1; i <= 6; i++) {
      expect((await addWhisky(bringer, ev, `B${i}`)).error).toBeNull()
    }
    for (let i = 1; i <= 4; i++) {
      expect((await addWhisky(other, ev, `O${i}`)).error).toBeNull()
    }
    const eleventh = await addWhisky(host, ev, 'Nummer 11')
    expect(eleventh.error?.code).toBe('TS016')
  })
})

describe.skipIf(!RUN)('whisky_details bearbeiten (RLS wd_update_own)', () => {
  it('der Bringer ändert seinen Whisky im Draft', async () => {
    const ev = await makeEvent({ hostId: host.id, participants: [bringer.id] })
    const { data: wid } = await addWhisky(bringer, ev, 'Alt')
    const { data, error } = await bringer.client
      .from('whisky_details')
      .update({ name: 'Neu', video_url: 'https://youtu.be/xyz' })
      .eq('whisky_id', wid as string)
      .select('name, video_url')
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].name).toBe('Neu')
  })

  it('ein anderer Teilnehmer kann den Whisky nicht ändern (0 Zeilen)', async () => {
    const ev = await makeEvent({
      hostId: host.id,
      participants: [bringer.id, other.id],
    })
    const { data: wid } = await addWhisky(bringer, ev, 'Bringers Dram')
    const { data, error } = await other.client
      .from('whisky_details')
      .update({ name: 'Gekapert' })
      .eq('whisky_id', wid as string)
      .select('name')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)

    const { data: check } = await service
      .from('whisky_details')
      .select('name')
      .eq('whisky_id', wid as string)
      .single()
    expect(check!.name).toBe('Bringers Dram')
  })

  it('nach dem Start ändert auch der Bringer nichts mehr (0 Zeilen)', async () => {
    const ev = await makeEvent({ hostId: host.id, participants: [bringer.id] })
    const { data: wid } = await addWhisky(bringer, ev, 'Vor dem Start')
    await setActive(ev)
    const { data, error } = await bringer.client
      .from('whisky_details')
      .update({ name: 'Zu spät geändert' })
      .eq('whisky_id', wid as string)
      .select('name')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })
})

describe.skipIf(!RUN)('remove_whisky', () => {
  it('ein Fremder darf nicht entfernen (TS004)', async () => {
    const ev = await makeEvent({
      hostId: host.id,
      participants: [bringer.id, other.id],
    })
    const { data: wid } = await addWhisky(bringer, ev, 'Weg damit?')
    const { error } = await other.client.rpc('remove_whisky', {
      p_whisky: wid as string,
    })
    expect(error?.code).toBe('TS004')
  })

  it('der Bringer entfernt seinen Whisky, die Lücke schliesst sich', async () => {
    const ev = await makeEvent({
      hostId: host.id,
      participants: [bringer.id, other.id],
    })
    const { data: w1 } = await addWhisky(bringer, ev, 'Position 1')
    const { data: w2 } = await addWhisky(other, ev, 'Position 2')

    const del = await bringer.client.rpc('remove_whisky', { p_whisky: w1 as string })
    expect(del.error).toBeNull()

    const { data: rows } = await service
      .from('whiskies')
      .select('id, position')
      .eq('event_id', ev)
    expect(rows).toHaveLength(1)
    expect(rows![0].id).toBe(w2)
    expect(rows![0].position).toBe(1)
  })

  it('nach dem Start lässt sich nichts mehr entfernen (TS005)', async () => {
    const ev = await makeEvent({ hostId: host.id, participants: [bringer.id] })
    const { data: wid } = await addWhisky(bringer, ev, 'Bleibt jetzt')
    await setActive(ev)
    const { error } = await bringer.client.rpc('remove_whisky', {
      p_whisky: wid as string,
    })
    expect(error?.code).toBe('TS005')
  })
})
