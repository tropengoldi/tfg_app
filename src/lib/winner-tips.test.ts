import { describe, expect, it } from 'vitest'

import {
  formatKennerCount,
  kennerSummary,
  sortTips,
  tipLine,
  tipOptions,
  type RevealedTip,
} from './winner-tips'

const tip = (over: Partial<RevealedTip>): RevealedTip => ({
  profileId: 'p',
  name: 'X',
  position: 1,
  whiskyName: 'Lagavulin 16',
  rank: 1,
  isCorrect: false,
  ...over,
})

describe('kennerSummary', () => {
  it('ohne Tipps: kein Hinweis', () => {
    expect(kennerSummary([], true)).toEqual({ kind: 'none' })
    expect(kennerSummary([], false)).toEqual({ kind: 'none' })
  })

  it('Tipps, aber keine Bewertung: kein Sieger', () => {
    expect(kennerSummary([tip({ isCorrect: false })], false)).toEqual({ kind: 'no-winner' })
  })

  it('Tipps, keiner richtig: diesmal kein Kenner', () => {
    expect(kennerSummary([tip({ rank: 2 }), tip({ rank: 3 })], true)).toEqual({
      kind: 'no-kenner',
    })
  })

  it('richtige Tipps alphabetisch', () => {
    const res = kennerSummary(
      [
        tip({ profileId: 'b', name: 'Ben', isCorrect: true }),
        tip({ profileId: 'c', name: 'Carla', rank: 3 }),
        tip({ profileId: 'a', name: 'Änne', isCorrect: true }),
      ],
      true,
    )
    expect(res).toEqual({
      kind: 'kenner',
      kenner: [
        { id: 'a', name: 'Änne' },
        { id: 'b', name: 'Ben' },
      ],
    })
  })
})

describe('sortTips', () => {
  it('sortiert nach Name, ändert die Eingabe nicht', () => {
    const input = [tip({ name: 'Zoe' }), tip({ name: 'anna' })]
    expect(sortTips(input).map((t) => t.name)).toEqual(['anna', 'Zoe'])
    expect(input[0].name).toBe('Zoe')
  })
})

describe('tipLine', () => {
  it('formatiert eine Zeile', () => {
    expect(tipLine(tip({ name: 'Carla', position: 4, whiskyName: 'Talisker 10', rank: 3 }))).toBe(
      'Carla → #4 Talisker 10 (Platz 3)',
    )
  })
})

describe('formatKennerCount', () => {
  it('zeigt 0× und 2×', () => {
    expect(formatKennerCount(0)).toBe('0×')
    expect(formatKennerCount(2)).toBe('2×')
  })
})

describe('tipOptions', () => {
  it('liefert 1 … N', () => {
    expect(tipOptions(3)).toEqual([1, 2, 3])
    expect(tipOptions(0)).toEqual([])
  })
})
