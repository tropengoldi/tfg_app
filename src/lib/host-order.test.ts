import { describe, expect, it } from 'vitest'

import {
  isLastWhisky,
  moveDown,
  moveUp,
  nextRoundLabel,
  sameOrder,
  shuffle,
} from './host-order'

describe('moveUp / moveDown', () => {
  const base = ['a', 'b', 'c', 'd']

  it('moveUp tauscht mit dem Vorgänger', () => {
    expect(moveUp(base, 2)).toEqual(['a', 'c', 'b', 'd'])
  })

  it('moveUp am Anfang ist wirkungslos (aber eine Kopie)', () => {
    const r = moveUp(base, 0)
    expect(r).toEqual(base)
    expect(r).not.toBe(base)
  })

  it('moveDown tauscht mit dem Nachfolger', () => {
    expect(moveDown(base, 1)).toEqual(['a', 'c', 'b', 'd'])
  })

  it('moveDown am Ende ist wirkungslos', () => {
    expect(moveDown(base, 3)).toEqual(base)
  })

  it('mutiert das Original nicht', () => {
    moveUp(base, 1)
    moveDown(base, 1)
    expect(base).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('shuffle', () => {
  it('ist eine Permutation — gleiche Menge, gleiche Länge', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const out = shuffle(ids, () => 0.42)
    expect(out).toHaveLength(ids.length)
    expect([...out].sort()).toEqual([...ids].sort())
  })

  it('mit rng=0 dreht die Liste vorhersehbar um (Fisher-Yates-Kante)', () => {
    // rng()=0 → j=0 in jedem Schritt
    expect(shuffle(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a'])
  })

  it('mutiert das Original nicht', () => {
    const ids = ['a', 'b', 'c']
    shuffle(ids, () => 0.5)
    expect(ids).toEqual(['a', 'b', 'c'])
  })
})

describe('sameOrder', () => {
  it('true bei identischer Reihenfolge', () => {
    expect(sameOrder(['a', 'b'], ['a', 'b'])).toBe(true)
  })
  it('false bei anderer Reihenfolge oder Länge', () => {
    expect(sameOrder(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(sameOrder(['a'], ['a', 'b'])).toBe(false)
  })
})

describe('nextRoundLabel / isLastWhisky', () => {
  it('Label nennt die nächste Position', () => {
    expect(nextRoundLabel(3, 8)).toBe('Weiter zu Whisky 4 von 8')
  })
  it('letzter Whisky erkannt', () => {
    expect(isLastWhisky(8, 8)).toBe(true)
    expect(isLastWhisky(7, 8)).toBe(false)
  })
})
