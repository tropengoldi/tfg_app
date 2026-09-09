/**
 * PROJ-11 · Neutraler Helfer pro Event — DB-Regeln.
 *
 *   - create_event / update_event: p_helper_id, Konsistenzprüfung (TS017)
 *   - set_event_participants lehnt den Helfer in der Liste ab (TS017)
 *   - RLS: der Helfer sieht die geheimen whisky_details; der Gastgeber-mit-Helfer
 *     sieht sie NICHT (nur seinen eigenen); der Außenstehende gar nichts
 *   - Steuerungs-RPCs: der Helfer darf, der Gastgeber-mit-Helfer nicht (TS004)
 *   - deactivate_member: Helfer eines offenen Events → TS013
 *   - Helfer entfernen → der Gastgeber bekommt Steuerung + Detail-Einblick zurück
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

const PASSWORD = 'helper-role-2026!'
const stamp = Date.now()
const email = (tag: string) => `helper-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `Helper ${tag}` },
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
let helper: Person
let guest: Person // normaler Teilnehmer
let outsider: Person

async function closeAllActive() {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
}

/** Legt ein Draft-Event mit Helfer an, trägt Teilnehmer + je einen Whisky ein. */
async function buildEventWithHelper(location: string) {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
    p_helper_id: helper.id,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)

  const setParts = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [host.id, guest.id],
  })
  if (setParts.error) throw setParts.error

  const w1 = await host.client.rpc('add_whisky', { p_event: evId, p_name: 'Host-Dram' })
  if (w1.error) throw w1.error
  const w2 = await guest.client.rpc('add_whisky', { p_event: evId, p_name: 'Guest-Dram' })
  if (w2.error) throw w2.error
  const w3 = await guest.client.rpc('add_whisky', { p_event: evId, p_name: 'Guest-Dram-2' })
  if (w3.error) throw w3.error

  return evId
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
  helper = await makeUser('helper')
  guest = await makeUser('guest')
  outsider = await makeUser('out')
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

describe.skipIf(!RUN)('Helfer benennen (create_event / update_event)', () => {
  it('create_event speichert helper_id; der Helfer ist kein Teilnehmer', async () => {
    const ev = await buildEventWithHelper(`H-create-${stamp}`)
    const { data } = await service
      .from('tasting_events')
      .select('helper_id')
      .eq('id', ev)
      .single()
    expect(data!.helper_id).toBe(helper.id)

    const { data: parts } = await service
      .from('event_participants')
      .select('profile_id')
      .eq('event_id', ev)
    expect((parts ?? []).map((p) => p.profile_id)).not.toContain(helper.id)
  })

  it('create_event: Helfer = Gastgeber → TS017', async () => {
    const { error } = await admin.client.rpc('create_event', {
      p_event_date: FUTURE,
      p_location: `H-conflict-${stamp}`,
      p_host_id: host.id,
      p_helper_id: host.id,
    })
    expect(error?.code).toBe('TS017')
  })

  it('update_event: Helfer in der Teilnehmerliste → TS017', async () => {
    const ev = await buildEventWithHelper(`H-updconf-${stamp}`)
    const { error } = await admin.client.rpc('update_event', {
      p_event: ev,
      p_event_date: FUTURE,
      p_location: `H-updconf-${stamp}`,
      p_host_id: host.id,
      p_helper_id: guest.id, // guest ist bereits Teilnehmer dieses Events
    })
    expect(error?.code).toBe('TS017')
  })

  it('set_event_participants lehnt den Helfer in der Liste ab → TS017', async () => {
    const ev = await buildEventWithHelper(`H-setparts-${stamp}`)
    const { error } = await admin.client.rpc('set_event_participants', {
      p_event: ev,
      p_profile_ids: [host.id, guest.id, helper.id],
    })
    expect(error?.code).toBe('TS017')
  })
})

describe.skipIf(!RUN)('Sichtbarkeit der geheimen Details (RLS)', () => {
  it('der Helfer sieht alle whisky_details, der Gastgeber nur seinen eigenen, der Außenstehende keine', async () => {
    const ev = await buildEventWithHelper(`H-rls-${stamp}`)

    const asHelper = await helper.client
      .from('whisky_details')
      .select('name')
      .eq('event_id', ev)
    expect(asHelper.error).toBeNull()
    expect(asHelper.data).toHaveLength(3)

    const asHost = await host.client
      .from('whisky_details')
      .select('name')
      .eq('event_id', ev)
    expect((asHost.data ?? []).map((d) => d.name)).toEqual(['Host-Dram'])

    const asOutsider = await outsider.client
      .from('whisky_details')
      .select('name')
      .eq('event_id', ev)
    expect(asOutsider.data ?? []).toHaveLength(0)
  })

  it('der Helfer sieht die Event-Zeile, die Positionen und die Teilnehmerliste', async () => {
    const ev = await buildEventWithHelper(`H-rls2-${stamp}`)

    const evRow = await helper.client.from('tasting_events').select('id').eq('id', ev)
    expect(evRow.data ?? []).toHaveLength(1)

    const pos = await helper.client.from('whiskies').select('position').eq('event_id', ev)
    expect((pos.data ?? []).map((w) => w.position).sort()).toEqual([1, 2, 3])

    const parts = await helper.client
      .from('event_participants')
      .select('profile_id')
      .eq('event_id', ev)
    expect((parts.data ?? []).length).toBe(2)
  })

  it('der Außenstehende sieht die Event-Zeile weiterhin nicht', async () => {
    const ev = await buildEventWithHelper(`H-rls3-${stamp}`)
    const { data } = await outsider.client.from('tasting_events').select('id').eq('id', ev)
    expect(data ?? []).toHaveLength(0)
  })
})

describe.skipIf(!RUN)('Ablauf-Steuerung', () => {
  it('der Helfer darf steuern, der Gastgeber-mit-Helfer nicht (TS004)', async () => {
    await closeAllActive()
    const ev = await buildEventWithHelper(`H-ctrl-${stamp}`)
    const { data: ws } = await service.from('whiskies').select('id').eq('event_id', ev)
    const ids = (ws ?? []).map((w) => w.id)

    // Gastgeber wird bei jeder ABLAUF-Aktion abgewiesen
    expect(
      (await host.client.rpc('set_whisky_order', { p_event: ev, p_ordered: ids })).error?.code,
    ).toBe('TS004')
    expect((await host.client.rpc('start_event', { p_event: ev })).error?.code).toBe('TS004')
    expect((await host.client.rpc('rating_progress', { p_event: ev })).error?.code).toBe('TS004')

    // … darf aber die ECKDATEN weiter pflegen (Verfeinerung: Essen ist Sache
    // des Gastgebers, berührt die Blindheit nicht).
    expect(
      (
        await host.client.rpc('update_event_host_fields', {
          p_event: ev,
          p_theme: 'Islay',
          p_food_info: 'Käse & Brot',
          p_host_notes: '',
        })
      ).error,
    ).toBeNull()
    const { data: afterEck } = await service
      .from('tasting_events')
      .select('food_info')
      .eq('id', ev)
      .single()
    expect(afterEck!.food_info).toBe('Käse & Brot')

    // Der Helfer darf den Ablauf
    expect(
      (await helper.client.rpc('set_whisky_order', { p_event: ev, p_ordered: ids })).error,
    ).toBeNull()
    expect((await helper.client.rpc('start_event', { p_event: ev })).error).toBeNull()
    expect((await helper.client.rpc('rating_progress', { p_event: ev })).error).toBeNull()
    expect(
      (await helper.client.rpc('close_round', { p_event: ev, p_expected_position: 1 })).error,
    ).toBeNull()
    expect((await helper.client.rpc('close_event', { p_event: ev })).error).toBeNull()

    await closeAllActive()
  })

  it('der Außenstehende darf die Eckdaten nicht bearbeiten (TS004)', async () => {
    const ev = await buildEventWithHelper(`H-eck-out-${stamp}`)
    const { error } = await outsider.client.rpc('update_event_host_fields', {
      p_event: ev,
      p_theme: 'x',
      p_food_info: 'x',
      p_host_notes: '',
    })
    expect(error?.code).toBe('TS004')
  })

  it('der Außenstehende wird weiterhin abgewiesen (TS004)', async () => {
    const ev = await buildEventWithHelper(`H-ctrl2-${stamp}`)
    expect((await outsider.client.rpc('start_event', { p_event: ev })).error?.code).toBe('TS004')
    expect((await outsider.client.rpc('rating_progress', { p_event: ev })).error?.code).toBe(
      'TS004',
    )
  })
})

describe.skipIf(!RUN)('Deaktivierung & Helfer entfernen', () => {
  it('deactivate_member lehnt den Helfer eines offenen Events ab (TS013)', async () => {
    await buildEventWithHelper(`H-deact-${stamp}`)
    const { error } = await admin.client.rpc('deactivate_member', { p_target: helper.id })
    expect(error?.code).toBe('TS013')
  })

  it('Helfer entfernen: der Gastgeber bekommt Steuerung und Detail-Einblick zurück', async () => {
    await closeAllActive()
    const ev = await buildEventWithHelper(`H-remove-${stamp}`)

    const upd = await admin.client.rpc('update_event', {
      p_event: ev,
      p_event_date: FUTURE,
      p_location: `H-remove-${stamp}`,
      p_host_id: host.id,
      // p_helper_id weggelassen → Helfer entfernt
    })
    expect(upd.error).toBeNull()

    const { data } = await service
      .from('tasting_events')
      .select('helper_id')
      .eq('id', ev)
      .single()
    expect(data!.helper_id).toBeNull()

    // Gastgeber sieht jetzt wieder alle Details …
    const asHost = await host.client.from('whisky_details').select('name').eq('event_id', ev)
    expect(asHost.data ?? []).toHaveLength(3)

    // … und darf wieder steuern
    const { data: ws } = await service.from('whiskies').select('id').eq('event_id', ev)
    expect(
      (
        await host.client.rpc('set_whisky_order', {
          p_event: ev,
          p_ordered: (ws ?? []).map((w) => w.id),
        })
      ).error,
    ).toBeNull()

    // Der ehemalige Helfer sieht die Details nicht mehr
    const asHelper = await helper.client.from('whisky_details').select('name').eq('event_id', ev)
    expect(asHelper.data ?? []).toHaveLength(0)
  })
})
