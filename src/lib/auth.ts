import { notFound, redirect } from 'next/navigation'

import { canAccessHostArea, isActiveMember, isAdmin } from '@/lib/auth-rules'
import { createClient } from '@/lib/supabase/server'
import type { AppRole, Profile } from '@/lib/supabase/aliases'

export {
  canAccessHostArea,
  isActiveMember,
  isAdmin,
  isEventHost,
} from '@/lib/auth-rules'
export type { AppRole }

export interface SessionContext {
  userId: string
  email: string | null
  profile: Profile
}

/** Liest den angemeldeten Nutzer samt Profil, oder null. Kein Redirect. */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) return null

  return { userId: user.id, email: user.email ?? null, profile }
}

/**
 * Verlangt einen angemeldeten, aktiven Nutzer. Unangemeldete → /login.
 * Deaktivierte (oder ohne Profil) → Abmelde-Route mit Hinweis.
 */
export async function requireUser(): Promise<SessionContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!isActiveMember(profile)) {
    redirect('/auth/abmelden?reason=deactivated')
  }

  return { userId: user.id, email: user.email ?? null, profile: profile as Profile }
}

/** Wie requireUser, aber zusätzlich Rolle „admin". Sonst „nicht gefunden". */
export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireUser()
  if (!isAdmin(session.profile)) notFound()
  return session
}

/**
 * Wie requireUser, aber der Nutzer muss Gastgeber dieses Events (oder Admin)
 * sein. Sonst „nicht gefunden".
 *
 * Die zugehörige Route entsteht erst in PROJ-6; die Entscheidungslogik
 * (`canAccessHostArea`) ist bereits per Unit-Test abgesichert.
 */
export async function requireHost(eventId: string): Promise<SessionContext> {
  const session = await requireUser()
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('tasting_events')
    .select('id, host_id')
    .eq('id', eventId)
    .maybeSingle()

  if (!canAccessHostArea(session.userId, session.profile, event)) notFound()
  return session
}
