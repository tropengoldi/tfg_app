import { z } from 'zod'

/** Eingaberegeln für den Sieger-Tipp (PROJ-22): Ausschank-Nummer 1–10. */
export const winnerTipSchema = z.object({
  eventId: z.string().uuid('Ungültiges Tasting'),
  position: z
    .number()
    .int('Ungültige Whisky-Nummer')
    .min(1, 'Ungültige Whisky-Nummer')
    .max(10, 'Ungültige Whisky-Nummer'),
})

export type WinnerTipInput = z.input<typeof winnerTipSchema>
