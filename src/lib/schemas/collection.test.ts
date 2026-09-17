import { describe, expect, it } from 'vitest'

import { collectionEntryFormSchema } from './collection'

const base = {
  name: 'Ardbeg Uigeadail',
  distillery: '',
  region: '',
  ageLabel: '',
  tastedOn: '',
  valueNote: '',
  rating: '',
  notes: '',
  owned: false,
}

describe('collectionEntryFormSchema', () => {
  it('akzeptiert nur einen Namen', () => {
    expect(collectionEntryFormSchema.safeParse(base).success).toBe(true)
  })

  it('Name ist Pflicht', () => {
    const r = collectionEntryFormSchema.safeParse({ ...base, name: '   ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toMatch(/erforderlich/)
  })

  it('Name über 200 Zeichen wird abgelehnt', () => {
    expect(
      collectionEntryFormSchema.safeParse({ ...base, name: 'x'.repeat(201) }).success,
    ).toBe(false)
  })

  it('Destillerie/Region über 120 Zeichen werden abgelehnt', () => {
    expect(
      collectionEntryFormSchema.safeParse({ ...base, distillery: 'x'.repeat(121) }).success,
    ).toBe(false)
    expect(
      collectionEntryFormSchema.safeParse({ ...base, region: 'x'.repeat(121) }).success,
    ).toBe(false)
  })

  it('Notiz über 2000 Zeichen wird abgelehnt', () => {
    expect(
      collectionEntryFormSchema.safeParse({ ...base, notes: 'x'.repeat(2001) }).success,
    ).toBe(false)
  })

  it('Bewertung akzeptiert 1–10', () => {
    for (const v of ['1', '5', '10']) {
      expect(collectionEntryFormSchema.safeParse({ ...base, rating: v }).success).toBe(true)
    }
  })

  it('Bewertung außerhalb 1–10 wird abgelehnt', () => {
    for (const v of ['0', '11', 'abc']) {
      expect(collectionEntryFormSchema.safeParse({ ...base, rating: v }).success).toBe(false)
    }
  })

  it('leere Bewertung ist ok (keine Angabe)', () => {
    expect(collectionEntryFormSchema.safeParse({ ...base, rating: '' }).success).toBe(true)
  })

  it('Verkostet-am akzeptiert nur yyyy-MM-dd oder leer', () => {
    expect(collectionEntryFormSchema.safeParse({ ...base, tastedOn: '' }).success).toBe(true)
    expect(
      collectionEntryFormSchema.safeParse({ ...base, tastedOn: '2026-09-17' }).success,
    ).toBe(true)
    expect(collectionEntryFormSchema.safeParse({ ...base, tastedOn: '17.09.2026' }).success).toBe(
      false,
    )
  })

  it('trimmt Textfelder', () => {
    const r = collectionEntryFormSchema.safeParse({ ...base, distillery: '  Ardbeg  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.distillery).toBe('Ardbeg')
  })
})
