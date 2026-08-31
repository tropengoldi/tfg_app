import { NextResponse, type NextRequest } from 'next/server'

import { safeInternalPath } from '@/lib/safe-redirect'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Die „Wache": läuft vor jeder Anfrage.
 *  1. Session auffrischen (über den PROJ-1-Helfer — gibt das Cookie-tragende
 *     Antwortobjekt zurück).
 *  2. Unangemeldete auf /login schicken und den Zielpfad merken.
 *  3. Angemeldete von /login und /passwort-vergessen weg zur Startseite.
 *
 * KEINE Rollenprüfung — das machen die Layout-Guards (requireAdmin/requireHost).
 */

// Ohne Anmeldung erreichbar:
const PUBLIC_PATHS = new Set(['/login', '/passwort-vergessen', '/passwort-setzen'])
// Von angemeldeten Nutzern nicht mehr sinnvoll (passwort-setzen bleibt erlaubt):
const AUTHED_AWAY_FROM = new Set(['/login', '/passwort-vergessen'])

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith('/auth/')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('redirect', safeInternalPath(pathname + search))
    return NextResponse.redirect(url)
  }

  if (user && AUTHED_AWAY_FROM.has(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Alles außer:
     *  - _next/static, _next/image
     *  - favicon.ico
     *  - Bilddateien
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
