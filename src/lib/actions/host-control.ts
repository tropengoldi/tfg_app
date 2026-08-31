'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSessionContext } from '@/lib/auth'
import { canAccessHostArea } from '@/lib/auth-rules'
import { messageForDbError } from '@/lib/errors'
import { eckdatenSchema } from '@/lib/schemas/host'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

function pathFor(eventId: string): string {
  return `/tastings/${eventId}/gastgeber`
}

/**
 * Login + „Gastgeber dieses Events oder Admin". Gibt bei fehlendem Zugriff ein
 * ActionResult mit Fehlermeldung zurück, sonst null. Die eigentliche Schranke
 * sind die RPCs — das hier ist die freundliche Vorabprüfung.
 */
async function requireHostOr(eventId: string): Promise<ActionResult | null> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('tasting_events')
    .select('host_id, helper_id')
    .eq('id', eventId)
    .maybeSingle()

  if (!canAccessHostArea(session.userId, session.profile, event)) {
    return { error: 'Dazu fehlt dir die Berechtigung.' }
  }
  return null
}

export async function saveEckdatenAction(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHostOr(eventId)
  if (guard) return guard

  const parsed = eckdatenSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_event_host_fields', {
    p_event: eventId,
    p_theme: parsed.data.theme,
    p_food_info: parsed.data.foodInfo,
    p_host_notes: parsed.data.hostNotes,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

const orderSchema = z.array(z.string().uuid()).min(1)

export async function saveWhiskyOrderAction(
  eventId: string,
  orderedIds: unknown,
): Promise<ActionResult> {
  const guard = await requireHostOr(eventId)
  if (guard) return guard

  const parsed = orderSchema.safeParse(orderedIds)
  if (!parsed.success) return { error: 'Ungültige Reihenfolge.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('set_whisky_order', {
    p_event: eventId,
    p_ordered: parsed.data,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

/**
 * Startet den Abend. Ist `orderedIds` gesetzt (noch nicht gespeicherte
 * Reihenfolge), wird sie vorher übernommen.
 */
export async function startEventAction(
  eventId: string,
  orderedIds?: string[],
): Promise<ActionResult> {
  const guard = await requireHostOr(eventId)
  if (guard) return guard

  const supabase = await createClient()

  if (orderedIds && orderedIds.length > 0) {
    const parsed = orderSchema.safeParse(orderedIds)
    if (!parsed.success) return { error: 'Ungültige Reihenfolge.' }
    const { error: orderErr } = await supabase.rpc('set_whisky_order', {
      p_event: eventId,
      p_ordered: parsed.data,
    })
    if (orderErr) return { error: messageForDbError(orderErr) }
  }

  const { error } = await supabase.rpc('start_event', { p_event: eventId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

export async function nextRoundAction(
  eventId: string,
  expectedPosition: number,
): Promise<ActionResult> {
  const guard = await requireHostOr(eventId)
  if (guard) return guard

  const supabase = await createClient()
  const { error } = await supabase.rpc('close_round', {
    p_event: eventId,
    p_expected_position: expectedPosition,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

export async function closeEventAction(eventId: string): Promise<ActionResult> {
  const guard = await requireHostOr(eventId)
  if (guard) return guard

  const supabase = await createClient()
  const { error } = await supabase.rpc('close_event', { p_event: eventId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}
