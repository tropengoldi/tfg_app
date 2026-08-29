/**
 * PROJ-6 · Gastgeber-Steuerung: die RPC-Regeln hinter dem Steuerpult.
 *   - Nicht-Gastgeber wird bei jeder Steuer-Aktion abgewiesen (TS004)
 *   - rating_progress nur für Gastgeber / Admin
 *   - close_round: optimistische Positionssperre (TS002)
 *   - start_event: kein zweites aktives Event (TS010)
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

const PASSWORD = 'host-control-2026!'
const stamp = Date.now()
const email = (tag: string) => `host-ctl-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `HC ${tag}` },
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
let outsider: Person

async function makeEventWithWhiskies(location: string, whiskyCount: number) {
  const { data, error } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: location,
    p_host_id: host.id,
  })
  if (error) throw error
  const evId = data as string
  eventIds.push(evId)
  for (let i = 0; i < whiskyCount; i++) {
    const { error: wErr } = await host.client.rpc('add_whisky', {
      p_event: evId,
      p_name: `W${i + 1}`,
    })
    if (wErr) throw wErr
  }
  return evId
}

async function closeAllActive() {
  await service
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
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

describe.skipIf(!RUN)('Nicht-Gastgeber wird abgewiesen (TS004)', () => {
  it('update_event_host_fields', async () => {
    const ev = await makeEventWithWhiskies(`HC-eck-${stamp}`, 1)
    const { error } = await outsider.client.rpc('update_event_host_fields', {
      p_event: ev,
      p_theme: 'x',
      p_food_info: '',
      p_host_notes: '',
    })
    expect(error?.code).toBe('TS004')
  })

  it('set_whisky_order', async () => {
    const ev = await makeEventWithWhiskies(`HC-ord-${stamp}`, 2)
    const { data: ws } = await service
      .from('whiskies')
      .select('id')
      .eq('event_id', ev)
    const { error } = await outsider.client.rpc('set_whisky_order', {
      p_event: ev,
      p_ordered: (ws ?? []).map((w) => w.id),
    })
    expect(error?.code).toBe('TS004')
  })

  it('start_event / close_round / close_event', async () => {
    const ev = await makeEventWithWhiskies(`HC-flow-${stamp}`, 2)
    expect((await outsider.client.rpc('start_event', { p_event: ev })).error?.code).toBe('TS004')
    expect(
      (await outsider.client.rpc('close_round', { p_event: ev, p_expected_position: 1 })).error
        ?.code,
    ).toBe('TS004')
    expect((await outsider.client.rpc('close_event', { p_event: ev })).error?.code).toBe('TS004')
  })

  it('rating_progress', async () => {
    const ev = await makeEventWithWhiskies(`HC-prog-${stamp}`, 1)
    const { error } = await outsider.client.rpc('rating_progress', { p_event: ev })
    expect(error?.code).toBe('TS004')
  })
})

describe.skipIf(!RUN)('rating_progress für Gastgeber und Admin', () => {
  it('Gastgeber und Admin bekommen die Zählwerte', async () => {
    const ev = await makeEventWithWhiskies(`HC-prog2-${stamp}`, 2)
    const asHost = await host.client.rpc('rating_progress', { p_event: ev })
    expect(asHost.error).toBeNull()
    expect(Array.isArray(asHost.data)).toBe(true)
    const asAdmin = await admin.client.rpc('rating_progress', { p_event: ev })
    expect(asAdmin.error).toBeNull()
  })
})

describe.skipIf(!RUN)('Zustandsübergänge', () => {
  it('start_event lehnt ab, wenn schon ein anderes Event läuft (TS010)', async () => {
    await closeAllActive()
    const running = await makeEventWithWhiskies(`HC-run1-${stamp}`, 1)
    expect((await host.client.rpc('start_event', { p_event: running })).error).toBeNull()

    const second = await makeEventWithWhiskies(`HC-run2-${stamp}`, 1)
    const { error } = await host.client.rpc('start_event', { p_event: second })
    expect(error?.code).toBe('TS010')

    await closeAllActive()
  })

  it('close_round mit falscher erwarteter Position → TS002', async () => {
    await closeAllActive()
    const ev = await makeEventWithWhiskies(`HC-cr-${stamp}`, 3)
    expect((await host.client.rpc('start_event', { p_event: ev })).error).toBeNull()

    // current_position ist 1; wir behaupten 2 → optimistische Sperre greift.
    const { error } = await host.client.rpc('close_round', {
      p_event: ev,
      p_expected_position: 2,
    })
    expect(error?.code).toBe('TS002')

    // mit der richtigen Position klappt es
    expect(
      (await host.client.rpc('close_round', { p_event: ev, p_expected_position: 1 })).error,
    ).toBeNull()

    await closeAllActive()
  })
})
