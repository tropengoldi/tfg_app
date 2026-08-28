import { describe, expect, it } from 'vitest'

import { safeInternalPath } from './safe-redirect'

describe('safeInternalPath', () => {
  it('lässt interne, pfad-relative Ziele durch', () => {
    expect(safeInternalPath('/')).toBe('/')
    expect(safeInternalPath('/admin')).toBe('/admin')
    expect(safeInternalPath('/tasting/abc/bewerten?x=1')).toBe('/tasting/abc/bewerten?x=1')
  })

  it('weist absolute und protokoll-relative URLs ab', () => {
    expect(safeInternalPath('https://evil.example/phish')).toBe('/')
    expect(safeInternalPath('//evil.example')).toBe('/')
    expect(safeInternalPath('/\\evil.example')).toBe('/')
    expect(safeInternalPath('http:/x')).toBe('/')
  })

  it('weist nicht-pfad Werte ab', () => {
    expect(safeInternalPath('admin')).toBe('/')
    expect(safeInternalPath('')).toBe('/')
    expect(safeInternalPath(null)).toBe('/')
    expect(safeInternalPath(undefined)).toBe('/')
    expect(safeInternalPath(42 as unknown as string)).toBe('/')
  })

  it('weist Steuerzeichen ab (Header-/Zeilenumbruch-Injection)', () => {
    expect(safeInternalPath('/ok\nSet-Cookie: x')).toBe('/')
    expect(safeInternalPath('/ok\r\n')).toBe('/')
    expect(safeInternalPath('/ok\x00')).toBe('/')
  })

  it('respektiert einen eigenen Fallback', () => {
    expect(safeInternalPath('nope', '/passwort-setzen')).toBe('/passwort-setzen')
    expect(safeInternalPath('//evil', '/login')).toBe('/login')
  })
})
