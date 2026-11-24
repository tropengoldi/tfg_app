'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { stewardScoreEventSchema, stewardScoreSchema } from '@/lib/schemas/steward-scores'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Steward-Note setzen oder ändern (PROJ-29). Alle Regeln (Tasting läuft, hat
 * einen Steward, Aufrufer verkostet mit und ist nicht der Steward, Schrittweite)
 * prüft die DB-Funktion `set_steward_score` → TS028 mit deutscher Meldung.
 */
export async function setStewardScoreAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = stewardScoreSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('set_steward_score', {
    p_event: parsed.data.eventId,
    p_score: parsed.data.score,
    p_comment: parsed.data.comment || undefined,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(`/tastings/${parsed.data.eventId}/bewerten`)
  return { ok: true }
}

/** Eigene Steward-Note zurückziehen (PROJ-29) — nur solange das Tasting läuft. */
export async function clearStewardScoreAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = stewardScoreEventSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('clear_steward_score', { p_event: parsed.data.eventId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(`/tastings/${parsed.data.eventId}/bewerten`)
  return { ok: true }
}
