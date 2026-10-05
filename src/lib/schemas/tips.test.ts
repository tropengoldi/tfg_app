import { describe, expect, it } from 'vitest'

import { winnerTipSchema } from './tips'

const EVENT = '11111111-1111-4111-8111-111111111111'

describe('winnerTipSchema', () => {
  it('akzeptiert Nummern 1–10', () => {
    for (const position of [1, 5, 10]) {
      expect(winnerTipSchema.safeParse({ eventId: EVENT, position }).success).toBe(true)
    }
  })

  it('lehnt 0, 11, Kommazahlen und ungültige Event-IDs ab', () => {
    for (const position of [0, 11, 2.5]) {
      expect(winnerTipSchema.safeParse({ eventId: EVENT, position }).success).toBe(false)
    }
    expect(winnerTipSchema.safeParse({ eventId: 'x', position: 1 }).success).toBe(false)
  })
})
