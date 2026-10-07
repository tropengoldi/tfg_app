# PROJ-20: Whisky-Steward: Live-Einblick in Wertungen

## Status: In Progress
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
| **Zwei neue Lese-Funktionen in der Datenbank** (Wertungen, Tipps) statt zusätzlicher Zweige in den Zugriffsregeln von `ratings` / `winner_tips` | Die Zugriffsregeln auf `ratings` sind der Kern der Blindheit. Eine eigene Funktion lässt sie unangetastet, prüft „Steward dieses Events ∧ Event läuft“ an genau einer Stelle und kann nur lesen. Muster wie der bestehende Zähler `rating_progress` | 2026-10-07 |
| Die Funktionen liefern nur **bereits ausgeschenkte** Whiskies (Position ≤ aktuelle) und **jeden Teilnehmer**, auch ohne Wertung | Die Datenbank erzwingt den Umfang; „noch offen“ muss die Oberfläche nicht selbst zusammensetzen | 2026-10-07 |
| Prüfung strikt auf **Steward** (`helper_id`), nicht auf „darf steuern“ | `can_run_host_control` schließt den Admin ein; der verkostet meist mit und darf den Einblick nicht bekommen | 2026-10-07 |
| Nach dem Abschluss lehnen die Funktionen ab | Das Ende des Einblicks ist so in der Datenbank verankert, nicht nur in der Oberfläche | 2026-10-07 |
| Testkonten-Regel (PROJ-26) gilt auch in den neuen Funktionen | Sie umgehen die Zugriffsregeln (SECURITY DEFINER) und müssen die Sichtbarkeit deshalb selbst beachten, wie die übrigen Funktionen | 2026-10-07 |
| Live-Aktualisierung über den bestehenden Kanal; **neu: das Speichern eines Sieger-Tipps sendet dasselbe inhaltslose Signal** wie das Speichern einer Wertung | Die Steuerungsseite hängt schon am Live-Kanal. Wertungen senden das Signal bereits, Tipps bisher nicht. Keine neue Realtime-Freigabe für `ratings` (würde Punkte über den Kanal verteilen) | 2026-10-07 |
| Whisky-Auswahl als Zustand im Browser (Karte ist eine Client-Komponente) | Bleibt beim Live-Neuladen erhalten; springt nur mit, wenn sich der aktuelle Whisky ändert | 2026-10-07 |
| Hinweis-Daten (Steward-Name) lädt die Bewertungsansicht mit; kein neuer Datenbankweg | Der Steward-Name ist für Teilnehmer schon lesbar (Event + Profil) | 2026-10-07 |
| Keine neuen Pakete; shadcn `Card`, `Collapsible`, `Button` vorhanden | — | 2026-10-07 |

---

## Tech Design (Solution Architect)

### Überblick
Backend **und** Frontend. Eine Datenbank-Migration (zwei Lese-Funktionen), sonst keine Änderung am
Datenmodell. Keine neue Tabelle, keine neue Spalte.

### A) Komponenten-Struktur

```
Steuerungsseite /tastings/[eventId]/gastgeber   (bestehend)
+-- „Läuft gerade“-Karte                        (unverändert, Zähler „5 von 7 haben bewertet“)
+-- NEU: Karte „Wertungen“                      (nur Steward, nur solange das Tasting läuft)
|   +-- Whisky-Auswahl: Knopfleiste 1 … aktueller Whisky (aktueller vorausgewählt)
|   +-- Kopf: „#3 Talisker 10 · Ø 11,5“
|   +-- Je Teilnehmer eine Zeile: Name · Nase · Gaumen = Summe   oder „noch offen“
|   |   +-- Notiz darunter (lange Notizen eingekürzt, „mehr“ klappt auf)
|   +-- Aufklappbar „Sieger-Tipps“: Name → „#5 Lagavulin 16“ oder „kein Tipp“
+-- „Reihenfolge“-Karte                         (unverändert)

Bewertungsansicht /tastings/[eventId]/bewerten  (bestehend)
+-- Bewertungskarte
|   +-- Notizfeld
|       +-- NEU: Hinweis „Whisky-Steward {Name} sieht deine Punkte und Notizen bis zum Abschluss.“
+-- Sieger-Tipp-Feld
    +-- NEU: kurzer Hinweis „Auch dein Tipp ist für {Name} sichtbar.“
```

Beide Hinweise erscheinen nur, wenn das Tasting einen Steward hat und läuft.

### B) Datenmodell (in Worten)
Nichts Neues wird gespeichert. Neu sind zwei **Lese-Funktionen**:

**„Wertungen für den Steward“**, bekommt die Event-ID und liefert je ausgeschenktem Whisky und je
Teilnehmer eine Zeile:
- Ausschank-Nummer und Name des Whiskys
- Teilnehmer: ID und Anzeigename
- Nasenpunkte, Gaumenpunkte, Summe, Notiz (leer, wenn noch nicht bewertet)

**„Sieger-Tipps für den Steward“**, liefert je Teilnehmer:
- Teilnehmer: ID und Anzeigename
- getippter Whisky: Ausschank-Nummer und Name (leer = kein Tipp)

Beide Funktionen
- liefern nur etwas, wenn der Aufrufer **der Steward dieses Events** ist **und** das Event **läuft**,
  sonst Ablehnung mit dem bestehenden Berechtigungs-Fehlercode
- können nur lesen
- beachten die Testkonten-Sichtbarkeit (PROJ-26)

Der Durchschnitt pro Whisky wird in der Oberfläche aus den gelieferten Zeilen berechnet (reine
Funktion, mit Unit-Tests).

### C) Ablauf und Live-Aktualisierung
1. Der Steward öffnet die Steuerungsseite. Der Server prüft „Nutzer = Steward ∧ Event läuft“, ruft
   die beiden Funktionen auf und gibt die Daten an die Karte.
2. Ein Teilnehmer speichert eine Wertung oder (neu) einen Tipp. Sein Gerät sendet das inhaltslose
   Signal „da hat sich was geändert“ auf den Kanal des Events.
3. Die Steuerungsseite hängt schon am Kanal und lädt neu (seit PROJ-26 mit Nachlade-Absicherung). Die
   Karte bekommt frische Daten, die gewählte Whisky-Nummer bleibt.
4. Schaltet der Steward weiter, springt die Auswahl auf den neuen aktuellen Whisky.
5. Nach dem Abschluss erscheint die Karte nicht mehr. Die Funktionen würden ohnehin ablehnen.

### D) Was sich nicht ändert
- Zugriffsregeln auf `ratings`, `winner_tips` und alle Ranglisten-Sichten: unverändert
- Die Ergebnis-Aufschlüsselung bleibt ohne Notizen
- Gastgeber und Admin sehen auf der Steuerungsseite weiterhin nur den Zähler. Hinweis: Der Admin
  darf `ratings` schon seit PROJ-1 auf Datenbankebene lesen. Das bleibt so, PROJ-20 zeigt es ihm aber
  nirgends an

### E) Tests
- **Integration (Datenbank):** Steward bekommt Wertungen/Notizen/Tipps im laufenden Event. Abgelehnt
  werden: nach dem Abschluss, im Entwurf, Steward eines anderen Events, Teilnehmer, Gastgeber, Admin.
  Nur ausgeschenkte Whiskies, Teilnehmer ohne Wertung erscheinen. Bestehende Blindheits-Tests grün
- **Unit:** Durchschnitt und Zeilenaufbau (0 Punkte ≠ „noch offen“, halbe Punkte)
- **E2E:** Steward sieht Karte und Live-Aktualisierung nach Speichern (Wertung und Tipp), Auswahl
  bleibt, Teilnehmer sieht Hinweise, nach dem Abschluss keine Karte, 360 px ohne Scrollen

### F) Abhängigkeiten
Keine neuen Pakete.

### G) Reihenfolge der Umsetzung
`/backend` zuerst (Migration + Integrationstests, Nutzer spielt sie per `db:push` ein), dann
`/frontend`. Die Migration ändert nichts Bestehendes, die alte App läuft mit ihr unverändert weiter.

### Umsetzung Backend (2026-10-07)
- **Migration** `supabase/migrations/20261010120000_steward_insight.sql`:
  - `steward_can_view_insight(event)`: die eine Prüfung „aktives Mitglied ∧ `helper_id` = Aufrufer ∧
    Status `active` ∧ `event_visible` (PROJ-26)“
  - `steward_ratings(event)`: je ausgeschenktem Whisky (Position ≤ aktuelle) × Teilnehmer eine Zeile
    mit Whisky-Name, Teilnehmer-Name, Punkten, Summe, Notiz. Left-Join auf `ratings`, also ohne
    Wertung leere Punkte
  - `steward_winner_tips(event)`: je Teilnehmer der getippte Whisky (Nummer + Name) oder leer
  - SECURITY DEFINER, STABLE, `search_path = ''`, nur `authenticated`. Ablehnung mit `TS004`, kein
    neuer Fehlercode. Zugriffsregeln auf `ratings` / `winner_tips` unverändert
- **Typen:** die drei Funktionen vorab in `src/lib/supabase/types.ts` eingetragen (Form des
  Generators). Nach `db:push` mit `npm run db:types` neu erzeugen. Die Left-Join-Spalten sind dort
  als „nie leer“ typisiert, `src/lib/steward-insight.ts` behandelt sie ausdrücklich als leer-fähig
- **Server-Abfrage:** `getStewardInsight(eventId)` in `src/lib/queries/host-control.ts`. Bei Fehler
  (z. B. TS004) `null`, die Karte entfällt dann, die Seite bricht nicht
- **Aufbereitung:** `src/lib/steward-insight.ts` (`groupStewardRatings`, `mapStewardTips`):
  Gruppierung nach Whisky, Sortierung, Durchschnitt nur über abgegebene Wertungen. 6 Unit-Tests
- **Integrationstest:** `src/lib/supabase/__tests__/steward-insight.integration.test.ts` (10 Fälle:
  Entwurf/Abschluss abgelehnt, Umfang nur ausgeschenkte Whiskies, 0 Punkte ≠ offen, Änderung früherer
  Wertung, Tipps, Abweisung für Gastgeber/Teilnehmer/Admin/Außenstehenden/anderen Steward,
  Zugriffsregeln unverändert, Testkonten-Fall)
- **Für `/frontend` offen:** Karte „Wertungen“, Hinweise in der Bewertungsansicht, Live-Signal beim
  Speichern eines Sieger-Tipps (`winner-tip-context.tsx` sendet bisher keins)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
