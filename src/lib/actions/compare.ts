'use server'

import { getSessionContext } from '@/lib/auth'
import type { CompareMark } from '@/lib/compare-groups'
import { messageForDbError } from '@/lib/errors'
import { compareMarkSchema } from '@/lib/schemas/compare'
import { createClient } from '@/lib/supabase/server'

export type CompareResult = { error: string } | { ok: true; marks: CompareMark[] }

/**
 * Vergleichs-Merker umschalten (PROJ-23). Alle Regeln (Tasting läuft, Aufrufer
 * verkostet mit, beide Whiskies ausgeschenkt) prüft `toggle_compare_mark` → TS026.
 * Liefert den neuen Stand aller eigenen Merker. Bewusst kein revalidatePath und
 * kein Live-Signal: Merker sind privat und ändern sonst nichts auf der Seite.
 */
export async function toggleCompareMarkAction(input: unknown): Promise<CompareResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = compareMarkSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('toggle_compare_mark', {
    p_event: parsed.data.eventId,
    p_from: parsed.data.from,
    p_to: parsed.data.to,
  })
  if (error) return { error: messageForDbError(error) }

  return {
    ok: true,
    marks: (data ?? []).map((r) => ({ position: r.whisky_position, group: r.group_no })),
  }
}
