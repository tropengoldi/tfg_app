/**
 * PROJ-19 · Flexible Punkteskala — DB-Regeln.
 *   - Bereich: 0 erlaubt, Maximum erlaubt, darüber/darunter abgelehnt (23514)
 *   - nur Vielfache von 0,5 (2,3 → 23514)
 *   - halbe Punkte im 1er-Tasting abgelehnt (TS021), im 0,5er-Tasting erlaubt
 *   - Schrittweite: Voreinstellung 1, nur 1 | 0,5 (TS021), nach dem Start
 *     nicht mehr änderbar (TS005)
 *   - Ranglisten-Sichten liefern Dezimal-Summen (keine Abschneidung)
 *   - Sammlungs-Note 0–10 in 0,5er-Schritten
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

const PASSWORD = 'rating-scale-2026!'
const stamp = Date.now()
const email = (tag: string) => `scale-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `SC ${tag}` },
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

async function draftEvent(location: string, step?: number): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    ...(step === undefined ? {} : { p_rating_step: step }),
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id],
  })
  if (pErr) throw pErr
  const { error: wErr } = await host.client.rpc('add_whisky', { p_event: evId, p_name: 'W1' })
  if (wErr) throw wErr
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

async function firstWhisky(evId: string): Promise<string> {
  const { data } = await service
    .from('whiskies')
    .select('id')
    .eq('event_id', evId)
    .order('position')
    .limit(1)
    .single()
  return data!.id as string
}

async function rate(evId: string, whiskyId: string, nose: number, taste: number) {
  return pa.client.from('ratings').upsert(
    {
      whisky_id: whiskyId,
      event_id: evId,
      profile_id: pa.id,
      nose_points: nose,
      taste_points: taste,
    },
    { onConflict: 'whisky_id,profile_id' },
  )
}

let wholeEvent = ''
let wholeWhisky = ''
let halfEvent = ''
let halfWhisky = ''

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

describe.skipIf(!RUN)('Schrittweite am Tasting', () => {
  it('Voreinstellung ist 1 (ganze Punkte)', async () => {
    wholeEvent = await draftEvent(`SC-whole-${stamp}`)
    const { data } = await service
      .from('tasting_events')
      .select('rating_step')
      .eq('id', wholeEvent)
      .single()
    expect(Number(data!.rating_step)).toBe(1)
  })

  it('0,5 lässt sich beim Anlegen wählen', async () => {
    halfEvent = await draftEvent(`SC-half-${stamp}`, 0.5)
    const { data } = await service
      .from('tasting_events')
      .select('rating_step')
      .eq('id', halfEvent)
      .single()
    expect(Number(data!.rating_step)).toBe(0.5)
  })

  it('andere Schrittweiten werden abgelehnt (TS021)', async () => {
    const { error } = await admin.client.rpc('create_event', {
      p_event_date: FUTURE,
      p_location: `SC-bad-${stamp}`,
      p_host_id: host.id,
      p_rating_step: 0.25,
    })
    expect(error?.code).toBe('TS021')
  })

  it('im Entwurf lässt sich die Schrittweite per update_event ändern', async () => {
    const ev = await draftEvent(`SC-upd-${stamp}`)
    const { error } = await admin.client.rpc('update_event', {
      p_event: ev,
      p_event_date: FUTURE,
      p_location: `SC-upd-${stamp}`,
      p_host_id: host.id,
      p_rating_step: 0.5,
    })
    expect(error).toBeNull()
    const { data } = await service.from('tasting_events').select('rating_step').eq('id', ev).single()
    expect(Number(data!.rating_step)).toBe(0.5)
  })

  it('nach dem Start ist die Schrittweite nicht mehr änderbar (TS005)', async () => {
    await start(wholeEvent)
    wholeWhisky = await firstWhisky(wholeEvent)
    const { error } = await admin.client.rpc('update_event', {
      p_event: wholeEvent,
      p_event_date: FUTURE,
      p_location: `SC-whole-${stamp}`,
      p_host_id: host.id,
      p_rating_step: 0.5,
    })
    expect(error?.code).toBe('TS005')
  })

  it('ein Teilnehmer kann die Schrittweite nicht direkt setzen', async () => {
    const { data } = await pa.client
      .from('tasting_events')
      .update({ rating_step: 0.5 })
      .eq('id', wholeEvent)
      .select('id')
    expect(data ?? []).toHaveLength(0)
    const { data: row } = await service
      .from('tasting_events')
      .select('rating_step')
      .eq('id', wholeEvent)
      .single()
    expect(Number(row!.rating_step)).toBe(1)
  })
})

describe.skipIf(!RUN)('Bewertungen im 1er-Tasting', () => {
  it('0 Punkte sind erlaubt', async () => {
    const { error } = await rate(wholeEvent, wholeWhisky, 0, 0)
    expect(error).toBeNull()
  })

  it('Maximum ist erlaubt', async () => {
    const { error } = await rate(wholeEvent, wholeWhisky, 5, 10)
    expect(error).toBeNull()
  })

  it('halbe Punkte werden abgelehnt (TS021)', async () => {
    const { error } = await rate(wholeEvent, wholeWhisky, 2.5, 7)
    expect(error?.code).toBe('TS021')
    expect(error?.message).toContain('nur ganze Punkte')
  })

  it('außerhalb des Bereichs wird abgelehnt (23514)', async () => {
    expect((await rate(wholeEvent, wholeWhisky, -1, 5)).error?.code).toBe('23514')
    expect((await rate(wholeEvent, wholeWhisky, 6, 5)).error?.code).toBe('23514')
    expect((await rate(wholeEvent, wholeWhisky, 3, 11)).error?.code).toBe('23514')
  })
})

describe.skipIf(!RUN)('Bewertungen im 0,5er-Tasting', () => {
  it('halbe Punkte sind erlaubt, Gesamtpunkte werden exakt berechnet', async () => {
    await start(halfEvent)
    halfWhisky = await firstWhisky(halfEvent)
    const { error } = await rate(halfEvent, halfWhisky, 2.5, 9.5)
    expect(error).toBeNull()
    const { data } = await pa.client
      .from('ratings')
      .select('nose_points, taste_points, total_points')
      .eq('whisky_id', halfWhisky)
      .eq('profile_id', pa.id)
      .single()
    expect(Number(data!.nose_points)).toBe(2.5)
    expect(Number(data!.taste_points)).toBe(9.5)
    expect(Number(data!.total_points)).toBe(12)
  })

  it('andere Nachkommastellen werden abgelehnt (23514)', async () => {
    expect((await rate(halfEvent, halfWhisky, 2.3, 5)).error?.code).toBe('23514')
    expect((await rate(halfEvent, halfWhisky, 2, 5.25)).error?.code).toBe('23514')
  })

  it('5,5 / 10,5 liegen außerhalb (23514)', async () => {
    expect((await rate(halfEvent, halfWhisky, 5.5, 5)).error?.code).toBe('23514')
    expect((await rate(halfEvent, halfWhisky, 3, 10.5)).error?.code).toBe('23514')
  })

  it('Ranglisten-Sichten liefern halbe Punkte nach dem Abschluss (kein Abschneiden)', async () => {
    await rate(halfEvent, halfWhisky, 4.5, 8.5)
    const { error: hErr } = await host.client.from('ratings').upsert(
      {
        whisky_id: halfWhisky,
        event_id: halfEvent,
        profile_id: host.id,
        nose_points: 3,
        taste_points: 7.5,
      },
      { onConflict: 'whisky_id,profile_id' },
    )
    expect(hErr).toBeNull()
    const { error: cErr } = await host.client.rpc('close_event', { p_event: halfEvent })
    expect(cErr).toBeNull()

    const { data: rank } = await pa.client
      .from('whisky_rankings')
      .select('nose_total, taste_total, total_points, rating_count')
      .eq('whisky_id', halfWhisky)
      .single()
    expect(Number(rank!.nose_total)).toBe(7.5)
    expect(Number(rank!.taste_total)).toBe(16)
    expect(Number(rank!.total_points)).toBe(23.5)
    expect(rank!.rating_count).toBe(2)

    const { data: past } = await pa.client
      .from('past_tastings')
      .select('winner_points')
      .eq('event_id', halfEvent)
      .single()
    expect(Number(past!.winner_points)).toBe(23.5)

    const { data: breakdown } = await pa.client
      .from('whisky_score_breakdown')
      .select('rater_id, nose_points, taste_points, total_points')
      .eq('whisky_id', halfWhisky)
    const mine = (breakdown ?? []).find((b) => b.rater_id === pa.id)!
    expect(Number(mine.nose_points)).toBe(4.5)
    expect(Number(mine.total_points)).toBe(13)
  })
})

describe.skipIf(!RUN)('Sammlungs-Note', () => {
  it('0, 7,5 und 10 sind erlaubt; leer bleibt erlaubt', async () => {
    for (const rating of [0, 7.5, 10, null]) {
      const { error } = await pa.client
        .from('collection_entries')
        .insert({ profile_id: pa.id, name: `SC-${rating}`, rating })
      expect(error).toBeNull()
    }
    const { data } = await pa.client
      .from('collection_entries')
      .select('rating')
      .eq('profile_id', pa.id)
      .eq('name', 'SC-7.5')
      .single()
    expect(Number(data!.rating)).toBe(7.5)
  })

  it('außerhalb 0–10 oder kein halber Schritt wird abgelehnt (23514)', async () => {
    for (const rating of [-0.5, 10.5, 7.3]) {
      const { error } = await pa.client
        .from('collection_entries')
        .insert({ profile_id: pa.id, name: `SC-bad-${rating}`, rating })
      expect(error?.code).toBe('23514')
    }
  })
})
