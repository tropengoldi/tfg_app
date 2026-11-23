# PROJ-29: Steward-Bewertung durch Teilnehmer

## Status: Planned
**Created:** 2026-11-23
**Last Updated:** 2026-11-23

## Dependencies
- **Requires: PROJ-11 / PROJ-18 (Whisky-Steward)** — nur Tastings mit benanntem Steward.
- **Requires: PROJ-7 (Bewertungsansicht)** — dort liegt die neue Karte „Den Steward bewerten".
- **Requires: PROJ-9 (Ergebnisse)** — Anzeige der Steward-Noten nach dem Abschluss.
- **Requires: PROJ-10 / PROJ-14 (Bilanz + Sichtbarkeit)** — Eintrag „Als Whisky-Steward" mit eigenem Schalter.
- **Requires: PROJ-19 (Punkteskala)** — Schrittweite 1 bzw. 0,5 je Tasting, 0 erlaubt.
- **Berührt PROJ-20 (Steward-Live-Einblick)** — die Steward-Noten erscheinen dort **nicht**.
- **Berührt PROJ-26 (Testkonten)** — gleiche Sichtbarkeitsregeln wie alle Tasting-Daten.

## Kontext

Ist für ein Tasting ein Whisky-Steward benannt, schenkt er aus und steuert den Abend, ohne
mitzuverkosten. Die Teilnehmer sollen ihm dafür eine **Note von 0 bis 10** geben können — als
Anerkennung und Rückmeldung.

Bewertet wird **während des laufenden Tastings**, genau wie die Whiskies: Die Note ist bis zum
Abschluss änderbar und friert dann ein. Bis zum Abschluss sieht jeder nur seine eigene Note —
auch der Steward sieht nichts. Nach dem Abschluss stehen alle Noten **mit Namen** samt
optionalem Kommentar auf der Ergebnisseite, dazu der Durchschnitt.

In der Profil-Bilanz des Stewards erscheint ein Eintrag „Als Whisky-Steward: N Abende · Ø X"
mit eigenem Sichtbarkeits-Schalter. Eine Steward-Rangliste über alle Tastings gibt es nicht
(PRD-Non-Goal: keine Auswertungen über die Runde hinweg).

## User Stories
- Als **Teilnehmer** (inkl. Gastgeber) möchte ich dem Steward während des Tastings eine Note
  geben, damit er eine Rückmeldung für seinen Abend bekommt.
- Als **Teilnehmer** möchte ich meine Note und einen kurzen Kommentar bis zum Abschluss ändern
  oder zurückziehen können.
- Als **Teilnehmer** möchte ich vorher wissen, dass meine Note nach dem Abschluss mit meinem
  Namen sichtbar ist.
- Als **Whisky-Steward** möchte ich nach dem Abschluss sehen, wie die Runde mich bewertet hat —
  aber nicht schon während des Abends, damit ich unbeeinflusst moderiere.
- Als **Mitglied** möchte ich auf der Ergebnisseite sehen, welche Note der Steward bekommen hat.
- Als **Whisky-Steward** möchte ich meine Steward-Bilanz im Profil sehen und selbst entscheiden,
  ob andere sie sehen.

## Out of Scope
- **Bewerten nach dem Abschluss** oder für alte Tastings — die Note friert mit dem Abschluss ein.
- **Steward-Rangliste über mehrere Tastings** — PRD-Non-Goal; nur die eigene Bilanz.
- **Anonyme Bewertung** — bewusst alles mit Namen (siehe Decision Log).
- **Bewertung des Gastgebers** oder anderer Rollen — nur der Steward.
- **Benachrichtigung des Stewards** über neue Noten (E-Mail/Push) — ggf. später mit PROJ-17.
- **Live-Zähler** „4 von 6 haben dich bewertet" für den Steward oder die Runde.
- **Teilkategorien** (z. B. Ausschank, Moderation, Auswahl) — eine einzige Note.
- **Eintrag auf dem Dashboard** — die Karte liegt nur in der Bewertungsansicht.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Bewerten (Bewertungsansicht, Tasting läuft)
- [ ] Angenommen ein Tasting mit Steward läuft und der Nutzer verkostet mit (Teilnehmer inkl.
  Gastgeber), wenn er die Bewertungsansicht öffnet, dann sieht er unterhalb des Sieger-Tipps eine
  aufklappbare Karte „Den Steward bewerten" mit dem Namen des Stewards.
- [ ] Angenommen ein Tasting **ohne** Steward läuft, wenn ein Teilnehmer die Bewertungsansicht
  öffnet, dann erscheint keine Steward-Karte.
- [ ] Angenommen der Nutzer ist der Steward selbst oder ein Admin, der nicht mitverkostet, dann
  sieht er keine Steward-Karte und kann (auch nicht über direkte Aufrufe) keine Steward-Note abgeben.
- [ ] Angenommen die Karte ist offen, dann bietet sie einen Regler 0–10 mit −/+-Knöpfen in der
  Schrittweite des Tastings (1 bzw. 0,5, PROJ-19) und ein optionales Kommentarfeld (max. 500 Zeichen).
- [ ] Angenommen die Karte ist offen, dann steht dort der Hinweis, dass Note und Kommentar nach
  dem Abschluss **mit Namen für alle** sichtbar sind und bis dahin niemand — auch nicht der
  Steward — sie sieht.
- [ ] Angenommen der Nutzer stellt eine Note ein und tippt „Speichern", dann ist die Note
  gespeichert und eine kurze Bestätigung erscheint.
- [ ] Angenommen der Nutzer wählt 0 Punkte, wenn er speichert, dann fragt die App einmal nach,
  ob 0 wirklich gemeint ist.
- [ ] Angenommen der Nutzer hat bereits bewertet, wenn er die Bewertungsansicht erneut öffnet
  (auch auf einem anderen Gerät oder bei einem anderen Whisky), dann zeigt die Karte seine
  gespeicherte Note und seinen Kommentar, und die zugeklappte Karte zeigt „Deine Note: X".
- [ ] Angenommen der Nutzer hat bewertet, wenn er die Note ändert und speichert, dann gilt die
  neue Note.
- [ ] Angenommen der Nutzer hat bewertet, wenn er „Bewertung zurückziehen" wählt und bestätigt,
  dann ist seine Note samt Kommentar gelöscht.
- [ ] Angenommen der Gastgeber schaltet auf den letzten Whisky und der Nutzer hat den Steward
  noch nicht bewertet, dann zeigt die Karte einen dezenten Hinweis „Noch nicht bewertet".
- [ ] Angenommen eine ungültige Note (außerhalb 0–10 oder nicht in der Schrittweite des Tastings)
  oder ein zu langer Kommentar wird gesendet, dann wird sie abgelehnt mit einer verständlichen Meldung.
- [ ] Angenommen das Speichern scheitert (Netzwerk), dann erscheint eine Fehlermeldung, die
  Eingabe bleibt erhalten und die Seite bleibt bedienbar.

### Geheim bis zum Abschluss
- [ ] Angenommen das Tasting läuft, dann kann kein Nutzer — auch nicht der Steward, Gastgeber oder
  Admin — fremde Steward-Noten oder -Kommentare lesen; durchgesetzt auf Datenbankebene.
- [ ] Angenommen das Tasting läuft, wenn der Steward seinen Live-Einblick (PROJ-20) öffnet, dann
  enthält er weder Steward-Noten noch die Information, wer schon bewertet hat.
- [ ] Angenommen das Tasting ist im Entwurf, dann ist keine Steward-Note möglich und keine Karte sichtbar.

### Nach dem Abschluss
- [ ] Angenommen das Tasting ist abgeschlossen, dann kann keine Steward-Note mehr abgegeben,
  geändert oder zurückgezogen werden; die Karte verschwindet aus der Bewertungsansicht.
- [ ] Angenommen das Tasting ist abgeschlossen und mindestens eine Steward-Note existiert, wenn
  ein Mitglied die Ergebnisseite öffnet, dann sieht es einen Abschnitt „Whisky-Steward" mit Name
  des Stewards, Durchschnittsnote (z. B. „8,5 von 10 · 6 Stimmen") und der Liste aller Noten mit
  Namen und Kommentar, sortiert nach Note absteigend.
- [ ] Angenommen das Tasting ist abgeschlossen und es gibt einen Steward, aber keine Note, dann
  erscheint auf der Ergebnisseite kein Steward-Abschnitt.
- [ ] Angenommen ein Mitglied darf das Tasting sehen (bestehende Regeln inkl. PROJ-26), dann
  sieht es auch den Steward-Abschnitt; wer das Tasting nicht sieht, sieht auch die Noten nicht.

### Profil-Bilanz
- [ ] Angenommen ein Mitglied war Steward bei mindestens einem abgeschlossenen Tasting, dann
  zeigt seine Bilanz „Als Whisky-Steward: N Abende · Ø X" (N = abgeschlossene Steward-Abende,
  Ø = Durchschnitt aller dort erhaltenen Noten, Darstellung wie die übrigen Punktwerte).
- [ ] Angenommen es gibt Steward-Abende, aber noch keine einzige Note, dann zeigt die Bilanz
  „Als Whisky-Steward: N Abende · noch keine Note".
- [ ] Angenommen ein Mitglied war nie Steward, dann erscheint der Eintrag nicht.
- [ ] Angenommen ein Mitglied öffnet sein Profil, dann gibt es einen Schalter „Steward-Bilanz
  sichtbar", standardmäßig **an**.
- [ ] Angenommen der Schalter ist aus, wenn ein anderes Mitglied das Profil ansieht (PROJ-14),
  dann fehlt der Steward-Eintrag; der Besitzer selbst sieht ihn weiterhin.
- [ ] Angenommen der Schalter ist aus, dann bleiben die Noten auf den Ergebnisseiten der
  einzelnen Tastings trotzdem sichtbar (der Schalter betrifft nur die Bilanz).

## Edge Cases
- **Steward wechselt während des Tastings** — nicht möglich: Der Steward ist nach dem Start nicht
  mehr änderbar (bestehende Regel von `update_event`, nur im Entwurf).
- **Teilnehmer wird nach seiner Note deaktiviert** — Note und Name bleiben auf der Ergebnisseite
  stehen (wie seine Whisky-Bewertungen).
- **Steward wird später deaktiviert** — die Noten bleiben auf der Ergebnisseite; seine Bilanz ist
  wie das übrige Profil nicht mehr erreichbar.
- **Zwei Geräte gleichzeitig** — die zuletzt gespeicherte Note gilt; pro Teilnehmer und Tasting
  gibt es höchstens eine Steward-Note.
- **Teilnehmer wird während des laufenden Tastings entfernt** — nicht möglich (Teilnehmerliste
  ist nach dem Start fest); falls doch per Wartungsskript, verschwindet seine Note mit.
- **Abschluss genau beim Speichern** — das Speichern wird abgelehnt mit „Das Tasting ist bereits
  abgeschlossen"; die Note gilt nicht.
- **Halbe Punkte** — bei Schrittweite 0,5 ist z. B. 7,5 erlaubt; bei Schrittweite 1 wird 7,5 abgelehnt.
- **Alte Tastings mit Steward vor diesem Feature** — haben keine Noten → kein Abschnitt auf der
  Ergebnisseite; in der Bilanz zählen sie als Steward-Abende ohne Note.
- **Leerer Kommentar** — wird als „kein Kommentar" gespeichert; in der Liste erscheint nur die Note.
- **Wartungsskripte** — `tasting:delete` löscht die Steward-Noten mit; `user:delete` muss sie im
  Fußabdruck kennen (abgegebene und erhaltene).

## Technical Requirements (optional)
- Sicherheit: Geheimhaltung bis zum Abschluss auf **Datenbankebene** (wie Bewertungen und
  Sieger-Tipps), nicht nur im Frontend.
- Nur angemeldete, aktive Mitglieder; Schreiben nur Teilnehmer des Tastings, nicht der Steward.
- Mobile-first, große Bedienelemente; Bewertung in wenigen Sekunden erledigt.

## Open Questions
- [ ] Keine offenen Produktfragen. Wie die Note technisch gespeichert und freigegeben wird,
  entscheidet `/architecture`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Bewertung nur während des laufenden Tastings, friert beim Abschluss ein | Nutzerentscheidung; gleicher Rhythmus wie die Whisky-Bewertungen, die Note steht mit der Rangliste fest | 2026-11-23 |
| Nach dem Abschluss alles **mit Namen** sichtbar (Note + Kommentar) | Nutzerentscheidung; geschlossene Freundesrunde, offene Rückmeldung gewollt. Hinweis in der Karte macht das vorher klar | 2026-11-23 |
| Bis zum Abschluss geheim, auch für den Steward (nicht im Live-Einblick) | Der Steward soll den Abend nicht mit Blick auf seine Note moderieren; kein Druck auf die Teilnehmer | 2026-11-23 |
| Schrittweite folgt dem Tasting (1 / 0,5), 0 erlaubt mit Rückfrage | Einheitlich mit PROJ-19; 0-Rückfrage wie bei 0/0 in der Whisky-Bewertung | 2026-11-23 |
| Optionaler Kommentar, max. 500 Zeichen | Nutzerentscheidung „mit Notiz"; kurz gehalten, weil öffentlich mit Namen | 2026-11-23 |
| Bewerten dürfen alle Mitverkoster inkl. Gastgeber, nicht der Steward und kein Admin ohne Teilnahme | Nur wer den Abend erlebt hat, bewertet; Selbstbewertung ausgeschlossen | 2026-11-23 |
| Karte in der Bewertungsansicht unter dem Sieger-Tipp, nicht auf dem Dashboard | Nutzerentscheidung; dort sind alle Eingaben des Abends gebündelt | 2026-11-23 |
| Note zurückziehbar bis zum Abschluss | Wer versehentlich bewertet hat, soll das korrigieren können — die Bewertung ist freiwillig | 2026-11-23 |
| Ergebnisseite zeigt den Abschnitt nur, wenn mindestens eine Note existiert | Alte Tastings und unbewertete Abende sollen nicht „0 Stimmen" anzeigen | 2026-11-23 |
| Bilanz: „N Abende · Ø X", eigener Schalter, Standard an | Nutzerentscheidung; gleiches Muster wie der Kenner-Zähler (PROJ-22) | 2026-11-23 |
| Schalter betrifft nur die Bilanz, nicht die Ergebnisseiten | Die Ergebnisseite gehört dem ganzen Tasting; dort sind auch Whisky-Bewertungen nicht abschaltbar | 2026-11-23 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
