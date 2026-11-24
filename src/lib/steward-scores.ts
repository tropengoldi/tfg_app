/**
 * Steward-Noten (PROJ-29): reine Ableitungen für Ergebnisseite, Bilanz und
 * Hinweistexte. Kein DB-, kein React-Bezug.
 */
import { formatPoints } from '@/lib/points'

export interface RevealedStewardScore {
  profileId: string
  name: string
  score: number
  comment: string | null
}

export interface StewardScoreSummary {
  count: number
  /** `null` bei 0 Noten. */
  average: number | null
}

/** Bilanz-Eintrag „Als Whisky-Steward". `null` = nie Steward gewesen. */
export interface StewardBalance {
  /** Abgeschlossene Tastings mit dieser Person als Steward. */
  evenings: number
  /** Ø aller dort erhaltenen Noten (jede Note zählt gleich); `null` = noch keine Note. */
  average: number | null
  count: number
}

export function summarizeStewardScores(scores: { score: number }[]): StewardScoreSummary {
  if (scores.length === 0) return { count: 0, average: null }
  const sum = scores.reduce((a, s) => a + s.score, 0)
  return { count: scores.length, average: sum / scores.length }
}

/** Ø mit einer Nachkommastelle, Komma: 8.666 → „8,7", 9 → „9". */
export function formatStewardAverage(average: number): string {
  return formatPoints(Math.round(average * 10) / 10)
}

/** „8,5 von 10 · 6 Stimmen" bzw. „… · 1 Stimme". */
export function stewardSummaryLine(summary: StewardScoreSummary): string {
  if (summary.average === null) return 'Noch keine Note'
  const votes = summary.count === 1 ? '1 Stimme' : `${summary.count} Stimmen`
  return `${formatStewardAverage(summary.average)} von 10 · ${votes}`
}

/** Nach Note absteigend, bei Gleichstand nach Name. */
export function sortStewardScores<T extends { score: number; name: string }>(scores: T[]): T[] {
  return [...scores].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name, 'de'),
  )
}

export function formatEvenings(n: number): string {
  return n === 1 ? '1 Abend' : `${n} Abende`
}

/** Bilanz-Kennzahl: Wert + Unterzeile. */
export function stewardBalanceStat(balance: StewardBalance): { value: string; sub: string } {
  if (balance.average === null) {
    return { value: '—', sub: `${formatEvenings(balance.evenings)} · noch keine Note` }
  }
  return {
    value: `Ø ${formatStewardAverage(balance.average)}`,
    sub: formatEvenings(balance.evenings),
  }
}

/** Hinweis in der Karte: wer wann was sieht. */
export function stewardScorePrivacyHint(stewardName: string | null): string {
  const who = stewardName ?? 'der Steward'
  return `Nach dem Abschluss mit deinem Namen für alle sichtbar — bis dahin sieht es niemand, auch nicht ${who}.`
}
