# PROJ-9: Ergebnisse & Tasting-Historie

## Status: Approved
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

- [x] ~~Die Erweiterung der RLS-Sichtbarkeit abgeschlossener Ergebnisse…~~
      **Gelöst in `/architecture`:** die beiden Ranglisten-Views laufen künftig mit
      Owner-Rechten und einem eingebauten „nur abgeschlossen + aktives Mitglied"-
      Filter; eine neue Punkte-Aufschlüsselungs-View (ohne Notizen) kommt hinzu;
      zwei Lese-Regeln (Event-Kopf, Teilnehmerliste) werden für abgeschlossene
      Events auf alle aktiven Mitglieder geweitet; der Roh-Zugriff auf `ratings`
      wird auf „nur die eigenen Zeilen" **verengt**. Details im Abschnitt
      „Tech Design → Backend-Änderungen".
- [x] ~~Format der Ø-Zahl~~ **Entschieden:** eine Nachkommastelle, Komma als
      Dezimaltrennzeichen („Ø 12,3"); bei 0 Bewertungen kein Ø.
- [x] ~~Sortierung der aufklappbaren Einzelbewertungen~~ **Entschieden:**
      Gesamtpunkte absteigend, bei Gleichstand nach Anzeigename.

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
| Decision | Rationale | Date |
|----------|-----------|------|
| Reine Leseansicht auf vorhandene Datenbank-Views — **keine** neuen Tabellen, **keine** Server-Actions, **keine** RPCs | Rangliste und Sieger werden schon in PROJ-1 berechnet (`whisky_rankings`, `past_tastings`); PROJ-9 ist Darstellung | 2026-08-30 |
| Die beiden Ranglisten-Views von „mit den Rechten des Abfragenden" auf „mit Owner-Rechten + eingebautem Filter (nur `status = 'closed'` **und** aktives Mitglied)" umstellen | So sieht auch ein Mitglied, das an dem Abend gefehlt hat, die volle Rangliste. Die Blindheits-Garantie hängt am `closed`-Filter, **nicht** am Rechte-Modus der View — der bleibt erhalten | 2026-08-30 |
| Neue View „Punkte-Aufschlüsselung" (pro Whisky pro Bewerter: Name, Nase, Geschmack, Gesamt — **ohne Notiz-Spalte**) mit demselben Owner-Rechte-+-Filter-Muster | Die aufklappbaren Einzelpunkte brauchen zeilengenauen Zugriff; eine eigene View ohne Notiz-Spalte macht es strukturell unmöglich, fremde Notizen über diesen Weg zu lesen | 2026-08-30 |
| Roh-Lesezugriff auf die `ratings`-Tabelle auf „nur die eigenen Zeilen" **verengen** (bisher durften Teilnehmer eines abgeschlossenen Events auch fremde Zeilen inkl. Notiz lesen) | Fremde Notizen dürfen laut Spec „auch nicht im Netzwerk-Response" auftauchen; die geteilte Sicht liefern jetzt die Views ohne Notiz-Spalte, also wird der Direktzugriff nicht mehr für die Aggregation gebraucht | 2026-08-30 |
| Eigene Notizen: direkter, auf die eigene Person gefilterter Lesezugriff auf `ratings` (wie in PROJ-7) | Die bestehende Regel „eigene Zeilen jederzeit lesbar" deckt das ab — kein neues Objekt nötig | 2026-08-30 |
| „Aktives Mitglied" = Profil existiert und ist nicht deaktiviert (jede Rolle) | Es gibt keine eigene „Runden-Mitgliedschaft"; die Runde ist der vom Admin eingeladene, aktive Nutzerkreis. Deckt sich mit `is_admin()`, das ebenfalls `is_active` verlangt | 2026-08-30 |
| „Läuft noch" vs. „nicht gefunden" unterscheidet der Loader über den bestehenden PROJ-1-Statushelfer (Status eines Events per ID, für angemeldete Nutzer aufrufbar) | Kein weiteres Aufweichen der Event-Leseregeln nötig; PROJ-8 (Nicht-Teilnehmer sieht laufendes Event nicht) bleibt unangetastet | 2026-08-30 |
| Historien-Liste als zweiter Abschnitt in `/tastings`; die bestehende Liste zeigt künftig nur noch **nicht** abgeschlossene Abende | Vermeidet, dass ein abgeschlossener Abend doppelt (oben „meine" + unten „Historie") erscheint; nur die Seite ändert sich, nicht die `getMyTastings`-Abfrage | 2026-08-30 |
| Aufklappen der Einzelbewertungen mit der bereits installierten `accordion`/`collapsible`-Komponente; Rangliste als `table` bzw. Karten-Liste | Beide shadcn-Bausteine sind schon im Projekt; keine neue Abhängigkeit | 2026-08-30 |
| Ableitungen (Ø-Zahl, „punktgleich", Sieger-ja/nein, Sortierung der Aufschlüsselung) als reine Funktionen in `src/lib/results.ts` mit Co-Test | Testbar ohne DB/Browser; QA hakt sie mit Vitest ab | 2026-08-30 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-9 zeigt Daten, die es schon gibt. Die Rangliste und der Sieger-Whisky
werden seit PROJ-1 von zwei Datenbank-Views berechnet (`whisky_rankings`,
`past_tastings`). Diese Funktion baut **zwei Bildschirme** darauf:

1. **Historien-Liste** — ein neuer Abschnitt „Vergangene Tastings" auf der schon
   vorhandenen Seite `/tastings`.
2. **Ergebnisseite** — eine neue Unterseite `/tastings/<Event>/ergebnisse`.

Es gibt **einen** fokussierten Backend-Eingriff: die Sichtbarkeit der
abgeschlossenen Ergebnisse wird von „nur wer an dem Abend dabei war" auf „jedes
aktive Mitglied der Runde" geweitet — und im selben Zug wird der direkte Zugriff
auf die rohe Bewertungstabelle **enger** gezogen, damit fremde persönliche
Notizen garantiert nirgends mehr mitgeliefert werden. Kein neuer API-Endpunkt,
keine Server-Action, keine neue Tabelle.

### A) Seiten- und Komponentenstruktur

**Seite `/tastings` (erweitert)**

```
Tastings-Seite
├─ Seitenkopf  „Tastings"
├─ Abschnitt „Deine Abende"        ← wie bisher, aber ohne abgeschlossene
│   └─ Tasting-Liste (kommende / laufende Abende)
└─ Abschnitt „Vergangene Tastings"  ← NEU
    ├─ Historien-Liste
    │   └─ Historien-Zeile  (pro abgeschlossenem Event der Runde)
    │        Datum · Ort · „Gastgeber: Name" · „🏆 Sieger-Whisky"
    │        (ganze Zeile ist ein Link → Ergebnisseite)
    └─ Leerzustand  „Noch kein Tasting abgeschlossen."
```

**Seite `/tastings/<Event>/ergebnisse` (neu)**

```
Ergebnisseite
├─ Zustand „Event nicht gefunden / fremde ID"      → Standard-„nicht gefunden"
├─ Zustand „Event läuft noch / in Vorbereitung"
│   └─ Hinweis-Karte  „Dieses Tasting läuft noch …" + Link zum Dashboard
├─ Zustand „Event abgeschlossen"  (Regelfall)
│   ├─ Ergebnis-Kopf
│   │    Datum · Ort · Thema (falls gesetzt) · „Gastgeber: Name"
│   │    Teilnehmerliste des Abends
│   ├─ Hinweis „keine Bewertungen abgegeben"   (nur falls zutreffend)
│   └─ Rangliste
│        └─ Ranglisten-Zeile  (pro Whisky, nach Rang sortiert)
│             ├─ Rang groß · Sieger-Hervorhebung bei Rang 1
│             ├─ Whisky-Name · Distillery · Region (falls gesetzt)
│             ├─ „mitgebracht von Name"
│             ├─ Gesamtpunkte groß · „Nase n · Geschmack m" · „Ø 12,3"
│             ├─ „k von m Bewertungen" · ggf. „punktgleich"
│             ├─ „Video ansehen"  (neuer Tab; nur falls Link hinterlegt)
│             └─ Aufklappbereich (zu / auf)
│                  ├─ pro Bewerter: Name · Nase · Geschmack · Gesamt
│                  └─ „Deine Notiz: …"   (nur die eigene, falls vorhanden)
├─ Laden        → Skelett
└─ Ladefehler   → Hinweis + „Erneut versuchen"
```

**Neue Bausteine**

- `src/app/(app)/tastings/[eventId]/ergebnisse/` mit `page.tsx`, `loading.tsx`,
  `error.tsx` (gleiche Konvention wie `whiskies/`, `gastgeber/`, `bewerten/`).
- Komponenten unter `src/components/results/`: Historien-Liste + -Zeile,
  Ergebnis-Kopf, Rangliste + Ranglisten-Zeile (mit Aufklappbereich),
  Video-Link.
- `src/lib/queries/results.ts`: die Lesezugriffe (siehe C).
- `src/lib/results.ts` (+ `results.test.ts`): reine Hilfsfunktionen — Ø-Zahl
  formatieren, „punktgleich" ermitteln, „ist Sieger", Aufschlüsselung sortieren,
  „abgeschlossen / läuft noch / nicht gefunden" bestimmen.
- Wiederverwendet: `PageHeader`, `EventStatusBadge`, `formatEventDate`, `Card`,
  `Table`, `Badge`, `Accordion`/`Collapsible` (alle bereits im Projekt).

Die bestehende `/tastings`-Seite bekommt lediglich einen Filter (obere Liste nur
noch nicht-abgeschlossene Abende) und den neuen Abschnitt darunter. `tasting-row`
und `getMyTastings` bleiben unverändert.

### B) Woher die Daten kommen

| Anzeige | Quelle | Zugriff |
|---|---|---|
| Historien-Liste | View `past_tastings` (Datum, Ort, Thema, Gastgeber-Name, Sieger-Whisky + -Punkte) | alle aktiven Mitglieder |
| Ergebnis-Kopf (Datum, Ort, Thema, Gastgeber) | View `past_tastings` | alle aktiven Mitglieder |
| Teilnehmerliste des Abends | `event_participants` + `profiles` | Leseregel für **abgeschlossene** Events auf alle aktiven Mitglieder geweitet |
| Rangliste (Rang, Name, Herkunft, Bringer, Punktsummen, Anzahl Bewertungen, Video-Link) | View `whisky_rankings` | alle aktiven Mitglieder |
| Aufklappbare Einzelpunkte pro Bewerter | **neue** View „Punkte-Aufschlüsselung" (ohne Notiz-Spalte) | alle aktiven Mitglieder |
| Eigene Notiz je Whisky | Tabelle `ratings`, auf die eigene Person gefiltert | wie in PROJ-7 — eigene Zeilen jederzeit lesbar |
| „läuft noch" vs. „nicht gefunden" | bestehender PROJ-1-Statushelfer (Status eines Events per ID) | jeder angemeldete Nutzer |

Alle Zugriffe sind reine Lesezugriffe aus Server-Komponenten. Kein Client-seitiges
Nachladen, kein Realtime.

### C) Datenmodell

Es entstehen **keine neuen Tabellen** und **keine neuen Spalten für Nutzdaten**.
Bestehende Strukturen (PROJ-1):

- **Rangliste je Event** (`whisky_rankings`): pro Whisky eines abgeschlossenen
  Events — Rang, Position, aufgelöster Name, Distillery, Region, Video-Link,
  Bringer, Summe Nase, Summe Geschmack, Summe Gesamt, Anzahl Bewertungen.
  Rangfolge: Gesamt ↓, Geschmack ↓, Nase ↓, Ausschankposition ↑ (immer
  eindeutig).
- **Vergangene Tastings** (`past_tastings`): pro abgeschlossenem Event — Datum,
  Ort, Thema, Gastgeber-Name, Sieger-Whisky (Name + Punkte). Bekommt zusätzlich
  den **Abschlusszeitpunkt** als Sortier-Zweitschlüssel sichtbar gemacht.
- **Punkte-Aufschlüsselung** (neu): pro Whisky pro Bewerter — Anzeigename,
  Nase, Geschmack, Gesamt. **Bewusst ohne Notiz-Feld.**
- **Eigene Notiz**: das Feld `notes` der eigenen Zeile in `ratings`.

### D) Backend-Änderungen (eine Migration, in Worten)

Alles in einer neuen Migrationsdatei; der Nutzer spielt sie ein und lässt die
RLS-Tests laufen (Claude hat hier keinen DB-Zugriff).

1. **Neuer Helfer „ist aktives Mitglied":** wahr, wenn der Aufrufer ein
   nicht-deaktiviertes Profil hat (jede Rolle). Das ist „die Runde".

2. **`whisky_rankings` und `past_tastings` auf Owner-Rechte umstellen** und in
   die View selbst den Filter „nur abgeschlossene Events **und** Aufrufer ist
   aktives Mitglied" einbauen. Wirkung: Auch wer an dem Abend gefehlt hat, sieht
   die volle Rangliste. Unverändert: Ein nicht abgeschlossenes Event liefert
   weiterhin **null Zeilen** — daran hängt die Blindheit, nicht am Rechte-Modus.
   Beide Views tragen weiterhin **keine** persönlichen Notizen.

3. **Neue View „Punkte-Aufschlüsselung"** nach demselben Muster (Owner-Rechte,
   Filter „abgeschlossen + aktives Mitglied"), Spalten: Event, Whisky, Bewerter-
   Name, Nase, Geschmack, Gesamt. Keine Notiz-Spalte.

4. **Leseregel für Teilnehmerlisten weiten:** Für **abgeschlossene** Events darf
   jedes aktive Mitglied die Teilnehmerzuordnung lesen (bisher nur Teilnehmer
   desselben Events). Für laufende / vorbereitete Events bleibt alles wie bisher.

5. **Roh-Lesezugriff auf `ratings` verengen:** Bisher durfte ein Teilnehmer eines
   **abgeschlossenen** Events auch die Zeilen der anderen lesen (inklusive deren
   Notiz). Diese Ausnahme entfällt — künftig gilt tabellenweit „nur die eigenen
   Zeilen" (Admin ausgenommen). Die geteilte Auswertung kommt ausschließlich aus
   den Views aus Schritt 2 und 3, die keine Notiz führen. Damit können fremde
   Notizen auf keinem Weg mehr in einen Response geraten.

**Was sich NICHT ändert:** die Rang-/Punkte-Rechenregel, die Leseregeln für
laufende Events, die Realtime-Publication, alle RPCs, das Dashboard-Verhalten aus
PROJ-8 (Nicht-Teilnehmer sieht ein laufendes Event nicht).

### E) Auswirkungen auf bereits gebaute Teile

- **PROJ-1 RLS-Integrationstests** (`rating-rules`): Der Fall „Teilnehmer eines
  abgeschlossenen Events sieht fremde Bewertungen" kehrt sich um und muss auf
  „sieht sie **nicht**" umgeschrieben werden. Neue Fälle: aktives Nicht-
  Teilnehmer-Mitglied sieht `whisky_rankings` / `past_tastings` / die neue
  Aufschlüsselungs-View eines fremden abgeschlossenen Events; sieht sie **nicht**,
  solange das Event läuft.
- **PROJ-7 Bewertungsansicht:** liest ohnehin nur die eigenen Bewertungen —
  unberührt. Der eingefrorene „Ergebnisse ansehen"-Hinweis bekommt jetzt sein
  echtes Ziel (`…/ergebnisse`).
- **PROJ-8 Dashboard:** Der Platzhalter-Absprung „Zur Rangliste" zeigt jetzt auf
  `…/ergebnisse`. Sonst nichts.
- **`/tastings`-Seite:** obere Liste zeigt nur noch nicht-abgeschlossene Abende.

### F) Neue Pakete

Keine. `accordion`, `collapsible`, `table`, `badge` sind bereits installiert;
`date-fns` (Datumsformat) ebenfalls.

### G) Sicherheits- und Datenschutz-Betrachtung

- **Blindheit bis zum Abschluss:** unverändert erzwungen durch den
  `status = 'closed'`-Filter in allen drei Views; ein laufendes Event liefert
  null Ergebniszeilen, unabhängig davon, wer fragt.
- **Fremde Notizen:** nach dieser Änderung strukturell unerreichbar — die
  auswertenden Views führen die Spalte nicht, und der Direktzugriff auf `ratings`
  ist auf die eigene Person beschränkt.
- **Kein Vorab-Auslesen per URL:** die Ergebnisseite einer noch laufenden Runde
  zeigt nur den „läuft noch"-Hinweis; Datenzeilen gibt es serverseitig keine.
- **Video-Link:** unverändertes, in PROJ-5 akzeptiertes Restrisiko (beliebige
  `https://`-Adresse im geschlossenen Kreis); Öffnen in neuem Tab mit
  `rel="noopener noreferrer"`, kein eingebetteter Player.

## Implementation Notes (Frontend)

**Stand:** UI komplett geschrieben (zwei Screens + die zwei Platzhalter-Absprünge
verdrahtet). **Backend steht noch aus** — die PROJ-9-Migration (Sichtbarkeit
weiten, `ratings`-Zugriff verengen, View `whisky_score_breakdown`,
`past_tastings.closed_at`) und die angepassten RLS-Tests kommen in `/backend`.
Bis dahin liefert die Ergebnisseite für Nicht-Teilnehmer leere Ranglisten und die
Historie zeigt nur die eigenen abgeschlossenen Abende.

### Was gebaut wurde

**Ableitungslogik** — `src/lib/results.ts` (rein, unit-getestet, 19 Fälle in
`results.test.ts`): `resultsPhase` (`closed` / `pending` / `missing` aus dem
Event-Status), `formatAverage` (Gesamt ÷ Anzahl, eine Nachkommastelle mit Komma,
`null` bei 0), `tieRanks` (Ränge mit punktgleichem Nachbarn), `isWinner`
(Rang 1 **und** mindestens eine Bewertung), `medalClass` (`text-gold/silver/bronze`
für 1–3), `sortBreakdown` (Gesamt ↓, Name ↑), `whiskySearchUrl` (YouTube-Suche
„Whisky.de <Name>").

**Datenzugriff** — `src/lib/queries/results.ts`:
- `getPastTastings()` → alle Zeilen der View `past_tastings`, Datum ↓, bei
  Gleichstand `closed_at` ↓. Feld `winner_name` `null` → „— kein Sieger".
- `getEventResults(eventId, userId)` → `null` (Event unbekannt → 404) /
  `{ phase: 'pending' }` (läuft noch → Hinweis) / volle `EventResults`. Der
  Status kommt aus dem bestehenden RPC `event_status_of`. Für den Abschluss-Fall
  werden `past_tastings` (Kopf), `event_participants`, `whisky_rankings`,
  `whisky_score_breakdown` und die **eigenen** `ratings`-Zeilen (nur `notes`)
  parallel geladen; Bringer- und Teilnehmernamen in einer `profiles`-Abfrage
  aufgelöst; die Einzelbewertungen werden je Whisky gebündelt und die eigene
  Notiz zugeordnet. Fremde Notizen werden nirgends selektiert.

**Historien-Liste** — `src/components/results/past-tastings-section.tsx`
(Abschnitt „Vergangene Tastings" mit Leerzustand) + `past-tasting-row.tsx`
(Datum · Ort · Gastgeber · 🏆 Sieger bzw. „— kein Sieger", ganze Zeile Link →
`…/ergebnisse`). Eingehängt in `src/app/(app)/tastings/page.tsx`: die obere
Liste („Deine Abende") zeigt jetzt nur noch nicht-abgeschlossene Abende,
`getMyTastings` selbst bleibt unverändert.

**Ergebnisseite** — `src/app/(app)/tastings/[eventId]/ergebnisse/` mit
`page.tsx` (+ `loading.tsx`, `error.tsx`):
- `src/components/results/results-header.tsx` — Datum, Status-Badge
  „Abgeschlossen", Ort, Thema (falls gesetzt), Gastgeber, „Wer war dabei" mit
  markiertem Gastgeber.
- `src/components/results/ranking-list.tsx` (Server) — berechnet `tieRanks`
  einmalig, zeigt bei 0 Bewertungen einen Hinweis über der Liste, rendert
  `<ol aria-label="Rangliste">`.
- `src/components/results/ranking-row.tsx` (Client, wegen Aufklappen) — Rang groß
  in Medaillenfarbe, Whisky-Name in Display-Schrift, Distillery · Region,
  „mitgebracht von …", „Sieger des Abends" bei Rang 1, Gesamtpunkte groß rechts,
  Zeile „Nase n · Geschmack m · Ø x,y · k von m Bewertungen · punktgleich",
  Video-Zeile, eigene Notiz (falls vorhanden, ruhige kursive Box),
  `Collapsible` „Einzelbewertungen (n)" mit Punkten je Person.

**Video-Zeile** (`VideoRow` in `ranking-row.tsx`) — folgt bewusst dem
**Design-System**, nicht der Spec-AC: mit hinterlegtem Link „Video ansehen",
**ohne** Link „Auf Whisky.de suchen" (YouTube-Suche). Beide `target="_blank"`
+ `rel="noopener noreferrer"` + SR-Hinweis „öffnet YouTube". Abweichung von
AC „kein Video-Element ohne Link" ist mit dem Nutzer abgestimmt (Design-System
gewinnt) — **für QA vermerken**.

**Platzhalter-Absprünge verdrahtet:**
- `src/components/dashboard/dashboard-view.tsx` — „Zur Rangliste" zeigt jetzt auf
  `/tastings/<id>/ergebnisse`.
- `src/app/(app)/tastings/[eventId]/bewerten/page.tsx` — „Zu den Ergebnissen" im
  eingefrorenen Zustand zeigt jetzt auf `/tastings/<id>/ergebnisse`.

**Typen vorgezogen** — `src/lib/supabase/types.ts` von Hand um
`past_tastings.closed_at` und die View `whisky_score_breakdown` ergänzt, dazu
`WhiskyScoreBreakdown` in `aliases.ts`. `/backend` überschreibt `types.ts` per
`npm run db:types` nach der Migration — die Handeinträge entsprechen dem
Zielzustand.

### Checks
- `npm test` → 99/99 (11 Dateien; +19 aus `results.test.ts`).
- `npx tsc --noEmit` → sauber.
- `npm run build` → sauber; Route `/tastings/[eventId]/ergebnisse` erzeugt.
- `eslint` auf allen berührten Pfaden → sauber.

## Implementation Notes (Backend)

**Stand:** Eine Migration (`supabase/migrations/20260830120000_results_visibility.sql`)
plus die überarbeiteten RLS-Integrationstests. **Claude hat hier keinen
DB-Zugriff** → der Nutzer spielt ein und bestätigt:
`npm run db:push && npm run db:types && npm run test:rls`.

### Migration

1. **`is_active_member()`** — neuer `security definer`-Helfer: `true`, wenn der
   Aufrufer ein nicht-deaktiviertes Profil hat (jede Rolle). `execute` nur für
   `authenticated`.
2. **`whisky_rankings` neu** — ohne `security_invoker` (läuft mit Owner-Rechten,
   `force row level security` ist projektweit aus). Filter unverändert
   `status = 'closed'` (Join) **plus** `where public.is_active_member()`. Spalten,
   Rangfolge, `rank()`-Fenster identisch zu PROJ-1. Weiterhin **keine** Notiz.
3. **`past_tastings` neu** — selbes Owner-Rechte-+-`is_active_member()`-Muster.
   **Neu:** Spalte `closed_at` (Zweitsortierschlüssel der Historie).
4. **`whisky_score_breakdown` neu** — eine Zeile pro Bewerter pro Whisky
   (`event_id, whisky_id, rater_id, rater_name, nose_points, taste_points,
   total_points`). **Bewusst ohne `notes`.** Join auf `status = 'closed'` +
   `where is_active_member()`. `select` für `authenticated`, nichts für `anon`.
5. **`participants_select_same_event` geweitet** — zusätzlich
   `is_active_member() AND is_event_closed(event_id)`. Laufende / vorbereitete
   Events unverändert.
6. **`ratings_select` verengt** — von „Teilnehmer + (eigene Zeile ODER Event
   abgeschlossen)" auf **`is_admin() OR profile_id = auth.uid()`**. Damit sind
   fremde Notizen strukturell unerreichbar; die geteilte Sicht liefern die Views
   aus 2/4 ohne Notiz-Spalte. `insert` / `update` / `delete` unverändert.

Realtime-Publication: **keine Änderung** (Views werden nicht publiziert; `ratings`
war und bleibt draußen).

### Angepasste Tests

- **`rls.integration.test.ts`:**
  - „Nach Abschluss sieht Teilnehmer A die Bewertungen von B" **invertiert** →
    sieht die rohen `ratings`-Zeilen jetzt **nicht** (0), dafür neuer Fall:
    `whisky_score_breakdown` liefert Bs Punkte, und `select('notes')` darauf →
    `42703` (Spalte existiert nicht).
  - **Neu** (nutzt den vorhandenen `outsider` = aktives Mitglied ohne Teilnahme):
    sieht `whisky_rankings` / `past_tastings` (inkl. `closed_at`, Sieger) /
    `whisky_score_breakdown` / Teilnehmerliste des **abgeschlossenen** Events;
    kommt **nicht** an die rohen `ratings`; das **aktive** Event bleibt komplett
    unsichtbar (Blindheit hält).
- **`rating-rules.integration.test.ts`:**
  - Letzter Test umgestellt: `pb` sieht Pas rohe `ratings`-Zeile nach dem
    Abschluss **nicht**, wohl aber Pas Punkte über `whisky_score_breakdown`.
  - **Neu:** die eigene Notiz bleibt für den Verfasser nach dem Abschluss
    lesbar, für andere `ratings`-Leser nicht (0 Zeilen).

### Ausstehende Bestätigung durch den Nutzer
- [ ] `npm run db:push` — Migration eingespielt
- [ ] `npm run db:types` — `types.ts` neu generiert (die Handeinträge aus
      `/frontend` sollten deckungsgleich verschwinden/ersetzt werden)
- [ ] `npm run test:rls` — grün (inkl. der o. g. angepassten + neuen Fälle sowie
      der PROJ-5/6/7-Suiten `whisky-entry-rpcs` / `host-control-rpcs` /
      `rating-rules`)

## QA Test Results

**Tested:** 2026-08-30
**App URL:** http://localhost:3000 (prod-Build)
**Tester:** QA Engineer (AI)

### Automatisierte Suiten

| Suite | Ergebnis |
|-------|----------|
| `npm test` (Vitest Unit) | **99/99** (11 Dateien; +19 aus `src/lib/results.test.ts`) |
| `npm run test:rls` (Integration) | **90/90** (6 Dateien) — inkl. der überarbeiteten `rls.integration` (invertierter Fremd-`ratings`-Fall, neuer `whisky_score_breakdown`-Pfad + `42703`-Check, 6 neue „aktives Nicht-Teilnehmer-Mitglied"-Fälle) und `rating-rules` (Breakdown-View statt roher Tabelle, Notiz-Privatheit) |
| `tests/PROJ-9-ergebnisse-historie.spec.ts` | **25 passed / 3 skipped** über `chromium` + `Mobile Safari` (2× `fixme` = BUG-1, 1× Dashboard nur `chromium`) |
| `tsc --noEmit` · `eslint .` · `npm run build` | alle sauber; Route `/tastings/[eventId]/ergebnisse` erzeugt |
| Regression PROJ-4/5/6/7/8 (E2E, je isoliert, chromium) | grün (4: 24, 5: 19, 6: 24, 7: 10, 8: 19). Zusammen mit PROJ-7/8 im selben Lauf flaken die „Laufendes Event"-Blöcke — bekannte projektweite Einschränkung (nur ein `active` global), kein PROJ-9-Regress |

### Acceptance Criteria Status — 22/24 bestanden

#### Historien-Liste
- [x] Alle abgeschlossenen Tastings der Runde, auch ohne eigene Teilnahme (E2E „bystander" + RLS-Fälle)
- [x] Sortierung Datum ↓, dann `closed_at` ↓ (`getPastTastings`-Logik)
- [x] Zeile zeigt Datum · Ort · Gastgeber · 🏆 Sieger
- [ ] **BUG-1:** abgeschlossenes Tasting **ohne jede Bewertung** → soll „— kein Sieger" zeigen, zeigt aber den Whisky auf Position 1
- [x] Zeile ist Link → Ergebnisseite
- [x] „Noch kein Tasting abgeschlossen." bei leerer Historie (Komponenten-Leerzustand; nicht als E2E isolierbar, da Seed/andere Tests abgeschlossene Events hinterlassen)
- [x] Neu abgeschlossenes Tasting erscheint in der Liste

#### Ergebnisseite — Zugang
- [x] Abgeschlossen → Kopf mit Datum, Ort, Thema, Gastgeber + Teilnehmerliste
- [x] Läuft / in Vorbereitung → Hinweis „läuft noch" + „Zum Dashboard", **keine** Ranglistendaten
- [x] Unbekannte / fremde Event-ID → „Seite nicht gefunden"

#### Ergebnisseite — Rangliste
- [x] N Zeilen nach Rang, Rang · Name · Distillery/Region · „mitgebracht von" · Gesamt · „Nase/Geschmack"
- [x] Ø als informative Zusatzzahl („Ø 13,0")
- [x] Rang 1 als Sieger hervorgehoben (nur bei ≥ 1 Bewertung)
- [x] „punktgleich" an beiden Zeilen bei identischer Gesamtpunktzahl
- [x] „k von m Bewertungen" je Zeile
- [x] Ohne jede Bewertung: Hinweis oben, kein Sieger hervorgehoben
- [x] Bis 10 Zeilen auf 375 px ohne horizontales Scrollen (gesamte `Mobile Safari`-Projektspalte grün, Viewport 375 px)

#### Ergebnisseite — Einzelbewertungen & Notizen
- [x] Aufklappen zeigt Nase/Geschmack/Gesamt je Bewerter
- [x] Eigene Notiz sichtbar („Deine Notiz: …")
- [x] Fremde Notizen nie sichtbar (E2E als `member` **und** als `other`; RLS: `whisky_score_breakdown` ohne `notes`-Spalte → `42703`, `ratings_select` auf eigene Zeilen verengt)

#### Ergebnisseite — Video
- [x] Mit Link → „Video ansehen", `target="_blank"`, `rel="noopener noreferrer"`
- [~] Ohne Link → **Design-System-Variante** „Auf Whisky.de suchen" (YouTube-Suche). Die Spec-AC „kein Video-Element ohne Link" ist damit **bewusst abgelöst** — mit dem Nutzer abgestimmt (Design-System `docs/design-system.md` „nie leer, nie tot" gewinnt). Kein Bug.
- [x] Kein Video-Link in der Historien-Liste (nur auf der Ergebnisseite)

#### Absprünge
- [x] Dashboard „Zur Rangliste" (nach Abschluss) → `/tastings/<id>/ergebnisse`
- [x] Eingefrorene Bewertungsansicht „Zu den Ergebnissen" → `/tastings/<id>/ergebnisse`

### Edge Cases Status
- [x] Ergebnisseite eines laufenden/vorbereiteten Events manuell aufgerufen → „läuft noch", keine Daten
- [x] Mitglied ohne Teilnahme → sieht Rangliste/Namen/Sieger/Videos, aber keine (eigenen) Notizen, Aufschlüsselung nur Punkte
- [ ] **BUG-1:** abgeschlossenes Event ganz ohne Bewertungen → Ergebnisseite korrekt (0-Punkte-Liste, Hinweis, kein Sieger); **Historien-Zeile falsch** (Whisky-Name statt „— kein Sieger")
- [x] Einzelner unbewerteter Whisky in sonst bewertetem Abend → am Ende der Rangliste mit 0 Punkten
- [x] Punktgleichheit → getrennte eindeutige Ränge, beide mit „punktgleich"
- [x] Distillery/Region/Thema nicht gesetzt → wird einfach weggelassen
- [x] Deaktiviertes Mitglied → `requireUser` leitet ohnehin ab; `is_active_member()` = false
- [x] Zwei Tastings am selben Kalendertag → beide gelistet, Zweitsortierung `closed_at`

### Security Audit Results
- [x] **Auth:** Ergebnisseite und Historie erfordern Login (`requireUser`)
- [x] **Blindheit bis Abschluss:** `whisky_rankings` / `past_tastings` / `whisky_score_breakdown` liefern für nicht-abgeschlossene Events 0 Zeilen — verifiziert per RLS-Test und per E2E (pending-Seite ohne Rangliste). Der `status='closed'`-Filter, nicht der View-Rechte-Modus, trägt die Garantie
- [x] **Fremde Notizen strukturell unerreichbar:** `whisky_score_breakdown` führt keine `notes`-Spalte (`select('notes')` → `42703`), `ratings_select` auf `is_admin() OR profile_id = auth.uid()` verengt. E2E: `other`s Notiz erscheint bei `member` nirgends, auch nicht im Response
- [x] **Runden-Historie korrekt abgegrenzt:** aktives Nicht-Teilnehmer-Mitglied sieht die abgeschlossene Runde, das **aktive** Event bleibt komplett unsichtbar (RLS-Test „Blindheit hält")
- [x] **Autorisierung:** URL-Raten `/tastings/<aktive-id>/ergebnisse` liefert nur den „läuft noch"-Hinweis, serverseitig keine Datenzeilen
- [x] **XSS:** Whisky-Namen, Notizen, Thema als React-Text (auto-escaped, auch mit `whitespace-pre-wrap`). Video-`href` per DB-CHECK `^https?://` (kein `javascript:`); Fallback-URL über `encodeURIComponent` auf `youtube.com`
- [~] **Hinweis (pre-existing, nicht neu):** `event_status_of` ist für jeden Angemeldeten mit beliebiger Event-ID aufrufbar und verrät den Status (draft/active/closed). Kein Inhalt, nur der Zustand. Stammt aus PROJ-1; PROJ-9 nutzt es nur für „läuft noch vs. nicht gefunden". Kein Handlungsbedarf im MVP

### Bugs Found

#### BUG-1: Historien-Liste nennt einen „Sieger" für ein Tasting ohne jede Bewertung
- **Severity:** Low
- **Steps to Reproduce:**
  1. Ein Event abschließen, an dem **niemand** einen Whisky bewertet hat
  2. `/tastings` öffnen → Abschnitt „Vergangene Tastings"
  3. Erwartet: die Zeile zeigt „— kein Sieger"
  4. Tatsächlich: die Zeile zeigt den Namen des Whiskys auf Ausschankposition 1
- **Ursache:** `whisky_rankings` vergibt auch bei 0 Punkten Rang 1 (Sortierung `… , w.position asc`); `past_tastings.winner_name` ist dann gesetzt, und `getPastTastings` reicht es ungefiltert durch.
- **Fix (klein, Frontend):** in `getPastTastings` `winner_name` auf `null` abbilden, wenn `winner_points` fehlt oder `0` ist. Die **Ergebnisseite** ist bereits korrekt — dort unterdrückt `hasAnyRatings` die Sieger-Hervorhebung.
- **Abgedeckt durch:** `test.fixme` „Historie: abgeschlossener Abend ohne jede Bewertung zeigt „— kein Sieger"" — wird grün, sobald der Fix steht.
- **Priorität:** Fix in einem kleinen `/frontend`-Nachzug (oder gebündelt im Vor-Deploy-Durchlauf)

#### BUG-2: (projektweit, bekannt) E2E-Interferenz bei aktiven Events + Hydration-Doppelrender
- **Severity:** Low
- Nicht PROJ-9-spezifisch. Läuft man mehrere „Laufendes Event"-Specs im selben `playwright test`-Aufruf, schließen sie sich gegenseitig das global einzige `active`-Event weg (1–2 rotierende Fehler). Jede Spec isoliert stabil. Steht auf der `/deploy`-Liste (Specs sharden / `--workers=1`) zusammen mit dem projektweiten transienten Hydration-Doppelrender.

### Summary
- **Acceptance Criteria:** 22/24 bestanden — 1 × BUG-1 (Low), 1 × Video-„kein Element"-AC bewusst durch das Design-System abgelöst (kein Bug)
- **Bugs Found:** 2 total (0 Critical, 0 High, 0 Medium, 2 Low)
- **Security:** Pass — Blindheit bis Abschluss verifiziert, fremde Notizen strukturell unerreichbar, Runden-Historie korrekt gated
- **Production Ready:** **YES** — kein Critical/High. BUG-1 ist kosmetisch (seltene Konstellation, Ergebnisseite selbst korrekt), BUG-2 ist eine stehende Test-Infra-Notiz
- **Recommendation:** **Approved.** BUG-1 als kleinen `/frontend`-Nachzug einplanen; die `test:rls`-Suite ist mit der eingespielten Migration grün (90/90).

## Deployment
_To be added by /deploy_
