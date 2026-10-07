/**
 * PROJ-21 · Whisky-Steward bringt Whiskies mit — DB-Regeln.
 *   - add_whisky: Steward darf eintragen, Limit wie Teilnehmer (kein Bonus), Obergrenze 10,
 *     nur im Entwurf; Außenstehender weiter abgewiesen (TS004)
 *   - Steward ändert/entfernt seinen Whisky wie ein Teilnehmer
 *   - Blindheit: Gastgeber-mit-Steward und Teilnehmer sehen den Steward-Whisky vor dem Abschluss nicht
 *   - update_event: Steward wechseln/entfernen mit eingetragenen Whiskies → TS009; ohne → erlaubt
 *   - nach dem Abschluss: Rangliste führt den Steward als Bringer
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

const PASSWORD = 'steward-whiskies-2026!'
const stamp = Date.now()
const email = (tag: string) => `stw-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `STW ${tag}` },
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
let steward: Person
let steward2: Person
let outsider: Person

async function closeAllActive() {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
}

async function draftEvent(location: string, maxWhiskies: number | null): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    p_helper_id: steward.id,
    ...(maxWhiskies === null ? {} : { p_max_whiskies: maxWhiskies }),
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id],
  })
  if (pErr) throw pErr
  return evId
}

const add = (p: Person, evId: string, name: string) =>
  p.client.rpc('add_whisky', { p_event: evId, p_name: name })

/** update_event mit den Eckdaten des Tests, nur der Steward variiert. */
const setSteward = (evId: string, stewardId: string | null, maxWhiskies: number | null = 1) =>
  admin.client.rpc('update_event', {
    p_event: evId,
    p_event_date: FUTURE,
    p_location: `STW-upd-${stamp}`,
    p_host_id: host.id,
    ...(stewardId === null ? {} : { p_helper_id: stewardId }),
    ...(maxWhiskies === null ? {} : { p_max_whiskies: maxWhiskies }),
  })

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
  steward = await makeUser('steward')
  steward2 = await makeUser('steward2')
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

describe.skipIf(!RUN)('Steward trägt Whiskies ein', () => {
  let ev = ''
  let stewardWhisky = ''

  it('Limit 1: Steward darf einen, der zweite → TS003; Gastgeber behält seinen Bonus', async () => {
    ev = await draftEvent(`STW-main-${stamp}`, 1)
    const first = await add(steward, ev, 'Steward-Dram')
    expect(first.error).toBeNull()
    stewardWhisky = first.data as string
    expect((await add(steward, ev, 'Steward-Dram-2')).error?.code).toBe('TS003')

    expect((await add(host, ev, 'Host-1')).error).toBeNull()
    expect((await add(host, ev, 'Host-2')).error).toBeNull()
    expect((await add(host, ev, 'Host-3')).error?.code).toBe('TS003')
    expect((await add(pa, ev, 'PA-1')).error).toBeNull()
  })

  it('der Steward ist als Bringer eingetragen und sieht seinen Whisky', async () => {
    const { data } = await steward.client
      .from('whisky_details')
      .select('whisky_id, brought_by, name')
      .eq('whisky_id', stewardWhisky)
      .single()
    expect(data?.brought_by).toBe(steward.id)
    expect(data?.name).toBe('Steward-Dram')
  })

  it('Außenstehender wird weiter abgewiesen (TS004)', async () => {
    expect((await add(outsider, ev, 'Fremd')).error?.code).toBe('TS004')
  })

  it('Blindheit: Gastgeber-mit-Steward und Teilnehmer sehen den Steward-Whisky nicht', async () => {
    for (const p of [host, pa]) {
      const { data } = await p.client
        .from('whisky_details')
        .select('whisky_id')
        .eq('whisky_id', stewardWhisky)
      expect(data ?? []).toHaveLength(0)
    }
  })

  it('Steward ändert seinen Whisky im Entwurf', async () => {
    const { data, error } = await steward.client
      .from('whisky_details')
      .update({ name: 'Steward-Dram (neu)' })
      .eq('whisky_id', stewardWhisky)
      .select('name')
    expect(error).toBeNull()
    expect(data?.[0]?.name).toBe('Steward-Dram (neu)')
  })

  it('Steward-Wechsel mit eingetragenen Whiskies → TS009 (wechseln und entfernen)', async () => {
    expect((await setSteward(ev, steward2.id)).error?.code).toBe('TS009')
    expect((await setSteward(ev, null)).error?.code).toBe('TS009')
    // Eckdaten ändern bei gleichem Steward bleibt erlaubt
    expect((await setSteward(ev, steward.id)).error).toBeNull()
  })

  it('nach dem Start: Eintragen → TS005; Rangliste nach Abschluss führt den Steward als Bringer', async () => {
    await closeAllActive()
    expect((await steward.client.rpc('start_event', { p_event: ev })).error).toBeNull()
    expect((await add(steward, ev, 'Zu spät')).error?.code).toBe('TS005')
    // Teilnehmer bewertet den Steward-Whisky wie jeden anderen
    const { data: w } = await service.from('whiskies').select('position').eq('id', stewardWhisky).single()
    const { error: rErr } = await service.from('ratings').insert({
      whisky_id: stewardWhisky,
      event_id: ev,
      profile_id: pa.id,
      nose_points: 4,
      taste_points: 8,
    })
    expect(rErr).toBeNull()
    expect(w?.position).toBeGreaterThan(0)
    expect((await steward.client.rpc('close_event', { p_event: ev })).error).toBeNull()

    const { data: rank } = await pa.client
      .from('whisky_rankings')
      .select('whisky_id, brought_by')
      .eq('whisky_id', stewardWhisky)
      .single()
    expect(rank?.brought_by).toBe(steward.id)
  })
})

describe.skipIf(!RUN)('Steward entfernt seinen Whisky, dann ist der Wechsel frei', () => {
  it('remove_whisky durch den Steward, danach Steward-Wechsel erlaubt', async () => {
    const ev = await draftEvent(`STW-swap-${stamp}`, 1)
    const res = await add(steward, ev, 'Kurz-Dram')
    expect(res.error).toBeNull()
    expect((await setSteward(ev, steward2.id)).error?.code).toBe('TS009')
    expect((await steward.client.rpc('remove_whisky', { p_whisky: res.data as string })).error).toBeNull()
    expect((await setSteward(ev, steward2.id)).error).toBeNull()
    // der neue Steward darf eintragen, der alte nicht mehr
    expect((await add(steward2, ev, 'Neu-Dram')).error).toBeNull()
    expect((await add(steward, ev, 'Alt-Dram')).error?.code).toBe('TS004')
  })
})

describe.skipIf(!RUN)('ohne Limit gilt nur die Obergrenze 10', () => {
  it('Steward darf mehrere, bis der Abend 10 Whiskies hat (TS016)', async () => {
    const ev = await draftEvent(`STW-cap-${stamp}`, null)
    for (let i = 1; i <= 8; i++) expect((await add(host, ev, `Cap-H${i}`)).error).toBeNull()
    expect((await add(steward, ev, 'Cap-S1')).error).toBeNull()
    expect((await add(steward, ev, 'Cap-S2')).error).toBeNull()
    expect((await add(steward, ev, 'Cap-S3')).error?.code).toBe('TS016')
  })
})
