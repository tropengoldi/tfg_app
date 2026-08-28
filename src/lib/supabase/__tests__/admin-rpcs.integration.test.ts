/**
 * PROJ-3 · Admin-Teilnehmerverwaltung — Regeln der RPCs.
 *
 * Prüft die serverseitig erzwungenen Regeln von `admin_list_members`,
 * `deactivate_member`, `reactivate_member`, `set_member_admin`.
 *
 * Ausführen:  npm run test:rls   (braucht .env.local mit SERVICE_ROLE_KEY)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '../types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const RUN = Boolean(SUPABASE_URL && ANON && SERVICE)

const PASSWORD = 'admin-rpc-2026!'
const stamp = Date.now()
const email = (tag: string) => `admin-rpc-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const TRANSIENT = /upstream connect|protocol error|before headers|reset|fetch failed|ECONNRESET|socket hang up|ETIMEDOUT|network|50[234]/i

type Client = SupabaseClient<Database>
let service: Client
const createdUserIds: string[] = []
const createdEventIds: string[] = []

interface Person {
  id: string
  email: string
  client: Client
}

async function makeUser(tag: string, { signIn = true }: { signIn?: boolean } = {}): Promise<Person> {
  let lastErr: unknown
  for (let i = 1; i <= 4; i++) {
    try {
      const { data, error } = await service.auth.admin.createUser({
        email: email(tag),
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: `RPC ${tag}` },
      })
      if (error) throw error
      createdUserIds.push(data.user.id)
      const client = createClient<Database>(SUPABASE_URL!, ANON!, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      if (signIn) {
        const s = await client.auth.signInWithPassword({ email: email(tag), password: PASSWORD })
        if (s.error) throw s.error
      }
      await sleep(120)
      return { id: data.user.id, email: email(tag), client }
    } catch (err) {
      lastErr = err
      const msg = (err as { message?: string })?.message ?? String(err)
      if (!TRANSIENT.test(msg) || i === 4) throw err
      await sleep(400 * i)
    }
  }
  throw lastErr
}

async function setRole(userId: string, role: 'admin' | 'teilnehmer') {
  const { error } = await service.from('profiles').update({ role }).eq('id', userId)
  if (error) throw error
}
async function profileOf(userId: string) {
  const { data } = await service
    .from('profiles')
    .select('role, is_active')
    .eq('id', userId)
    .single()
  return data!
}

let admin: Person
let secondAdminSeed: Person // created as teilnehmer, promoted in the flow
let activeUser: Person
let invitedUser: Person

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  await setRole(admin.id, 'admin')
  secondAdminSeed = await makeUser('second')
  activeUser = await makeUser('active')
  invitedUser = await makeUser('invited', { signIn: false })
}, 120_000)

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of createdEventIds) {
    await service.from('tasting_events').delete().eq('id', id).then(undefined, () => {})
  }
  for (const id of createdUserIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('admin_list_members', () => {
  it('Nicht-Admin wird abgewiesen (TS004)', async () => {
    const { error } = await activeUser.client.rpc('admin_list_members')
    expect(error?.code).toBe('TS004')
  })

  it('Admin bekommt Profile mit E-Mail und Anmeldestatus', async () => {
    const { data, error } = await admin.client.rpc('admin_list_members')
    expect(error).toBeNull()
    const rows = data as { id: string; email: string; has_signed_in: boolean; role: string }[]
    const me = rows.find((r) => r.id === admin.id)
    expect(me?.email).toBe(admin.email)
    expect(me?.has_signed_in).toBe(true)
    expect(me?.role).toBe('admin')
    const inv = rows.find((r) => r.id === invitedUser.id)
    expect(inv?.has_signed_in).toBe(false)
  })
})

describe.skipIf(!RUN)('deactivate / reactivate', () => {
  it('Nicht-Admin wird abgewiesen (TS004)', async () => {
    const { error } = await activeUser.client.rpc('deactivate_member', { p_target: invitedUser.id })
    expect(error?.code).toBe('TS004')
  })

  it('Admin deaktiviert und reaktiviert einen Teilnehmer', async () => {
    const d = await admin.client.rpc('deactivate_member', { p_target: activeUser.id })
    expect(d.error).toBeNull()
    expect((await profileOf(activeUser.id)).is_active).toBe(false)

    const r = await admin.client.rpc('reactivate_member', { p_target: activeUser.id })
    expect(r.error).toBeNull()
    expect((await profileOf(activeUser.id)).is_active).toBe(true)
  })

  it('Admin kann sich nicht selbst deaktivieren (TS011)', async () => {
    const { error } = await admin.client.rpc('deactivate_member', { p_target: admin.id })
    expect(error?.code).toBe('TS011')
  })

  it('Gastgeber eines nicht abgeschlossenen Events lässt sich nicht deaktivieren (TS013)', async () => {
    const host = await makeUser('host', { signIn: false })
    const { data: eventId, error: ce } = await admin.client.rpc('create_event', {
      p_event_date: '2026-11-01',
      p_location: 'RPC-Test',
      p_host_id: host.id,
    })
    expect(ce).toBeNull()
    createdEventIds.push(eventId as string)

    const { error } = await admin.client.rpc('deactivate_member', { p_target: host.id })
    expect(error?.code).toBe('TS013')
  })
})

describe.skipIf(!RUN)('set_member_admin', () => {
  it('Nicht-Admin wird abgewiesen (TS004)', async () => {
    const { error } = await activeUser.client.rpc('set_member_admin', {
      p_target: activeUser.id,
      p_make_admin: true,
    })
    expect(error?.code).toBe('TS004')
  })

  it('„Eingeladen" (nie angemeldet) lässt sich nicht befördern (TS014)', async () => {
    const { error } = await admin.client.rpc('set_member_admin', {
      p_target: invitedUser.id,
      p_make_admin: true,
    })
    expect(error?.code).toBe('TS014')
  })

  it('Selbst-Degradierung als letzter Admin wird abgelehnt (TS012)', async () => {
    // Aktuell ist `admin` der einzige aktive Admin.
    const { error } = await admin.client.rpc('set_member_admin', {
      p_target: admin.id,
      p_make_admin: false,
    })
    expect(error?.code).toBe('TS012')
    expect((await profileOf(admin.id)).role).toBe('admin')
  })

  it('Admin befördert einen aktiven, angemeldeten Teilnehmer', async () => {
    const { error } = await admin.client.rpc('set_member_admin', {
      p_target: secondAdminSeed.id,
      p_make_admin: true,
    })
    expect(error).toBeNull()
    expect((await profileOf(secondAdminSeed.id)).role).toBe('admin')
  })

  it('Selbst-Degradierung gelingt, solange ein weiterer aktiver Admin bleibt', async () => {
    const { error } = await admin.client.rpc('set_member_admin', {
      p_target: admin.id,
      p_make_admin: false,
    })
    expect(error).toBeNull()
    expect((await profileOf(admin.id)).role).toBe('teilnehmer')
    // Zustand wiederherstellen, damit `admin` weiter für Aufräum-Rechte taugt.
    await setRole(admin.id, 'admin')
  })
})
