/**
 * PROJ-23 · Vergleichs-Merker — DB-Regeln.
 *   - toggle_compare_mark: Gruppe bilden, erweitern, zwei Gruppen verschmelzen, herausnehmen,
 *     auflösen; liefert danach alle eigenen Merker
 *   - nur ausgeschenkte, verschiedene Whiskies; nur Mitverkoster; nur im laufenden Tasting (TS026)
 *   - privat: niemand sonst liest fremde Merker (Teilnehmer, Gastgeber, Steward, Admin)
 *   - kein direkter Schreibzugriff
 *   - beim Abschluss gelöscht
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

const PASSWORD = 'compare-marks-2026!'
const stamp = Date.now()
const email = (tag: string) => `cmp-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `CMP ${tag}` },
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

async function closeAllActive() {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
}

async function draftEvent(location: string, n = 6): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    p_helper_id: steward.id,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id, pb.id],
  })
  if (pErr) throw pErr
  for (let i = 1; i <= n; i++) {
    const { error: wErr } = await host.client.rpc('add_whisky', { p_event: evId, p_name: `CMP-W${i}` })
    if (wErr) throw wErr
  }
  return evId
}

async function startAt(evId: string, position: number) {
  await closeAllActive()
  const { error } = await steward.client.rpc('start_event', { p_event: evId })
  if (error) throw error
  await service.from('tasting_events').update({ current_position: position }).eq('id', evId)
}

const toggle = (p: Person, evId: string, from: number, to: number) =>
  p.client.rpc('toggle_compare_mark', { p_event: evId, p_from: from, p_to: to })

/** Eigene Gruppen als sortierte Listen von Positionen, z. B. [[2,5,7]]. */
function groupsOf(rows: { whisky_position: number; group_no: number }[] | null) {
  const by = new Map<number, number[]>()
  for (const r of rows ?? []) by.set(r.group_no, [...(by.get(r.group_no) ?? []), r.whisky_position])
  return [...by.values()].map((g) => g.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0])
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
  await closeAllActive().catch(() => {})
  for (const id of eventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Vergleichs-Merker', () => {
  let ev = ''

  it('im Entwurf abgelehnt (TS026)', async () => {
    ev = await draftEvent(`CMP-main-${stamp}`)
    expect((await toggle(pa, ev, 1, 2)).error?.code).toBe('TS026')
  })

  it('Gruppe bilden und erweitern: 2·5, dann 2·5·6', async () => {
    await startAt(ev, 6)
    const r1 = await toggle(pa, ev, 2, 5)
    expect(r1.error).toBeNull()
    expect(groupsOf(r1.data)).toEqual([[2, 5]])
    const r2 = await toggle(pa, ev, 2, 6)
    expect(groupsOf(r2.data)).toEqual([[2, 5, 6]])
  })

  it('zwei Gruppen verschmelzen: 1·4 und 2·5·6 → 1·2·4·5·6', async () => {
    expect(groupsOf((await toggle(pa, ev, 1, 4)).data)).toEqual([[1, 4], [2, 5, 6]])
    expect(groupsOf((await toggle(pa, ev, 4, 5)).data)).toEqual([[1, 2, 4, 5, 6]])
  })

  it('herausnehmen und auflösen', async () => {
    expect(groupsOf((await toggle(pa, ev, 2, 6)).data)).toEqual([[1, 2, 4, 5]])
    await toggle(pa, ev, 1, 2)
    await toggle(pa, ev, 1, 4)
    // übrig: 1·5 → 5 heraus → Gruppe aus einem Whisky gibt es nicht
    expect(groupsOf((await toggle(pa, ev, 1, 5)).data)).toEqual([])
    const { data } = await pa.client.from('compare_marks').select('whisky_id').eq('event_id', ev)
    expect(data ?? []).toHaveLength(0)
  })

  it('nur verschiedene, ausgeschenkte Whiskies (TS026)', async () => {
    expect((await toggle(pb, ev, 3, 3)).error?.code).toBe('TS026')
    await service.from('tasting_events').update({ current_position: 3 }).eq('id', ev)
    expect((await toggle(pb, ev, 1, 4)).error?.code).toBe('TS026')
    expect((await toggle(pb, ev, 1, 3)).error).toBeNull()
    await service.from('tasting_events').update({ current_position: 6 }).eq('id', ev)
  })

  it('Steward und Außenstehender können nicht merken (TS026)', async () => {
    expect((await toggle(steward, ev, 1, 2)).error?.code).toBe('TS026')
    expect((await toggle(outsider, ev, 1, 2)).error?.code).toBe('TS026')
  })

  it('privat: niemand sonst liest fremde Merker, auch nicht der Admin', async () => {
    await toggle(pa, ev, 2, 3)
    for (const p of [pb, host, steward, admin, outsider]) {
      const { data } = await p.client
        .from('compare_marks')
        .select('whisky_id')
        .eq('event_id', ev)
        .eq('profile_id', pa.id)
      expect(data ?? []).toHaveLength(0)
    }
    const own = await pa.client.from('compare_marks').select('whisky_id').eq('event_id', ev)
    expect(own.data).toHaveLength(2)
  })

  it('kein direkter Schreibzugriff', async () => {
    const w = await service.from('whiskies').select('id').eq('event_id', ev).eq('position', 1).single()
    const ins = await pa.client
      .from('compare_marks')
      .insert({ event_id: ev, profile_id: pa.id, whisky_id: w.data!.id as string, group_no: 9 })
    expect(ins.error).not.toBeNull()
    const del = await pa.client.from('compare_marks').delete().eq('event_id', ev).select('whisky_id')
    expect(del.data ?? []).toHaveLength(0)
    const still = await pa.client.from('compare_marks').select('whisky_id').eq('event_id', ev)
    expect(still.data).toHaveLength(2)
  })

  it('beim Abschluss werden alle Merker gelöscht', async () => {
    const { error } = await steward.client.rpc('close_event', { p_event: ev })
    expect(error).toBeNull()
    const { count } = await service
      .from('compare_marks')
      .select('whisky_id', { count: 'exact', head: true })
      .eq('event_id', ev)
    expect(count).toBe(0)
    expect((await toggle(pa, ev, 1, 2)).error?.code).toBe('TS026')
  })
})
