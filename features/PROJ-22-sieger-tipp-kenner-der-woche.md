# PROJ-22: Sieger-Tipp & „Kenner der Woche"

## Status: Planned
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
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
