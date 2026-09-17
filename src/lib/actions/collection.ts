'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { collectionEntryFormSchema } from '@/lib/schemas/collection'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/** Herkunft eines über den PROJ-9-Übernehmen-Button angelegten Eintrags. Wird
 * nur beim Anlegen gesetzt und danach nie mehr geändert (auch nicht beim
 * Bearbeiten des Eintrags — siehe `updateCollectionEntryAction`). */
export interface CollectionOrigin {
  eventId: string
  eventDate: string
}

interface Fields {
  name: string
  distillery: string | null
  region: string | null
  ageLabel: string | null
  tastedOn: string | null
  valueNote: string | null
  rating: number | null
  notes: string | null
  owned: boolean
}

type Normalized = { ok: true; data: Fields } | { ok: false; error: string }

function normalize(input: unknown): Normalized {
  const parsed = collectionEntryFormSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const d = parsed.data
  return {
    ok: true,
    data: {
      name: d.name,
      distillery: d.distillery === '' ? null : d.distillery,
      region: d.region === '' ? null : d.region,
      ageLabel: d.ageLabel === '' ? null : d.ageLabel,
      tastedOn: d.tastedOn === '' ? null : d.tastedOn,
      valueNote: d.valueNote === '' ? null : d.valueNote,
      rating: d.rating === '' ? null : Number(d.rating),
      notes: d.notes === '' ? null : d.notes,
      owned: d.owned,
    },
  }
}

/**
 * Neuen Sammlungs-Eintrag anlegen. `origin` kommt ausschließlich vom
 * „Zur Sammlung hinzufügen"-Button auf der PROJ-9-Ergebnisseite und setzt das
 * nicht editierbare Herkunftsfeld; ein manuell angelegter Eintrag lässt es weg.
 */
export async function addCollectionEntryAction(
  input: unknown,
  origin?: CollectionOrigin,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { error } = await supabase.from('collection_entries').insert({
    profile_id: session.userId,
    name: n.data.name,
    distillery: n.data.distillery,
    region: n.data.region,
    age_label: n.data.ageLabel,
    tasted_on: n.data.tastedOn,
    value_note: n.data.valueNote,
    rating: n.data.rating,
    notes: n.data.notes,
    owned: n.data.owned,
    source_event_id: origin?.eventId ?? null,
    source_event_date: origin?.eventDate ?? null,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath('/profil/sammlung')
  return { ok: true }
}

/**
 * Einen eigenen Sammlungs-Eintrag ändern. Das Herkunftsfeld ist bewusst nicht
 * Teil des Formulars/Payloads — es bleibt beim Bearbeiten unverändert stehen.
 */
export async function updateCollectionEntryAction(
  entryId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collection_entries')
    .update({
      name: n.data.name,
      distillery: n.data.distillery,
      region: n.data.region,
      age_label: n.data.ageLabel,
      tasted_on: n.data.tastedOn,
      value_note: n.data.valueNote,
      rating: n.data.rating,
      notes: n.data.notes,
      owned: n.data.owned,
    })
    .eq('id', entryId)
    .eq('profile_id', session.userId)
    .select('id')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return { error: 'Der Eintrag wurde bereits gelöscht oder gehört dir nicht mehr.' }
  }

  revalidatePath('/profil/sammlung')
  return { ok: true }
}

/** Einen eigenen Sammlungs-Eintrag endgültig löschen (Hard-Delete). */
export async function deleteCollectionEntryAction(entryId: string): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collection_entries')
    .delete()
    .eq('id', entryId)
    .eq('profile_id', session.userId)
    .select('id')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return { error: 'Der Eintrag wurde bereits gelöscht.' }
  }

  revalidatePath('/profil/sammlung')
  return { ok: true }
}
