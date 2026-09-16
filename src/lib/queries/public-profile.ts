import { createClient } from '@/lib/supabase/server'
import {
  formatAvgGiven,
  pickBestPlacement,
  type BestPlacement,
  type RankingRowLike,
} from '@/lib/personal-balance'

/** Jedes Feld fehlt (`undefined`), wenn der Profilinhaber es verborgen hat —
 * ununterscheidbar davon, dass die Sektion nie gerendert wird. */
export interface PublicBalance {
  tastingCount?: number
  whiskyCount?: number
  bestPlacement?: BestPlacement | null
  avgPointsGiven?: { avg: string; count: number } | null
}

export interface PublicProfileData {
  id: string
  displayName: string
  /** Bereits maskiert durch die Sicht `profiles_public` — `null` sowohl bei
   * verborgen als auch bei nie ausgefüllt (gewollt ununterscheidbar). */
  favoriteDram: string | null
  favoriteRegion: string | null
  bio: string | null
  /** Ob mindestens eine Bilanz-Kennzahl sichtbar ist — steuert, ob die Karte
   * überhaupt versucht wird zu laden/anzuzeigen. */
  showAnyBalance: boolean
  /** `null`, wenn `showAnyBalance` falsch ist ODER das Laden fehlgeschlagen
   * ist (Seite bleibt nutzbar, Karte zeigt „nicht verfügbar"). */
  balance: PublicBalance | null
}

type VisibilityFlags = {
  show_tasting_count: boolean | null
  show_whisky_count: boolean | null
  show_best_placement: boolean | null
  show_avg_points: boolean | null
}

/**
 * Das read-only Profil eines anderen Mitglieds (PROJ-14).
 *
 * Die drei Stammdaten-Felder kommen bereits maskiert aus der Sicht
 * `profiles_public` (NULL, wenn der jeweilige Schalter aus ist). Die Bilanz
 * wird wie im eigenen Profil (`getPersonalBalance`) berechnet, aber aus den
 * seit PROJ-9 für jedes aktive Mitglied freigegebenen Archiv-Views
 * (`whisky_rankings`, `whisky_score_breakdown` statt roher `ratings`-Zeilen)
 * — es wird also kein neuer Zugriff auf private Rohdaten geöffnet. Danach
 * wird jede der vier Kennzahlen einzeln anhand der Schalter maskiert.
 *
 * Gibt `null` zurück, wenn die ID kein Profil ist → die Seite antwortet mit
 * „nicht gefunden".
 */
export async function getPublicProfile(targetId: string): Promise<PublicProfileData | null> {
  const supabase = await createClient()

  const { data: row, error: profileError } = await supabase
    .from('profiles_public')
    .select(
      'id, display_name, bio, favorite_dram, favorite_region, show_tasting_count, show_whisky_count, show_best_placement, show_avg_points',
    )
    .eq('id', targetId)
    .maybeSingle()
  if (profileError) throw profileError
  if (!row || !row.id || !row.display_name) return null

  const showAnyBalance =
    Boolean(row.show_tasting_count) ||
    Boolean(row.show_whisky_count) ||
    Boolean(row.show_best_placement) ||
    Boolean(row.show_avg_points)

  let balance: PublicBalance | null = null
  if (showAnyBalance) {
    try {
      balance = await computeMaskedBalance(targetId, row)
    } catch {
      balance = null
    }
  }

  return {
    id: row.id,
    displayName: row.display_name,
    favoriteDram: row.favorite_dram,
    favoriteRegion: row.favorite_region,
    bio: row.bio,
    showAnyBalance,
    balance,
  }
}

async function computeMaskedBalance(
  targetId: string,
  flags: VisibilityFlags,
): Promise<PublicBalance> {
  const supabase = await createClient()

  const [participations, rankings, breakdown] = await Promise.all([
    supabase.from('event_participants').select('event_id').eq('profile_id', targetId),
    supabase
      .from('whisky_rankings')
      .select('rank, rating_count, name, event_id')
      .eq('brought_by', targetId),
    supabase.from('whisky_score_breakdown').select('total_points').eq('rater_id', targetId),
  ])
  if (participations.error) throw participations.error
  if (rankings.error) throw rankings.error
  if (breakdown.error) throw breakdown.error

  const rankingRows: RankingRowLike[] = (rankings.data ?? [])
    .filter((r): r is typeof r & { event_id: string } => Boolean(r.event_id))
    .map((r) => ({
      rank: r.rank ?? 0,
      ratingCount: r.rating_count ?? 0,
      whiskyName: r.name ?? 'Whisky',
      eventId: r.event_id,
    }))

  const participationEventIds = [
    ...new Set(
      (participations.data ?? [])
        .map((r) => r.event_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const closed = new Set<string>()
  const eventDateById = new Map<string, string>()
  // Datum + Abschluss-Status über `past_tastings` statt der Basistabelle:
  // Ein Betrachter, der selbst nicht Teilnehmer war, hat auf `tasting_events`
  // per RLS keinen Zeilenzugriff (`events_select_participant_or_admin` kennt
  // keine „geschlossen + aktives Mitglied"-Ausnahme, anders als
  // `event_participants` seit PROJ-9). `past_tastings` ist genau dafür da:
  // jede Zeile darin ist per Definition abgeschlossen und für jedes aktive
  // Mitglied lesbar — ein Treffer bedeutet also automatisch „geschlossen".
  if (participationEventIds.length > 0) {
    const { data: events, error } = await supabase
      .from('past_tastings')
      .select('event_id, event_date')
      .in('event_id', participationEventIds)
    if (error) throw error
    for (const e of events ?? []) {
      if (!e.event_id || !e.event_date) continue
      eventDateById.set(e.event_id, e.event_date)
      closed.add(e.event_id)
    }
  }

  // Datum für Ranking-Events nachschlagen, die nicht schon über die
  // Teilnahme-Abfrage abgedeckt sind (z. B. Bringer war selbst kein
  // eingetragener Teilnehmer mehr, Whisky aber noch zugeordnet).
  const missingDates = [
    ...new Set(rankingRows.map((r) => r.eventId).filter((id) => !eventDateById.has(id))),
  ]
  if (missingDates.length > 0) {
    const { data: moreEvents, error } = await supabase
      .from('past_tastings')
      .select('event_id, event_date')
      .in('event_id', missingDates)
    if (error) throw error
    for (const e of moreEvents ?? []) {
      if (e.event_id && e.event_date) eventDateById.set(e.event_id, e.event_date)
    }
  }

  const balance: PublicBalance = {}
  if (flags.show_tasting_count) {
    balance.tastingCount = (participations.data ?? []).filter(
      (r) => r.event_id && closed.has(r.event_id),
    ).length
  }
  if (flags.show_whisky_count) {
    balance.whiskyCount = rankingRows.length
  }
  if (flags.show_best_placement) {
    balance.bestPlacement = pickBestPlacement(rankingRows, eventDateById)
  }
  if (flags.show_avg_points) {
    const totals = (breakdown.data ?? []).map((r) => r.total_points ?? 0)
    balance.avgPointsGiven = formatAvgGiven(totals)
  }
  return balance
}
