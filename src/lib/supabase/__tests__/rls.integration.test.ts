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
const email = (tag: string) => `rls-${tag}-${stamp}@example.com`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const TRANSIENT =
  /upstream connect|protocol error|before headers|reset|fetch failed|ECONNRESET|socket hang up|ETIMEDOUT|EAI_AGAIN|network|503|502|504/i

function isTransient(err: unknown): boolean {
  const msg =
    (err as { message?: string })?.message ??
    (typeof err === 'string' ? err : JSON.stringify(err ?? ''))
  return TRANSIENT.test(msg)
}

/** Führt einen Setup-Schritt aus; wiederholt bei transienten Netz-/Proxy-Fehlern. */
async function step<R extends { error: unknown }>(
  label: string,
  fn: () => PromiseLike<R>,
  tries = 5,
): Promise<R> {
  let last: unknown
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fn()
      if (res.error) {
        if (isTransient(res.error) && i < tries) {
          last = res.error
          await sleep(400 * i)
          continue
        }
        throw res.error
      }
      return res
    } catch (err) {
      last = err
      if (isTransient(err) && i < tries) {
        await sleep(400 * i)
        continue
      }
      const m = (err as { message?: string })?.message ?? JSON.stringify(err)
      throw new Error(`Setup-Schritt "${label}" fehlgeschlagen: ${m}`)
    }
  }
  const m = (last as { message?: string })?.message ?? JSON.stringify(last)
  throw new Error(`Setup-Schritt "${label}" nach ${tries} Versuchen fehlgeschlagen: ${m}`)
}

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
  const res = await step(`createUser(${tag})`, () =>
    service.auth.admin.createUser({
      email: email(tag),
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: `RLS ${tag}` },
    }),
  )
  const userId = res.data.user!.id
  created.userIds.push(userId)

  const client = createClient<Database>(URL!, ANON!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  await step(`signIn(${tag})`, () =>
    client.auth.signInWithPassword({ email: email(tag), password: PASSWORD }),
  )
  await sleep(150)

  return { id: userId, email: email(tag), client }
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

async function buildEvent(tag: string, makeClosed: boolean): Promise<EventFixture> {
  const eventId = (
    await step(`${tag}: create_event`, () =>
      admin.client.rpc('create_event', {
        p_event_date: '2026-09-01',
        p_location: 'Bei Host',
        p_host_id: host.id,
      }),
    )
  ).data as string
  created.eventIds.push(eventId)

  await step(`${tag}: set_event_participants`, () =>
    admin.client.rpc('set_event_participants', {
      p_event: eventId,
      p_profile_ids: [userA.id, userB.id],
    }),
  )

  const add = async (who: Person, name: string) =>
    (
      await step(`${tag}: add_whisky(${name})`, () =>
        who.client.rpc('add_whisky', { p_event: eventId, p_name: name }),
      )
    ).data as string
  const whiskyA = await add(userA, 'A-Dram')
  const whiskyB = await add(userB, 'B-Dram')
  const whiskyH = await add(host, 'H-Dram')

  await step(`${tag}: start_event`, () =>
    host.client.rpc('start_event', { p_event: eventId }),
  )

  // Whisky an Position 1 (A-Dram) ist jetzt ausgeschenkt → A und B bewerten ihn.
  for (const who of [userA, userB]) {
    await step(`${tag}: rating(${who.id})`, () =>
      who.client.from('ratings').insert({
        whisky_id: whiskyA,
        event_id: eventId,
        profile_id: who.id,
        nose_points: 3,
        taste_points: 7,
      }),
    )
  }

  if (makeClosed) {
    for (let pos = 1; pos < 3; pos++) {
      await step(`${tag}: close_round(${pos})`, () =>
        host.client.rpc('close_round', { p_event: eventId, p_expected_position: pos }),
      )
    }
    await step(`${tag}: close_event`, () =>
      host.client.rpc('close_event', { p_event: eventId }),
    )
  }

  return { id: eventId, whiskyA, whiskyB, whiskyH }
}

/** Räumt Artefakte früherer (evtl. abgebrochener) Läufe weg. */
async function cleanupLeftovers() {
  const stale: string[] = []
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    for (const u of data.users) {
      if (u.email && /^rls-.+@example\.com$/.test(u.email)) stale.push(u.id)
    }
    if (data.users.length < 200) break
  }
  if (stale.length === 0) return
  // Events zuerst (host_id/created_by sind ON DELETE RESTRICT), dann die User.
  await service
    .from('tasting_events')
    .delete()
    .or(`host_id.in.(${stale.join(',')}),created_by.in.(${stale.join(',')})`)
    .then(undefined, () => {})
  for (const id of stale) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
}

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    await cleanupLeftovers()

    admin = await makePerson('admin')
    host = await makePerson('host')
    userA = await makePerson('a')
    userB = await makePerson('b')
    outsider = await makePerson('out')

    await step('profiles: promote admin', () =>
      service.from('profiles').update({ role: 'admin' }).eq('id', admin.id),
    )

    // Reihenfolge wichtig: nur EIN Event darf gleichzeitig 'active' sein
    // (Partial-Unique-Index). Erst das abzuschließende Event komplett
    // durchziehen, dann das aktive.
    closedEvent = await buildEvent('closedEvent', true)
    activeEvent = await buildEvent('activeEvent', false)
  } catch (err) {
    // Cleanup, damit ein halb aufgebauter Zustand den nächsten Lauf nicht stört.
    for (const id of created.eventIds) {
      await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
    }
    for (const id of created.userIds) {
      await service.auth.admin.deleteUser(id).then(undefined, () => {})
    }
    throw err
  }
}, 120_000)

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
    const row = (data as {
      whisky_position: number
      rating_count: number
      participant_count: number
    }[])[0]
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
