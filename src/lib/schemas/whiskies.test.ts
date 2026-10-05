import { describe, expect, it } from 'vitest'

import { toNumber, whiskyFormSchema } from './whiskies'

const base = { name: 'Lagavulin 16', videoUrl: '', ownerNotes: '' }

describe('whiskyFormSchema', () => {
  it('akzeptiert nur einen Namen', () => {
    const r = whiskyFormSchema.safeParse(base)
    expect(r.success).toBe(true)
  })

  it('Name ist Pflicht', () => {
    const r = whiskyFormSchema.safeParse({ ...base, name: '   ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toMatch(/erforderlich/)
  })

  it('Name über 200 Zeichen wird abgelehnt', () => {
    const r = whiskyFormSchema.safeParse({ ...base, name: 'x'.repeat(201) })
    expect(r.success).toBe(false)
  })

  it('leerer Video-Link ist ok', () => {
    expect(whiskyFormSchema.safeParse({ ...base, videoUrl: '' }).success).toBe(true)
  })

  it('Video-Link ohne http(s) wird abgelehnt', () => {
    const r = whiskyFormSchema.safeParse({ ...base, videoUrl: 'youtube.com/watch?v=abc' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toMatch(/http/)
  })

  it('akzeptiert http und https', () => {
    expect(
      whiskyFormSchema.safeParse({ ...base, videoUrl: 'http://example.com/v' }).success,
    ).toBe(true)
    expect(
      whiskyFormSchema.safeParse({ ...base, videoUrl: 'https://youtu.be/abc' }).success,
    ).toBe(true)
  })

  it('trimmt den Video-Link', () => {
    const r = whiskyFormSchema.safeParse({ ...base, videoUrl: '  https://youtu.be/abc  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.videoUrl).toBe('https://youtu.be/abc')
  })

  it('Notiz über 2000 Zeichen wird abgelehnt', () => {
    const r = whiskyFormSchema.safeParse({ ...base, ownerNotes: 'x'.repeat(2001) })
    expect(r.success).toBe(false)
  })
})

describe('whiskyFormSchema — Alkohol, Alter, Preis (PROJ-25)', () => {
  const ok = (patch: Record<string, string>) =>
    whiskyFormSchema.safeParse({ ...base, ...patch }).success

  it('alle drei sind optional', () => {
    expect(ok({ abv: '', ageYears: '', price: '' })).toBe(true)
  })

  it('Alkohol: Komma oder Punkt, eine Nachkommastelle, 0–100', () => {
    for (const v of ['46', '46,3', '46.3', '0', '100']) expect(ok({ abv: v })).toBe(true)
    for (const v of ['46,35', '101', '-1', 'abc', '46,']) expect(ok({ abv: v })).toBe(false)
  })

  it('Alter: ganze Jahre 0–100', () => {
    for (const v of ['0', '3', '18', '100']) expect(ok({ ageYears: v })).toBe(true)
    for (const v of ['12,5', '101', '-3', 'zwölf']) expect(ok({ ageYears: v })).toBe(false)
  })

  it('Preis: ≥ 0, höchstens zwei Nachkommastellen', () => {
    for (const v of ['0', '49', '49,9', '49.95', '1299,00']) expect(ok({ price: v })).toBe(true)
    for (const v of ['49,999', '-5', '€49', '49,']) expect(ok({ price: v })).toBe(false)
  })

  it('toNumber wandelt Komma in Punkt, leer → null', () => {
    expect(toNumber('46,3')).toBe(46.3)
    expect(toNumber('49.95')).toBe(49.95)
    expect(toNumber('')).toBeNull()
  })
})
