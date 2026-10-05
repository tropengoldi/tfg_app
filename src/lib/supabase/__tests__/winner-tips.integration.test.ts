/**
 * PROJ-22 · Sieger-Tipp & „Kenner der Woche" — DB-Regeln.
 *   - set_winner_tip: nur im laufenden Tasting, nur Teilnehmer, nur gültige Nummer (TS023)
 *   - ein Tipp pro Person; ein zweiter Aufruf ersetzt
 *   - Whisky-Steward und Außenstehende können nicht tippen
 *   - Blindheit: während des Tastings sieht niemand fremde Tipps (Tabelle + Sicht)
 *   - nach dem Abschluss: winner_tips_revealed mit is_correct (Rang 1 + es gab Bewertungen)
 *   - profiles_public trägt show_kenner_count
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

const PASSWORD = 'winner-tips-2026!'
const stamp = Date.now()
const email = (tag: string) => `tips-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `TP ${tag}` },
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

/** Event mit Whisky-Steward, Teilnehmer host/pa/pb, `n` Whiskies (von host eingetragen). */
async function draftEvent(location: string, n = 3): Promise<string> {
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
    const { error: wErr } = await host.client.rpc('add_whisky', { p_event: evId, p_name: `TP-W${i}` })
    if (wErr) throw wErr
  }
  return evId
}

async function start(evId: string) {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
  const { error } = await steward.client.rpc('start_event', { p_event: evId })
  if (error) throw error
}

async function whiskyAt(evId: string, position: number): Promise<string> {
  const { data } = await service
    .from('whiskies')
    .select('id')
    .eq('event_id', evId)
    .eq('position', position)
    .single()
  return data!.id as string
}

const tip = (p: Person, evId: string, position: number) =>
  p.client.rpc('set_winner_tip', { p_event: evId, p_position: position })

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
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
    .then(undefined, () => {})
  for (const id of eventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Tippen während des Tastings', () => {
  let ev = ''

  it('im Entwurf wird ein Tipp abgelehnt (TS023)', async () => {
    ev = await draftEvent(`TP-main-${stamp}`)
    const { error } = await tip(pa, ev, 1)
    expect(error?.code).toBe('TS023')
  })

  it('Teilnehmer tippt; ein zweiter Tipp ersetzt den ersten', async () => {
    await start(ev)
    expect((await tip(pa, ev, 2)).error).toBeNull()
    expect((await tip(pa, ev, 3)).error).toBeNull()
    const { data } = await pa.client.from('winner_tips').select('whisky_id').eq('event_id', ev)
    expect(data).toHaveLength(1)
    expect(data![0].whisky_id).toBe(await whiskyAt(ev, 3))
  })

  it('auch der Gastgeber (verkostet mit) darf tippen', async () => {
    expect((await tip(host, ev, 1)).error).toBeNull()
    expect((await tip(pb, ev, 1)).error).toBeNull()
  })

  it('Whisky-Steward und Außenstehende können nicht tippen (TS023)', async () => {
    expect((await tip(steward, ev, 1)).error?.code).toBe('TS023')
    expect((await tip(outsider, ev, 1)).error?.code).toBe('TS023')
  })

  it('ungültige Nummer wird abgelehnt (TS023)', async () => {
    expect((await tip(pa, ev, 9)).error?.code).toBe('TS023')
  })

  it('direktes Schreiben in die Tabelle ist nicht möglich', async () => {
    const { error } = await pa.client
      .from('winner_tips')
      .insert({ event_id: ev, profile_id: pa.id, whisky_id: await whiskyAt(ev, 1) })
    expect(error).toBeTruthy()
  })

  it('Blindheit: niemand sieht fremde Tipps — weder Tabelle noch Sicht', async () => {
    for (const viewer of [pa, host, steward, admin, outsider]) {
      const { data } = await viewer.client.from('winner_tips').select('profile_id').eq('event_id', ev)
      for (const row of data ?? []) expect(row.profile_id).toBe(viewer.id)
      const { data: rev } = await viewer.client
        .from('winner_tips_revealed')
        .select('profile_id')
        .eq('event_id', ev)
      expect(rev ?? []).toHaveLength(0)
    }
  })

  it('nach dem Abschluss: Sicht deckt alle Tipps auf, „richtig" = Rang 1', async () => {
    // Whisky #3 gewinnt klar.
    const w1 = await whiskyAt(ev, 1)
    const w3 = await whiskyAt(ev, 3)
    for (const p of [host, pa, pb]) {
      const { error } = await service.from('ratings').insert([
        { whisky_id: w3, event_id: ev, profile_id: p.id, nose_points: 5, taste_points: 10 },
        { whisky_id: w1, event_id: ev, profile_id: p.id, nose_points: 1, taste_points: 1 },
      ])
      expect(error).toBeNull()
    }
    const { error: cErr } = await steward.client.rpc('close_event', { p_event: ev })
    expect(cErr).toBeNull()

    const { data } = await outsider.client
      .from('winner_tips_revealed')
      .select('profile_id, position, rank, is_correct, display_name, whisky_name')
      .eq('event_id', ev)
    expect(data).toHaveLength(3)
    const byId = new Map((data ?? []).map((r) => [r.profile_id, r]))
    expect(byId.get(pa.id)!.position).toBe(3)
    expect(byId.get(pa.id)!.is_correct).toBe(true)
    expect(byId.get(pb.id)!.is_correct).toBe(false)
    expect(byId.get(host.id)!.is_correct).toBe(false)
    expect(byId.get(pa.id)!.whisky_name).toBe('TP-W3')
  })

  it('nach dem Abschluss ist kein Tipp mehr möglich (TS023)', async () => {
    expect((await tip(pb, ev, 3)).error?.code).toBe('TS023')
  })
})

describe.skipIf(!RUN)('Sonderfälle', () => {
  it('Tasting ohne jede Bewertung: niemand ist Kenner', async () => {
    const ev = await draftEvent(`TP-none-${stamp}`, 2)
    await start(ev)
    expect((await tip(pa, ev, 1)).error).toBeNull()
    const { error } = await steward.client.rpc('close_event', { p_event: ev })
    expect(error).toBeNull()
    const { data } = await pb.client
      .from('winner_tips_revealed')
      .select('is_correct')
      .eq('event_id', ev)
    expect(data).toHaveLength(1)
    expect(data![0].is_correct).toBe(false)
  })

  it('profiles_public liefert show_kenner_count; eigener Schalter ist änderbar', async () => {
    const { error } = await pa.client
      .from('profiles')
      .update({ show_kenner_count: false })
      .eq('id', pa.id)
    expect(error).toBeNull()
    const { data } = await pb.client
      .from('profiles_public')
      .select('show_kenner_count')
      .eq('id', pa.id)
      .single()
    expect(data!.show_kenner_count).toBe(false)
  })
})
