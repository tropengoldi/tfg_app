import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

import { safeInternalPath } from '@/lib/safe-redirect'
import { createClient } from '@/lib/supabase/server'

/**
 * Landepunkt für Einladungs- und Passwort-Zurücksetzen-Links aus der E-Mail.
 * Tauscht den Einmal-Token gegen eine Session und leitet dann weiter
 * (in der Regel auf /passwort-setzen).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeInternalPath(searchParams.get('next'), '/passwort-setzen')

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/passwort-setzen?fehler=link', request.url))
}
