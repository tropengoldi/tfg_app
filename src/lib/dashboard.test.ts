import { describe, expect, it } from 'vitest'

import { canRateNow, eventChannelName, glassStates, progressLabel } from './dashboard'

describe('glassStates', () => {
  it('läuft bei Position 3 von 8: 2× tasted, 1× current, 5× pending', () => {
    const s = glassStates(8, 3, 'active')
    expect(s).toEqual([
      'tasted',
      'tasted',
      'current',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ])
  })

  it('Draft: alle voll', () => {
    expect(glassStates(4, 0, 'draft')).toEqual(['pending', 'pending', 'pending', 'pending'])
  })

  it('abgeschlossen: alle leer', () => {
    expect(glassStates(3, 3, 'closed')).toEqual(['tasted', 'tasted', 'tasted'])
  })

  it('erste Position aktiv: kein tasted davor', () => {
    expect(glassStates(3, 1, 'active')).toEqual(['current', 'pending', 'pending'])
  })

  it('leerer Streifen bei 0 Whiskys', () => {
    expect(glassStates(0, 0, 'draft')).toEqual([])
  })
})

describe('progressLabel', () => {
  it('läuft', () => {
    expect(progressLabel(8, 3, 'active')).toBe('Whisky 3 von 8')
  })
  it('Draft', () => {
    expect(progressLabel(8, 0, 'draft')).toBe('Whisky 0 von 8')
  })
  it('abgeschlossen', () => {
    expect(progressLabel(8, 8, 'closed')).toBe('8 von 8 verkostet')
  })
  it('klemmt die Position auf total', () => {
    expect(progressLabel(5, 9, 'active')).toBe('Whisky 5 von 5')
  })
})

describe('eventChannelName', () => {
  it('ist deterministisch', () => {
    expect(eventChannelName('abc-123')).toBe('event:abc-123')
  })
})

describe('canRateNow', () => {
  it('nur laufendes Event + Teilnehmer', () => {
    expect(canRateNow('active', true)).toBe(true)
    expect(canRateNow('active', false)).toBe(false)
    expect(canRateNow('draft', true)).toBe(false)
    expect(canRateNow('closed', true)).toBe(false)
  })
})
