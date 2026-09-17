import { z } from 'zod'

/**
 * Eingaberegeln für das „Sammlungs-Eintrag anlegen/bearbeiten"-Formular
 * (PROJ-15). Zeichenlimits angelehnt an bestehende Muster: Name wie
 * PROJ-5-Whiskynamen (1–200), Destillerie/Region wie PROJ-10 (≤120), Notizen
 * wie PROJ-5-Notizen (≤2000). Alle Felder außer Name sind optional
 * ('' = nicht gesetzt).
 */
export const collectionEntryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name ist erforderlich')
    .max(200, 'Höchstens 200 Zeichen'),
  distillery: z.string().trim().max(120, 'Höchstens 120 Zeichen').default(''),
  region: z.string().trim().max(120, 'Höchstens 120 Zeichen').default(''),
  ageLabel: z.string().trim().max(50, 'Höchstens 50 Zeichen').default(''),
  // Als String im Formular (Kalender-Auswahl); '' = kein Datum.
  tastedOn: z
    .string()
    .trim()
    .default('')
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Ungültiges Datum'),
  valueNote: z.string().trim().max(200, 'Höchstens 200 Zeichen').default(''),
  // Als String im Formular (Select); '' = keine Bewertung, sonst 1–10.
  rating: z
    .string()
    .trim()
    .default('')
    .refine((v) => v === '' || /^(10|[1-9])$/.test(v), 'Zwischen 1 und 10'),
  notes: z.string().trim().max(2000, 'Höchstens 2000 Zeichen').default(''),
  owned: z.boolean().default(false),
})

export type CollectionEntryFormInput = z.input<typeof collectionEntryFormSchema>
export type CollectionEntryFormValues = z.output<typeof collectionEntryFormSchema>
