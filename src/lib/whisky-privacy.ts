/**
 * Wer sieht die Whisky-Angaben vor dem Abschluss außer dem Bringer? (Hinweistexte
 * auf „Meine Whiskys", PROJ-5 / PROJ-11 / PROJ-21.) Spiegelt die Leseregel
 * `wd_select`: Mit Whisky-Steward sieht er alles, der Gastgeber nur Eigenes;
 * ohne Steward sieht der Gastgeber alles.
 */
export function whoElseSeesWhiskies({
  isSteward,
  hasSteward,
}: {
  isSteward: boolean
  hasSteward: boolean
}): string {
  if (isSteward) return 'niemand'
  return hasSteward ? 'nur der Whisky-Steward' : 'nur der Gastgeber'
}
