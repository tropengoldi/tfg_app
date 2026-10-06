import { createClient } from '@/lib/supabase/server'
import type { RevealedTip } from '@/lib/winner-tips'

/**
 * Ausschank-Nummer des eigenen Sieger-Tipps (PROJ-22) oder `null`.
 * RLS liefert aus `winner_tips` ausschließlich die eigene Zeile; die Nummer
 * kommt über die Whisky-Position, die jeder Teilnehmer lesen darf.
 */
export async function getOwnTipPosition(
  eventId: string,
  userId: string,
): Promise<number | null> {
  const supabase = await createClient()
  const { data: tip } = await supabase
    .from('winner_tips')
    .select('whisky_id')
    .eq('event_id', eventId)
    .eq('profile_id', userId)
    .maybeSingle()
  if (!tip) return null

  const { data: whisky } = await supabase
    .from('whiskies')
    .select('position')
    .eq('id', tip.whisky_id)
    .maybeSingle()
  return whisky?.position ?? null
}

/** Alle aufgedeckten Tipps eines abgeschlossenen Tastings (leer, solange es läuft). */
export async function getRevealedTips(eventId: string): Promise<RevealedTip[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('winner_tips_revealed')
    .select('profile_id, display_name, position, whisky_name, rank, is_correct')
    .eq('event_id', eventId)
  if (error) throw error

  return (data ?? [])
    .filter((r): r is typeof r & { profile_id: string } => Boolean(r.profile_id))
    .map((r) => ({
      profileId: r.profile_id,
      name: r.display_name ?? 'Unbekannt',
      position: r.position ?? 0,
      whiskyName: r.whisky_name ?? `Whisky ${r.position ?? '?'}`,
      rank: r.rank ?? 0,
      isCorrect: Boolean(r.is_correct),
    }))
}

/**
 * Wie oft die Person „Kenner der Woche" war (richtige Tipps in abgeschlossenen
 * Tastings). PROJ-26: Für ein echtes Konto zählen Test-Tastings nicht mit.
 */
export async function getKennerCount(profileId: string, ownerIsTest = false): Promise<number> {
  const supabase = await createClient()
  let query = supabase
    .from('winner_tips_revealed')
    .select('event_id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('is_correct', true)
  if (!ownerIsTest) query = query.eq('is_test', false)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}
