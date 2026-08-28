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

/** Darf dieser Nutzer den Gastgeber-Bereich eines Events sehen? */
export function canAccessHostArea(
  userId: string | null | undefined,
  profile: Pick<Profile, 'role' | 'is_active'> | null | undefined,
  event: { host_id: string } | null | undefined,
): boolean {
  return isEventHost(userId, event) || isAdmin(profile)
}
