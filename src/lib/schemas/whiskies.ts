import { z } from 'zod'

/**
 * Eingaberegeln für das „Whisky eintragen / bearbeiten"-Formular (PROJ-5).
 * Spiegelt die DB-CHECKs aus PROJ-1: name 1–200, video_url `^https?://.+`,
 * owner_notes ≤ 2000. Video-Link und Notiz sind optionale Strings ('' = leer).
 */
export const whiskyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name ist erforderlich')
    .max(200, 'Höchstens 200 Zeichen'),
  videoUrl: z
    .string()
    .trim()
    .max(2048, 'Höchstens 2048 Zeichen')
    .default('')
    .refine(
      (v) => v === '' || /^https?:\/\/.+/i.test(v),
      'Bitte eine vollständige Adresse mit http:// oder https://',
    ),
  ownerNotes: z
    .string()
    .trim()
    .max(2000, 'Höchstens 2000 Zeichen')
    .default(''),
})

export type WhiskyFormInput = z.input<typeof whiskyFormSchema>
export type WhiskyFormValues = z.output<typeof whiskyFormSchema>
