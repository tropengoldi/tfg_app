import { describe, expect, it } from 'vitest'

import {
  initialFocus,
  pourablePositions,
  ratedPositions,
  ratingsKey,
  type MyRating,
  type WhiskyPosition,
} from './rating-view'

const W: WhiskyPosition[] = [
  { position: 1, whisky_id: 'a' },
  { position: 2, whisky_id: 'b' },
  { position: 3, whisky_id: 'c' },
]

describe('pourablePositions', () => {
  it('gibt 1..currentPosition zurück', () => {
    expect(pourablePositions(2, 3)).toEqual([1, 2])
  })
  it('begrenzt auf die Whisky-Zahl', () => {
    expect(pourablePositions(5, 3)).toEqual([1, 2, 3])
  })
  it('leere Liste bei Position 0', () => {
    expect(pourablePositions(0, 3)).toEqual([])
  })
})

describe('initialFocus', () => {
  it('ist die aktuelle Position', () => {
    expect(initialFocus(2, 8)).toBe(2)
  })
  it('mindestens 1, auch bei Position 0', () => {
    expect(initialFocus(0, 8)).toBe(1)
  })
  it('höchstens total', () => {
    expect(initialFocus(9, 8)).toBe(8)
  })
  it('1 bei ganz ohne Whiskys', () => {
    expect(initialFocus(0, 0)).toBe(1)
  })
})

describe('ratedPositions', () => {
  it('mappt bewertete Whiskys auf ihre Positionen', () => {
    const ratings: MyRating[] = [
      { whisky_id: 'a', nose_points: 3, taste_points: 6, notes: null },
      { whisky_id: 'c', nose_points: 4, taste_points: 8, notes: 'gut' },
    ]
    expect([...ratedPositions(W, ratings)].sort()).toEqual([1, 3])
  })
  it('leer, wenn nichts bewertet', () => {
    expect(ratedPositions(W, []).size).toBe(0)
  })
})

describe('ratingsKey', () => {
  it('ist reihenfolge-unabhängig und ändert sich bei Inhalt', () => {
    const r1: MyRating[] = [
      { whisky_id: 'a', nose_points: 3, taste_points: 6, notes: null },
      { whisky_id: 'b', nose_points: 2, taste_points: 5, notes: 'x' },
    ]
    const r2: MyRating[] = [r1[1], r1[0]]
    expect(ratingsKey(r1)).toBe(ratingsKey(r2))

    const r3: MyRating[] = [{ ...r1[0], nose_points: 4 }, r1[1]]
    expect(ratingsKey(r3)).not.toBe(ratingsKey(r1))
  })
})
