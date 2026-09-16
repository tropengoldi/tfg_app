import { createClient } from '@/lib/supabase/server'
import {
  formatAvgGiven,
  pickBestPlacement,
  type PersonalBalance,
  type RankingRowLike,
} from '@/lib/personal-balance'

/**
 * Die persönliche Bilanz (PROJ-10) aus vier RLS-abgesicherten Lesezugriffen:
 *   - eigene Teilnahmen  → Anzahl abgeschlossener Tastings
 *   - `whisky_rankings` (nur abgeschlossen), gefiltert auf `brought_by`
 *       → mitgebrachte Whiskys + beste Platzierung
 *   - eigene `ratings` → Ø der Gesamtpunkte in abgeschlossenen Tastings
 *   - ein `tasting_events`-Lookup (Datum + Status) für die betroffenen Events
 *
 * Wirft bei einem Lesefehler — die aufrufende Seite fängt das ab und zeigt
 * statt der Karte den „nicht verfügbar"-Hinweis.
 */
export interface OwnStammdaten {
  bio: string | null
  favoriteDram: string | null
  favoriteRegion: string | null
}

/**
 * Die drei Stammdaten-Felder für das EIGENE Profil (PROJ-14 hat den
 * Direktzugriff auf `profiles.bio` / `favorite_dram` / `favorite_region` für
 * fremde Zeilen entzogen; nur `profiles_public` führt sie noch). Für die
 * eigene ID liefert die Sicht immer den vollen Wert, unabhängig von den
 * eigenen Sichtbarkeits-Schaltern — die wirken nur nach außen.
 */
export async function getOwnStammdaten(userId: string): Promise<OwnStammdaten> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles_public')
    .select('bio, favorite_dram, favorite_region')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error

  return {
    bio: data?.bio ?? null,
    favoriteDram: data?.favorite_dram ?? null,
    favoriteRegion: data?.favorite_region ?? null,
  }
}

export async function getPersonalBalance(userId: string): Promise<PersonalBalance> {
  const supabase = await createClient()

  const [participations, rankings, ratings] = await Promise.all([
    supabase.from('event_participants').select('event_id').eq('profile_id', userId),
    supabase
      .from('whisky_rankings')
      .select('rank, rating_count, name, event_id')
      .eq('brought_by', userId),
    supabase.from('ratings').select('total_points, event_id').eq('profile_id', userId),
  ])
  if (participations.error) throw participations.error
  if (rankings.error) throw rankings.error
  if (ratings.error) throw ratings.error

  const rankingRows: RankingRowLike[] = (rankings.data ?? [])
    .filter((r): r is typeof r & { event_id: string } => Boolean(r.event_id))
    .map((r) => ({
      rank: r.rank ?? 0,
      ratingCount: r.rating_count ?? 0,
      whiskyName: r.name ?? 'Whisky',
      eventId: r.event_id,
    }))

  const eventIds = [
    ...new Set(
      [
        ...(participations.data ?? []).map((r) => r.event_id),
        ...rankingRows.map((r) => r.eventId),
        ...(ratings.data ?? []).map((r) => r.event_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  ]

  const closed = new Set<string>()
  const eventDateById = new Map<string, string>()
  if (eventIds.length > 0) {
    const { data: events, error } = await supabase
      .from('tasting_events')
      .select('id, event_date, status')
      .in('id', eventIds)
    if (error) throw error
    for (const e of events ?? []) {
      eventDateById.set(e.id, e.event_date)
      if (e.status === 'closed') closed.add(e.id)
    }
  }

  const tastingCount = (participations.data ?? []).filter(
    (r) => r.event_id && closed.has(r.event_id),
  ).length
  // whisky_rankings ist bereits auf abgeschlossene Events beschränkt.
  const whiskyCount = rankingRows.length
  const bestPlacement = pickBestPlacement(rankingRows, eventDateById)
  const totals = (ratings.data ?? [])
    .filter((r) => r.event_id && closed.has(r.event_id))
    .map((r) => r.total_points ?? 0)
  const avgPointsGiven = formatAvgGiven(totals)

  return {
    tastingCount,
    whiskyCount,
    bestPlacement,
    avgPointsGiven,
    isFresh: tastingCount === 0 && whiskyCount === 0 && totals.length === 0,
  }
}
