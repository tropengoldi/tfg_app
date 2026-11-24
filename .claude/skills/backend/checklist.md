# Backend Checklist

## Migration
- [ ] Neue Datei unter `supabase/migrations/`, `begin; … commit;`, Kopfkommentar mit Regeln und Fehlercodes
- [ ] RLS auf jeder neuen Tabelle; Direktschreibrechte entzogen; Policies nur für echte Direkt-Lesezugriffe
- [ ] RPCs: SECURITY DEFINER, `set search_path = ''`, prüfen Mitgliedschaft/Rolle/Zustand, `revoke … from public, anon`
- [ ] Neue Sichten mit Testkonten-Regel (PROJ-26)
- [ ] Fremdschlüssel bewusst (`cascade` vs. `restrict` → `scripts/delete-user.mjs`), Indizes, Nebenläufigkeit
- [ ] Fehlercodes `TS0xx` (nie `PT`), Text auch in `src/lib/errors.ts`

## App-Code
- [ ] Zod-Schema in `src/lib/schemas/`, reine Logik in `src/lib/*.ts`
- [ ] Server Action: Sitzung, Zod, `{ ok } | { error }`, `messageForDbError`, `revalidatePath`
- [ ] Neue Umgebungsvariablen in `.env.local.example`, Nutzer informiert (lokal + Vercel)

## Tests
- [ ] Unit-Tests für Schema und Logik grün (`npm test`)
- [ ] Integrationstest für jede Regel der Migration (nach `db:push`) grün
- [ ] Nach `db:types`: `npx tsc --noEmit` und `npm run lint` sauber

## Abschluss
- [ ] Spec-Abschnitt „Backend-Implementierung“, Status „In Progress“ in Spec und Index
- [ ] Commits lokal; Nutzer weiß, dass er erst nach `db:push` + Typen pushen darf
