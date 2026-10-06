import { describe, expect, it } from 'vitest'

import { countsForBalance, tastingMix, testToggleDescription } from './test-accounts'

const members = [
  { id: 'r1', is_test: false },
  { id: 'r2' },
  { id: 't1', is_test: true },
]

describe('tastingMix', () => {
  it('nur echte Mitglieder → real', () => {
    expect(tastingMix(members, ['r1', 'r2'])).toBe('real')
  })
  it('nur Testkonten → test', () => {
    expect(tastingMix(members, ['t1'])).toBe('test')
  })
  it('gemischt → mixed', () => {
    expect(tastingMix(members, ['r1', 't1'])).toBe('mixed')
  })
  it('leere oder unbekannte IDs zählen nicht', () => {
    expect(tastingMix(members, ['', 'unbekannt', 'r1'])).toBe('real')
    expect(tastingMix(members, [])).toBe('real')
  })
  it('Doppelte IDs (Gastgeber auch Teilnehmer) sind egal', () => {
    expect(tastingMix(members, ['t1', 't1'])).toBe('test')
  })
})

describe('testToggleDescription', () => {
  it('Markieren ohne betroffene Tastings', () => {
    expect(testToggleDescription('Anna', true, 0)).toBe('Anna ist danach für normale Mitglieder unsichtbar.')
  })
  it('Markieren mit 1 bzw. 3 Tastings', () => {
    expect(testToggleDescription('Anna', true, 1)).toContain('1 Tasting wird für die Runde ausgeblendet.')
    expect(testToggleDescription('Anna', true, 3)).toContain('3 Tastings werden für die Runde ausgeblendet.')
  })
  it('Entfernen mit 2 Tastings', () => {
    expect(testToggleDescription('Ben', false, 2)).toBe(
      'Ben ist danach wieder für alle sichtbar. 2 Tastings werden für die Runde sichtbar.',
    )
  })
})

describe('countsForBalance', () => {
  it('echtes Konto: Test-Tastings zählen nicht', () => {
    expect(countsForBalance(true, false)).toBe(false)
    expect(countsForBalance(false, false)).toBe(true)
    expect(countsForBalance(null, false)).toBe(true)
  })
  it('Testkonto: alles zählt', () => {
    expect(countsForBalance(true, true)).toBe(true)
    expect(countsForBalance(false, true)).toBe(true)
  })
})
