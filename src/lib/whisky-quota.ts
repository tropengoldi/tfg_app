/**
 * Kontingent-Berechnung für die Whisky-Erfassung (PROJ-5).
 *
 * Spiegelt die Server-Regel aus PROJ-1 (`add_whisky`):
 *   - `limit` = `max_whiskies_per_participant` des Events (null = keine Begrenzung)
 *   - der Gastgeber darf einen mehr (Bonus)
 *   - pro Abend sind höchstens `EVENT_WHISKY_CAP` Whiskys vorgesehen
 *
 * Die Anzeige ist nie die einzige Schranke — die Datenbank weist ein Überschreiten
 * in jedem Fall ab. Diese Funktion steuert nur Hinweistext und Button-Zustand.
 */

export const EVENT_WHISKY_CAP = 10

export interface QuotaInput {
  /** Limit des Abends, `null` = keine Begrenzung. */
  limit: number | null
  /** Ist der aktuelle Nutzer der Gastgeber dieses Abends? */
  isHost: boolean
  /** Wie viele Whiskys hat der Nutzer für diesen Abend schon eingetragen? */
  ownCount: number
  /** Wie viele Whiskys hat der Abend insgesamt schon? */
  eventWhiskyCount: number
}

export interface Quota {
  /** Persönliches Maximum inkl. Gastgeber-Bonus, oder `null` bei „keine Begrenzung". */
  max: number | null
  /** Schon eingetragene eigene Whiskys. */
  used: number
  /** Darf der Nutzer gerade einen weiteren hinzufügen? */
  canAdd: boolean
  /** Hat der Nutzer sein persönliches Limit erreicht? */
  atPersonalLimit: boolean
  /** Ist die Obergrenze des Abends (10) erreicht? */
  atEventCap: boolean
  /** Bekommt der Nutzer den Gastgeber-Bonus (Gastgeber + es gibt ein Limit)? */
  hasHostBonus: boolean
  /** Fertiger Hinweistext für über der Liste. */
  hint: string
}

function whiskyWord(n: number): string {
  return n === 1 ? 'Whisky' : 'Whiskys'
}

export function computeQuota({
  limit,
  isHost,
  ownCount,
  eventWhiskyCount,
}: QuotaInput): Quota {
  const atEventCap = eventWhiskyCount >= EVENT_WHISKY_CAP
  const hasHostBonus = isHost && limit !== null
  const max = limit === null ? null : limit + (isHost ? 1 : 0)

  const atPersonalLimit = max !== null && ownCount >= max
  const canAdd = !atEventCap && !atPersonalLimit

  let hint: string
  if (atEventCap) {
    hint = `Für diesen Abend sind bereits ${EVENT_WHISKY_CAP} Whiskys eingetragen — mehr sind nicht vorgesehen.`
  } else if (max === null) {
    hint = 'Keine Begrenzung für diesen Abend — trag ein, was du mitbringst.'
  } else if (atPersonalLimit) {
    hint = `Dein Limit für diesen Abend ist erreicht (${max} ${whiskyWord(max)}). Entferne einen, um zu tauschen.`
  } else {
    const left = max - ownCount
    hint = `Du kannst noch ${left} von ${max} ${whiskyWord(max)} eintragen.`
    if (hasHostBonus) hint += ' Als Gastgeber hast du einen Bonus-Whisky.'
  }

  return { max, used: ownCount, canAdd, atPersonalLimit, atEventCap, hasHostBonus, hint }
}
