---
name: backend
description: Build the backend of a feature — Supabase migration (tables, RLS, SECURITY DEFINER RPCs, views), Server Actions, Zod schemas, integration tests. Use after /architecture, before /frontend.
argument-hint: "PROJ-X"
user-invocable: true
---

# Backend Developer

## Role
Du setzt das Tech Design einer Spec im Backend um: Datenbank-Migration, Server Actions, Lesezugriffe, Tests. Die
verbindlichen Muster stehen in `.claude/rules/backend.md` und `.claude/rules/security.md`; dieser Skill beschreibt
den Ablauf.

## Vorbereitung
1. `features/INDEX.md` und die Spec lesen (inkl. Tech Design und offener Fragen).
2. Bestehende Muster ansehen: die letzte ähnliche Migration unter `supabase/migrations/`, passende Actions in
   `src/lib/actions/`, Schemas in `src/lib/schemas/`, die nächste freie Fehlernummer in `src/lib/errors.ts`.
3. Offene technische Fragen (Rechte, Nebenläufigkeit, Limits) mit `AskUserQuestion` klären, wenn das Tech Design sie
   nicht beantwortet.

## Ablauf
1. **Migration** `supabase/migrations/<timestamp>_<name>.sql` schreiben (RLS, entzogene Direktrechte, RPCs mit
   Prüfungen und TS-Fehlercodes, Sichten mit Testkonten-Regel, Indizes).
2. **App-Code:** Zod-Schema, reine Logik in `src/lib/*.ts`, Server Action, ggf. Query; neue Fehlercodes in
   `src/lib/errors.ts`; neue Umgebungsvariablen in `.env.local.example`.
3. **Tests:** Unit-Tests für Schema und reine Logik (`npm test`); Integrationstest
   `src/lib/supabase/__tests__/<feature>.integration.test.ts` für jede Regel der Migration.
4. **Commit** lokal: `feat(PROJ-X): Implement backend for <feature>`. `tsc` scheitert an dieser Stelle erwartbar an
   den noch fehlenden Typen; der Nutzer darf noch nicht pushen.
5. **Übergabe an den Nutzer:** Er führt `npm run db:push` aus (und setzt ggf. neue Umgebungsvariablen lokal und bei
   Vercel).
6. **Nach seiner Rückmeldung:** `npm run db:types`, `npx tsc --noEmit`, den neuen Integrationstest
   (`npx vitest run -c vitest.integration.config.ts <datei>`) laufen lassen; Ergebnis in der Spec festhalten,
   committen (`docs(PROJ-X): Record migration applied, regenerate types …`).

## Nach Abschluss
- [checklist.md](checklist.md) durchgehen.
- Spec: Abschnitt „Backend-Implementierung“ (Migration, Funktionen, Code, Tests, Abweichungen), Status
  „In Progress“; Index gleichziehen.
- Dem Nutzer kurz zeigen, was gebaut ist und was er tun muss; dann: „Als Nächstes `/frontend PROJ-X`“.

## Kontext wiederherstellen
Spec und Index neu lesen, `git log --oneline -5` und `git status` prüfen, ob Migration/Commit schon da sind, und an
der richtigen Stelle des Ablaufs weitermachen.
