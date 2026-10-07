# PROJ-20: Whisky-Steward: Live-Einblick in Wertungen

## Status: Planned
**Created:** 2026-10-07
**Last Updated:** 2026-10-07

## Dependencies
- **Requires: PROJ-11 (Neutraler Helfer pro Event)**: Die Rolle Whisky-Steward und seine Steuerungsseite.
- **Requires: PROJ-18 (Begriffe)**: Bezeichnungen Nasenpunkte, Gaumenpunkte, Whisky-Steward.
- **Requires: PROJ-7 (Bewertungsansicht)**: Dort erscheint der Hinweis für die Teilnehmer.
- **Requires: PROJ-22 (Sieger-Tipp)**: Der Steward sieht auch die Tipps; der Hinweis steht auch am Tipp-Feld.
- **Nutzt PROJ-8 (Live-Sync)**: Die Karte aktualisiert sich über denselben Live-Mechanismus.
- **Nutzt PROJ-19 (Punkteskala)**: Punkte mit Komma bei halben Punkten.

## Kontext

Ist für ein Tasting ein Whisky-Steward benannt, verkostet er nicht mit. Er schenkt aus und steuert
den Abend. Bisher sieht er auf seiner Steuerungsseite nur, **wie viele** Teilnehmer den aktuellen
Whisky bewertet haben („5 von 7 haben bewertet“).

PROJ-20 gibt ihm während des laufenden Tastings den vollen Einblick: Einzelwertungen aller
Teilnehmer mit Namen, ihre **privaten Notizen** und ihre **Sieger-Tipps**. So kann er den Abend
moderieren („Bernd, du hast nur 3 Gaumenpunkte gegeben, warum?“). Dafür wird die bisherige Zusage
„fremde Notizen sind für niemanden lesbar“ gezielt gelockert: nur für den Steward, nur für sein Event,
nur bis zum Abschluss. Die Teilnehmer erfahren das über einen dauerhaften Hinweis in der
Bewertungsansicht.

Die Blindheit der Verkoster bleibt unberührt. Der Steward verkostet nicht, und kein Teilnehmer sieht
mehr als bisher.

## User Stories
- Als **Whisky-Steward** möchte ich während des Tastings sehen, wie jeder Teilnehmer den aktuellen
  Whisky bewertet hat, damit ich den Abend moderieren und gezielt nachfragen kann.
- Als **Whisky-Steward** möchte ich auch die Wertungen früherer Runden ansehen, weil Teilnehmer sie bis
  zum Abschluss noch ändern können.
- Als **Whisky-Steward** möchte ich die Notizen der Teilnehmer lesen, damit ich ihre Eindrücke in die
  Runde tragen kann.
- Als **Whisky-Steward** möchte ich sehen, wer auf welchen Whisky als Sieger tippt.
- Als **Whisky-Steward** möchte ich, dass sich die Ansicht von selbst aktualisiert, wenn jemand
  speichert, ohne dass ich neu laden muss.
- Als **Teilnehmer** möchte ich beim Bewerten klar erkennen, dass der Steward meine Punkte, Notizen und
  meinen Tipp sieht, damit ich weiß, was ich aufschreibe.
- Als **Teilnehmer** möchte ich, dass meine Notizen nach dem Abschluss wieder nur für mich lesbar sind.

## Out of Scope
- **Einblick nach dem Abschluss:** Danach sieht der Steward dasselbe wie alle (Ergebnisseite,
  Punkte-Aufschlüsselung ohne Notizen). Entscheidung 2026-10-07.
- **Notizen vor dem Steward verbergen** (Schalter pro Notiz oder Profil-Einstellung): bewusst nicht,
  es gibt nur den Hinweis. Entscheidung 2026-10-07.
- **Einblick für Gastgeber oder Admin:** nur der Steward. Ein Gastgeber ohne Steward und der Admin
  sehen weiterhin nur den Zähler. Beide verkosten in der Regel mit, ein Einblick bräche die Blindheit.
- **Zwischen-Rangliste über alle Whiskies** für den Steward: nicht Teil von PROJ-20. Er sieht pro
  Whisky Einzelwertungen und den Durchschnitt.
- **Bearbeiten fremder Wertungen oder Notizen** durch den Steward: nur lesen.
- **Steward bringt eigene Whiskies mit:** PROJ-21.
- **Eigene Seite für die Wertungen:** Die Ansicht ist eine Karte auf der Steuerungsseite.
  Entscheidung 2026-10-07.
- **Benachrichtigungen an den Steward** („Anna hat bewertet“): nein, nur die Live-Aktualisierung.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Sichtbarkeit der Karte
- [ ] Angenommen ein Tasting mit Whisky-Steward läuft, wenn der Steward seine Steuerungsseite öffnet,
  dann sieht er unter „Läuft gerade“ eine Karte „Wertungen“.
- [ ] Angenommen das Tasting ist noch nicht gestartet (Entwurf), wenn der Steward die Steuerungsseite
  öffnet, dann gibt es keine Karte „Wertungen“.
- [ ] Angenommen das Tasting ist abgeschlossen, wenn der Steward die Steuerungsseite oder die
  Ergebnisseite öffnet, dann sieht er keine fremden Notizen und keine Karte „Wertungen“ mehr.
- [ ] Angenommen ein Tasting **ohne** Steward läuft, wenn Gastgeber oder Admin die Steuerungsseite
  öffnen, dann gibt es keine Karte „Wertungen“. Sie sehen wie bisher nur den Zähler.
- [ ] Angenommen ein Tasting mit Steward läuft, wenn der Admin die Steuerungsseite öffnet, dann gibt
  es für ihn keine Karte „Wertungen“.

### Inhalt der Karte
- [ ] Angenommen der dritte Whisky ist ausgeschenkt, wenn der Steward die Karte sieht, dann ist
  Whisky 3 vorausgewählt. Er kann über eine Auswahl Whisky 1 bis 3 wählen. Noch nicht ausgeschenkte
  Whiskies sind nicht wählbar.
- [ ] Angenommen der Steward hat einen Whisky gewählt, dann sieht er dessen Ausschank-Nummer und Namen
  sowie den Durchschnitt der Gesamtpunkte der bisher abgegebenen Wertungen.
- [ ] Angenommen ein Whisky ist gewählt, dann steht für jeden Teilnehmer eine Zeile mit Name,
  Nasenpunkten, Gaumenpunkten und Summe. Hat er eine Notiz geschrieben, steht sie unter der Zeile.
- [ ] Angenommen ein Teilnehmer hat den gewählten Whisky noch nicht bewertet, dann steht in seiner
  Zeile „noch offen“.
- [ ] Angenommen ein Teilnehmer hat 0 Punkte vergeben, dann steht dort „0“ und nicht „noch offen“.
- [ ] Angenommen das Tasting bewertet in halben Punkten, dann erscheinen Punkte mit Komma („7,5“).
- [ ] Angenommen der Steward öffnet den Bereich „Sieger-Tipps“ in der Karte, dann sieht er je
  Teilnehmer den getippten Whisky mit Ausschank-Nummer und Namen oder „kein Tipp“.
- [ ] Angenommen die Karte zeigt bis zu 10 Teilnehmer bei 360 px Breite, dann gibt es kein
  horizontales Scrollen.

### Live-Aktualisierung
- [ ] Angenommen der Steward hat die Karte offen, wenn ein Teilnehmer eine Wertung speichert oder
  ändert, dann erscheint die Änderung ohne Neuladen in der Karte.
- [ ] Angenommen der Steward hat einen früheren Whisky gewählt, wenn eine Live-Aktualisierung kommt,
  dann bleibt seine Auswahl erhalten.
- [ ] Angenommen der Steward schaltet auf den nächsten Whisky, dann springt die Auswahl auf den neuen
  aktuellen Whisky.
- [ ] Angenommen ein Teilnehmer ändert seinen Sieger-Tipp, dann erscheint der neue Tipp ohne Neuladen.

### Hinweis für die Teilnehmer
- [ ] Angenommen ein Tasting mit Steward läuft, wenn ein Teilnehmer die Bewertungsansicht öffnet, dann
  steht am Notizfeld dauerhaft der Hinweis „Whisky-Steward {Name} sieht deine Punkte und Notizen bis
  zum Abschluss.“
- [ ] Angenommen ein Tasting mit Steward läuft, dann steht auch am Sieger-Tipp-Feld ein kurzer
  Hinweis, dass der Steward den Tipp sieht.
- [ ] Angenommen ein Tasting **ohne** Steward läuft, dann gibt es keinen solchen Hinweis.
- [ ] Angenommen das Tasting ist abgeschlossen, dann verschwindet der Hinweis.

### Schutz auf Datenbankebene
- [ ] Angenommen ein Tasting mit Steward läuft, wenn der Steward die Wertungen, Notizen und Tipps
  seines Events direkt abfragt, dann bekommt er sie.
- [ ] Angenommen das Tasting ist abgeschlossen, wenn der (ehemalige) Steward direkt Notizen abfragt,
  dann bekommt er keine fremden Notizen.
- [ ] Angenommen jemand ist Steward eines anderen Events, wenn er Wertungen dieses Events abfragt, dann
  bekommt er nichts.
- [ ] Angenommen ein Teilnehmer, der Gastgeber oder ein normales Mitglied fragt während des Tastings
  fremde Wertungen, Notizen oder Tipps direkt ab, dann bekommt er nichts, wie bisher.
- [ ] Angenommen der Steward fragt direkt ab, dann kann er keine fremden Wertungen oder Tipps
  verändern.
- [ ] Angenommen alle bestehenden Blindheits- und RLS-Tests laufen, dann sind sie weiter grün.

## Edge Cases
- **Steward wechselt während des Abends:** ausgeschlossen. Die Steward-Zuordnung ist nur im Entwurf
  änderbar (PROJ-11).
- **Teilnehmer ändert eine frühere Wertung:** Der Steward sieht den neuen Stand, sobald er den
  Whisky wählt oder die Karte aktualisiert wird.
- **Teilnehmer löscht seine Notiz (leert das Feld):** Die Notiz verschwindet beim Steward.
- **Sehr lange Notiz:** wird umbrochen, kein horizontales Scrollen. Ab einer gewissen Länge
  eingekürzt mit „mehr“.
- **Noch niemand hat bewertet:** Alle Zeilen „noch offen“, kein Durchschnitt („–“).
- **Live-Verbindung weg:** Es gilt der bestehende Hinweis „Nicht live — tippen zum Aktualisieren“.
- **Teilnehmer wird während des Tastings deaktiviert:** Seine bereits abgegebenen Wertungen bleiben
  in der Karte sichtbar, wie in der Ergebnisliste.
- **Testkonten (PROJ-26):** keine Sonderregel. Steward und Teilnehmer eines Test-Tastings sind ohnehin
  nur für Admin und Testkonten sichtbar.
- **Steward öffnet die Bewertungsansicht:** Er verkostet nicht und hat dort weiterhin keinen Zugang.

## Technical Requirements (optional)
- Security: Durchsetzung auf Datenbankebene (RLS/RPC), nicht nur im Frontend. Fremde Notizen
  bleiben für alle anderen Rollen unlesbar.
- Live-Aktualisierung innerhalb weniger Sekunden nach dem Speichern.
- Mobile-first: lesbar bei 360 px, bis 10 Teilnehmer ohne horizontales Scrollen.

## Open Questions
- [ ] Wortlaut des Hinweises am Notizfeld und am Tipp-Feld, im `/frontend` mit dem Nutzer abstimmen.
- [ ] Soll der Steward die Notizen mit einem Schalter ausblenden können, wenn Teilnehmer ihm über die
  Schulter schauen? Vorschlag: im `/frontend` entscheiden, kein Datenbank-Thema.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Steward sieht alle bisher ausgeschenkten Whiskies, Standard ist der aktuelle | Teilnehmer können frühere Wertungen bis zum Abschluss ändern; der Steward soll das mitbekommen | 2026-10-07 |
| Einblick in Notizen nur bis zum Abschluss | Der Bruch der Notiz-Privatsphäre bleibt auf den Zweck (Abend moderieren) begrenzt | 2026-10-07 |
| Kein Opt-out für Teilnehmer, nur ein dauerhafter Hinweis | Bewertung soll in Sekunden erledigt sein; keine zusätzliche Bedienung und keine Sonderregel | 2026-10-07 |
| Karte auf der Steuerungsseite statt eigener Seite | Der Steward hat die Seite während des Abends ohnehin offen | 2026-10-07 |
| Sieger-Tipps sind ebenfalls sichtbar, mit Hinweis am Tipp-Feld | Wunsch des Nutzers; der Steward tippt nicht mit, also kein Vorteil für ihn | 2026-10-07 |
| Kein Einblick für Gastgeber und Admin | Beide verkosten meist mit; Einblick bräche die Blindheit | 2026-10-07 |
| Durchschnitt pro Whisky ja, Zwischen-Rangliste über alle Whiskies nein | Hält den Umfang klein; eine Rangliste vor dem Abschluss ist ein eigener Wunsch | 2026-10-07 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
