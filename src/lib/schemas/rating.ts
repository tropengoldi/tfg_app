import { z } from 'zod'

/**
 * Eingaberegeln für eine Bewertung (PROJ-7). Spiegelt die DB-CHECKs aus PROJ-1:
 * nose_points 1–5, taste_points 1–10 (beide Pflicht, ganze Zahlen),
 * notes ≤ 2000 ('' = leer, wird serverseitig zu NULL).
 */
export const ratingFormSchema = z.object({
  nose: z
    .number()
    .int('Nur ganze Zahlen')
    .min(1, 'Nase liegt zwischen 1 und 5')
    .max(5, 'Nase liegt zwischen 1 und 5'),
  taste: z
    .number()
    .int('Nur ganze Zahlen')
    .min(1, 'Geschmack liegt zwischen 1 und 10')
    .max(10, 'Geschmack liegt zwischen 1 und 10'),
  notes: z.string().trim().max(2000, 'Höchstens 2000 Zeichen').default(''),
})

export type RatingFormInput = z.input<typeof ratingFormSchema>
export type RatingFormValues = z.output<typeof ratingFormSchema>
