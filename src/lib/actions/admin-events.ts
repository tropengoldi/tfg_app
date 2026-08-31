'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getSessionContext } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-rules'
import { todayISO } from '@/lib/dates'
import { messageForDbError } from '@/lib/errors'
import { eventFormSchema } from '@/lib/schemas/admin-events'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

const EVENTS_PATH = '/admin/events'

async function requireAdminOr(): Promise<ActionResult | null> {
  const session = await getSessionContext()
  if (!isAdmin(session?.profile)) {
    return { error: 'Dazu fehlt dir die Berechtigung.' }
  }
  return null
}

interface EventPayload {
  p_event_date: string
  p_location: string
  p_host_id: string
  p_helper_id: string | null
  p_theme: string | undefined
  p_max_whiskies: number | undefined
  participantIds: string[]
}

type Normalized = { ok: true; data: EventPayload } | { ok: false; error: string }

function normalize(input: unknown): Normalized {
  const parsed = eventFormSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const d = parsed.data
  if (d.eventDate < todayISO()) {
    return { ok: false, error: 'Das Datum darf nicht in der Vergangenheit liegen.' }
  }
  const maxWhiskies = d.maxWhiskies === '' ? undefined : Number(d.maxWhiskies)
  const theme = d.theme.trim() !== '' ? d.theme.trim() : undefined
  return {
    ok: true,
    data: {
      p_event_date: d.eventDate,
      p_location: d.location,
      p_host_id: d.hostId,
      p_helper_id: d.helperId === '' ? null : d.helperId,
      p_theme: theme,
      p_max_whiskies: maxWhiskies,
      participantIds: d.participantIds,
    },
  }
}

export async function createEventAction(input: unknown): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { data: eventId, error } = await supabase.rpc('create_event', {
    p_event_date: n.data.p_event_date,
    p_location: n.data.p_location,
    p_host_id: n.data.p_host_id,
    p_helper_id: n.data.p_helper_id,
    p_theme: n.data.p_theme,
    p_max_whiskies: n.data.p_max_whiskies,
  })
  if (error) return { error: messageForDbError(error) }

  if (n.data.participantIds.length > 0) {
    const { error: pErr } = await supabase.rpc('set_event_participants', {
      p_event: eventId as string,
      p_profile_ids: n.data.participantIds,
    })
    if (pErr) {
      // Event steht (nur mit Gastgeber) — Admin kann die Liste nachziehen.
      return {
        error: `Das Tasting wurde angelegt, aber die Teilnehmerliste konnte nicht gespeichert werden: ${messageForDbError(pErr)}`,
      }
    }
  }

  revalidatePath(EVENTS_PATH)
  redirect(EVENTS_PATH)
}

export async function updateEventAction(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_event', {
    p_event: eventId,
    p_event_date: n.data.p_event_date,
    p_location: n.data.p_location,
    p_host_id: n.data.p_host_id,
    p_helper_id: n.data.p_helper_id,
    p_theme: n.data.p_theme,
    p_max_whiskies: n.data.p_max_whiskies,
  })
  if (error) return { error: messageForDbError(error) }

  const { error: pErr } = await supabase.rpc('set_event_participants', {
    p_event: eventId,
    p_profile_ids: n.data.participantIds,
  })
  if (pErr) return { error: messageForDbError(pErr) }

  revalidatePath(EVENTS_PATH)
  redirect(EVENTS_PATH)
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const supabase = await createClient()
  const { error } = await supabase.rpc('delete_event', { p_event: eventId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(EVENTS_PATH)
  return { ok: true }
}
