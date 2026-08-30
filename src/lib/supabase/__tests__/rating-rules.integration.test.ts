/**
 * PROJ-7 · Bewertungsansicht: die Regeln hinter dem Bewertungs-Upsert.
 *   - nur ausgeschenkte Whiskys sind bewertbar (can_rate_whisky)
 *   - nur die eigene Bewertung ist les-/schreibbar (vor dem Abschluss)
 *   - Event-Abschluss friert ein (TS001), Rundenabschluss nicht
 *   - nach dem Abschluss kommen die Punkte der Runde aus whisky_score_breakdown
 *     (PROJ-9), die rohe ratings-Zeile bleibt privat; die eigene Notiz auch
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

const PASSWORD = 'rating-rules-2026!'
const stamp = Date.now()
const email = (tag: string) => `rating-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `RT ${tag}` },
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

async function runningEvent(location: string, whiskyCount = 3, position = 1) {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')

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
    p_profile_ids: [host.id, pa.id, pb.id],
  })
  if (pErr) throw pErr

  for (let i = 0; i < whiskyCount; i++) {
    const { error: wErr } = await host.client.rpc('add_whisky', {
      p_event: evId,
      p_name: `W${i + 1}`,
    })
    if (wErr) throw wErr
  }
  const { error: sErr } = await host.client.rpc('start_event', { p_event: evId })
  if (sErr) throw sErr
  if (position > 1) {
    for (let p = 1; p < position; p++) {
      const { error: cErr } = await host.client.rpc('close_round', {
        p_event: evId,
        p_expected_position: p,
      })
      if (cErr) throw cErr
    }
  }
  return evId
}

async function whiskyIds(eventId: string): Promise<string[]> {
  const { data } = await service
    .from('whiskies')
    .select('id, position')
    .eq('event_id', eventId)
    .order('position')
  return (data ?? []).map((w) => w.id as string)
}

async function rate(person: Person, eventId: string, whiskyId: string, nose: number, taste: number) {
  return person.client.from('ratings').upsert(
    {
      whisky_id: whiskyId,
      event_id: eventId,
      profile_id: person.id,
      nose_points: nose,
      taste_points: taste,
    },
    { onConflict: 'whisky_id,profile_id' },
  )
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
  pa = await makeUser('pa')
  pb = await makeUser('pb')
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

describe.skipIf(!RUN)('was bewertbar ist', () => {
  it('ausgeschenkter Whisky (Position ≤ aktuell) lässt sich bewerten', async () => {
    const ev = await runningEvent(`RT-ok-${stamp}`, 3, 1)
    const [w1] = await whiskyIds(ev)
    const { error } = await rate(pa, ev, w1, 3, 7)
    expect(error).toBeNull()

    const { data } = await service
      .from('ratings')
      .select('nose_points, taste_points, total_points')
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
      .single()
    expect(data!.total_points).toBe(10)
  })

  it('noch nicht ausgeschenkter Whisky wird abgelehnt', async () => {
    const ev = await runningEvent(`RT-early-${stamp}`, 3, 1)
    const ids = await whiskyIds(ev)
    const { error } = await rate(pa, ev, ids[2], 4, 8) // Position 3, aktuell 1
    expect(error).not.toBeNull()
  })
})

describe.skipIf(!RUN)('nur die eigene Bewertung', () => {
  it('ein anderer Teilnehmer kann die Bewertung nicht ändern (0 Zeilen)', async () => {
    const ev = await runningEvent(`RT-own-${stamp}`, 3, 1)
    const [w1] = await whiskyIds(ev)
    expect((await rate(pa, ev, w1, 3, 7)).error).toBeNull()

    const { data, error } = await pb.client
      .from('ratings')
      .update({ nose_points: 1, taste_points: 1 })
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
      .select('whisky_id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)

    const { data: still } = await service
      .from('ratings')
      .select('nose_points')
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
      .single()
    expect(still!.nose_points).toBe(3)
  })

  it('vor dem Abschluss sieht ein anderer Teilnehmer / der Gastgeber die fremden Punkte nicht', async () => {
    const ev = await runningEvent(`RT-blind-${stamp}`, 3, 1)
    const [w1] = await whiskyIds(ev)
    expect((await rate(pa, ev, w1, 5, 9)).error).toBeNull()

    const { data: asPb } = await pb.client
      .from('ratings')
      .select('whisky_id')
      .eq('event_id', ev)
    expect(asPb ?? []).toHaveLength(0)

    const { data: asHost } = await host.client
      .from('ratings')
      .select('whisky_id')
      .eq('event_id', ev)
    expect(asHost ?? []).toHaveLength(0)
  })
})

describe.skipIf(!RUN)('Sperre', () => {
  it('nach dem Event-Abschluss lässt sich nichts mehr ändern (TS001)', async () => {
    const ev = await runningEvent(`RT-lock-${stamp}`, 2, 1)
    const [w1] = await whiskyIds(ev)
    expect((await rate(pa, ev, w1, 3, 6)).error).toBeNull()

    const { error: clErr } = await host.client.rpc('close_event', { p_event: ev })
    expect(clErr).toBeNull()

    const { error } = await pa.client
      .from('ratings')
      .update({ nose_points: 5 })
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
    expect(error?.code).toBe('TS001')
  })

  it('nach einem reinen Rundenabschluss bleibt die Bewertung änderbar', async () => {
    const ev = await runningEvent(`RT-round-${stamp}`, 3, 1)
    const [w1] = await whiskyIds(ev)
    expect((await rate(pa, ev, w1, 2, 4)).error).toBeNull()

    const { error: crErr } = await host.client.rpc('close_round', {
      p_event: ev,
      p_expected_position: 1,
    })
    expect(crErr).toBeNull()

    const { error } = await pa.client
      .from('ratings')
      .update({ nose_points: 4, taste_points: 9 })
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
      .select('whisky_id')
    expect(error).toBeNull()
  })

  it('nach dem Abschluss: die Punkte der Runde kommen aus der Aufschlüsselungs-View, NICHT aus der ratings-Tabelle', async () => {
    const ev = await runningEvent(`RT-reveal-${stamp}`, 2, 1)
    const [w1] = await whiskyIds(ev)
    expect((await rate(pa, ev, w1, 4, 8)).error).toBeNull()
    expect((await host.client.rpc('close_event', { p_event: ev })).error).toBeNull()

    // Roh: pb sieht die fremde ratings-Zeile von pa auch nach dem Abschluss nicht.
    const { data: asPbRaw } = await pb.client
      .from('ratings')
      .select('whisky_id, profile_id')
      .eq('event_id', ev)
    expect((asPbRaw ?? []).some((r) => r.profile_id === pa.id)).toBe(false)

    // Geteilte Sicht: über whisky_score_breakdown sind die Punkte von pa da.
    const { data: asPbView, error } = await pb.client
      .from('whisky_score_breakdown')
      .select('whisky_id, rater_id, total_points')
      .eq('event_id', ev)
    expect(error).toBeNull()
    expect((asPbView ?? []).some((r) => r.rater_id === pa.id && r.total_points === 12)).toBe(true)
  })

  it('nach dem Abschluss bleibt die eigene Notiz für den Verfasser lesbar, für andere nicht', async () => {
    const ev = await runningEvent(`RT-note-${stamp}`, 2, 1)
    const [w1] = await whiskyIds(ev)
    expect(
      (
        await pa.client.from('ratings').upsert(
          {
            whisky_id: w1,
            event_id: ev,
            profile_id: pa.id,
            nose_points: 3,
            taste_points: 6,
            notes: 'Torf und Seetang',
          },
          { onConflict: 'whisky_id,profile_id' },
        )
      ).error,
    ).toBeNull()
    expect((await host.client.rpc('close_event', { p_event: ev })).error).toBeNull()

    const { data: mine } = await pa.client
      .from('ratings')
      .select('notes')
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
      .single()
    expect(mine!.notes).toBe('Torf und Seetang')

    const { data: theirs } = await pb.client
      .from('ratings')
      .select('notes')
      .eq('whisky_id', w1)
      .eq('profile_id', pa.id)
    expect(theirs ?? []).toHaveLength(0)
  })
})
