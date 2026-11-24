import { createClient } from '@/lib/supabase/server'
import {
  summarizeStewardScores,
  type RevealedStewardScore,
  type StewardBalance,
} from '@/lib/steward-scores'
import { countsForBalance } from '@/lib/test-accounts'

/** Eigene Steward-Note (PROJ-29) oder `null`. RLS liefert nur die eigene Zeile. */
export async function getOwnStewardScore(
  eventId: string,
  userId: string,
): Promise<{ score: number; comment: string | null } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('steward_scores')
    .select('score, comment')
    .eq('event_id', eventId)
    .eq('profile_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { score: Number(data.score), comment: data.comment }
}

/** Alle aufgedeckten Steward-Noten eines abgeschlossenen Tastings (leer, solange es läuft). */
export async function getRevealedStewardScores(eventId: string): Promise<RevealedStewardScore[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('steward_scores_revealed')
    .select('profile_id, display_name, score, comment')
    .eq('event_id', eventId)
    .limit(50)
  if (error) throw error
  return (data ?? [])
    .filter((r): r is typeof r & { profile_id: string } => Boolean(r.profile_id))
    .map((r) => ({
      profileId: r.profile_id,
      name: r.display_name ?? 'Unbekannt',
      score: Number(r.score ?? 0),
      comment: r.comment,
    }))
}

/**
 * Bilanz „Als Whisky-Steward" (PROJ-29): abgeschlossene Steward-Abende aus
 * `past_tastings`, Ø aller erhaltenen Noten aus `steward_scores_revealed`.
 * PROJ-26: Für ein echtes Konto zählen Test-Tastings nicht mit.
 * `null` = nie Steward eines abgeschlossenen Tastings.
 */
export async function getStewardBalance(
  profileId: string,
  ownerIsTest = false,
): Promise<StewardBalance | null> {
  const supabase = await createClient()
  const [evenings, scores] = await Promise.all([
    supabase.from('past_tastings').select('event_id, is_test').eq('helper_id', profileId).limit(1000),
    supabase
      .from('steward_scores_revealed')
      .select('score, is_test')
      .eq('steward_id', profileId)
      .limit(5000),
  ])
  if (evenings.error) throw evenings.error
  if (scores.error) throw scores.error

  const eveningCount = (evenings.data ?? []).filter((e) => countsForBalance(e.is_test, ownerIsTest)).length
  if (eveningCount === 0) return null

  const summary = summarizeStewardScores(
    (scores.data ?? [])
      .filter((s) => countsForBalance(s.is_test, ownerIsTest))
      .map((s) => ({ score: Number(s.score ?? 0) })),
  )
  return { evenings: eveningCount, average: summary.average, count: summary.count }
}
