import { describe, expect, it } from 'vitest'

import { formatPoints, stepValue, toRatingStep } from './points'

describe('formatPoints', () => {
  it('ganze Zahlen ohne Nachkommastelle', () => {
    expect(formatPoints(0)).toBe('0')
    expect(formatPoints(17)).toBe('17')
    expect(formatPoints(17.0)).toBe('17')
    expect(formatPoints('12.0')).toBe('12')
  })

  it('halbe Punkte mit Komma', () => {
    expect(formatPoints(9.5)).toBe('9,5')
    expect(formatPoints(0.5)).toBe('0,5')
    expect(formatPoints('23.5')).toBe('23,5')
  })

  it('Gleitkomma-Rauschen wird geglättet', () => {
    expect(formatPoints(0.1 + 0.2 + 2.2)).toBe('2,5')
  })

  it('null / undefined / Unsinn → „0"', () => {
    expect(formatPoints(null)).toBe('0')
    expect(formatPoints(undefined)).toBe('0')
    expect(formatPoints('abc')).toBe('0')
  })
})

describe('stepValue', () => {
  it('geht einen Schritt hoch oder runter', () => {
    expect(stepValue(2.5, 1, 0.5, 0, 5)).toBe(3)
    expect(stepValue(2.5, -1, 0.5, 0, 5)).toBe(2)
    expect(stepValue(3, 1, 1, 0, 10)).toBe(4)
  })

  it('bleibt in den Grenzen', () => {
    expect(stepValue(0, -1, 0.5, 0, 5)).toBe(0)
    expect(stepValue(5, 1, 0.5, 0, 5)).toBe(5)
    expect(stepValue(10, 1, 1, 0, 10)).toBe(10)
  })
})

describe('toRatingStep', () => {
  it('0.5 bleibt 0.5, alles andere wird 1', () => {
    expect(toRatingStep(0.5)).toBe(0.5)
    expect(toRatingStep('0.5')).toBe(0.5)
    expect(toRatingStep(1)).toBe(1)
    expect(toRatingStep(null)).toBe(1)
  })
})
