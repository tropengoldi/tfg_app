import { FEEDBACK_KIND_LABEL, type FeedbackKind } from '@/lib/schemas/feedback'

export const USER_AGENT_MAX = 300
export const FROM_PAGE_MAX = 200

export interface FeedbackMailInput {
  kind: FeedbackKind
  description: string
  senderName: string
  senderEmail: string
  isTest: boolean
  /** Herkunftsseite, ungeprüft vom Browser. */
  fromPage?: string | null
  userAgent?: string | null
  /** z. B. Vercel-Commit-Kennung; fehlt lokal. */
  commitSha?: string | null
  now: Date
}

/** Entfernt Steuerzeichen (inkl. Zeilenumbrüche) und kürzt — für Einzeiler. */
export function oneLine(value: string | null | undefined, max: number): string {
  const cleaned = (value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

/** Herkunftsseite: nur ein App-Pfad (beginnt mit genau einem „/"), sonst „unbekannt". */
export function sanitizeFromPage(value: string | null | undefined): string {
  const v = oneLine(value, FROM_PAGE_MAX)
  if (!v.startsWith('/') || v.startsWith('//')) return 'unbekannt'
  return v
}

export function formatVersion(commitSha: string | null | undefined): string {
  const sha = oneLine(commitSha, 64)
  return sha ? sha.slice(0, 7) : 'lokal'
}

export function formatBerlinTime(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

/**
 * Baut Betreff und Klartext der Feedback-Mail (PROJ-30). Betreff entsteht nur
 * aus Art + bereinigtem Anzeigenamen — Nutzertext landet ausschließlich im
 * Mail-Inhalt (keine Header-Injection).
 */
export function buildFeedbackMail(input: FeedbackMailInput): { subject: string; text: string } {
  const label = FEEDBACK_KIND_LABEL[input.kind]
  const name = oneLine(input.senderName, 80) || 'Unbekannt'
  const subject = `[Whizzky] ${label} von ${name}${input.isTest ? ' (Testkonto)' : ''}`

  const text = [
    `${label} von ${name} <${oneLine(input.senderEmail, 254)}>`,
    '',
    input.description.trim(),
    '',
    '—',
    `Zeitpunkt: ${formatBerlinTime(input.now)}`,
    `Seite: ${sanitizeFromPage(input.fromPage)}`,
    `Gerät/Browser: ${oneLine(input.userAgent, USER_AGENT_MAX) || 'unbekannt'}`,
    `Version: ${formatVersion(input.commitSha)}`,
    ...(input.isTest ? ['Konto: Testkonto'] : []),
  ].join('\n')

  return { subject, text }
}
