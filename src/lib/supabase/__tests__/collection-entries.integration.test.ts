/**
 * PROJ-15 · Persönliche Whisky-Datenbank — DB-Regeln.
 *
 *   - Eigene `collection_entries`-Zeilen sind immer lesbar/schreibbar.
 *   - Fremde Zeilen sind nur lesbar, wenn die Zielperson
 *     `profiles.show_collection = true` hat (zeilenweise RLS, keine Sicht).
 *   - Schreiben (Insert/Update/Delete) geht nur auf die eigene Zeile.
 *   - Das Herkunftsfeld (`source_event_id`/`source_event_date`) lässt sich
 *     nach dem Anlegen nicht mehr ändern (Spalten-GRANT).
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

const PASSWORD = 'collection-entries-2026!'
const stamp = Date.now()
const email = (tag: string) => `collentry-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Client = SupabaseClient<Database>
let service: Client
const userIds: string[] = []
let eventId: string
let entryIdA: string

interface Person {
  id: string
  client: Client
}

async function makeUser(tag: string): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `Collentry ${tag}` },
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

let userA: Person
let userB: Person

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  userA = await makeUser('a')
  userB = await makeUser('b')

  // Ein Dummy-Event nur als FK-Ziel für source_event_id — Status/Inhalt sind
  // für die collection_entries-RLS irrelevant.
  const { data: event, error: eventError } = await service
    .from('tasting_events')
    .insert({
      event_date: '2026-09-01',
      location: 'Testkeller',
      host_id: userA.id,
      created_by: userA.id,
    })
    .select('id')
    .single()
  if (eventError || !event) throw eventError ?? new Error('event insert')
  eventId = event.id
}, 120_000)

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Eigene Zeilen', () => {
  it('userA kann einen eigenen Eintrag anlegen und lesen', async () => {
    const { data, error } = await userA.client
      .from('collection_entries')
      .insert({ profile_id: userA.id, name: 'Ardbeg Uigeadail' })
      .select('id, name')
      .single()
    expect(error).toBeNull()
    expect(data!.name).toBe('Ardbeg Uigeadail')
    entryIdA = data!.id

    const read = await userA.client
      .from('collection_entries')
      .select('id')
      .eq('id', entryIdA)
      .maybeSingle()
    expect(read.error).toBeNull()
    expect(read.data?.id).toBe(entryIdA)
  })

  it('userA kann den eigenen Eintrag bearbeiten', async () => {
    const { data, error } = await userA.client
      .from('collection_entries')
      .update({ rating: 9, notes: 'Torfig, rauchig.' })
      .eq('id', entryIdA)
      .select('rating, notes')
      .single()
    expect(error).toBeNull()
    expect(data!.rating).toBe(9)
  })

  it('userA kann kein fremdes profile_id beim Anlegen setzen', async () => {
    const { error, data } = await userA.client
      .from('collection_entries')
      .insert({ profile_id: userB.id, name: 'Fremdeintrag' })
      .select('id')
    expect(error).toBeTruthy()
    expect(data ?? []).toHaveLength(0)
  })
})

describe.skipIf(!RUN)('Sichtbarkeit fremder Sammlungen', () => {
  it('Default (sichtbar): userB sieht As Eintrag', async () => {
    const { data, error } = await userB.client
      .from('collection_entries')
      .select('id, name')
      .eq('profile_id', userA.id)
    expect(error).toBeNull()
    expect((data ?? []).some((r) => r.id === entryIdA)).toBe(true)
  })

  it('userA verbirgt die Sammlung — userB sieht danach keine Zeilen mehr', async () => {
    const upd = await userA.client
      .from('profiles')
      .update({ show_collection: false })
      .eq('id', userA.id)
    expect(upd.error).toBeNull()

    const asB = await userB.client
      .from('collection_entries')
      .select('id')
      .eq('profile_id', userA.id)
    expect(asB.error).toBeNull()
    expect(asB.data ?? []).toHaveLength(0)

    // userA sieht die eigene Zeile weiterhin — der Schalter wirkt nur nach außen.
    const asSelf = await userA.client
      .from('collection_entries')
      .select('id')
      .eq('id', entryIdA)
      .maybeSingle()
    expect(asSelf.error).toBeNull()
    expect(asSelf.data?.id).toBe(entryIdA)

    // Zurücksetzen für nachfolgende Tests.
    await userA.client.from('profiles').update({ show_collection: true }).eq('id', userA.id)
  })
})

describe.skipIf(!RUN)('Schreibzugriff nur auf die eigene Zeile', () => {
  it('userB kann As Eintrag nicht ändern (RLS: 0 betroffene Zeilen, kein Fehler)', async () => {
    const { error, data } = await userB.client
      .from('collection_entries')
      .update({ name: 'Umbenannt von B' })
      .eq('id', entryIdA)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })

  it('userB kann As Eintrag nicht löschen', async () => {
    const { error, data } = await userB.client
      .from('collection_entries')
      .delete()
      .eq('id', entryIdA)
      .select('id')
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)

    // Eintrag existiert weiterhin (Service-Client, bypasst RLS).
    const raw = await service.from('collection_entries').select('id').eq('id', entryIdA).maybeSingle()
    expect(raw.data?.id).toBe(entryIdA)
  })
})

describe.skipIf(!RUN)('Herkunftsfeld nach dem Anlegen eingefroren', () => {
  it('ein Eintrag mit Herkunft lässt sich anlegen', async () => {
    const { data, error } = await userA.client
      .from('collection_entries')
      .insert({
        profile_id: userA.id,
        name: 'Talisker 10',
        source_event_id: eventId,
        source_event_date: '2026-09-01',
      })
      .select('id, source_event_id')
      .single()
    expect(error).toBeNull()
    expect(data!.source_event_id).toBe(eventId)
  })

  it('userA kann die Herkunft nicht nachträglich ändern (Spalten-GRANT)', async () => {
    const { error } = await userA.client
      .from('collection_entries')
      .update({ source_event_id: null })
      .eq('id', entryIdA)
    expect(error).toBeTruthy()
    expect(error!.code).toBe('42501')
  })

  it('userA kann andere Felder desselben Eintrags weiterhin ändern', async () => {
    const { error, data } = await userA.client
      .from('collection_entries')
      .update({ owned: true })
      .eq('id', entryIdA)
      .select('owned')
      .single()
    expect(error).toBeNull()
    expect(data!.owned).toBe(true)
  })
})

describe.skipIf(!RUN)('Herkunft überlebt ein gelöschtes Ursprungs-Event', () => {
  it('Event löschen setzt source_event_id auf NULL, source_event_date bleibt', async () => {
    const before = await service
      .from('collection_entries')
      .select('id')
      .eq('source_event_id', eventId)
    const affectedIds = (before.data ?? []).map((r) => r.id)
    expect(affectedIds.length).toBeGreaterThan(0)

    const del = await service.from('tasting_events').delete().eq('id', eventId)
    expect(del.error).toBeNull()

    const after = await service
      .from('collection_entries')
      .select('id, source_event_id, source_event_date')
      .in('id', affectedIds)
    expect(after.error).toBeNull()
    for (const row of after.data ?? []) {
      expect(row.source_event_id).toBeNull()
      expect(row.source_event_date).toBe('2026-09-01')
    }
  })
})
