import { z } from 'zod'

import { todayISO } from '@/lib/dates'

export const eventFormSchema = z
  .object({
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum ist erforderlich'),
    location: z
      .string()
      .trim()
      .min(1, 'Ort ist erforderlich')
      .max(200, 'Höchstens 200 Zeichen'),
    hostId: z
      .string()
      .min(1, 'Gastgeber ist erforderlich')
      .uuid('Ungültige Auswahl'),
    participantIds: z.array(z.string().uuid()).default([]),
    // Als String im Formular; leer = kein Limit, sonst 1–10.
    maxWhiskies: z
      .string()
      .default('')
      .refine((v) => v === '' || /^\d+$/.test(v.trim()), 'Ganze Zahl oder leer')
      .refine(
        (v) => v === '' || (Number(v) >= 1 && Number(v) <= 10),
        'Zwischen 1 und 10',
      ),
    theme: z.string().trim().max(200, 'Höchstens 200 Zeichen').default(''),
  })
  .refine((d) => d.eventDate >= todayISO(), {
    message: 'Das Datum darf nicht in der Vergangenheit liegen',
    path: ['eventDate'],
  })

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventFormValues = z.output<typeof eventFormSchema>
