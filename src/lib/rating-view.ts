/**
 * Reine Ableitungslogik für die Bewertungsansicht (PROJ-7). Kein React, testbar.
 *
 * „Bewertbar" ist ein Whisky, dessen Position ≤ aktueller Position liegt
 * (spiegelt `can_rate_whisky` aus PROJ-1: Event aktiv + Whisky ausgeschenkt).
 */

export const NOSE_DEFAULT = 3
export const TASTE_DEFAULT = 5

export interface WhiskyPosition {
  position: number
  whisky_id: string
}

export interface MyRating {
  whisky_id: string
  nose_points: number
  taste_points: number
  notes: string | null
}

/** Positionen 1..currentPosition, begrenzt auf die tatsächliche Whisky-Zahl. */
export function pourablePositions(currentPosition: number, total: number): number[] {
  const upper = Math.max(0, Math.min(currentPosition, total))
  return Array.from({ length: upper }, (_, i) => i + 1)
}

/** Auf welche Position die Ansicht beim Öffnen scharf stellt (1..total). */
export function initialFocus(currentPosition: number, total: number): number {
  if (total <= 0) return 1
  return Math.max(1, Math.min(currentPosition || 1, total))
}

/** Menge der Positionen, für die der Nutzer schon eine Bewertung gespeichert hat. */
export function ratedPositions(
  whiskies: WhiskyPosition[],
  ratings: MyRating[],
): Set<number> {
  const rated = new Set(ratings.map((r) => r.whisky_id))
  return new Set(
    whiskies.filter((w) => rated.has(w.whisky_id)).map((w) => w.position),
  )
}

/** Stabiler Schlüssel über die eigenen Bewertungen — ändert sich nur bei Inhalt. */
export function ratingsKey(ratings: MyRating[]): string {
  return [...ratings]
    .map((r) => `${r.whisky_id}:${r.nose_points}:${r.taste_points}:${r.notes ?? ''}`)
    .sort()
    .join('|')
}
