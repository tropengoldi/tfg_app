import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

/** Heutiges Datum als `yyyy-MM-dd` in lokaler Zeit. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** `yyyy-MM-dd` → z. B. „Fr, 4. Sep 2026". */
export function formatEventDate(iso: string): string {
  try {
    return format(parseISO(iso), 'EEE, d. MMM yyyy', { locale: de })
  } catch {
    return iso
  }
}

/** `Date` → `yyyy-MM-dd` (lokale Zeit, ohne UTC-Verschiebung). */
export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}
