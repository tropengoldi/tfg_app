import { describe, expect, it } from 'vitest'

import { stewardScoreEventSchema, stewardScoreSchema } from './steward-scores'

const EVENT = '11111111-1111-4111-8111-111111111111'

describe('stewardScoreSchema', () => {
  it('akzeptiert 0, 7,5 und 10 mit und ohne Kommentar', () => {
    for (const score of [0, 7.5, 10]) {
      expect(stewardScoreSchema.safeParse({ eventId: EVENT, score }).success).toBe(true)
    }
    const r = stewardScoreSchema.safeParse({ eventId: EVENT, score: 8, comment: '  Top!  ' })
    expect(r.success && r.data.comment).toBe('Top!')
  })

  it('lehnt Werte außerhalb 0–10 und Viertelpunkte ab', () => {
    for (const score of [-0.5, 10.5, 7.25, Number.NaN]) {
      expect(stewardScoreSchema.safeParse({ eventId: EVENT, score }).success).toBe(false)
    }
  })

  it('Kommentar: 500 Zeichen ok, 501 nicht; fehlend = leer', () => {
    expect(stewardScoreSchema.safeParse({ eventId: EVENT, score: 5, comment: 'x'.repeat(500) }).success).toBe(true)
    expect(stewardScoreSchema.safeParse({ eventId: EVENT, score: 5, comment: 'x'.repeat(501) }).success).toBe(false)
    const r = stewardScoreSchema.safeParse({ eventId: EVENT, score: 5 })
    expect(r.success && r.data.comment).toBe('')
  })

  it('lehnt ungültige Event-IDs ab', () => {
    expect(stewardScoreSchema.safeParse({ eventId: 'x', score: 5 }).success).toBe(false)
    expect(stewardScoreEventSchema.safeParse({ eventId: 'x' }).success).toBe(false)
    expect(stewardScoreEventSchema.safeParse({ eventId: EVENT }).success).toBe(true)
  })
})
