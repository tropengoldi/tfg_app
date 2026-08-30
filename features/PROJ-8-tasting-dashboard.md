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
      *(Tendenz: die PROJ-5-Abfrage wiederverwenden — nächstes Draft-Event.)*
- [ ] Kanalname: pro Event fix aus der Event-ID gebildet — bestätigen, dass
      Dashboard, Bewertungsansicht und Gastgeber-Steuerung exakt denselben Namen
      bilden. *(Detail für `/frontend`.)*
- [ ] Debounce-Fenster fürs Neu-Berechnen (Vorschlag 300–500 ms) und Zeit ohne
      Verbindung, bis der „Nicht live"-Streifen erscheint (Vorschlag ~5 s).
      *(Detail für `/frontend`.)*

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
| PROJ-8 ist Frontend-only — keine Migration, kein neues Publish | Realtime auf `tasting_events` / `whiskies` (`replica identity full`) liegt seit PROJ-1; die Blindheits-Regel „kein Geheimnis über den Kanal" bleibt unangetastet | 2026-08-29 |
| Auf ein Realtime-Ereignis reagiert die Seite mit „sich neu berechnen" (derselbe RLS-Lesepfad), nicht mit Payload-Deltas im Browser | Der Server bleibt die einzige Wahrheit; die Datenmenge ist winzig; robust gegen verpasste / umsortierte Ereignisse. Konsistent mit dem `router.refresh`-Muster aus PROJ-5 / 6 / 7 | 2026-08-29 |
| Ein geteilter Kanal pro Event (`src/hooks/use-event-realtime.ts`), den Dashboard + Bewertungsansicht + Gastgeber-Steuerung gemeinsam abonnieren | Ein Abonnement-Baustein statt drei Insellösungen; alle hören auf dieselben Zeilenänderungen | 2026-08-29 |
| Für den Gastgeber-Fortschritt: der speichernde Client sendet einen **inhaltslosen Broadcast-Ping** auf den Kanal (kein DB-Publish von `ratings`) | Der Fortschritt zieht live nach, ohne dass je ein Punkt / Name über den Draht geht; rein clientseitig, keine Backend-Änderung | 2026-08-29 |
| „Nicht live"-Streifen + manuelles Nachladen; Auto-Nachziehen bei Reconnect und bei Rückkehr aus dem Standby | Ein Tasting-Abend hat WLAN-Hänger; die App wird nie leer, der Nutzer weiß aber, wann der Stand alt sein könnte | 2026-08-29 |
| Die „Aktualisieren"-Knöpfe aus PROJ-6 / 7 bleiben als stiller Fallback | Für den „Nicht live"-Fall braucht es weiter einen manuellen Weg | 2026-08-29 |
| Kurzes Bündeln (Debounce) der Neu-Berechnung bei schnellen Mehrfach-Ereignissen | Fünf Weiterschalt-Klicks in Folge sollen einen Refresh auslösen, nicht fünf | 2026-08-29 |
| Dashboard-Zustand („aktiv" / „Vorschau" / „nichts") aus **einem** RLS-gefilterten Lesen abgeleitet | Ein Nicht-Teilnehmer bekommt das aktive Event gar nicht — die „verrät nichts"-Regel ergibt sich automatisch | 2026-08-29 |
| Die Start-Seite `(app)/page.tsx` wird das Dashboard; kein neuer Nav-Punkt | „Start" ist der natürliche Ort; die Bottom-Nav bleibt schlank | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** Die Start-Seite wird zum Live-Dashboard des
> aktuellen Abends. Dahinter ein einziger geteilter „Kanal" pro Abend, auf dem
> alle Geräte hören; passiert etwas (weiterschalten, abschließen, Eckdaten
> ändern, jemand bewertet), holen sie sich in Sekundenbruchteilen den neuen
> Stand. Keine neuen Pakete, keine Datenbank-Änderung — die Realtime-Leitung
> liegt seit PROJ-1.

### 1. Seitenstruktur

```
(app)-Bereich
└─ /  (Start-Tab)  =  das Dashboard
   │
   ├─ Zustand „ein Tasting läuft"  (Nutzer = Teilnehmer oder Admin)
   │   ├─ Live-Streifen   (unsichtbar, außer bei „Nicht live")
   │   │     „Nicht live — tippen zum Aktualisieren"
   │   ├─ Kopf            Datum · Ort · Status-Badge
   │   ├─ Gläserstreifen  ● ● ◐ ○ ○ ○ ○ ○   „Whisky 3 von 8"
   │   │     leer = verkostet · hervorgehoben = aktuell · voll = ausstehend
   │   ├─ Eckdaten        Thema · Info zum Essen · Anmerkungen  (je falls gesetzt)
   │   ├─ Teilnehmerliste Namen, Gastgeber markiert
   │   ├─ Absprünge
   │   │     „Jetzt bewerten"    (nur Teilnehmer, nur wenn läuft)
   │   │     „Steuern"           (nur Gastgeber / Admin)
   │   │     „Meine Whiskys"     (immer)
   │   │     „Zur Rangliste"     (nur nach Abschluss — Platzhalter bis PROJ-9)
   │   └─ „Vergangene Tastings"  (immer, unten — Platzhalter bis PROJ-9)
   │
   ├─ Zustand „kein Tasting aktiv, aber nächster eigener Abend"
   │     Vorschau-Karte „Nächster Abend: Fr, 12. Sep · bei Hermann" + „Meine Whiskys"
   │
   ├─ Zustand „kein Tasting, kein bevorstehender"
   │     „Gerade läuft kein Tasting." + „Vergangene Tastings"
   │
   ├─ Laden       → Skeleton
   └─ Ladefehler  → Hinweis + „Erneut versuchen"
```

**Neue Bausteine**

- Die Start-Seite `src/app/(app)/page.tsx` wird das Dashboard (ersetzt den
  Platzhalter), plus `loading.tsx` / `error.tsx`.
- Komponenten unter `src/components/dashboard/`: der Gläserstreifen, die
  Eckdaten-Karte, die Teilnehmerliste, die Absprung-Leiste, die Vorschau- /
  Leer-Karten.
- **Ein geteilter Realtime-Baustein** `src/hooks/use-event-realtime.ts`:
  abonniert für ein Event den Kanal, meldet „es hat sich was geändert" und ob die
  Verbindung steht. Wird von drei Seiten benutzt.
- Ein winziger Client-Wrapper `<RealtimeRefresher eventId=… />`, der den Baustein
  einhängt und (nur bei getrennter Verbindung) den „Nicht live"-Streifen zeigt.
  Kommt einmal aufs Dashboard, einmal in die Bewertungsansicht (PROJ-7), einmal
  in die Gastgeber-Steuerung (PROJ-6).
- Datenzugriff: eine Lese-Datei „Dashboard-Stand" (aktives Event + Eckdaten +
  Teilnehmer + Whiskyzahl, sonst Vorschau / Leer).

### 2. Datenmodell (nichts Neues an Tabellen)

PROJ-8 nutzt ausschließlich, was PROJ-1 bereitgestellt hat:

- **`tasting_events`** — Status, aktuelle Position, Datum, Ort, Thema, Info zum
  Essen, Anmerkungen. **Für Realtime freigegeben** (mit „vollständiger Zeile",
  damit die Clients alt gegen neu vergleichen und filtern können).
- **`whiskies`** — nur Anzahl / Positionen (für den Gläserstreifen). Ebenfalls
  für Realtime freigegeben.
- **`event_participants`** + **`profiles`** — die Namensliste (kein Realtime
  nötig, die Teilnehmer ändern sich am Abend nicht).
- **`ratings` / `whisky_details`** — **nicht** für Realtime freigegeben
  (PROJ-1). Punkte, Namen und Notizen wandern nie über einen Kanal.

Der „Dashboard-Stand" ist ein abgeleitetes Objekt, kein gespeichertes Feld:
entweder „aktives Event + Kontext", oder „Vorschau des nächsten eigenen Abends",
oder „nichts". Welcher Fall gilt, hängt am RLS-gefilterten Lesen (ein
Nicht-Teilnehmer bekommt das aktive Event gar nicht).

### 3. Der eine geteilte Kanal

Für ein Event gibt es **genau einen** Realtime-Kanal. Dashboard,
Bewertungsansicht und Gastgeber-Steuerung abonnieren denselben Kanal (denselben
Namen, aus der Event-ID gebildet). Der Kanal transportiert zweierlei:

| Auslöser | Was passiert |
|---|---|
| Der Gastgeber schaltet weiter, schließt ab oder ändert Eckdaten → `tasting_events` ändert sich | Supabase schickt die Zeilenänderung an **jeden Client, der die Zeile lesen darf** (RLS gilt auch hier). Der Client berechnet daraufhin seine Seite neu. |
| Im Draft trägt jemand einen Whisky ein → `whiskies` ändert sich | dito für Gläserstreifen und „x von y". |
| Ein Teilnehmer speichert eine Bewertung | Sein Client sendet zusätzlich einen **inhaltslosen Ping** auf den Kanal („da hat sich was geändert" — **keine** Zahl, **kein** Name). Der Gastgeber-Client hört ihn und holt den Fortschritt neu. |

**„Den frischen Stand holen"** heißt: die betroffene Seite berechnet sich neu
(derselbe RLS-geschützte Lesepfad wie beim ersten Laden). Kein Zusammenbauen von
Teil-Updates im Browser — der Server bleibt die einzige Wahrheit, und die
Datenmenge (eine Event-Zeile, eine Seite) ist winzig. Bei schnellen
Mehrfach-Schritten des Gastgebers wird das Neu-Berechnen kurz gebündelt (ein
Refresh statt fünf).

### 4. Live-Sync in PROJ-6 und PROJ-7 — fast geschenkt

- **Bewertungsansicht (PROJ-7):** die Logik „bei Positionswechsel den Fokus
  mitnehmen, außer es sind ungespeicherte Änderungen offen" ist **schon gebaut**
  (sie reagiert auf die aktuelle Position aus dem Server-Stand). PROJ-8 fügt nur
  den Auslöser hinzu: der Realtime-Baustein sorgt dafür, dass sich die Seite bei
  einem Weiterschalten neu berechnet — der Rest passiert von selbst. Der
  „Aktualisieren"-Knopf bleibt als stiller Fallback stehen.
- **Gastgeber-Steuerung (PROJ-6):** analog — der Baustein löst das Neu-Berechnen
  aus, `rating_progress` und Status kommen frisch. Der „Aktualisieren"-Knopf
  bleibt als Fallback.

### 5. Wenn die Verbindung wackelt

- Der Realtime-Baustein kennt den Verbindungszustand (verbunden / Fehler /
  geschlossen). Bei „nicht verbunden" erscheint der dezente Streifen „Nicht
  live — tippen zum Aktualisieren"; ein Tipp berechnet die Seite neu.
- Verbindet sich der Kanal von selbst wieder → der Streifen verschwindet und die
  Seite berechnet sich **einmal** neu.
- Kommt das Handy aus dem Standby (Seite wieder sichtbar) → ebenfalls einmal neu.
- Kurze Aussetzer versucht der Client zuerst still selbst zu überbrücken; der
  Streifen kommt erst nach ein paar Sekunden ohne Verbindung.

### 6. Wer welchen Zustand sieht

| Nutzer | aktives Event lesbar? | Dashboard |
|---|---|---|
| Teilnehmer des aktiven Events | ja | volles Dashboard, „Jetzt bewerten" |
| Gastgeber des aktiven Events | ja | volles Dashboard, „Jetzt bewerten" **und** „Steuern" |
| Admin, nicht Teilnehmer | ja (Admin darf alles lesen) | volles Info-Dashboard, **„Steuern"**, **kein** „Jetzt bewerten" |
| Teilnehmer eines anderen / keines Events | nein | Vorschau des nächsten eigenen Abends bzw. „kein Tasting" |

### 7. Zustände & Rückmeldungen (nach `docs/design-system.md`)

- **Laden:** Skeleton für Gläserstreifen + Karten.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen".
- **„Nicht live":** dezenter Streifen, tippen lädt nach.
- **„Kein Tasting" / Vorschau / Abschluss:** wie oben.
- Der Übergang „läuft → abgeschlossen" passiert live, ohne Neuladen.

### 8. Neue Pakete

Keine. `@supabase/ssr` (Browser-Client mit Realtime) ist da; `date-fns`, `Card`,
`Badge`, `Skeleton` ebenfalls.

### 9. Betriebsvoraussetzung

Keine neue. (Realtime ist im Supabase-Projekt aktiv; die Tabellen sind seit
PROJ-1 in der Publication.)

### 10. Wie der Erfolg geprüft wird

- **Unit-Tests** für die Ableitungslogik (welcher Dashboard-Zustand gilt;
  Gläser-Zustände aus Position + Anzahl; „darf bewerten?"-Ableitung; Kanalname
  aus der Event-ID).
- **Datenbank- / Realtime-Tests** (soweit sinnvoll automatisierbar): ein
  Nicht-Teilnehmer bekommt über den Kanal **kein** Update des laufenden Events;
  über den Kanal kommen nur Event- / Positions-Daten an.
- **E2E-Tests** (Chromium + Mobile Safari): Dashboard zeigt das laufende Event
  mit korrektem Gläserstreifen; nach einem Weiterschalten (per direktem
  DB-Update / zweitem Kontext) aktualisiert sich der Streifen **ohne Neuladen**;
  Abschluss wechselt live in den Abschluss-Zustand; „kein Tasting" / Vorschau;
  Nicht-Teilnehmer sieht das laufende Event nicht; die Bewertungsansicht springt
  beim Weiterschalten mit.
- `npm run build` / `npm run lint` sauber.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
