/**
 * PROJ-30 · Feedback-Formular — Stundenlimit in der DB.
 *   - register_feedback: aktives Mitglied → ok; der 6. Aufruf in einer Stunde → TS029
 *   - Limit gilt pro Person (eine andere Person ist unberührt)
 *   - anonym und deaktiviert → TS004 (bzw. keine Ausführungsrechte)
 *   - Tabelle feedback_submissions: weder lesbar noch beschreibbar für Mitglieder
 *   - Einträge > 1 Tag werden beim nächsten Aufruf gelöscht
 *   - Konto löschen → Einträge gehen mit (CASCADE)
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

const PASSWORD = 'feedback-limit-2026!'
const stamp = Date.now()
const email = (tag: string) => `fb-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `FB ${tag}`, is_test: true },
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

async function countRows(profileId: string) {
  const { count, error } = await service
    .from('feedback_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
  if (error) throw error
  return count ?? 0
}

let alice: Person
let bob: Person
let inactive: Person

describe.skipIf(!RUN)('PROJ-30 register_feedback', () => {
  beforeAll(async () => {
    service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    alice = await makeUser('alice')
    bob = await makeUser('bob')
    inactive = await makeUser('inactive')
    const { error } = await service.from('profiles').update({ is_active: false }).eq('id', inactive.id)
    if (error) throw error
  }, 60_000)

  afterAll(async () => {
    for (const id of userIds) await service.auth.admin.deleteUser(id)
  }, 60_000)

  it('erlaubt 5 Einreichungen pro Stunde, die 6. scheitert mit TS029', async () => {
    for (let i = 0; i < 5; i++) {
      const { error } = await alice.client.rpc('register_feedback')
      expect(error).toBeNull()
    }
    const sixth = await alice.client.rpc('register_feedback')
    expect(sixth.error?.code).toBe('TS029')
    expect(sixth.error?.message).toContain('viele Nachrichten')
    expect(await countRows(alice.id)).toBe(5)
  })

  it('das Limit gilt pro Person', async () => {
    const { error } = await bob.client.rpc('register_feedback')
    expect(error).toBeNull()
  })

  it('parallele Aufrufe überholen das Limit nicht', async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => bob.client.rpc('register_feedback')),
    )
    // bob hatte schon 1 → noch 4 frei
    expect(results.filter((r) => !r.error)).toHaveLength(4)
    expect(results.filter((r) => r.error?.code === 'TS029')).toHaveLength(4)
    expect(await countRows(bob.id)).toBe(5)
  })

  it('ältere Einträge zählen nicht und werden nach einem Tag gelöscht', async () => {
    // alle Einträge von alice auf vor 2 Tagen zurückdatieren
    const old = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    const { error: upErr } = await service
      .from('feedback_submissions')
      .update({ created_at: old })
      .eq('profile_id', alice.id)
    expect(upErr).toBeNull()

    const { error } = await alice.client.rpc('register_feedback')
    expect(error).toBeNull()
    expect(await countRows(alice.id)).toBe(1) // 5 alte gelöscht, 1 neuer
  })

  it('anonym: kein Aufruf möglich', async () => {
    const anon = createClient<Database>(SUPABASE_URL!, ANON!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error } = await anon.rpc('register_feedback')
    expect(error).not.toBeNull()
  })

  it('deaktiviertes Konto → TS004, kein Eintrag', async () => {
    const { error } = await inactive.client.rpc('register_feedback')
    expect(error?.code).toBe('TS004')
    expect(await countRows(inactive.id)).toBe(0)
  })

  it('Tabelle ist für Mitglieder weder lesbar noch beschreibbar', async () => {
    const read = await alice.client.from('feedback_submissions').select('id')
    // ohne Rechte: Fehler (permission denied) oder leer — nie fremde/eigene Zeilen
    expect(read.data ?? []).toHaveLength(0)

    const ins = await alice.client.from('feedback_submissions').insert({ profile_id: alice.id })
    expect(ins.error).not.toBeNull()

    const del = await alice.client.from('feedback_submissions').delete().eq('profile_id', alice.id)
    expect(del.error).not.toBeNull()
    expect(await countRows(alice.id)).toBe(1)
  })

  it('Konto löschen nimmt die Einträge mit (CASCADE)', async () => {
    const tmp = await makeUser('tmp')
    expect((await tmp.client.rpc('register_feedback')).error).toBeNull()
    expect(await countRows(tmp.id)).toBe(1)
    const { error } = await service.auth.admin.deleteUser(tmp.id)
    expect(error).toBeNull()
    userIds.splice(userIds.indexOf(tmp.id), 1)
    expect(await countRows(tmp.id)).toBe(0)
  })
})
