/**
 * Reine Zugriffs-Prädikate — kein Next-/Supabase-Import, damit sie sich isoliert
 * per Unit-Test prüfen lassen. `src/lib/auth.ts` komponiert daraus die
 * serverseitigen Guards.
 */
import type { Profile } from '@/lib/supabase/aliases'

export function isActiveMember(
  profile: Pick<Profile, 'is_active'> | null | undefined,
): boolean {
  return !!profile && profile.is_active === true
}

export function isAdmin(
  profile: Pick<Profile, 'role' | 'is_active'> | null | undefined,
): boolean {
  return !!profile && profile.is_active === true && profile.role === 'admin'
}

export function isEventHost(
  userId: string | null | undefined,
  event: { host_id: string } | null | undefined,
): boolean {
  return !!userId && !!event && event.host_id === userId
}

/** Ist dieser Nutzer der (optionale) Helfer dieses Events? (PROJ-11) */
export function isEventHelper(
  userId: string | null | undefined,
  event: { helper_id?: string | null } | null | undefined,
): boolean {
  return !!userId && !!event && !!event.helper_id && event.helper_id === userId
}

/**
 * Darf dieser Nutzer den Gastgeber-/Steuerungs-Bereich eines Events sehen?
 * Mit Helfer (PROJ-11): der Helfer steuert, der Gastgeber ist dann nur
 * Teilnehmer. Admin darf immer.
 */
export function canAccessHostArea(
  userId: string | null | undefined,
  profile: Pick<Profile, 'role' | 'is_active'> | null | undefined,
  event: { host_id: string; helper_id?: string | null } | null | undefined,
): boolean {
  if (!event) return false
  if (isAdmin(profile)) return true
  if (event.helper_id) return isEventHelper(userId, event)
  return isEventHost(userId, event)
}
