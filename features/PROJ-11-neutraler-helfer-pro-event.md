# PROJ-11: Neutraler Helfer pro Event

## Status: Deployed
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- **Requires: PROJ-6 (Gastgeber-Steuerung & Ablauf)** — der Helfer übernimmt
  genau diese Ansicht und ihre Aktionen (Reihenfolge, Start, Runde/Event
  abschließen, Eckdaten, Fortschrittszähler).
- **Requires: PROJ-4 (Admin – Tasting-Events)** — die Helfer-Zuordnung entsteht
  im Event-Formular, neben Gastgeber und Teilnehmerliste.
- **Requires: PROJ-5 (Whisky-Erfassung)** — die Sicht auf die geheimen
  Whisky-Details in der Vorbereitungsphase wandert vom Gastgeber zum Helfer.
- **Requires: PROJ-3 (Admin – Teilnehmerverwaltung)** — die Deaktivierungs-Regel
  („kein Helfer eines offenen Events deaktivierbar").
- **Requires: PROJ-8 (Tasting-Dashboard)** — der Helfer sieht das Dashboard samt
  Live-Sync und den „Steuern"-Absprung.
- **Baut auf PROJ-1** — Rollen-/RLS-Helferfunktionen, `create_event` /
  `update_event` / die Steuerungs-RPCs, `rating_progress`; die Blindheit wird auf
  DB-Ebene erzwungen.
- **Betrifft PROJ-9** (Ergebnis-Kopf „Helfer: {Name}") und **PROJ-10** (die
  persönliche Bilanz zählt eine Helfer-Rolle **nicht** als Tasting).

## Kontext

Die P0-Kette geht davon aus: der **Gastgeber** schenkt aus, sieht deshalb die
geheimen Whisky-Details und steuert den Abend. Manche Abende laufen aber anders —
eine Person mag den Abend organisieren und ausschenken, ohne selbst mitzutrinken.

PROJ-11 führt dafür eine **optionale Rolle je Event** ein: den **Helfer**. Ist
für ein Event ein Helfer benannt, dann
- **verkostet der Helfer nicht** (er steht nicht in der Teilnehmerliste),
- **sieht der Helfer die geheimen Details** dieses Events (Namen, Herkunft,
  Bringer, Video-Link) vor dem Abschluss,
- **steuert der Helfer den Ablauf** (Ausschankreihenfolge, Start, Runden
  weiterschalten, Event abschließen, Eckdaten, Fortschrittszähler),
- **wird der Gastgeber zum normalen Teilnehmer**: er verkostet blind mit (inkl.
  seines Gastgeber-Bonus-Whiskys und seiner Bewertungen), sieht aber **keine**
  Details mehr und hat **keine** Steuerungs-Ansicht.

Ohne Helfer bleibt alles exakt wie heute. Die Rolle ist **rein per Event** — es
gibt keinen globalen „Helfer"-Rollenwert; dieselbe Person kann bei einem Abend
Helfer, beim nächsten normaler Teilnehmer sein. Genau **einer oder keiner** pro
Event.

Die Verengung der Gastgeber-Sicht wird **auf Datenbankebene (RLS)** erzwungen,
nicht nur in der Oberfläche.

## User Stories

- Als **Admin** möchte ich beim Anlegen eines Abends optional einen Helfer
  benennen, damit eine Person ausschenken und steuern kann, ohne mitzutrinken.
- Als **Helfer** möchte ich die Ausschankreihenfolge festlegen, das Event
  starten und die Runden weiterschalten, damit der Abend ohne den Gastgeber am
  Steuer läuft.
- Als **Helfer** möchte ich die geheimen Whisky-Details dieses Events sehen,
  damit ich weiß, was ich in welcher Reihenfolge einschenke.
- Als **Gastgeber mit Helfer** möchte ich meinen eigenen Whisky blind mitbewerten
  wie alle anderen, ohne die Auflösung vorab zu sehen.
- Als **Teilnehmer** möchte ich, dass die Blindheit auch dann hält, wenn ein
  Helfer den Abend steuert — niemand außer dem Helfer sieht vorab, was im Glas
  ist.
- Als **Admin** möchte ich die Helfer-Zuordnung ändern oder entfernen können,
  solange der Abend in Vorbereitung ist.

## Out of Scope

- **Kein globaler „Helfer"-Rollenwert** in `profiles` — die Rolle ist rein per
  Event.
- **Mehrere Helfer pro Event** — genau einer oder keiner.
- **Ein Helfer, der auch mitverkostet** — entweder Helfer oder Teilnehmer, nicht
  beides.
- **Übergabe der Steuerung im laufenden Event** — die Rolle ist ab dem Start
  fixiert; danach kann nur der Admin noch eingreifen (God-Mode).
- **Ein eigener Helfer-Screen** — dieselbe Steuerungs-Ansicht wie der Gastgeber
  (`/tastings/[eventId]/gastgeber`).
- **Ein „Helfer"-Zähler in der persönlichen Bilanz** (PROJ-10) — die Bilanz
  zählt Teilnahmen; der Helfer war kein Teilnehmer.
- **Benachrichtigung** an den Helfer („du bist eingeteilt") — er sieht es beim
  Öffnen der App (kein Push, PRD-Non-Goal).
- **Helfer für ein bereits laufendes oder abgeschlossenes Event** nachtragen —
  Zuordnung nur im Draft.
- **Der Helfer bearbeitet/löscht fremde Whisky-Einträge** — das bleibt bei jedem
  Bringer selbst bis zum Start.
- **Der Helfer trägt eigene Whiskys ein** — er bringt nichts mit.
- **Whisky-Namen auf dem Dashboard-Gläserstreifen** — der bleibt für alle
  namenlos, auch für den Helfer.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Helfer benennen (Admin, Event-Formular)

- [ ] Angenommen der Admin legt ein Event an oder bearbeitet ein Draft-Event,
      wenn er das Formular betrachtet, dann gibt es ein optionales Feld „Helfer",
      das eine aktive Person auswählen lässt; leer = kein Helfer.
- [ ] Angenommen eine Person ist bereits als Gastgeber oder als Teilnehmer des
      Events ausgewählt, wenn der Admin das Helfer-Feld öffnet, dann ist diese
      Person dort nicht wählbar (und umgekehrt).
- [ ] Angenommen der Admin schickt trotzdem eine Auswahl ab, in der der Helfer
      gleich dem Gastgeber ist oder in der Teilnehmerliste steht, wenn er
      speichert, dann wird das mit einer klaren Meldung abgelehnt und nichts
      gespeichert.
- [ ] Angenommen der Admin wählt einen Helfer und speichert, wenn das Event ein
      Draft ist, dann ist der Helfer gesetzt; das Event zeigt in der
      Admin-Liste/Detailansicht „Helfer: {Name}".
- [ ] Angenommen ein Event ist nicht mehr „In Vorbereitung" (läuft oder
      abgeschlossen), wenn der Admin das Event öffnet, dann lässt sich die
      Helfer-Zuordnung nicht mehr ändern (wie Gastgeber und Teilnehmerliste).
- [ ] Angenommen ein Draft-Event hat einen Helfer, wenn der Admin ihn entfernt
      und speichert, dann verhält sich das Event wieder wie „ohne Helfer" (der
      Gastgeber bekommt Steuerung und Detail-Einblick zurück).

### Sicht & Rechte des Helfers

- [ ] Angenommen ein Event hat einen Helfer, wenn der Helfer die App öffnet,
      dann sieht er das Dashboard dieses Events (Eckdaten, Teilnehmerliste,
      Gläserstreifen, Live-Sync) und den Absprung „Steuern", aber **nicht**
      „Jetzt bewerten".
- [ ] Angenommen ein Event mit Helfer ist in Vorbereitung, wenn der Helfer die
      Whisky-Übersicht dieses Events öffnet, dann sieht er alle eingetragenen
      Whiskys mit Details (Name, Bringer, Video-Link).
- [ ] Angenommen ein Event mit Helfer läuft, wenn der Helfer die
      Steuerungs-Ansicht öffnet, dann kann er Eckdaten bearbeiten, die
      Ausschankreihenfolge festlegen (mit Namen), das Event starten, Runden
      weiterschalten und das Event abschließen — dieselben Funktionen wie der
      Gastgeber ohne Helfer.
- [ ] Angenommen ein Event mit Helfer läuft, wenn der Helfer den
      Bewertungs-Fortschritt betrachtet, dann sieht er „x von y haben Whisky N
      bewertet" — **ohne** Punkte, ohne wer was vergeben hat.
- [ ] Angenommen ein Event hat einen Helfer, wenn der Helfer die
      Bewertungsansicht aufruft, dann ist sie für ihn nicht bewertbar (er ist
      kein Teilnehmer).
- [ ] Angenommen ein Event mit Helfer ist abgeschlossen, wenn der Helfer die
      Ergebnisseite öffnet, dann sieht er die volle Rangliste wie jedes aktive
      Mitglied.

### Verengung für den Gastgeber (RLS-erzwungen)

- [ ] Angenommen ein Event hat einen Helfer, wenn der Gastgeber die
      Whisky-Details dieses Events abfragt (auch direkt über die API), dann
      bekommt er sie **nicht** (nur Position/Whisky-Nummer, wie jeder
      Teilnehmer), bis das Event abgeschlossen ist.
- [ ] Angenommen ein Event hat einen Helfer, wenn der Gastgeber
      `/tastings/[eventId]/gastgeber` aufruft, dann bekommt er „Seite nicht
      gefunden".
- [ ] Angenommen ein Event hat einen Helfer, wenn der Gastgeber eine
      Steuerungs-Aktion direkt über die API auslöst (Reihenfolge setzen,
      weiterschalten, abschließen), dann wird sie abgelehnt.
- [ ] Angenommen ein Event hat einen Helfer, wenn der Gastgeber das Dashboard
      oder die Tastings-Liste betrachtet, dann sieht er **keinen**
      „Steuern"-Absprung, aber „Jetzt bewerten" und „Meine Whiskys" wie ein
      normaler Teilnehmer.
- [ ] Angenommen ein Event mit Helfer läuft, wenn der Gastgeber seinen eigenen
      Whisky bewertet, dann funktioniert das wie bei jedem Teilnehmer (er
      verkostet blind mit, inkl. seines Gastgeber-Bonus-Whiskys).

### Ohne Helfer (unverändert)

- [ ] Angenommen ein Event hat **keinen** Helfer, wenn der Gastgeber die App
      nutzt, dann sieht er die Details, hat die Steuerungs-Ansicht und den
      „Steuern"-Absprung — exakt wie vor PROJ-11.

### Admin & Blindheit

- [ ] Angenommen eine Person ist Admin, wenn ein Event einen Helfer hat, dann
      kann der Admin die Steuerung und die Details trotzdem sehen (God-Mode wie
      überall).
- [ ] Angenommen ein Event mit Helfer läuft, wenn irgendjemand außer dem Helfer
      (inkl. Gastgeber und Teilnehmer) vor dem Abschluss versucht, die
      Whisky-Namen oder fremde Bewertungen zu sehen, dann gelingt das nicht — die
      Blindheit hält.

### Ergebnis & Historie

- [ ] Angenommen ein Event mit Helfer ist abgeschlossen, wenn ein Mitglied die
      Ergebnisseite öffnet, dann steht im Kopf „Helfer: {Name}" neben „Gastgeber:
      {Name}"; der Helfer erscheint **nicht** in „Wer war dabei" und **nicht** in
      der Rangliste.
- [ ] Angenommen jemand hat bei einem Abend als Helfer mitgewirkt, wenn er seine
      persönliche Bilanz (PROJ-10) öffnet, dann zählt dieser Abend **nicht** als
      Tasting.

## Edge Cases

- **Helfer im Draft entfernen** → Gastgeber bekommt Steuerung + Detail-Einblick
  sofort zurück.
- **Helfer im Draft wechseln** → alter Helfer verliert Zugriff, neuer bekommt
  ihn; jederzeit möglich, solange Draft.
- **Zugeordneten Helfer deaktivieren** (Admin → Teilnehmer) → wird abgelehnt,
  solange die Person Helfer eines nicht abgeschlossenen Events ist (analog
  Gastgeber heute). Für abgeschlossene Events bleibt der Name als Historie.
- **Helfer im laufenden Event abwesend/offline** → kein Sonderfall; der Admin
  kann immer steuern. Keine Rückgabe an den Gastgeber im laufenden Event.
- **Event mit Helfer, aber ohne Whiskys/Teilnehmer** → „Tasting starten"
  deaktiviert bis Whiskys da sind; der Helfer sieht denselben leeren Zustand wie
  der Gastgeber heute.
- **Person ist Admin und als Helfer benannt** → funktioniert, redundant, kein
  Fehler.
- **Gastgeber wird im Draft gewechselt, während ein Helfer gesetzt ist** → der
  neue Gastgeber übernimmt die Teilnehmer-Rolle; der Helfer bleibt; die
  Gleich-Person-Prüfung greift, falls der neue Gastgeber der Helfer ist.
- **Helfer versucht, einen Whisky einzutragen** → nicht möglich (kein
  Teilnehmer); die Whisky-Erfassung ist für ihn nicht erreichbar.
- **Zwei Events gleichzeitig** → weiterhin nur eins aktiv (PROJ-1-Regel); ein
  Helfer kann bei mehreren Draft-Events benannt sein, aktiv steuern kann er nur
  das eine laufende.

## Technical Requirements (optional)

- **Sicherheit / Blindheit:** RLS-erzwungen. Die Sichtbarkeit der geheimen
  Whisky-Details und der Zugriff auf die Steuerungs-RPCs / den
  Fortschrittszähler prüfen künftig zusätzlich, ob für das Event ein Helfer
  benannt ist; ist einer benannt, greift der Gastgeber-Zweig nicht mehr.
- **Konsistenz:** Der Helfer darf nicht gleichzeitig Gastgeber oder Teilnehmer
  desselben Events sein — im Client geführt **und** serverseitig geprüft.
- **Zuordnung nur im Draft** — Änderungen an der Helfer-Zuordnung nur solange
  `status = 'draft'`.
- **Realtime:** der Helfer abonniert denselben Event-Kanal wie alle; seine
  Dashboard- und Steuerungsansicht aktualisieren sich live beim Rundenwechsel.
- **Kein neuer globaler Rollenwert**, keine Änderung an `profiles.role`.
- **Performance / Browser:** wie der Rest der App (mobile-first, aktuelle
  Browser).

- [x] ~~Fehlercode Helfer-Konsistenz~~ **Gelöst (`/architecture`): neuer Code
      `TS017`** („helper_conflict") für „Helfer = Gastgeber / Helfer ist
      Teilnehmer". Genauer Wortlaut in `/frontend`.
- [x] ~~Deaktivierungs-Sperre für zugeordnete Helfer~~ **Gelöst:** derselbe Code
      `TS013` wie beim Gastgeber, ergänzter Text („… Gastgeber **oder Helfer**
      eines noch nicht abgeschlossenen Tastings").
- [ ] „Steuern"-Absprung für den Helfer in der `/tastings`-Zeile: ab „läuft" (wie
      beim Gastgeber) oder schon im Draft? Vorschlag „ab läuft" — final in
      `/frontend`.
- [ ] Braucht der Helfer eine eigene read-only Whisky-Übersicht, oder reicht die
      **Namensliste in der Steuerungs-Ansicht** (die es schon gibt)? Vorschlag:
      es reicht die Steuerung — kein Eingriff in `/tastings/[eventId]/whiskies`.
      Final in `/frontend`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Helfer ist **rein per Event** (Zuordnung am Event), kein globaler `profiles.role`-Wert | Dieselbe Person ist mal Helfer, mal normaler Teilnehmer; ein globaler Rollenwert wäre falsch | 2026-08-31 |
| Genau **einer oder keiner** pro Event | Ein Abend hat eine Person am Ausschank; mehrere Helfer bringen keinen Mehrwert und verkomplizieren die Rechte | 2026-08-31 |
| Ist ein Helfer benannt, wird der **Gastgeber zum normalen Teilnehmer** (verkostet blind mit, inkl. Bonus-Whisky; verliert Details + Steuerung) | Genau der Sinn der Rolle — der Gastgeber muss nicht ausschenken, also darf/soll er blind mitmachen | 2026-08-31 |
| Der Helfer ist **kein Teilnehmer** (steht nicht in `event_participants`), bringt nichts mit, bewertet nicht | „Neutraler" Helfer; er hilft, statt zu verkosten | 2026-08-31 |
| Helfer ≠ Gastgeber und Helfer ∉ Teilnehmerliste — im Client geführt **und** serverseitig geprüft | Ein Zustand „verkostet und hilft" wäre widersprüchlich; Absicherung wie überall (Client + Server + DB) | 2026-08-31 |
| Zuordnung/Änderung **nur im Draft** durch den Admin, im selben Event-Formular | Wie Gastgeber und Teilnehmerliste heute; ab Start ist die Rolle fixiert | 2026-08-31 |
| Der Helfer nutzt **dieselbe Steuerungs-Ansicht** wie der Gastgeber (`/tastings/[eventId]/gastgeber`), mit denselben Funktionen | Kein Wartungs-Doppel, kein neuer Screen | 2026-08-31 |
| Der Helfer sieht **das Dashboard wie ein Teilnehmer** + „Steuern", nicht „Jetzt bewerten" | Er muss den Abend verfolgen und steuern, aber nicht bewerten | 2026-08-31 |
| Der Helfer sieht den **Bewertungs-Fortschritt als Zähler** (wie der Gastgeber heute), **nie** Punkte oder fremde Notizen | Die Blindheit hält auch für den Helfer bis zum Abschluss | 2026-08-31 |
| Whisky-Namen: in der **Steuerung mit Namen**, auf dem **Dashboard-Gläserstreifen namenlos** für alle | Der Helfer braucht Namen zum Ausschenken; der Streifen bleibt runden-konsistent | 2026-08-31 |
| Nach dem Abschluss: **„Helfer: {Name}"** im Ergebnis-Kopf; Helfer **nicht** in „Wer war dabei" / Rangliste | Er war Teil des Abends, aber kein Verkoster | 2026-08-31 |
| Persönliche Bilanz (PROJ-10) zählt eine Helfer-Rolle **nicht** als Tasting | Die Bilanz zählt Teilnahmen | 2026-08-31 |
| Zugeordneten Helfer eines **nicht abgeschlossenen** Events kann der Admin nicht deaktivieren | Analog zur bestehenden Gastgeber-Regel; verhindert einen führerlosen Abend | 2026-08-31 |
| Keine Steuerungs-Rückgabe an den Gastgeber im **laufenden** Event; nur der Admin greift dann noch ein | Klare, fixe Rollen ab Start; der Admin ist der Notausgang | 2026-08-31 |
| **Verengung der Gastgeber-Sicht RLS-erzwungen**, nicht nur UI | Die Blindheit ist in dieser App immer die DB-Schicht | 2026-08-31 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| **Eine neue Spalte** `tasting_events.helper_id` (nullable, → `profiles`, `ON DELETE RESTRICT`), **keine neue Tabelle** | Genau einer oder keiner pro Event; `RESTRICT` wie bei `host_id` (die Deaktivierungs-Regel deckt den „offenes Event"-Fall ab) | 2026-08-31 |
| **Eine tragende Helfer-Funktion** `is_event_helper(event)` (`security definer`, `stable`, `search_path=''`), analog `is_event_host` | Alle Policy- und RPC-Änderungen sind ein Ein-Zeiler damit | 2026-08-31 |
| Dazu `event_has_helper(event)` (Helfer benannt?) und `can_run_host_control(event)` = `is_admin() OR is_event_helper() OR (is_event_host() AND NOT event_has_helper())` | Die „Gastgeber nur ohne Helfer"-Regel steht **an einer Stelle**; die fünf Steuerungs-RPCs + `rating_progress` rufen sie alle auf | 2026-08-31 |
| **`wd_select` (Geheim-Details):** Gastgeber-Zweig auf „kein Helfer" einengen, Helfer-Zweig ergänzen — `own`- und `closed`-Zweig unangetastet | Die Verengung der Blindheit auf DB-Ebene; der Gastgeber-mit-Helfer sieht die Details auch per Direkt-API nicht | 2026-08-31 |
| **`whiskies_select` / `events_select` / `participants_select`:** je `OR is_event_helper(...)` ergänzen | Der Helfer ist kein Teilnehmer, braucht aber Positionen, die Event-Zeile und die Teilnehmerliste. Der Nicht-Teilnehmer-ohne-Rolle sieht weiterhin nichts → die PROJ-8-„Blindheit für Außenstehende" bleibt RLS-erzwungen | 2026-08-31 |
| **`ratings_select`: keine Änderung** | Der Helfer sieht nie Bewertungszeilen; er bekommt nur Zähler über `rating_progress` | 2026-08-31 |
| **`create_event` / `update_event`:** neuer Parameter `p_helper_id` (default null); prüft „aktives Mitglied ∧ ≠ Gastgeber ∧ ∉ Teilnehmerliste"; Änderung nur im `draft` | Zuordnung wie Gastgeber/Teilnehmer heute; Konsistenz serverseitig erzwungen | 2026-08-31 |
| **`set_event_participants`:** lehnt ab, wenn der aktuelle `helper_id` in der neuen Liste steht (`TS017`) | Verhindert „verkostet und hilft" auch über den zweiten Eingabepfad | 2026-08-31 |
| **Fünf Steuerungs-RPCs** (`set_whisky_order`, `start_event`, `close_round`, `close_event`, `update_event_host_fields`) **+ `rating_progress`:** Guard `is_admin() OR is_event_host()` → `can_run_host_control()` | Zentrale Stelle; der Gastgeber-mit-Helfer kann keine Steuerungs-Aktion mehr auslösen | 2026-08-31 |
| **`deactivate_member`:** die bestehende „Gastgeber eines offenen Events"-Sperre (`TS013`) um „… oder Helfer" erweitern | Verhindert einen führerlosen Abend; ein Fehlercode weniger | 2026-08-31 |
| **`admin_list_events`** um `helper_id` + `helper_name` erweitern; **`past_tastings`**-View um `helper_id` + Helfer-Name | Admin-Liste/Detail und der Ergebnis-Kopf („Helfer: {Name}") | 2026-08-31 |
| Neuer Fehlercode **`TS017`** („helper_conflict") in `errors.ts` | Bessere Meldung als das generische `TS004` | 2026-08-31 |
| **Frontend-Guard `canAccessHostArea`** (rein, unit-getestet) bekommt `event.helper_id`: `isAdmin ∨ helper_id === userId ∨ (isEventHost ∧ !helper_id)` | Eine Änderung deckt `requireHost` (`auth.ts`) **und** `requireHostOr` (`actions/host-control.ts`) ab | 2026-08-31 |
| **`getDashboard`** gibt zusätzlich `isHelper` zurück; das aktive Event wird auch dann geliefert, wenn `isHelper` (die geweitete `events_select`-Policy trägt das ohnehin) | Der Helfer sieht das Dashboard + „Steuern", nicht „Jetzt bewerten" | 2026-08-31 |
| **`getMyTastings`** liest zusätzlich Events mit `helper_id = userId` und mischt sie ein; `MyTastingRow` bekommt `is_helper`; die Zeile zeigt „Steuern" für den Helfer und **nicht** für den Gastgeber-mit-Helfer | Sonst fände der Helfer „seinen" Abend nicht unter `/tastings` | 2026-08-31 |
| **Kein Eingriff** in `/tastings/[eventId]/whiskies` und `/bewerten`: `getWhiskyEntryData` / `getRatingViewData` prüfen Teilnahme → der Helfer bekommt „nicht gefunden" (gewollt). Seine Whisky-Sicht läuft über die **Namensliste in der Steuerung** | Kein neuer Screen, kein Doppel-Pfad | 2026-08-31 |
| **Kein Eingriff** in `whisky_rankings` und `getPersonalBalance` (PROJ-10) | Der Helfer bringt nichts mit, bewertet nicht, ist kein Teilnehmer → er erscheint dort ohnehin nicht | 2026-08-31 |
| **Realtime:** keine spezifische Änderung — der Helfer empfängt die `tasting_events` / `whiskies`-Ereignisse, weil `events_select` / `whiskies_select` ihn jetzt einschließen | Der PROJ-8-Hook wird auf Dashboard + Steuerung genutzt, beide sieht der Helfer jetzt | 2026-08-31 |
| **Eine Migration**, danach `npm run db:types`; die RLS-Integrationstests bekommen Helfer-Fälle | Alle Änderungen sind mechanisch und hängen zusammen | 2026-08-31 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-11 dreht sich um **eine Frage**, an vielen Stellen dieselbe: „Gibt es für
dieses Event einen Helfer?" Ist einer benannt, verschiebt sich das
Gastgeber-Recht (geheime Details sehen, Ablauf steuern, Fortschrittszähler) auf
den Helfer; der Gastgeber ist dann nur Teilnehmer.

Der Bau ist entsprechend: **eine neue Spalte**, **eine tragende Helfer-Funktion**,
und dann überall dort, wo heute „Gastgeber" geprüft wird, dieselbe kleine
Regeländerung — **auf DB-Ebene erzwungen**, nicht nur in der Oberfläche.

Es gibt Backend (Migration) **und** Frontend (Formular, Guards, Dashboard,
Ergebnis-Kopf). Keine neue Seite, keine neue Abhängigkeit.

### A) Datenmodell

```
tasting_events
  + helper_id  uuid  NULL  → profiles(id)  ON DELETE RESTRICT
      NULL      = kein Helfer, alles wie heute
      gesetzt   = diese Person steuert, der Gastgeber verkostet blind mit
```

Regeln (RPC-erzwungen): `helper_id` ist ein **aktives Mitglied**, **≠ host_id**,
**∉ Teilnehmerliste** des Events; änderbar nur solange `status = 'draft'`.

Keine neue Tabelle (genau einer oder keiner). `ON DELETE RESTRICT` wie bei
`host_id`.

### B) Die tragende Logik (drei kleine DB-Funktionen)

| Funktion | liefert |
|---|---|
| `is_event_helper(event)` | Ist der Aufrufer der Helfer dieses Events? (analog `is_event_host`) |
| `event_has_helper(event)` | Ist überhaupt ein Helfer benannt? |
| `can_run_host_control(event)` | `Admin` **oder** `Helfer` **oder** (`Gastgeber` **und kein** Helfer) |

`can_run_host_control` ist die **eine Stelle**, an der die „Gastgeber nur ohne
Helfer"-Regel für den Ablauf lebt.

### C) Was sich ändert (Karte)

**Backend — eine Migration:**

```
Sichtbarkeit (RLS)
├─ whisky_details  · Gastgeber-Zweig auf „kein Helfer" einengen + Helfer-Zweig
│                    ergänzen   (own / closed bleiben)
├─ whiskies        · + Helfer   (Positionen)
├─ tasting_events  · + Helfer   (Event-Zeile)
└─ event_participants · + Helfer (Teilnehmerliste)
   ratings         · UNVERÄNDERT — der Helfer sieht nie Punkte

Ablauf-Steuerung (RPCs)
├─ set_whisky_order / start_event / close_round / close_event /
│  update_event_host_fields / rating_progress
│      Guard  „Admin ∨ Gastgeber"  →  can_run_host_control()
├─ create_event / update_event      + Parameter p_helper_id (+ Konsistenzprüfung,
│                                     nur im draft)              → TS017
├─ set_event_participants            lehnt den aktuellen Helfer in der Liste ab → TS017
├─ deactivate_member                „Gastgeber eines offenen Events"  →  „… oder Helfer"  (TS013)
└─ admin_list_events                 + helper_id, helper_name

Ergebnis-View
└─ past_tastings   + helper_id + Helfer-Name

Fehlercodes
└─ errors.ts       + TS017 „Helfer und Teilnehmer/Gastgeber schließen sich aus."
```

**Frontend:**

```
Rollen-Prädikat (rein, unit-getestet)
└─ auth-rules.ts · canAccessHostArea(user, profile, event{host_id, helper_id})
     = isAdmin ∨ helper_id === user ∨ (isEventHost ∧ !helper_id)
   → deckt requireHost (auth.ts) UND requireHostOr (actions/host-control.ts) ab

Admin – Event-Formular
├─ schemas/admin-events.ts · + helperId (optional), refine: ≠ hostId, ∉ participantIds
├─ event-form.tsx · neues Feld „Helfer (optional)"; Optionen schließen
│                   Gastgeber + Teilnehmer aus (weiche Führung)
├─ actions/admin-events.ts · p_helper_id an create/update; TS017 → Meldung
└─ admin/events/[eventId] + event-list/-row · „Helfer: {Name}" anzeigen

Dashboard
└─ queries/dashboard.ts · + isHelper; DashboardView: „Steuern" für Helfer/Admin/
   Gastgeber-ohne-Helfer, „Jetzt bewerten" nur für Teilnehmer (Helfer fällt raus)

Tastings-Liste
└─ queries/tastings.ts · getMyTastings mischt Events mit helper_id = user ein;
   MyTastingRow + is_helper; tasting-row.tsx zeigt „Steuern" für den Helfer,
   nicht für den Gastgeber-mit-Helfer

Ergebnisseite
└─ queries/results.ts + results-header.tsx · Zeile „Helfer: {Name}" (falls gesetzt)

Unverändert
├─ /tastings/[eventId]/whiskies + /bewerten · Teilnahme-Check → Helfer bekommt
│    „nicht gefunden" (gewollt); seine Whisky-Sicht = Namensliste in der Steuerung
├─ whisky_rankings / getPersonalBalance (PROJ-10) · Helfer taucht dort nie auf
└─ Realtime · Helfer empfängt die Ereignisse automatisch (RLS jetzt geweitet)
```

### D) „Datenmodell" — was gespeichert wird

Nur die eine Spalte `helper_id`. Alles andere leitet sich daraus ab (die drei
Funktionen). Kein Rollenwert in `profiles`, keine Verlaufstabelle.

### E) Backend-Bedarf

**Ja — eine Migration** (Spalte + drei Funktionen + die o. g. Policy-/RPC-/
View-Änderungen + `TS017`), danach `npm run db:types`. Die
RLS-Integrationstests bekommen Helfer-Fälle (Helfer sieht Details & steuert;
Gastgeber-mit-Helfer sieht sie nicht & kann nicht steuern; Außenstehender
weiterhin nichts; Deaktivierungs-Sperre).

### F) Neue Pakete

Keine.

### G) Auswirkungen auf Bestehendes

- **PROJ-6 (Steuerung):** Zugriff und RPC-Guards weiten sich um den Helfer und
  verengen sich für den Gastgeber-mit-Helfer. Die Ansicht selbst bleibt.
- **PROJ-4 (Event-Formular):** ein neues optionales Feld + eine Konsistenzregel.
- **PROJ-5 (Whisky-Details):** die `wd_select`-Verengung. `add_whisky` /
  `wd_update_own` unverändert (der Helfer schreibt nichts).
- **PROJ-8 (Dashboard):** `isHelper` + Absprung-Logik. Die „Außenstehende sehen
  nichts"-Garantie bleibt (RLS).
- **PROJ-9 (Ergebnis):** „Helfer: {Name}" im Kopf; Rangliste unberührt.
- **PROJ-3 (Deaktivierung):** die `TS013`-Sperre deckt jetzt auch Helfer ab.
- **PROJ-10 (Bilanz):** nichts zu tun — Helfer ist kein Teilnehmer.
- **Generierte Typen:** `helper_id` kommt via `db:types` in `types.ts`.

### H) Sicherheits-Betrachtung

- Die **Blindheit bleibt RLS-erzwungen**: der Gastgeber-mit-Helfer bekommt die
  geheimen Details auch über die Direkt-API nicht; die Steuerungs-RPCs weisen
  ihn ab (`can_run_host_control`). Nur der Helfer (bzw. Admin) kommt durch.
- Ein **Außenstehender** (weder Teilnehmer noch Helfer noch Admin) sieht das
  Event weiterhin gar nicht — die drei `OR is_event_helper`-Ergänzungen öffnen
  nichts für andere.
- Der Helfer sieht **nie** Bewertungszeilen (kein `ratings_select`-Zweig), nur
  Zähler.
- `helper_id`-Konsistenz (≠ Gastgeber, ∉ Teilnehmer) ist **serverseitig**
  erzwungen (`TS017`), an beiden Eingabepfaden (Event-RPCs **und**
  `set_event_participants`).
- Ein zugeordneter Helfer eines nicht abgeschlossenen Events kann nicht
  deaktiviert werden (`TS013`) — kein führerloser Abend.

## Implementation Notes (Frontend)

**Stand:** Frontend umgesetzt am 2026-08-31. Der Datenbank-Teil (Spalte
`tasting_events.helper_id`, Helfer-Funktionen, RLS-Zweige, RPC-Parameter
`p_helper_id`, `admin_list_events` / `past_tastings` um Helfer-Spalten erweitert,
`TS013`/`TS017`) steht noch aus → `/backend PROJ-11`. Bis dahin greifen die
Helfer-Pfade in der UI mangels Daten ins Leere, brechen aber nichts.

### Reine Frontend-Entscheidungen (aus den offenen Fragen des Specs)

- **„Steuern"-Absprung für den Helfer:** erscheint auf `/` (Dashboard) und in der
  `/tastings`-Zeile nach genau derselben Regel wie beim Gastgeber — nämlich
  `isHelper || (isHost && !helper_id)`. Der Gastgeber-mit-Helfer sieht „Steuern"
  nicht mehr. Ob der Absprung schon in der Vorbereitungsphase sichtbar ist,
  richtet sich wie beim Gastgeber nach dem bestehenden Verhalten (Dashboard erst
  ab „läuft/gerade abgeschlossen"; `/tastings`-Zeile immer).
- **Whisky-Sicht des Helfers:** keine eigene Seite. `/tastings/[eventId]/whiskies`
  bleibt unverändert (Teilnehmer-Sicht „meine mitgebrachten"). Der Helfer bringt
  nichts mit; der Link „Meine Whiskys" wird für ihn ausgeblendet. Seine Sicht auf
  alle geheimen Details entsteht im Steuern-Bereich (Reihenfolge-Liste, PROJ-6 /
  `/backend`).

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/errors.ts` | `TS017` → „Der Helfer kann nicht gleichzeitig Gastgeber oder Teilnehmer dieses Abends sein." |
| `src/lib/auth-rules.ts` (+ `.test.ts`) | neu `isEventHelper()`; `canAccessHostArea()` nimmt jetzt `helper_id` — Reihenfolge: Admin → (Helfer, falls gesetzt) → sonst Gastgeber. |
| `src/lib/auth.ts` | `requireHost` lädt `helper_id` mit. |
| `src/lib/actions/host-control.ts` | `requireHostOr` lädt `helper_id` mit. |
| `src/lib/schemas/admin-events.ts` | Feld `helperId` (`''` = kein Helfer); Objekt-Refinements „≠ Gastgeber", „∉ Teilnehmer". |
| `src/lib/actions/admin-events.ts` | `EventPayload.p_helper_id: string \| null`; `normalize()` liefert `null` bei `''`; `create_event` / `update_event` erhalten `p_helper_id`. |
| `src/components/admin/participant-picker.tsx` | neue Prop `excludeIds?: string[]` (Helfer aus der Liste nehmen). |
| `src/components/admin/event-form.tsx` | „Helfer (optional)"-`<Select>` mit „Kein Helfer"; Helfer-Optionen = aktive Mitglieder minus Gastgeber/Teilnehmer (aktueller Helfer bleibt sichtbar); Gastgeber-`<Select>` schließt den Helfer aus; `<ParticipantPicker excludeIds={[helperId]}>`; `onSubmit` filtert den Helfer aus `participantIds`. |
| `src/app/(admin)/admin/events/neu/page.tsx` | `defaultValues.helperId = ''`. |
| `src/app/(admin)/admin/events/[eventId]/page.tsx` | `defaultValues.helperId = event.helper_id ?? ''`; deaktivierter Helfer bleibt in der Auswahlliste. |
| `src/lib/queries/admin-events.ts` | `EventListRow` + `helper_id` / `helper_name` (aus `admin_list_events`). `getEventForEdit` nutzt `select('*')` → `helper_id` kommt automatisch. |
| `src/components/admin/event-row.tsx` | „· Helfer: {Name}" in der Personen-Zeile, wenn gesetzt. |
| `src/lib/queries/dashboard.ts` | `ActiveDashboard` + `isHelper`, `event.helper_id`; `helper_id` selektiert; `isHelper = helper_id === userId`. |
| `src/components/dashboard/dashboard-view.tsx` | „Steuern" ⇔ `isHelper || (isHost && !helper_id)`; „Meine Whiskys" für den Helfer ausgeblendet. |
| `src/lib/queries/tastings.ts` | `getMyTastings` zieht zusätzlich Events mit `helper_id = userId` (dedupe); `MyTastingRow` + `is_helper`, `has_helper`. |
| `src/components/tasting/tasting-row.tsx` | Helfer-Zeile verlinkt primär auf `/gastgeber`, ohne „Whiskys"-Sekundäraktion; „Steuern"-Sekundäraktion nur für Gastgeber-ohne-Helfer. |
| `src/lib/queries/results.ts` | `past_tastings`-Select + `helper_id`; Name über den bestehenden `profiles`-Batch; `EventResults.head` + `helper_name`. |
| `src/components/results/results-header.tsx` | „Helfer: {Name}"-Zeile neben „Gastgeber: …", wenn gesetzt. |
| `src/lib/supabase/types.ts` | Handnachtrag (wird von `db:types` reproduziert): `tasting_events` Row/Insert/Update + `helper_id`; `past_tastings` Row + `helper_id`; `admin_list_events` Returns + `helper_id`/`helper_name`; `create_event` / `update_event` Args + `p_helper_id?`. |

### Verifikation

`npx tsc --noEmit` sauber · `eslint` sauber · `npm test` → 112/112 · `npm run build` ok.

## Implementation Notes (Backend)

**Stand:** Migration geschrieben am 2026-08-31 —
`supabase/migrations/20260831120000_helper_role.sql`. **Noch nicht angewandt.**
Der Nutzer führt aus:

```powershell
npm run db:push      # Migration einspielen
npm run db:types     # src/lib/supabase/types.ts neu generieren
```

`db:types` überschreibt die im `/frontend`-Schritt von Hand nachgetragenen
Typen (`helper_id`, `p_helper_id`, `helper_name`, die drei neuen Funktionen) mit
der echten Generierung — inhaltlich identisch. Danach `npm run test:rls`
(inkl. der neuen `helper-role.integration.test.ts`) im `/qa`-Schritt.

### Eine Migration — was sie tut

| Bereich | Änderung |
|---------|----------|
| **Spalte** | `tasting_events.helper_id uuid NULL → profiles(id) ON DELETE RESTRICT`; Index `idx_events_helper`. |
| **Funktionen** | `is_event_helper(uuid)`, `event_has_helper(uuid)`, `can_run_host_control(uuid) = is_admin() ∨ is_event_helper() ∨ (is_event_host() ∧ ¬event_has_helper())`. Alle `security definer · stable · search_path=''`, `execute` nur `authenticated`. |
| **RLS `wd_select`** | Neuer Zweig `is_event_helper(event_id)` (wie der Admin-Zweig, außerhalb des Teilnehmer-`AND`). Gastgeber-Zweig eingeengt: `is_event_host(event_id) AND NOT event_has_helper(event_id)`. `brought_by = auth.uid()` und `is_event_closed` unverändert → der Gastgeber-mit-Helfer sieht weiterhin nur **seinen eigenen** Whisky, alle anderen erst nach Abschluss. |
| **RLS `whiskies_select` / `events_select` / `participants_select`** | je `OR is_event_helper(...)`. `ratings_select` **unverändert**. |
| **6 Steuerungs-RPCs** | `set_whisky_order`, `start_event`, `close_round`, `close_event`, `update_event_host_fields`, `rating_progress`: Guard `is_admin() OR is_event_host()` → `can_run_host_control(p_event)`. Signaturen unverändert → `create or replace` erhält die Grants. Rümpfe sonst byte-genau die zuletzt gültigen Fassungen. |
| **`create_event` / `update_event`** | Neuer Parameter `p_helper_id uuid DEFAULT NULL` (an 4. Stelle, im Default-Block). Prüft: aktives Mitglied (`TS004`), `≠ p_host_id` (`TS017`); `update_event` zusätzlich `∉ event_participants` (`TS017`, „nichts gespeichert"). Signatur ändert sich → alte Fassung `DROP FUNCTION`, neu, `GRANT` neu. |
| **`set_event_participants`** | lehnt ab, wenn der aktuelle `helper_id` in `p_profile_ids` steht (`TS017`). |
| **`deactivate_member`** | die `TS013`-Sperre matcht jetzt `host_id = p_target OR helper_id = p_target` für nicht abgeschlossene Events; Meldung „Gastgeber **oder Helfer**". |
| **`admin_list_events`** | Return-Table + `helper_id uuid`, `helper_name text` (Left-Join `profiles`). Return-Struktur ändert sich → `DROP FUNCTION` + neu + `GRANT`. |
| **`past_tastings`-View** | + `e.helper_id`, `helper_name` (Left-Join `profiles`). `whisky_rankings` **unangetastet** (hängt nicht an `past_tastings`). |

### Entscheidungen im Detail

- **`update_event` „Helfer entfernen"** = `p_helper_id` weggelassen/`NULL` →
  `helper_id = NULL`. Das Frontend sendet den Key gar nicht, wenn kein Helfer
  gewählt ist (`p_helper_id: undefined`), was `supabase-js` aus dem Body
  entfernt → die Funktion nimmt `DEFAULT NULL`. Robust gegen die
  `db:types`-Neugenerierung (kein `| null` im Args-Typ nötig).
- **Kein stiller Teilnehmer-Abzug** in `update_event`: statt den künftigen Helfer
  automatisch aus `event_participants` zu werfen, wird `∉ Teilnehmerliste`
  **abgelehnt** (`TS017`, AC „nichts gespeichert"). Das Formular kann diesen Fall
  gar nicht erzeugen — die Helfer-Auswahl blendet aktuelle Teilnehmer aus — die
  Server-Prüfung ist das Sicherheitsnetz.
- **`create_event`** braucht keine `∉ Teilnehmerliste`-Prüfung: außer dem
  Gastgeber (→ `≠ p_host_id` deckt es ab) gibt es beim Anlegen noch keine
  Teilnehmer.

### Neue Datei

- `src/lib/supabase/__tests__/helper-role.integration.test.ts` — 11 Fälle:
  `helper_id` gespeichert & kein Teilnehmer; `TS017` (Helfer = Gastgeber /
  Helfer in Liste / `set_event_participants`); RLS (Helfer sieht alle Details,
  Gastgeber-mit-Helfer nur den eigenen, Außenstehender keine, Event-Zeile /
  Positionen / Teilnehmerliste für den Helfer); Steuerung (Helfer darf, Gastgeber
  `TS004`, Außenstehender `TS004`); `deactivate_member` → `TS013`; Helfer
  entfernen → Gastgeber bekommt Steuerung + Details zurück.

### Verifikation (Backend, ohne DB-Zugriff in dieser Session)

`npx tsc --noEmit` sauber · `eslint` sauber · `npm test` → 112/112 ·
`npm run build` ok. **`npm run test:rls` steht aus bis die Migration angewandt
ist → `/qa`.**

## QA Test Results

**Tested:** 2026-08-31
**App URL:** http://localhost:3000 (Prod-Build) · Supabase `tfg_app` (Migration
`20260831120000_helper_role.sql` angewandt, `db:types` neu generiert)
**Tester:** QA Engineer (AI)

### Automatisierte Suiten

| Suite | Ergebnis |
|-------|----------|
| `npm test` (Unit) | **112 / 112** grün — inkl. `auth-rules.test.ts` (`canAccessHostArea` mit `helper_id`, `isEventHelper`) |
| `npm run test:rls` (Integration gegen die echte DB) | **101 / 101** grün — inkl. neuer `helper-role.integration.test.ts` (**11 / 11**) |
| `npx tsc --noEmit` · `npm run lint` · `npm run build` | sauber |
| `npm run test:e2e` → `PROJ-11-neutraler-helfer.spec.ts` | **5 / 5** (nach BUG-1-Fix) |

Die Integrationssuite ist die **tragende Prüfung** dieses Features (RLS-erzwungene
Blindheit). Die 6 bestehenden Integrationsdateien (PROJ-4/5/6/8/9) bleiben grün →
`can_run_host_control()` und die `wd_select`-Änderung sind regressionsfrei.

### Acceptance Criteria Status

#### Helfer benennen (Admin, Event-Formular)
- [x] **AC1** Feld „Helfer (optional)", aktive Person wählbar, leer = kein Helfer — E2E ✓
- [x] **AC2** Gastgeber/Teilnehmer im Helfer-Feld nicht wählbar (und umgekehrt) — E2E ✓ (Gastgeber-Ausschluss); Teilnehmer-Ausschluss über `excludeIds` + `helperOptions`-Filter, unit-nah geprüft
- [x] **AC3** Helfer = Gastgeber / Helfer ∈ Teilnehmerliste → abgelehnt, nichts gespeichert — `test:rls`: `TS017` an `create_event`, `update_event`, `set_event_participants`
- [x] **AC4** Helfer gesetzt (Draft) → „Helfer: {Name}" in der Admin-Liste — E2E ✓
- [x] **AC5** Event nicht mehr Draft → Helfer-Zuordnung nicht änderbar — Edit-Seite leitet Nicht-Draft auf `/admin/events` um; `update_event` → `TS005`
- [x] **AC6** Helfer im Draft entfernen → verhält sich wieder wie „ohne Helfer" — `test:rls` „Helfer entfernen: der Gastgeber bekommt Steuerung + Detail-Einblick zurück"

#### Sicht & Rechte des Helfers
- [x] **AC7** Helfer sieht Dashboard + Absprung „Steuern", nicht „Jetzt bewerten" — Dashboard-Absprung „Steuern" korrekt (`canControl = isHelper || …`), „Jetzt bewerten" ausgeblendet; `/tastings`-Zeile zeigt den „Steuern"-Link (nach BUG-1-Fix) — E2E ✓
- [x] **AC8** Helfer sieht in der Vorbereitung alle Whiskys mit Details — über die **Namensliste in der Steuern-Ansicht** (`/tastings/[eventId]/gastgeber`), erreichbar für den Helfer; `wd_select`-Helfer-Zweig getestet (`test:rls`: „der Helfer sieht alle whisky_details"). Dokumentierte Abweichung: kein Eingriff in `/tastings/[eventId]/whiskies` (Architektur-Entscheidung).
- [x] **AC9** Helfer steuert wie der Gastgeber ohne Helfer — `test:rls` „der Helfer darf steuern": `set_whisky_order`, `start_event`, `close_round`, `close_event`, `update_event_host_fields` alle ✓; E2E: Helfer öffnet `/gastgeber`, sieht Whisky-Namen (blockiert von BUG-1, aber Seite selbst über direkte URL geprüft)
- [x] **AC10** Fortschritt als Zähler, ohne Punkte/Namen — `rating_progress` → `can_run_host_control`, gibt nur `whisky_position/rating_count/participant_count`
- [x] **AC11** Bewertungsansicht für den Helfer nicht bewertbar — `getRatingViewData` prüft Teilnahme → „nicht gefunden"; `ratings_insert_own` scheitert (kein `can_rate_whisky`)
- [x] **AC12** Ergebnisseite: volle Rangliste wie jedes aktive Mitglied — `whisky_rankings`/`past_tastings` filtern `is_active_member()`

#### Verengung für den Gastgeber (RLS-erzwungen)
- [x] **AC13** Gastgeber-mit-Helfer bekommt die Whisky-Details nicht (auch per API) — `test:rls`: Host sieht nur `['Host-Dram']` (den eigenen, wie jeder Teilnehmer), nicht die fremden; nach Abschluss alle
- [x] **AC14** Gastgeber-mit-Helfer ruft `/tastings/[eventId]/gastgeber` → „nicht gefunden" — E2E ✓; Unit `auth-rules.test.ts`
- [x] **AC15** Gastgeber-mit-Helfer löst Steuerungs-Aktion per API aus → abgelehnt — `test:rls`: `TS004` für `set_whisky_order`/`start_event`/`rating_progress`/`update_event_host_fields`
- [x] **AC16** Gastgeber-mit-Helfer: kein „Steuern"-Absprung, aber „Jetzt bewerten"/„Meine Whiskys" — E2E ✓ (Zeile ohne „Steuern"; Bewerten/Whiskys sichtbar)
- [x] **AC17** Gastgeber-mit-Helfer bewertet seinen eigenen Whisky wie jeder Teilnehmer — Host bleibt in `event_participants`; `can_rate_whisky` ok
- [x] **AC18** Ohne Helfer: alles exakt wie vor PROJ-11 — 101 Integrationstests grün, `can_run_host_control` fällt auf den Gastgeber-Zweig zurück

#### Admin & Blindheit
- [x] **AC19** Admin sieht Steuerung + Details trotz Helfer (God-Mode) — erste Bedingung in `can_run_host_control` / `wd_select` / `canAccessHostArea`
- [x] **AC20** Niemand außer Helfer sieht vor Abschluss Namen/fremde Bewertungen — `wd_select` (nur admin/helper/eigener/closed), `ratings_select` unverändert (nur eigene/admin); `test:rls`: Außenstehender 0 Zeilen

#### Ergebnis & Historie
- [x] **AC21** Ergebnis-Kopf „Helfer: {Name}" neben „Gastgeber: {Name}"; Helfer nicht in „Wer war dabei" / Rangliste — E2E ✓
- [x] **AC22** Helfer-Rolle zählt nicht als Tasting in der Bilanz (PROJ-10) — `getPersonalBalance` liest `event_participants`/`whisky_details`/`whisky_rankings`; der Helfer steht in keiner davon

### Edge Cases Status
- [x] Helfer im Draft entfernen → Steuerung + Details zurück beim Gastgeber (`test:rls`)
- [x] Helfer im Draft wechseln → alter verliert, neuer bekommt Zugriff (`is_event_helper` re-evaluiert)
- [x] Zugeordneten Helfer deaktivieren → `TS013` (`test:rls`: „deactivate_member lehnt den Helfer eines offenen Events ab")
- [x] Helfer offline im laufenden Event → Admin kann immer steuern (`is_admin()` in `can_run_host_control`)
- [x] Event mit Helfer ohne Whiskys → „starten" scheitert (`TS008`), leerer Zustand wie beim Gastgeber
- [x] Person ist Admin **und** Helfer → beide Zweige true, kein Fehler
- [x] Gastgeber im Draft gewechselt, Helfer gesetzt → `p_helper_id = p_host_id` → `TS017`; neuer Gastgeber wird Teilnehmer
- [x] Helfer versucht Whisky einzutragen → `add_whisky` → `TS004` (kein Teilnehmer); `/whiskies` → „nicht gefunden"
- [x] Zwei Events gleichzeitig → nur eins aktiv (unverändert); Helfer darf bei mehreren Drafts benannt sein

### Security Audit Results
- [x] **Authorization / Blindheit RLS-erzwungen:** Gastgeber-mit-Helfer bekommt die geheimen `whisky_details` weder über die UI noch per Direkt-API (`test:rls` bestätigt); die 6 Steuerungs-RPCs weisen ihn ab (`can_run_host_control`)
- [x] **Kein neuer Angriffsvektor für Außenstehende:** die drei `OR is_event_helper(...)`-Ergänzungen greifen nur für den benannten Helfer; ein Nicht-Mitglied sieht Event-Zeile/Positionen/Details weiterhin nicht (`test:rls`)
- [x] **Bewertungen:** `ratings_select` unverändert → der Helfer sieht nie Punkte oder fremde Notizen, nur Zähler
- [x] **Rollen-Eskalation:** `create_event`/`update_event` prüfen `is_admin()` zuerst → ein Gastgeber kann den Helfer nicht selbst entfernen
- [x] **Input-Validierung:** `helper_id` Zod-`uuid()` im Client, `uuid`-Parameter serverseitig; Konsistenz (≠ Gastgeber, ∉ Teilnehmer) an beiden Eingabepfaden erzwungen
- [x] **Realtime:** Publication unverändert (`tasting_events` + `whiskies`, keine Geheimnisse); der Helfer empfängt nur Position/Status
- [x] **FK `helper_id` `ON DELETE RESTRICT`** wie `host_id` → keine stille Historien-Umschreibung

### Bugs Found

#### BUG-1: `/tastings`-Zeile zeigt dem Helfer keinen beschrifteten „Steuern"-Link — ✅ BEHOBEN (2026-08-31)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als Admin ein (laufendes) Event mit einem Helfer anlegen.
  2. Als **Helfer** anmelden, `/tastings` öffnen.
  3. Erwartet: die Event-Zeile trägt — wie beim Gastgeber ohne Helfer — einen sichtbaren Sekundär-Link **„Steuern"** (AC7 „Absprung Steuern"; so auch in den Frontend-Implementation-Notes festgehalten: „in der `/tastings`-Zeile nach genau derselben Regel wie beim Gastgeber — `isHelper || (isHost && !helper_id)`").
  4. Tatsächlich: kein „Steuern"-Link. `src/components/tasting/tasting-row.tsx` pushte die Sekundäraktion nur bei `hostControls = row.is_host && !row.has_helper`; für den Helfer (`is_helper`) ist das `false`. Die Zeile verlinkte zwar im Rumpf auf `/gastgeber` (`primaryHref`), aber ohne erkennbare Beschriftung.
- **Fix (`fix(PROJ-11)`):** In `tasting-row.tsx` `hostControls` → `canControl = row.is_helper || (row.is_host && !row.has_helper)`; die „Steuern"-Sekundäraktion hängt jetzt an `canControl`. `primaryHref` für den Helfer weiterhin `/gastgeber` (die Redundanz „Zeilen-Rumpf + Button" entspricht dem Gastgeber-Fall). Verifiziert: `tests/PROJ-11-neutraler-helfer.spec.ts` **5 / 5** grün, `npm test` 112/112, `tsc`/`lint` sauber.
- **Priority:** Fix before deployment → erledigt

### Summary
- **Acceptance Criteria:** **22 / 22** grün (AC7 nach BUG-1-Fix vollständig)
- **Edge Cases:** 9 / 9
- **Bugs Found:** 1 (0 Critical, 0 High, 1 Medium, 0 Low) — **BUG-1 behoben und verifiziert**
- **Security:** Pass — die RLS-erzwungene Blindheit hält (durch `helper-role.integration.test.ts` belegt)
- **Production Ready:** **YES** — kein offener Critical/High/Medium-Bug; alle Suiten grün
- **Recommendation:** **Deploy** (`/deploy` → `v1.3.0`).

## Deployment

**Deployed:** 2026-08-31 · **Tag:** `v1.3.0`
**Production URL:** https://tfg-app-self.vercel.app
**Deploy-Weg:** Vercel Auto-Deploy vom `main`-Branch (GitHub `tropengoldi/tfg_app`).

### Reihenfolge (wichtig bei diesem Feature)

PROJ-11 bringt eine **DB-Migration** mit. Die Migration muss **vor** dem Code
live sein, sonst brechen `/tastings`, das Dashboard und das Event-Formular
(Zugriff auf `tasting_events.helper_id` / `p_helper_id`).

1. `supabase/migrations/20260831120000_helper_role.sql` per `npm run db:push` auf
   das Prod-Projekt `ogwuwisutgaxxpknkgpg` eingespielt, danach
   `npm run db:types`. **Verifiziert:** `npm run test:rls` **101 / 101** gegen
   dieselbe DB (inkl. `helper-role.integration.test.ts` 11 / 11).
2. Code-Commits `173a5db` (Frontend) · `a2b694a` (Backend) · `5aedd38` (QA) ·
   `78a06a9` (BUG-1-Fix) auf `main` → Vercel-Auto-Deploy.

### Pre-Deploy-Checks

- [x] `npm run build` erfolgreich (lokal)
- [x] `npm run lint` sauber
- [x] `npm test` 112 / 112 · `npm run test:rls` 101 / 101 · `npm run test:e2e`
      (`PROJ-11-neutraler-helfer.spec.ts`) 5 / 5
- [x] QA **Approved**, keine offenen Critical/High/Medium-Bugs (BUG-1 behoben)
- [x] Keine neuen Umgebungsvariablen
- [x] Keine Secrets im Commit
- [x] DB-Migration auf Prod angewandt (siehe oben)
- [x] Alles committet und nach `origin/main` gepusht (`78a06a9`)

### Post-Deploy-Smoke (automatisiert)

- [x] `GET /login` → 200; `GET /manifest.webmanifest` → 200
- [x] `GET /` → 307 → `/login?redirect=%2F`
- [x] `GET /tastings/<id>/gastgeber` (unauth) → 307 → `/login?redirect=…`
- [x] Marken-Auftritt sichtbar („Whizzky", „Treffpunkt feiner Geister")
- [ ] **Vom Nutzer zu prüfen:** als Admin ein Event mit Helfer anlegen; als
      Helfer anmelden → Dashboard + „Steuern"; als Gastgeber-mit-Helfer →
      `/tastings/[id]/gastgeber` = „nicht gefunden", Details unsichtbar bis zum
      Abschluss.

### Offene Betriebsnotiz

Zwischen dem Frontend-Push (`173a5db`) und dem `db:push` gab es ein kurzes
Fenster, in dem das Live-Frontend die noch fehlende Spalte `helper_id` abfragte
(mögliche 500er auf `/tastings` und dem Dashboard). Das Fenster ist geschlossen —
die Migration ist eingespielt. Für künftige DB-Features: erst `db:push`, dann
Code-Push.
