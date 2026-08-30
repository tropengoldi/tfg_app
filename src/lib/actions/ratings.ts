'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { ratingFormSchema } from '@/lib/schemas/rating'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Legt eine Bewertung an oder ändert sie (ein Upsert auf `ratings`). Alle Regeln
 * kommen aus PROJ-1: RLS `can_rate_whisky` (eigener Name · ausgeschenkter Whisky ·
 * laufendes Event · Teilnehmer), der Trigger `ratings_lock` sperrt nach dem
 * Event-Abschluss (`TS001`), `total_points` rechnet die DB.
 */
export async function saveRatingAction(
  eventId: string,
  whiskyId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = ratingFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('ratings').upsert(
    {
      whisky_id: whiskyId,
      event_id: eventId,
      profile_id: session.userId,
      nose_points: parsed.data.nose,
      taste_points: parsed.data.taste,
      notes: parsed.data.notes === '' ? null : parsed.data.notes,
    },
    { onConflict: 'whisky_id,profile_id' },
  )
  if (error) return { error: messageForDbError(error) }

  revalidatePath(`/tastings/${eventId}/bewerten`)
  return { ok: true }
}
