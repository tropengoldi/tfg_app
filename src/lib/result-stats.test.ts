import { describe, expect, it } from 'vitest'

import {
  ASSUMED_AGE,
  agreement,
  metricValue,
  noseVsPalate,
  ownPlacements,
  priceValueWinner,
  spread,
  spreadCards,
  type StatsWhisky,
  chartSummary,
} from './result-stats'

function w(p: Partial<StatsWhisky> & { whiskyId: string; rank: number }): StatsWhisky {
  return {
    position: p.rank,
    name: p.whiskyId,
    noseTotal: 0,
    tasteTotal: 0,
    totalPoints: 0,
    ratingCount: 0,
    abv: null,
    ageYears: null,
    price: null,
    ratingTotals: [],
    ...p,
  }
}

describe('metricValue', () => {
  it('fehlendes Alter → 3 Jahre, als angenommen markiert', () => {
    expect(metricValue(w({ whiskyId: 'a', rank: 1 }), 'age')).toEqual({
      value: ASSUMED_AGE,
      assumed: true,
    })
    expect(metricValue(w({ whiskyId: 'a', rank: 1, ageYears: 12 }), 'age')).toEqual({
      value: 12,
      assumed: false,
    })
  })

  it('fehlender Alkohol / Preis → null (keine Angabe)', () => {
    expect(metricValue(w({ whiskyId: 'a', rank: 1 }), 'abv').value).toBeNull()
    expect(metricValue(w({ whiskyId: 'a', rank: 1 }), 'price').value).toBeNull()
  })
})

describe('ownPlacements', () => {
  const list = [
    w({ whiskyId: 'a', rank: 1, position: 1 }),
    w({ whiskyId: 'b', rank: 2, position: 2 }),
    w({ whiskyId: 'c', rank: 3, position: 3 }),
  ]

  it('nur eigene Punkte, Gleichstand Gaumen → Nase → Ausschank', () => {
    const own = ownPlacements(list, [
      { whiskyId: 'a', nose: 3, taste: 6 }, // 9
      { whiskyId: 'b', nose: 2, taste: 7 }, // 9, mehr Gaumen → vor a
      { whiskyId: 'c', nose: 5, taste: 8.5 }, // 13,5
    ])
    expect(own.get('c')).toBe(1)
    expect(own.get('b')).toBe(2)
    expect(own.get('a')).toBe(3)
  })

  it('bei komplettem Gleichstand entscheidet die Ausschank-Nummer', () => {
    const own = ownPlacements(list, [
      { whiskyId: 'b', nose: 3, taste: 6 },
      { whiskyId: 'a', nose: 3, taste: 6 },
    ])
    expect(own.get('a')).toBe(1)
    expect(own.get('b')).toBe(2)
  })

  it('unbewertete Whiskies fehlen', () => {
    const own = ownPlacements(list, [{ whiskyId: 'a', nose: 1, taste: 1 }])
    expect(own.has('b')).toBe(false)
    expect(own.size).toBe(1)
  })
})

describe('priceValueWinner', () => {
  it('höchste Punkte pro 10 €', () => {
    const r = priceValueWinner([
      w({ whiskyId: 'teuer', rank: 1, totalPoints: 60, price: 120 }), // 5
      w({ whiskyId: 'günstig', rank: 2, totalPoints: 50, price: 40 }), // 12,5
    ])
    expect(r!.whisky.whiskyId).toBe('günstig')
    expect(r!.pointsPer10).toBe(12.5)
  })

  it('weniger als 2 Preise → keine Karte; Preis 0 zählt nicht', () => {
    expect(priceValueWinner([w({ whiskyId: 'a', rank: 1, price: 50 }), w({ whiskyId: 'b', rank: 2 })])).toBeNull()
    expect(
      priceValueWinner([
        w({ whiskyId: 'a', rank: 1, price: 50, totalPoints: 10 }),
        w({ whiskyId: 'b', rank: 2, price: 0, totalPoints: 10 }),
      ]),
    ).toBeNull()
  })

  it('Gleichstand → besser platziert', () => {
    const r = priceValueWinner([
      w({ whiskyId: 'b', rank: 2, totalPoints: 20, price: 20 }),
      w({ whiskyId: 'a', rank: 1, totalPoints: 40, price: 40 }),
    ])
    expect(r!.whisky.whiskyId).toBe('a')
  })
})

describe('spreadCards', () => {
  it('Standardabweichung', () => {
    expect(spread([10, 10, 10])).toBe(0)
    expect(spread([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
  })

  it('Konsens = geringste, umstritten = größte Streuung (ab 3 Bewertungen)', () => {
    const r = spreadCards([
      w({ whiskyId: 'einig', rank: 2, ratingTotals: [12, 12, 13] }),
      w({ whiskyId: 'streit', rank: 1, ratingTotals: [3, 14, 8] }),
      w({ whiskyId: 'zuwenig', rank: 3, ratingTotals: [0, 15] }),
    ])
    expect(r.consensus!.whisky.whiskyId).toBe('einig')
    expect(r.controversial!.whisky.whiskyId).toBe('streit')
  })

  it('nur ein Whisky mit ≥ 3 Bewertungen → nur Konsens', () => {
    const r = spreadCards([w({ whiskyId: 'a', rank: 1, ratingTotals: [1, 2, 3] })])
    expect(r.consensus).not.toBeNull()
    expect(r.controversial).toBeNull()
  })

  it('keine Whiskies mit ≥ 3 Bewertungen → keine Karten', () => {
    const r = spreadCards([w({ whiskyId: 'a', rank: 1, ratingTotals: [1, 2] })])
    expect(r).toEqual({ consensus: null, controversial: null })
  })

  it('alle gleich gestreut → nur Konsens', () => {
    const r = spreadCards([
      w({ whiskyId: 'a', rank: 1, ratingTotals: [5, 5, 5] }),
      w({ whiskyId: 'b', rank: 2, ratingTotals: [7, 7, 7] }),
    ])
    expect(r.consensus!.whisky.whiskyId).toBe('a')
    expect(r.controversial).toBeNull()
  })
})

describe('noseVsPalate', () => {
  it('größter Abstand zwischen Nasen- und Gaumenplatz', () => {
    const r = noseVsPalate([
      w({ whiskyId: 'nase', rank: 2, position: 1, noseTotal: 20, tasteTotal: 10 }),
      w({ whiskyId: 'b', rank: 1, position: 2, noseTotal: 15, tasteTotal: 30 }),
      w({ whiskyId: 'c', rank: 3, position: 3, noseTotal: 10, tasteTotal: 20 }),
    ])
    expect(r!.whisky.whiskyId).toBe('nase')
    expect(r!.noseRank).toBe(1)
    expect(r!.palateRank).toBe(3)
  })

  it('kein Abstand → keine Karte; ein Whisky → keine Karte', () => {
    expect(
      noseVsPalate([
        w({ whiskyId: 'a', rank: 1, position: 1, noseTotal: 20, tasteTotal: 30 }),
        w({ whiskyId: 'b', rank: 2, position: 2, noseTotal: 10, tasteTotal: 20 }),
      ]),
    ).toBeNull()
    expect(noseVsPalate([w({ whiskyId: 'a', rank: 1 })])).toBeNull()
  })
})

describe('agreement', () => {
  const list = [
    w({ whiskyId: 'a', rank: 1 }),
    w({ whiskyId: 'b', rank: 2 }),
    w({ whiskyId: 'c', rank: 3 }),
    w({ whiskyId: 'd', rank: 4 }),
  ]

  it('gleiche Reihenfolge → Abstand 0, Favorit auf Platz 1', () => {
    const r = agreement(list, new Map([['a', 1], ['b', 2], ['c', 3]]))
    expect(r!.avgDistance).toBe(0)
    expect(r!.favorite.whiskyId).toBe('a')
    expect(r!.favoriteOverallRank).toBe(1)
  })

  it('umgekehrte Reihenfolge, Vergleich nur über die selbst bewerteten', () => {
    // eigene: d=1, c=2, b=3 ; Runde (nur b,c,d): b=1, c=2, d=3 → |1-3|+|2-2|+|3-1| = 4 → Ø 4/3
    const r = agreement(list, new Map([['d', 1], ['c', 2], ['b', 3]]))
    expect(r!.avgDistance).toBeCloseTo(4 / 3)
    expect(r!.favorite.whiskyId).toBe('d')
    expect(r!.favoriteOverallRank).toBe(4)
  })

  it('weniger als 2 eigene Bewertungen → keine Karte', () => {
    expect(agreement(list, new Map([['a', 1]]))).toBeNull()
    expect(agreement(list, new Map())).toBeNull()
  })
})

describe('formatMetric / detailsLine', () => {
  it('formatiert je Kennzahl', async () => {
    const { formatMetric, detailsLine } = await import('./result-stats')
    expect(formatMetric('rank', 3)).toBe('Platz 3')
    expect(formatMetric('abv', 46.3)).toBe('46,3 %')
    expect(formatMetric('abv', 46)).toBe('46 %')
    expect(formatMetric('age', 18)).toBe('18 J.')
    expect(formatMetric('price', 49.9)).toBe('49,90 €')
    expect(formatMetric('price', 129)).toBe('129 €')
    expect(formatMetric('total', 23.5)).toBe('23,5')
    expect(formatMetric('abv', null)).toBe('keine Angabe')
    expect(detailsLine({ abv: 46, ageYears: null, price: 129 })).toBe('46 % · 129 €')
    expect(detailsLine({ abv: null, ageYears: null, price: null })).toBeNull()
  })
})

describe('chartSummary', () => {
  it('reiht Einträge in Anzeigereihenfolge auf', () => {
    expect(
      chartSummary('Balkendiagramm Platzierung', [
        { name: '#3 Talisker 10', text: '1.' },
        { name: '#1 Oban 14', text: '2.' },
      ]),
    ).toBe('Balkendiagramm Platzierung: #3 Talisker 10: 1.; #1 Oban 14: 2.')
  })

  it('ohne Einträge nur der Titel', () => {
    expect(chartSummary('Punktdiagramm', [])).toBe('Punktdiagramm')
  })
})
