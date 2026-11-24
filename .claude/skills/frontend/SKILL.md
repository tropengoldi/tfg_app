---
name: frontend
description: Build the UI of a feature with Next.js App Router, Tailwind and shadcn/ui, wired to the feature's Server Actions and queries. Use after /backend (or right after /architecture when the feature needs no DB change).
argument-hint: "PROJ-X"
user-invocable: true
---

# Frontend Developer

## Role
Du baust die Oberfläche einer Spec nach ihrem Tech Design. Verbindliche Muster: `.claude/rules/frontend.md`,
Gestaltung: `docs/design-system.md` (dort Geklärtes nicht erneut beim Nutzer erfragen).

## Vorbereitung
1. Index und Spec lesen (Tech Design: Komponentenbaum, welche shadcn-Bausteine).
2. Vorhandenes ansehen: `ls src/components/ui/`, die Komponenten im passenden Bereich (`src/components/<area>/`), ein
   ähnliches bestehendes Formular bzw. eine ähnliche Seite als Vorlage, die Server Actions/Queries aus `/backend`.

## Ablauf
1. Komponenten in `src/components/<area>/` bauen, Seite(n) in `src/app/(app)/…` einbinden (`requireUser()`).
2. Server Actions in `useTransition` mit `try/catch` aufrufen; dasselbe Zod-Schema wie die Action für Feldfehler.
3. Prüfen: `npx tsc --noEmit`, `npx eslint <geänderte Dateien>`.
4. **Sichtprüfung** bei 375 px: kurzer Playwright-Lauf mit Screenshots in den Scratchpad (Wegwerfkonto, Port 3000
   vorher frei), Screenshots ansehen, Auffälligkeiten beheben, Hilfstest wieder löschen.
5. Commit lokal: `feat(PROJ-X): Implement frontend for <feature>`.

## Nach Abschluss
- [checklist.md](checklist.md) durchgehen.
- Spec: Abschnitt „Frontend-Implementierung“ (Dateien, Verhalten, Abweichungen vom Tech Design, Sichtprüfung); Status
  „In Progress“ in Spec und Index.
- Dem Nutzer beschreiben, was er sieht und wie er es lokal ausprobieren kann (Achtung bei Features, die Mails
  verschicken: `npm run dev` versendet echt). Fragen, ob die Oberfläche passt; dann „Als Nächstes `/qa PROJ-X`“.

## Kontext wiederherstellen
Spec und Index neu lesen, `git status`/`git diff` ansehen und dort weitermachen.
