/**
 * Live-Einblick des Whisky-Stewards (PROJ-20): Zeilen aus `steward_ratings` /
 * `steward_winner_tips` für die Karte „Wertungen" aufbereiten.
 * Kein DB-, kein React-Bezug.
 *
 * Die Funktionen liefern Punkte/Notiz/Tipp aus Left-Joins — `null` heißt
 * „noch nicht bewertet" bzw. „kein Tipp" (die generierten Typen kennen das nicht).
 */

export interface StewardRatingInput {
  whisky_id: string
  whisky_position: number
  whisky_name: string
  rater_id: string
  rater_name: string
  nose_points: number | string | null
  taste_points: number | string | null
  total_points: number | string | null
  notes: string | null
}

export interface StewardTipInput {
  rater_id: string
  rater_name: string
  whisky_position: number | null
  whisky_name: string | null
}

export interface StewardRater {
  raterId: string
  name: string
  /** `null` = noch offen. 0 ist ein gültiger Wert. */
  nose: number | null
  taste: number | null
  total: number | null
  notes: string | null
}

export interface StewardWhisky {
  whiskyId: string
  position: number
  name: string
  /** Durchschnitt der Gesamtpunkte der abgegebenen Wertungen; `null` ohne Wertung. */
  average: number | null
  ratedCount: number
  raters: StewardRater[]
}

export interface StewardTip {
  raterId: string
  name: string
  /** `null` = kein Tipp. */
  position: number | null
  whiskyName: string | null
}

const num = (v: number | string | null): number | null => (v === null ? null : Number(v))

/** Nach Ausschank-Nummer gruppiert (aufsteigend), Teilnehmer nach Namen. */
export function groupStewardRatings(rows: StewardRatingInput[]): StewardWhisky[] {
  const byWhisky = new Map<string, StewardWhisky>()
  for (const r of rows) {
    let w = byWhisky.get(r.whisky_id)
    if (!w) {
      w = {
        whiskyId: r.whisky_id,
        position: r.whisky_position,
        name: r.whisky_name,
        average: null,
        ratedCount: 0,
        raters: [],
      }
      byWhisky.set(r.whisky_id, w)
    }
    w.raters.push({
      raterId: r.rater_id,
      name: r.rater_name,
      nose: num(r.nose_points),
      taste: num(r.taste_points),
      total: num(r.total_points),
      notes: r.notes && r.notes.trim() !== '' ? r.notes : null,
    })
  }

  const whiskies = [...byWhisky.values()].sort((a, b) => a.position - b.position)
  for (const w of whiskies) {
    w.raters.sort((a, b) => a.name.localeCompare(b.name, 'de'))
    const totals = w.raters.map((r) => r.total).filter((t): t is number => t !== null)
    w.ratedCount = totals.length
    w.average = totals.length ? totals.reduce((s, t) => s + t, 0) / totals.length : null
  }
  return whiskies
}

export function mapStewardTips(rows: StewardTipInput[]): StewardTip[] {
  return rows
    .map((t) => ({
      raterId: t.rater_id,
      name: t.rater_name,
      position: t.whisky_position,
      whiskyName: t.whisky_name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
}
