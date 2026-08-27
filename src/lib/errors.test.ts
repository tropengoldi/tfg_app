import { describe, expect, it } from 'vitest'

import { DB_ERROR_MESSAGES, isStalePositionError, messageForDbError } from './errors'

describe('messageForDbError', () => {
  it('nutzt die DB-Meldung bei PT-Codes', () => {
    const err = { code: 'PT002', message: 'Die Runde wurde bereits weitergeschaltet.' }
    expect(messageForDbError(err)).toBe('Die Runde wurde bereits weitergeschaltet.')
  })

  it('fällt bei PT-Code ohne message auf die Tabelle zurück', () => {
    expect(messageForDbError({ code: 'PT003' })).toBe(DB_ERROR_MESSAGES.PT003)
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
  it('erkennt PT002', () => {
    expect(isStalePositionError({ code: 'PT002' })).toBe(true)
  })

  it('ist false für alles andere', () => {
    expect(isStalePositionError({ code: 'PT001' })).toBe(false)
    expect(isStalePositionError(null)).toBe(false)
    expect(isStalePositionError('PT002')).toBe(false)
  })
})
