import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Beendet die Session und leitet auf /login.
 *  - GET:  Ziel von `requireUser`, wenn ein deaktiviertes Konto eine geschützte
 *          Seite öffnet (`?reason=deactivated`).
 *  - POST: der „Abmelden"-Button (einfaches HTML-Formular, kein Server Action —
 *          das vermeidet die „unexpected response"-Fälle progressiver Formulare).
 */
async function signOutAndRedirect(request: NextRequest, reasonParam?: string | null) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const target = new URL('/login', request.url)
  target.searchParams.set('reason', reasonParam === 'deactivated' ? 'deactivated' : 'signed-out')
  return NextResponse.redirect(target, { status: 303 })
}

export async function GET(request: NextRequest) {
  return signOutAndRedirect(request, new URL(request.url).searchParams.get('reason'))
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request, new URL(request.url).searchParams.get('reason'))
}
