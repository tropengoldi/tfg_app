/**
 * Abgeleiteter Teilnehmer-Status (nicht gespeichert):
 *  - Deaktiviert : is_active = false
 *  - Eingeladen  : aktiv, aber noch nie angemeldet
 *  - Aktiv       : aktiv und schon mindestens einmal angemeldet
 */
export type MemberStatus = 'invited' | 'active' | 'deactivated'

export function memberStatus(m: {
  is_active: boolean
  has_signed_in: boolean
}): MemberStatus {
  if (!m.is_active) return 'deactivated'
  if (!m.has_signed_in) return 'invited'
  return 'active'
}

export const STATUS_LABEL: Record<MemberStatus, string> = {
  invited: 'Eingeladen',
  active: 'Aktiv',
  deactivated: 'Deaktiviert',
}
