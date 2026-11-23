/**
 * PROJ-28 · Fotos im Browser verkleinern.
 *
 * Neu-Zeichnen auf ein Canvas wirft sämtliche Metadaten weg — inklusive
 * GPS-Standort — und `imageOrientation: 'from-image'` setzt die Handy-Drehung
 * richtig um. Ergebnis sind zwei JPEGs: die große Fassung (Vollbild) und ein
 * Vorschaubild für Listen.
 */

/** Größte Originaldatei, die wir annehmen (iPhone-Fotos liegen meist bei 3–12 MB). */
export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024
export const FULL_EDGE = 1600
export const THUMB_EDGE = 240
const FULL_QUALITY = 0.85
const THUMB_QUALITY = 0.8

export type PhotoValidation = { ok: true } | { ok: false; error: string }

/** Prüft Dateityp und Größe, bevor überhaupt verkleinert wird. */
export function validatePhotoFile(file: { type: string; size: number; name?: string }): PhotoValidation {
  const isImage =
    file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name ?? '')
  if (!isImage) {
    return { ok: false, error: 'Das ist kein Bild. Bitte ein Foto auswählen.' }
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    return { ok: false, error: 'Das Foto ist zu groß (höchstens 20 MB).' }
  }
  return { ok: true }
}

/** Seitenmaße so verkleinern, dass die lange Kante höchstens `maxEdge` ist (nie vergrößern). */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longEdge = Math.max(width, height)
  if (longEdge <= maxEdge) return { width, height }
  const scale = maxEdge / longEdge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export interface ResizedPhoto {
  full: Blob
  thumb: Blob
}

function toJpeg(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<Blob> {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('canvas'))
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encode'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Nur im Browser aufrufen. Wirft mit einer nutzerlesbaren Meldung. */
export async function resizePhoto(file: File): Promise<ResizedPhoto> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(
      'Dieses Bildformat kann dein Browser nicht lesen. Bitte als JPEG aufnehmen oder ein anderes Foto wählen.',
    )
  }
  try {
    const [full, thumb] = await Promise.all([
      toJpeg(bitmap, FULL_EDGE, FULL_QUALITY),
      toJpeg(bitmap, THUMB_EDGE, THUMB_QUALITY),
    ])
    return { full, thumb }
  } catch {
    throw new Error('Das Foto konnte nicht verarbeitet werden. Bitte ein anderes wählen.')
  } finally {
    bitmap.close()
  }
}
