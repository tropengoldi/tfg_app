import { describe, expect, it } from 'vitest'

import { groupLabel, groupMates, toggleCompare, type CompareMark } from './compare-groups'

/** Gruppen als sortierte Positionslisten, z. B. [[2, 5, 7]]. */
function groups(marks: CompareMark[]): number[][] {
  const by = new Map<number, number[]>()
  for (const m of marks) by.set(m.group, [...(by.get(m.group) ?? []), m.position])
  return [...by.values()].map((g) => g.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0])
}

describe('toggleCompare', () => {
  it('bildet eine Gruppe und erweitert sie', () => {
    let m = toggleCompare([], 2, 5)
    expect(groups(m)).toEqual([[2, 5]])
    m = toggleCompare(m, 2, 7)
    expect(groups(m)).toEqual([[2, 5, 7]])
  })

  it('verschmilzt: bei 3 die 5 antippen → 2·3·5·7', () => {
    const m = toggleCompare(toggleCompare(toggleCompare([], 2, 5), 2, 7), 3, 5)
    expect(groups(m)).toEqual([[2, 3, 5, 7]])
  })

  it('verschmilzt zwei bestehende Gruppen', () => {
    const m = toggleCompare(toggleCompare(toggleCompare([], 1, 4), 2, 5), 4, 5)
    expect(groups(m)).toEqual([[1, 2, 4, 5]])
  })

  it('herausnehmen: bei 2 die 7 antippen → 2·5', () => {
    const m = toggleCompare(toggleCompare(toggleCompare([], 2, 5), 2, 7), 2, 7)
    expect(groups(m)).toEqual([[2, 5]])
  })

  it('auflösen: aus 2·5 die 5 nehmen → nichts mehr', () => {
    expect(toggleCompare(toggleCompare([], 2, 5), 2, 5)).toEqual([])
  })

  it('getrennte Gruppen bleiben getrennt', () => {
    const m = toggleCompare(toggleCompare([], 1, 2), 3, 4)
    expect(groups(m)).toEqual([[1, 2], [3, 4]])
  })

  it('gleiche Nummer ändert nichts', () => {
    expect(toggleCompare([], 3, 3)).toEqual([])
  })
})

describe('groupMates und groupLabel', () => {
  const m = toggleCompare(toggleCompare([], 2, 5), 2, 7)

  it('zeigt die anderen der Gruppe', () => {
    expect(groupMates(m, 5)).toEqual([2, 7])
    expect(groupMates(m, 3)).toEqual([])
  })

  it('Beschriftung', () => {
    expect(groupLabel([5])).toBe('In Gruppe mit 5')
    expect(groupLabel([5, 7])).toBe('In Gruppe mit 5 und 7')
    expect(groupLabel([2, 5, 7])).toBe('In Gruppe mit 2, 5 und 7')
    expect(groupLabel([])).toBe('')
  })
})
