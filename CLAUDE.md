# Whizzky – Whisky-Tasting-App

> Mobile-first Web-App für eine private Whisky-Runde: blinde Verkostung am Handy, Live-Sync, Rangliste, Archiv.
> Live seit 2026-08-30 unter https://tfg-app-self.vercel.app. Entwickelt mit einem Skill-basierten Workflow
> (Spec → Architektur → Backend → Frontend → QA → Deploy).

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (`src/components/ui/`, nie eigene Kopien bauen), Design: `docs/design-system.md`
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage), Projekt `tfg_app`, eu-central-1, **eine** Datenbank =
  Produktion
- **Mail:** Nodemailer über Gmail-SMTP (`src/lib/email/transport.ts`)
- **Validierung:** Zod (gleiches Schema im Client und in der Server Action)
- **Charts:** recharts über shadcn `chart`
- **Tests:** Vitest (Unit, co-located), Vitest-Integration gegen Supabase (`npm run test:rls`), Playwright E2E
- **Deployment:** Vercel, Auto-Deploy bei Push auf `main`

## Project Structure

```
src/
  app/(app)/          Angemeldeter Bereich (requireUser im Layout/Seiten)
  app/neuigkeiten/    Öffentliche Release Notes (PUBLIC_PATHS in src/proxy.ts)
  components/ui/      shadcn/ui
  components/<area>/  Feature-Komponenten (rating, results, host, profile, …)
  lib/actions/        Server Actions ('use server') — einzige Schreibwege aus der UI
  lib/queries/        Server-seitige Lesezugriffe
  lib/schemas/        Zod-Schemas
  lib/supabase/       Clients, generierte types.ts, __tests__/*.integration.test.ts
  lib/*.ts            Reine, unit-getestete Logik (Punkte, Ranglisten, Sichtbarkeit …)
supabase/migrations/  SQL-Migrationen (Tabellen, RLS, SECURITY-DEFINER-RPCs, Sichten)
scripts/              Wartungsskripte mit Service-Role (siehe docs/maintenance.md)
tests/                Playwright E2E (PROJ-X-name.spec.ts, helpers/)
features/             Specs (PROJ-X-name.md) + INDEX.md (Status, offener Backlog)
docs/                 PRD, design-system, feature-map, CHANGELOG, maintenance, production/
```

Es gibt **keine API-Routen** (`src/app/api/` existiert nicht, bis auf Auth-Callbacks unter `src/app/auth/`).

## Development Workflow

1. `/write-spec` – Spec mit User Stories, Akzeptanzkriterien (Angenommen/Wenn/Dann), Edge Cases
2. `/architecture` – Tech Design in Alltagssprache, ohne Code
3. `/backend` – Migration, RPCs, Server Actions, Integrationstests; Nutzer spielt Migration ein
4. `/frontend` – UI mit shadcn/ui
5. `/qa` – Akzeptanzkriterien, Security-Audit, E2E-Tests
6. `/deploy` – Checks, Bookkeeping, Tag; Nutzer pusht

`/refine PROJ-X` überarbeitet eine bestehende Spec, `/help` zeigt den aktuellen Stand. Nach jeder Phase holt Claude die
Freigabe des Nutzers ein und schlägt den nächsten Skill vor; der Nutzer startet ihn.

**Schnellweg für kleine Features** (Entscheidung des Nutzers pro Feature, z. B. reiner Inhalt, eine Seite, keine
neue Tabelle): Spec + Tech Design in einer Datei und einer Freigabe, Umsetzung in einem Schritt, danach QA und Deploy
wie gewohnt. Beispiel: PROJ-27.

## Projekt-Konventionen

**Sprache:** Chat, UI-Texte und Specs auf Deutsch; Commits und Code-Bezeichner auf Englisch.

**Datenbank & Deploy-Reihenfolge**
- Neue Tabellen: RLS an. Schreiben läuft in der Regel **nicht** direkt, sondern über SECURITY-DEFINER-RPCs mit
  `set search_path = ''`, die Rechte und Zustand prüfen; Direktrechte (`insert/update/delete`) werden entzogen.
  Policies nur dort, wo direkt gelesen wird.
- Eigene Fehlercodes: Klasse `TS` (aktuell bis TS029), deutscher Text in der Exception und in `src/lib/errors.ts`.
  Nie die Klasse `PT` (PostgREST deutet sie als HTTP-Status).
- Ablauf: Claude schreibt die Migration → **der Nutzer** führt `npm run db:push` aus → Claude führt
  `npm run db:types` aus und lässt `npm run test:rls` laufen → erst dann darf Code mit den neuen Typen gepusht
  werden (sonst scheitert der Vercel-Build).
- **Claude pusht nicht** (`git push` wird blockiert): Claude committet lokal, der Nutzer pusht `main` und Tags.
- `npm run db:seed` und `db:reset` nie gegen Produktion.

**Server Actions & UI**
- Jede Action: Sitzung prüfen (`getSessionContext`), Eingabe mit Zod parsen, Ergebnis `{ ok: true } | { error }`;
  DB-Fehler über `messageForDbError`.
- Aufrufe aus Client-Transitions immer in `try/catch`, sonst ersetzt `error.tsx` bei Netzwerkfehlern die Seite.
- Mobile-first (360–375 px ohne horizontales Scrollen), große Bedienelemente; Lade-, Fehler- und Leerzustände.
- Blindheit wird in der Datenbank erzwungen (RLS/RPCs/Sichten), nie nur im Frontend.

**Tests gegen die Live-Datenbank**
- Integration und E2E laufen gegen die **Produktions-DB**. Testpersonen sind Wegwerfkonten
  (`createDisposableUser`, automatisch `is_test`, für normale Mitglieder unsichtbar) und werden danach gelöscht.
- Tests, die ein Tasting auf „läuft“ setzen: vorher auf ein fremdes aktives Tasting prüfen und abbrechen statt es zu
  beenden (Muster in `tests/PROJ-29-*.spec.ts`); solche Specs mit `--workers=1`.
- Vor `npx playwright test` muss Port 3000 frei sein: Nur ein von Playwright gestarteter Server hat
  `FEEDBACK_DRY_RUN=1`; ein laufender Dev-Server würde echte Mails verschicken.
- Die komplette `test:rls`-Suite stößt ans Supabase-Auth-Ratenlimit → in zwei Hälften laufen lassen.
- Browser im Playwright-Setup: Chromium + Mobile Safari (kein Firefox).

**Sonstiges**
- Dateien haben teils CRLF-Zeilenenden; Skripte, die Dateien umschreiben, müssen sie erhalten.
- Neue, für die Runde spürbare Features kommen auf `/neuigkeiten` (kompakt, mit Whisky-Charme) und ins gespiegelte
  Claude-Doc; `tests/PROJ-27-neuigkeiten.spec.ts` mitziehen.
- Commits: `type(PROJ-X): description` (feat, fix, refactor, test, docs, deploy, chore).

## Build & Test Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (flat config)
npm test             # Vitest Unit
npm run test:rls     # Vitest-Integration gegen Supabase (.env.local)
npm run test:e2e     # Playwright (baut und startet selbst einen Prod-Server)
npm run db:types     # Typen aus der Live-DB erzeugen (nach db:push)
```

## Product Context

@docs/PRD.md

## Feature Overview

@features/INDEX.md
