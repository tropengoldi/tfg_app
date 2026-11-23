'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { PHOTO_BUCKET } from '@/lib/photos/paths'
import { toNumber, whiskyFormSchema } from '@/lib/schemas/whiskies'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }
/** PROJ-28: beim Anlegen kommt die neue ID zurück, damit ein Foto folgen kann. */
export type AddWhiskyResult = { error: string } | { ok: true; whiskyId: string }

function pathFor(eventId: string): string {
  return `/tastings/${eventId}/whiskies`
}

interface WhiskyFields {
  name: string
  videoUrl: string | undefined
  ownerNotes: string | undefined
  // PROJ-25: null = keine Angabe
  abv: number | null
  ageYears: number | null
  price: number | null
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
      abv: toNumber(d.abv),
      ageYears: toNumber(d.ageYears),
      price: toNumber(d.price),
    },
  }
}

/** Neuen eigenen Whisky für ein Event eintragen (nur solange „In Vorbereitung"). */
export async function addWhiskyAction(
  eventId: string,
  input: unknown,
): Promise<AddWhiskyResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { data: whiskyId, error } = await supabase.rpc('add_whisky', {
    p_event: eventId,
    p_name: n.data.name,
    p_video_url: n.data.videoUrl,
    p_owner_notes: n.data.ownerNotes,
    p_abv: n.data.abv ?? undefined,
    p_age_years: n.data.ageYears ?? undefined,
    p_price_eur: n.data.price ?? undefined,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true, whiskyId }
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
      abv: n.data.abv,
      age_years: n.data.ageYears,
      price_eur: n.data.price,
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

/**
 * Einen eigenen Whisky entfernen (nur solange „In Vorbereitung").
 *
 * PROJ-28: Hat der Whisky ein Foto, wird es vorher gelöst und die Dateien
 * gelöscht — solange der Whisky noch existiert, erlaubt der Bucket dem Bringer
 * das Löschen. Scheitert danach `remove_whisky`, bleibt der Whisky ohne Foto
 * stehen (kein Verweis ins Leere).
 */
export async function removeWhiskyAction(
  eventId: string,
  whiskyId: string,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const supabase = await createClient()
  const { data: photo } = await supabase
    .from('whisky_details')
    .select('photo_path, photo_thumb_path')
    .eq('whisky_id', whiskyId)
    .maybeSingle()
  if (photo?.photo_path || photo?.photo_thumb_path) {
    const { error: clearError } = await supabase.rpc('set_whisky_photo', { p_whisky: whiskyId })
    if (clearError) return { error: messageForDbError(clearError) }
    const files = [photo.photo_path, photo.photo_thumb_path].filter((p): p is string => Boolean(p))
    await supabase.storage.from(PHOTO_BUCKET).remove(files).catch(() => {})
  }

  const { error } = await supabase.rpc('remove_whisky', { p_whisky: whiskyId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(pathFor(eventId))
  return { ok: true }
}
