/**
 * Reine Ableitungen für den Sieger-Tipp (PROJ-22). Kein DB-, kein React-Bezug.
 */

/** Ein aufgedeckter Tipp (aus `winner_tips_revealed`), so weit die UI ihn braucht. */
export interface RevealedTip {
  profileId: string
  name: string
  position: number
  whiskyName: string
  rank: number
  isCorrect: boolean
}

export type KennerSummary =
  /** Keine Tipps (z. B. Tasting vor PROJ-22) → gar kein Hinweis. */
  | { kind: 'none' }
  /** Tipps, aber niemand hat bewertet → „Kein Sieger — keine Kenner". */
  | { kind: 'no-winner' }
  /** Tipps, aber keiner richtig → „Diesmal kein Kenner". */
  | { kind: 'no-kenner' }
  /** Mindestens ein richtiger Tipp. */
  | { kind: 'kenner'; kenner: { id: string; name: string }[] }

/** Alphabetisch nach Name (deutsche Sortierung), bei Gleichstand nach ID. */
export function sortTips(tips: RevealedTip[]): RevealedTip[] {
  return [...tips].sort(
    (a, b) => a.name.localeCompare(b.name, 'de') || a.profileId.localeCompare(b.profileId),
  )
}

export function kennerSummary(tips: RevealedTip[], hasAnyRatings: boolean): KennerSummary {
  if (tips.length === 0) return { kind: 'none' }
  if (!hasAnyRatings) return { kind: 'no-winner' }
  const kenner = sortTips(tips)
    .filter((t) => t.isCorrect)
    .map((t) => ({ id: t.profileId, name: t.name }))
  return kenner.length > 0 ? { kind: 'kenner', kenner } : { kind: 'no-kenner' }
}

/** „Carla → #4 Talisker 10 (Platz 3)" */
export function tipLine(tip: RevealedTip): string {
  return `${tip.name} → #${tip.position} ${tip.whiskyName} (Platz ${tip.rank})`
}

/** Bilanz-Kennzahl: „2×", „0×". */
export function formatKennerCount(count: number): string {
  return `${count}×`
}

/** Auswahl „Whisky 1 … Whisky N" für das Tipp-Feld. */
export function tipOptions(total: number): number[] {
  return Array.from({ length: Math.max(0, total) }, (_, i) => i + 1)
}
