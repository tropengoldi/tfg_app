import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './types'

/**
 * Supabase-Client für das Browser (Client Components).
 * Read-only + Realtime — jede Mutation läuft über eine Server Action / RPC.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
