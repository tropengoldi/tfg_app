/**
 * PROJ-4 · Admin – Tasting-Events: Regeln von `admin_list_events` und `delete_event`.
 * Ausführen:  npm run test:rls
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '../types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const RUN = Boolean(SUPABASE_URL && ANON && SERVICE)

const PASSWORD = 'admin-events-2026!'
const stamp = Date.now()
const email = (tag: string) => `admin-ev-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `EV ${tag}` },
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

async function createDraft(hostId: string, location = 'EV-Test'): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: hostId,
  })
  if (error) throw error
  eventIds.push(data as string)
  return data as string
}

let admin: Person
let host: Person
let outsider: Person

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
  if (error) throw error
  host = await makeUser('host')
  outsider = await makeUser('out')
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

describe.skipIf(!RUN)('admin_list_events', () => {
  it('Nicht-Admin wird abgewiesen (TS004)', async () => {
    const { error } = await outsider.client.rpc('admin_list_events')
    expect(error?.code).toBe('TS004')
  })

  it('Admin bekommt Events mit Gastgebername und Zählwerten', async () => {
    const evId = await createDraft(host.id, 'Liste-Test')
    const { data, error } = await admin.client.rpc('admin_list_events')
    expect(error).toBeNull()
    const rows = data as {
      id: string
      host_name: string
      status: string
      participant_count: number
      whisky_count: number
    }[]
    const row = rows.find((r) => r.id === evId)
    expect(row).toBeTruthy()
    expect(row!.host_name).toBe('EV host')
    expect(row!.status).toBe('draft')
    expect(row!.participant_count).toBe(1) // nur der Gastgeber
    expect(row!.whisky_count).toBe(0)
  })
})

describe.skipIf(!RUN)('delete_event', () => {
  it('Nicht-Admin wird abgewiesen (TS004)', async () => {
    const evId = await createDraft(host.id)
    const { error } = await outsider.client.rpc('delete_event', { p_event: evId })
    expect(error?.code).toBe('TS004')
  })

  it('nicht existierendes Event (TS004)', async () => {
    const { error } = await admin.client.rpc('delete_event', {
      p_event: '00000000-0000-0000-0000-000000000000',
    })
    expect(error?.code).toBe('TS004')
  })

  it('Draft ohne Whiskies wird gelöscht (samt Teilnehmer-Zuordnung)', async () => {
    const evId = await createDraft(host.id, 'Löschen-ok')
    const del = await admin.client.rpc('delete_event', { p_event: evId })
    expect(del.error).toBeNull()

    const { data: still } = await service
      .from('tasting_events')
      .select('id')
      .eq('id', evId)
      .maybeSingle()
    expect(still).toBeNull()
    const { data: parts } = await service
      .from('event_participants')
      .select('profile_id')
      .eq('event_id', evId)
    expect(parts ?? []).toHaveLength(0)
  })

  it('Draft mit einem Whisky wird abgelehnt (TS015)', async () => {
    const evId = await createDraft(host.id, 'Löschen-Whisky')
    const add = await host.client.rpc('add_whisky', { p_event: evId, p_name: 'Sperr-Dram' })
    expect(add.error).toBeNull()

    const del = await admin.client.rpc('delete_event', { p_event: evId })
    expect(del.error?.code).toBe('TS015')

    const { data: still } = await service
      .from('tasting_events')
      .select('id')
      .eq('id', evId)
      .maybeSingle()
    expect(still?.id).toBe(evId)
  })

  it('Nicht-Draft-Event wird abgelehnt (TS005)', async () => {
    const evId = await createDraft(host.id, 'Löschen-closed')
    // direkt auf „abgeschlossen" setzen (Zeitstempel-CHECK bedienen)
    const now = new Date().toISOString()
    const { error: upErr } = await service
      .from('tasting_events')
      .update({ status: 'closed', started_at: now, closed_at: now })
      .eq('id', evId)
    expect(upErr).toBeNull()

    const del = await admin.client.rpc('delete_event', { p_event: evId })
    expect(del.error?.code).toBe('TS005')
  })
})
