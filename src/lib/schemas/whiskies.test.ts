import { describe, expect, it } from 'vitest'

import { whiskyFormSchema } from './whiskies'

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
