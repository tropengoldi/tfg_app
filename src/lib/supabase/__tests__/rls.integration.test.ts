/**
 * PROJ-1 · RLS-Matrix als ausführbare Integrationstests.
 *
 * "Die wichtigste Testsuite des Projekts" (Implementierungsplan §11). Prüft die
 * Blindheit der Verkostung auf Datenbankebene mit mehreren parallel
 * authentifizierten Clients.
 *
 * Ausführen:  npm run test:rls
 * Voraussetzung in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Die Suite legt sich ihre Testdaten selbst an (eigene Auth-User + zwei Events,
 * eines aktiv, eines abgeschlossen) und räumt danach auf. Unabhängig vom Seed.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '../types'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const RUN = Boolean(URL && ANON && SERVICE)

const PASSWORD = 'rls-integration-2026!'
const stamp = Date.now()
const email = (tag: string) => `rls-${tag}-${stamp}@example.test`

type Client = SupabaseClient<Database>

let service: Client
const created = {
  userIds: [] as string[],
  eventIds: [] as string[],
}

interface Person {
  id: string
  email: string
  client: Client
}

async function makePerson(tag: string): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `RLS ${tag}` },
  })
  if (error) throw error
  created.userIds.push(data.user.id)

  const client = createClient<Database>(URL!, ANON!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const signIn = await client.auth.signInWithPassword({ email: email(tag), password: PASSWORD })
  if (signIn.error) throw signIn.error

  return { id: data.user.id, email: email(tag), client }
}

let admin: Person
let host: Person
let userA: Person
let userB: Person
let outsider: Person

// event → { id, whiskyByBringer }
interface EventFixture {
  id: string
  whiskyA: string
  whiskyB: string
  whiskyH: string
}
let activeEvent: EventFixture
let closedEvent: EventFixture

async function buildEvent(makeClosed: boolean): Promise<EventFixture> {
  const { data: eventId, error: ce } = await admin.client.rpc('create_event', {
    p_event_date: '2026-09-01',
    p_location: 'Bei Host',
    p_host_id: host.id,
  })
  if (ce) throw ce
  created.eventIds.push(eventId as string)

  const { error: pe } = await admin.client.rpc('set_event_participants', {
    p_event: eventId as string,
    p_profile_ids: [userA.id, userB.id],
  })
  if (pe) throw pe

  const add = async (who: Person, name: string) => {
    const { data, error } = await who.client.rpc('add_whisky', {
      p_event: eventId as string,
      p_name: name,
    })
    if (error) throw error
    return data as string
  }
  const whiskyA = await add(userA, 'A-Dram')
  const whiskyB = await add(userB, 'B-Dram')
  const whiskyH = await add(host, 'H-Dram')

  const { error: se } = await host.client.rpc('start_event', { p_event: eventId as string })
  if (se) throw se

  // Whisky an Position 1 (A-Dram) ist jetzt ausgeschenkt → A und B bewerten ihn.
  for (const who of [userA, userB]) {
    const { error } = await who.client.from('ratings').insert({
      whisky_id: whiskyA,
      event_id: eventId as string,
      profile_id: who.id,
      nose_points: 3,
      taste_points: 7,
    })
    if (error) throw error
  }

  if (makeClosed) {
    // Runden bis zum Ende weiterschalten, dann abschließen.
    let pos = 1
    for (; pos < 3; pos++) {
      const { error } = await host.client.rpc('close_round', {
        p_event: eventId as string,
        p_expected_position: pos,
      })
      if (error) throw error
    }
    const { error } = await host.client.rpc('close_event', { p_event: eventId as string })
    if (error) throw error
  }

  return { id: eventId as string, whiskyA, whiskyB, whiskyH }
}

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  admin = await makePerson('admin')
  host = await makePerson('host')
  userA = await makePerson('a')
  userB = await makePerson('b')
  outsider = await makePerson('out')

  const { error } = await service
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', admin.id)
  if (error) throw error

  activeEvent = await buildEvent(false)
  closedEvent = await buildEvent(true)
})

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of created.eventIds) {
    await service.from('tasting_events').delete().eq('id', id)
  }
  for (const id of created.userIds) {
    await service.auth.admin.deleteUser(id)
  }
})

describe.skipIf(!RUN)('RLS-Matrix', () => {
  // --- Geheimhaltung der Whiskies ----------------------------------------
  it('Außenstehender sieht ein aktives Event nicht', async () => {
    const { data } = await outsider.client
      .from('tasting_events')
      .select('id')
      .eq('id', activeEvent.id)
    expect(data ?? []).toHaveLength(0)
  })

  it('Teilnehmer A sieht die whisky_details von B nicht (aktiv)', async () => {
    const { data } = await userA.client
      .from('whisky_details')
      .select('name')
      .eq('whisky_id', activeEvent.whiskyB)
    expect(data ?? []).toHaveLength(0)
  })

  it('Teilnehmer A sieht seinen eigenen Whisky (aktiv)', async () => {
    const { data } = await userA.client
      .from('whisky_details')
      .select('name')
      .eq('whisky_id', activeEvent.whiskyA)
    expect(data).toHaveLength(1)
    expect(data![0].name).toBe('A-Dram')
  })

  it('Gastgeber sieht alle whisky_details (aktiv)', async () => {
    const { data } = await host.client
      .from('whisky_details')
      .select('name')
      .eq('event_id', activeEvent.id)
    expect(data).toHaveLength(3)
  })

  it('Teilnehmer A sieht alle Whisky-Positionen, aber keine Namen (aktiv)', async () => {
    const { data } = await userA.client
      .from('whiskies')
      .select('id, position')
      .eq('event_id', activeEvent.id)
    expect(data).toHaveLength(3)
    expect(data!.map((w) => w.position).sort()).toEqual([1, 2, 3])
  })

  it('whiskies hat keine Zeitstempel-Spalte (Korrelationsschutz)', async () => {
    // created_at existiert auf whiskies bewusst nicht → PostgREST 42703.
    const { error } = await userA.client
      .from('whiskies')
      .select('created_at' as '*')
      .eq('event_id', activeEvent.id)
    expect(error).toBeTruthy()
    expect(error!.code).toBe('42703') // undefined_column
  })

  it('Nach Abschluss sieht Teilnehmer A alle Whisky-Details inkl. Bringer', async () => {
    const { data } = await userA.client
      .from('whisky_details')
      .select('name, brought_by, video_url')
      .eq('event_id', closedEvent.id)
    expect(data).toHaveLength(3)
  })

  // --- Geheimhaltung der Bewertungen ------------------------------------
  it('Teilnehmer A sieht die Bewertungen von B nicht (aktiv)', async () => {
    const { data } = await userA.client
      .from('ratings')
      .select('id')
      .eq('event_id', activeEvent.id)
      .eq('profile_id', userB.id)
    expect(data ?? []).toHaveLength(0)
  })

  it('Gastgeber sieht keine Bewertungen (aktiv)', async () => {
    const { data } = await host.client
      .from('ratings')
      .select('id')
      .eq('event_id', activeEvent.id)
    expect(data ?? []).toHaveLength(0)
  })

  it('Gastgeber bekommt über rating_progress nur Zählwerte', async () => {
    const { data, error } = await host.client.rpc('rating_progress', {
      p_event: activeEvent.id,
    })
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    const row = (data as { position: number; rating_count: number; participant_count: number }[])[0]
    expect(row).toHaveProperty('rating_count')
    expect(row).not.toHaveProperty('nose_points')
    expect(row).not.toHaveProperty('profile_id')
  })

  it('Nicht-Gastgeber darf rating_progress nicht aufrufen', async () => {
    const { error } = await userA.client.rpc('rating_progress', { p_event: activeEvent.id })
    expect(error).toBeTruthy()
    expect(error!.code).toBe('PT004')
  })

  it('Nach Abschluss sieht Teilnehmer A die Bewertungen von B', async () => {
    const { data } = await userA.client
      .from('ratings')
      .select('id')
      .eq('event_id', closedEvent.id)
      .eq('profile_id', userB.id)
    expect(data).toHaveLength(1)
  })

  // --- Rangliste --------------------------------------------------------
  it('whisky_rankings eines aktiven Events ist leer', async () => {
    const { data } = await userA.client
      .from('whisky_rankings')
      .select('*')
      .eq('event_id', activeEvent.id)
    expect(data ?? []).toHaveLength(0)
  })

  it('whisky_rankings eines abgeschlossenen Events ist vollständig', async () => {
    const { data } = await userA.client
      .from('whisky_rankings')
      .select('rank, total_points, nose_total, taste_total, rating_count')
      .eq('event_id', closedEvent.id)
    expect(data).toHaveLength(3)
    expect(data!.map((r) => r.rank).sort()).toEqual([1, 2, 3])
  })

  // --- Rollen & Ablaufsteuerung ---------------------------------------
  it('Teilnehmer A kann sich nicht selbst zum Admin machen', async () => {
    const { error } = await userA.client
      .from('profiles')
      .update({ role: 'admin' } as never)
      .eq('id', userA.id)
    expect(error).toBeTruthy()
    expect(error!.code).toBe('42501')
  })

  it('Teilnehmer A kann seinen Anzeigenamen ändern', async () => {
    const { error } = await userA.client
      .from('profiles')
      .update({ display_name: 'A neu' })
      .eq('id', userA.id)
    expect(error).toBeNull()
  })

  it('Teilnehmer A kann keine Bewertung unter fremdem Namen anlegen', async () => {
    const { error } = await userA.client.from('ratings').insert({
      whisky_id: activeEvent.whiskyB,
      event_id: activeEvent.id,
      profile_id: userB.id,
      nose_points: 5,
      taste_points: 10,
    })
    expect(error).toBeTruthy()
    expect(error!.code).toBe('42501')
  })

  it('Bewertung eines noch nicht ausgeschenkten Whiskys wird abgelehnt (aktiv)', async () => {
    // whiskyB steht auf Position 2, current_position ist 1
    const { error } = await userB.client.from('ratings').insert({
      whisky_id: activeEvent.whiskyB,
      event_id: activeEvent.id,
      profile_id: userB.id,
      nose_points: 3,
      taste_points: 5,
    })
    expect(error).toBeTruthy()
  })

  it('Nach Abschluss ist keine Bewertungsänderung mehr möglich (Trigger PT001)', async () => {
    const { error } = await userA.client
      .from('ratings')
      .update({ taste_points: 1 })
      .eq('event_id', closedEvent.id)
      .eq('profile_id', userA.id)
    expect(error).toBeTruthy()
    expect(error!.code).toBe('PT001')
  })

  it('Gastgeber kann den Event-Status nicht direkt setzen', async () => {
    const { error } = await host.client
      .from('tasting_events')
      .update({ status: 'closed' } as never)
      .eq('id', activeEvent.id)
    expect(error).toBeTruthy()
    expect(['42501', 'PGRST116']).toContain(error!.code)
  })

  it('Doppel-Tap auf „Runde abschließen" schaltet nur einmal weiter', async () => {
    const first = await host.client.rpc('close_round', {
      p_event: activeEvent.id,
      p_expected_position: 1,
    })
    expect(first.error).toBeNull()
    const second = await host.client.rpc('close_round', {
      p_event: activeEvent.id,
      p_expected_position: 1,
    })
    expect(second.error).toBeTruthy()
    expect(second.error!.code).toBe('PT002')
  })

  // --- Sichtbarkeit von Events / Rekursionsschutz --------------------
  it('event_participants eines fremden Events: 0 Zeilen, kein 42P17', async () => {
    const { data, error } = await outsider.client
      .from('event_participants')
      .select('profile_id')
      .eq('event_id', activeEvent.id)
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })
})
