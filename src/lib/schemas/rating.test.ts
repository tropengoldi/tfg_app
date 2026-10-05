import { describe, expect, it } from 'vitest'

import { ratingFormSchema } from './rating'

const base = { nose: 3, taste: 5, notes: '' }

describe('ratingFormSchema', () => {
  it('akzeptiert gültige Werte', () => {
    expect(ratingFormSchema.safeParse(base).success).toBe(true)
    expect(ratingFormSchema.safeParse({ nose: 1, taste: 10, notes: 'ok' }).success).toBe(true)
  })

  it('0 Punkte sind erlaubt (PROJ-19)', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: 0 }).success).toBe(true)
    expect(ratingFormSchema.safeParse({ ...base, taste: 0 }).success).toBe(true)
    expect(ratingFormSchema.safeParse({ ...base, nose: 0, taste: 0 }).success).toBe(true)
  })

  it('halbe Punkte sind erlaubt (PROJ-19)', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: 2.5, taste: 9.5 }).success).toBe(true)
    expect(ratingFormSchema.safeParse({ ...base, nose: 4.5, taste: 0.5 }).success).toBe(true)
  })

  it('Nasenpunkte außerhalb 0–5 werden abgelehnt', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: -0.5 }).success).toBe(false)
    expect(ratingFormSchema.safeParse({ ...base, nose: 5.5 }).success).toBe(false)
  })

  it('Gaumenpunkte außerhalb 0–10 werden abgelehnt', () => {
    expect(ratingFormSchema.safeParse({ ...base, taste: -1 }).success).toBe(false)
    expect(ratingFormSchema.safeParse({ ...base, taste: 10.5 }).success).toBe(false)
  })

  it('nur ganze oder halbe Punkte', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: 2.3 }).success).toBe(false)
    expect(ratingFormSchema.safeParse({ ...base, taste: 7.25 }).success).toBe(false)
  })

  it('Notiz über 2000 Zeichen wird abgelehnt', () => {
    expect(ratingFormSchema.safeParse({ ...base, notes: 'x'.repeat(2001) }).success).toBe(false)
  })

  it('trimmt die Notiz', () => {
    const r = ratingFormSchema.safeParse({ ...base, notes: '  hallo  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.notes).toBe('hallo')
  })
})

describe('ratingFormSchema — Begriffe (PROJ-18)', () => {
  function messages(input: typeof base): string[] {
    const r = ratingFormSchema.safeParse(input)
    return r.success ? [] : r.error.issues.map((i) => i.message)
  }

  it('Meldungen sprechen von Nasenpunkten und Gaumenpunkten', () => {
    expect(messages({ ...base, nose: 6 })).toContain('Nasenpunkte liegen zwischen 0 und 5')
    expect(messages({ ...base, taste: 11 })).toContain('Gaumenpunkte liegen zwischen 0 und 10')
  })

  it('keine Meldung nennt noch „Geschmack"', () => {
    for (const m of [...messages({ ...base, nose: -1 }), ...messages({ ...base, taste: -1 })]) {
      expect(m).not.toMatch(/Geschmack/)
    }
  })
})
