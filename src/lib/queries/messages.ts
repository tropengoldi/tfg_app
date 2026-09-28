import { createClient } from '@/lib/supabase/server'
import { getActiveMembers } from '@/lib/queries/community'

export interface ComposeRecipient {
  id: string
  name: string
}

export interface ComposeTasting {
  id: string
  eventDate: string
  location: string
  participants: ComposeRecipient[]
}

export interface ComposeData {
  /** Alle aktiven Mitglieder außer man selbst, alphabetisch — für „Allgemein". */
  activeMembers: ComposeRecipient[]
  /** Die eigenen Tastings (Teilnehmer, Gastgeber oder Helfer), aktuellstes
   * zuerst, je mit Teilnehmerliste außer man selbst — für „Zu einem Tasting". */
  myTastings: ComposeTasting[]
}

/**
 * Alle Daten, die der Nachrichten-Compose-Screen auf einen Schlag braucht
 * (PROJ-16) — Umschalten zwischen den beiden Modi passiert danach rein im
 * Browser, ohne Nachladen.
 */
export async function getComposeData(userId: string): Promise<ComposeData> {
  const supabase = await createClient()

  const [members, participantRows] = await Promise.all([
    getActiveMembers(),
    supabase
      .from('event_participants')
      .select('tasting_events(id, event_date, location)')
      .eq('profile_id', userId),
  ])
  if (participantRows.error) throw participantRows.error

  const { data: helperRows, error: helperErr } = await supabase
    .from('tasting_events')
    .select('id, event_date, location')
    .eq('helper_id', userId)
  if (helperErr) throw helperErr

  type EventShape = { id: string; event_date: string; location: string }
  type Row = { tasting_events: EventShape | null }

  const byId = new Map<string, EventShape>()
  for (const r of (participantRows.data as Row[]).map((x) => x.tasting_events)) {
    if (r) byId.set(r.id, r)
  }
  for (const r of (helperRows ?? []) as EventShape[]) {
    if (!byId.has(r.id)) byId.set(r.id, r)
  }
  const events = [...byId.values()].sort((a, b) => b.event_date.localeCompare(a.event_date))

  const eventIds = events.map((e) => e.id)
  const participantsByEvent = new Map<string, ComposeRecipient[]>()
  if (eventIds.length > 0) {
    const { data: parts, error: partsErr } = await supabase
      .from('event_participants')
      .select('event_id, profile_id')
      .in('event_id', eventIds)
    if (partsErr) throw partsErr

    const neededIds = [
      ...new Set((parts ?? []).map((p) => p.profile_id).filter((id) => id !== userId)),
    ]
    const namesById = new Map<string, string>()
    if (neededIds.length > 0) {
      const { data: profs, error: profsErr } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', neededIds)
      if (profsErr) throw profsErr
      for (const p of profs ?? []) namesById.set(p.id, p.display_name)
    }

    for (const p of parts ?? []) {
      if (p.profile_id === userId) continue
      const name = namesById.get(p.profile_id)
      if (!name) continue // deaktiviert oder anderweitig nicht (mehr) auflösbar
      const list = participantsByEvent.get(p.event_id) ?? []
      list.push({ id: p.profile_id, name })
      participantsByEvent.set(p.event_id, list)
    }
  }

  return {
    activeMembers: members.filter((m) => m.id !== userId),
    myTastings: events.map((e) => ({
      id: e.id,
      eventDate: e.event_date,
      location: e.location,
      participants: (participantsByEvent.get(e.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'de'),
      ),
    })),
  }
}

export interface SentMessageRow {
  id: string
  body: string
  createdAt: string
  recipientCount: number
  tasting: { id: string; eventDate: string; location: string } | null
}

/** Die eigenen verschickten Nachrichten, neueste zuerst (PROJ-16). */
export async function getSentMessages(userId: string): Promise<SentMessageRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select(
      'id, body, created_at, event_id, message_recipients(count), tasting_events(id, event_date, location)',
    )
    .eq('sender_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.created_at,
    recipientCount: m.message_recipients?.[0]?.count ?? 0,
    tasting: m.tasting_events
      ? {
          id: m.tasting_events.id,
          eventDate: m.tasting_events.event_date,
          location: m.tasting_events.location,
        }
      : null,
  }))
}
