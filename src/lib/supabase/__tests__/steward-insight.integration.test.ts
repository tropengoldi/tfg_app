/**
 * PROJ-20 · Whisky-Steward: Live-Einblick in Wertungen — DB-Regeln.
 *   - steward_ratings / steward_winner_tips: nur der Steward dieses Events, nur solange es läuft
 *   - abgewiesen (TS004): Entwurf, nach dem Abschluss, Gastgeber, Teilnehmer, Admin, Außenstehender,
 *     Steward eines anderen Events
 *   - Umfang: nur ausgeschenkte Whiskies, jeder Teilnehmer (ohne Wertung = leere Punkte), Notizen dabei
 *   - Tipps: je Teilnehmer der getippte Whisky oder leer
 *   - Zugriffsregeln unverändert: der Steward liest ratings / winner_tips direkt weiterhin nicht
 *   - Testkonten (PROJ-26): echter Steward eines Test-Tastings bekommt nichts
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

const PASSWORD = 'steward-insight-2026!'
const stamp = Date.now()
const email = (tag: string) => `sti-${tag}-${stamp}@example.com`
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

async function makeUser(tag: string, opts: { test?: boolean } = {}): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `STI ${tag}`, ...(opts.test ? { is_test: true } : {}) },
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
let otherSteward: Person
let outsider: Person
let tester: Person

async function closeAllActive() {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
}

/** Entwurf mit Steward (0,5er-Schritte), Teilnehmer host/pa/pb (+ extra), `n` Whiskies vom Gastgeber. */
async function draftEvent(
  location: string,
  stewardId: string,
  n = 3,
  extra: string[] = [],
): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    p_helper_id: stewardId,
    p_rating_step: 0.5, // halbe Punkte, damit 7,5 gültig ist (PROJ-19)
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id, pb.id, ...extra],
  })
  if (pErr) throw pErr
  for (let i = 1; i <= n; i++) {
    const { error: wErr } = await host.client.rpc('add_whisky', { p_event: evId, p_name: `STI-W${i}` })
    if (wErr) throw wErr
  }
  return evId
}

async function start(evId: string, by: Person) {
  await closeAllActive()
  const { error } = await by.client.rpc('start_event', { p_event: evId })
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

async function rate(p: Person, evId: string, position: number, nose: number, taste: number, notes?: string) {
  const { error } = await p.client.from('ratings').upsert(
    {
      event_id: evId,
      whisky_id: await whiskyAt(evId, position),
      profile_id: p.id,
      nose_points: nose,
      taste_points: taste,
      notes: notes ?? null,
    },
    { onConflict: 'whisky_id,profile_id' },
  )
  if (error) throw error
}

const ratingsAs = (p: Person, evId: string) => p.client.rpc('steward_ratings', { p_event: evId })
const tipsAs = (p: Person, evId: string) => p.client.rpc('steward_winner_tips', { p_event: evId })

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
  otherSteward = await makeUser('steward2')
  outsider = await makeUser('outsider')
  tester = await makeUser('tester', { test: true })
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

describe.skipIf(!RUN)('Einblick des Whisky-Stewards', () => {
  let ev = ''
  let otherEv = ''

  it('im Entwurf wird abgelehnt (TS004)', async () => {
    ev = await draftEvent(`STI-main-${stamp}`, steward.id)
    otherEv = await draftEvent(`STI-other-${stamp}`, otherSteward.id)
    expect((await ratingsAs(steward, ev)).error?.code).toBe('TS004')
    expect((await tipsAs(steward, ev)).error?.code).toBe('TS004')
  })

  it('laufend: nur der erste Whisky, jeder Teilnehmer, ohne Wertung leer', async () => {
    await start(ev, steward)
    const { data, error } = await ratingsAs(steward, ev)
    expect(error).toBeNull()
    expect(data).toHaveLength(3) // 1 Whisky × 3 Teilnehmer
    expect(new Set(data!.map((r) => r.whisky_position))).toEqual(new Set([1]))
    expect(new Set(data!.map((r) => r.rater_id))).toEqual(new Set([host.id, pa.id, pb.id]))
    expect(data!.every((r) => r.nose_points === null && r.notes === null)).toBe(true)
    expect(data![0].whisky_name).toBe('STI-W1')
  })

  it('zeigt Punkte, Summe und Notiz; 0 Punkte sind ein Wert, kein „offen"', async () => {
    await rate(pa, ev, 1, 4, 7.5, 'rauchig, Pfeffer')
    await rate(pb, ev, 1, 0, 0)
    const { data } = await ratingsAs(steward, ev)
    const byRater = new Map(data!.map((r) => [r.rater_id, r]))
    expect(Number(byRater.get(pa.id)!.nose_points)).toBe(4)
    expect(Number(byRater.get(pa.id)!.taste_points)).toBe(7.5)
    expect(Number(byRater.get(pa.id)!.total_points)).toBe(11.5)
    expect(byRater.get(pa.id)!.notes).toBe('rauchig, Pfeffer')
    expect(Number(byRater.get(pb.id)!.total_points)).toBe(0)
    expect(byRater.get(host.id)!.nose_points).toBeNull()
  })

  it('nach dem Weiterschalten kommen frühere und aktuelle Runde, nie spätere', async () => {
    const { error } = await steward.client.rpc('close_round', { p_event: ev, p_expected_position: 1 })
    expect(error).toBeNull()
    await rate(pa, ev, 2, 3, 6)
    const { data } = await ratingsAs(steward, ev)
    expect(data).toHaveLength(6)
    expect(new Set(data!.map((r) => r.whisky_position))).toEqual(new Set([1, 2]))
    // Änderung einer früheren Wertung ist sofort sichtbar
    await rate(pa, ev, 1, 5, 9, 'doch besser')
    const again = await ratingsAs(steward, ev)
    const paFirst = again.data!.find((r) => r.rater_id === pa.id && r.whisky_position === 1)!
    expect(Number(paFirst.total_points)).toBe(14)
    expect(paFirst.notes).toBe('doch besser')
  })

  it('Sieger-Tipps: getippter Whisky je Teilnehmer, sonst leer', async () => {
    expect((await pa.client.rpc('set_winner_tip', { p_event: ev, p_position: 2 })).error).toBeNull()
    const { data, error } = await tipsAs(steward, ev)
    expect(error).toBeNull()
    expect(data).toHaveLength(3)
    const byRater = new Map(data!.map((t) => [t.rater_id, t]))
    expect(byRater.get(pa.id)!.whisky_position).toBe(2)
    expect(byRater.get(pa.id)!.whisky_name).toBe('STI-W2')
    expect(byRater.get(pb.id)!.whisky_position).toBeNull()
  })

  it('alle anderen werden abgewiesen (TS004)', async () => {
    for (const p of [host, pa, admin, outsider, otherSteward]) {
      expect((await ratingsAs(p, ev)).error?.code).toBe('TS004')
      expect((await tipsAs(p, ev)).error?.code).toBe('TS004')
    }
  })

  it('Zugriffsregeln unverändert: direkt liest der Steward keine fremden Wertungen/Tipps', async () => {
    const r = await steward.client.from('ratings').select('id').eq('event_id', ev)
    expect(r.data ?? []).toHaveLength(0)
    const t = await steward.client.from('winner_tips').select('profile_id').eq('event_id', ev)
    expect(t.data ?? []).toHaveLength(0)
    // und Teilnehmer sehen weiter nur sich selbst
    const own = await pb.client.from('ratings').select('profile_id').eq('event_id', ev)
    expect(new Set((own.data ?? []).map((x) => x.profile_id))).toEqual(new Set([pb.id]))
  })

  it('nach dem Abschluss wird abgelehnt (TS004)', async () => {
    const { error } = await steward.client.rpc('close_event', { p_event: ev })
    expect(error).toBeNull()
    expect((await ratingsAs(steward, ev)).error?.code).toBe('TS004')
    expect((await tipsAs(steward, ev)).error?.code).toBe('TS004')
  })

  it('Steward des anderen Events bekommt dort Daten, für dieses nicht', async () => {
    await start(otherEv, otherSteward)
    expect((await ratingsAs(otherSteward, otherEv)).error).toBeNull()
    expect((await ratingsAs(steward, otherEv)).error?.code).toBe('TS004')
    await closeAllActive()
  })
})

describe.skipIf(!RUN)('Testkonten (PROJ-26)', () => {
  it('echter Steward eines Test-Tastings bekommt nichts', async () => {
    const ev = await draftEvent(`STI-test-${stamp}`, steward.id, 2, [tester.id])
    await start(ev, admin)
    expect((await ratingsAs(steward, ev)).error?.code).toBe('TS004')
    expect((await tipsAs(steward, ev)).error?.code).toBe('TS004')
    await closeAllActive()
  })
})
