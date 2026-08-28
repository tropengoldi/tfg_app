/**
 * Nimmt einen Wert aus einem `redirect`/`next`-Parameter an und gibt ihn nur
 * zurück, wenn er ein interner, pfad-relativer Link ist. Schutz gegen
 * Weiterleitung auf fremde Seiten (Open Redirect).
 */
export function safeInternalPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = '/',
): string {
  if (typeof value !== 'string') return fallback
  // Muss mit genau einem "/" beginnen; "//" und "/\" wären protokoll-relativ.
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  // Keine Steuerzeichen (Zeilenumbrüche etc.).
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return fallback
  }
  return value
}
