# PROJ-9: Ergebnisse & Tasting-Historie

## Status: Planned
**Created:** 2026-08-30
**Last Updated:** 2026-08-30

## Dependencies
- **Requires: PROJ-7 (Bewertungsansicht)** — die Bewertungen, aus denen die
  Rangliste gerechnet wird; der eingefrorene „Ergebnisse ansehen"-Absprung.
- **Requires: PROJ-6 (Gastgeber-Steuerung)** — der Abschluss des Events (`status =
  'closed'`) ist der Auslöser, ab dem es überhaupt Ergebnisse gibt.
- **Requires: PROJ-8 (Tasting-Dashboard)** — der Absprung „Zur Rangliste" nach dem
  Abschluss; die „Vergangene Tastings"-Verlinkung.
- **Requires: PROJ-5 (Whisky-Erfassung)** — Name, Distillery, Region, `brought_by`
  und `video_url` je Whisky (bis zum Abschluss geheim, danach aufgelöst).
- **Requires: PROJ-4 / PROJ-3 / PROJ-2** — Events, Teilnehmerliste, Profile,
  App-Shell mit „Tastings"-Tab und Login.
- **Baut auf PROJ-1** — die schon gebauten Views `whisky_rankings` (nur
  `status = 'closed'`, Rang = Gesamt desc → Geschmack desc → Nase desc → Position
  asc) und `past_tastings` (Datum, Ort, Gastgeber, Sieger je abgeschlossenem
  Event). **Anpassungsbedarf:** die Sichtbarkeit abgeschlossener Ergebnisse muss
  von „nur Teilnehmer dieses Abends" auf „jedes aktive Mitglied" erweitert werden
  (siehe Produktentscheidung 1 und Open Questions) — Detail für `/architecture`.

## Kontext

Am Ende eines Tasting-Abends schließt der Gastgeber das Event ab. **Genau in
diesem Moment** kippt alles: die Whisky-Namen werden aufgelöst, die Bewertungen
sind eingefroren, und die Rangliste steht — ohne Auszählen, ohne Zettel. PROJ-9
ist die Ansicht dieser Rangliste **und** das dauerhafte Archiv: jedes vergangene
Tasting bleibt nachschlagbar, sodass die Runde über Jahre nachvollziehen kann,
welche Flasche wann gewonnen hat und wer sie mitgebracht hat.

Die eigentliche Rechenarbeit ist schon erledigt (PROJ-1: `whisky_rankings`,
`past_tastings`). PROJ-9 ist die Darstellung: zwei Screens, keine neue Logik.

- **Historien-Liste** — integriert in die bestehende Seite `/tastings`. Oben
  bleibt „Deine Abende" (kommende / laufende Tastings). Darunter neu „Vergangene
  Tastings": alle abgeschlossenen Events der Runde, neueste zuerst.
- **Ergebnisseite** — `/tastings/[eventId]/ergebnisse`. Kopfdaten des Abends, die
  Rangliste mit aufgelösten Namen, Gesamt-/Nasen-/Geschmackspunkten, Ø als
  Zusatz, Video-Link je Whisky, Sieger hervorgehoben, aufklappbare
  Einzelbewertungen. Das ist zugleich die „Detailansicht" aus dem PRD — kein
  dritter Screen.

Die **Blindheit gilt nur bis zum Abschluss**. Danach ist das Ergebnis
gemeinsames Archiv der Runde — mit einer Ausnahme: die persönlichen Freitext-
Notizen bleiben privat, jede Person sieht nur ihre eigenen wieder.

## User Stories

- Als **Teilnehmer** möchte ich direkt nach dem Abschluss die Rangliste des
  Abends sehen — mit aufgelösten Namen und wer welchen Whisky mitgebracht hat —
  damit der Abend ohne Auszählen einen klaren Sieger hat.
- Als **Teilnehmer** möchte ich auf der Ergebnisseite meine eigenen Notizen zu
  jedem Whisky wiederfinden, damit die Erinnerung „was habe ich damals gerochen"
  erhalten bleibt.
- Als **Mitglied der Runde** möchte ich eine Liste aller vergangenen Tastings mit
  Datum, Gastgeber und Sieger-Whisky sehen — auch von Abenden, an denen ich
  gefehlt habe — damit die Geschichte der Runde an einem Ort steht.
- Als **Mitglied der Runde** möchte ich von einem Listeneintrag in die volle
  Rangliste dieses Abends springen können.
- Als **neugieriger Teilnehmer** möchte ich je Whisky aufklappen können, wer wie
  viele Punkte vergeben hat, damit ich den Ausreißer sehe.
- Als **Teilnehmer** möchte ich nach dem Abschluss das Verkostungsvideo zu einem
  Whisky in einem neuen Tab öffnen können.

## Out of Scope

- **Runden-übergreifende Auswertungen** — kein „wer vergibt die härtesten Noten",
  keine Gesamt-Bestenliste über alle Abende. (PRD-Non-Goal.)
- **Persönliche Bilanz** (Anzahl Tastings, mitgebrachte Whiskys, beste
  Platzierung, Ø vergebene Punkte) → **PROJ-10**.
- **Fremde Notizen** — jede Person sieht nur ihre eigenen. Das nachträgliche
  Öffnen aller Notizen für die Runde ist eine bewusste spätere Entscheidung, kein
  MVP-Default.
- **Kommentare, „Gefällt mir", Reaktionen** auf Ergebnisse.
- **Export** — kein PDF, kein CSV, kein Teilen-Link.
- **Bearbeiten / Nachtragen** von Bewertungen oder Whisky-Details nach dem
  Abschluss — alles eingefroren (durch PROJ-6 / PROJ-7 erzwungen).
- **Löschen** von Tastings aus der Historie — Admin-Thema, nicht hier.
- **Realtime auf der Ergebnisseite** — sie ist post-Abschluss statisch. Das
  Live-Umschalten „Abend vorbei → Zur Rangliste" macht das Dashboard (PROJ-8).
- **Ändern der Rang-/Punkte-Rechenregel** — die `whisky_rankings`-View aus PROJ-1
  ist maßgeblich und wird nicht angefasst.
- **Eingebetteter Video-Player, Vorschaubilder, Titel-Abfrage** — PRD-Non-Goal.
  Nur der nackte Link.
- **Paginierung / „mehr laden"** in der Historien-Liste — die Runde produziert
  wenige Abende pro Jahr; alle auf einmal.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Historien-Liste (`/tastings`)

- [ ] Angenommen es gibt abgeschlossene Tastings, wenn ein Mitglied die Seite
      `/tastings` öffnet, dann sieht es unter dem Block „Deine Abende" einen
      Abschnitt „Vergangene Tastings" mit allen abgeschlossenen Events der Runde,
      unabhängig davon, ob es selbst teilgenommen hat.
- [ ] Angenommen die Historien-Liste wird angezeigt, wenn das Mitglied sie
      betrachtet, dann sind die Einträge nach Event-Datum absteigend sortiert
      (neuester Abend oben), bei gleichem Datum nach Abschlusszeitpunkt.
- [ ] Angenommen ein abgeschlossenes Tasting hat einen Sieger-Whisky, wenn das
      Mitglied den Listeneintrag betrachtet, dann zeigt er Datum, Ort,
      „Gastgeber: {Name}" und „🏆 {Sieger-Whisky-Name}".
- [ ] Angenommen ein abgeschlossenes Tasting hat keine einzige Bewertung, wenn das
      Mitglied den Listeneintrag betrachtet, dann steht dort „— kein Sieger"
      statt eines Whisky-Namens.
- [ ] Angenommen ein Listeneintrag wird angezeigt, wenn das Mitglied darauf
      tippt, dann öffnet sich die Ergebnisseite dieses Events
      (`/tastings/[eventId]/ergebnisse`).
- [ ] Angenommen es wurde noch kein Tasting abgeschlossen, wenn das Mitglied
      `/tastings` öffnet, dann steht im Abschnitt „Vergangene Tastings" der Hinweis
      „Noch kein Tasting abgeschlossen." und der Block „Deine Abende" bleibt
      unverändert.
- [ ] Angenommen der Gastgeber schließt ein laufendes Event ab, wenn danach ein
      Mitglied `/tastings` öffnet (oder neu lädt), dann erscheint dieses Tasting
      in der Historien-Liste.

### Ergebnisseite — Kopf & Zugang

- [ ] Angenommen ein Event ist abgeschlossen, wenn ein Mitglied
      `/tastings/[eventId]/ergebnisse` öffnet, dann sieht es einen Kopf mit Datum,
      Ort, Thema (falls gesetzt) und Gastgeber-Name sowie die Teilnehmerliste des
      Abends.
- [ ] Angenommen ein Event ist „In Vorbereitung" oder „läuft", wenn ein Mitglied
      `/tastings/[eventId]/ergebnisse` manuell aufruft, dann sieht es den Hinweis
      „Dieses Tasting läuft noch — die Rangliste erscheint nach dem Abschluss."
      mit einem Link zurück zum Dashboard und **keine** Ranglistendaten.
- [ ] Angenommen eine Event-ID existiert nicht oder verweist auf kein Event, wenn
      ein Mitglied `/tastings/[eventId]/ergebnisse` aufruft, dann erscheint die
      „nicht gefunden"-Seite.

### Ergebnisseite — Rangliste

- [ ] Angenommen ein abgeschlossenes Event hat N bewertete Whiskys, wenn das
      Mitglied die Ergebnisseite betrachtet, dann sieht es N Ranglisten-Zeilen,
      sortiert nach Rang aufsteigend (1 oben), jede mit Rang, aufgelöstem
      Whisky-Namen, Distillery und Region (falls gesetzt), „mitgebracht von
      {Name}", Gesamtpunkten als große Zahl und „Nase {n} · Geschmack {m}"
      darunter.
- [ ] Angenommen eine Ranglisten-Zeile wird angezeigt, wenn das Mitglied sie
      betrachtet, dann steht dort zusätzlich der Durchschnitt (Gesamtpunkte ÷
      Anzahl Bewertungen, z. B. „Ø 12,3") als informative Zusatzzahl, die den
      Rang nicht beeinflusst.
- [ ] Angenommen der Whisky auf Rang 1 hat mindestens eine Bewertung, wenn das
      Mitglied die Rangliste betrachtet, dann ist diese Zeile als Sieger klar
      hervorgehoben (Farbe/Icon).
- [ ] Angenommen zwei benachbarte Ränge haben exakt dieselbe Gesamtpunktzahl,
      wenn das Mitglied die Rangliste betrachtet, dann tragen beide Zeilen einen
      dezenten Hinweis „punktgleich"; die Rangnummern bleiben wie von der View
      geliefert (eindeutig 1…N).
- [ ] Angenommen ein Whisky wurde von weniger Teilnehmern bewertet als der Abend
      Teilnehmer hatte, wenn das Mitglied die Zeile betrachtet, dann steht dort
      „{Anzahl} von {Teilnehmerzahl} Bewertungen".
- [ ] Angenommen ein abgeschlossenes Event, bei dem niemand etwas bewertet hat,
      wenn das Mitglied die Ergebnisseite öffnet, dann werden alle Whiskys mit 0
      Punkten in Ausschankreihenfolge gezeigt, oben steht „Für diesen Abend
      wurden keine Bewertungen abgegeben." und **kein** Sieger ist hervorgehoben.
- [ ] Angenommen die Rangliste hat bis zu 10 Zeilen, wenn sie auf einem
      Smartphone (375 px) dargestellt wird, dann ist sie ohne horizontales
      Scrollen lesbar.

### Ergebnisseite — Einzelbewertungen & Notizen

- [ ] Angenommen eine Ranglisten-Zeile wird angezeigt, wenn das Mitglied sie
      aufklappt, dann sieht es pro Teilnehmer, der diesen Whisky bewertet hat,
      dessen Nase-, Geschmack- und Gesamtpunkte; zugeklappt ist nur das Aggregat
      sichtbar.
- [ ] Angenommen das Mitglied hat an diesem Abend teilgenommen und zu einem
      Whisky eine Notiz hinterlegt, wenn es die Ergebnisseite betrachtet, dann
      sieht es seine **eigene** Notiz zu diesem Whisky.
- [ ] Angenommen andere Teilnehmer haben Notizen hinterlegt, wenn das Mitglied
      die Ergebnisseite (auch im aufgeklappten Zustand) betrachtet, dann sind die
      Notizen der anderen **nicht** sichtbar.

### Ergebnisseite — Video

- [ ] Angenommen ein Whisky hat einen hinterlegten Verkostungsvideo-Link, wenn
      das Mitglied die Ranglisten-Zeile betrachtet, dann gibt es einen
      „Video ansehen"-Link, der in einem neuen Tab öffnet
      (`rel="noopener noreferrer"`).
- [ ] Angenommen ein Whisky hat keinen Video-Link, wenn das Mitglied die Zeile
      betrachtet, dann wird kein „Video ansehen"-Element angezeigt.
- [ ] Angenommen Video-Links existieren, wenn das Mitglied die Historien-Liste
      betrachtet, dann tauchen dort keine Video-Links auf (nur auf der
      Ergebnisseite).

### Absprünge

- [ ] Angenommen ein Event wurde gerade abgeschlossen und das Mitglied ist auf
      dem Dashboard, wenn es „Zur Rangliste" tippt, dann landet es auf
      `/tastings/[eventId]/ergebnisse`.
- [ ] Angenommen ein Teilnehmer ist in der eingefrorenen Bewertungsansicht eines
      abgeschlossenen Events (PROJ-7), wenn er „Ergebnisse ansehen" tippt, dann
      landet er auf `/tastings/[eventId]/ergebnisse`.

## Edge Cases

- **Ergebnisseite eines noch laufenden / vorbereiteten Events manuell aufgerufen**
  → ruhiger Hinweis „läuft noch", kein Redirect, keine Ranglistendaten. Die View
  liefert für nicht-`closed` Events ohnehin 0 Zeilen.
- **Mitglied hat an dem Abend nicht teilgenommen** → sieht Rangliste, Namen,
  Sieger, Videos (volle Runden-Historie), aber **keine** Notizen (es hat keine)
  und die aufklappbaren Einzelbewertungen zeigen nur Punkte, keine Notizen.
- **Abgeschlossenes Event ganz ohne Bewertungen** → alle Whiskys 0 Punkte in
  Ausschankreihenfolge, Hinweis oben, kein Sieger, Historien-Zeile „— kein
  Sieger".
- **Ein Whisky ohne jede Bewertung in einem sonst bewerteten Abend** → erscheint
  am Ende der Rangliste mit 0 Punkten und „0 von {m} Bewertungen".
- **Punktgleichheit** zwischen zwei oder mehr Whiskys → getrennte, eindeutige
  Ränge (View-Feinkriterium), beide/alle mit „punktgleich"-Hinweis.
- **Distillery / Region / Thema nicht gesetzt** → Zeile bzw. Kopf zeigt die
  jeweilige Angabe einfach nicht, kein Platzhaltertext.
- **Video-URL ist zwar `https://…`, führt aber ins Leere / ist Phishing** → im
  geschlossenen Kreis akzeptiertes Restrisiko (PROJ-5). Kein „Bist du sicher?"-
  Dialog; Standard-Browser zeigt beim Long-Press das Ziel.
- **Sehr lange Whisky-Namen / Ortsnamen** → umbrechen, nicht abschneiden; Layout
  bleibt bis 375 px stabil.
- **Teilnehmer wurde nach dem Abend deaktiviert** (`profiles.is_active = false`)
  → Name bleibt in Rangliste, „mitgebracht von" und Einzelbewertungen erhalten
  (FKs sind `ON DELETE RESTRICT`); die Historie schreibt sich nicht um.
- **Zwei Tastings am selben Kalendertag** → beide in der Liste, Sekundärsortierung
  nach Abschlusszeitpunkt.

## Technical Requirements (optional)

- **Sicherheit:** Login erforderlich. Die Sichtbarkeit abgeschlossener Ergebnisse
  wird auf Datenbankebene erzwungen (RLS / View), nicht im Frontend. Vor dem
  Abschluss liefert `whisky_rankings` 0 Zeilen — die Ergebnisseite kann per URL
  nicht „vorab" ausgelesen werden.
- **Privatsphäre:** Fremde Notizen dürfen die Ergebnisseite nie erreichen — auch
  nicht im Netzwerk-Response. Nur `notes` der eigenen `profile_id`.
- **Darstellung:** Rangliste bis 10 Einträge und Gläserstreifen-Nachbarschaft
  ohne horizontales Scrollen auf 375 px lesbar (PRD-Constraint).
- **Performance:** Ergebnisseite und Historien-Liste sind reine Lesezugriffe auf
  vorhandene Views/Tabellen; Serverkomponenten, kein Client-Fetch-Wasserfall.
- **Browser:** Chrome, Firefox, Safari (mobil priorisiert).

## Open Questions

- [ ] Die Erweiterung der RLS-Sichtbarkeit abgeschlossener Ergebnisse von „nur
      Teilnehmer" auf „jedes aktive Mitglied" betrifft `whisky_rankings` /
      `past_tastings` / `whisky_details` / `ratings` und ist von `/architecture`
      zu entwerfen (neue Policy vs. angepasste `is_event_closed`-Logik). Die
      **eigenen** Notizen bleiben dabei das einzige teilnehmergebundene Feld.
- [ ] Format der Ø-Zahl bei nicht ganzzahligem Mittel — eine Nachkommastelle
      („Ø 12,3") oder ganzzahlig gerundet? (Vorschlag: eine Nachkommastelle,
      Komma als Dezimaltrennzeichen.)
- [ ] Sollen die aufklappbaren Einzelbewertungen nach Punktzahl oder nach
      Anzeigename sortiert sein? (Vorschlag: Gesamtpunkte absteigend.)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Volle Runden-Historie: jedes aktive Mitglied sieht die Ergebnisse **jedes** abgeschlossenen Tastings, auch ohne Teilnahme | PRD-Vision „damit die Runde über Jahre nachvollziehen kann, welche Flasche wann gewonnen hat"; die Blindheit ist ein Schutz *bis* zum Abschluss, danach ist das Ergebnis gemeinsames Archiv | 2026-08-30 |
| Zwei Screens: Historien-Liste in `/tastings` integriert + eigene Ergebnisseite `/tastings/[eventId]/ergebnisse`; die Ergebnisseite ist zugleich die „Detailansicht" | Kein dritter Screen nötig; die bestehenden Platzhalter-Absprünge zeigen genau dorthin; der „Tastings"-Tab bleibt der eine Ort für alles Event-bezogene | 2026-08-30 |
| Summe der vergebenen Punkte ist die maßgebliche Zahl für Rang und Anzeige; Durchschnitt nur als informative Zusatzzahl | Die Rechenregel ist in PROJ-1 (`whisky_rankings`) eingefroren; die große Zahl muss zum Rang passen; der Ø gibt den ehrlicheren Vergleich bei ungleicher Bewertungszahl, ohne den Rang zu verändern | 2026-08-30 |
| Anzahl Bewertungen je Whisky sichtbar („{n} von {m} Bewertungen") statt Extra-Warnhinweis | Macht den Fairness-Nachteil eines vergessenen Whiskys transparent, ohne Alarmismus | 2026-08-30 |
| Einzelbewertungen je Whisky aufklappbar (Punkte pro Person); zugeklappt nur Aggregat | Befriedigt die „wer war der Ausreißer"-Neugier, ohne die Seite zu überladen | 2026-08-30 |
| Nur eigene Notizen auf der Ergebnisseite sichtbar, fremde nie | Die Notiz war während des Abends explizit als privat versprochen; das nachträglich zu öffnen ist eine bewusste spätere Entscheidung, kein MVP-Default | 2026-08-30 |
| „punktgleich"-Hinweis bei identischer Gesamtpunktzahl benachbarter Ränge | Die View-Ränge sind immer eindeutig (Feinkriterium Geschmack→Nase→Position); der Hinweis erklärt, dass hier kein echter Punkteabstand entschieden hat | 2026-08-30 |
| Ergebnisseite eines nicht abgeschlossenen Events: ruhiger Hinweis statt Redirect; unbekannte ID → 404 | Konsistent mit den anderen Event-Unterseiten; kein Vorab-Auslesen der Rangliste per URL (View liefert 0 Zeilen) | 2026-08-30 |
| Abgeschlossenes Event ohne Bewertungen: Whiskys mit 0 Punkten in Ausschankreihenfolge, Hinweis oben, kein Sieger; Historien-Zeile „— kein Sieger" | Ein Abend ohne Bewertungen ist ein realer (wenn seltener) Zustand; er darf die Ansicht nicht brechen | 2026-08-30 |
| Keine Paginierung in der Historien-Liste | Wenige Abende pro Jahr; auch nach zehn Jahren < 100 Zeilen | 2026-08-30 |
| Video-Link je Whisky nur auf der Ergebnisseite, neuer Tab, `rel="noopener noreferrer"`, kein Bestätigungsdialog, kein Player | PRD-Non-Goal (kein eingebetteter Player); Phishing-Restrisiko im geschlossenen Kreis akzeptiert (PROJ-5) | 2026-08-30 |
| Kein Realtime auf der Ergebnisseite | Post-Abschluss statisch; das Live-Umschalten „Abend vorbei" macht bereits das Dashboard (PROJ-8) | 2026-08-30 |

### Technical Decisions
_To be added by /architecture_

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
