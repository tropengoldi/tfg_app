import { createClient } from '@/lib/supabase/server'

export interface CommunityMember {
  id: string
  name: string
}

/**
 * Alle aktiven Mitglieder der Runde, alphabetisch nach Anzeigename (PROJ-14).
 * Nutzt denselben breiten Lesezugriff, der Teilnehmerlisten und Ranglisten
 * schon heute mit Namen versorgt (`profiles_select_all`) — keine neue
 * Berechtigung nötig.
 */
export async function getActiveMembers(): Promise<CommunityMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('is_active', true)
    .order('display_name', { ascending: true })
  if (error) throw error

  return (data ?? []).map((p) => ({ id: p.id, name: p.display_name }))
}
