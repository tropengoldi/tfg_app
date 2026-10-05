/**
 * PROJ-25 · Erweiterte Ergebnis-Statistiken — DB-Regeln.
 *   - Alkohol / Alter / Preis lassen sich beim Eintragen und Ändern speichern
 *   - vor dem Abschluss sieht ein Teilnehmer (nicht Bringer) sie NICHT —
 *     weder über whisky_rankings noch über whisky_details (Blindheit unverändert)
 *   - nach dem Abschluss liefert whisky_rankings sie an jedes aktive Mitglied
 *   - past_tastings.winner_rating_count: Sieger auch bei reinen 0-Punkten (PROJ-19 BUG-2)
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

const PASSWORD = 'results-stats-2026!'
const stamp = Date.now()
const email = (tag: string) => `stats-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `ST ${tag}` },
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
let guest: Person
let outsider: Person

async function draftEvent(location: string): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, bringer.id, guest.id],
  })
  if (pErr) throw pErr
  return evId
}

async function start(evId: string) {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
  const { error } = await host.client.rpc('start_event', { p_event: evId })
  if (error) throw error
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
  bringer = await makeUser('bringer')
  guest = await makeUser('guest')
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

describe.skipIf(!RUN)('Alkohol / Alter / Preis: Erfassung und Freigabe', () => {
  let ev = ''
  let whiskyId = ''

  it('der Bringer kann die Angaben beim Eintragen speichern', async () => {
    ev = await draftEvent(`ST-main-${stamp}`)
    const { error } = await bringer.client.rpc('add_whisky', {
      p_event: ev,
      p_name: 'Springbank 15',
      p_abv: 46.3,
      p_age_years: 15,
      p_price_eur: 109.9,
    })
    expect(error).toBeNull()
    const { data } = await service
      .from('whiskies')
      .select('id')
      .eq('event_id', ev)
      .single()
    whiskyId = data!.id as string
    const { data: wd } = await bringer.client
      .from('whisky_details')
      .select('abv, age_years, price_eur')
      .eq('whisky_id', whiskyId)
      .single()
    expect(Number(wd!.abv)).toBe(46.3)
    expect(wd!.age_years).toBe(15)
    expect(Number(wd!.price_eur)).toBe(109.9)
  })

  it('der Bringer kann die Angaben im Entwurf ändern', async () => {
    const { data, error } = await bringer.client
      .from('whisky_details')
      .update({ abv: 46, age_years: 18, price_eur: 129 })
      .eq('whisky_id', whiskyId)
      .select('whisky_id')
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('während des Tastings sieht ein Teilnehmer die Angaben nicht (Sicht und Tabelle)', async () => {
    await start(ev)
    const { data: view } = await guest.client
      .from('whisky_rankings')
      .select('abv, age_years, price_eur')
      .eq('event_id', ev)
    expect(view ?? []).toHaveLength(0)
    const { data: table } = await guest.client
      .from('whisky_details')
      .select('abv, age_years, price_eur')
      .eq('whisky_id', whiskyId)
    expect(table ?? []).toHaveLength(0)
  })

  it('nach dem Abschluss liefert whisky_rankings die Angaben an jedes aktive Mitglied', async () => {
    const { error } = await host.client.rpc('close_event', { p_event: ev })
    expect(error).toBeNull()
    for (const viewer of [guest, outsider]) {
      const { data } = await viewer.client
        .from('whisky_rankings')
        .select('abv, age_years, price_eur')
        .eq('whisky_id', whiskyId)
        .single()
      expect(Number(data!.abv)).toBe(46)
      expect(data!.age_years).toBe(18)
      expect(Number(data!.price_eur)).toBe(129)
    }
  })
})

describe.skipIf(!RUN)('Historie: Sieger auch bei reinen 0-Punkten (PROJ-19 BUG-2)', () => {
  it('winner_rating_count > 0, obwohl winner_points = 0', async () => {
    const ev = await draftEvent(`ST-zero-${stamp}`)
    const { error: wErr } = await bringer.client.rpc('add_whisky', { p_event: ev, p_name: 'Null-Dram' })
    expect(wErr).toBeNull()
    await start(ev)
    const { data: w } = await service.from('whiskies').select('id').eq('event_id', ev).single()
    const { error: rErr } = await guest.client.from('ratings').upsert(
      { whisky_id: w!.id, event_id: ev, profile_id: guest.id, nose_points: 0, taste_points: 0 },
      { onConflict: 'whisky_id,profile_id' },
    )
    expect(rErr).toBeNull()
    const { error: cErr } = await host.client.rpc('close_event', { p_event: ev })
    expect(cErr).toBeNull()

    const { data } = await outsider.client
      .from('past_tastings')
      .select('winner_name, winner_points, winner_rating_count')
      .eq('event_id', ev)
      .single()
    expect(data!.winner_name).toBe('Null-Dram')
    expect(Number(data!.winner_points)).toBe(0)
    expect(data!.winner_rating_count).toBe(1)
  })

  it('ohne jede Bewertung ist winner_rating_count 0', async () => {
    const ev = await draftEvent(`ST-none-${stamp}`)
    await bringer.client.rpc('add_whisky', { p_event: ev, p_name: 'Unbewertet' })
    await start(ev)
    await host.client.rpc('close_event', { p_event: ev })
    const { data } = await outsider.client
      .from('past_tastings')
      .select('winner_rating_count')
      .eq('event_id', ev)
      .single()
    expect(data!.winner_rating_count).toBe(0)
  })
})
