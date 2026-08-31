/**
 * Datenbank-Fehlercodes → deutsche Meldungen.
 *
 * Die RPCs (supabase/migrations/*_rpcs.sql, *_error_codes_ts_prefix.sql) und der
 * ratings-Trigger werfen Fehler mit eigenen SQLSTATEs der Klasse 'TS'. PostgREST
 * reicht den Code als `error.code` durch.
 *
 * Wichtig: NICHT die Klasse 'PT' verwenden — PostgREST deutet SQLSTATE der Form
 * 'PT' + 3 Ziffern als HTTP-Statuscode (PT402 → HTTP 402), und ungültige Status
 * wie 001/002/004 lassen den API-Gateway mit „protocol error" abbrechen.
 *
 * Zusätzlich fangen wir ein paar Standard-Codes ab, die bei direkten
 * Tabellen-Schreibzugriffen auftreten können.
 */

export const DB_ERROR_MESSAGES: Record<string, string> = {
  // --- Custom SQLSTATEs der App (Klasse TS) --------------------------------
  TS001: 'Das Tasting ist abgeschlossen — Bewertungen lassen sich nicht mehr ändern.',
  TS002: 'Die Runde wurde bereits weitergeschaltet.',
  TS003: 'Dein Limit an Whiskies für dieses Tasting ist erreicht.',
  TS004: 'Dazu fehlt dir die Berechtigung.',
  TS005: 'Das geht nur, solange das Tasting in Vorbereitung ist.',
  TS006: 'Bereits ausgeschenkte Whiskies lassen sich nicht mehr umsortieren.',
  TS007: 'Der letzte Whisky ist im Glas — jetzt nur noch das Tasting abschließen.',
  TS008: 'Die Ausschankreihenfolge ist unvollständig oder hat Lücken.',
  TS009: 'Ein Teilnehmer mit eingetragenen Whiskies oder Bewertungen kann nicht entfernt werden.',
  TS010: 'Diese Aktion passt nicht zum aktuellen Zustand des Tastings.',
  TS011: 'Diese Aktion kannst du nicht auf dich selbst anwenden.',
  TS012: 'Es muss mindestens ein aktiver Admin übrig bleiben.',
  TS013: 'Diese Person ist Gastgeber eines noch nicht abgeschlossenen Tastings.',
  TS014: 'Nur aktive Teilnehmer können zum Admin gemacht werden.',
  TS015: 'An diesem Tasting hängen bereits Whiskies.',
  TS016: 'Für diesen Abend sind bereits 10 Whiskys eingetragen — mehr sind nicht vorgesehen.',
  TS017: 'Der Helfer kann nicht gleichzeitig Gastgeber oder Teilnehmer dieses Abends sein.',

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
 * Für die TS-Codes trägt die Datenbank bereits eine deutsche `message` — die
 * nehmen wir bevorzugt, damit RPC-spezifische Formulierungen erhalten bleiben.
 */
export function messageForDbError(error: unknown): string {
  if (!error || typeof error !== 'object') return FALLBACK

  const { code, message } = error as DbErrorLike

  if (code && code.startsWith('TS') && message) {
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
    (error as DbErrorLike).code === 'TS002'
  )
}
