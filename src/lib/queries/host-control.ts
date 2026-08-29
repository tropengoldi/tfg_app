import { createClient } from '@/lib/supabase/server'
import type { EventStatus } from '@/lib/supabase/aliases'

export interface OrderedWhisky {
  whisky_id: string
  name: string
  position: number
}

export interface RatingProgress {
  /** Wie viele Teilnehmer haben den aktuellen Whisky schon bewertet. */
  rated: number
  /** Wie viele Teilnehmer hat der Abend insgesamt. */
  participants: number
}

export interface HostControlData {
  event: {
    id: string
    event_date: string
    location: string
    status: EventStatus
    current_position: number
    theme: string | null
    food_info: string | null
    host_notes: string | null
  }
  whiskies: OrderedWhisky[]
  /** Nur im laufenden Event gesetzt, sonst null. */
  progress: RatingProgress | null
}

/**
 * Die Steuer-Daten eines Abends für den Gastgeber (bzw. Admin).
 * Der Aufrufer hat den Zugriff bereits über `requireHost(eventId)` geprüft;
 * gibt `null` zurück, wenn das Event zwischenzeitlich verschwunden ist.
 */
export async function getHostControlData(
  eventId: string,
): Promise<HostControlData | null> {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('tasting_events')
    .select(
      'id, event_date, location, status, current_position, theme, food_info, host_notes',
    )
    .eq('id', eventId)
    .maybeSingle()
  if (!event) return null

  // Zwei Abfragen statt eines Embeds: zwischen `whiskies` und `whisky_details`
  // gibt es zwei FK-Beziehungen (Einzel- und zusammengesetzter Schlüssel), ein
  // `whisky_details(name)` wäre mehrdeutig.
  const [{ data: rows }, { data: details }] = await Promise.all([
    supabase
      .from('whiskies')
      .select('id, position')
      .eq('event_id', eventId)
      .order('position', { ascending: true }),
    supabase.from('whisky_details').select('whisky_id, name').eq('event_id', eventId),
  ])

  const nameById = new Map(
    (details ?? []).map((d) => [d.whisky_id as string, d.name as string]),
  )
  const whiskies: OrderedWhisky[] = (rows ?? []).map((r) => ({
    whisky_id: r.id,
    name: nameById.get(r.id) ?? '—',
    position: r.position,
  }))

  let progress: RatingProgress | null = null
  if (event.status === 'active') {
    const { data: prog } = await supabase.rpc('rating_progress', { p_event: eventId })
    const cur = (prog ?? []).find(
      (p) => p.whisky_position === event.current_position,
    )
    const any = (prog ?? [])[0]
    progress = {
      rated: cur?.rating_count ?? 0,
      participants: cur?.participant_count ?? any?.participant_count ?? 0,
    }
  }

  return {
    event: {
      id: event.id,
      event_date: event.event_date,
      location: event.location,
      status: event.status,
      current_position: event.current_position,
      theme: event.theme,
      food_info: event.food_info,
      host_notes: event.host_notes,
    },
    whiskies,
    progress,
  }
}
