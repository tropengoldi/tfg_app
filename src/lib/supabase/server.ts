import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from './types'

/**
 * Nutzergebundener Supabase-Client für Server Components, Server Actions und
 * Route Handlers. Trägt die Session des angemeldeten Nutzers → RLS greift.
 *
 * Immer `supabase.auth.getUser()` verwenden, nie `getSession()`.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Aufruf aus einer Server Component: Cookies lassen sich hier nicht
            // setzen. Die Middleware (PROJ-2) frischt die Session ohnehin auf.
          }
        },
      },
    },
  )
}
