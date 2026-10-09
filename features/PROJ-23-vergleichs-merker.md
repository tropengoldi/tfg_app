# PROJ-23: Vergleichs-Merker

## Status: Architected
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
| **Neue Tabelle „Vergleichs-Merker“: eine Zeile je (Tasting, Person, Whisky) mit einer Gruppennummer** | „Ein Whisky in höchstens einer Gruppe“ ist damit schon durch den Schlüssel garantiert; eine Gruppe = alle Zeilen mit derselben Nummer | 2026-10-09 |
| **Lesen nur die eigenen Zeilen** — auch der Admin nicht (anders als bei `ratings`) | Merker sind privat, ohne Ausnahme; Muster wie `winner_tips` | 2026-10-09 |
| **Schreiben nur über eine Datenbank-Funktion „Merker umschalten“** (kein direkter Schreibzugriff) | Verschmelzen, Herausnehmen und Auflösen betreffen mehrere Zeilen und müssen immer zusammen gelingen; die Funktion prüft dabei Teilnehmer, laufendes Tasting und „beide Whiskies ausgeschenkt“ | 2026-10-09 |
| Nach dem Abschluss: **Merker werden gelöscht** (automatisch beim Statuswechsel auf „abgeschlossen“) und sind ab dann ohnehin nicht mehr lesbar | „Verschwinden“ heißt wirklich weg; der Auslöser hängt am Status und greift daher bei jedem Weg des Abschließens, ohne die Abschluss-Funktion selbst anzufassen | 2026-10-09 |
| Neuer Fehlercode **TS026** „Merken ist gerade nicht möglich.“ | Eigene, verständliche Meldung für Entwurf/Abschluss/nicht ausgeschenkt/kein Teilnehmer | 2026-10-09 |
| Die Regeln (umschalten, verschmelzen, auflösen) zusätzlich als **reine Funktion in der App** | Für die sofortige Anzeige beim Tippen (optimistisch) und für Unit-Tests; die Datenbank bleibt maßgeblich | 2026-10-09 |
| **Kein Live-Signal** beim Setzen eines Merkers | Merker sind privat; ein Signal würde alle Geräte des Abends neu laden lassen. Ein zweites eigenes Gerät sieht den Stand beim nächsten Neuladen | 2026-10-09 |
| Knöpfe: shadcn `Button` mit `aria-pressed` (wie die Steward-Karte, PROJ-20); keine neuen Pakete | Toggle-Komponente ist nicht installiert und wird nicht gebraucht | 2026-10-09 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Backend **und** Frontend. Eine Migration: neue Tabelle, eine Funktion zum Umschalten, ein
Aufräum-Auslöser beim Abschluss. In der App eine neue Zeile in der Bewertungskarte.

### A) Komponenten-Struktur

```
Bewertungsansicht /tastings/[eventId]/bewerten       (bestehend)
+-- Sieger-Tipp-Feld                                 (unverändert)
+-- Whisky-Leiste 1 … n                              (unverändert)
+-- Bewertungskarte „Whisky 4 von 8“
|   +-- Nasenpunkte, Gaumenpunkte, Notiz             (unverändert)
|   +-- NEU: Vergleichs-Merker
|   |   +-- „In Gruppe mit 5 und 7“                  (nur wenn in einer Gruppe)
|   |   +-- „Vergleichen mit“  [1] [2] [3] …         (ausgeschenkte außer dem gewählten;
|   |                                                 markierte hervorgehoben, aria-pressed)
|   |   +-- leer: „… sobald weitere Whiskies ausgeschenkt sind.“
|   +-- Speichern                                    (unverändert, nur für die Bewertung)
+-- Meine Rangliste                                  (unverändert)
```

Nur im laufenden Tasting, nur für Mitverkoster. Nach dem Abschluss fehlt die Zeile ganz.

### B) Datenmodell (in Worten)
**Neue Tabelle „Vergleichs-Merker“**, eine Zeile je markiertem Whisky einer Person:
- Tasting
- Person (Eigentümer)
- Whisky
- Gruppennummer (alle Whiskies einer Person mit derselben Nummer bilden eine Gruppe)
- Zeitpunkt der letzten Änderung

Regeln, die die Datenbank garantiert:
- je Person und Whisky höchstens eine Zeile → höchstens eine Gruppe
- eine Gruppe hat immer mindestens 2 Whiskies (Reste werden entfernt)
- lesbar nur für den Eigentümer; kein direkter Schreibzugriff
- beim Löschen eines Tastings, Whiskys oder Kontos gehen die Merker mit

### C) „Merker umschalten“ (Datenbank-Funktion)
Aufruf mit: Tasting, Nummer des gewählten Whiskys, Nummer des angetippten Whiskys.
1. Prüfen: Aufrufer verkostet mit, Tasting läuft, beide Whiskies ausgeschenkt und verschieden →
   sonst TS026.
2. **Beide schon in derselben Gruppe:** den angetippten Whisky herausnehmen; bleibt nur einer übrig,
   die Gruppe auflösen.
3. **Sonst:** zusammenführen — beide (samt ihrer bisherigen Gruppen) bekommen eine gemeinsame
   Gruppennummer.
4. Alles in einem Schritt; gleichzeitige Klicks derselben Person werden nacheinander abgearbeitet.

### D) Abschluss
Beim Statuswechsel eines Tastings auf „abgeschlossen“ löscht ein Auslöser alle Merker dieses
Tastings. Zusätzlich liefert die App die Merker nur im laufenden Tasting.

### E) Änderungen in der App
- **Daten der Bewertungsansicht:** lädt im laufenden Tasting die eigenen Merker mit
- **Reine Regel-Funktion** (`compare-groups`): „wer ist mit Whisky x in einer Gruppe“ und „was
  passiert beim Antippen“ — dieselben Regeln wie die Datenbank, mit Unit-Tests
- **Neue Komponente** in der Bewertungskarte; Tippen zeigt den neuen Stand sofort, speichert im
  Hintergrund, setzt bei Fehler zurück und meldet „Verbindung fehlgeschlagen — Merker nicht
  gespeichert.“ (Netzwerkfehler abgefangen wie bei PROJ-22, damit die Seite bedienbar bleibt)
- Eine ungespeicherte Bewertung bleibt beim Tippen unberührt

### F) Tests
- **Integration:** umschalten, verschmelzen (auch zwei Gruppen), herausnehmen, auflösen; nur
  ausgeschenkte; TS026 im Entwurf/abgeschlossen/für Steward und Außenstehende; niemand liest fremde
  Merker (Teilnehmer, Gastgeber, Steward, Admin); Löschen beim Abschluss; kein direkter Schreibzugriff
- **Unit:** Regel-Funktion inkl. Verschmelzen zweier Gruppen und Auflösen
- **E2E:** Gruppe bilden über die Oberfläche, Anzeige bei allen Whiskies der Gruppe, Neuladen, nach
  dem Abschluss weg, 360 px

### G) Abhängigkeiten
Keine neuen Pakete.

### H) Reihenfolge
`/backend` (Migration + Integrationstests, du spielst sie per `db:push` ein), dann `/frontend`. Die
Migration ist rein additiv; die laufende App merkt nichts davon.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
