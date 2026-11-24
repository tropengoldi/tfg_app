# General Project Rules

## Feature Tracking
- `features/INDEX.md` ist die Statusquelle; vor Arbeit an einem Feature dort und in der Spec nachsehen.
- Specs liegen in `features/PROJ-X-feature-name.md`, IDs fortlaufend („Next Available ID“ im Index).
- Eine Spec = ein unabhängig test- und deploybares Feature.
- Ein Wunsch, der noch nicht im Index steht → zuerst `/write-spec` (oder Schnellweg, wenn der Nutzer das so will).

## Status-Updates
Nach jeder Phase Spec und Index gemeinsam aktualisieren, mit dem Edit-Tool (nicht nur im Chat beschreiben):
- Spec: Status-Zeile im Kopf + Abschnitt der Phase (Tech Design, Backend-/Frontend-Implementierung, QA, Deployment)
  mit dem, was gebaut wurde, Abweichungen und gefundenen Bugs.
- Index: Status-Spalte gleich dem Spec-Kopf. Reihenfolge: Roadmap → Planned → Architected → In Progress →
  In Review → Approved → Deployed.
- Beim Deploy: Eintrag in `docs/CHANGELOG.md` anhängen (Version, Migration, AC-Bilanz, Bugs). Offene Low-Bugs kommen
  in den Backlog des Index, erledigte Backlog-Punkte wandern ins Changelog.
- Vor dem Commit mit `git diff` kurz prüfen, dass die Änderungen wirklich drin sind.

## Git
- Commit-Format `type(PROJ-X): description` mit type aus feat, fix, refactor, test, docs, deploy, chore.
- Vor Neubauten nachsehen, was es schon gibt: `git ls-files src/components/ src/lib/`, bestehende Migrationen unter
  `supabase/migrations/`.
- Claude committet lokal; pushen (inkl. Tags) macht der Nutzer.

## Zusammenarbeit
- Ergebnisse jeder Phase dem Nutzer vorstellen und seine Freigabe abwarten, bevor die nächste Phase beginnt.
- Entscheidungen als konkrete Optionen mit Empfehlung anbieten.
- Am Ende einer Phase den nächsten Skill vorschlagen („Als Nächstes `/qa PROJ-X`“); der Nutzer startet ihn.

## Dateien
- Nach einer Kontext-Zusammenfassung betroffene Dateien neu lesen, statt aus dem Gedächtnis zu arbeiten.
- Importpfade, Komponenten- und Funktionsnamen im Code nachsehen, nicht raten.
