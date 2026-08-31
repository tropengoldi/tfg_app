import { createClient } from '@/lib/supabase/server'
import { resultsPhase } from '@/lib/results'

// ===========================================================================
// Historien-Liste  (/tastings → Abschnitt „Vergangene Tastings")
// ===========================================================================

export interface PastTastingRow {
  id: string
  event_date: string
  location: string
  host_name: string
  /** `null`, wenn kein Whisky bewertet wurde → „— kein Sieger". */
  winner_name: string | null
}

/**
 * Alle abgeschlossenen Tastings der Runde, neuester Abend zuerst; bei gleichem
 * Datum nach Abschlusszeitpunkt. Liest die PROJ-1-View `past_tastings`, deren
 * Sichtbarkeit in der PROJ-9-Migration auf „jedes aktive Mitglied" geweitet wird.
 */
export async function getPastTastings(): Promise<PastTastingRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('past_tastings')
    .select('event_id, event_date, location, host_name, winner_name, winner_points, closed_at')
    .order('event_date', { ascending: false })
  if (error) throw error

  return (data ?? [])
    .filter((r): r is typeof r & { event_id: string; event_date: string } =>
      Boolean(r.event_id) && Boolean(r.event_date),
    )
    .sort(
      (a, b) =>
        b.event_date.localeCompare(a.event_date) ||
        (b.closed_at ?? '').localeCompare(a.closed_at ?? ''),
    )
    .map((r) => ({
      id: r.event_id,
      event_date: r.event_date,
      location: r.location ?? '',
      host_name: r.host_name ?? 'Unbekannt',
      // `winner_name` steht in der View auch dann, wenn niemand bewertet hat
      // (Rang 1 mit 0 Punkten). Ohne Punkte kein Sieger.
      winner_name: r.winner_points && r.winner_points > 0 ? r.winner_name : null,
    }))
}

// ===========================================================================
// Ergebnisseite  (/tastings/[eventId]/ergebnisse)
// ===========================================================================

export interface ResultsParticipant {
  id: string
  name: string
  isHost: boolean
}

export interface BreakdownEntry {
  raterName: string
  nose: number
  taste: number
  total: number
}

export interface RankingRow {
  whiskyId: string
  rank: number
  position: number
  name: string
  distillery: string | null
  region: string | null
  /** Aufgelöster Anzeigename des Bringers. */
  broughtBy: string
  videoUrl: string | null
  noseTotal: number
  tasteTotal: number
  totalPoints: number
  ratingCount: number
  /** Einzelbewertungen, bereits sortiert (Gesamt ↓, Name ↑). */
  breakdown: BreakdownEntry[]
  /** Die eigene Notiz zu diesem Whisky, falls vorhanden. Nie eine fremde. */
  ownNote: string | null
}

export interface EventResults {
  phase: 'closed'
  head: {
    event_date: string
    location: string
    theme: string | null
    host_name: string
    /** Anzeigename des neutralen Helfers (PROJ-11), oder null. */
    helper_name: string | null
  }
  participants: ResultsParticipant[]
  ranking: RankingRow[]
  hasAnyRatings: boolean
}

export type ResultsData = EventResults | { phase: 'pending' } | null

/**
 * Die Ergebnisdaten eines Events:
 *   - `null`               → Event unbekannt → die Seite antwortet „nicht gefunden"
 *   - `{ phase: 'pending' }`→ Event läuft noch / in Vorbereitung → Hinweis, keine Daten
 *   - `EventResults`        → abgeschlossen: Kopf, Teilnehmer, Rangliste
 *
 * Rangliste + Aufschlüsselung stammen aus den PROJ-1/PROJ-9-Views, die keine
 * fremden Notizen führen; die eigene Notiz kommt aus einem auf die eigene Person
 * gefilterten Direktzugriff auf `ratings` (wie in PROJ-7).
 */
export async function getEventResults(
  eventId: string,
  userId: string,
): Promise<ResultsData> {
  const supabase = await createClient()

  const { data: status } = await supabase.rpc('event_status_of', { p_event: eventId })
  const phase = resultsPhase((status as 'draft' | 'active' | 'closed' | null) ?? null)
  if (phase === 'missing') return null
  if (phase === 'pending') return { phase: 'pending' }

  const [headRes, partRes, rankRes, breakdownRes, ownRes] = await Promise.all([
    supabase
      .from('past_tastings')
      .select('event_date, location, theme, host_name, host_id, helper_id')
      .eq('event_id', eventId)
      .maybeSingle(),
    supabase.from('event_participants').select('profile_id').eq('event_id', eventId),
    supabase
      .from('whisky_rankings')
      .select(
        'whisky_id, position, rank, name, distillery, region, brought_by, video_url, nose_total, taste_total, total_points, rating_count',
      )
      .eq('event_id', eventId)
      .order('rank', { ascending: true }),
    supabase
      .from('whisky_score_breakdown')
      .select('whisky_id, rater_name, nose_points, taste_points, total_points')
      .eq('event_id', eventId),
    supabase
      .from('ratings')
      .select('whisky_id, notes')
      .eq('event_id', eventId)
      .eq('profile_id', userId),
  ])

  const head = headRes.data
  if (!head || !head.event_date) return null

  // Namen für Bringer + Teilnehmer in einem Rutsch auflösen.
  const participantIds = (partRes.data ?? []).map((p) => p.profile_id)
  const broughtByIds = (rankRes.data ?? [])
    .map((r) => r.brought_by)
    .filter((id): id is string => Boolean(id))
  const helperId = (head.helper_id as string | null) ?? null
  const needNames = [
    ...new Set([
      ...participantIds,
      ...broughtByIds,
      ...(helperId ? [helperId] : []),
    ]),
  ]
  const names = new Map<string, string>()
  if (needNames.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', needNames)
    for (const p of profs ?? []) names.set(p.id, p.display_name)
  }

  const participants: ResultsParticipant[] = participantIds
    .map((id) => ({
      id,
      name: names.get(id) ?? 'Unbekannt',
      isHost: id === head.host_id,
    }))
    .sort((a, b) => Number(b.isHost) - Number(a.isHost) || a.name.localeCompare(b.name, 'de'))

  // Einzelbewertungen je Whisky bündeln.
  const byWhisky = new Map<string, BreakdownEntry[]>()
  for (const b of breakdownRes.data ?? []) {
    if (!b.whisky_id) continue
    const list = byWhisky.get(b.whisky_id) ?? []
    list.push({
      raterName: b.rater_name ?? 'Unbekannt',
      nose: b.nose_points ?? 0,
      taste: b.taste_points ?? 0,
      total: b.total_points ?? 0,
    })
    byWhisky.set(b.whisky_id, list)
  }

  const ownNotes = new Map<string, string>()
  for (const r of ownRes.data ?? []) {
    if (r.whisky_id && r.notes && r.notes.trim().length > 0) {
      ownNotes.set(r.whisky_id, r.notes)
    }
  }

  const ranking: RankingRow[] = (rankRes.data ?? [])
    .filter((r): r is typeof r & { whisky_id: string } => Boolean(r.whisky_id))
    .map((r) => ({
      whiskyId: r.whisky_id,
      rank: r.rank ?? 0,
      position: r.position ?? 0,
      name: r.name ?? `Whisky ${r.position ?? '?'}`,
      distillery: r.distillery,
      region: r.region,
      broughtBy: r.brought_by ? names.get(r.brought_by) ?? 'Unbekannt' : 'Unbekannt',
      videoUrl: r.video_url,
      noseTotal: r.nose_total ?? 0,
      tasteTotal: r.taste_total ?? 0,
      totalPoints: r.total_points ?? 0,
      ratingCount: r.rating_count ?? 0,
      breakdown: byWhisky.get(r.whisky_id) ?? [],
      ownNote: ownNotes.get(r.whisky_id) ?? null,
    }))

  return {
    phase: 'closed',
    head: {
      event_date: head.event_date,
      location: head.location ?? '',
      theme: head.theme,
      host_name: head.host_name ?? 'Unbekannt',
      helper_name: helperId ? names.get(helperId) ?? 'Unbekannt' : null,
    },
    participants,
    ranking,
    hasAnyRatings: ranking.some((r) => r.ratingCount > 0),
  }
}
