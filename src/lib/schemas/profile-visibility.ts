import { z } from 'zod'

/** Die Sichtbarkeits-Schalter: sieben aus PROJ-14 plus „Sammlung sichtbar"
 * (PROJ-15). Anzeigename ist bewusst nicht dabei — er ist immer sichtbar
 * (Ranglisten/Teilnehmerlisten brauchen ihn). */
export const VISIBILITY_FIELDS = [
  'show_favorite_dram',
  'show_favorite_region',
  'show_bio',
  'show_tasting_count',
  'show_whisky_count',
  'show_best_placement',
  'show_avg_points',
  'show_collection',
] as const

export type VisibilityField = (typeof VISIBILITY_FIELDS)[number]

export const visibilityFieldSchema = z.enum(VISIBILITY_FIELDS)

export const updateVisibilitySchema = z.object({
  field: visibilityFieldSchema,
  value: z.boolean(),
})

export type UpdateVisibilityInput = z.infer<typeof updateVisibilitySchema>
