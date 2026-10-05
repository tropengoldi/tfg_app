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
  // PROJ-25: optionale Kennzahlen, als String im Formular ('' = keine Angabe).
  // Komma und Punkt sind erlaubt („46,3" / „46.3").
  abv: z
    .string()
    .trim()
    .default('')
    .refine(
      (v) => v === '' || (/^\d{1,3}([.,]\d)?$/.test(v) && toNumber(v)! <= 100),
      'Alkohol zwischen 0 und 100 %, höchstens eine Nachkommastelle',
    ),
  ageYears: z
    .string()
    .trim()
    .default('')
    .refine(
      (v) => v === '' || (/^\d{1,3}$/.test(v) && Number(v) <= 100),
      'Alter in ganzen Jahren zwischen 0 und 100',
    ),
  price: z
    .string()
    .trim()
    .default('')
    .refine(
      (v) => v === '' || (/^\d{1,6}([.,]\d{1,2})?$/.test(v)),
      'Preis in Euro, höchstens zwei Nachkommastellen',
    ),
})

/** „46,3" / „46.3" → 46.3; '' → null. */
export function toNumber(value: string): number | null {
  const v = value.trim()
  if (v === '') return null
  return Number(v.replace(',', '.'))
}

export type WhiskyFormInput = z.input<typeof whiskyFormSchema>
export type WhiskyFormValues = z.output<typeof whiskyFormSchema>
