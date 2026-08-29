/**
 * Reine Hilfslogik für die Ausschankreihenfolge (PROJ-6). Kein React, testbar.
 * Die Liste ist ein Array von Whisky-IDs in Wunschreihenfolge (Index 0 = Position 1).
 */

/** Tauscht das Element an `index` mit dem darüber. Kein Effekt bei `index <= 0`. */
export function moveUp<T>(list: T[], index: number): T[] {
  if (index <= 0 || index >= list.length) return list.slice()
  const next = list.slice()
  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  return next
}

/** Tauscht das Element an `index` mit dem darunter. Kein Effekt am Listenende. */
export function moveDown<T>(list: T[], index: number): T[] {
  if (index < 0 || index >= list.length - 1) return list.slice()
  const next = list.slice()
  ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
  return next
}

/** Fisher-Yates. `rng` injizierbar für Tests. Gibt immer eine Permutation zurück. */
export function shuffle<T>(list: T[], rng: () => number = Math.random): T[] {
  const next = list.slice()
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** True, wenn beide Listen dieselben Elemente in derselben Reihenfolge haben. */
export function sameOrder<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((x, i) => x === b[i])
}

/** Beschriftung der „Weiter"-Aktion in der Lauf-Ansicht. */
export function nextRoundLabel(currentPosition: number, total: number): string {
  return `Weiter zu Whisky ${currentPosition + 1} von ${total}`
}

/** True, wenn der aktuell aktive Whisky der letzte des Abends ist. */
export function isLastWhisky(currentPosition: number, total: number): boolean {
  return currentPosition >= total
}
