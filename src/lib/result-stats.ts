/**
 * Ergebnis-Statistiken eines abgeschlossenen Tastings (PROJ-25). Reine Funktionen,
 * kein DB-, kein React-Bezug — testbar mit Vitest, wiederverwendbar (PROJ-24).
 *
 * Alle Gleichstände bei Karten: besser platziert gewinnt (Rang ist eindeutig).
 */

export interface StatsWhisky {
  whiskyId: string
  /** Ausschank-Nummer. */
  position: number
  /** Gesamtrang (eindeutig, aus `whisky_rankings`). */
  rank: number
  name: string
  noseTotal: number
  tasteTotal: number
  totalPoints: number
  ratingCount: number
  abv: number | null
  ageYears: number | null
  price: number | null
  /** Gesamtpunkte jeder Einzelbewertung (für die Streuung). */
  ratingTotals: number[]
}

export interface OwnRating {
  whiskyId: string
  nose: number
  taste: number
}

/** Fehlt das Alter, werden 3 Jahre angenommen (gesetzliches Mindestalter Scotch). */
export const ASSUMED_AGE = 3

export type MetricKey = 'total' | 'rank' | 'nose' | 'taste' | 'abv' | 'age' | 'price'

export const METRIC_LABELS: Record<MetricKey, string> = {
  total: 'Gesamtpunkte',
  rank: 'Platzierung',
  nose: 'Nasenpunkte',
  taste: 'Gaumenpunkte',
  abv: 'Alkohol (%)',
  age: 'Alter (Jahre)',
  price: 'Preis (€)',
}

export interface MetricValue {
  /** `null` = keine Angabe (Alkohol / Preis). */
  value: number | null
  /** Alter fehlte → 3 Jahre angenommen. */
  assumed: boolean
}

export function metricValue(w: StatsWhisky, metric: MetricKey): MetricValue {
  switch (metric) {
    case 'total':
      return { value: w.totalPoints, assumed: false }
    case 'rank':
      return { value: w.rank, assumed: false }
    case 'nose':
      return { value: w.noseTotal, assumed: false }
    case 'taste':
      return { value: w.tasteTotal, assumed: false }
    case 'abv':
      return { value: w.abv, assumed: false }
    case 'price':
      return { value: w.price, assumed: false }
    case 'age':
      return w.ageYears === null
        ? { value: ASSUMED_AGE, assumed: true }
        : { value: w.ageYears, assumed: false }
  }
}

const byRank = (a: StatsWhisky, b: StatsWhisky) => a.rank - b.rank

// ---------------------------------------------------------------------------
// Eigene Platzierung
// ---------------------------------------------------------------------------

/**
 * Rang je Whisky nur aus den eigenen Punkten: Gesamt ↓ → Gaumen ↓ → Nase ↓ →
 * Ausschank-Nummer ↑. Unbewertete Whiskies fehlen in der Map („—").
 */
export function ownPlacements(
  whiskies: StatsWhisky[],
  own: OwnRating[],
): Map<string, number> {
  const pos = new Map(whiskies.map((w) => [w.whiskyId, w.position]))
  const rated = own
    .filter((r) => pos.has(r.whiskyId))
    .map((r) => ({ ...r, total: r.nose + r.taste, position: pos.get(r.whiskyId)! }))
    .sort(
      (a, b) =>
        b.total - a.total || b.taste - a.taste || b.nose - a.nose || a.position - b.position,
    )
  return new Map(rated.map((r, i) => [r.whiskyId, i + 1]))
}

// ---------------------------------------------------------------------------
// Karten
// ---------------------------------------------------------------------------

export interface PriceValueCard {
  whisky: StatsWhisky
  /** Gesamtpunkte pro 10 €. */
  pointsPer10: number
}

/** Preis-Leistungs-Sieger; nur wenn ≥ 2 Whiskies einen Preis > 0 haben. */
export function priceValueWinner(whiskies: StatsWhisky[]): PriceValueCard | null {
  const priced = whiskies.filter((w) => w.price !== null && w.price > 0)
  if (priced.length < 2) return null
  const scored = priced
    .map((w) => ({ whisky: w, pointsPer10: (w.totalPoints / w.price!) * 10 }))
    .sort((a, b) => b.pointsPer10 - a.pointsPer10 || byRank(a.whisky, b.whisky))
  return scored[0]
}

/** Standardabweichung (Grundgesamtheit). */
export function spread(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export interface SpreadCards {
  consensus: { whisky: StatsWhisky; spread: number } | null
  controversial: { whisky: StatsWhisky; spread: number } | null
}

/**
 * Konsens (geringste Streuung) / umstritten (größte Streuung) über Whiskies mit
 * ≥ 3 Bewertungen. Erfüllt nur einer die Bedingung oder streuen alle gleich,
 * gibt es nur die Konsens-Karte.
 */
export function spreadCards(whiskies: StatsWhisky[], minRatings = 3): SpreadCards {
  const eligible = whiskies
    .filter((w) => w.ratingTotals.length >= minRatings)
    .map((w) => ({ whisky: w, spread: spread(w.ratingTotals) }))
  if (eligible.length === 0) return { consensus: null, controversial: null }

  const asc = [...eligible].sort((a, b) => a.spread - b.spread || byRank(a.whisky, b.whisky))
  const desc = [...eligible].sort((a, b) => b.spread - a.spread || byRank(a.whisky, b.whisky))
  const consensus = asc[0]
  const controversial = desc[0]
  if (eligible.length === 1 || Math.abs(controversial.spread - consensus.spread) < 1e-9) {
    return { consensus, controversial: null }
  }
  return { consensus, controversial }
}

export interface NoseVsPalateCard {
  whisky: StatsWhisky
  noseRank: number
  palateRank: number
}

function rankBy(whiskies: StatsWhisky[], key: 'noseTotal' | 'tasteTotal'): Map<string, number> {
  const sorted = [...whiskies].sort((a, b) => b[key] - a[key] || a.position - b.position)
  return new Map(sorted.map((w, i) => [w.whiskyId, i + 1]))
}

/** Whisky mit dem größten Abstand zwischen Nasen- und Gaumenplatz; Abstand 0 → null. */
export function noseVsPalate(whiskies: StatsWhisky[]): NoseVsPalateCard | null {
  if (whiskies.length < 2) return null
  const nose = rankBy(whiskies, 'noseTotal')
  const palate = rankBy(whiskies, 'tasteTotal')
  const best = whiskies
    .map((w) => ({
      whisky: w,
      noseRank: nose.get(w.whiskyId)!,
      palateRank: palate.get(w.whiskyId)!,
    }))
    .sort(
      (a, b) =>
        Math.abs(b.noseRank - b.palateRank) - Math.abs(a.noseRank - a.palateRank) ||
        byRank(a.whisky, b.whisky),
    )[0]
  return best.noseRank === best.palateRank ? null : best
}

export interface AgreementCard {
  /** Ø Abstand in Plätzen zwischen eigener und Runden-Reihenfolge (über die selbst bewerteten). */
  avgDistance: number
  favorite: StatsWhisky
  /** Gesamtrang des eigenen Favoriten in der Runde. */
  favoriteOverallRank: number
}

/**
 * Übereinstimmung mit der Runde, ab 2 eigenen Bewertungen. Verglichen wird die
 * eigene Reihenfolge mit der Runden-Reihenfolge **derselben** Whiskies (Gesamtrang
 * auf die selbst bewerteten umgerechnet), damit unbewertete das Bild nicht verzerren.
 */
export function agreement(
  whiskies: StatsWhisky[],
  own: Map<string, number>,
): AgreementCard | null {
  if (own.size < 2) return null
  const rated = whiskies.filter((w) => own.has(w.whiskyId)).sort(byRank)
  const groupPlace = new Map(rated.map((w, i) => [w.whiskyId, i + 1]))
  const sum = rated.reduce(
    (acc, w) => acc + Math.abs(own.get(w.whiskyId)! - groupPlace.get(w.whiskyId)!),
    0,
  )
  const favorite = rated.find((w) => own.get(w.whiskyId) === 1)!
  return {
    avgDistance: sum / rated.length,
    favorite,
    favoriteOverallRank: favorite.rank,
  }
}

export interface ResultStats {
  priceValue: PriceValueCard | null
  spread: SpreadCards
  noseVsPalate: NoseVsPalateCard | null
  agreement: AgreementCard | null
}

export function computeResultStats(
  whiskies: StatsWhisky[],
  own: Map<string, number>,
): ResultStats {
  return {
    priceValue: priceValueWinner(whiskies),
    spread: spreadCards(whiskies),
    noseVsPalate: noseVsPalate(whiskies),
    agreement: agreement(whiskies, own),
  }
}

// ---------------------------------------------------------------------------
// Anzeige
// ---------------------------------------------------------------------------

function de(n: number, digits: number): string {
  return n.toFixed(digits).replace('.', ',')
}

/** Ein Kennzahl-Wert lesbar: „Platz 3", „46,3 %", „18 J.", „49,90 €", „23,5". */
export function formatMetric(metric: MetricKey, value: number | null): string {
  if (value === null) return 'keine Angabe'
  switch (metric) {
    case 'rank':
      return `Platz ${value}`
    case 'abv':
      return `${Number.isInteger(value) ? value : de(value, 1)} %`
    case 'age':
      return `${value} J.`
    case 'price':
      return Number.isInteger(value) ? `${value} €` : `${de(value, 2)} €`
    default:
      return Number.isInteger(value) ? String(value) : de(Math.round(value * 10) / 10, 1)
  }
}

/** Kurzzeile „46 % · 18 J. · 129 €" aus den vorhandenen Angaben, sonst null. */
export function detailsLine(w: {
  abv: number | null
  ageYears: number | null
  price: number | null
}): string | null {
  const parts = [
    w.abv !== null ? formatMetric('abv', w.abv) : null,
    w.ageYears !== null ? formatMetric('age', w.ageYears) : null,
    w.price !== null ? formatMetric('price', w.price) : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}
