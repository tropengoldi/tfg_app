/**
 * PROJ-14 · Profil sichtbar für andere — DB-Regeln.
 *
 *   - `profiles.bio` / `favorite_dram` / `favorite_region` sind über die
 *     Basistabelle für `authenticated` nicht mehr direkt lesbar (weder für
 *     fremde noch für die eigene Zeile) — nur noch über `profiles_public`.
 *   - `profiles_public` maskiert die drei Felder anhand der `show_*`-Schalter,
 *     außer für die eigene Zeile (die sieht sich immer vollständig).
 *   - Jedes Mitglied kann nur die eigenen `show_*`-Schalter setzen.
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

const PASSWORD = 'profile-visibility-2026!'
const stamp = Date.now()
const email = (tag: string) => `profvis-${tag}-${stamp}@example.com`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Client = SupabaseClient<Database>
let service: Client
const userIds: string[] = []

interface Person {
  id: string
  client: Client
}

async function makeUser(tag: string): Promise<Person> {
  const { data, error } = await service.auth.admin.createUser({
    email: email(tag),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `Profvis ${tag}` },
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

  const { error } = await service
    .from('profiles')
    .update({
      bio: 'Bio von B',
      favorite_dram: 'Lagavulin 16',
      favorite_region: 'Islay',
    })
    .eq('id', userB.id)
  if (error) throw error
}, 120_000)

afterAll(async () => {
  if (!RUN || !service) return
  for (const id of userIds) {
    await service.auth.admin.deleteUser(id).then(undefined, () => {})
  }
})

describe.skipIf(!RUN)('Direktzugriff auf profiles.bio / favorite_dram / favorite_region', () => {
  it('userA kann diese drei Spalten weder bei userB noch bei sich selbst direkt lesen', async () => {
    const foreign = await userA.client
      .from('profiles')
      .select('bio, favorite_dram, favorite_region')
      .eq('id', userB.id)
    expect(foreign.error).toBeTruthy()
    expect(foreign.error!.code).toBe('42501')

    const own = await userA.client
      .from('profiles')
      .select('bio, favorite_dram, favorite_region')
      .eq('id', userA.id)
    expect(own.error).toBeTruthy()
    expect(own.error!.code).toBe('42501')
  })

  it('display_name und die show_*-Schalter bleiben direkt lesbar', async () => {
    const { data, error } = await userA.client
      .from('profiles')
      .select('display_name, show_bio, show_favorite_dram')
      .eq('id', userB.id)
      .single()
    expect(error).toBeNull()
    expect(data!.display_name).toBe(`Profvis b`)
    expect(data!.show_bio).toBe(true)
  })
})

describe.skipIf(!RUN)('profiles_public — Maskierung', () => {
  it('Default (alles sichtbar): userA sieht Bs Stammdaten über die Sicht', async () => {
    const { data, error } = await userA.client
      .from('profiles_public')
      .select('bio, favorite_dram, favorite_region')
      .eq('id', userB.id)
      .single()
    expect(error).toBeNull()
    expect(data!.bio).toBe('Bio von B')
    expect(data!.favorite_dram).toBe('Lagavulin 16')
  })

  it('userB verbirgt bio — userA sieht danach null, das Feld bleibt aber gespeichert', async () => {
    const upd = await userB.client.from('profiles').update({ show_bio: false }).eq('id', userB.id)
    expect(upd.error).toBeNull()

    const asA = await userA.client
      .from('profiles_public')
      .select('bio')
      .eq('id', userB.id)
      .single()
    expect(asA.error).toBeNull()
    expect(asA.data!.bio).toBeNull()

    // Der Wert ist nicht weg — nur maskiert. Serviceclient (bypasst RLS) sieht ihn weiter.
    const raw = await service.from('profiles').select('bio').eq('id', userB.id).single()
    expect(raw.data!.bio).toBe('Bio von B')

    // Zurücksetzen für nachfolgende Tests.
    await userB.client.from('profiles').update({ show_bio: true }).eq('id', userB.id)
  })

  it('userB sieht sein eigenes bio über profiles_public immer, auch wenn der Schalter aus ist', async () => {
    await userB.client.from('profiles').update({ show_bio: false }).eq('id', userB.id)

    const asSelf = await userB.client
      .from('profiles_public')
      .select('bio')
      .eq('id', userB.id)
      .single()
    expect(asSelf.error).toBeNull()
    expect(asSelf.data!.bio).toBe('Bio von B')

    await userB.client.from('profiles').update({ show_bio: true }).eq('id', userB.id)
  })
})

describe.skipIf(!RUN)('Schreibzugriff auf die Schalter', () => {
  it('userA kann Bs Schalter nicht setzen (RLS: nur die eigene Zeile)', async () => {
    const { error, data } = await userA.client
      .from('profiles')
      .update({ show_avg_points: false })
      .eq('id', userB.id)
      .select('id')
    // RLS lässt die Zeile nicht matchen → kein Fehler, aber 0 betroffene Zeilen.
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  })

  it('userA kann die eigenen Schalter setzen', async () => {
    const { error, data } = await userA.client
      .from('profiles')
      .update({ show_avg_points: false })
      .eq('id', userA.id)
      .select('show_avg_points')
    expect(error).toBeNull()
    expect(data?.[0]?.show_avg_points).toBe(false)
  })
})
