import { describe, expect, it } from 'vitest'

import {
  formatAvgGiven,
  ordinalPlace,
  pickBestPlacement,
  type RankingRowLike,
} from './personal-balance'

describe('formatAvgGiven', () => {
  it('0 Bewertungen → null', () => {
    expect(formatAvgGiven([])).toBeNull()
  })
  it('eine Nachkommastelle mit Komma + Anzahl', () => {
    expect(formatAvgGiven([10, 12, 14])).toEqual({ avg: 'Ø 12,0', count: 3 })
    expect(formatAvgGiven([11, 12])).toEqual({ avg: 'Ø 11,5', count: 2 })
  })
  it('rundet auf eine Stelle', () => {
    expect(formatAvgGiven([10, 11, 13])).toEqual({ avg: 'Ø 11,3', count: 3 })
  })
})

describe('pickBestPlacement', () => {
  const dates = new Map<string, string>([
    ['e1', '2025-01-10'],
    ['e2', '2025-06-14'],
    ['e3', '2025-09-01'],
  ])

  it('kein Whisky → null', () => {
    expect(pickBestPlacement([], dates)).toBeNull()
  })

  it('ignoriert Whiskys ganz ohne Bewertung', () => {
    const rows: RankingRowLike[] = [
      { rank: 1, ratingCount: 0, whiskyName: 'Ungewertet', eventId: 'e1' },
      { rank: 3, ratingCount: 4, whiskyName: 'Ardbeg', eventId: 'e2' },
    ]
    expect(pickBestPlacement(rows, dates)).toEqual({
      rank: 3,
      whiskyName: 'Ardbeg',
      eventDate: '2025-06-14',
    })
  })

  it('nimmt den kleinsten Rang', () => {
    const rows: RankingRowLike[] = [
      { rank: 4, ratingCount: 6, whiskyName: 'A', eventId: 'e1' },
      { rank: 2, ratingCount: 6, whiskyName: 'B', eventId: 'e2' },
      { rank: 5, ratingCount: 6, whiskyName: 'C', eventId: 'e3' },
    ]
    expect(pickBestPlacement(rows, dates)?.whiskyName).toBe('B')
  })

  it('bei Ranggleichheit den jüngsten Abend', () => {
    const rows: RankingRowLike[] = [
      { rank: 1, ratingCount: 5, whiskyName: 'Alt', eventId: 'e1' },
      { rank: 1, ratingCount: 5, whiskyName: 'Neu', eventId: 'e3' },
    ]
    expect(pickBestPlacement(rows, dates)).toEqual({
      rank: 1,
      whiskyName: 'Neu',
      eventDate: '2025-09-01',
    })
  })

  it('alle Whiskys unbewertet → null', () => {
    const rows: RankingRowLike[] = [
      { rank: 1, ratingCount: 0, whiskyName: 'X', eventId: 'e1' },
    ]
    expect(pickBestPlacement(rows, dates)).toBeNull()
  })
})

describe('ordinalPlace', () => {
  it('formatiert als „n. Platz"', () => {
    expect(ordinalPlace(1)).toBe('1. Platz')
    expect(ordinalPlace(7)).toBe('7. Platz')
  })
})
