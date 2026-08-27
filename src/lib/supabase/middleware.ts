import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from './types'

/**
 * Session-Auffrischung für die Next.js-Middleware.
 *
 * PROJ-1 liefert nur diesen Helfer. Die eigentliche `src/middleware.ts` mit
 * Redirect-Logik auf /login entsteht in PROJ-2.
 *
 * Wichtig: Es muss DASSELBE `NextResponse`-Objekt zurückgegeben werden, auf das
 * der Client seine Cookies geschrieben hat — sonst geht die aufgefrischte Session
 * verloren.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Frischt das Access-Token auf, falls nötig. NICHT `getSession()` verwenden.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
