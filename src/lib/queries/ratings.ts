import type { CompareMark } from '@/lib/compare-groups'
import { createClient } from '@/lib/supabase/server'
import type { EventStatus } from '@/lib/supabase/aliases'
import { toRatingStep, type RatingStep } from '@/lib/points'
import type { MyRating, WhiskyPosition } from '@/lib/rating-view'

export interface RatingViewData {
  event: {
    id: string
    event_date: string
    location: string
    status: EventStatus
    current_position: number
    rating_step: RatingStep
  }
  total: number
  whiskies: WhiskyPosition[]
  myRatings: MyRating[]
  /** PROJ-24: Whisky-Namen je ID — nur im abgeschlossenen Tasting, sonst leer. */
  whiskyNames: Record<string, string>
  /** PROJ-20: gesetzt, wenn ein Whisky-Steward mitliest (nur im laufenden Tasting). */
  steward: StewardNotice | null
  /** PROJ-23: eigene Vergleichs-Merker (nur im laufenden Tasting, sonst leer). */
  compareMarks: CompareMark[]
}

export interface StewardNotice {
  /** `null`, falls der Name nicht lesbar ist — dann „Der Whisky-Steward". */
  name: string | null
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
    .select('id, event_date, location, status, current_position, rating_step, helper_id')
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

  // Namen liefert die Ranglisten-Sicht ohnehin nur für abgeschlossene Tastings;
  // im laufenden Tasting wird gar nicht erst gefragt.
  const whiskyNames: Record<string, string> = {}
  if (event.status === 'closed') {
    const { data: ranked } = await supabase
      .from('whisky_rankings')
      .select('whisky_id, name')
      .eq('event_id', eventId)
    for (const r of ranked ?? []) {
      if (r.whisky_id && r.name) whiskyNames[r.whisky_id] = r.name
    }
  }

  // PROJ-20: Der Whisky-Steward sieht Punkte, Notizen und Tipps, solange der
  // Abend läuft — die Bewertungsansicht weist mit seinem Namen darauf hin.
  let steward: StewardNotice | null = null
  if (event.status === 'active' && event.helper_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', event.helper_id)
      .maybeSingle()
    steward = { name: profile?.display_name ?? null }
  }

  // PROJ-23: eigene Vergleichs-Merker — die Zugriffsregel liefert ohnehin nur
  // Eigenes und nur im laufenden Tasting.
  const compareMarks: CompareMark[] = []
  if (event.status === 'active') {
    const positionById = new Map((rows ?? []).map((r) => [r.id, r.position]))
    const { data: marks } = await supabase
      .from('compare_marks')
      .select('whisky_id, group_no')
      .eq('event_id', eventId)
      .eq('profile_id', userId)
    for (const m of marks ?? []) {
      const position = positionById.get(m.whisky_id)
      if (position !== undefined) compareMarks.push({ position, group: m.group_no })
    }
  }

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
      rating_step: toRatingStep(event.rating_step),
    },
    total: whiskies.length,
    whiskies,
    myRatings: (ratings ?? []).map((r) => ({
      whisky_id: r.whisky_id,
      nose_points: Number(r.nose_points),
      taste_points: Number(r.taste_points),
      notes: r.notes,
    })),
    whiskyNames,
    steward,
    compareMarks,
  }
}
