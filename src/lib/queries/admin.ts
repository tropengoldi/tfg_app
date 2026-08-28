import { createClient } from '@/lib/supabase/server'
import type { AppRole } from '@/lib/supabase/aliases'

export interface MemberRow {
  id: string
  display_name: string
  role: AppRole
  is_active: boolean
  email: string
  has_signed_in: boolean
}

/**
 * Alle Teilnehmer inkl. E-Mail und Anmeldestatus. Läuft über die RPC
 * `admin_list_members`, die die Admin-Rolle selbst prüft. Wirft bei Fehler.
 */
export async function getMembers(): Promise<MemberRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_list_members')
  if (error) throw error
  return (data ?? []) as MemberRow[]
}
