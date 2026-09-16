'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { updateVisibilitySchema, type VisibilityField } from '@/lib/schemas/profile-visibility'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Speichert einen einzelnen Sichtbarkeits-Schalter sofort (PROJ-14) — kein
 * Sammel-Formular. Gleiches Muster wie `updateProfileAction` (PROJ-10):
 * spaltengenaue Direktänderung an der eigenen Profilzeile.
 */
export async function updateVisibilityAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = updateVisibilitySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const { field, value } = parsed.data

  const patch: Partial<Record<VisibilityField, boolean>> = { [field]: value }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', session.userId)
    .select('id')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return { error: 'Das Speichern war nicht möglich. Bitte melde dich neu an.' }
  }

  revalidatePath('/profil')
  revalidatePath(`/profil/${session.userId}`)
  return { ok: true }
}
