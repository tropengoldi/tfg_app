/**
 * PROJ-16 · Nachrichten an Teilnehmer — DB-Regeln.
 *
 *   - resolve_message_recipients: aktive Mitglieder erforderlich, Absender
 *     muss bei Tasting-Bezug beteiligt sein, ein Empfänger außerhalb des
 *     Tastings löst einen Fehler aus, inaktive Empfänger und der Absender
 *     selbst werden still herausgefiltert.
 *   - record_sent_message speichert nur für tatsächlich gültige Empfänger;
 *     ohne gültigen Empfänger wird nichts gespeichert.
 *   - RLS: nur der Absender sieht seine eigenen Nachrichten/Empfängerlisten;
 *     Direkt-Inserts ohne die RPCs sind verboten.
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

const PASSWORD = 'messages-2026!'
const stamp = Date.now()
const email = (tag: string) => `msg-${tag}-${stamp}@example.com`
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
    user_metadata: { display_name: `Msg ${tag}` },
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
let sender: Person
let member: Person // Teilnehmer des Tastings, gültiger Empfänger
let outsider: Person // aktives Mitglied, aber NICHT im Tasting
let evId = ''

beforeAll(async () => {
  if (!RUN) return
  service = createClient<Database>(SUPABASE_URL!, SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  admin = await makeUser('admin')
  const { error } = await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id)
  if (error) throw error

  sender = await makeUser('sender')
  member = await makeUser('member')
  outsider = await makeUser('outsider')

  const { data: evData, error: evErr } = await admin.client.rpc('create_event', {
    p_event_date: FUTURE,
    p_location: `Msg-${stamp}`,
    p_host_id: sender.id,
  })
  if (evErr) throw evErr
  evId = evData as string
  eventIds.push(evId)

  const setParts = await admin.client.rpc('set_event_participants', {
    p_event: evId,
    p_profile_ids: [sender.id, member.id],
  })
  if (setParts.error) throw setParts.error
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

describe.skipIf(!RUN)('resolve_message_recipients — Allgemein', () => {
  it('löst die E-Mail-Adresse eines aktiven Mitglieds auf', async () => {
    const { data, error } = await sender.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id],
    })
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].recipient_email).toBe(email('member'))
  })

  it('filtert den Absender selbst still aus der Empfängerliste', async () => {
    const { data, error } = await sender.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [sender.id, member.id],
    })
    expect(error).toBeNull()
    expect(data!.map((r) => r.recipient_id)).toEqual([member.id])
  })

  it('filtert einen deaktivierten Empfänger still heraus (kein Fehler)', async () => {
    const temp = await makeUser('temp')
    await service.from('profiles').update({ is_active: false }).eq('id', temp.id)

    const { data, error } = await sender.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id, temp.id],
    })
    expect(error).toBeNull()
    expect(data!.map((r) => r.recipient_id)).toEqual([member.id])
  })

  it('nicht-aktives Mitglied als Absender wird abgewiesen (TS004)', async () => {
    const inactive = await makeUser('inactive-sender')
    await service.from('profiles').update({ is_active: false }).eq('id', inactive.id)

    const { error } = await inactive.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id],
    })
    expect(error?.code).toBe('TS004')
  })
})

describe.skipIf(!RUN)('resolve_message_recipients — Tasting-bezogen', () => {
  it('Absender ist nicht beteiligt → TS018', async () => {
    const { error } = await outsider.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id],
      p_event_id: evId,
    })
    expect(error?.code).toBe('TS018')
  })

  it('ein gewählter Empfänger gehört nicht zum Tasting → TS019', async () => {
    const { error } = await sender.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id, outsider.id],
      p_event_id: evId,
    })
    expect(error?.code).toBe('TS019')
  })

  it('gültiger Absender + gültiger Empfänger → aufgelöst', async () => {
    const { data, error } = await sender.client.rpc('resolve_message_recipients', {
      p_recipient_ids: [member.id],
      p_event_id: evId,
    })
    expect(error).toBeNull()
    expect(data!.map((r) => r.recipient_id)).toEqual([member.id])
  })
})

describe.skipIf(!RUN)('record_sent_message', () => {
  it('ohne gültigen Empfänger wird nichts gespeichert (TS020)', async () => {
    const { error } = await sender.client.rpc('record_sent_message', {
      p_body: 'Hallo?',
      p_recipient_ids: [sender.id], // nach Filterung leer
    })
    expect(error?.code).toBe('TS020')
  })

  it('speichert Nachricht + Empfängerliste, nur der Absender sieht sie', async () => {
    const { data: msgId, error } = await sender.client.rpc('record_sent_message', {
      p_body: 'Bringt noch ein Glas mit!',
      p_recipient_ids: [member.id],
      p_event_id: evId,
    })
    expect(error).toBeNull()
    expect(msgId).toBeTruthy()

    const own = await sender.client.from('messages').select('id, body').eq('id', msgId as string)
    expect(own.data).toHaveLength(1)
    expect(own.data![0].body).toBe('Bringt noch ein Glas mit!')

    const ownRecipients = await sender.client
      .from('message_recipients')
      .select('profile_id')
      .eq('message_id', msgId as string)
    expect(ownRecipients.data).toHaveLength(1)
    expect(ownRecipients.data![0].profile_id).toBe(member.id)

    // Ein anderes Mitglied (auch der Empfänger selbst) sieht die Nachricht nicht.
    const asMember = await member.client.from('messages').select('id').eq('id', msgId as string)
    expect(asMember.data ?? []).toHaveLength(0)
    const asMemberRecipients = await member.client
      .from('message_recipients')
      .select('profile_id')
      .eq('message_id', msgId as string)
    expect(asMemberRecipients.data ?? []).toHaveLength(0)
  })

  it('leerer Text wird von der Tabellen-CHECK abgelehnt', async () => {
    const { error } = await sender.client.rpc('record_sent_message', {
      p_body: '   ',
      p_recipient_ids: [member.id],
    })
    expect(error).toBeTruthy()
    expect(error!.code).toBe('23514')
  })
})

describe.skipIf(!RUN)('Kein Direktzugriff außerhalb der RPCs', () => {
  it('ein direkter Insert in messages wird abgelehnt', async () => {
    const { error } = await sender.client
      .from('messages')
      .insert({ sender_id: sender.id, body: 'Umgehungsversuch' })
    expect(error).toBeTruthy()
    expect(error!.code).toBe('42501')
  })
})
