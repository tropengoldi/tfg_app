# PROJ-21: Whisky-Steward bringt Whiskies mit

## Status: Architected
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
| **Nur eine Prüfung in der Datenbank erweitern:** „Eintragen“ erlaubt künftig „Teilnehmer **oder** Steward dieses Abends“ | Ändern und Entfernen prüfen schon heute nur „eigener Whisky ∧ Entwurf“ bzw. „Bringer oder Admin“ — sie funktionieren für den Steward ohne Änderung | 2026-10-07 |
| Steward bekommt das Teilnehmer-Limit (kein +1) | Der Bonus hängt an „ist Gastgeber“; der Steward kann laut PROJ-11 nie Gastgeber sein | 2026-10-07 |
| **Keine Änderung an den Lese-Regeln** (`whisky_details`, Ranglisten-Sichten) | Der Steward sieht ohnehin alle Details seines Abends; der Gastgeber-mit-Steward sieht weiter nur Eigenes; Teilnehmer bleiben blind. Rangliste und Bilanz lesen „mitgebracht von“ und sind damit automatisch richtig | 2026-10-07 |
| Steward-Wechsel mit Whiskies: Ablehnung in der Event-Bearbeitung mit dem bestehenden Code **TS009** | Gleicher Code wie „Teilnehmer mit Whiskies entfernen“; die App zeigt bereits eine passende Meldung, der Text der Datenbank nennt den Steward | 2026-10-07 |
| „Tastings“ in der Bilanz unverändert (zählt Teilnehmerliste) | Der Steward steht nicht auf der Teilnehmerliste → zählt nicht, wie entschieden | 2026-10-07 |
| Seite „Meine Whiskys“: Zugang „Teilnehmer **oder** Steward“; Dashboard-Vorschau und „Meine Tastings“ berücksichtigen den Steward | Keine neue Seite; nur die drei Einstiege kennen den Steward bisher nicht | 2026-10-07 |
| Keine neuen Pakete | — | 2026-10-07 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Kleine Änderung in **Backend und Frontend**. Eine Migration mit zwei angepassten Datenbank-Funktionen.
Kein neues Datenfeld, keine neue Tabelle, keine geänderten Lese-Regeln.

### A) Komponenten-Struktur

```
Meine Tastings /tastings                      (bestehend)
+-- Zeile eines Abends im Entwurf, für den Steward
    +-- „Steuern“                              (unverändert)
    +-- NEU: „Meine Whiskys“

Dashboard /                                    (bestehend)
+-- Vorschau-Karte „Nächster Abend“            (NEU auch für den Steward)
    +-- „Meine Whiskys“

Meine Whiskys /tastings/[id]/whiskies         (bestehend, unverändert im Aufbau)
+-- Zugang NEU auch für den Steward
+-- Limit-Hinweis: für ihn wie für Teilnehmer (kein Gastgeber-Bonus)
+-- Liste eigener Whiskies, Formular, Bearbeiten, Entfernen (unverändert)

Admin: Abend anlegen / bearbeiten              (bestehend)
+-- Hinweis zum Limit: „gilt auch für den Whisky-Steward; der Gastgeber darf einen mehr“
+-- Steward-Wechsel mit Whiskies → Fehlermeldung (kommt aus der Datenbank)
```

### B) Datenmodell (in Worten)
Nichts Neues. Ein Whisky des Stewards ist ein ganz normaler Whisky: „mitgebracht von“ = der
Steward. Alles, was darauf aufbaut (Rangliste, „mitgebracht von {Name}“, Bilanz, Profil), funktioniert
ohne Änderung.

### C) Änderungen in der Datenbank (eine Migration)
1. **Whisky eintragen:** Die Berechtigung „nur Teilnehmer“ wird zu „Teilnehmer oder Steward dieses
   Abends“. Limit, Obergrenze 10 und „nur im Entwurf“ bleiben exakt wie heute. Der Gastgeber-Bonus
   hängt weiter nur am Gastgeber.
2. **Abend bearbeiten (Admin):** Wird der Steward gewechselt oder entfernt und hat der bisherige
   Steward schon Whiskies in diesem Abend, lehnt die Datenbank ab (TS009, Text nennt den Steward).
3. Ändern und Entfernen eines Whiskies brauchen keine Anpassung (prüfen schon heute nur „eigener
   Whisky im Entwurf“ bzw. „Bringer oder Admin“).

### D) Änderungen in der App
- **„Meine Whiskys“-Daten:** Zugang, wenn der Nutzer Teilnehmer **oder** Steward ist (bisher nur
  Teilnehmer). Für den Steward kein Gastgeber-Bonus im Limit-Hinweis
- **„Meine Tastings“:** Die Steward-Zeile eines Entwurfs zeigt zusätzlich „Meine Whiskys“
- **Dashboard:** Die Vorschau „Nächster Abend“ findet auch Entwürfe, in denen der Nutzer Steward ist
- **Admin-Formular:** angepasster Hinweistext zum Limit

### E) Tests
- **Integration:** Steward darf eintragen (bis Limit, ohne Bonus, Obergrenze 10, nur Entwurf),
  ändern, entfernen; Außenstehender weiter abgelehnt; Gastgeber-mit-Steward sieht den Steward-Whisky
  vor dem Abschluss nicht; Steward-Wechsel mit Whiskies → TS009, ohne Whiskies erlaubt. Bestehende
  Blindheits-Tests grün
- **Unit:** Limit-Anzeige für den Steward (kein Bonus), Zeilen-Aktionen in „Meine Tastings“
- **E2E:** Steward trägt über die Oberfläche ein; Rangliste zeigt „mitgebracht von {Steward}“;
  Bilanz zählt mitgebracht, nicht Tastings; Admin-Wechsel blockiert

### F) Abhängigkeiten
Keine neuen Pakete.

### G) Reihenfolge der Umsetzung
`/backend` (Migration + Integrationstests, du spielst sie per `db:push` ein), dann `/frontend`. Die
Migration lockert nur das Eintragen für den Steward und verschärft den Steward-Wechsel. Die laufende
App bemerkt davon nichts, bis das Frontend die neuen Einstiege zeigt.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
