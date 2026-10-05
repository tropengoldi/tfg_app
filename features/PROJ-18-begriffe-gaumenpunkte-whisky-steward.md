# PROJ-18: Begriffe: Gaumenpunkte & Whisky-Steward

## Status: Planned
**Created:** 2026-10-05
**Last Updated:** 2026-10-05

## Dependencies
- **Baut auf PROJ-7 (Bewertungsansicht)** — Slider-Beschriftungen „Nase" / „Geschmack".
- **Baut auf PROJ-9 (Ergebnisse & Historie)** — Summenzeile und aufgeklappte
  Einzelwertungen in der Rangliste, Kopf der Ergebnisseite.
- **Baut auf PROJ-11 (Neutraler Helfer)** — alle Stellen, an denen die Rolle „Helfer"
  sichtbar ist (Event-Formular, Event-Liste, Ergebnis-Kopf, Fehlermeldungen).
- **Ist Voraussetzung für PROJ-19..25** — alle folgenden Specs und Bildschirme verwenden
  bereits die neuen Begriffe.

## Kontext

Die Runde hat sich auf neue Namen geeinigt:

| Bisher | Neu (volle Form) | Kurzform (nur kompakte Zeilen) |
|--------|------------------|-------------------------------|
| Nase (Bewertungskategorie) | **Nasenpunkte** | **Nase** |
| Geschmack (Bewertungskategorie) | **Gaumenpunkte** | **Gaumen** |
| Helfer (Rolle aus PROJ-11) | **Whisky-Steward** | – (keine Kurzform) |

PROJ-18 ist eine **reine Umbenennung sichtbarer Texte**. Es ändert sich kein Verhalten,
keine Berechtigung, keine Punkteskala (die kommt mit PROJ-19). Interne Bezeichner im Code
und in der Datenbank (`nose_points`, `taste_points`, `helper_id`, Funktions- und
Dateinamen, Kommentare) bleiben unverändert.

**Leitregel:** Kein für Nutzer sichtbarer Text enthält nach PROJ-18 noch „Helfer" oder
„Nase"/„Geschmack" als Name einer Bewertungskategorie.

### Betroffene Stellen (Bestandsaufnahme vom 2026-10-05)

**Bewertungskategorien**
- Bewertungsansicht: Slider-Beschriftungen „Nase" / „Geschmack" und die
  Screenreader-Bezeichnungen „Nasenpunkte" / „Geschmackspunkte".
- Rangliste (Ergebnisseite): Summenzeile „Nase 12 · Geschmack 30".
- Rangliste, aufgeklappte Einzelwertungen: „Nase 4 · Geschmack 8 · 12".

**Rolle**
- Admin-Event-Formular: Feldname „Helfer (optional)", Auswahl „Kein Helfer",
  Erklärtext, Validierungsmeldungen („Der Helfer kann nicht der Gastgeber sein",
  „… nicht gleichzeitig Teilnehmer sein").
- Admin-Event-Liste: „· Helfer: Name".
- Kopf der Ergebnisseite: „Helfer: Name".
- Fehlermeldung TS017 der App („Der Helfer kann nicht gleichzeitig Gastgeber oder
  Teilnehmer dieses Abends sein.").
- **Fehlermeldungen aus der Datenbank**, die die App unverändert anzeigt:
  „Nur Gastgeber, Helfer oder Admin …" (Starten, Reihenfolge setzen, Runde
  weiterschalten, Abschließen, Fortschritt abfragen, allgemein), „Der gewählte Helfer ist
  kein aktives Mitglied.", „Der Helfer kann nicht gleichzeitig Gastgeber dieses Abends
  sein."

**Dokumentation**
- `docs/PRD.md`: Vision, Kernablauf, Non-Goals.
- `docs/design-system.md`: Slider-Beschreibung, Liste der Fachbegriffe.

**Ausdrücklich nicht betroffen**
- Profil-Platzhalter „… über dich und deinen Whisky-Geschmack" — meint keine
  Bewertungskategorie.
- „Nase" als allgemeiner Tasting-Begriff (z. B. in Freitext, Design-System-Fachbegriffen
  „Dram, Nase, Abgang") bleibt erlaubt.

## User Stories
- Als **Teilnehmer** möchte ich beim Bewerten „Nasenpunkte" und „Gaumenpunkte" lesen, damit
  die App dieselben Begriffe verwendet wie die Runde am Tisch.
- Als **Teilnehmer** möchte ich in der Rangliste kurze, einzeilige Angaben („Nase 12 ·
  Gaumen 30") sehen, damit die Liste auf dem Handy übersichtlich bleibt.
- Als **Admin** möchte ich beim Anlegen eines Events einen „Whisky-Steward" benennen, damit
  die Rolle so heißt, wie die Runde sie nennt.
- Als **Teilnehmer** möchte ich auf der Ergebnisseite sehen, wer an diesem Abend
  Whisky-Steward war.
- Als **Gastgeber, Whisky-Steward oder Admin** möchte ich, dass auch Fehlermeldungen den
  neuen Rollennamen verwenden, damit ich nicht über zwei Namen für dieselbe Rolle stolpere.

## Out of Scope
- **Umbenennung interner Bezeichner** (Datenbank-Spalten, Funktionen, Dateien, Routen,
  Code-Kommentare) — kein sichtbarer Nutzen, unnötiges Migrationsrisiko.
- **Umschreiben fertiger Feature-Specs** (PROJ-7, PROJ-9, PROJ-11 …) und der historischen
  Feature-Namen im INDEX (z. B. „PROJ-11 Neutraler Helfer pro Event") — sie dokumentieren,
  was damals gebaut wurde. Nur PROJ-11 bekommt einen einzeiligen Hinweis.
- **Änderung der Punkteskala** (0 Punkte, 0,5er-Schritte) — PROJ-19.
- **Neue Rechte oder Einblicke für den Whisky-Steward** — PROJ-20 / PROJ-21.
- **URL-Änderungen** (z. B. `/gastgeber`-Route) — bleiben, wie sie sind.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Bewertungskategorien
- [ ] Angenommen ein Teilnehmer öffnet die Bewertungsansicht eines laufenden Tastings, wenn
  die Slider angezeigt werden, dann sind sie mit **„Nasenpunkte"** und **„Gaumenpunkte"**
  beschriftet.
- [ ] Angenommen ein Screenreader liest die Bewertungsansicht vor, wenn er die Slider
  erreicht, dann heißen sie „Nasenpunkte" und „Gaumenpunkte" (nicht mehr
  „Geschmackspunkte").
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Mitglied die Rangliste ansieht,
  dann lautet die Summenzeile jedes Whiskys „**Nase** X · **Gaumen** Y".
- [ ] Angenommen ein Mitglied klappt die Einzelwertungen eines Whiskys auf, wenn die Zeilen
  angezeigt werden, dann lauten sie „Nase X · Gaumen Y · Gesamt".
- [ ] Angenommen ein Whisky hat einen langen Namen, wenn die Rangliste auf einem Smartphone
  (360 px Breite) angezeigt wird, dann bleibt die Summenzeile „Nase X · Gaumen Y" einzeilig.

### Rolle Whisky-Steward
- [ ] Angenommen der Admin legt ein Event an oder bearbeitet es, wenn er das Formular
  öffnet, dann heißt das Feld „**Whisky-Steward (optional)**", die leere Auswahl „**Kein
  Whisky-Steward**", und der Erklärtext spricht vom Whisky-Steward.
- [ ] Angenommen der Admin wählt dieselbe Person als Gastgeber und Whisky-Steward, wenn er
  speichert, dann lautet die Validierungsmeldung „Der Whisky-Steward kann nicht der
  Gastgeber sein".
- [ ] Angenommen der Admin wählt eine Person als Whisky-Steward, die auch Teilnehmer ist,
  wenn er speichert, dann lautet die Validierungsmeldung „Der Whisky-Steward kann nicht
  gleichzeitig Teilnehmer sein".
- [ ] Angenommen ein Event hat einen Whisky-Steward, wenn der Admin die Event-Liste ansieht,
  dann steht dort „· Whisky-Steward: Name".
- [ ] Angenommen ein abgeschlossenes Tasting hatte einen Whisky-Steward, wenn ein Mitglied
  die Ergebnisseite öffnet, dann steht im Kopf „Whisky-Steward: Name".
- [ ] Angenommen ein Nutzer ohne Berechtigung versucht eine Steuer-Aktion (Starten,
  Reihenfolge, Weiterschalten, Abschließen), wenn die Datenbank die Aktion ablehnt, dann
  nennt die angezeigte Fehlermeldung „Whisky-Steward" statt „Helfer".
- [ ] Angenommen die Datenbank lehnt eine Event-Anlage ab, weil der gewählte
  Whisky-Steward inaktiv ist oder zugleich Gastgeber ist, wenn die Fehlermeldung angezeigt
  wird, dann nennt sie „Whisky-Steward" statt „Helfer".

### Vollständigkeit
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn man alle für Nutzer sichtbaren Texte der App
  (Seiten, Formulare, Validierungs- und Fehlermeldungen, Screenreader-Bezeichnungen)
  durchsucht, dann kommt weder „Helfer" noch „Nase"/„Geschmack" als Name einer
  Bewertungskategorie vor (Ausnahme: Kurzform „Nase" in kompakten Zeilen; „Whisky-Geschmack"
  im Profil-Platzhalter).
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn bestehende Tastings, Bewertungen und
  Event-Zuordnungen geöffnet werden, dann sind alle Daten unverändert vorhanden (reine
  Textänderung, kein Datenverlust).
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn ein Whisky-Steward sein Event steuert, dann
  verhält sich alles exakt wie vorher (keine Rechte-Änderung).

### Dokumentation
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn man `docs/PRD.md` liest, dann verwenden
  Vision, Kernablauf und Non-Goals „Nasenpunkte" / „Gaumenpunkte".
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn man `docs/design-system.md` liest, dann
  beschreibt die Slider-Passage „Nasenpunkte" / „Gaumenpunkte", und die Fachbegriffe-Liste
  enthält „Nasenpunkte, Gaumenpunkte, Whisky-Steward".
- [ ] Angenommen PROJ-18 ist umgesetzt, wenn man die PROJ-11-Spec öffnet, dann steht oben
  ein Hinweis „Die Rolle heißt seit PROJ-18 ‚Whisky-Steward'".

## Edge Cases
- **Fehlermeldungen aus der Datenbank:** Die App zeigt Meldungen mit TS-Code wörtlich so an,
  wie die Datenbank sie liefert. Eine reine Frontend-Änderung reicht deshalb nicht — es
  braucht entweder eine Datenbank-Änderung der Meldungstexte oder Ersatztexte in der App.
  Welcher Weg, entscheidet `/architecture`.
- **Reihenfolge Datenbank ↔ App beim Deploy:** Falls die Meldungstexte in der Datenbank
  geändert werden, muss das vor oder zusammen mit dem App-Deploy passieren; ein
  Zwischenzustand mit gemischten Begriffen ist kurz tolerierbar (nur Fehlerfälle).
- **Bereits verschickte E-Mails** (PROJ-16) mit altem Wortlaut bleiben, wie sie sind —
  versandte Nachrichten werden nicht nachträglich geändert.
- **E2E-Tests**, die auf die alten Texte prüfen (u. a. PROJ-9, PROJ-11, PROJ-16), müssen
  auf die neuen Begriffe angepasst werden; ein Fehlschlag dort nach PROJ-18 ist kein
  Regressionsfehler, sondern ein veralteter Test.
- **Sehr schmale Bildschirme:** In den kompakten Rangliste-Zeilen werden bewusst die
  Kurzformen verwendet; die volle Form erscheint nur dort, wo genug Platz ist.
- **Groß-/Kleinschreibung und Bindestrich:** immer „Whisky-Steward" (mit Bindestrich,
  großes S), nie „Whiskysteward" oder „Whisky Steward".

## Technical Requirements (optional)
- Keine Verhaltens- und keine Berechtigungsänderung.
- Keine Umbenennung von Datenbank-Spalten, Tabellen oder Funktionsnamen.
- Eine Datenbank-Migration ist **zulässig**, aber nur, um sichtbare Meldungstexte zu ändern.

## Open Questions
- [ ] Fehlermeldungen aus der Datenbank: Meldungstexte per Migration ändern oder in der App
  durch eigene Texte ersetzen? → Entscheidung in `/architecture`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Volle Form „Nasenpunkte"/„Gaumenpunkte" in der Bewertungsansicht, Kurzform „Nase"/„Gaumen" in kompakten Rangliste-Zeilen | Beim Bewerten ist Platz und dort wird der Begriff gelernt; in der Rangliste würde die volle Form auf dem Handy zweizeilig umbrechen | 2026-10-05 |
| „Whisky-Steward" überall in voller Form, keine Kurzform „Steward" | An allen Stellen ist genug Platz; eine zweite Schreibweise würde fragen lassen, ob es dieselbe Rolle ist | 2026-10-05 |
| Auch Fehlermeldungen aus der Datenbank werden umbenannt | Leitregel „kein sichtbarer Text mit altem Begriff" — Fehlermeldungen sind selten, aber sichtbar | 2026-10-05 |
| Interne Bezeichner (DB-Spalten, Code) bleiben | Kein sichtbarer Nutzen, aber Migrationsrisiko und großer Änderungsumfang | 2026-10-05 |
| PRD und Design-System werden angepasst, fertige Specs und INDEX-Namen nicht | PRD/Design-System sind die lebenden Vorgaben für alle künftigen Specs; fertige Specs dokumentieren historisch, was gebaut wurde | 2026-10-05 |
| „Nase" bleibt als allgemeiner Tasting-Begriff erlaubt | Nur der Name der Bewertungskategorie ändert sich; „Nase" ist in der Runde weiter ein normales Wort | 2026-10-05 |
| Profil-Platzhalter „Whisky-Geschmack" bleibt | Meint persönliche Vorlieben, keine Bewertungskategorie | 2026-10-05 |

### Technical Decisions
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
