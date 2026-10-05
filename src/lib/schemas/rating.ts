import { z } from 'zod'

/**
 * Eingaberegeln für eine Bewertung (PROJ-7, PROJ-19). Spiegelt die DB-CHECKs:
 * nose_points 0–5, taste_points 0–10, jeweils Vielfache von 0,5 (beide Pflicht),
 * notes ≤ 2000 ('' = leer, wird serverseitig zu NULL).
 * Ob halbe Punkte im jeweiligen Tasting erlaubt sind (rating_step), prüft der
 * DB-Trigger `ratings_step` (TS021) — das Formular lässt ohnehin nur passende
 * Werte zu.
 */
export const ratingFormSchema = z.object({
  nose: z
    .number()
    .min(0, 'Nasenpunkte liegen zwischen 0 und 5')
    .max(5, 'Nasenpunkte liegen zwischen 0 und 5')
    .multipleOf(0.5, 'Nur ganze oder halbe Punkte'),
  taste: z
    .number()
    .min(0, 'Gaumenpunkte liegen zwischen 0 und 10')
    .max(10, 'Gaumenpunkte liegen zwischen 0 und 10')
    .multipleOf(0.5, 'Nur ganze oder halbe Punkte'),
  notes: z.string().trim().max(2000, 'Höchstens 2000 Zeichen').default(''),
})

export type RatingFormInput = z.input<typeof ratingFormSchema>
export type RatingFormValues = z.output<typeof ratingFormSchema>
