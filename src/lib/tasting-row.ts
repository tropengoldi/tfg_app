/**
 * Ziele einer Zeile unter „Meine Tastings" (PROJ-5 / PROJ-11 / PROJ-21) —
 * wohin die Zeile selbst führt und welche Zusatz-Aktionen daneben stehen.
 * Kein React-Bezug; die Icons ordnet die Komponente über `kind` zu.
 */
import type { EventStatus } from '@/lib/supabase/aliases'

export interface TastingRowRoles {
  id: string
  status: EventStatus
  is_host: boolean
  is_helper: boolean
  has_helper: boolean
}

export type RowActionKind = 'whiskies' | 'control' | 'basics'

export interface RowAction {
  kind: RowActionKind
  href: string
  label: string
}

export interface RowTargets {
  primaryHref: string
  secondary: RowAction[]
}

export function tastingRowTargets(row: TastingRowRoles): RowTargets {
  const running = row.status === 'active'
  const base = `/tastings/${row.id}`
  // Steuern darf: der Steward, oder der Gastgeber solange kein Steward benannt ist
  // (mit Steward verkostet der Gastgeber blind mit — PROJ-11).
  const canControl = row.is_helper || (row.is_host && !row.has_helper)

  // Der Steward verkostet nicht mit — seine Startseite ist der Steuern-Bereich.
  const primaryHref = row.is_helper
    ? `${base}/gastgeber`
    : running
      ? `${base}/bewerten`
      : `${base}/whiskies`

  const secondary: RowAction[] = []
  if (running && !row.is_helper) {
    secondary.push({ kind: 'whiskies', href: `${base}/whiskies`, label: 'Whiskys' })
  }
  // PROJ-21: Der Steward darf vor dem Start eigene Whiskies eintragen.
  if (row.is_helper && row.status === 'draft') {
    secondary.push({ kind: 'whiskies', href: `${base}/whiskies`, label: 'Meine Whiskys' })
  }
  if (canControl) {
    secondary.push({ kind: 'control', href: `${base}/gastgeber`, label: 'Steuern' })
  }
  // Gastgeber-mit-Steward: steuert nicht, pflegt aber weiter die Eckdaten
  // (Thema / Essen / Anmerkungen) — PROJ-11-Verfeinerung.
  if (row.is_host && row.has_helper && !row.is_helper) {
    secondary.push({ kind: 'basics', href: `${base}/gastgeber`, label: 'Eckdaten' })
  }
  return { primaryHref, secondary }
}
