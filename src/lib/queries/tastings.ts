import { createClient } from '@/lib/supabase/server'
import { todayISO } from '@/lib/dates'
import type { EventStatus } from '@/lib/supabase/aliases'

export interface MyTastingRow {
  id: string
  event_date: string
  location: string
  status: EventStatus
  host_name: string
  /** Ist der abfragende Nutzer der Gastgeber dieses Abends? (→ „Steuern"-Aktion) */
  is_host: boolean
}

/**
 * Die Tastings, bei denen der angemeldete Nutzer als Teilnehmer eingetragen ist.
 * Kommende zuerst (aufsteigend), dann vergangene (absteigend). Wirft bei Fehler.
 */
export async function getMyTastings(userId: string): Promise<MyTastingRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_participants')
    .select('tasting_events(id, event_date, location, status, host_id)')
    .eq('profile_id', userId)
  if (error) throw error

  type Row = {
    tasting_events: {
      id: string
      event_date: string
      location: string
      status: EventStatus
      host_id: string
    } | null
  }

  const events = (data as Row[])
    .map((r) => r.tasting_events)
    .filter((e): e is NonNullable<Row['tasting_events']> => e !== null)

  const hostIds = [...new Set(events.map((e) => e.host_id))]
  const hostNames = new Map<string, string>()
  if (hostIds.length > 0) {
    const { data: hosts } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', hostIds)
    for (const h of hosts ?? []) hostNames.set(h.id, h.display_name)
  }

  const today = todayISO()
  return events
    .map((e) => ({
      id: e.id,
      event_date: e.event_date,
      location: e.location,
      status: e.status,
      host_name: hostNames.get(e.host_id) ?? 'Unbekannt',
      is_host: e.host_id === userId,
    }))
    .sort((a, b) => {
      const aUpcoming = a.event_date >= today
      const bUpcoming = b.event_date >= today
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
      return aUpcoming
        ? a.event_date.localeCompare(b.event_date)
        : b.event_date.localeCompare(a.event_date)
    })
}

export interface MyWhisky {
  whisky_id: string
  name: string
  video_url: string | null
  owner_notes: string | null
}

export interface WhiskyEntryData {
  event: {
    id: string
    event_date: string
    location: string
    status: EventStatus
  }
  isHost: boolean
  limit: number | null
  whiskies: MyWhisky[]
  eventWhiskyCount: number
}

/**
 * Die „Meine Whiskys"-Daten für ein Event: der Event selbst, ob der Nutzer
 * Gastgeber ist, das Limit, seine eigenen Whisky-Einträge und die Gesamtzahl der
 * Whiskys im Event (für die 10er-Obergrenze).
 *
 * Gibt `null` zurück, wenn der Nutzer bei diesem Event kein Teilnehmer ist oder
 * die Event-ID nicht existiert → die Seite antwortet dann mit „nicht gefunden".
 */
export async function getWhiskyEntryData(
  eventId: string,
  userId: string,
): Promise<WhiskyEntryData | null> {
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('event_participants')
    .select('profile_id')
    .eq('event_id', eventId)
    .eq('profile_id', userId)
    .maybeSingle()
  if (!membership) return null

  const { data: event } = await supabase
    .from('tasting_events')
    .select('id, event_date, location, status, host_id, max_whiskies_per_participant')
    .eq('id', eventId)
    .maybeSingle()
  if (!event) return null

  const { data: details } = await supabase
    .from('whisky_details')
    .select('whisky_id, name, video_url, owner_notes, created_at')
    .eq('event_id', eventId)
    .eq('brought_by', userId)
    .order('created_at', { ascending: true })

  const { count } = await supabase
    .from('whiskies')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)

  return {
    event: {
      id: event.id,
      event_date: event.event_date,
      location: event.location,
      status: event.status,
    },
    isHost: event.host_id === userId,
    limit: event.max_whiskies_per_participant,
    whiskies: (details ?? []).map((d) => ({
      whisky_id: d.whisky_id,
      name: d.name,
      video_url: d.video_url,
      owner_notes: d.owner_notes,
    })),
    eventWhiskyCount: count ?? 0,
  }
}
