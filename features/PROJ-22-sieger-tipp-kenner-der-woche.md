# PROJ-22: Sieger-Tipp & „Kenner der Woche"

## Status: In Progress
**Created:** 2026-10-05
**Last Updated:** 2026-10-05

## Dependencies
- **Requires: PROJ-7 (Bewertungsansicht)** — dort wird getippt.
- **Requires: PROJ-8 (Dashboard)** — Erinnerung / eigener Tipp.
- **Requires: PROJ-9 (Ergebnisse)** — Sieger, Anzeige der Kenner und aller Tipps.
- **Requires: PROJ-10 / PROJ-14 (Bilanz + Sichtbarkeit)** — Zähler „Kenner der Woche" mit eigenem Schalter.
- **Requires: PROJ-19 (Punkteskala)** — Sieger-Ermittlung mit halben Punkten und 0.
- **Berührt PROJ-11 / PROJ-18 (Whisky-Steward)** — der Steward tippt nicht.

## Kontext

Während eines laufenden Tastings tippt jeder, der mitverkostet, **blind** auf den späteren
Sieger („Whisky 3"). Nach dem Abschluss sind alle mit richtigem Tipp **„Kenner der Woche"**.

**Sieger** ist der Whisky auf Rang 1 der bestehenden Rangliste (Gesamtpunkte → Gaumen →
Nase → Ausschank-Reihenfolge) — es gibt also immer genau einen, sofern überhaupt bewertet wurde.

Der Titel gilt **pro Tasting** und erscheint zusätzlich als **Zähler in der eigenen Bilanz**.
Eine Kenner-Rangliste über mehrere Tastings gibt es **nicht** (PRD-Non-Goal: keine
Auswertungen über die Runde hinweg).

## User Stories
- Als **Teilnehmer** möchte ich während des Tastings tippen, welcher Whisky gewinnt, damit der
  Abend eine zusätzliche Spannung bekommt.
- Als **Teilnehmer** möchte ich meinen Tipp bis zum Abschluss ändern können, wenn ich meine
  Meinung über die Runde ändere.
- Als **Teilnehmer** möchte ich nicht sehen, was andere getippt haben, solange das Tasting
  läuft, damit ich mich nicht anlehne.
- Als **Teilnehmer** möchte ich auf dem Dashboard erinnert werden, falls ich noch nicht getippt habe.
- Als **Mitglied** möchte ich nach dem Abschluss sehen, wer Kenner der Woche ist und wer
  worauf getippt hat.
- Als **Mitglied** möchte ich in meiner Bilanz sehen, wie oft ich Kenner der Woche war — und
  selbst entscheiden, ob andere das sehen.

## Out of Scope
- **Kenner-Rangliste über mehrere Tastings** — PRD-Non-Goal; nur der eigene Zähler in der Bilanz.
- **Tipps auf Platz 2/3, Punktzahlen oder Rangfolgen** — nur der Sieger.
- **Punkte/Belohnungen für Tipps** (z. B. Teil-Punkte für „knapp daneben").
- **Tipp durch den Whisky-Steward** — er verkostet nicht mit.
- **Benachrichtigung bei Kenner-Titel** (E-Mail/Push) — ggf. später mit PROJ-17.
- **Live-Statistik „X von Y haben getippt"** während des Tastings.
- **Nachträgliches Tippen** nach dem Abschluss oder für alte Tastings.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Tippen (Bewertungsansicht)
- [ ] Angenommen ein Tasting läuft und der Nutzer verkostet mit (Teilnehmer inkl. Gastgeber),
  wenn er die Bewertungsansicht öffnet, dann sieht er oberhalb des aktuellen Whiskys das Feld
  „Dein Sieger-Tipp" mit der Auswahl „Whisky 1 … Whisky N".
- [ ] Angenommen das Feld ist sichtbar, dann sind alle Nummern 1 … N wählbar — auch noch nicht
  ausgeschenkte Whiskies.
- [ ] Angenommen der Nutzer wählt „Whisky 3", dann ist der Tipp sofort gespeichert (ohne
  eigene Speichern-Taste) und eine kurze Bestätigung erscheint.
- [ ] Angenommen der Nutzer hat bereits getippt, wenn er einen anderen Whisky wählt, dann
  ersetzt der neue Tipp den alten (pro Person und Tasting genau ein Tipp).
- [ ] Angenommen der Nutzer öffnet die Bewertungsansicht erneut oder auf einem anderen Gerät,
  dann ist sein aktueller Tipp vorausgewählt.
- [ ] Angenommen der Nutzer hat seinen eigenen Whisky mitgebracht, dann darf er auch auf
  dessen Nummer tippen.
- [ ] Angenommen der Whisky-Steward öffnet das Tasting, dann sieht er kein Tipp-Feld, und ein
  Tipp-Versuch über die Schnittstelle wird abgelehnt.
- [ ] Angenommen ein Nicht-Teilnehmer versucht zu tippen, dann wird der Versuch abgelehnt.
- [ ] Angenommen das Tasting ist abgeschlossen, wenn jemand einen Tipp abgeben oder ändern
  will, dann wird das abgelehnt, und das Feld ist nicht mehr bedienbar.
- [ ] Angenommen das Tasting ist noch in Vorbereitung, dann gibt es kein Tipp-Feld.
- [ ] Angenommen das Speichern schlägt fehl (z. B. Netzwerk), dann erscheint eine Fehlermeldung,
  und die Auswahl springt auf den zuletzt gespeicherten Tipp zurück.

### Blindheit während des Tastings
- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer, der Gastgeber, der Whisky-Steward oder
  der Admin die Tipps anderer abfragen will, dann sieht er keine fremden Tipps (auch nicht auf
  Datenbankebene) — nur seinen eigenen.

### Dashboard
- [ ] Angenommen ein Tasting läuft und der Nutzer verkostet mit, wenn er noch nicht getippt hat,
  dann zeigt das Dashboard „Noch kein Sieger-Tipp abgegeben" mit Absprung zur Bewertungsansicht.
- [ ] Angenommen der Nutzer hat getippt, dann zeigt das Dashboard „Dein Tipp: Whisky 3".
- [ ] Angenommen der Nutzer ist Whisky-Steward, dann zeigt das Dashboard keinen Tipp-Hinweis.

### Ergebnisseite
- [ ] Angenommen ein Tasting ist abgeschlossen und mindestens ein Tipp war richtig, wenn ein
  Mitglied die Ergebnisseite öffnet, dann steht beim Sieger „Kenner der Woche: Anna, Ben"
  (alphabetisch, verlinkt auf die Profile).
- [ ] Angenommen niemand hat richtig getippt (aber es gab Tipps), dann steht dort „Diesmal kein Kenner".
- [ ] Angenommen es gab keine Tipps (z. B. altes Tasting vor PROJ-22), dann erscheint kein
  Kenner-Hinweis und kein Bereich „Alle Tipps".
- [ ] Angenommen es gab Tipps, dann gibt es einen aufklappbaren Bereich „Alle Tipps" mit je einer
  Zeile „Carla → #4 Talisker 10 (Platz 3)"; richtige Tipps sind hervorgehoben; wer nicht getippt
  hat, erscheint nicht.
- [ ] Angenommen in einem Tasting wurde gar nicht bewertet (kein Sieger), dann gibt es keine
  Kenner; der Hinweis lautet „Kein Sieger — keine Kenner".

### Bilanz & Sichtbarkeit
- [ ] Angenommen ein Mitglied war in 2 Tastings Kenner, wenn es seine Profil-Bilanz öffnet, dann
  steht dort „Kenner der Woche: 2×"; bei 0 steht „—" oder „0×" wie bei anderen Kennzahlen.
- [ ] Angenommen das Mitglied öffnet die Sichtbarkeits-Einstellungen, dann gibt es den Schalter
  „Kenner der Woche", standardmäßig an.
- [ ] Angenommen der Schalter ist aus, wenn ein anderes Mitglied das Profil ansieht, dann fehlt der
  Kenner-Zähler dort; die eigene Ansicht zeigt ihn weiterhin.

### Mobil
- [ ] Angenommen ein 360 px breites Handy, dann sind Tipp-Feld, Dashboard-Hinweis und „Alle Tipps"
  ohne horizontales Scrollen bedienbar; das Tipp-Feld ist mindestens 44 px hoch.

## Edge Cases
- **Tipp in letzter Sekunde:** Der Gastgeber schließt ab, während jemand gerade tippt → zählt,
  was vor dem Abschluss gespeichert war; der spätere Versuch wird mit verständlicher Meldung abgelehnt.
- **Teilnehmer verlässt die Runde / wird deaktiviert:** sein Tipp bleibt in „Alle Tipps" stehen
  (wie „mitgebracht von" in der Rangliste); Kenner-Titel bleibt.
- **Event wird nach Abschluss gelöscht** (Wartungsskript): Tipps verschwinden mit, Bilanz-Zähler sinkt.
- **Gleichstand an der Spitze:** kann nicht auftreten — Rang 1 ist eindeutig (Feinkriterien).
- **Tasting mit nur einem Whisky:** Tippen ist möglich, jeder Tipp ist richtig — das ist okay.
- **Gastgeber ohne Steward kennt die Reihenfolge:** darf trotzdem tippen; er weiß nicht, wie die
  Runde bewertet.
- **Mehrere Geräte gleichzeitig:** der zuletzt gespeicherte Tipp gilt.

## Technical Requirements (optional)
- Blindheit der Tipps wird **auf Datenbankebene** erzwungen (wie bei den Bewertungen).
- Tipp-Regeln (nur Mitverkoster, nur laufendes Tasting, gültige Whisky-Nummer) serverseitig.

## Open Questions
- [ ] Bilanz: „0×" oder „—" bei null Kenner-Titeln? → in `/frontend` an die bestehenden
  Kennzahlen angleichen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Tipp bis zum Abschluss jederzeit änderbar (Variante a) | Die Herausforderung ist, die **Runde** vorherzusagen — bleibt bis zum Schluss spannend; keine Sonderregel, die jemand übersieht | 2026-10-05 |
| Tippen dürfen alle Mitverkoster inkl. Gastgeber, nicht der Whisky-Steward | Steward verkostet nicht und sieht ggf. Zwischenstände (PROJ-20) | 2026-10-05 |
| Tipp auf den eigenen Whisky erlaubt | Keine echte Vorteilsquelle; Verbot wäre schwer erklärbar | 2026-10-05 |
| Alle Nummern 1 … N wählbar, auch nicht ausgeschenkte | Man soll früh tippen können; Nummern sind von Anfang an bekannt | 2026-10-05 |
| Tipp wird sofort gespeichert, keine Speichern-Taste | Schnell bedienbar mit Glas in der Hand | 2026-10-05 |
| Nach dem Abschluss: Kenner beim Sieger + aufklappbar „Alle Tipps" | Gesprächsstoff am Ende des Abends | 2026-10-05 |
| Dashboard-Erinnerung „Noch kein Sieger-Tipp abgegeben" | Damit es niemand vergisst | 2026-10-05 |
| Bilanz-Zähler mit eigenem Sichtbarkeits-Schalter (Default an) | Einheitlich mit den übrigen Bilanz-Kennzahlen; kosmetisch, da die Ergebnisseiten öffentlich sind | 2026-10-05 |
| Keine Kenner-Rangliste über mehrere Tastings | PRD-Non-Goal (Entscheidung beim Backlog-Eintrag) | 2026-10-05 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Tabelle „Sieger-Tipps" (ein Eintrag pro Person und Tasting) | Klare Zuständigkeit, eigene Zugriffsregeln; „ein Tipp pro Person" als eindeutige Regel in der DB statt im Code | 2026-10-05 |
| Getippt wird auf die **Ausschank-Nummer**, gespeichert wird der zugehörige Whisky | Teilnehmer kennen nur „Whisky 3"; die Verknüpfung zum Whisky macht die Auswertung (Rang 1?) trivial und robust | 2026-10-05 |
| Schreiben nur über eine Datenbank-Funktion „Tipp setzen" | Bündelt alle Regeln (läuft, Mitverkoster, gültige Nummer) an einer Stelle mit verständlichen Fehlercodes; kein direkter Schreibzugriff auf die Tabelle | 2026-10-05 |
| Lesen der Tabelle direkt: nur die **eigene** Zeile | Blindheit auf DB-Ebene — auch Gastgeber, Steward und Admin sehen während des Tastings keine fremden Tipps | 2026-10-05 |
| Auflösung nach dem Abschluss über eine eigene Sicht „aufgedeckte Tipps" (wie die Ranglisten-Sichten: nur abgeschlossene Tastings, nur aktive Mitglieder) inkl. „richtig ja/nein" | Gleiches, bewährtes Muster wie `whisky_rankings`; „richtig" wird an einer Stelle definiert (Rang 1) | 2026-10-05 |
| Kenner-Zähler der Bilanz aus der Sicht; Sichtbarkeits-Schalter wird (wie die übrigen Bilanz-Schalter) in der App ausgewertet | Die zugrunde liegenden Daten sind nach dem Abschluss ohnehin für alle Mitglieder sichtbar (Ergebnisseite) — gleiches Prinzip wie Anzahl Tastings / beste Platzierung in PROJ-14 | 2026-10-05 |
| Neuer Fehlercode TS023 für abgelehnte Tipps | TS-Klasse, TS018–022 vergeben | 2026-10-05 |
| Keine Live-Aktualisierung der Tipps | Tipps anderer sind ohnehin unsichtbar; der eigene Tipp ändert sich nur durch einen selbst | 2026-10-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Neue kleine Datenhaltung für Tipps (Tabelle + Funktion + Sicht), ein neuer Profil-Schalter,
und vier Stellen in der Oberfläche. Kein neues Paket, keine neue Seite, keine neue Route.

### A) Bausteine

```
Bewertungsansicht (PROJ-7)
+-- NEU: „Dein Sieger-Tipp" — Auswahl Whisky 1 … N (shadcn Select, ≥ 44 px)
|   +-- speichert sofort, Bestätigung als Toast; bei Fehler zurück auf den alten Tipp
|   +-- nicht für Whisky-Steward; im abgeschlossenen Tasting gesperrt
+-- (bestehend) Positionen, Punktefelder, Notiz …

Dashboard (PROJ-8)
+-- NEU: Hinweis „Noch kein Sieger-Tipp abgegeben" bzw. „Dein Tipp: Whisky 3"
    (nur Mitverkoster, nur laufendes Tasting)

Ergebnisseite (PROJ-9)
+-- Rangliste
|   +-- Sieger-Zeile: NEU „Kenner der Woche: Anna, Ben" / „Diesmal kein Kenner"
+-- NEU: aufklappbar „Alle Tipps" (Collapsible)
|   +-- „Carla → #4 Talisker 10 (Platz 3)"; richtige Tipps hervorgehoben
+-- Statistiken (PROJ-25, unverändert)

Profil – Bilanz (PROJ-10 / PROJ-14)
+-- NEU: Kennzahl „Kenner der Woche: 2×"
+-- Sichtbarkeits-Einstellungen: NEU Schalter „Kenner der Woche"
```

### B) Datenmodell

**Sieger-Tipp** (eine Zeile pro Person und Tasting)
- Tasting, Person, getippter Whisky, Zeitpunkt der letzten Änderung
- Regeln: genau ein Tipp pro Person und Tasting; der Whisky muss zu diesem Tasting gehören
- Wird das Tasting oder die Person gelöscht, verschwindet der Tipp mit

**Profil:** NEU Schalter „Kenner der Woche sichtbar" (Standard: an)

### C) Zugriffsregeln

| Wer | Während des Tastings | Nach dem Abschluss |
|---|---|---|
| Mitverkoster | eigenen Tipp setzen / ändern / lesen | eigenen Tipp + alle aufgedeckten Tipps lesen |
| Gastgeber (verkostet mit) | wie Mitverkoster | wie Mitverkoster |
| Whisky-Steward | **kein** Tipp, keine fremden Tipps | alle aufgedeckten Tipps lesen |
| Admin / andere aktive Mitglieder | keine fremden Tipps | alle aufgedeckten Tipps lesen |
| Deaktivierte / nicht angemeldet | nichts | nichts |

- **Setzen** nur über die Funktion „Tipp setzen" (Tasting, Ausschank-Nummer). Sie prüft:
  Tasting läuft, Person ist Teilnehmer (der Steward ist das nie), Nummer existiert →
  sonst **TS023** mit verständlicher Meldung. Ein zweiter Aufruf ersetzt den Tipp.
- **Lesen der Tabelle** direkt: ausschließlich die eigene Zeile.
- **Aufdecken** über die Sicht „aufgedeckte Tipps": nur abgeschlossene Tastings, nur aktive
  Mitglieder (gleiches Muster wie die Ranglisten-Sichten). Liefert je Tipp: Person,
  Ausschank-Nummer, Whisky-Name, Rang des getippten Whiskys, **richtig ja/nein** (= Rang 1
  und es gab mindestens eine Bewertung).

### D) Auswertung
- **Kenner eines Tastings** = alle Tipps mit „richtig" in diesem Tasting.
- **Kenner-Zähler** einer Person = Anzahl ihrer richtigen Tipps über alle abgeschlossenen
  Tastings (eigene Bilanz und fremdes Profil; beim fremden Profil nur, wenn der Schalter an ist).
- Hinweise auf der Ergebnisseite: keine Tipps → nichts; Tipps, aber keiner richtig →
  „Diesmal kein Kenner"; keine Bewertung → „Kein Sieger — keine Kenner".

### E) Migration (eine Datei)
1. Tabelle „Sieger-Tipps" mit RLS (nur eigene Zeile lesbar, kein Direktschreiben).
2. Funktion „Tipp setzen" (TS023).
3. Sicht „aufgedeckte Tipps".
4. Profil-Schalter + Erweiterung der Profil-Sicht + Spalten-Rechte (wie PROJ-14).
Danach Typen neu erzeugen. Ausrollen: `db:push` → App.

### F) Tests
- **DB-Integration:** Teilnehmer setzt/ändert Tipp; zweiter Tipp ersetzt; Steward,
  Nicht-Teilnehmer, Entwurf, abgeschlossen → TS023; ungültige Nummer → TS023; während des
  Tastings sieht niemand (inkl. Gastgeber/Steward/Admin) fremde Tipps; nach Abschluss liefert
  die Sicht alle Tipps mit korrektem „richtig"; Tasting ohne Bewertung → niemand richtig.
- **Unit:** Kenner-Auswertung / Hinweistexte.
- **E2E:** Tipp setzen + ändern + Wiederöffnen; Dashboard-Hinweis; Kenner-Anzeige + „Alle
  Tipps"; Bilanz-Zähler + Schalter; Steward ohne Tipp-Feld; 360 px.

### G) Abhängigkeiten (Pakete)
Keine.

### Arbeitsaufteilung
- `/backend` zuerst: Migration, Typen, Server-Aktion „Tipp setzen", Integrationstests.
- `/frontend`: Tipp-Feld, Dashboard-Hinweis, Ergebnis-Anzeige, Bilanz + Schalter.

### Implementation Notes (Backend, 2026-10-05)
- Migration `supabase/migrations/20261008120000_winner_tips.sql`:
  - Tabelle `winner_tips` (PK `event_id` + `profile_id` = ein Tipp pro Person/Tasting;
    zusammengesetzter FK `(whisky_id, event_id) → whiskies`; CASCADE bei Event-/Profil-Löschung).
    RLS an; `select` nur eigene Zeile; `insert/update/delete` für `authenticated` entzogen.
  - `set_winner_tip(p_event, p_position)` (SECURITY DEFINER, `search_path = ''`): aktives
    Mitglied, Event `active` (`for share` gegen gleichzeitiges Abschließen), Teilnehmer,
    Nummer existiert → sonst **TS023**; Upsert ersetzt den alten Tipp.
  - Sicht `winner_tips_revealed` (Owner-Rechte, `closed` + `is_active_member()`): Person,
    Ausschank-Nummer, Whisky-Name, Rang, `is_correct` (Rang 1 **und** mindestens eine Bewertung).
  - `profiles.show_kenner_count` (Default `true`) + Spalten-GRANTs; `profiles_public` um die
    Spalte **am Ende** erweitert.
- App-Server: `schemas/tips.ts` (+ Unit-Test), `actions/tips.ts` (`setWinnerTipAction`),
  `errors.ts` TS023.
- Tests: Unit 175/175. Neuer Integrationstest `winner-tips.integration.test.ts` (11 Fälle:
  Entwurf/abgeschlossen/Steward/Außenstehende/ungültige Nummer → TS023, Ersetzen, Gastgeber
  darf, kein Direktschreiben, Blindheit Tabelle + Sicht für Teilnehmer/Gastgeber/Steward/Admin,
  Aufdecken mit `is_correct`, Tasting ohne Bewertung, Profil-Schalter) — läuft nach `db:push`.
- `db:push` durch den Nutzer am 2026-10-05, danach `db:types`; `auth.ts` Session-Spalten um `show_kenner_count` ergänzt (sonst Typfehler). `npm run test:rls`: **167/167** grün (inkl. 11 neue).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
