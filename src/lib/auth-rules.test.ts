import { describe, expect, it } from 'vitest'

import { canAccessHostArea, isActiveMember, isAdmin, isEventHost } from './auth-rules'

describe('isActiveMember', () => {
  it('true nur bei is_active === true', () => {
    expect(isActiveMember({ is_active: true })).toBe(true)
    expect(isActiveMember({ is_active: false })).toBe(false)
    expect(isActiveMember(null)).toBe(false)
    expect(isActiveMember(undefined)).toBe(false)
  })
})

describe('isAdmin', () => {
  it('true nur für aktive Admins', () => {
    expect(isAdmin({ role: 'admin', is_active: true })).toBe(true)
    expect(isAdmin({ role: 'admin', is_active: false })).toBe(false)
    expect(isAdmin({ role: 'teilnehmer', is_active: true })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isEventHost', () => {
  it('true, wenn die User-ID der host_id des Events entspricht', () => {
    expect(isEventHost('u1', { host_id: 'u1' })).toBe(true)
    expect(isEventHost('u1', { host_id: 'u2' })).toBe(false)
    expect(isEventHost(null, { host_id: 'u1' })).toBe(false)
    expect(isEventHost('u1', null)).toBe(false)
  })
})

describe('canAccessHostArea', () => {
  const host = { role: 'teilnehmer', is_active: true } as const
  const admin = { role: 'admin', is_active: true } as const
  const other = { role: 'teilnehmer', is_active: true } as const

  it('lässt den Gastgeber durch', () => {
    expect(canAccessHostArea('u1', host, { host_id: 'u1' })).toBe(true)
  })

  it('lässt einen Admin durch, auch wenn er nicht Gastgeber ist', () => {
    expect(canAccessHostArea('admin1', admin, { host_id: 'u1' })).toBe(true)
  })

  it('sperrt einen fremden Teilnehmer', () => {
    expect(canAccessHostArea('u2', other, { host_id: 'u1' })).toBe(false)
  })

  it('sperrt bei fehlendem Event', () => {
    expect(canAccessHostArea('u1', host, null)).toBe(false)
  })

  it('sperrt einen deaktivierten Admin, der nicht Gastgeber ist', () => {
    expect(
      canAccessHostArea('admin1', { role: 'admin', is_active: false }, { host_id: 'u1' }),
    ).toBe(false)
  })
})
