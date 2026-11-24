import { describe, expect, it } from 'vitest'

import {
  buildFeedbackMail,
  formatVersion,
  oneLine,
  sanitizeFromPage,
  USER_AGENT_MAX,
  type FeedbackMailInput,
} from './feedback-mail'

const base: FeedbackMailInput = {
  kind: 'bug',
  description: 'Beim Speichern passiert nichts.\nZweite Zeile.',
  senderName: 'Hermann',
  senderEmail: 'h@example.com',
  isTest: false,
  fromPage: '/',
  userAgent: 'Mozilla/5.0 (iPhone)',
  commitSha: '4ab533f0123456789',
  now: new Date('2026-11-24T19:05:00Z'),
}

describe('buildFeedbackMail', () => {
  it('Betreff aus Art + Name', () => {
    expect(buildFeedbackMail(base).subject).toBe('[Whizzky] Fehler von Hermann')
    expect(buildFeedbackMail({ ...base, kind: 'wish' }).subject).toBe('[Whizzky] Wunsch von Hermann')
    expect(buildFeedbackMail({ ...base, kind: 'other' }).subject).toBe('[Whizzky] Sonstiges von Hermann')
  })

  it('Testkonto im Betreff und im Text gekennzeichnet', () => {
    const m = buildFeedbackMail({ ...base, isTest: true })
    expect(m.subject).toBe('[Whizzky] Fehler von Hermann (Testkonto)')
    expect(m.text).toContain('Konto: Testkonto')
  })

  it('Text enthält Beschreibung unverändert (mit Zeilenumbrüchen) und alle Technik-Angaben', () => {
    const { text } = buildFeedbackMail(base)
    expect(text).toContain('Beim Speichern passiert nichts.\nZweite Zeile.')
    expect(text).toContain('Fehler von Hermann <h@example.com>')
    expect(text).toContain('Zeitpunkt: 24.11.2026, 20:05')
    expect(text).toContain('Seite: /')
    expect(text).toContain('Gerät/Browser: Mozilla/5.0 (iPhone)')
    expect(text).toContain('Version: 4ab533f')
  })

  it('Zeilenumbrüche im Namen gelangen nicht in den Betreff (Header-Injection)', () => {
    const m = buildFeedbackMail({ ...base, senderName: 'Eve\r\nBcc: opfer@example.com' })
    expect(m.subject).not.toMatch(/[\r\n]/)
    expect(m.subject).toBe('[Whizzky] Fehler von Eve Bcc: opfer@example.com')
  })

  it('HTML bleibt reiner Text', () => {
    const { text } = buildFeedbackMail({ ...base, description: '<script>alert(1)</script> ok so' })
    expect(text).toContain('<script>alert(1)</script> ok so')
  })

  it('Emoji und Umlaute bleiben erhalten', () => {
    const m = buildFeedbackMail({ ...base, senderName: 'Jürgen 🥃', description: 'Größer bitte 🥃🥃' })
    expect(m.subject).toBe('[Whizzky] Fehler von Jürgen 🥃')
    expect(m.text).toContain('Größer bitte 🥃🥃')
  })

  it('fehlende Angaben → „unbekannt" / „lokal"', () => {
    const { text } = buildFeedbackMail({ ...base, fromPage: undefined, userAgent: null, commitSha: undefined })
    expect(text).toContain('Seite: unbekannt')
    expect(text).toContain('Gerät/Browser: unbekannt')
    expect(text).toContain('Version: lokal')
  })
})

describe('Hilfsfunktionen', () => {
  it('oneLine entfernt Steuerzeichen und kürzt', () => {
    expect(oneLine('a\nb\tc', 50)).toBe('a b c')
    expect(oneLine('x'.repeat(400), USER_AGENT_MAX)).toHaveLength(USER_AGENT_MAX)
  })

  it('sanitizeFromPage lässt nur App-Pfade zu', () => {
    expect(sanitizeFromPage('/tastings/123')).toBe('/tastings/123')
    expect(sanitizeFromPage('https://evil.example')).toBe('unbekannt')
    expect(sanitizeFromPage('//evil.example')).toBe('unbekannt')
    expect(sanitizeFromPage('')).toBe('unbekannt')
    expect(sanitizeFromPage('/' + 'a'.repeat(500)).length).toBeLessThanOrEqual(200)
  })

  it('formatVersion kürzt auf 7 Zeichen', () => {
    expect(formatVersion('abcdef1234')).toBe('abcdef1')
    expect(formatVersion('')).toBe('lokal')
  })
})
