import { describe, expect, it } from 'vitest'

import {
  collectionPhotoFolder,
  isPhotoPairFor,
  isUuid,
  newPhotoPaths,
  tastingPhotoFolder,
} from './paths'

const EVENT = '54575d5f-a1ac-4c4d-87b0-7add7d9c531e'
const WHISKY = '0e23e766-ffc3-416c-bb12-365184dac570'
const OTHER = '8b5339ac-0897-4d1f-8881-a6f97c789741'

describe('photo paths (PROJ-28)', () => {
  it('baut Ordner für Tasting und Sammlung', () => {
    expect(tastingPhotoFolder(EVENT, WHISKY)).toBe(`tasting/${EVENT}/${WHISKY}`)
    expect(collectionPhotoFolder(OTHER, WHISKY)).toBe(`collection/${OTHER}/${WHISKY}`)
  })

  it('erzeugt ein Paar mit gleichem Zeitstempel', () => {
    const p = newPhotoPaths('tasting/a/b', 1732300000000)
    expect(p).toEqual({
      photoPath: 'tasting/a/b/1732300000000-full.jpg',
      thumbPath: 'tasting/a/b/1732300000000-thumb.jpg',
    })
  })

  it('akzeptiert ein frisch erzeugtes Paar für den eigenen Ordner', () => {
    const folder = tastingPhotoFolder(EVENT, WHISKY)
    expect(isPhotoPairFor(folder, newPhotoPaths(folder))).toBe(true)
  })

  it('lehnt Pfade aus einem fremden Ordner ab', () => {
    const mine = tastingPhotoFolder(EVENT, WHISKY)
    const foreign = newPhotoPaths(tastingPhotoFolder(EVENT, OTHER))
    expect(isPhotoPairFor(mine, foreign)).toBe(false)
  })

  it('lehnt Paare mit unterschiedlichem Zeitstempel ab', () => {
    const folder = tastingPhotoFolder(EVENT, WHISKY)
    expect(
      isPhotoPairFor(folder, {
        photoPath: `${folder}/1732300000000-full.jpg`,
        thumbPath: `${folder}/1732300000001-thumb.jpg`,
      }),
    ).toBe(false)
  })

  it('lehnt Pfad-Tricks ab (Unterordner, ../, falsche Endung)', () => {
    const folder = tastingPhotoFolder(EVENT, WHISKY)
    for (const bad of [
      `${folder}/x/1732300000000-full.jpg`,
      `${folder}/../${OTHER}/1732300000000-full.jpg`,
      `${folder}/1732300000000-full.png`,
      `${folder}/1732300000000-thumb.jpg`,
    ]) {
      expect(
        isPhotoPairFor(folder, { photoPath: bad, thumbPath: `${folder}/1732300000000-thumb.jpg` }),
      ).toBe(false)
    }
  })

  it('erkennt UUIDs', () => {
    expect(isUuid(EVENT)).toBe(true)
    expect(isUuid('nicht-uuid')).toBe(false)
    expect(isUuid(`${EVENT}/..`)).toBe(false)
  })
})
