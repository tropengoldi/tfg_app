/**
 * Reine Ableitungen für die Ergebnisseite (PROJ-9). Kein DB-, kein React-Bezug —
 * damit von /qa ohne Browser mit Vitest abhakbar.
 */

/** Welche Phase die Ergebnisseite zeigt. `missing` → „nicht gefunden". */
export type ResultsPhase = 'closed' | 'pending' | 'missing'

export function resultsPhase(status: 'draft' | 'active' | 'closed' | null): ResultsPhase {
  if (status === null) return 'missing'
  if (status === 'closed') return 'closed'
  return 'pending'
}

/**
 * Durchschnitt als informative Zusatzzahl: Gesamtpunkte ÷ Anzahl Bewertungen,
 * eine Nachkommastelle, Komma als Dezimaltrennzeichen. `null` bei 0 Bewertungen.
 */
export function formatAverage(totalPoints: number, ratingCount: number): string | null {
  if (ratingCount <= 0) return null
  const avg = totalPoints / ratingCount
  return `Ø ${avg.toFixed(1).replace('.', ',')}`
}

/**
 * Ränge, die sich mit einem direkten Nachbarn die exakte Gesamtpunktzahl teilen.
 * Die View-Ränge selbst bleiben eindeutig (1…N); der „punktgleich"-Hinweis
 * erklärt nur, dass hier das Feinkriterium entschieden hat.
 */
export function tieRanks(rows: Array<{ rank: number; totalPoints: number }>): Set<number> {
  const sorted = [...rows].sort((a, b) => a.rank - b.rank)
  const out = new Set<number>()
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].totalPoints === sorted[i - 1].totalPoints) {
      out.add(sorted[i].rank)
      out.add(sorted[i - 1].rank)
    }
  }
  return out
}

/** Rang 1 wird nur dann als Sieger hervorgehoben, wenn überhaupt bewertet wurde. */
export function isWinner(rank: number, hasAnyRatings: boolean): boolean {
  return rank === 1 && hasAnyRatings
}

/** Tailwind-Textfarbe für die Medaillenränge, sonst `null`. */
export function medalClass(rank: number): string | null {
  if (rank === 1) return 'text-gold'
  if (rank === 2) return 'text-silver'
  if (rank === 3) return 'text-bronze'
  return null
}

/** Aufklappbare Einzelbewertungen: Gesamtpunkte ↓, bei Gleichstand Name ↑. */
export function sortBreakdown<T extends { total: number; raterName: string }>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => b.total - a.total || a.raterName.localeCompare(b.raterName, 'de'),
  )
}

/**
 * YouTube-Suchlink für den Fallback „Auf Whisky.de suchen", wenn kein
 * Verkostungsvideo hinterlegt ist (Design-System-Vorgabe).
 */
export function whiskySearchUrl(name: string): string {
  const q = encodeURIComponent(`Whisky.de ${name}`.trim())
  return `https://www.youtube.com/results?search_query=${q}`
}
