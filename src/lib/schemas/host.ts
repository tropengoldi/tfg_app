import { z } from 'zod'

/**
 * Eckdaten des Abends, die der Gastgeber pflegt (PROJ-6). Spiegelt die
 * DB-CHECKs aus PROJ-1: theme ≤ 200, food_info ≤ 1000, host_notes ≤ 2000.
 * Alle drei optional ('' = leer, wird serverseitig zu NULL).
 */
export const eckdatenSchema = z.object({
  theme: z.string().trim().max(200, 'Höchstens 200 Zeichen').default(''),
  foodInfo: z.string().trim().max(1000, 'Höchstens 1000 Zeichen').default(''),
  hostNotes: z.string().trim().max(2000, 'Höchstens 2000 Zeichen').default(''),
})

export type EckdatenInput = z.input<typeof eckdatenSchema>
export type EckdatenValues = z.output<typeof eckdatenSchema>
