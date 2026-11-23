import type { createClient } from '@/lib/supabase/server'

import { PHOTO_BUCKET } from './paths'

type ServerClient = Awaited<ReturnType<typeof createClient>>

/** Signierte Links für ein Foto; `null` = kein Foto oder nicht sichtbar. */
export interface PhotoUrls {
  thumbUrl: string
  fullUrl: string
}

/** Gültigkeit der Links: lang genug für einen Abend auf der Seite, kurz genug zum Weitergeben. */
const LINK_SECONDS = 60 * 60

interface PathPair {
  photo_path: string | null
  photo_thumb_path: string | null
}

/**
 * PROJ-28 · Signiert die Foto-Pfade mehrerer Zeilen in EINEM Aufruf — mit den
 * Rechten des angemeldeten Nutzers. Der Bucket prüft dabei seine eigene
 * Lese-Regel; was der Betrachter nicht sehen darf, bekommt keinen Link (zweite
 * Sicherung hinter der Tabellen-Regel, die die Pfade gar nicht erst herausgibt).
 *
 * Fehler beim Signieren sind kein Seitenfehler: das Foto fällt dann auf den
 * Platzhalter zurück.
 */
export async function signPhotoPairs(
  supabase: ServerClient,
  rows: PathPair[],
): Promise<Map<string, PhotoUrls>> {
  const result = new Map<string, PhotoUrls>()
  const paths = rows
    .flatMap((r) => (r.photo_path && r.photo_thumb_path ? [r.photo_path, r.photo_thumb_path] : []))
  if (paths.length === 0) return result

  const urlByPath = new Map<string, string>()
  try {
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, LINK_SECONDS)
    for (const item of data ?? []) {
      if (item.path && item.signedUrl && !item.error) urlByPath.set(item.path, item.signedUrl)
    }
  } catch {
    return result
  }

  for (const r of rows) {
    if (!r.photo_path || !r.photo_thumb_path) continue
    const fullUrl = urlByPath.get(r.photo_path)
    const thumbUrl = urlByPath.get(r.photo_thumb_path)
    if (fullUrl && thumbUrl) result.set(r.photo_path, { fullUrl, thumbUrl })
  }
  return result
}

/** Kurzform: Foto-URLs einer Zeile aus der Map holen. */
export function photoFor(map: Map<string, PhotoUrls>, row: PathPair): PhotoUrls | null {
  return row.photo_path ? map.get(row.photo_path) ?? null : null
}
