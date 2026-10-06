/**
 * PROJ-26 · Testkonten für normale Nutzer unsichtbar — DB-Regeln.
 *   - Konto-Anlage übernimmt is_test aus den Metadaten; Mitglieder können is_test nicht ändern
 *   - normales Mitglied: keine Testkonten (profiles, profiles_public), keine Test-Tastings
 *     (Tabelle, Teilnehmer, Whiskys, Details, alle Sichten) — auch nicht als Teilnehmer
 *   - Testkonto: sieht echte Daten + Test-Welt; Admin sieht alles; Sichten tragen is_test
 *   - Sammlung eines Testkontos für Mitglieder unsichtbar
 *   - admin_set_test_account / admin_test_account_impact (TS004, TS025, Auswirkung)
 *   - Testkonto ↔ Admin schließen sich aus (set_member_admin TS025 + Constraint)
 *   - resolve_message_recipients: Testkonto → nur Testkonten (TS024); unsichtbare fallen raus
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

const PASSWORD = 'test-accounts-2026!'
const stamp = Date.now()
const email = (tag: string) => `tst26-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
    // is_test in user_metadata (beim INSERT vorhanden; app_metadata setzt GoTrue erst danach)
    user_metadata: { display_name: `T26 ${tag}`, ...(opts.test ? { is_test: true } : {}) },
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
let m1: Person // echtes Mitglied, Gastgeber des echten Tastings
let m2: Person // echtes Mitglied, auch Teilnehmer im Test-Tasting (gemischt)
let t1: Person // Testkonto (über die Metadaten der Anlage), Gastgeber des Test-Tastings
let t2: Person // Testkonto, nicht beteiligt
let realEv = ''
let testEv = ''

/** Abgeschlossenes Tasting: Gastgeber + Teilnehmer, je ein Whisky, alle bewerten alles. */
async function closedEvent(location: string, host: Person, others: Person[]): Promise<string> {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: '2025-06-01',
    p_location: location,
    p_host_id: host.id,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const everyone = [host, ...others]
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: everyone.map((p) => p.id),
  })
  if (pErr) throw pErr
  for (const p of everyone) {
    const { error: wErr } = await p.client.rpc('add_whisky', { p_event: evId, p_name: `${location}-${p.id.slice(0, 4)}` })
    if (wErr) throw wErr
  }
  const { data: ws } = await service.from('whiskies').select('id').eq('event_id', evId)
  for (const w of ws ?? []) {
    for (const p of everyone) {
      const { error: rErr } = await service.from('ratings').insert({
        whisky_id: w.id,
        event_id: evId,
        profile_id: p.id,
        nose_points: 3,
        taste_points: 7,
      })
      if (rErr) throw rErr
    }
  }
  const now = new Date().toISOString()
  const { error: cErr } = await service
    .from('tasting_events')
    .update({ status: 'closed', started_at: now, closed_at: now })
    .eq('id', evId)
  if (cErr) throw cErr
  return evId
}

const ids = (rows: { [k: string]: unknown }[] | null, key = 'id') =>
  (rows ?? []).map((r) => r[key] as string)

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
  if (error) throw error
  m1 = await makeUser('m1')
  m2 = await makeUser('m2')
  t1 = await makeUser('t1', { test: true })
  t2 = await makeUser('t2', { test: true })

  realEv = await closedEvent(`T26-real-${stamp}`, m1, [m2])
  testEv = await closedEvent(`T26-test-${stamp}`, t1, [m2])
  await service.from('winner_tips').insert([
    { event_id: testEv, profile_id: t1.id, whisky_id: (await service.from('whiskies').select('id').eq('event_id', testEv).limit(1).single()).data!.id },
  ])
  await service.from('collection_entries').insert({ profile_id: t1.id, name: 'T26 Sammlung' })
  await service.from('profiles').update({ show_collection: true }).eq('id', t1.id)
}, 180_000)

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of eventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Merkmal Testkonto', () => {
  it('Konto-Anlage übernimmt is_test aus den Metadaten', async () => {
    const { data } = await service.from('profiles').select('id, is_test').in('id', [t1.id, m1.id])
    const byId = new Map((data ?? []).map((r) => [r.id, r.is_test]))
    expect(byId.get(t1.id)).toBe(true)
    expect(byId.get(m1.id)).toBe(false)
  })

  it('ein Mitglied kann sein eigenes is_test nicht ändern', async () => {
    const { error } = await m1.client.from('profiles').update({ is_test: true }).eq('id', m1.id)
    expect(error).not.toBeNull()
    const { data } = await service.from('profiles').select('is_test').eq('id', m1.id).single()
    expect(data!.is_test).toBe(false)
  })

  it('Testkonto und Admin schließen sich aus (Constraint)', async () => {
    const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', t2.id)
    expect(error?.code).toBe('23514')
  })
})

describe.skipIf(!RUN)('Profile', () => {
  it('normales Mitglied sieht keine Testkonten (Tabelle + profiles_public)', async () => {
    const { data: p } = await m1.client.from('profiles').select('id').in('id', [t1.id, t2.id, m2.id])
    expect(ids(p)).toEqual([m2.id])
    const { data: pp } = await m1.client
      .from('profiles_public')
      .select('id')
      .in('id', [t1.id, t2.id, m2.id])
    expect(ids(pp)).toEqual([m2.id])
  })

  it('Testkonto sieht echte Mitglieder und andere Testkonten; Admin sieht alle', async () => {
    const want = [m1.id, m2.id, t1.id, t2.id].sort()
    const { data: forT } = await t2.client.from('profiles_public').select('id, is_test').in('id', want)
    expect(ids(forT).sort()).toEqual(want)
    expect(forT!.find((r) => r.id === t1.id)!.is_test).toBe(true)
    const { data: forA } = await admin.client.from('profiles').select('id').in('id', want)
    expect(ids(forA).sort()).toEqual(want)
  })

  it('ein Testkonto sieht immer sein eigenes Profil', async () => {
    const { data } = await t1.client.from('profiles').select('id').eq('id', t1.id)
    expect(ids(data)).toEqual([t1.id])
  })
})

describe.skipIf(!RUN)('Tastings', () => {
  it('Mitglied als Teilnehmer eines Test-Tastings sieht es trotzdem nicht', async () => {
    const { data: ev } = await m2.client.from('tasting_events').select('id').in('id', [realEv, testEv])
    expect(ids(ev)).toEqual([realEv])
    const { data: ep } = await m2.client.from('event_participants').select('event_id').eq('event_id', testEv)
    expect(ep).toEqual([])
    const { data: w } = await m2.client.from('whiskies').select('id').eq('event_id', testEv)
    expect(w).toEqual([])
    const { data: wd } = await m2.client.from('whisky_details').select('whisky_id').eq('event_id', testEv)
    expect(wd).toEqual([])
  })

  it('Sichten: normales Mitglied ohne Test-Tasting', async () => {
    const { data: past } = await m1.client.from('past_tastings').select('event_id').in('event_id', [realEv, testEv])
    expect(ids(past, 'event_id')).toEqual([realEv])
    for (const view of ['whisky_rankings', 'whisky_score_breakdown', 'winner_tips_revealed'] as const) {
      const { data } = await m1.client.from(view).select('event_id').eq('event_id', testEv)
      expect(data, view).toEqual([])
    }
    const { data: real } = await m1.client.from('whisky_rankings').select('event_id, is_test').eq('event_id', realEv)
    expect(real!.length).toBeGreaterThan(0)
    expect(real!.every((r) => r.is_test === false)).toBe(true)
  })

  it('Testkonto (nicht beteiligt) sieht das abgeschlossene Test-Tasting mit Kennzeichnung', async () => {
    const { data: past } = await t2.client
      .from('past_tastings')
      .select('event_id, is_test')
      .in('event_id', [realEv, testEv])
    const byId = new Map((past ?? []).map((r) => [r.event_id, r.is_test]))
    expect(byId.get(realEv)).toBe(false)
    expect(byId.get(testEv)).toBe(true)
    const { data: tips } = await t2.client.from('winner_tips_revealed').select('is_test').eq('event_id', testEv)
    expect(tips).toEqual([{ is_test: true }])
  })

  it('Admin sieht beide Tastings', async () => {
    const { data } = await admin.client.from('tasting_events').select('id').in('id', [realEv, testEv])
    expect(ids(data).sort()).toEqual([realEv, testEv].sort())
  })
})

describe.skipIf(!RUN)('Sammlung', () => {
  it('freigegebene Sammlung eines Testkontos: Mitglied nein, Testkonto ja, Besitzer ja', async () => {
    const q = (p: Person) => p.client.from('collection_entries').select('name').eq('profile_id', t1.id)
    expect((await q(m1)).data).toEqual([])
    expect((await q(t2)).data).toEqual([{ name: 'T26 Sammlung' }])
    expect((await q(t1)).data).toEqual([{ name: 'T26 Sammlung' }])
  })
})

describe.skipIf(!RUN)('Admin-Funktionen', () => {
  it('Listen tragen is_test', async () => {
    const { data: members } = await admin.client.rpc('admin_list_members')
    const mm = new Map((members ?? []).map((r) => [r.id, r.is_test]))
    expect(mm.get(t1.id)).toBe(true)
    expect(mm.get(m1.id)).toBe(false)
    const { data: events } = await admin.client.rpc('admin_list_events')
    const em = new Map((events ?? []).map((r) => [r.id, r.is_test]))
    expect(em.get(testEv)).toBe(true)
    expect(em.get(realEv)).toBe(false)
  })

  it('nur der Admin darf markieren (TS004), Admins sind nicht markierbar (TS025)', async () => {
    const { error: e1 } = await m1.client.rpc('admin_set_test_account', { p_target: m2.id, p_value: true })
    expect(e1?.code).toBe('TS004')
    const { error: e2 } = await m1.client.rpc('admin_test_account_impact', { p_target: m2.id, p_value: true })
    expect(e2?.code).toBe('TS004')
    const { error: e3 } = await admin.client.rpc('admin_set_test_account', { p_target: admin.id, p_value: true })
    expect(e3?.code).toBe('TS025')
  })

  it('Auswirkung: Markieren zählt nur Tastings, die heute noch echt sind', async () => {
    // m2 ist in realEv (echt) und testEv (schon Test) → 1
    const { data: impact } = await admin.client.rpc('admin_test_account_impact', { p_target: m2.id, p_value: true })
    expect(impact).toBe(1)
  })

  it('Markieren und Entfernen: Rückgabe = betroffene Tastings, Sichtbarkeit folgt sofort', async () => {
    const { data: set } = await admin.client.rpc('admin_set_test_account', { p_target: m1.id, p_value: true })
    expect(set).toBe(1) // realEv
    const { data: seen } = await m2.client.from('tasting_events').select('id').eq('id', realEv)
    expect(seen).toEqual([])

    const { data: unset } = await admin.client.rpc('admin_set_test_account', { p_target: m1.id, p_value: false })
    expect(unset).toBe(1)
    const { data: back } = await m2.client.from('tasting_events').select('id').eq('id', realEv)
    expect(ids(back)).toEqual([realEv])
  })

  it('Entfernen bei einem weiteren Testkonto im Tasting: zählt nicht als eingeblendet', async () => {
    // testEv hält t1 (Gastgeber). Markieren + Entfernen von m2 ändert dort nichts.
    await admin.client.rpc('admin_set_test_account', { p_target: m2.id, p_value: true })
    const { data: impact } = await admin.client.rpc('admin_test_account_impact', { p_target: m2.id, p_value: false })
    expect(impact).toBe(1) // nur realEv wird wieder sichtbar
    await admin.client.rpc('admin_set_test_account', { p_target: m2.id, p_value: false })
  })

  it('set_member_admin lehnt Testkonten ab (TS025)', async () => {
    const { error } = await admin.client.rpc('set_member_admin', { p_target: t1.id, p_make_admin: true })
    expect(error?.code).toBe('TS025')
  })
})

describe.skipIf(!RUN)('Nachrichten-Empfänger', () => {
  it('Testkonto → echtes Mitglied wird abgelehnt (TS024)', async () => {
    const { error } = await t1.client.rpc('resolve_message_recipients', { p_recipient_ids: [m1.id, t2.id] })
    expect(error?.code).toBe('TS024')
  })

  it('Testkonto → Testkonto geht', async () => {
    const { data, error } = await t1.client.rpc('resolve_message_recipients', { p_recipient_ids: [t2.id] })
    expect(error).toBeNull()
    expect(ids(data, 'recipient_id')).toEqual([t2.id])
  })

  it('normales Mitglied: Testkonten fallen still heraus', async () => {
    const { data, error } = await m1.client.rpc('resolve_message_recipients', { p_recipient_ids: [t1.id, m2.id] })
    expect(error).toBeNull()
    expect(ids(data, 'recipient_id')).toEqual([m2.id])
  })

  it('Admin darf Testkonten und echte Mitglieder anschreiben', async () => {
    const { data } = await admin.client.rpc('resolve_message_recipients', { p_recipient_ids: [t1.id, m2.id] })
    expect(ids(data, 'recipient_id').sort()).toEqual([t1.id, m2.id].sort())
  })
})
