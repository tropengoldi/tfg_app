# PROJ-21: Whisky-Steward bringt Whiskies mit

## Status: Planned
**Created:** 2026-10-07
**Last Updated:** 2026-10-07

## Dependencies
- **Requires: PROJ-11 (Neutraler Helfer pro Event)**: Rolle Whisky-Steward, Zuordnung nur im Entwurf.
- **Requires: PROJ-5 (Whisky-Erfassung)**: Seite „Meine Whiskys“, Limitprüfung, Obergrenze 10 pro Abend.
- **Requires: PROJ-4 (Admin – Tasting-Events)**: Steward-Wechsel im Entwurf, Hinweistexte zum Limit.
- **Betrifft PROJ-8 (Dashboard)**: Vorschau-Karte „Nächster Abend“ auch für den Steward.
- **Betrifft PROJ-9 / PROJ-10 / PROJ-14**: Rangliste („mitgebracht von“) und Bilanz zählen seine Whiskies.
- **Abgestimmt mit PROJ-20**: Der Steward sieht die Wertungen zu seinen Whiskies wie zu allen anderen.

## Kontext

Der Whisky-Steward verkostet nicht mit, er schenkt aus und steuert den Abend. Bisher darf er deshalb
auch keine Whiskies einreichen: Eintragen dürfen nur Teilnehmer. In der Runde bringt aber oft auch
der Steward eine Flasche mit.

PROJ-21 erlaubt ihm das. Er trägt seine Whiskies auf derselben Seite „Meine Whiskys“ ein wie alle
anderen, mit demselben Limit wie ein Teilnehmer. Die Teilnehmer bewerten sie blind wie jeden anderen
Whisky. In der Rangliste steht „mitgebracht von {Steward}“, und in seiner Bilanz zählen sie als
mitgebrachte Whiskies. Als Tasting zählt der Abend für ihn weiterhin nicht, denn er hat nicht
mitverkostet.

## User Stories
- Als **Whisky-Steward** möchte ich vor dem Abend eintragen, welchen Whisky ich mitbringe, damit er
  wie alle anderen ausgeschenkt und bewertet wird.
- Als **Whisky-Steward** möchte ich meinen Whisky bis zum Start bearbeiten oder wieder entfernen.
- Als **Whisky-Steward** möchte ich nach dem Abschluss in der Rangliste sehen, wie mein Whisky
  abgeschnitten hat, und ihn in meiner Bilanz wiederfinden.
- Als **Teilnehmer** möchte ich den Whisky des Stewards blind bewerten wie jeden anderen, ohne zu
  wissen, dass er von ihm stammt.
- Als **Gastgeber mit Steward** möchte ich den Whisky des Stewards vorab nicht sehen, weil ich blind
  mitverkoste.
- Als **Admin** möchte ich erkennen, dass auch der Steward Whiskies mitbringen darf, und beim Wechsel
  des Stewards nicht versehentlich Whiskies verlieren.

## Out of Scope
- **Eigenes Limit für den Steward** oder Gastgeber-Bonus: Es gilt das Teilnehmer-Limit.
  Entscheidung 2026-10-07.
- **Steward-Abend als Tasting in der Bilanz:** bleibt wie in PROJ-11, nur Teilnahmen zählen.
  Entscheidung 2026-10-07.
- **Steward bewertet oder tippt mit:** Er verkostet weiterhin nicht (PROJ-11, PROJ-22).
- **Whiskies beim Steward-Wechsel mitnehmen oder automatisch löschen:** Der Wechsel wird blockiert.
  Entscheidung 2026-10-07.
- **Kennzeichnung „vom Steward“ in der Rangliste:** Es steht nur sein Name, wie bei allen anderen.
- **Whiskies nach dem Start eintragen:** wie bisher nur im Entwurf (PROJ-5).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Zugang
- [ ] Angenommen ein Abend im Entwurf hat einen Steward, wenn der Steward „Meine Tastings“ öffnet, dann
  zeigt die Zeile dieses Abends neben „Steuern“ auch „Meine Whiskys“.
- [ ] Angenommen der Steward ist für den nächsten Abend im Entwurf benannt, wenn er das Dashboard
  öffnet, dann sieht er die Vorschau-Karte „Nächster Abend“ mit dem Absprung „Meine Whiskys“.
- [ ] Angenommen der Steward öffnet „Meine Whiskys“ seines Abends, dann sieht er dieselbe Seite wie
  ein Teilnehmer: seine eingetragenen Whiskies und das Formular zum Eintragen.
- [ ] Angenommen der Abend ist gestartet oder abgeschlossen, wenn der Steward „Meine Whiskys“ öffnet,
  dann kann er nichts mehr eintragen, ändern oder entfernen, wie jeder Teilnehmer.

### Eintragen und Limit
- [ ] Angenommen das Limit pro Person ist 1, wenn der Steward einen Whisky einträgt, dann wird er
  gespeichert; ein zweiter wird mit „Dein Limit an Whiskies für dieses Tasting ist erreicht.“
  abgelehnt.
- [ ] Angenommen das Limit pro Person ist 1 und der Steward ist gesetzt, dann darf der Gastgeber
  weiterhin 2 eintragen. Der Steward bekommt keinen Bonus.
- [ ] Angenommen es ist kein Limit gesetzt, dann darf der Steward eintragen, solange der Abend
  insgesamt unter 10 Whiskies liegt.
- [ ] Angenommen der Abend hat schon 10 Whiskies, wenn der Steward einen weiteren einträgt, dann wird
  er mit der bestehenden Meldung zur Obergrenze abgelehnt.
- [ ] Angenommen der Steward hat einen Whisky eingetragen, dann kann er ihn im Entwurf bearbeiten und
  entfernen, wie ein Teilnehmer.
- [ ] Angenommen jemand ist weder Teilnehmer noch Steward des Abends, wenn er einen Whisky eintragen
  will, dann wird das abgelehnt, wie bisher.

### Blindheit
- [ ] Angenommen ein Abend hat Steward und Gastgeber, wenn der Gastgeber die Whiskies vor dem Abschluss
  ansehen will, dann sieht er nur seine eigenen, nicht den des Stewards.
- [ ] Angenommen ein Teilnehmer bewertet den Whisky des Stewards, dann sieht er nur „Whisky n von m“,
  wie bei jedem anderen.

### Ergebnis und Bilanz
- [ ] Angenommen der Abend ist abgeschlossen, dann steht der Whisky des Stewards in der Rangliste mit
  „mitgebracht von {Steward}“ und Link auf sein Profil.
- [ ] Angenommen der Steward hat an einem abgeschlossenen Abend einen Whisky mitgebracht, wenn er seine
  Bilanz öffnet, dann zählt er bei „mitgebrachte Whiskies“, und seine Platzierung zählt für „beste
  Platzierung“.
- [ ] Angenommen derselbe Abend, dann zählt er bei „Tastings“ für den Steward **nicht**.
- [ ] Angenommen ein anderes Mitglied öffnet das Profil des Stewards (PROJ-14), dann gilt für diese
  Zahlen dieselbe Sichtbarkeits-Einstellung wie bisher.

### Steward-Wechsel
- [ ] Angenommen der Steward hat im Entwurf einen Whisky eingetragen, wenn der Admin einen anderen
  Steward wählt oder den Steward entfernt, dann wird das abgelehnt mit dem Hinweis, dass zuerst die
  Whiskies des Stewards entfernt werden müssen.
- [ ] Angenommen der Steward hat keine Whiskies eingetragen, dann lässt sich der Steward im Entwurf
  wie bisher wechseln oder entfernen.

### Hinweise für den Admin
- [ ] Angenommen der Admin legt einen Abend an oder bearbeitet ihn, dann erklärt der Hinweis zum Limit,
  dass es auch für den Whisky-Steward gilt (der Gastgeber darf einen mehr).

## Edge Cases
- **Steward wird zugleich als Teilnehmer gewählt:** weiterhin ausgeschlossen (TS017, PROJ-11).
- **Steward wird deaktiviert:** weiterhin gesperrt, solange er Steward eines offenen Abends ist (PROJ-11).
- **Limit wird nachträglich gesenkt** und der Steward liegt schon darüber: Es gilt dieselbe Regel wie
  für Teilnehmer (bestehende Einträge bleiben, neue werden abgelehnt).
- **Steward-Abend ohne Teilnehmer-Whiskies:** keine Sonderregel; der Abend kann wie bisher erst mit
  mindestens einem Whisky starten.
- **PROJ-20-Karte:** Der Steward sieht die Wertungen zu seinem eigenen Whisky wie zu allen anderen.
- **Testkonten (PROJ-26):** keine Sonderregel; ein Test-Steward macht den Abend wie bisher zum
  Test-Tasting.

## Technical Requirements (optional)
- Security: Durchsetzung auf Datenbankebene. Die Blindheit für Teilnehmer und den Gastgeber-mit-Steward
  bleibt unverändert.
- Bestehende Blindheits- und RLS-Tests bleiben grün.

## Open Questions
- [ ] Keine offen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Steward hat dasselbe Limit wie ein Teilnehmer, keinen Bonus | Einfach und fair; der Gastgeber-Bonus bleibt etwas Besonderes | 2026-10-07 |
| Mitgebrachte Whiskies und beste Platzierung zählen in seiner Bilanz | Er hat den Whisky mitgebracht; „Tastings“ zählt weiter nur Teilnahmen (PROJ-11) | 2026-10-07 |
| Steward-Wechsel mit eingetragenen Whiskies wird blockiert | Gleiche Regel wie beim Entfernen von Teilnehmern; keine Daten gehen verloren | 2026-10-07 |
| Dieselbe Seite „Meine Whiskys“, erreichbar über „Meine Tastings“ und die Dashboard-Vorschau | Keine neue Oberfläche; der Steward findet sie dort, wo Teilnehmer sie finden | 2026-10-07 |
| Keine Kennzeichnung „vom Steward“ in der Rangliste | Jeder Whisky zeigt nur, wer ihn mitgebracht hat | 2026-10-07 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
