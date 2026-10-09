import { z } from 'zod'

const position = z
  .number()
  .int('Ungültige Whisky-Nummer')
  .min(1, 'Ungültige Whisky-Nummer')
  .max(10, 'Ungültige Whisky-Nummer')

/** Eingaberegeln für einen Vergleichs-Merker (PROJ-23). */
export const compareMarkSchema = z
  .object({
    eventId: z.string().uuid('Ungültiges Tasting'),
    from: position,
    to: position,
  })
  .refine((v) => v.from !== v.to, { message: 'Ungültige Whisky-Nummer', path: ['to'] })

export type CompareMarkInput = z.input<typeof compareMarkSchema>
