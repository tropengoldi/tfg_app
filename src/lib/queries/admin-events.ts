import { createClient } from '@/lib/supabase/server'
import type { EventStatus, TastingEvent } from '@/lib/supabase/aliases'

export interface EventListRow {
  id: string
  event_date: string
  location: string
  theme: string | null
  host_id: string
  host_name: string
  helper_id: string | null
  helper_name: string | null
  status: EventStatus
  max_whiskies_per_participant: number | null
  participant_count: number
  whisky_count: number
}

/** Alle Events für den Admin (RPC prüft die Admin-Rolle). Wirft bei Fehler. */
export async function getEvents(): Promise<EventListRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_list_events')
  if (error) throw error
  return (data ?? []) as EventListRow[]
}

export interface EventForEdit {
  event: TastingEvent
  participantIds: string[]
}

/** Ein Event samt Teilnehmer-IDs zum Bearbeiten, oder null. */
export async function getEventForEdit(id: string): Promise<EventForEdit | null> {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('tasting_events')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!event) return null

  const { data: parts } = await supabase
    .from('event_participants')
    .select('profile_id')
    .eq('event_id', id)

  return {
    event: event as TastingEvent,
    participantIds: (parts ?? []).map((p) => p.profile_id),
  }
}
