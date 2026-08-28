import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Beendet die Session und leitet auf /login. Wird u. a. von `requireUser`
 * angesteuert, wenn ein deaktiviertes Konto eine geschützte Seite öffnet
 * (`?reason=deactivated`).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const reason = new URL(request.url).searchParams.get('reason')
  const target = new URL('/login', request.url)
  if (reason === 'deactivated') target.searchParams.set('reason', 'deactivated')
  else target.searchParams.set('reason', 'signed-out')

  return NextResponse.redirect(target)
}
