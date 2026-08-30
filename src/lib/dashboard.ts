/**
 * Reine Ableitungslogik fürs Dashboard (PROJ-8). Kein React, testbar.
 */

import type { EventStatus } from '@/lib/supabase/aliases'

export type GlassState = 'tasted' | 'current' | 'pending'

/**
 * Zustand jedes Glases im Streifen:
 *   vor der aktuellen Position → leer (verkostet)
 *   aktuelle Position          → hervorgehoben
 *   danach                     → voll (ausstehend)
 * Im Draft sind alle voll, nach dem Abschluss alle leer.
 */
export function glassStates(
  total: number,
  currentPosition: number,
  status: EventStatus,
): GlassState[] {
  return Array.from({ length: Math.max(0, total) }, (_, i) => {
    const pos = i + 1
    if (status === 'closed') return 'tasted'
    if (status === 'draft') return 'pending'
    if (pos < currentPosition) return 'tasted'
    if (pos === currentPosition) return 'current'
    return 'pending'
  })
}

/** „Whisky k von N" bzw. die passende Variante je Status. */
export function progressLabel(
  total: number,
  currentPosition: number,
  status: EventStatus,
): string {
  if (status === 'draft') return `Whisky 0 von ${total}`
  if (status === 'closed') return `${total} von ${total} verkostet`
  const k = Math.max(0, Math.min(currentPosition, total))
  return `Whisky ${k} von ${total}`
}

/** Kanalname für ein Event — muss auf allen Seiten identisch gebildet werden. */
export function eventChannelName(eventId: string): string {
  return `event:${eventId}`
}

/** Darf der Nutzer gerade bewerten (→ „Jetzt bewerten"-Absprung)? */
export function canRateNow(status: EventStatus, isParticipant: boolean): boolean {
  return status === 'active' && isParticipant
}
