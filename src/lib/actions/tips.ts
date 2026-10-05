'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { winnerTipSchema } from '@/lib/schemas/tips'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Sieger-Tipp setzen oder ändern (PROJ-22). Alle Regeln (Tasting läuft,
 * Aufrufer verkostet mit, Nummer existiert) prüft die DB-Funktion
 * `set_winner_tip` → TS023 mit deutscher Meldung.
 */
export async function setWinnerTipAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = winnerTipSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('set_winner_tip', {
    p_event: parsed.data.eventId,
    p_position: parsed.data.position,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(`/tastings/${parsed.data.eventId}/bewerten`)
  revalidatePath('/')
  return { ok: true }
}
