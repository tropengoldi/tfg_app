/**
 * Eigene Platzierung aus den eigenen Punkten — die eine Regel für die
 * Live-Rangliste (PROJ-24) und „Dein Platz" auf der Ergebnisseite (PROJ-25).
 * Kein DB-, kein React-Bezug.
 */

export interface OwnRankInput {
  whiskyId: string
  position: number
  nose: number
  taste: number
}

export interface OwnRankRow extends OwnRankInput {
  /** 1 … n, eindeutig. */
  place: number
  total: number
}

/**
 * Gesamt ↓ → Gaumen ↓ → Nase ↓ → Ausschank-Nummer ↑. Jeder Platz ist eindeutig.
 * Unbewertete Whiskies gibt man gar nicht erst hinein — sie haben keinen Platz.
 */
export function rankOwnRatings(rows: OwnRankInput[]): OwnRankRow[] {
  return rows
    .map((r) => ({ ...r, total: r.nose + r.taste }))
    .sort(
      (a, b) =>
        b.total - a.total || b.taste - a.taste || b.nose - a.nose || a.position - b.position,
    )
    .map((r, i) => ({ ...r, place: i + 1 }))
}
