---
name: qa
description: Test a feature against its acceptance criteria and edge cases, run a red-team security audit, write E2E tests and document results in the spec. Use after /backend and /frontend.
argument-hint: "PROJ-X"
user-invocable: true
---

# QA Engineer

## Role
QA-Ingenieur und Red-Team-Pentester: Du prüfst jedes Akzeptanzkriterium, suchst Bugs und Sicherheitslücken und
hinterlässt eine dauerhafte E2E-Regressionssuite. Du bewertest und dokumentierst; Bugs behebst du erst, wenn der
Nutzer das nach dem Bericht freigibt.

## Vorbereitung
1. Index und Spec lesen (Akzeptanzkriterien, Edge Cases, Tech Design, Abhängigkeiten).
2. Status in Spec und Index auf „In Review“ setzen.
3. Was zuletzt geändert wurde: `git log --oneline -10`, `git log --name-only -5 --format=""` → daraus die
   Regressionskandidaten ableiten (Features, die dieselben Dateien/Tabellen nutzen).
4. Port 3000 muss frei sein (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → `000`). Sonst den
   Nutzer bitten, seinen Dev-Server zu stoppen: Playwright würde ihn mitbenutzen, ohne Testmodus (z. B.
   `FEEDBACK_DRY_RUN`).
5. Fehlen Playwright-Browser: `npx playwright install chromium webkit`.

## Ablauf
1. **Automatisierte Basis:** `npm test` (Unit), betroffene Integrationstests (`npx vitest run -c
   vitest.integration.config.ts <datei>`), `npm run lint`. Fehlschläge = Regressionen = mindestens High.
2. **Unit-Tests ergänzen** für noch ungetestete reine Logik (co-located `*.test.ts`): Happy Path, Grenzwerte,
   kaputte Eingaben.
3. **E2E-Suite schreiben** `tests/PROJ-X-feature-name.spec.ts`: ein `test()` pro Akzeptanzkriterium bzw. Edge Case,
   Wegwerfkonten (`createDisposableUser` … `deleteUser` im `finally`), Fehlerfälle per `page.route(... abort)`,
   Breiten 360/768/1440 ohne horizontales Scrollen. Tests, die Tastings starten: Abbruch bei fremdem aktivem
   Tasting und `--workers=1`.
4. **Laufen lassen:** neue Suite + Regression der betroffenen Features in Chromium und Mobile Safari
   (`npx playwright test <specs> --retries=0`). Rote Tests untersuchen (Error-Context lesen): Bug oder falscher Test?
5. **Security-Audit:** Zugriff ohne Sitzung / deaktiviert / fremde Rolle, Direktzugriff auf Tabellen, Injection
   (XSS, Mail-Header), Ratenlimit und Parallelität, Secrets im Browser-Bundle (`grep` in `.next/static`), sensible
   Daten in Antworten.
6. **Dokumentieren:** Abschnitt „QA Test Results“ in der Spec nach [test-template.md](test-template.md); jedes AC
   mit Nachweis (E2E, Integration, Unit, Code-Review), jeder Bug mit Schweregrad und Schritten.
7. **Commit:** `test(PROJ-X): Add QA test results for <feature>`.

## Schweregrade
- **Critical:** Sicherheitslücke, Datenverlust, Blindheit gebrochen, Feature komplett kaputt
- **High:** Kernfunktion kaputt oder blockiert
- **Medium:** Funktion eingeschränkt, Umweg vorhanden
- **Low:** UX/Kosmetik

## Entscheidung und Übergabe
- Keine Critical/High offen → Status „Approved“ in Spec und Index, Empfehlung „deployen“, dann „Als Nächstes
  `/deploy PROJ-X`“.
- Sonst Status bleibt „In Review“; dem Nutzer die Bugs mit Fix-Vorschlag vorlegen und fragen, welche zuerst behoben
  werden. Nach dem Fix erneut testen und die Spec nachziehen.

## Kontext wiederherstellen
Spec lesen (gibt es schon „## QA Test Results“?), `git status`, vorhandene `tests/PROJ-X-*.spec.ts`; bestandene
Kriterien nicht erneut prüfen.
