'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { whiskyFormSchema } from '@/lib/schemas/whiskies'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

function pathFor(eventId: string): string {
  return `/tastings/${eventId}/whiskies`
}

interface WhiskyFields {
  name: string
  videoUrl: string | undefined
  ownerNotes: string | undefined
}

type Normalized = { ok: true; data: WhiskyFields } | { ok: false; error: string }

function normalize(input: unknown): Normalized {
  const parsed = whiskyFormSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const d = parsed.data
  return {
    ok: true,
    data: {
      name: d.name,
      videoUrl: d.videoUrl === '' ? undefined : d.videoUrl,
      ownerNotes: d.ownerNotes === '' ? undefined : d.ownerNotes,
    },
  }
}

/** Neuen eigenen Whisky für ein Event eintragen (nur solange „In Vorbereitung"). */
export async function addWhiskyAction(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { error } = await supabase.rpc('add_whisky', {
    p_event: eventId,
    p_name: n.data.name,
    p_video_url: n.data.videoUrl,
    p_owner_notes: n.data.ownerNotes,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

/**
 * Einen eigenen Whisky ändern. Läuft als spaltengenaue Direktänderung an
 * `whisky_details` — die RLS-Regel `wd_update_own` lässt nur den Bringer und nur
 * im Status „In Vorbereitung" zu. Greift die Regel nicht, kommen 0 Zeilen zurück.
 */
export async function updateWhiskyAction(
  eventId: string,
  whiskyId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whisky_details')
    .update({
      name: n.data.name,
      video_url: n.data.videoUrl ?? null,
      owner_notes: n.data.ownerNotes ?? null,
    })
    .eq('whisky_id', whiskyId)
    .select('whisky_id')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return {
      error:
        'Die Änderung war nicht möglich — vielleicht läuft der Abend schon oder der Whisky gehört dir nicht mehr.',
    }
  }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}

/** Einen eigenen Whisky entfernen (nur solange „In Vorbereitung"). */
export async function removeWhiskyAction(
  eventId: string,
  whiskyId: string,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('remove_whisky', { p_whisky: whiskyId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}
