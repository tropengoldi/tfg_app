import { describe, expect, it } from 'vitest'

import { DB_ERROR_MESSAGES, isStalePositionError, messageForDbError } from './errors'

describe('messageForDbError', () => {
  it('nutzt die DB-Meldung bei TS-Codes', () => {
    const err = { code: 'TS002', message: 'Die Runde wurde bereits weitergeschaltet.' }
    expect(messageForDbError(err)).toBe('Die Runde wurde bereits weitergeschaltet.')
  })

  it('fällt bei TS-Code ohne message auf die Tabelle zurück', () => {
    expect(messageForDbError({ code: 'TS003' })).toBe(DB_ERROR_MESSAGES.TS003)
  })

  it('mappt Standard-Postgres-Codes', () => {
    expect(messageForDbError({ code: '42501' })).toBe(DB_ERROR_MESSAGES['42501'])
    expect(messageForDbError({ code: '23505' })).toBe(DB_ERROR_MESSAGES['23505'])
  })

  it('gibt die rohe message zurück, wenn der Code unbekannt ist', () => {
    expect(messageForDbError({ code: 'XX999', message: 'irgendwas' })).toBe('irgendwas')
  })

  it('hat einen Fallback für leere/kaputte Fehler', () => {
    expect(messageForDbError(null)).toMatch(/schiefgelaufen/i)
    expect(messageForDbError('boom')).toMatch(/schiefgelaufen/i)
    expect(messageForDbError({})).toMatch(/schiefgelaufen/i)
  })
})

describe('isStalePositionError', () => {
  it('erkennt TS002', () => {
    expect(isStalePositionError({ code: 'TS002' })).toBe(true)
  })

  it('ist false für alles andere', () => {
    expect(isStalePositionError({ code: 'TS001' })).toBe(false)
    expect(isStalePositionError(null)).toBe(false)
    expect(isStalePositionError('TS002')).toBe(false)
  })
})
