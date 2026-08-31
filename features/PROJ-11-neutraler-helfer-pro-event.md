# PROJ-11: Neutraler Helfer pro Event

## Status: Planned
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

## Open Questions

- [ ] Genaue Fehlermeldungen für die Konsistenzprüfungen (Helfer = Gastgeber /
      Helfer ist Teilnehmer) — Wortlaut in `/frontend`.
- [ ] Ob der „Steuern"-Absprung in der `/tastings`-Zeile für den Helfer schon im
      Draft-Zustand erscheint oder erst ab „läuft" — Vorschlag: ab „läuft", wie
      beim Gastgeber (im Draft steuert man über das Admin-Formular bzw. es gibt
      nichts zu tun). Für `/architecture`/`/frontend`.
- [ ] Ob die Deaktivierungs-Sperre für zugeordnete Helfer denselben Fehlercode
      wie beim Gastgeber nutzt (`TS013`) oder einen eigenen — für `/architecture`.

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
_To be added by /architecture_

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
