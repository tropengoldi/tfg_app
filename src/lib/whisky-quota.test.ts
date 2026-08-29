import { describe, expect, it } from 'vitest'

import { computeQuota, EVENT_WHISKY_CAP } from './whisky-quota'

describe('computeQuota', () => {
  it('kein Limit → beliebig viele, Hinweis nennt „keine Begrenzung"', () => {
    const q = computeQuota({ limit: null, isHost: false, ownCount: 3, eventWhiskyCount: 3 })
    expect(q.max).toBeNull()
    expect(q.canAdd).toBe(true)
    expect(q.hasHostBonus).toBe(false)
    expect(q.hint).toMatch(/[Kk]eine Begrenzung/)
  })

  it('Limit 1, kein Gastgeber, noch nichts eingetragen → 1 frei', () => {
    const q = computeQuota({ limit: 1, isHost: false, ownCount: 0, eventWhiskyCount: 0 })
    expect(q.max).toBe(1)
    expect(q.canAdd).toBe(true)
    expect(q.atPersonalLimit).toBe(false)
    expect(q.hint).toContain('1 von 1')
  })

  it('Limit 1, kein Gastgeber, 1 eingetragen → Limit erreicht, Button aus', () => {
    const q = computeQuota({ limit: 1, isHost: false, ownCount: 1, eventWhiskyCount: 1 })
    expect(q.canAdd).toBe(false)
    expect(q.atPersonalLimit).toBe(true)
    expect(q.hint).toMatch(/Limit für diesen Abend ist erreicht/)
  })

  it('Gastgeber bekommt einen Bonus: Limit 1 → effektiv 2', () => {
    const q = computeQuota({ limit: 1, isHost: true, ownCount: 1, eventWhiskyCount: 1 })
    expect(q.max).toBe(2)
    expect(q.canAdd).toBe(true)
    expect(q.hasHostBonus).toBe(true)
    expect(q.hint).toMatch(/Bonus-Whisky/)
  })

  it('Gastgeber ohne Limit bekommt keinen sichtbaren Bonus', () => {
    const q = computeQuota({ limit: null, isHost: true, ownCount: 0, eventWhiskyCount: 0 })
    expect(q.max).toBeNull()
    expect(q.hasHostBonus).toBe(false)
  })

  it('Gastgeber mit Bonus, beide eingetragen → Limit erreicht', () => {
    const q = computeQuota({ limit: 1, isHost: true, ownCount: 2, eventWhiskyCount: 2 })
    expect(q.canAdd).toBe(false)
    expect(q.atPersonalLimit).toBe(true)
  })

  it(`Event-Obergrenze (${EVENT_WHISKY_CAP}) sticht das persönliche Kontingent`, () => {
    const q = computeQuota({
      limit: null,
      isHost: false,
      ownCount: 1,
      eventWhiskyCount: EVENT_WHISKY_CAP,
    })
    expect(q.canAdd).toBe(false)
    expect(q.atEventCap).toBe(true)
    expect(q.hint).toContain(String(EVENT_WHISKY_CAP))
  })

  it('Limit 2, kein Gastgeber, 1 eingetragen → „noch 1 von 2"', () => {
    const q = computeQuota({ limit: 2, isHost: false, ownCount: 1, eventWhiskyCount: 4 })
    expect(q.canAdd).toBe(true)
    expect(q.hint).toContain('noch 1 von 2')
  })
})
