/**
 * Punkte-Anzeige (PROJ-19): Dezimal-Komma, Nachkommastelle nur wenn nötig.
 * 9 → „9", 9.5 → „9,5", 17.0 → „17". Werte kommen aus der DB als numeric
 * (immer Vielfache von 0,5) — gerundet wird nur gegen Gleitkomma-Rauschen.
 */
export function formatPoints(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace('.', ',')
}

/** Ein Schritt nach oben/unten, auf [min, max] begrenzt (−/+-Tasten). */
export function stepValue(
  value: number,
  direction: 1 | -1,
  step: number,
  min: number,
  max: number,
): number {
  const next = Math.round((value + direction * step) * 10) / 10
  return Math.min(max, Math.max(min, next))
}

/** Erlaubte Schrittweiten eines Tastings (tasting_events.rating_step). */
export type RatingStep = 1 | 0.5

export function toRatingStep(value: number | string | null | undefined): RatingStep {
  return Number(value) === 0.5 ? 0.5 : 1
}
