# PROJ-8: Tasting-Dashboard mit Live-Sync

## Status: Planned
**Created:** 2026-08-29
**Last Updated:** 2026-08-29

## Dependencies
- **Requires: PROJ-7 (Bewertungsansicht)** — die Ansicht existiert und bekommt in
  PROJ-8 die Live-Aktualisierung verdrahtet.
- **Requires: PROJ-6 (Gastgeber-Steuerung)** — dito für den Bewertungs-Fortschritt
  und den Status.
- **Requires: PROJ-5 (Whisky-Erfassung)** — der „Meine Whiskys"-Absprung.
- **Requires: PROJ-4 (Admin – Tasting-Events)** — Events + Teilnehmerliste.
- **Requires: PROJ-2** — App-Shell, Start-Tab, Login.
- **Baut auf PROJ-1** — die Realtime-Publication auf `tasting_events` und
  `whiskies` (`replica identity full`), die bewusst **nicht** `ratings` /
  `whisky_details` umfasst; die Regel „höchstens ein Tasting gleichzeitig aktiv";
  die RLS, die auch über den Realtime-Kanal greift.

## Kontext

Das Dashboard ist der **Knotenpunkt eines Tasting-Abends**. Es ist die Start-Seite
(`/`) — heute ein Platzhalter, ab PROJ-8 die Live-Übersicht des laufenden Abends:
Eckdaten, wer dabei ist, wie weit die Runde ist (Gläserstreifen „Whisky 3 von 8"),
und von hier springt man ins Bewerten, in die Gastgeber-Steuerung oder in die
Historie.

Das Besondere ist die **Live-Aktualisierung**: schaltet der Gastgeber auf den
nächsten Whisky weiter, springen alle Handys automatisch mit — auf dem Dashboard,
in der Bewertungsansicht und in der Gastgeber-Steuerung. Kein Neuladen, kein
„Aktualisieren"-Knopf mehr im Normalfall.

Die **Blindheit hält**: über den Realtime-Kanal wandern nur Event- und
Whisky-Positions-Daten — nie Punkte, nie Whisky-Namen, nie Notizen. Ein
„Live-Leaderboard" während des Abends gibt es nicht; die Rangliste erscheint erst
mit dem Abschluss (PROJ-9).

PROJ-8 ist bewusst das letzte P0: es ist überwiegend Komposition dessen, was
PROJ-4 bis PROJ-7 schon gebaut haben, plus die Realtime-Schicht.

## User Stories

- Als **Teilnehmer** möchte ich auf einen Blick sehen, welcher Abend gerade läuft
  und wie weit die Runde ist, damit ich mitkomme.
- Als **Teilnehmer** möchte ich, dass mein Bildschirm automatisch mitspringt, wenn
  der Gastgeber weiterschaltet, damit ich nicht manuell aktualisieren muss.
- Als **Teilnehmer** möchte ich vom Dashboard aus direkt ins Bewerten springen,
  damit der Weg kurz ist.
- Als **Gastgeber** möchte ich vom Dashboard aus in meine Steuerung springen.
- Als **Nutzer** möchte ich sehen, wenn die Live-Verbindung weg ist, damit ich
  weiß, dass ich den Stand von Hand nachladen sollte.
- Als **Nutzer** möchte ich, wenn gerade kein Tasting läuft, meinen nächsten Abend
  oder den Weg zur Historie finden.

## Out of Scope

- **Die Rangliste selbst und die Historien-Detailansicht** → PROJ-9. Das Dashboard
  zeigt nach dem Abschluss nur „abgeschlossen" + einen Absprung.
- **Auflösung der Whisky-Namen** → PROJ-9. Der Gläserstreifen bleibt namenlos.
- **Push-Benachrichtigungen** → PRD Non-Goal.
- **Geteilter Cross-Device-Zustand** — jedes Gerät abonniert den Live-Kanal
  unabhängig; kein „auf meinem Handy weiterblättern schaltet das Tablet mit".
- **Realtime auf `ratings` / `whisky_details`** — von PROJ-1 bewusst nicht
  publiziert (kein Geheimnis über einen Kanal).
- **Präsenz / „wer ist gerade online"** — nicht im MVP.
- **Ein Live-Aggregat / Zwischenstand der Punkte** — die Blindheit hält bis zum
  Abschluss.
- **Ein neuer Absprung in der Bottom-Nav** — das Dashboard *ist* der Start-Tab.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Welches Tasting das Dashboard zeigt

- [ ] Angenommen ein Tasting läuft und der Nutzer ist dessen Teilnehmer, wenn er
      die Start-Seite öffnet, dann sieht er das Dashboard dieses Abends (Eckdaten,
      Teilnehmerliste, Gläserstreifen, Absprünge).
- [ ] Angenommen kein Tasting läuft, aber der Nutzer ist bei einem Event „In
      Vorbereitung" eingetragen, wenn er die Start-Seite öffnet, dann sieht er eine
      Vorschau-Karte („Nächster Abend: Datum · Ort") mit einem Link zu „Meine
      Whiskys".
- [ ] Angenommen kein Tasting läuft und der Nutzer hat kein bevorstehendes Event,
      wenn er die Start-Seite öffnet, dann sieht er „Gerade läuft kein Tasting."
      und einen Link zu den vergangenen Tastings.
- [ ] Angenommen ein Tasting läuft, aber der Nutzer ist **nicht** dessen Teilnehmer
      und **kein** Admin, wenn er die Start-Seite öffnet, dann verhält sich das
      Dashboard wie „kein Tasting aktiv" (kein Hinweis, dass etwas läuft).
- [ ] Angenommen ein Tasting läuft und der Nutzer ist Admin, aber nicht
      Teilnehmer, wenn er die Start-Seite öffnet, dann sieht er das volle Dashboard
      als Info-Ansicht **mit** „Steuern", aber **ohne** „Jetzt bewerten".

### Dashboard-Inhalt

- [ ] Angenommen ein Event läuft, wenn der Teilnehmer das Dashboard betrachtet,
      dann sieht er Datum und Ort, das Thema, die Info zum Essen und die
      Anmerkungen des Gastgebers (jeweils nur, falls gesetzt) sowie die
      Teilnehmerliste mit Anzeigenamen, wobei der Gastgeber markiert ist.
- [ ] Angenommen ein Event läuft mit N Whiskys und aktueller Position k, wenn der
      Nutzer den Gläserstreifen betrachtet, dann sind die Positionen vor k als
      leeres Glas, k als hervorgehobenes Glas und die nach k als volles Glas
      dargestellt, mit dem Text „Whisky k von N".
- [ ] Angenommen ein Event ist „In Vorbereitung", wenn der Nutzer den
      Gläserstreifen betrachtet, dann sind alle Gläser voll und der Text lautet
      „Whisky 0 von N".
- [ ] Angenommen ein Event ist abgeschlossen, wenn der Nutzer das Dashboard
      betrachtet, dann sind alle Gläser leer, es steht „Der Abend ist
      abgeschlossen" da und es gibt einen Absprung „Zur Rangliste".
- [ ] Angenommen das Dashboard zeigt ein laufendes Event, wenn der Nutzer die
      Absprünge betrachtet, dann sieht er „Jetzt bewerten" (nur Teilnehmer),
      „Steuern" (nur Gastgeber/Admin), „Meine Whiskys" (immer) und ganz unten
      „Vergangene Tastings" (immer).
- [ ] Angenommen der Gläserstreifen hat bis zu 10 Positionen, wenn er auf einem
      Smartphone (375 px) dargestellt wird, dann ist er ohne horizontales Scrollen
      lesbar.

### Live-Sync

- [ ] Angenommen ein Nutzer hat das Dashboard offen und der Gastgeber schaltet auf
      den nächsten Whisky weiter, wenn das Live-Ereignis eintrifft, dann
      aktualisieren sich Gläserstreifen und „x von y" ohne Neuladen der Seite.
- [ ] Angenommen ein Nutzer hat das Dashboard offen und der Gastgeber ändert Thema,
      Essen oder Anmerkungen, wenn das Live-Ereignis eintrifft, dann zeigt das
      Dashboard die neuen Werte ohne Neuladen.
- [ ] Angenommen ein Nutzer hat das Dashboard offen und der Gastgeber schließt das
      Event ab, wenn das Live-Ereignis eintrifft, dann wechselt das Dashboard ohne
      Neuladen in den Abschluss-Zustand (leere Gläser, „abgeschlossen", „Zur
      Rangliste").
- [ ] Angenommen ein Event ist „In Vorbereitung" und ein Teilnehmer trägt einen
      Whisky ein, wenn das Live-Ereignis eintrifft, dann ziehen die Gläserzahl und
      „x von y" auf dem Dashboard live nach.
- [ ] Angenommen ein Teilnehmer hat die Bewertungsansicht offen und der Gastgeber
      schaltet weiter, wenn das Live-Ereignis eintrifft, dann wird die neue
      Position automatisch bewertbar und der Fokus springt auf den neuen aktuellen
      Whisky — es sei denn, es sind ungespeicherte Änderungen offen; dann bleibt
      der Fokus und es erscheint der Hinweis „aktuell ist Whisky N".
- [ ] Angenommen der Gastgeber hat die Steuerung offen und eine Bewertung geht ein
      bzw. der Status ändert sich, wenn das Live-Ereignis eintrifft, dann ziehen
      der Bewertungs-Fortschritt und der Status ohne Knopfdruck nach.

### Verbindung & Degradation

- [ ] Angenommen der Realtime-Kanal ist getrennt, wenn der Nutzer das Dashboard
      betrachtet, dann erscheint ein dezenter Hinweis „Nicht live — tippen zum
      Aktualisieren" und die Seite funktioniert mit dem zuletzt geladenen Stand
      weiter.
- [ ] Angenommen der „Nicht live"-Hinweis wird angezeigt, wenn der Nutzer darauf
      tippt, dann wird der aktuelle Stand einmal nachgeladen.
- [ ] Angenommen der Realtime-Kanal verbindet sich von selbst wieder, wenn das
      passiert, dann verschwindet der Hinweis und der Stand wird einmal nachgezogen.
- [ ] Angenommen der Nutzer kehrt aus dem Handy-Standby zurück, wenn die Seite
      wieder sichtbar wird, dann wird der Stand einmal nachgeladen.

### Zustände & Sicherheit

- [ ] Angenommen das Dashboard lädt seine Daten, wenn die Seite rendert, dann
      erscheint ein Skeleton, bis die Daten da sind.
- [ ] Angenommen die Dashboard-Daten sind nicht abrufbar, wenn die Seite rendert,
      dann erscheint ein Fehlerhinweis mit „Erneut versuchen" statt einer leeren
      Seite.
- [ ] Angenommen ein Nutzer ist nicht Teilnehmer des laufenden Events, wenn der
      Gastgeber weiterschaltet, dann bekommt dieser Nutzer über den Realtime-Kanal
      **kein** Update dieses Events (die RLS gilt auch für Realtime).
- [ ] Angenommen der Realtime-Kanal überträgt Daten, wenn ein Ereignis eintrifft,
      dann enthält es nur Event- und Whisky-Positions-Daten — nie Punkte, nie
      Whisky-Namen, nie Notizen.
- [ ] Angenommen ein Event läuft, wenn der Nutzer das Dashboard betrachtet, dann
      wird kein Punkte-Aggregat und kein Zwischenstand der Wertung angezeigt.

## Edge Cases

- **Der Gastgeber schaltet mehrfach schnell hintereinander weiter.** Erwartung:
  das Dashboard folgt jedem Schritt und zeigt immer nur den letzten Stand; keine
  aufgestaute Animations-Warteschlange.
- **Ein Tasting endet, kurz darauf startet ein anderes.** Erwartung: das Dashboard
  wechselt beim nächsten Laden bzw. Live-Ereignis auf das neue aktive Event. (Zwei
  gleichzeitig aktive schließt PROJ-1 aus.)
- **Der Nutzer wird aus der Teilnehmerliste des laufenden Abends entfernt, während
  das Dashboard offen ist.** Erwartung: praktisch ausgeschlossen (`TS009` sobald
  Whiskys/Bewertungen dranhängen); tritt es doch ein, greift beim nächsten Laden
  die „kein Tasting für dich"-Logik.
- **Ein Live-Ereignis für ein Event, das der Nutzer gerade nicht angezeigt
  bekommt** (veralteter Kanal). Erwartung: wird ignoriert; maßgeblich ist immer
  „das eine aktive Event, das ich lesen darf".
- **Realtime nicht verfügbar (Server/Netz).** Erwartung: Dashboard und
  Bewertungsansicht funktionieren mit dem letzten Stand; „Nicht live"-Hinweis;
  manuelles Nachladen möglich.
- **Zwei Tabs/Geräte desselben Nutzers.** Erwartung: beide bekommen dieselben
  Live-Updates unabhängig; kein geteilter Zustand.
- **In der Bewertungsansicht sind ungespeicherte Änderungen offen, als der
  Gastgeber weiterschaltet.** Erwartung: der Fokus springt **nicht**; die neue
  Position wird bewertbar und der „aktuell ist Whisky N"-Hinweis erscheint.

## Technical Requirements

- **Ein Realtime-Kanal pro aktivem Event**, den Dashboard, Bewertungsansicht und
  Gastgeber-Steuerung gemeinsam nutzen. Er hört auf Änderungen an
  `tasting_events` (Status, aktuelle Position, Eckdaten) und `whiskies` (Anzahl,
  im Draft).
- **Die RLS gilt auch für Realtime:** ein Nutzer bekommt nur Ereignisse für
  Zeilen, die er lesen darf. Ein Nicht-Teilnehmer erhält keine Updates des
  laufenden Events.
- **Kein Geheimnis über den Kanal:** `ratings` und `whisky_details` sind nicht
  publiziert (PROJ-1). Alles, was Punkte/Namen/Notizen betrifft, wird weiterhin
  nur über die normalen, RLS-geschützten Abfragen geholt — nach dem Abschluss.
- **Graceful Degradation:** bei getrenntem Kanal bleibt der letzte Stand nutzbar,
  ein Hinweis plus manuelles Nachladen; automatisches Nachziehen bei
  Reconnect und bei Rückkehr aus dem Standby.
- **Höchstens ein aktives Event** (PROJ-1) — „das aktuelle Tasting" ist eindeutig.
- **Mobile-first:** Gläserstreifen bis 10 ohne Scrollen; die Absprünge groß und
  klar; das Dashboard in wenigen Sekunden erfassbar.
- **Zustände** (nach `docs/design-system.md`): Laden (Skeleton), Ladefehler mit
  Retry, „kein Tasting aktiv", Vorschau, Abschluss-Zustand, „Nicht live"-Hinweis.

## Open Questions

- [ ] Wie oft/aggressiv soll bei „Nicht live" automatisch ein Reconnect versucht
      werden, bevor der Hinweis erscheint? *(Detail für `/architecture` /
      `/frontend`; Tendenz: kurze automatische Retries, Hinweis erst nach einigen
      Sekunden ohne Verbindung.)*
- [ ] Soll das Dashboard nach dem Abschluss den Abend noch bis zum nächsten
      manuellen Neuladen zeigen (mit Abschluss-Hinweis) oder direkt in die „kein
      Tasting aktiv"-Ansicht wechseln? *(Tendenz: bis zum Neuladen stehen lassen,
      damit der „Zur Rangliste"-Absprung präsent bleibt.)*
- [ ] Braucht die Vorschau-Karte für den nächsten Abend eine eigene kleine
      Query oder lässt sie sich aus der „Meine Tastings"-Liste (PROJ-5) ableiten?
      *(Detail für `/architecture`.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Das Dashboard ist die Start-Seite (`/`); kein neuer Nav-Punkt | „Start" ist der natürliche Ort für „was läuft gerade"; die Bottom-Nav bleibt schlank | 2026-08-29 |
| Zeigt das **eine** aktive Event, wenn der Nutzer Teilnehmer oder Admin ist; sonst Vorschau des nächsten eigenen Abends bzw. „kein Tasting aktiv" | „Höchstens ein aktives Event" macht die Auswahl eindeutig; ein Nicht-Teilnehmer soll nicht mal erfahren, dass etwas läuft | 2026-08-29 |
| Admin ohne Teilnahme sieht das volle Info-Dashboard + „Steuern", aber kein „Jetzt bewerten" | Er darf jedes Event lesen und steuern, aber nicht für sich bewerten (er ist kein Teilnehmer) | 2026-08-29 |
| Gläserstreifen: leer = verkostet, hervorgehoben = aktuell, voll = ausstehend; Draft „0 von N"; abgeschlossen alle leer | Direkte Übersetzung des PRD-Bildes; die aktuelle Position als eigener Zwischenzustand macht „wo sind wir" sofort klar | 2026-08-29 |
| PROJ-8 verdrahtet Live-Sync an **drei** Stellen: Dashboard, Bewertungsansicht (PROJ-7), Gastgeber-Steuerung (PROJ-6) | „Alle Handys springen mit" betrifft den ganzen Abend-Flow, nicht nur das Dashboard; die manuellen „Aktualisieren"-Knöpfe aus PROJ-6/7 werden zum stillen Fallback | 2026-08-29 |
| Ein geteilter Realtime-Kanal pro aktivem Event | Ein Abonnement statt drei; alle drei Ansichten hören auf dieselben `tasting_events`/`whiskies`-Änderungen | 2026-08-29 |
| Bei getrenntem Kanal: weiterarbeiten mit letztem Stand + „Nicht live"-Hinweis mit manuellem Nachladen; Auto-Nachziehen bei Reconnect/Standby-Rückkehr | Ein Tasting-Abend hat WLAN-Hänger; die App darf nie leer werden, aber der Nutzer soll wissen, wann er dem Stand nicht trauen kann | 2026-08-29 |
| Dashboard rendert die Rangliste **nicht** selbst — nur „abgeschlossen" + Absprung „Zur Rangliste" | Die Rangliste ist PROJ-9; das Dashboard bleibt der Knotenpunkt, nicht die Ergebnisseite | 2026-08-29 |
| Über den Kanal wandern nur Event-/Positions-Daten, nie Punkte/Namen/Notizen; kein Live-Aggregat | PROJ-1 publiziert bewusst nur `tasting_events`/`whiskies`; die Blindheit hält bis zum Abschluss | 2026-08-29 |
| Kein geteilter Cross-Device-Zustand, keine Präsenz-Anzeige | Nicht nötig für den MVP; jedes Gerät folgt dem Server unabhängig | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
