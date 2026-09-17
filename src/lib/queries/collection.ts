import { createClient } from '@/lib/supabase/server'

export interface CollectionEntry {
  id: string
  name: string
  distillery: string | null
  region: string | null
  ageLabel: string | null
  tastedOn: string | null
  valueNote: string | null
  rating: number | null
  notes: string | null
  owned: boolean
  /** Gesetzt nur, wenn der Eintrag über den Übernehmen-Button (PROJ-9)
   * entstand. `sourceEventId` kann später `null` werden (Event gelöscht),
   * `sourceEventDate` bleibt als unveränderlicher Snapshot erhalten. */
  sourceEventId: string | null
  sourceEventDate: string | null
  updatedAt: string
}

const COLUMNS =
  'id, name, distillery, region, age_label, tasted_on, value_note, rating, notes, owned, source_event_id, source_event_date, updated_at'

/**
 * Liest die Sammlungs-Einträge eines Mitglieds (PROJ-15) — derselbe Aufruf
 * bedient die eigene UND eine fremde Sammlung: RLS lässt die eigenen Zeilen
 * immer durch, fremde nur wenn `profiles.show_collection` bei der
 * Zielperson an ist. Ob eine fremde, leere Antwort „nicht sichtbar" oder
 * „sichtbar, aber leer" bedeutet, klärt der Aufrufer vorher separat über
 * `profiles.show_collection` (siehe `getPublicProfile`).
 */
export async function getCollectionEntries(profileId: string): Promise<CollectionEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collection_entries')
    .select(COLUMNS)
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    distillery: r.distillery,
    region: r.region,
    ageLabel: r.age_label,
    tastedOn: r.tasted_on,
    valueNote: r.value_note,
    rating: r.rating,
    notes: r.notes,
    owned: r.owned,
    sourceEventId: r.source_event_id,
    sourceEventDate: r.source_event_date,
    updatedAt: r.updated_at,
  }))
}
