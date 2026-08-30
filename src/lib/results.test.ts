import { describe, expect, it } from 'vitest'

import {
  formatAverage,
  isWinner,
  medalClass,
  resultsPhase,
  sortBreakdown,
  tieRanks,
  whiskySearchUrl,
} from './results'

describe('resultsPhase', () => {
  it('null → missing (nicht gefunden)', () => {
    expect(resultsPhase(null)).toBe('missing')
  })
  it('closed → closed', () => {
    expect(resultsPhase('closed')).toBe('closed')
  })
  it('draft und active → pending', () => {
    expect(resultsPhase('draft')).toBe('pending')
    expect(resultsPhase('active')).toBe('pending')
  })
})

describe('formatAverage', () => {
  it('0 Bewertungen → null', () => {
    expect(formatAverage(0, 0)).toBeNull()
    expect(formatAverage(42, 0)).toBeNull()
  })
  it('eine Nachkommastelle mit Komma', () => {
    expect(formatAverage(37, 3)).toBe('Ø 12,3')
    expect(formatAverage(12, 1)).toBe('Ø 12,0')
  })
  it('rundet auf eine Stelle', () => {
    expect(formatAverage(50, 7)).toBe('Ø 7,1')
  })
})

describe('tieRanks', () => {
  it('kein Gleichstand → leeres Set', () => {
    const t = tieRanks([
      { rank: 1, totalPoints: 40 },
      { rank: 2, totalPoints: 30 },
      { rank: 3, totalPoints: 20 },
    ])
    expect(t.size).toBe(0)
  })
  it('benachbarte gleiche Summe → beide Ränge markiert', () => {
    const t = tieRanks([
      { rank: 1, totalPoints: 40 },
      { rank: 2, totalPoints: 30 },
      { rank: 3, totalPoints: 30 },
      { rank: 4, totalPoints: 10 },
    ])
    expect([...t].sort()).toEqual([2, 3])
  })
  it('drei in Folge gleich → alle drei markiert', () => {
    const t = tieRanks([
      { rank: 1, totalPoints: 25 },
      { rank: 2, totalPoints: 25 },
      { rank: 3, totalPoints: 25 },
    ])
    expect([...t].sort()).toEqual([1, 2, 3])
  })
  it('unsortierte Eingabe wird zuerst nach Rang geordnet', () => {
    const t = tieRanks([
      { rank: 3, totalPoints: 30 },
      { rank: 1, totalPoints: 40 },
      { rank: 2, totalPoints: 30 },
    ])
    expect([...t].sort()).toEqual([2, 3])
  })
})

describe('isWinner', () => {
  it('Rang 1 mit Bewertungen → true', () => {
    expect(isWinner(1, true)).toBe(true)
  })
  it('Rang 1 ohne jede Bewertung → false', () => {
    expect(isWinner(1, false)).toBe(false)
  })
  it('Rang 2 → false', () => {
    expect(isWinner(2, true)).toBe(false)
  })
})

describe('medalClass', () => {
  it('Gold/Silber/Bronze für 1/2/3', () => {
    expect(medalClass(1)).toBe('text-gold')
    expect(medalClass(2)).toBe('text-silver')
    expect(medalClass(3)).toBe('text-bronze')
  })
  it('ab Rang 4 → null', () => {
    expect(medalClass(4)).toBeNull()
  })
})

describe('sortBreakdown', () => {
  it('Gesamtpunkte absteigend, bei Gleichstand Name aufsteigend', () => {
    const out = sortBreakdown([
      { raterName: 'Bea', total: 12 },
      { raterName: 'Anton', total: 15 },
      { raterName: 'Cara', total: 12 },
    ])
    expect(out.map((e) => e.raterName)).toEqual(['Anton', 'Bea', 'Cara'])
  })
  it('lässt die Eingabe unangetastet (reine Funktion)', () => {
    const input = [
      { raterName: 'B', total: 1 },
      { raterName: 'A', total: 2 },
    ]
    sortBreakdown(input)
    expect(input.map((e) => e.raterName)).toEqual(['B', 'A'])
  })
})

describe('whiskySearchUrl', () => {
  it('baut einen YouTube-Suchlink nach „Whisky.de <Name>"', () => {
    expect(whiskySearchUrl('Ardbeg 10')).toBe(
      'https://www.youtube.com/results?search_query=Whisky.de%20Ardbeg%2010',
    )
  })
  it('kodiert Sonderzeichen', () => {
    expect(whiskySearchUrl('Caol Ila & Co')).toContain('Whisky.de%20Caol%20Ila%20%26%20Co')
  })
})
