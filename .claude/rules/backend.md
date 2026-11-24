---
paths:
  - "supabase/**"
  - "src/lib/actions/**"
  - "src/lib/queries/**"
  - "src/lib/supabase/**"
  - "src/lib/email/**"
  - "scripts/**"
---

# Backend Rules (Supabase + Server Actions)

## Migrationen
- Neue Datei `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`, in `begin; … commit;`, Kopfkommentar mit Zweck,
  Regeln und neuen Fehlercodes. Bestehende Migrationen nie ändern.
- RLS auf jeder neuen Tabelle. Direkte Schreibrechte für `anon`/`authenticated` entziehen; geschrieben wird über
  SECURITY-DEFINER-Funktionen mit `set search_path = ''`, die Mitgliedschaft (`is_active_member()`), Rolle und
  Zustand prüfen. `revoke execute … from public, anon` und gezielt `grant … to authenticated`.
- Policies nur für die Lesezugriffe, die wirklich direkt passieren; Archiv-/Ergebnisdaten über Sichten.
- Testkonten-Regel (PROJ-26) in jeder neuen Sicht bzw. Abfrage auf Mitglieder/Tastings mitdenken.
- Fremdschlüssel bewusst wählen: `on delete cascade` für abhängige Daten, `restrict` für Historie
  (dann `scripts/delete-user.mjs` mitziehen).
- Indizes für Spalten in WHERE/ORDER BY/JOIN; Nebenläufigkeit über Zeilensperren oder Advisory-Locks absichern.
- Fehler: `raise exception '<deutscher Text>' using errcode = 'TS0xx'` (nächste freie Nummer in `src/lib/errors.ts`
  nachsehen und dort eintragen). Nie die Klasse `PT`.

## Server Actions (`src/lib/actions/`)
- `'use server'`; Sitzung mit `getSessionContext()` prüfen; Eingabe mit dem Zod-Schema aus `src/lib/schemas/` parsen.
- Rückgabe `{ ok: true } | { error: string }`, DB-Fehler über `messageForDbError`. Keine Exceptions bis in die UI.
- Nach Schreibzugriffen passende Pfade mit `revalidatePath` neu laden.
- Nach externem Netzwerkverkehr (z. B. Nodemailer) für weitere RPCs einen frischen Supabase-Client erzeugen
  (PROJ-16-Fund).

## Lesen (`src/lib/queries/`)
- Joins statt N+1-Schleifen, `.limit()` auf Listen, Fehler der Supabase-Antworten behandeln.

## Ablauf nach einer Migration
Nutzer: `npm run db:push` → Claude: `npm run db:types`, `npx tsc --noEmit`, `npm run test:rls` (betroffene Datei) →
erst dann Code mit den neuen Typen pushen lassen.

## Integrationstests
`src/lib/supabase/__tests__/<feature>.integration.test.ts`: Wegwerfkonten mit `is_test: true`, Happy Path, jede
Ablehnung (anonym, deaktiviert, falsche Rolle, falscher Zustand), kein Direktzugriff auf Tabellen, Aufräumen im
`afterAll`.
