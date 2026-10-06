/**
 * Reine Ableitungen rund um Testkonten (PROJ-26). Die Unsichtbarkeit selbst
 * erzwingt die Datenbank; hier nur Anzeige-Logik.
 */

export interface TestFlagged {
  id: string
  is_test?: boolean
}

export type TastingMix = 'real' | 'test' | 'mixed'

/**
 * Wie setzt sich ein Tasting zusammen? `mixed` = echte Mitglieder UND
 * mindestens ein Testkonto → wird für die Runde unsichtbar (Warnung).
 */
export function tastingMix(members: TestFlagged[], involvedIds: string[]): TastingMix {
  const byId = new Map(members.map((m) => [m.id, Boolean(m.is_test)]))
  const flags = [...new Set(involvedIds.filter(Boolean))]
    .filter((id) => byId.has(id))
    .map((id) => byId.get(id)!)
  const hasTest = flags.some(Boolean)
  const hasReal = flags.some((f) => !f)
  if (hasTest && hasReal) return 'mixed'
  return hasTest ? 'test' : 'real'
}

/** Text der Rückfrage beim Markieren / Entfernen der Markierung. */
export function testToggleDescription(name: string, makeTest: boolean, affected: number): string {
  if (makeTest) {
    const head = `${name} ist danach für normale Mitglieder unsichtbar.`
    if (affected === 0) return head
    return `${head} ${affected === 1 ? '1 Tasting wird' : `${affected} Tastings werden`} für die Runde ausgeblendet.`
  }
  const head = `${name} ist danach wieder für alle sichtbar.`
  if (affected === 0) return head
  return `${head} ${affected === 1 ? '1 Tasting wird' : `${affected} Tastings werden`} für die Runde sichtbar.`
}

/**
 * Bilanz-Regel: Die Bilanz eines echten Kontos enthält keine Test-Tastings —
 * auch nicht, wenn der Betrachter (Admin) sie sehen darf. Ein Testkonto zählt sie.
 */
export function countsForBalance(eventIsTest: boolean | null | undefined, ownerIsTest: boolean): boolean {
  return ownerIsTest || !eventIsTest
}
