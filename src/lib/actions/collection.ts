'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { messageForDbError } from '@/lib/errors'
import { collectionPhotoFolder, newPhotoPaths, PHOTO_BUCKET } from '@/lib/photos/paths'
import { collectionEntryFormSchema } from '@/lib/schemas/collection'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }
/** PROJ-28: beim Anlegen kommt die neue ID zurück, damit ein Foto folgen kann. */
export type AddEntryResult = { error: string } | { ok: true; entryId: string }

/** Herkunft eines über den PROJ-9-Übernehmen-Button angelegten Eintrags. Wird
 * nur beim Anlegen gesetzt und danach nie mehr geändert (auch nicht beim
 * Bearbeiten des Eintrags — siehe `updateCollectionEntryAction`). */
export interface CollectionOrigin {
  eventId: string
  eventDate: string
  /** PROJ-28: Whisky, dessen Foto als eigene Kopie übernommen wird. */
  whiskyId?: string
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
  options?: { copyPhoto?: boolean },
): Promise<AddEntryResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const n = normalize(input)
  if (!n.ok) return { error: n.error }

  const supabase = await createClient()
  const { data: created, error } = await supabase.from('collection_entries').insert({
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
  }).select('id').single()
  if (error || !created) {
    return { error: error ? messageForDbError(error) : 'Speichern fehlgeschlagen.' }
  }

  if (origin?.whiskyId && options?.copyPhoto !== false) {
    await copyTastingPhoto(supabase, session.userId, created.id, origin.whiskyId)
  }

  revalidatePath('/profil/sammlung')
  return { ok: true, entryId: created.id }
}

/**
 * PROJ-28: Foto des Tasting-Whiskys als eigene, unabhängige Kopie in die
 * Sammlung übernehmen. Läuft mit den Rechten des Nutzers: die Pfade kommen nur
 * heraus, wenn er die Details sehen darf (Tabellen-Regel), und der Bucket prüft
 * Lesen der Quelle und Schreiben ins eigene Sammlungs-Verzeichnis. Scheitert
 * etwas, bleibt der Eintrag einfach ohne Foto — kein Fehler für den Nutzer.
 */
async function copyTastingPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  entryId: string,
  whiskyId: string,
): Promise<void> {
  const { data: src } = await supabase
    .from('whisky_details')
    .select('photo_path, photo_thumb_path')
    .eq('whisky_id', whiskyId)
    .maybeSingle()
  if (!src?.photo_path || !src.photo_thumb_path) return

  const dest = newPhotoPaths(collectionPhotoFolder(profileId, entryId))
  const bucket = supabase.storage.from(PHOTO_BUCKET)
  try {
    const [a, b] = await Promise.all([
      bucket.copy(src.photo_path, dest.photoPath),
      bucket.copy(src.photo_thumb_path, dest.thumbPath),
    ])
    if (a.error || b.error) {
      await bucket.remove([dest.photoPath, dest.thumbPath])
      return
    }
    const { error } = await supabase
      .from('collection_entries')
      .update({ photo_path: dest.photoPath, photo_thumb_path: dest.thumbPath })
      .eq('id', entryId)
      .eq('profile_id', profileId)
    if (error) await bucket.remove([dest.photoPath, dest.thumbPath])
  } catch {
    /* Eintrag bleibt ohne Foto */
  }
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
    .select('id, photo_path, photo_thumb_path')
  if (error) return { error: messageForDbError(error) }
  if (!data || data.length === 0) {
    return { error: 'Der Eintrag wurde bereits gelöscht.' }
  }

  // PROJ-28: Fotos mitlöschen (der Bucket erlaubt das im eigenen Verzeichnis).
  const files = data
    .flatMap((r) => [r.photo_path, r.photo_thumb_path])
    .filter((p): p is string => Boolean(p))
  if (files.length > 0) {
    await supabase.storage.from(PHOTO_BUCKET).remove(files).catch(() => {})
  }

  revalidatePath('/profil/sammlung')
  return { ok: true }
}
