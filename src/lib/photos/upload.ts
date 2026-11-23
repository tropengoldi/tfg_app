import { createClient } from '@/lib/supabase/client'

import { newPhotoPaths, PHOTO_BUCKET, type PhotoPaths } from './paths'
import { resizePhoto, validatePhotoFile } from './resize'

export type UploadResult = { ok: true; paths: PhotoPaths } | { ok: false; error: string }

/**
 * PROJ-28 · Foto prüfen, im Browser verkleinern und beide Fassungen direkt in
 * den privaten Bucket laden. Ausnahme von der Regel „Mutationen nur über
 * Server-Aktionen": Server-Aktionen sind auf ~1 MB begrenzt, und der Bucket
 * prüft die Schreibrechte selbst (Bringer/Admin bzw. Besitzer). Die Datenbank
 * erfährt vom Foto erst über die anschließende Server-Aktion.
 */
export async function uploadPhoto(file: File, folder: string): Promise<UploadResult> {
  const valid = validatePhotoFile(file)
  if (!valid.ok) return valid

  let resized
  try {
    resized = await resizePhoto(file)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Foto nicht lesbar.' }
  }

  const paths = newPhotoPaths(folder)
  const bucket = createClient().storage.from(PHOTO_BUCKET)
  try {
    const opts = { contentType: 'image/jpeg', upsert: false, cacheControl: '31536000' }
    const [a, b] = await Promise.all([
      bucket.upload(paths.photoPath, resized.full, opts),
      bucket.upload(paths.thumbPath, resized.thumb, opts),
    ])
    if (a.error || b.error) {
      await bucket.remove([paths.photoPath, paths.thumbPath]).catch(() => {})
      return {
        ok: false,
        error: 'Hochladen fehlgeschlagen — fehlt dir die Berechtigung oder ist die Verbindung weg?',
      }
    }
  } catch {
    return { ok: false, error: 'Keine Verbindung. Bitte noch einmal versuchen.' }
  }
  return { ok: true, paths }
}

/** Aufräumen, wenn die Datenbank das hochgeladene Paar abgelehnt hat. */
export async function discardUploadedPhoto(paths: PhotoPaths): Promise<void> {
  await createClient()
    .storage.from(PHOTO_BUCKET)
    .remove([paths.photoPath, paths.thumbPath])
    .catch(() => {})
}
