---
name: deploy
description: Ship an approved feature to production on Vercel — pre-deploy checks, spec/INDEX/CHANGELOG bookkeeping, version tag; the user pushes, then the deployment is verified live. Use after /qa approved the feature.
argument-hint: "PROJ-X"
user-invocable: true
---

# DevOps Engineer

## Role
Du bringst ein von QA freigegebenes Feature live. Vercel deployt automatisch beim Push auf `main`; Vercel-Projekt,
Umgebungsvariablen, Security-Header und Supabase-Auth sind seit v1.0.0 eingerichtet.

## Voraussetzungen
- Spec-Status „Approved“, keine offenen Critical/High-Bugs. Sonst: „Bitte zuerst `/qa PROJ-X`.“
- Migration (falls vorhanden) vom Nutzer per `db:push` eingespielt, Typen erzeugt (steht in der Spec).
- Neue Umgebungsvariablen beim Nutzer abgefragt: lokal **und** bei Vercel (Production) gesetzt?

## Vorab-Checks
- `npm run build` und `npm run lint` grün.
- Keine Secrets im Diff seit dem letzten Deploy-Tag
  (`git diff <letzter-tag>..HEAD | grep -inE "password=|service_role|eyJ|@gmail"`).
- Alles committet (`git status`, nur bekannte untracked Dateien).

## Bookkeeping (vor dem Push, damit der Nutzer nur einmal pushen muss)
1. Spec: Abschnitt „Deployment“ (URL, Datum, Version, Migration, Umgebungsvariablen, offene Low-Bugs, was nach dem
   Deploy noch live zu prüfen ist); Status „Deployed“.
2. `features/INDEX.md`: Status „Deployed“; offene Low-Bugs in den Backlog.
3. `docs/CHANGELOG.md`: Eintrag anhängen (Feature, Version, Migration, AC-Bilanz, Bugs).
4. Bei für die Runde spürbaren Features: Abschnitt auf `/neuigkeiten` (kompakt, mit Whisky-Charme) +
   `tests/PROJ-27-neuigkeiten.spec.ts` + gespiegeltes Claude-Doc. Bei Unsicherheit den Nutzer fragen.
5. Commit `deploy(PROJ-X): Deploy <feature> to production` (mit URL und Datum im Text), Tag
   `git tag -a v1.Y.0 -m "Deploy PROJ-X: <feature>"` (nächste Minor-Version; reine Fixes: Patch-Version).

## Push und Prüfung
1. Den Nutzer bitten: `git push origin main` und `git push origin v1.Y.0`. Claude pusht nicht. Die Meldung
   „nicht genügend Speicherressourcen / Failed to write item to store“ ist harmlos; mit `git ls-remote origin` prüfen.
2. Nach 1–2 Minuten: Produktions-URL der neuen Seite abrufen (`curl -s -o /dev/null -w "%{http_code}"`, ohne
   Anmeldung ist 307 → `/login` korrekt).
3. Was nur live geht (echter Mailversand, Uploads), dem Nutzer als konkreten Test beschreiben.

## Rollback
Vercel → Deployments → vorheriges Deployment → „Promote to Production“. Danach lokal fixen, committen, Nutzer pusht.
Migrationen werden nicht automatisch zurückgerollt; bei Bedarf eine Gegen-Migration schreiben.

## Kontext wiederherstellen
`git log --oneline -5`, `git tag --points-at HEAD`, `git ls-remote origin refs/heads/main` → feststellen, ob
Bookkeeping, Tag und Push schon erledigt sind.
