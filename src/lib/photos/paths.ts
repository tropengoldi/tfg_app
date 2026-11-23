/**
 * PROJ-28 · Speicherorte der Whisky-Fotos im privaten Bucket `whisky-photos`.
 *
 *   tasting/<eventId>/<whiskyId>/<stamp>-full.jpg   (+ -thumb.jpg)
 *   collection/<profileId>/<entryId>/<stamp>-full.jpg (+ -thumb.jpg)
 *
 * Jeder Upload bekommt einen neuen Zeitstempel, damit nach „Ersetzen" kein
 * Zwischenspeicher das alte Bild zeigt. Die Zugriffsregeln des Buckets lesen
 * die Ordner-Segmente — der Aufbau ist deshalb Teil des Sicherheitsmodells und
 * wird serverseitig mit `isPhotoPairFor` geprüft, bevor ein Pfad in die
 * Datenbank kommt.
 */

export const PHOTO_BUCKET = 'whisky-photos'

export interface PhotoPaths {
  photoPath: string
  thumbPath: string
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export function tastingPhotoFolder(eventId: string, whiskyId: string): string {
  return `tasting/${eventId}/${whiskyId}`
}

export function collectionPhotoFolder(profileId: string, entryId: string): string {
  return `collection/${profileId}/${entryId}`
}

/** Neues Pfad-Paar in einem Ordner; `stamp` ist injizierbar für Tests. */
export function newPhotoPaths(folder: string, stamp: number = Date.now()): PhotoPaths {
  return {
    photoPath: `${folder}/${stamp}-full.jpg`,
    thumbPath: `${folder}/${stamp}-thumb.jpg`,
  }
}

/**
 * Gehört das Pfad-Paar genau in diesen Ordner und hat es die erwartete Form?
 * Verhindert, dass ein manipulierter Aufruf fremde Dateien an einen Whisky hängt.
 */
export function isPhotoPairFor(folder: string, paths: PhotoPaths): boolean {
  const escaped = folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const full = new RegExp(`^${escaped}/(\\d{10,16})-full\\.jpg$`)
  const thumb = new RegExp(`^${escaped}/(\\d{10,16})-thumb\\.jpg$`)
  const a = full.exec(paths.photoPath)
  const b = thumb.exec(paths.thumbPath)
  return Boolean(a && b && a[1] === b[1])
}

export function isUuid(value: string): boolean {
  return new RegExp(`^${UUID}$`, 'i').test(value)
}
