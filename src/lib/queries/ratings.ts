import { createClient } from '@/lib/supabase/server'
import type { EventStatus } from '@/lib/supabase/aliases'
import type { MyRating, WhiskyPosition } from '@/lib/rating-view'

export interface RatingViewData {
  event: {
    id: string
    event_date: string
    location: string
    status: EventStatus
    current_position: number
  }
  total: number
  whiskies: WhiskyPosition[]
  myRatings: MyRating[]
}

/**
 * Die Bewertungsansicht-Daten eines Events: Event-Status + aktuelle Position,
 * die Whisky-**Positionen** (keine Namen) und die **eigenen** Bewertungen.
 *
 * Gibt `null` zurück, wenn der Nutzer bei diesem Event kein Teilnehmer ist oder
 * die Event-ID nicht existiert → die Seite antwortet dann mit „nicht gefunden".
 */
export async function getRatingViewData(
  eventId: string,
  userId: string,
): Promise<RatingViewData | null> {
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
    .select('id, event_date, location, status, current_position')
    .eq('id', eventId)
    .maybeSingle()
  if (!event) return null

  const { data: rows } = await supabase
    .from('whiskies')
    .select('id, position')
    .eq('event_id', eventId)
    .order('position', { ascending: true })

  const { data: ratings } = await supabase
    .from('ratings')
    .select('whisky_id, nose_points, taste_points, notes')
    .eq('event_id', eventId)
    .eq('profile_id', userId)

  const whiskies: WhiskyPosition[] = (rows ?? []).map((r) => ({
    position: r.position,
    whisky_id: r.id,
  }))

  return {
    event: {
      id: event.id,
      event_date: event.event_date,
      location: event.location,
      status: event.status,
      current_position: event.current_position,
    },
    total: whiskies.length,
    whiskies,
    myRatings: (ratings ?? []).map((r) => ({
      whisky_id: r.whisky_id,
      nose_points: r.nose_points,
      taste_points: r.taste_points,
      notes: r.notes,
    })),
  }
}
