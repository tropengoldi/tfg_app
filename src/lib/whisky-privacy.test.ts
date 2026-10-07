import { describe, expect, it } from 'vitest'

import { whoElseSeesWhiskies } from './whisky-privacy'

describe('whoElseSeesWhiskies', () => {
  it('ohne Steward: der Gastgeber', () => {
    expect(whoElseSeesWhiskies({ isSteward: false, hasSteward: false })).toBe('nur der Gastgeber')
  })

  it('mit Steward: der Steward (der Gastgeber verkostet blind)', () => {
    expect(whoElseSeesWhiskies({ isSteward: false, hasSteward: true })).toBe(
      'nur der Whisky-Steward',
    )
  })

  it('der Steward selbst: niemand', () => {
    expect(whoElseSeesWhiskies({ isSteward: true, hasSteward: true })).toBe('niemand')
  })
})
