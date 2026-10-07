import { describe, expect, it } from 'vitest'

import {
  groupStewardRatings,
  mapStewardTips,
  stewardNotesHint,
  stewardTipHint,
  type StewardRatingInput,
} from './steward-insight'

const row = (over: Partial<StewardRatingInput>): StewardRatingInput => ({
  whisky_id: 'w1',
  whisky_position: 1,
  whisky_name: 'Talisker 10',
  rater_id: 'a',
  rater_name: 'Anna',
  nose_points: null,
  taste_points: null,
  total_points: null,
  notes: null,
  ...over,
})

describe('groupStewardRatings', () => {
  it('gruppiert nach Whisky, sortiert nach Ausschank-Nummer und Namen', () => {
    const out = groupStewardRatings([
      row({ whisky_id: 'w2', whisky_position: 2, whisky_name: 'Lagavulin 16', rater_name: 'Bernd', rater_id: 'b' }),
      row({ rater_name: 'Clara', rater_id: 'c' }),
      row({ rater_name: 'Anna' }),
    ])
    expect(out.map((w) => w.position)).toEqual([1, 2])
    expect(out[0].raters.map((r) => r.name)).toEqual(['Anna', 'Clara'])
    expect(out[1].name).toBe('Lagavulin 16')
  })

  it('Durchschnitt nur über abgegebene Wertungen; 0 zählt mit, „offen" nicht', () => {
    const [w] = groupStewardRatings([
      row({ rater_id: 'a', nose_points: 4, taste_points: 7.5, total_points: 11.5 }),
      row({ rater_id: 'b', rater_name: 'Bernd', nose_points: 0, taste_points: 0, total_points: 0 }),
      row({ rater_id: 'c', rater_name: 'Clara' }),
    ])
    expect(w.ratedCount).toBe(2)
    expect(w.average).toBe(5.75)
    const bernd = w.raters.find((r) => r.raterId === 'b')!
    expect(bernd.total).toBe(0)
    const clara = w.raters.find((r) => r.raterId === 'c')!
    expect(clara.total).toBeNull()
  })

  it('ohne Wertungen kein Durchschnitt', () => {
    const [w] = groupStewardRatings([row({}), row({ rater_id: 'b', rater_name: 'Bernd' })])
    expect(w.average).toBeNull()
    expect(w.ratedCount).toBe(0)
  })

  it('numeric als Text wird zur Zahl; leere Notiz wird null', () => {
    const [w] = groupStewardRatings([
      row({ nose_points: '3.5', taste_points: '8', total_points: '11.5', notes: '   ' }),
    ])
    expect(w.raters[0].nose).toBe(3.5)
    expect(w.raters[0].total).toBe(11.5)
    expect(w.raters[0].notes).toBeNull()
  })

  it('leere Eingabe → leere Liste', () => {
    expect(groupStewardRatings([])).toEqual([])
  })
})

describe('mapStewardTips', () => {
  it('sortiert nach Namen, kein Tipp bleibt null', () => {
    const out = mapStewardTips([
      { rater_id: 'b', rater_name: 'Bernd', whisky_position: null, whisky_name: null },
      { rater_id: 'a', rater_name: 'Anna', whisky_position: 3, whisky_name: 'Talisker 10' },
    ])
    expect(out).toEqual([
      { raterId: 'a', name: 'Anna', position: 3, whiskyName: 'Talisker 10' },
      { raterId: 'b', name: 'Bernd', position: null, whiskyName: null },
    ])
  })
})

describe('Hinweise für Teilnehmer', () => {
  it('mit Namen', () => {
    expect(stewardNotesHint('Anna')).toBe(
      'Whisky-Steward Anna sieht deine Punkte und Notizen bis zum Abschluss.',
    )
    expect(stewardTipHint('Anna')).toBe('Whisky-Steward Anna sieht deinen Tipp.')
  })

  it('ohne Namen', () => {
    expect(stewardTipHint(null)).toBe('Der Whisky-Steward sieht deinen Tipp.')
  })
})
