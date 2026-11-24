# PROJ-29: Steward-Bewertung durch Teilnehmer

## Status: In Progress
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
| Eigene Tabelle „Steward-Noten" (`steward_scores`) statt Erweiterung von `ratings` | Bewertungen hängen an einem Whisky und fließen in die Rangliste; die Steward-Note hat damit nichts zu tun | 2026-11-23 |
| Name `steward_scores`, nicht `steward_ratings` | `steward_ratings` ist schon die Live-Einblick-Funktion aus PROJ-20 | 2026-11-23 |
| Steward nicht in der Zeile speichern, sondern aus dem Tasting ableiten | Keine Note für die falsche Person möglich; Steward ist nach dem Start ohnehin fest | 2026-11-23 |
| Schreiben nur über zwei SECURITY-DEFINER-Funktionen (setzen / zurückziehen), Fehler TS028 | Gleiches Muster wie PROJ-22/23; alle Regeln an einer Stelle, Sperre gegen gleichzeitiges Abschließen | 2026-11-23 |
| Aufdecken über eine Sicht nur für abgeschlossene Tastings | Geheimhaltung auf DB-Ebene wie bei Tipps und Ranglisten; Frontend kann nichts versehentlich verraten | 2026-11-23 |
| Live-Einblick (PROJ-20) bleibt unverändert | Spec: der Steward sieht vor dem Abschluss nichts von seinen Noten | 2026-11-23 |
| Bilanz-Ø über alle Einzelnoten statt über Abend-Durchschnitte | Jede Stimme zählt gleich; einfacher zu erklären | 2026-11-23 |
| Profil-Schalter `show_steward_balance`, Standard an, wie `show_kenner_count` | Bewährtes Muster aus PROJ-14/22 inkl. Spalten-Rechten und Profil-Sicht | 2026-11-23 |
| Kein neues Paket | Alle Bausteine vorhanden (ScoreField, Collapsible, AlertDialog) | 2026-11-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Gleiches Muster wie der Sieger-Tipp (PROJ-22): eine kleine neue Tabelle für die Steward-Noten,
zwei Funktionen zum Speichern bzw. Zurückziehen, eine Sicht, die die Noten erst nach dem
Abschluss aufdeckt, und ein neuer Profil-Schalter. Dazu drei Stellen in der Oberfläche
(Bewertungsansicht, Ergebnisseite, Profil). Kein neues Paket, keine neue Seite, keine neue Route.

Der Name `steward_ratings` ist bereits für den Live-Einblick des Stewards (PROJ-20) vergeben —
die neuen Bausteine heißen deshalb durchgehend **„Steward-Noten"** (englisch `steward_scores`).

### A) Bausteine

```
Bewertungsansicht (PROJ-7) — nur Mitverkoster, nur laufendes Tasting mit Steward
+-- (bestehend) Sieger-Tipp
+-- NEU: Karte „Den Steward bewerten" (shadcn Collapsible + Card), zugeklappt Standard
|   +-- Kopfzeile: „Den Steward bewerten · <Name>" bzw. „Deine Note: 8,5"
|   |   bzw. dezent „Noch nicht bewertet", sobald der letzte Whisky läuft
|   +-- Regler 0–10 mit −/+ (bestehender Baustein ScoreField, Schrittweite des Tastings)
|   +-- Kommentar (shadcn Textarea, max. 500 Zeichen, Zähler)
|   +-- Hinweis mit Auge: „Nach dem Abschluss mit deinem Namen für alle sichtbar —
|   |   bis dahin sieht es niemand, auch nicht <Name>."
|   +-- „Speichern" (bei 0 Punkten Rückfrage per AlertDialog)
|   +-- „Bewertung zurückziehen" (nur wenn bewertet; Rückfrage per AlertDialog)
+-- (bestehend) Positionen, Punktefelder, Notiz, Vergleichs-Merker, Meine Rangliste

Ergebnisseite (PROJ-9) — nur abgeschlossen und mindestens eine Note
+-- (bestehend) Rangliste, Kenner, Alle Tipps, Statistiken
+-- NEU: Abschnitt „Whisky-Steward"
    +-- Name des Stewards, „8,5 von 10 · 6 Stimmen"
    +-- Liste: Name · Note · Kommentar (nach Note absteigend, bei Gleichstand nach Name)

Profil – Bilanz (PROJ-10 / PROJ-14)
+-- NEU: Kennzahl „Als Whisky-Steward: 3 Abende · Ø 8,7" bzw. „… · noch keine Note"
|   (nur wenn mindestens ein abgeschlossener Steward-Abend)
+-- Sichtbarkeits-Einstellungen: NEU Schalter „Steward-Bilanz"
+-- Fremdes Profil: Kennzahl nur bei eingeschaltetem Schalter
```

### B) Datenmodell

**Steward-Note** (höchstens eine pro Person und Tasting)
- Tasting, bewertende Person, Note (0–10, Dezimal wie die Whisky-Punkte), Kommentar (optional,
  max. 500 Zeichen), Zeitpunkt der letzten Änderung
- Der Steward selbst steht **nicht** in der Zeile — er ergibt sich aus dem Tasting. So kann es
  keine Note für die falsche Person geben, und ein Steward-Wechsel im Entwurf braucht keine
  Nacharbeit (im Entwurf gibt es ohnehin keine Noten).
- Wird das Tasting oder die bewertende Person gelöscht, verschwindet die Note mit.

**Profil:** NEU Schalter „Steward-Bilanz sichtbar" (Standard: an).

### C) Zugriffsregeln (Datenbankebene)

| Wer | Während des Tastings | Nach dem Abschluss |
|---|---|---|
| Mitverkoster (inkl. Gastgeber) | eigene Note setzen / ändern / zurückziehen / lesen | eigene Note + alle aufgedeckten Noten lesen |
| Whisky-Steward | **nichts** (keine Note, keine fremden Noten, nicht im Live-Einblick) | alle aufgedeckten Noten lesen |
| Admin / andere aktive Mitglieder | keine fremden Noten | alle aufgedeckten Noten lesen (sofern das Tasting für sie sichtbar ist, PROJ-26) |
| Deaktivierte / nicht angemeldet | nichts | nichts |

- **Speichern** nur über die Funktion „Steward-Note setzen" (Tasting, Note, Kommentar). Sie prüft:
  aktives Mitglied, Tasting läuft (gegen gleichzeitiges Abschließen gesperrt), Tasting hat einen
  Steward, Person ist Teilnehmer und nicht der Steward, Note 0–10 und passt zur Schrittweite,
  Kommentar ≤ 500 Zeichen → sonst **TS028** mit verständlicher Meldung. Ein zweiter Aufruf
  ersetzt die Note; leerer Kommentar wird als „kein Kommentar" gespeichert.
- **Zurückziehen** über die Funktion „Steward-Note zurückziehen" — gleiche Prüfungen (läuft,
  Teilnehmer); nach dem Abschluss abgelehnt (TS028).
- **Direktes Lesen der Tabelle:** ausschließlich die eigene Zeile. Kein Direktschreiben.
- **Aufdecken** über die Sicht „aufgedeckte Steward-Noten": nur abgeschlossene Tastings, nur
  aktive Mitglieder, gleiche Sichtbarkeit des Tastings wie die Ranglisten-Sichten (inkl.
  Testkonten-Regel PROJ-26). Liefert je Note: Tasting, Steward, bewertende Person (Name), Note,
  Kommentar.
- **Live-Einblick (PROJ-20)** bleibt unverändert — er liest die neue Tabelle nicht.

### D) Auswertung
- **Ergebnisseite:** Durchschnitt und Anzahl aus der Sicht, Anzeige mit der bestehenden
  Punkte-Formatierung („8,5"). Keine Note → kein Abschnitt.
- **Bilanz:** „Abende" = abgeschlossene Tastings mit dieser Person als Steward (aus der
  bestehenden Historien-Sicht, die den Steward bereits kennt); „Ø" = Durchschnitt aller dort
  erhaltenen Noten (eine Note = eine Stimme, nicht Durchschnitt der Abend-Schnitte). Für das
  fremde Profil nur bei eingeschaltetem Schalter — die Abfrage prüft den Schalter wie beim
  Kenner-Zähler.

### E) Migration (eine Datei)
1. Tabelle „Steward-Noten" mit RLS (nur eigene Zeile lesbar, kein Direktschreiben), Prüfregeln
   für Wertebereich, Halbschritte und Kommentarlänge.
2. Funktionen „Steward-Note setzen" und „Steward-Note zurückziehen" (TS028).
3. Sicht „aufgedeckte Steward-Noten".
4. Profil-Schalter + Erweiterung der Profil-Sicht + Spalten-Rechte (wie PROJ-14/22).
Danach Typen neu erzeugen. Ausrollen wie immer: `db:push` → App.

### F) Wartungsskripte
- `tasting:delete`: Noten gehen per Kaskade mit, nichts zu tun.
- `user:delete`: Fußabdruck zählt **abgegebene** Steward-Noten (Kaskade bei `hard`/`cascade`) und
  **erhaltene** (über die Steward-Rolle, die bereits als geschützter Verweis gilt).

### G) Tests
- **DB-Integration:** Teilnehmer setzt / ändert / zieht zurück; Gastgeber darf; Steward,
  Außenstehender, Admin ohne Teilnahme, Tasting ohne Steward, Entwurf, abgeschlossen → TS028;
  Note außerhalb 0–10, falsche Schrittweite, Kommentar > 500 → TS028; kein Direktschreiben;
  während des Tastings sieht niemand (Teilnehmer/Gastgeber/Steward/Admin) fremde Noten — weder
  in der Tabelle noch in der Sicht; nach dem Abschluss liefert die Sicht alle Noten mit Namen;
  Testkonten-Tasting für normale Mitglieder unsichtbar; Profil-Schalter.
- **Unit:** Durchschnitt/Anzahl, Sortierung der Liste, Bilanz-Text („noch keine Note"),
  Formular-Prüfung.
- **E2E:** Karte nur mit Steward; Note setzen + Wiederöffnen + ändern + zurückziehen; 0-Rückfrage;
  Steward sieht keine Karte und im Live-Einblick nichts; Ergebnis-Abschnitt nach dem Abschluss;
  Bilanz + Schalter im fremden Profil; 360 px.

### H) Abhängigkeiten (Pakete)
Keine. Alle UI-Bausteine (Collapsible, Card, Textarea, AlertDialog, ScoreField) sind vorhanden.

### Arbeitsaufteilung
- `/backend` zuerst: Migration, Typen, Server-Aktionen, Integrationstests (wie bei PROJ-22).
- `/frontend`: Karte in der Bewertungsansicht, Ergebnis-Abschnitt, Bilanz + Schalter.

### Implementation Notes (Backend, 2026-11-24)
- Migration `supabase/migrations/20261124120000_steward_scores.sql`:
  - Tabelle `steward_scores` (PK `event_id` + `profile_id`; `score numeric(3,1)` mit CHECK 0–10 in
    Halbschritten; `comment` 1–500 Zeichen oder NULL; CASCADE bei Event-/Profil-Löschung). RLS an;
    `select` nur eigene Zeile; `insert/update/delete` für `authenticated` entzogen.
  - Interne Prüf-Funktion `steward_score_guard(p_event)` (nicht aufrufbar für Nutzer): aktives Mitglied
    (TS004), Event `active` mit `for share` gegen gleichzeitiges Abschließen, Steward vorhanden, nicht
    der Steward selbst, Teilnehmer → sonst **TS028**; liefert die Schrittweite.
  - `set_steward_score(p_event, p_score, p_comment default null)`: Note 0–10, `mod(score, rating_step)
    = 0`, Kommentar getrimmt (leer → NULL), ≤ 500 → sonst TS028; Upsert ersetzt.
  - `clear_steward_score(p_event)`: gleiche Prüfung, löscht die eigene Zeile (keine Zeile = kein Fehler).
  - Sicht `steward_scores_revealed` (Owner-Rechte): nur `closed`, `helper_id` gesetzt,
    `is_active_member()`, Testkonten-Filter wie die übrigen Ergebnis-Sichten; Spalten `event_id,
    steward_id, profile_id, display_name, score, comment, is_test`.
  - `profiles.show_steward_balance` (Default `true`) + Spalten-GRANTs; `profiles_public` um die Spalte
    **am Ende** erweitert (sonst 1:1 aus `20261009120000`).
  - Live-Einblick (`steward_ratings`, PROJ-20) unverändert.
- App-Server: `src/lib/schemas/steward-scores.ts` (+ 4 Unit-Tests), `src/lib/actions/steward-scores.ts`
  (`setStewardScoreAction`, `clearStewardScoreAction`), `errors.ts` TS028.
- `scripts/delete-user.mjs`: Fußabdruck zeigt Steward-Noten (abgegeben / erhalten); abgegebene gehen bei
  `hard`/`cascade` per CASCADE mit, blockieren nichts.
- Integrationstest `steward-scores.integration.test.ts` (16 Fälle): Entwurf/abgeschlossen/Steward/
  Außenstehender/Admin ohne Teilnahme/ohne Steward → TS028; Ersetzen; leerer Kommentar; Gastgeber darf;
  0 erlaubt; Grenzen + Schrittweite 1; Zurückziehen; kein Direktschreiben; Geheimhaltung Tabelle + Sicht
  für Teilnehmer/Gastgeber/Steward/Admin; Live-Einblick ohne Steward-Noten; Aufdecken mit Namen;
  Testkonten-Regel; Profil-Schalter. Sicherheitsnetz: bricht ab, wenn ein fremdes Tasting läuft.
- `db:push` durch den Nutzer am 2026-11-24, danach `db:types`; `auth.ts` Session-Spalten um
  `show_steward_balance` ergänzt. Typprüfung fehlerfrei. Integrationstest **16/16** grün; Regression
  `profile-visibility` / `test-accounts` / `winner-tips` / `steward-insight` **49/49**; Unit **246/246**.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
