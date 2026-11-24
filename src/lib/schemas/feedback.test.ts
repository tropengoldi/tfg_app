import { describe, expect, it } from 'vitest'

import { feedbackSchema } from './feedback'

describe('feedbackSchema', () => {
  it('akzeptiert Art + Beschreibung und kürzt Leerzeichen', () => {
    const r = feedbackSchema.parse({ kind: 'bug', description: '   Knopf reagiert nicht   ' })
    expect(r.description).toBe('Knopf reagiert nicht')
  })

  it('verlangt eine Art', () => {
    const r = feedbackSchema.safeParse({ description: 'Eine ausreichend lange Beschreibung' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toBe('Bitte wähle aus, worum es geht.')
  })

  it('lehnt unbekannte Arten ab', () => {
    expect(feedbackSchema.safeParse({ kind: 'spam', description: 'x'.repeat(20) }).success).toBe(false)
  })

  it('zählt erst nach dem Trimmen: 9 Zeichen mit Leerzeichen drumherum reichen nicht', () => {
    const r = feedbackSchema.safeParse({ kind: 'wish', description: '   123456789   ' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toBe('Bitte mindestens 10 Zeichen.')
  })

  it('erlaubt genau 10 und 2000 Zeichen, nicht 2001', () => {
    expect(feedbackSchema.safeParse({ kind: 'other', description: 'x'.repeat(10) }).success).toBe(true)
    expect(feedbackSchema.safeParse({ kind: 'other', description: 'x'.repeat(2000) }).success).toBe(true)
    const r = feedbackSchema.safeParse({ kind: 'other', description: 'x'.repeat(2001) })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toBe('Höchstens 2000 Zeichen.')
  })
})
