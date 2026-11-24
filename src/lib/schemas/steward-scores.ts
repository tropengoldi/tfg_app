import { z } from 'zod'

/**
 * Eingaberegeln für die Steward-Note (PROJ-29): 0–10 in Halbschritten,
 * Kommentar optional (≤ 500 Zeichen, '' = kein Kommentar). Ob das Tasting nur
 * ganze Punkte erlaubt, prüft die DB-Funktion `set_steward_score` (TS028).
 */
export const STEWARD_COMMENT_MAX = 500

export const stewardScoreSchema = z.object({
  eventId: z.string().uuid('Ungültiges Tasting'),
  score: z
    .number({ message: 'Bitte eine Note wählen.' })
    .min(0, 'Die Note muss zwischen 0 und 10 liegen.')
    .max(10, 'Die Note muss zwischen 0 und 10 liegen.')
    .refine((v) => Number.isInteger(v * 2), 'Nur ganze oder halbe Punkte.'),
  comment: z
    .string()
    .trim()
    .max(STEWARD_COMMENT_MAX, `Höchstens ${STEWARD_COMMENT_MAX} Zeichen.`)
    .default(''),
})

export type StewardScoreInput = z.input<typeof stewardScoreSchema>

export const stewardScoreEventSchema = z.object({
  eventId: z.string().uuid('Ungültiges Tasting'),
})
