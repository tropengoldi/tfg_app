'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { profileFormSchema } from '@/lib/schemas/profile'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Speichert die eigenen Stammdaten (PROJ-10). Läuft als spaltengenaue
 * Direktänderung an `profiles` — die RLS-Regel `profiles_update_own` lässt nur
 * die eigene Zeile zu, der Spalten-GRANT nur diese vier Felder (role /
 * is_active bleiben außen vor). Leere optionale Felder werden zu NULL.
 */
export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = profileFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const d = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: d.displayName,
      favorite_dram: d.favoriteDram === '' ? null : d.favoriteDram,
      favorite_region: d.favoriteRegion === '' ? null : d.favoriteRegion,
      bio: d.bio === '' ? null : d.bio,
    })
    .eq('id', session.userId)
    .select('id')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return { error: 'Das Speichern war nicht möglich. Bitte melde dich neu an.' }
  }

  revalidatePath('/profil')
  return { ok: true }
}
