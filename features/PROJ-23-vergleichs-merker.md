# PROJ-23: Vergleichs-Merker

## Status: Planned
**Created:** 2026-10-09
**Last Updated:** 2026-10-09

## Dependencies
- **Requires: PROJ-7 (Bewertungsansicht)**: Dort sitzt der Merker, in der Bewertungskarte.
- **Requires: PROJ-6 / PROJ-8 (Ablauf, Live-Sync)**: „ausgeschenkt“ = Position bis zum aktuellen
  Whisky; neue Whiskies werden mit dem Weiterschalten wählbar.
- **Abgestimmt mit PROJ-20**: Der Whisky-Steward sieht die Merker **nicht**.
- **Abgestimmt mit PROJ-26**: keine Sonderregel; Merker gehören zum eigenen Konto.

## Kontext

Während eines Tastings möchte man sich merken, welche Whiskies man am Ende noch einmal direkt
nebeneinander probieren will, z. B. „Whisky 2, 5 und 7 nochmal zusammen“. Bisher geht das nur über die
Notiz.

PROJ-23 gibt jedem Mitverkoster **private Vergleichsgruppen**. Bei einem Whisky tippt man auf die
Nummern der anderen Whiskies, mit denen man ihn vergleichen will. Daraus entsteht eine Gruppe, die bei
jedem ihrer Whiskies gleich angezeigt wird. Niemand sonst sieht die Gruppen, auch nicht der
Whisky-Steward. Nach dem Abschluss des Abends verschwinden sie.

## User Stories
- Als **Teilnehmer** möchte ich bei einem Whisky festhalten, mit welchen anderen ich ihn noch einmal
  vergleichen will, damit ich das am Ende des Abends nicht vergesse.
- Als **Teilnehmer** möchte ich mehrere Whiskies zu einer Vergleichsgruppe zusammenfassen
  (z. B. 2 · 5 · 7) und die Gruppe bei jedem dieser Whiskies sehen.
- Als **Teilnehmer** möchte ich einen Whisky wieder aus einer Gruppe nehmen, wenn sich der Vergleich
  erledigt hat.
- Als **Teilnehmer** möchte ich, dass meine Merker auch nach Neuladen oder auf einem anderen Gerät
  noch da sind.
- Als **Teilnehmer** möchte ich, dass niemand sonst meine Merker sieht, auch nicht der Whisky-Steward.
- Als **Teilnehmer** möchte ich, dass der Merker mich beim Bewerten nicht aufhält: ein Tippen,
  kein Speichern-Knopf.

## Out of Scope
- **Merker nach dem Abschluss:** Sie verschwinden. Entscheidung 2026-10-09.
- **Noch nicht ausgeschenkte Whiskies** in eine Gruppe aufnehmen: nur ausgeschenkte.
  Entscheidung 2026-10-09.
- **Ein Whisky in mehreren Gruppen:** Ein Whisky steht in höchstens einer Gruppe; Gruppen
  verschmelzen. Entscheidung 2026-10-09.
- **Merker teilen** mit anderen oder Einblick für den Whisky-Steward (PROJ-20): privat.
- **Abhaken „verglichen“** als eigener Zustand: Wer fertig ist, nimmt den Whisky aus der Gruppe.
- **Benennen von Gruppen** oder Notizen zur Gruppe: Die Gruppe ist nur eine Zahlenreihe.
- **Merker in der eigenen Rangliste** (PROJ-24) oder auf dem Dashboard: nur in der Bewertungskarte.
- **Merker für den Whisky-Steward selbst:** Er verkostet nicht und hat keine Bewertungsansicht.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeige
- [ ] Angenommen ein Tasting läuft und der Teilnehmer steht in der Bewertungsansicht bei Whisky 4
  (aktuell ausgeschenkt: 4), dann zeigt die Bewertungskarte unter der Notiz eine Zeile
  „Vergleichen mit“ mit den Knöpfen 1, 2 und 3.
- [ ] Angenommen der Teilnehmer steht bei Whisky 1 und nur Whisky 1 ist ausgeschenkt, dann steht dort
  „Vergleichen mit — sobald weitere Whiskies ausgeschenkt sind.“ ohne Knöpfe.
- [ ] Angenommen Gastgeber oder Whisky-Steward schalten auf Whisky 5 weiter, wenn der Teilnehmer die Bewertungsansicht
  sieht, dann wird Whisky 5 ohne Neuladen als weiterer Knopf wählbar.
- [ ] Angenommen der Teilnehmer schaut sich einen früheren Whisky an (z. B. 2), dann zeigt die Zeile
  alle ausgeschenkten Whiskies außer 2.
- [ ] Angenommen die Knöpfe sind 44 px groß, dann passen bei 360 px Breite bis zu 9 Knöpfe ohne
  horizontales Scrollen (sie brechen um).

### Gruppen bilden und ändern
- [ ] Angenommen bei Whisky 2 ist noch nichts markiert, wenn der Teilnehmer auf „5“ tippt, dann ist
  „5“ markiert, und bei Whisky 5 ist „2“ markiert (Gruppe 2 · 5).
- [ ] Angenommen die Gruppe 2 · 5 besteht, wenn der Teilnehmer bei Whisky 2 zusätzlich „7“ tippt,
  dann besteht die Gruppe 2 · 5 · 7, und bei Whisky 5 sind „2“ und „7“ markiert, bei Whisky 7 „2“
  und „5“.
- [ ] Angenommen die Gruppe 2 · 5 · 7 besteht, wenn der Teilnehmer bei Whisky 3 „5“ tippt, dann
  verschmelzen die Gruppen zu 2 · 3 · 5 · 7.
- [ ] Angenommen es bestehen die Gruppen 1 · 4 und 2 · 5, wenn der Teilnehmer bei Whisky 4 „5“ tippt,
  dann verschmelzen beide zu 1 · 2 · 4 · 5.
- [ ] Angenommen die Gruppe 2 · 5 · 7 besteht, wenn der Teilnehmer bei Whisky 2 die markierte „7“
  antippt, dann verlässt 7 die Gruppe; es bleibt 2 · 5, und bei Whisky 7 ist nichts mehr markiert.
- [ ] Angenommen die Gruppe 2 · 5 besteht, wenn der Teilnehmer bei Whisky 2 die „5“ antippt, dann
  löst sich die Gruppe auf; bei 2 und 5 ist nichts mehr markiert.
- [ ] Angenommen ein Whisky ist in einer Gruppe, dann steht über den Knöpfen eine Zeile wie „In
  Gruppe mit 5 und 7“.

### Speichern
- [ ] Angenommen der Teilnehmer tippt einen Knopf, dann wird sofort gespeichert, ohne
  „Speichern“-Knopf, und eine noch nicht gespeicherte Bewertung bleibt davon unberührt.
- [ ] Angenommen der Teilnehmer lädt die Seite neu oder öffnet sie auf einem anderen Gerät, dann sind
  seine Gruppen unverändert da.
- [ ] Angenommen das Speichern schlägt fehl (z. B. keine Verbindung), dann springt der Knopf auf den
  vorigen Zustand zurück und es erscheint „Verbindung fehlgeschlagen — Merker nicht gespeichert.“
  Die Seite bleibt bedienbar.

### Privatsphäre und Ende
- [ ] Angenommen ein anderer Teilnehmer, der Gastgeber, der Whisky-Steward oder der Admin fragt die
  Merker eines Teilnehmers ab (auch direkt über die Schnittstelle), dann bekommt er nichts.
- [ ] Angenommen das Tasting ist abgeschlossen, wenn der Teilnehmer seine Bewertungsansicht öffnet,
  dann gibt es keine Zeile „Vergleichen mit“ und keine Gruppen mehr.
- [ ] Angenommen das Tasting ist abgeschlossen, wenn jemand direkt versucht, einen Merker zu setzen,
  dann wird das abgelehnt.
- [ ] Angenommen jemand verkostet nicht mit (Whisky-Steward, Außenstehender), wenn er einen Merker
  setzen will, dann wird das abgelehnt.

## Edge Cases
- **Nur ein Whisky ausgeschenkt:** Hinweis statt Knöpfe (siehe AC).
- **Doppeltes Tippen / schnelles Hin und Her:** Der zuletzt gespeicherte Zustand gilt; keine
  doppelten Gruppen.
- **Zwei Geräte gleichzeitig:** Der zuletzt gespeicherte Zustand gilt; das andere Gerät zeigt ihn nach
  dem nächsten Neuladen bzw. Live-Signal.
- **Gruppe schrumpft auf einen Whisky:** Eine Gruppe mit nur einem Whisky gibt es nicht; sie löst sich
  auf.
- **Whisky bewertet oder nicht bewertet:** egal; auch unbewertete ausgeschenkte Whiskies sind wählbar.
- **Tasting mit 10 Whiskies:** bis zu 9 Knöpfe, umbrechend, ohne Scrollen.
- **Testkonten (PROJ-26):** keine Sonderregel.

## Technical Requirements (optional)
- Security: Merker sind nur für den Eigentümer lesbar und schreibbar, auch auf Datenbankebene.
  Kein Einblick für Steward oder Admin.
- Bedienung: Ein Tippen speichert; die Bewertung (Punkte, Notiz) wird dabei nicht mitgespeichert oder
  verworfen.

## Open Questions
- [ ] Keine offen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Vergleichsgruppen statt einzelner Paare; jeder Whisky zeigt alle anderen der Gruppe | Wunsch: auch mehr als 2 Whiskies zusammen vergleichen | 2026-10-09 |
| Ein Whisky in höchstens einer Gruppe; Gruppen verschmelzen | Einfach zu verstehen und anzuzeigen | 2026-10-09 |
| Nur ausgeschenkte Whiskies wählbar | Man vergleicht, was man im Glas hatte; kurze Auswahl | 2026-10-09 |
| Merker verschwinden nach dem Abschluss | Reine Hilfe für den Abend | 2026-10-09 |
| Am eigenen Konto gespeichert | Übersteht Neuladen und Gerätewechsel | 2026-10-09 |
| Privat, auch vor dem Whisky-Steward | Die Merker sagen nichts über Punkte aus, die der Steward braucht | 2026-10-09 |
| Bedienung: Zeile „Vergleichen mit“ mit Nummern-Knöpfen in der Bewertungskarte, sofort gespeichert | Passt zur bestehenden Ansicht und zum Sieger-Tipp (ein Tippen) | 2026-10-09 |
| Antippen eines markierten Whiskys nimmt **diesen** Whisky aus der Gruppe | Eindeutig, auch wenn die Gruppe groß ist | 2026-10-09 |

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
