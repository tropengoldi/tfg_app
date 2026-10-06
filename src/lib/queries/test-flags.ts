import { createClient } from '@/lib/supabase/server'

/**
 * Welche dieser Tastings sind Test-Tastings? (PROJ-26)
 *
 * `tasting_events` hat bewusst keine gespeicherte Kennzeichnung — sie wird aus den
 * Beteiligten berechnet (`is_test_event`). Normale Mitglieder bekommen
 * Test-Tastings gar nicht erst zu sehen; für sie wird deshalb nichts abgefragt.
 * Nur für Admin und Testkonten (wenige Tastings) eine Prüfung je Tasting.
 */
export async function testEventIds(eventIds: string[]): Promise<Set<string>> {
  const ids = [...new Set(eventIds.filter(Boolean))]
  if (ids.length === 0) return new Set()

  const supabase = await createClient()
  const { data: seesTests } = await supabase.rpc('viewer_sees_tests')
  if (!seesTests) return new Set()

  const flags = await Promise.all(
    ids.map(async (id) => {
      const { data } = await supabase.rpc('is_test_event', { p_event: id })
      return [id, Boolean(data)] as const
    }),
  )
  return new Set(flags.filter(([, isTest]) => isTest).map(([id]) => id))
}
