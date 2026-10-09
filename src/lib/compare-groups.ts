/**
 * Vergleichs-Merker (PROJ-23): private Vergleichsgruppen eines Mitverkosters.
 * Dieselben Regeln wie die DB-Funktion `toggle_compare_mark` — hier für die
 * sofortige Anzeige beim Tippen; maßgeblich bleibt die Datenbank.
 * Kein DB-, kein React-Bezug.
 */

export interface CompareMark {
  /** Ausschank-Nummer des Whiskys. */
  position: number
  /** Gruppennummer; gleiche Nummer = gleiche Gruppe. */
  group: number
}

/** Die anderen Whiskies in der Gruppe von `position` (aufsteigend), sonst leer. */
export function groupMates(marks: CompareMark[], position: number): number[] {
  const own = marks.find((m) => m.position === position)
  if (!own) return []
  return marks
    .filter((m) => m.group === own.group && m.position !== position)
    .map((m) => m.position)
    .sort((a, b) => a - b)
}

/**
 * Antippen von `to` beim Whisky `from`:
 *   - beide in derselben Gruppe → `to` verlässt sie; bleibt einer übrig, ist die Gruppe weg
 *   - sonst → zusammenführen (Gruppe von `from` übernimmt, sonst die von `to`, sonst neu)
 */
export function toggleCompare(marks: CompareMark[], from: number, to: number): CompareMark[] {
  if (from === to) return marks
  const gf = marks.find((m) => m.position === from)?.group
  const gt = marks.find((m) => m.position === to)?.group

  if (gf !== undefined && gf === gt) {
    const rest = marks.filter((m) => m.position !== to)
    const left = rest.filter((m) => m.group === gf)
    return left.length < 2 ? rest.filter((m) => m.group !== gf) : rest
  }

  const target = gf ?? gt ?? Math.max(0, ...marks.map((m) => m.group)) + 1
  const merged = marks.map((m) => (gt !== undefined && m.group === gt ? { ...m, group: target } : m))
  for (const p of [from, to]) {
    if (!merged.some((m) => m.position === p)) merged.push({ position: p, group: target })
  }
  return merged
}

/** „In Gruppe mit 5“, „In Gruppe mit 5 und 7“, „In Gruppe mit 2, 5 und 7“. */
export function groupLabel(mates: number[]): string {
  if (mates.length === 0) return ''
  if (mates.length === 1) return `In Gruppe mit ${mates[0]}`
  return `In Gruppe mit ${mates.slice(0, -1).join(', ')} und ${mates[mates.length - 1]}`
}
