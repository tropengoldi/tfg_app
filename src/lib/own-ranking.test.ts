import { describe, expect, it } from 'vitest'

import { rankOwnRatings, type OwnRankInput } from './own-ranking'

const r = (whiskyId: string, position: number, nose: number, taste: number): OwnRankInput => ({
  whiskyId,
  position,
  nose,
  taste,
})

describe('rankOwnRatings', () => {
  it('leer bleibt leer', () => {
    expect(rankOwnRatings([])).toEqual([])
  })

  it('sortiert nach Gesamtpunkten, Plätze 1 … n', () => {
    const res = rankOwnRatings([r('a', 1, 3, 6), r('b', 2, 4, 8), r('c', 3, 3, 8)])
    expect(res.map((x) => [x.whiskyId, x.place, x.total])).toEqual([
      ['b', 1, 12],
      ['c', 2, 11],
      ['a', 3, 9],
    ])
  })

  it('Gleichstand: Gaumen, dann Nase, dann Ausschank-Nummer', () => {
    const res = rankOwnRatings([
      r('nose', 1, 5, 6), // 11, Gaumen 6
      r('taste', 2, 3, 8), // 11, Gaumen 8
      r('late', 4, 4, 7), // 11, Gaumen 7, Nase 4
      r('early', 3, 4, 7), // 11, Gaumen 7, Nase 4 → frühere Nummer vorn
    ])
    expect(res.map((x) => x.whiskyId)).toEqual(['taste', 'early', 'late', 'nose'])
  })

  it('halbe Punkte zählen exakt', () => {
    const res = rankOwnRatings([r('a', 1, 3.5, 8), r('b', 2, 3, 8.5), r('c', 3, 4, 7.5)])
    expect(res.map((x) => [x.whiskyId, x.total])).toEqual([
      ['b', 11.5],
      ['a', 11.5],
      ['c', 11.5],
    ])
  })

  it('alles 0/0: nur die Ausschank-Nummer entscheidet', () => {
    const res = rankOwnRatings([r('c', 3, 0, 0), r('a', 1, 0, 0), r('b', 2, 0, 0)])
    expect(res.map((x) => [x.whiskyId, x.place])).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
  })

  it('ändert die Eingabe nicht', () => {
    const input = [r('a', 1, 1, 1), r('b', 2, 5, 10)]
    rankOwnRatings(input)
    expect(input[0].whiskyId).toBe('a')
  })
})
