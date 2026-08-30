import { describe, expect, it } from 'vitest'

import { ratingFormSchema } from './rating'

const base = { nose: 3, taste: 5, notes: '' }

describe('ratingFormSchema', () => {
  it('akzeptiert gültige Werte', () => {
    expect(ratingFormSchema.safeParse(base).success).toBe(true)
    expect(ratingFormSchema.safeParse({ nose: 1, taste: 10, notes: 'ok' }).success).toBe(true)
  })

  it('Nase außerhalb 1–5 wird abgelehnt', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: 0 }).success).toBe(false)
    expect(ratingFormSchema.safeParse({ ...base, nose: 6 }).success).toBe(false)
  })

  it('Geschmack außerhalb 1–10 wird abgelehnt', () => {
    expect(ratingFormSchema.safeParse({ ...base, taste: 0 }).success).toBe(false)
    expect(ratingFormSchema.safeParse({ ...base, taste: 11 }).success).toBe(false)
  })

  it('nur ganze Zahlen', () => {
    expect(ratingFormSchema.safeParse({ ...base, nose: 3.5 }).success).toBe(false)
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
