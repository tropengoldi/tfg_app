import { z } from 'zod'

/**
 * Eingaberegeln für das Feedback-Formular (PROJ-30). Gleiche Regeln im
 * Browser (react-hook-form) und in der Server-Aktion.
 */
export const FEEDBACK_MIN = 10
export const FEEDBACK_MAX = 2000

export const FEEDBACK_KINDS = ['bug', 'wish', 'other'] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

export const FEEDBACK_KIND_LABEL: Record<FeedbackKind, string> = {
  bug: 'Fehler',
  wish: 'Wunsch',
  other: 'Sonstiges',
}

export const feedbackSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS, { message: 'Bitte wähle aus, worum es geht.' }),
  description: z
    .string({ message: 'Bitte beschreibe dein Anliegen.' })
    .trim()
    .min(FEEDBACK_MIN, `Bitte mindestens ${FEEDBACK_MIN} Zeichen.`)
    .max(FEEDBACK_MAX, `Höchstens ${FEEDBACK_MAX} Zeichen.`),
  /** Herkunftsseite (vom Link übergeben) — nur Info, wird gekürzt übernommen. */
  from: z.string().optional(),
})

export type FeedbackInput = z.input<typeof feedbackSchema>
