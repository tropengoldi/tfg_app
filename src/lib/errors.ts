/**
 * Datenbank-Fehlercodes → deutsche Meldungen.
 *
 * Die RPCs in supabase/migrations/20260827120400_rpcs.sql und der ratings-Trigger
 * werfen Fehler mit eigenen SQLSTATEs der Klasse 'PT'. PostgREST reicht den Code
 * als `error.code` durch. Zusätzlich fangen wir ein paar Standard-Codes ab, die
 * bei direkten Tabellen-Schreibzugriffen auftreten können.
 */

export const DB_ERROR_MESSAGES: Record<string, string> = {
  // --- Custom SQLSTATEs der App (Klasse PT) --------------------------------
  PT001: 'Das Tasting ist abgeschlossen — Bewertungen lassen sich nicht mehr ändern.',
  PT002: 'Die Runde wurde bereits weitergeschaltet.',
  PT003: 'Dein Limit an Whiskies für dieses Tasting ist erreicht.',
  PT004: 'Dazu fehlt dir die Berechtigung.',
  PT005: 'Das geht nur, solange das Tasting in Vorbereitung ist.',
  PT006: 'Bereits ausgeschenkte Whiskies lassen sich nicht mehr umsortieren.',
  PT007: 'Der letzte Whisky ist im Glas — jetzt nur noch das Tasting abschließen.',
  PT008: 'Die Ausschankreihenfolge ist unvollständig oder hat Lücken.',
  PT009: 'Ein Teilnehmer mit eingetragenen Whiskies oder Bewertungen kann nicht entfernt werden.',
  PT010: 'Diese Aktion passt nicht zum aktuellen Zustand des Tastings.',

  // --- Standard-PostgreSQL-Codes -----------------------------------------
  '23505': 'Dieser Eintrag existiert bereits.',
  '23514': 'Die Eingabe liegt außerhalb des erlaubten Bereichs.',
  '23503': 'Ein verknüpfter Datensatz fehlt oder wurde bereits entfernt.',
  '42501': 'Dazu fehlt dir die Berechtigung.',
  P0001: 'Die Aktion wurde von der Datenbank abgelehnt.',
}

const FALLBACK = 'Etwas ist schiefgelaufen. Bitte versuch es noch einmal.'

interface DbErrorLike {
  code?: string | null
  message?: string | null
  details?: string | null
  hint?: string | null
}

/**
 * Liefert eine anzeigbare deutsche Meldung für einen Supabase-/PostgREST-Fehler.
 * Für die PT-Codes trägt die Datenbank bereits eine deutsche `message` — die
 * nehmen wir bevorzugt, damit RPC-spezifische Formulierungen erhalten bleiben.
 */
export function messageForDbError(error: unknown): string {
  if (!error || typeof error !== 'object') return FALLBACK

  const { code, message } = error as DbErrorLike

  if (code && code.startsWith('PT') && message) {
    return message
  }
  if (code && DB_ERROR_MESSAGES[code]) {
    return DB_ERROR_MESSAGES[code]
  }
  if (message) return message

  return FALLBACK
}

/** True, wenn der Fehler ein „Runde bereits weitergeschaltet"-Konflikt ist. */
export function isStalePositionError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as DbErrorLike).code === 'PT002'
  )
}
