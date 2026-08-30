/**
 * Reine Ableitungen für die persönliche Bilanz (PROJ-10). Kein DB-, kein
 * React-Bezug — von /qa mit Vitest abhakbar.
 */

export interface BestPlacement {
  rank: number
  whiskyName: string
  /** `yyyy-MM-dd` des Abends. */
  eventDate: string
}

export interface PersonalBalance {
  /** Abgeschlossene Tastings, an denen die Person teilgenommen hat. */
  tastingCount: number
  /** Whiskys, die die Person zu abgeschlossenen Tastings mitgebracht hat. */
  whiskyCount: number
  bestPlacement: BestPlacement | null
  /** `null` bei 0 abgegebenen Bewertungen. */
  avgPointsGiven: { avg: string; count: number } | null
  /** Noch kein abgeschlossenes Tasting, kein Whisky, keine Bewertung. */
  isFresh: boolean
}

/** Eine Ranglisten-Zeile, so weit die Bilanz sie braucht. */
export interface RankingRowLike {
  rank: number
  ratingCount: number
  whiskyName: string
  eventId: string
}

/**
 * Ø der Gesamtpunkte (Nase + Geschmack) über alle eigenen Bewertungszeilen,
 * eine Nachkommastelle, Komma als Dezimaltrennzeichen. `null` bei 0 Zeilen.
 */
export function formatAvgGiven(
  totals: number[],
): { avg: string; count: number } | null {
  if (totals.length === 0) return null
  const sum = totals.reduce((a, b) => a + b, 0)
  const mean = sum / totals.length
  return { avg: `Ø ${mean.toFixed(1).replace('.', ',')}`, count: totals.length }
}

/**
 * Die beste je erreichte Platzierung: unter den Whiskys mit mindestens einer
 * Bewertung der mit dem kleinsten Rang; bei Ranggleichheit der jüngste Abend.
 * `null`, wenn kein mitgebrachter Whisky je bewertet wurde.
 */
export function pickBestPlacement(
  rows: RankingRowLike[],
  eventDateById: Map<string, string>,
): BestPlacement | null {
  let best: RankingRowLike | null = null
  let bestDate = ''
  for (const r of rows) {
    if (r.ratingCount <= 0) continue
    const date = eventDateById.get(r.eventId) ?? ''
    if (best === null || r.rank < best.rank || (r.rank === best.rank && date > bestDate)) {
      best = r
      bestDate = date
    }
  }
  return best ? { rank: best.rank, whiskyName: best.whiskyName, eventDate: bestDate } : null
}

/** „1. Platz", „2. Platz", … */
export function ordinalPlace(rank: number): string {
  return `${rank}. Platz`
}
