import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from './types'

/**
 * Verwaltungs-Client mit dem Service-Role-Key. Umgeht RLS vollständig.
 *
 * NUR serverseitig. Einzige vorgesehene Verwendung ist die Admin-Route zum
 * Einladen und Deaktivieren von Teilnehmern (PROJ-3). Vor jedem Aufruf muss der
 * aufrufende Code selbst `is_admin()` gegen den nutzergebundenen Client prüfen.
 *
 * In PROJ-1 wird dieser Client noch nirgends benutzt.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
