# PROJ-20: Whisky-Steward: Live-Einblick in Wertungen

## Status: Deployed
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
- [x] Angenommen ein Tasting mit Whisky-Steward läuft, wenn der Steward seine Steuerungsseite öffnet,
  dann sieht er unter „Läuft gerade“ eine Karte „Wertungen“.
- [x] Angenommen das Tasting ist noch nicht gestartet (Entwurf), wenn der Steward die Steuerungsseite
  öffnet, dann gibt es keine Karte „Wertungen“.
- [x] Angenommen das Tasting ist abgeschlossen, wenn der Steward die Steuerungsseite oder die
  Ergebnisseite öffnet, dann sieht er keine fremden Notizen und keine Karte „Wertungen“ mehr.
- [x] Angenommen ein Tasting **ohne** Steward läuft, wenn Gastgeber oder Admin die Steuerungsseite
  öffnen, dann gibt es keine Karte „Wertungen“. Sie sehen wie bisher nur den Zähler.
- [x] Angenommen ein Tasting mit Steward läuft, wenn der Admin die Steuerungsseite öffnet, dann gibt
  es für ihn keine Karte „Wertungen“.

### Inhalt der Karte
- [x] Angenommen der dritte Whisky ist ausgeschenkt, wenn der Steward die Karte sieht, dann ist
  Whisky 3 vorausgewählt. Er kann über eine Auswahl Whisky 1 bis 3 wählen. Noch nicht ausgeschenkte
  Whiskies sind nicht wählbar.
- [x] Angenommen der Steward hat einen Whisky gewählt, dann sieht er dessen Ausschank-Nummer und Namen
  sowie den Durchschnitt der Gesamtpunkte der bisher abgegebenen Wertungen.
- [x] Angenommen ein Whisky ist gewählt, dann steht für jeden Teilnehmer eine Zeile mit Name,
  Nasenpunkten, Gaumenpunkten und Summe. Hat er eine Notiz geschrieben, steht sie unter der Zeile.
- [x] Angenommen ein Teilnehmer hat den gewählten Whisky noch nicht bewertet, dann steht in seiner
  Zeile „noch offen“.
- [x] Angenommen ein Teilnehmer hat 0 Punkte vergeben, dann steht dort „0“ und nicht „noch offen“.
- [x] Angenommen das Tasting bewertet in halben Punkten, dann erscheinen Punkte mit Komma („7,5“).
- [x] Angenommen der Steward öffnet den Bereich „Sieger-Tipps“ in der Karte, dann sieht er je
  Teilnehmer den getippten Whisky mit Ausschank-Nummer und Namen oder „kein Tipp“.
- [x] Angenommen die Karte zeigt bis zu 10 Teilnehmer bei 360 px Breite, dann gibt es kein
  horizontales Scrollen.

### Live-Aktualisierung
- [x] Angenommen der Steward hat die Karte offen, wenn ein Teilnehmer eine Wertung speichert oder
  ändert, dann erscheint die Änderung ohne Neuladen in der Karte.
- [x] Angenommen der Steward hat einen früheren Whisky gewählt, wenn eine Live-Aktualisierung kommt,
  dann bleibt seine Auswahl erhalten.
- [x] Angenommen der Steward schaltet auf den nächsten Whisky, dann springt die Auswahl auf den neuen
  aktuellen Whisky.
- [x] Angenommen ein Teilnehmer ändert seinen Sieger-Tipp, dann erscheint der neue Tipp ohne Neuladen.

### Hinweis für die Teilnehmer
- [x] Angenommen ein Tasting mit Steward läuft, wenn ein Teilnehmer die Bewertungsansicht öffnet, dann
  steht am Notizfeld dauerhaft der Hinweis „Whisky-Steward {Name} sieht deine Punkte und Notizen bis
  zum Abschluss.“
- [x] Angenommen ein Tasting mit Steward läuft, dann steht auch am Sieger-Tipp-Feld ein kurzer
  Hinweis, dass der Steward den Tipp sieht.
- [x] Angenommen ein Tasting **ohne** Steward läuft, dann gibt es keinen solchen Hinweis.
- [x] Angenommen das Tasting ist abgeschlossen, dann verschwindet der Hinweis.

### Schutz auf Datenbankebene
- [x] Angenommen ein Tasting mit Steward läuft, wenn der Steward die Wertungen, Notizen und Tipps
  seines Events direkt abfragt, dann bekommt er sie.
- [x] Angenommen das Tasting ist abgeschlossen, wenn der (ehemalige) Steward direkt Notizen abfragt,
  dann bekommt er keine fremden Notizen.
- [x] Angenommen jemand ist Steward eines anderen Events, wenn er Wertungen dieses Events abfragt, dann
  bekommt er nichts.
- [x] Angenommen ein Teilnehmer, der Gastgeber oder ein normales Mitglied fragt während des Tastings
  fremde Wertungen, Notizen oder Tipps direkt ab, dann bekommt er nichts, wie bisher.
- [x] Angenommen der Steward fragt direkt ab, dann kann er keine fremden Wertungen oder Tipps
  verändern.
- [x] Angenommen alle bestehenden Blindheits- und RLS-Tests laufen, dann sind sie weiter grün.

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
- [ ] Wortlaut der Hinweise am Notiz- und Tipp-Feld bestätigen (umgesetzt: siehe „Umsetzung Frontend“).
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
- **Eingespielt + verifiziert (2026-10-07):** Nutzer hat `db:push` ausgeführt; `npm run db:types`
  erzeugt exakt die vorab eingetragenen Typen. `npm run test:rls` komplett grün (198/198, davon 10/10
  neu). Zwei Testfehler im ersten Lauf lagen am Test (7,5 Punkte in einem Ganz-Punkte-Tasting → TS021),
  drei Dateien scheiterten zunächst nur am Anmelde-Ratenlimit von Supabase und liefen nach einer Pause
  grün

### Umsetzung Frontend (2026-10-07)
- **Karte „Wertungen“** `src/components/host/steward-insight-card.tsx` (Client-Komponente):
  Knopfleiste 1 … aktueller Whisky (shadcn `Button`, `aria-pressed`, 44 px), Kopf „#n Name · Ø x ·
  k von m bewertet“, je Teilnehmer „Nase · Gaumen = Summe“ oder „noch offen“, Notiz darunter (ab
  140 Zeichen auf 3 Zeilen gekürzt, „mehr“/„weniger“), aufklappbar „Sieger-Tipps (k von m)“
  (shadcn `Collapsible`). Untertitel „Nur du siehst das — bis zum Abschluss.“
- **Einbindung:** `RunPanel` zeigt die Karte zwischen „Läuft gerade“ und „Reihenfolge“, mit
  `key={currentPosition}`: beim Weiterschalten springt die Auswahl auf den neuen Whisky, beim
  Live-Neuladen bleibt sie. `getHostControlData(eventId, userId)` lädt den Einblick nur, wenn der
  Nutzer der Steward ist und das Tasting läuft; Admin/Gastgeber fragen gar nicht erst
- **Hinweise** (Wortlaut zentral in `src/lib/steward-insight.ts`, mit Unit-Tests):
  - Notizfeld: „Whisky-Steward {Name} sieht deine Punkte und Notizen bis zum Abschluss.“ (Auge-Icon,
    per `aria-describedby` am Feld). Der Platzhalter verliert dann „Sieht sonst niemand.“
  - Tipp-Feld: „Whisky-Steward {Name} sieht deinen Tipp.“
  - Ohne lesbaren Namen „Der Whisky-Steward …“. Nur im laufenden Tasting mit Steward
  - `getRatingViewData` liefert dafür `steward: { name } | null`
- **Live-Signal beim Tipp:** `WinnerTipProvider` bietet `registerPing`; die Bewertungsansicht hängt
  ihr `ping` ein, ein gespeicherter Tipp sendet danach dasselbe Signal wie eine Wertung. Kein zweiter
  Live-Kanal
- **Sichtprüfung** (Production-Build, 360 px, temporäres Skript): kein horizontales Scrollen,
  Tipp-Änderung erscheint ohne Neuladen beim Steward, die Whisky-Auswahl bleibt erhalten
- **Offene Frage „Notizen ausblenden“-Schalter für den Steward:** nicht gebaut. Die Karte steht unten
  auf der Seite und ist nur bei Bedarf im Blick. Bei Bedarf als kleiner Nachzug

## QA Test Results

**Tested:** 2026-10-07
**App URL:** http://localhost:3000 (Production-Build) gegen die Live-DB; vorher geprüft: kein aktives
Tasting
**Tester:** QA Engineer (AI)
**Automatisiert:** `tests/PROJ-20-steward-einblick.spec.ts` (7 Tests) — Chromium 7/7, Mobile Safari
7/7, Chromium 5× wiederholt 35/35 ohne Retry. Integration `steward-insight` 10/10, RLS-Suite
198/198. Unit 207/207 (inkl. `steward-insight.test.ts`, 8 Tests)

### Acceptance Criteria Status

#### Sichtbarkeit der Karte
- [x] Laufendes Tasting mit Steward → Karte „Wertungen“ unter „Läuft gerade“ (E2E)
- [x] Entwurf → keine Karte (E2E)
- [x] Abgeschlossen → keine Karte, keine fremden Notizen (E2E; Datenbank lehnt ab, Integration)
- [x] Tasting ohne Steward → Gastgeber sieht nur den Zähler (E2E)
- [x] Admin auf der Steuerungsseite eines Steward-Tastings → keine Karte, nur Zähler (E2E)

#### Inhalt der Karte
- [x] Aktueller Whisky vorausgewählt, nur ausgeschenkte wählbar (E2E: 2 Knöpfe bei Position 2)
- [x] Ausschank-Nummer, Name, Durchschnitt („Ø 4,5 · 2 von 10 bewertet“) (E2E)
- [x] Zeile je Teilnehmer mit Nase · Gaumen = Summe, Notiz darunter (E2E)
- [x] „noch offen“ ohne Wertung (E2E)
- [x] 0 Punkte als „0“, nicht „noch offen“ (E2E + Integration + Unit)
- [x] Halbe Punkte mit Komma („7,5“, „11,5“) (E2E)
- [x] Sieger-Tipps aufklappbar, getippter Whisky oder „kein Tipp“ (E2E)
- [x] 10 Teilnehmer bei 360 px ohne horizontales Scrollen, auch mit aufgeklappter langer Notiz (E2E)

#### Live-Aktualisierung
- [x] Teilnehmer speichert Wertung über die Oberfläche → erscheint ohne Neuladen (E2E)
- [x] Gewählter früherer Whisky bleibt beim Live-Neuladen gewählt (E2E)
- [x] Weiterschalten → Auswahl springt auf den neuen Whisky (E2E)
- [x] Tipp-Änderung erscheint ohne Neuladen (E2E)

#### Hinweis für die Teilnehmer
- [x] Hinweis am Notizfeld mit Namen, per `aria-describedby` verknüpft; Platzhalter ohne „Sieht sonst
  niemand.“ (E2E)
- [x] Hinweis am Tipp-Feld (E2E)
- [x] Ohne Steward kein Hinweis, alter Platzhalter bleibt (E2E)
- [x] Nach dem Abschluss kein Hinweis (E2E)

#### Schutz auf Datenbankebene
- [x] Steward bekommt Wertungen, Notizen, Tipps im laufenden Tasting (Integration)
- [x] Nach dem Abschluss abgelehnt (Integration)
- [x] Steward eines anderen Events abgelehnt (Integration)
- [x] Teilnehmer, Gastgeber, Admin, Außenstehender abgelehnt; direkte Abfragen von `ratings` /
  `winner_tips` liefern weiter nur Eigenes (Integration)
- [x] Steward kann nichts verändern: Funktionen nur lesend; kein Schreibrecht auf `ratings` fremder
  Personen und keins auf `tasting_events` (Code-Review)
- [x] Bestehende Blindheits- und RLS-Tests grün (198/198)

### Edge Cases Status
- [x] Steward-Wechsel während des Abends ausgeschlossen (nur im Entwurf änderbar, PROJ-11)
- [x] Geänderte frühere Wertung sofort sichtbar (Integration)
- [x] Geleerte Notiz verschwindet (Unit: Leer-/Leerzeichen-Notiz → keine Notiz)
- [x] Sehr lange Notiz: auf 3 Zeilen gekürzt, „mehr“/„weniger“, kein Scrollen (E2E)
- [x] Noch niemand bewertet: „–“ als Durchschnitt, alle „noch offen“ (Unit)
- [x] Live-Verbindung weg: bestehender „Nicht live“-Hinweis der Steuerungsseite greift (unverändert)
- [x] Deaktivierter Teilnehmer: Wertungen bleiben sichtbar (Code-Review: kein Aktiv-Filter auf den
  Teilnehmern)
- [x] Testkonten: echter Steward eines Test-Tastings bekommt nichts (Integration)
- [x] Steward öffnet die Bewertungsansicht: weiterhin kein Zugang (unverändert, PROJ-11)

### Security Audit Results
- [x] Prüfung strikt auf `helper_id` = Aufrufer ∧ läuft ∧ aktiv ∧ sichtbar, nicht `can_run_host_control`
  (Admin ausgeschlossen; Integration)
- [x] Keine Erweiterung der Zugriffsregeln auf `ratings` / `winner_tips`; `anon` hat keine Rechte
- [x] Steward-Zuordnung nicht kaperbar: `tasting_events` hat für Mitglieder kein Schreibrecht, die
  Zuordnung läuft nur über die Admin-Funktion im Entwurf
- [x] Notizen werden als Text ausgegeben, keine HTML-Einfügung → kein XSS über Notizen
- [x] Notizen gelangen nur in die Antwort an den Steward: die Steuerungsseite fragt den Einblick nur
  für ihn ab, Admin/Gastgeber bekommen ihn auch nicht im RSC-Payload
- [i] **Hinweis (kein Bug):** `steward_can_view_insight(id)` ist für Mitglieder aufrufbar und verrät
  nur, ob man selbst Steward eines laufenden Events ist
- [i] **Hinweis (vorbestehend):** Das inhaltslose Live-Signal kann jedes Mitglied auf dem Kanal
  senden; Folge ist nur ein Neuladen. Unverändert seit PROJ-8

### Regression
- PROJ-7/8/11/22/24 auf Chromium + Mobile Safari: 101 passed, 13 skipped, 2 failed → beide derselbe
  PROJ-11-Test („Helfer sieht ‚Steuern‘ …“). **Keine App-Regression:** der Steward sieht den
  Whisky-Namen jetzt zweimal (neue Karte + Reihenfolge), der Test suchte unscharf
  (`getByText('run-Dram-1')` → 2 Treffer). Locator auf `exact: true` geschärft, PROJ-11 danach 10/10

### Bugs Found
Keine.

### Summary
- **Acceptance Criteria:** 27/27 passed
- **Bugs Found:** 0
- **Security:** Pass (2 Hinweise ohne Handlungsbedarf)
- **Production Ready:** YES
- **Recommendation:** `/deploy` (Migration `20261010120000_steward_insight.sql` ist bereits live)

## Deployment
- **Production URL:** https://tfg-app-self.vercel.app
- **Deployed:** 2026-10-07 als `v1.13.0` (Commit `77ce289`, Vercel „Deployment has completed“)
- **DB-Migration:** `20261010120000_steward_insight.sql` war vorab per `db:push` eingespielt (in der
  QA verifiziert); kein aktives Tasting zum Zeitpunkt des Deployments
- **Pre-Deploy-Checks:** Build + Lint grün, keine Secrets im Repo, QA ohne Bugs
