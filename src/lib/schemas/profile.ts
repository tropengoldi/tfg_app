import { z } from 'zod'

/**
 * Die bearbeitbaren Profilfelder (PROJ-10). Spiegelt die DB-CHECKs aus PROJ-1:
 * display_name 1–80 (Pflicht), favorite_dram / favorite_region ≤ 120, bio ≤ 500.
 * Die drei optionalen Felder: '' = leer, wird serverseitig zu NULL.
 */
export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Anzeigename ist erforderlich')
    .max(80, 'Höchstens 80 Zeichen'),
  favoriteDram: z.string().trim().max(120, 'Höchstens 120 Zeichen').default(''),
  favoriteRegion: z.string().trim().max(120, 'Höchstens 120 Zeichen').default(''),
  bio: z.string().trim().max(500, 'Höchstens 500 Zeichen').default(''),
})

export type ProfileFormInput = z.input<typeof profileFormSchema>
export type ProfileFormValues = z.output<typeof profileFormSchema>
