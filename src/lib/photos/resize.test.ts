import { describe, expect, it } from 'vitest'

import { fitWithin, MAX_ORIGINAL_BYTES, validatePhotoFile } from './resize'

describe('fitWithin (PROJ-28)', () => {
  it('verkleinert Querformat auf die lange Kante', () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 })
  })

  it('verkleinert Hochformat auf die lange Kante', () => {
    expect(fitWithin(3024, 4032, 240)).toEqual({ width: 180, height: 240 })
  })

  it('vergrößert nie', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })

  it('liefert mindestens 1 px', () => {
    expect(fitWithin(10000, 1, 240)).toEqual({ width: 240, height: 1 })
  })
})

describe('validatePhotoFile (PROJ-28)', () => {
  it('nimmt Bilder bis 20 MB an', () => {
    expect(validatePhotoFile({ type: 'image/jpeg', size: MAX_ORIGINAL_BYTES })).toEqual({ ok: true })
  })

  it('nimmt iPhone-HEIC auch ohne MIME-Typ an', () => {
    expect(validatePhotoFile({ type: '', size: 1000, name: 'IMG_0001.HEIC' })).toEqual({ ok: true })
  })

  it('lehnt Nicht-Bilder ab', () => {
    const r = validatePhotoFile({ type: 'application/pdf', size: 1000, name: 'x.pdf' })
    expect(r.ok).toBe(false)
  })

  it('lehnt zu große Dateien ab', () => {
    const r = validatePhotoFile({ type: 'image/jpeg', size: MAX_ORIGINAL_BYTES + 1 })
    expect(r.ok).toBe(false)
  })
})
