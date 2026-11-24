import { describe, expect, it } from 'vitest'

import {
  formatEvenings,
  formatStewardAverage,
  sortStewardScores,
  stewardBalanceStat,
  stewardScorePrivacyHint,
  stewardSummaryLine,
  summarizeStewardScores,
} from './steward-scores'

describe('summarizeStewardScores / stewardSummaryLine', () => {
  it('leer → keine Note', () => {
    const s = summarizeStewardScores([])
    expect(s).toEqual({ count: 0, average: null })
    expect(stewardSummaryLine(s)).toBe('Noch keine Note')
  })

  it('Durchschnitt mit Komma, Stimmen im Singular/Plural', () => {
    expect(stewardSummaryLine(summarizeStewardScores([{ score: 8 }, { score: 9 }]))).toBe(
      '8,5 von 10 · 2 Stimmen',
    )
    expect(stewardSummaryLine(summarizeStewardScores([{ score: 0 }]))).toBe('0 von 10 · 1 Stimme')
  })

  it('rundet auf eine Nachkommastelle', () => {
    expect(formatStewardAverage(26 / 3)).toBe('8,7')
    expect(formatStewardAverage(9)).toBe('9')
  })
})

describe('sortStewardScores', () => {
  it('nach Note absteigend, bei Gleichstand nach Name', () => {
    const sorted = sortStewardScores([
      { name: 'Ben', score: 7 },
      { name: 'Ärne', score: 9 },
      { name: 'Anna', score: 9 },
      { name: 'Carla', score: 10 },
    ])
    expect(sorted.map((s) => s.name)).toEqual(['Carla', 'Anna', 'Ärne', 'Ben'])
  })
})

describe('stewardBalanceStat', () => {
  it('mit Noten: Ø als Wert, Abende als Unterzeile', () => {
    expect(stewardBalanceStat({ evenings: 3, average: 8.66, count: 12 })).toEqual({
      value: 'Ø 8,7',
      sub: '3 Abende',
    })
  })

  it('ohne Noten: „noch keine Note"', () => {
    expect(stewardBalanceStat({ evenings: 1, average: null, count: 0 })).toEqual({
      value: '—',
      sub: '1 Abend · noch keine Note',
    })
    expect(formatEvenings(2)).toBe('2 Abende')
  })
})

describe('stewardScorePrivacyHint', () => {
  it('nennt den Steward, sonst „der Steward"', () => {
    expect(stewardScorePrivacyHint('Ole')).toContain('auch nicht Ole')
    expect(stewardScorePrivacyHint(null)).toContain('auch nicht der Steward')
  })
})
