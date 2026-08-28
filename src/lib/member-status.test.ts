import { describe, expect, it } from 'vitest'

import { memberStatus, STATUS_LABEL } from './member-status'

describe('memberStatus', () => {
  it('deaktiviert schlägt alles andere', () => {
    expect(memberStatus({ is_active: false, has_signed_in: true })).toBe('deactivated')
    expect(memberStatus({ is_active: false, has_signed_in: false })).toBe('deactivated')
  })

  it('aktiv + noch nie angemeldet = eingeladen', () => {
    expect(memberStatus({ is_active: true, has_signed_in: false })).toBe('invited')
  })

  it('aktiv + angemeldet = aktiv', () => {
    expect(memberStatus({ is_active: true, has_signed_in: true })).toBe('active')
  })

  it('jeder Status hat ein Label', () => {
    expect(STATUS_LABEL.invited).toBe('Eingeladen')
    expect(STATUS_LABEL.active).toBe('Aktiv')
    expect(STATUS_LABEL.deactivated).toBe('Deaktiviert')
  })
})
