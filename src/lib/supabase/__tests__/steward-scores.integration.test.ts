/**
 * PROJ-29 · Steward-Bewertung durch Teilnehmer — DB-Regeln.
 *   - set_steward_score / clear_steward_score: nur im laufenden Tasting, nur mit
 *     Steward, nur Mitverkoster (inkl. Gastgeber), nicht der Steward (TS028)
 *   - Note 0–10, Schrittweite des Tastings, Kommentar ≤ 500 (TS028)
 *   - eine Note pro Person; ein zweiter Aufruf ersetzt; Zurückziehen löscht
 *   - Geheim: während des Tastings sieht niemand fremde Noten (Tabelle + Sicht)
 *   - nach dem Abschluss: steward_scores_revealed mit Namen, Kommentar, steward_id
 *   - Testkonten-Regel (PROJ-26): echtes Mitglied sieht Test-Tastings nicht
 *   - profiles_public trägt show_steward_balance
 *
 * Sicherheit: Die Tests schalten Tastings auf „läuft". Läuft bereits ein FREMDES
 * Tasting (z. B. ein echter Abend), brechen sie ab, statt es zu beenden.
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

const PASSWORD = 'steward-scores-2026!'
const stamp = Date.now()
const email = (tag: string) => `sscore-${tag}-${stamp}@example.com`
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

async function makeUser(tag: string, isTest = true): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `SS ${tag}`, is_test: isTest },
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
let realMember: Person

/** Event (optional mit Steward), Teilnehmer host/pa/pb, zwei Whiskies. */
async function draftEvent(location: string, opts: { withSteward?: boolean; step?: number } = {}) {
  const { withSteward = true, step = 0.5 } = opts
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    p_helper_id: withSteward ? steward.id : undefined,
    p_rating_step: step,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  const { error: pErr } = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, pa.id, pb.id],
  })
  if (pErr) throw pErr
  for (let i = 1; i <= 2; i++) {
    const { error: wErr } = await host.client.rpc('add_whisky', { p_event: evId, p_name: `SS-W${i}` })
    if (wErr) throw wErr
  }
  return evId
}

/** Startet `evId`. Bricht ab, wenn ein fremdes Tasting läuft (nie einen echten Abend beenden). */
async function start(evId: string, by: Person) {
  const { data: active } = await service.from('tasting_events').select('id, location').eq('status', 'active')
  const foreign = (active ?? []).filter((e) => !eventIds.includes(e.id))
  if (foreign.length > 0) {
    throw new Error(`Abbruch: fremdes Tasting läuft (${foreign.map((e) => e.location).join(', ')}).`)
  }
  for (const e of active ?? []) {
    await service
      .from('tasting_events')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', e.id)
  }
  const { error } = await by.client.rpc('start_event', { p_event: evId })
  if (error) throw error
}

async function close(evId: string, by: Person) {
  const { error } = await by.client.rpc('close_event', { p_event: evId })
  if (error) throw error
}

const rate = (p: Person, evId: string, score: number, comment?: string) =>
  p.client.rpc('set_steward_score', { p_event: evId, p_score: score, p_comment: comment })
const unrate = (p: Person, evId: string) => p.client.rpc('clear_steward_score', { p_event: evId })

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin', false)
  const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
  if (error) throw error
  host = await makeUser('host')
  pa = await makeUser('pa')
  pb = await makeUser('pb')
  steward = await makeUser('steward')
  outsider = await makeUser('outsider')
  realMember = await makeUser('real', false)
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

describe.skipIf(!RUN)('Bewerten während des Tastings (Schrittweite 0,5)', () => {
  let ev = ''

  it('im Entwurf wird eine Note abgelehnt (TS028)', async () => {
    ev = await draftEvent(`SS-main-${stamp}`)
    expect((await rate(pa, ev, 8)).error?.code).toBe('TS028')
  })

  it('Teilnehmer bewertet; ein zweiter Aufruf ersetzt Note und Kommentar', async () => {
    await start(ev, steward)
    expect((await rate(pa, ev, 8)).error).toBeNull()
    expect((await rate(pa, ev, 9.5, '  Großartig ausgeschenkt  ')).error).toBeNull()
    const { data } = await pa.client.from('steward_scores').select('score, comment').eq('event_id', ev)
    expect(data).toHaveLength(1)
    expect(Number(data![0].score)).toBe(9.5)
    expect(data![0].comment).toBe('Großartig ausgeschenkt')
  })

  it('leerer Kommentar wird als „kein Kommentar" gespeichert', async () => {
    expect((await rate(pa, ev, 9.5, '   ')).error).toBeNull()
    const { data } = await pa.client.from('steward_scores').select('comment').eq('event_id', ev).single()
    expect(data!.comment).toBeNull()
    expect((await rate(pa, ev, 9.5, 'Großartig ausgeschenkt')).error).toBeNull()
  })

  it('auch der Gastgeber (verkostet mit) darf bewerten; 0 ist erlaubt', async () => {
    expect((await rate(host, ev, 0)).error).toBeNull()
    expect((await rate(host, ev, 7)).error).toBeNull()
  })

  it('Steward, Außenstehender und Admin ohne Teilnahme werden abgelehnt (TS028)', async () => {
    expect((await rate(steward, ev, 10)).error?.code).toBe('TS028')
    expect((await rate(outsider, ev, 5)).error?.code).toBe('TS028')
    expect((await rate(admin, ev, 5)).error?.code).toBe('TS028')
    expect((await unrate(steward, ev)).error?.code).toBe('TS028')
  })

  it('ungültige Note und zu langer Kommentar werden abgelehnt (TS028)', async () => {
    for (const score of [-1, 10.5, 7.25]) {
      expect((await rate(pb, ev, score)).error?.code).toBe('TS028')
    }
    expect((await rate(pb, ev, 6, 'x'.repeat(501))).error?.code).toBe('TS028')
    expect((await rate(pb, ev, 6, 'x'.repeat(500))).error).toBeNull()
  })

  it('Zurückziehen löscht die eigene Note; nochmal Zurückziehen ist harmlos', async () => {
    expect((await unrate(pb, ev)).error).toBeNull()
    const { data } = await pb.client.from('steward_scores').select('score').eq('event_id', ev)
    expect(data ?? []).toHaveLength(0)
    expect((await unrate(pb, ev)).error).toBeNull()
    expect((await rate(pb, ev, 6, 'Solide')).error).toBeNull()
  })

  it('direktes Schreiben in die Tabelle ist nicht möglich', async () => {
    const { error } = await outsider.client
      .from('steward_scores')
      .insert({ event_id: ev, profile_id: outsider.id, score: 10 })
    expect(error).toBeTruthy()
    const { error: uErr, data: uData } = await pa.client
      .from('steward_scores')
      .update({ score: 10 })
      .eq('event_id', ev)
      .select()
    expect(uErr ?? (uData ?? []).length === 0).toBeTruthy()
  })

  it('geheim: niemand sieht fremde Noten — weder Tabelle noch Sicht', async () => {
    for (const viewer of [pa, host, steward, admin, outsider]) {
      const { data } = await viewer.client.from('steward_scores').select('profile_id').eq('event_id', ev)
      for (const row of data ?? []) expect(row.profile_id).toBe(viewer.id)
      const { data: rev } = await viewer.client
        .from('steward_scores_revealed')
        .select('profile_id')
        .eq('event_id', ev)
      expect(rev ?? []).toHaveLength(0)
    }
  })

  it('der Live-Einblick des Stewards enthält keine Steward-Noten', async () => {
    const { data, error } = await steward.client.rpc('steward_ratings', { p_event: ev })
    expect(error).toBeNull()
    const text = JSON.stringify(data ?? [])
    expect(text).not.toContain('Großartig ausgeschenkt')
    expect(text).not.toContain('Solide')
  })

  it('nach dem Abschluss: Sicht deckt alle Noten mit Namen auf', async () => {
    await close(ev, steward)
    const { data } = await outsider.client
      .from('steward_scores_revealed')
      .select('profile_id, display_name, score, comment, steward_id, is_test')
      .eq('event_id', ev)
    expect(data).toHaveLength(3)
    const byId = new Map((data ?? []).map((r) => [r.profile_id, r]))
    expect(Number(byId.get(pa.id)!.score)).toBe(9.5)
    expect(byId.get(pa.id)!.comment).toBe('Großartig ausgeschenkt')
    expect(byId.get(pa.id)!.display_name).toBe('SS pa')
    expect(Number(byId.get(host.id)!.score)).toBe(7)
    expect(byId.get(pb.id)!.comment).toBe('Solide')
    for (const r of data ?? []) {
      expect(r.steward_id).toBe(steward.id)
      expect(r.is_test).toBe(true)
    }
    // Der Steward selbst sieht sie jetzt auch.
    const { data: own } = await steward.client
      .from('steward_scores_revealed')
      .select('profile_id')
      .eq('event_id', ev)
    expect(own).toHaveLength(3)
  })

  it('Testkonten-Regel: ein echtes Mitglied sieht das Test-Tasting nicht', async () => {
    const { data } = await realMember.client
      .from('steward_scores_revealed')
      .select('profile_id')
      .eq('event_id', ev)
    expect(data ?? []).toHaveLength(0)
  })

  it('nach dem Abschluss: kein Bewerten und kein Zurückziehen mehr (TS028)', async () => {
    expect((await rate(pa, ev, 3)).error?.code).toBe('TS028')
    expect((await unrate(pa, ev)).error?.code).toBe('TS028')
  })
})

describe.skipIf(!RUN)('Sonderfälle', () => {
  it('Schrittweite 1: halbe Note abgelehnt, ganze erlaubt', async () => {
    const ev = await draftEvent(`SS-step1-${stamp}`, { step: 1 })
    await start(ev, steward)
    expect((await rate(pa, ev, 7.5)).error?.code).toBe('TS028')
    expect((await rate(pa, ev, 7)).error).toBeNull()
    await close(ev, steward)
  })

  it('Tasting ohne Steward: Bewerten abgelehnt (TS028)', async () => {
    const ev = await draftEvent(`SS-nosteward-${stamp}`, { withSteward: false })
    await start(ev, host)
    expect((await rate(pa, ev, 8)).error?.code).toBe('TS028')
    await close(ev, host)
  })

  it('profiles_public liefert show_steward_balance; eigener Schalter ist änderbar', async () => {
    const { data: before } = await pa.client
      .from('profiles_public')
      .select('show_steward_balance')
      .eq('id', steward.id)
      .single()
    expect(before!.show_steward_balance).toBe(true)
    const { error } = await steward.client
      .from('profiles')
      .update({ show_steward_balance: false })
      .eq('id', steward.id)
    expect(error).toBeNull()
    const { data } = await pa.client
      .from('profiles_public')
      .select('show_steward_balance')
      .eq('id', steward.id)
      .single()
    expect(data!.show_steward_balance).toBe(false)
  })
})
