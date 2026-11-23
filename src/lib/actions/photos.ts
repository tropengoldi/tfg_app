'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import {
  collectionPhotoFolder,
  isPhotoPairFor,
  isUuid,
  PHOTO_BUCKET,
  tastingPhotoFolder,
  type PhotoPaths,
} from '@/lib/photos/paths'
import { createClient } from '@/lib/supabase/server'

export type PhotoActionResult = { error: string } | { ok: true }

type ServerClient = Awaited<ReturnType<typeof createClient>>

const pathsSchema = z
  .object({ photoPath: z.string().min(1).max(300), thumbPath: z.string().min(1).max(300) })
  .nullable()

function tastingPaths(eventId: string): string[] {
  return [
    `/tastings/${eventId}/whiskies`,
    `/tastings/${eventId}/ergebnisse`,
    `/tastings/${eventId}/gastgeber`,
  ]
}

/** Alte Dateien entfernen — Fehler schlucken; Reste findet `photos:cleanup`. */
async function removeFiles(supabase: ServerClient, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p))
  if (list.length === 0) return
  try {
    await supabase.storage.from(PHOTO_BUCKET).remove(list)
  } catch {
    /* bewusst ignoriert */
  }
}

/**
 * Foto eines Tasting-Whiskys setzen (`paths`) oder entfernen (`null`).
 * Die Datenbank-Funktion `set_whisky_photo` erlaubt das nur dem Bringer oder
 * einem Admin — in jedem Event-Status — und gibt die bisherigen Pfade zurück,
 * damit die alten Dateien hier weggeräumt werden.
 */
export async function setWhiskyPhotoAction(
  eventId: string,
  whiskyId: string,
  input: PhotoPaths | null,
): Promise<PhotoActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }
  if (!isUuid(eventId) || !isUuid(whiskyId)) return { error: 'Ungültige Anfrage.' }

  const parsed = pathsSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Anfrage.' }
  const paths = parsed.data
  if (paths && !isPhotoPairFor(tastingPhotoFolder(eventId, whiskyId), paths)) {
    return { error: 'Ungültiger Speicherort für das Foto.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_whisky_photo', {
    p_whisky: whiskyId,
    p_photo_path: paths?.photoPath,
    p_thumb_path: paths?.thumbPath,
  })
  if (error) {
    if (paths) await removeFiles(supabase, [paths.photoPath, paths.thumbPath])
    return { error: messageForDbError(error) }
  }

  const old = data?.[0]
  await removeFiles(supabase, [old?.old_photo_path, old?.old_thumb_path])

  for (const p of tastingPaths(eventId)) revalidatePath(p)
  return { ok: true }
}

/**
 * Foto eines eigenen Sammlungs-Eintrags setzen oder entfernen. Läuft als
 * Direktänderung — die RLS-Regel lässt nur die eigene Zeile zu.
 */
export async function setCollectionPhotoAction(
  entryId: string,
  input: PhotoPaths | null,
): Promise<PhotoActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }
  if (!isUuid(entryId)) return { error: 'Ungültige Anfrage.' }

  const parsed = pathsSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Anfrage.' }
  const paths = parsed.data
  if (paths && !isPhotoPairFor(collectionPhotoFolder(session.userId, entryId), paths)) {
    return { error: 'Ungültiger Speicherort für das Foto.' }
  }

  const supabase = await createClient()
  const { data: current } = await supabase
    .from('collection_entries')
    .select('photo_path, photo_thumb_path')
    .eq('id', entryId)
    .eq('profile_id', session.userId)
    .maybeSingle()

  const { data, error } = await supabase
    .from('collection_entries')
    .update({ photo_path: paths?.photoPath ?? null, photo_thumb_path: paths?.thumbPath ?? null })
    .eq('id', entryId)
    .eq('profile_id', session.userId)
    .select('id')
  if (error || !data || data.length === 0) {
    if (paths) await removeFiles(supabase, [paths.photoPath, paths.thumbPath])
    return {
      error: error
        ? messageForDbError(error)
        : 'Der Eintrag wurde bereits gelöscht oder gehört dir nicht mehr.',
    }
  }

  await removeFiles(supabase, [current?.photo_path, current?.photo_thumb_path])
  revalidatePath('/profil/sammlung')
  return { ok: true }
}
