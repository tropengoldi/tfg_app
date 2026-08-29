# PROJ-4: Admin – Tasting-Events verwalten

## Status: Planned
**Created:** 2026-08-28
**Last Updated:** 2026-08-28

## Dependencies
- **Requires: PROJ-3 (Admin – Teilnehmerverwaltung)** — die Liste aktiver Mitglieder
  für Gastgeber- und Teilnehmerauswahl, der `(admin)`-Bereich, `requireAdmin`.
- **Baut auf PROJ-1** — `tasting_events`, `event_participants`, die RPCs
  `create_event` / `update_event` / `set_event_participants`, die `past_tastings`-Sicht.
  Eine neue Aktion `delete_event` (nur Draft, nur ohne Whiskies/Bewertungen) entsteht
  in PROJ-4.
- **Baut auf PROJ-2** — App-Shell, `requireAdmin`.

## Kontext

Damit ein Tasting-Abend stattfinden kann, muss ihn jemand ansetzen: Datum, Ort,
Gastgeber, wer kommt. Das macht der Admin auf dieser Seite — **bevor** der Abend
läuft. Sobald der Gastgeber das Event startet (PROJ-6), ist es aus der Hand des
Admins; es erscheint in seiner Liste dann nur noch als Info-Zeile.

PROJ-4 ist bewusst schmal: **anlegen und bearbeiten, solange das Event „In
Vorbereitung" ist**, plus löschen, solange nichts daran hängt. Whiskies eintragen
(PROJ-5), starten / Reihenfolge / abschließen (PROJ-6) und das Teilnehmer-Dashboard
(PROJ-8) sind eigene Features.

## User Stories

- Als **Admin** möchte ich ein neues Tasting anlegen (Datum, Ort, Gastgeber), damit
  die Runde einen verbindlichen Termin hat.
- Als **Admin** möchte ich die Teilnehmerliste eines geplanten Tastings
  zusammenstellen, damit klar ist, wer dabei ist.
- Als **Admin** möchte ich ein Limit für mitgebrachte Whiskies pro Person setzen oder
  weglassen, damit ein Abend nicht ausufert.
- Als **Admin** möchte ich ein geplantes Tasting bearbeiten, solange es noch nicht
  gestartet ist, um Änderungen bei Ort, Datum oder Runde einzuarbeiten.
- Als **Admin** möchte ich ein versehentlich angelegtes oder abgesagtes Tasting wieder
  löschen, solange noch nichts daran hängt.
- Als **Admin** möchte ich alle Tastings mit ihrem Status auf einen Blick sehen, um den
  Überblick über kommende und vergangene Abende zu behalten.

## Out of Scope

- **Event starten, Runde weiterschalten, Event abschließen, Ausschankreihenfolge** →
  PROJ-6 (Gastgeber-Steuerung).
- **Whiskies eintragen** → PROJ-5.
- **„Info zum Essen" und „Anmerkungen des Gastgebers"** → trägt der Gastgeber in
  PROJ-6 ein (die Spalten existieren aus PROJ-1).
- **Das Teilnehmer-Dashboard** (Eckdaten, Glas-Fortschritt, Absprünge) → PROJ-8.
- **Eine eigene Admin-Detailseite pro Event** — nicht vorgesehen (nah am Dashboard).
- **Bearbeiten eines laufenden oder abgeschlossenen Events** — nur „In Vorbereitung"
  ist editierbar (PROJ-1-Regel).
- **Tastings mit Datum in der Vergangenheit anlegen** (Nachtragen alter Zettel-Abende)
  — bewusst nicht; das Datum muss heute oder später sein.
- **Wiederkehrende Termine / Serien**, **Kalender-Export**, **Einladungs-E-Mails an
  Teilnehmer** — nicht im MVP.
- **Mehrere gleichzeitig *laufende* Events** — durch PROJ-1 ausgeschlossen (greift beim
  Start, PROJ-6). Beliebig viele Events „In Vorbereitung" sind erlaubt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anlegen

- [ ] Angenommen der Admin ist im Bereich „Tastings", wenn er Datum (heute oder
      später), Ort und Gastgeber angibt und speichert, dann wird ein Event im Status
      „In Vorbereitung" angelegt, der Gastgeber ist automatisch Teilnehmer, und der
      Admin landet wieder in der Liste mit einer Bestätigung.
- [ ] Angenommen der Admin füllt das Formular unvollständig aus, wenn er speichert,
      dann wird für jedes fehlende Pflichtfeld (Datum, Ort, Gastgeber) eine
      Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen der Admin wählt ein Datum in der Vergangenheit, wenn er speichert,
      dann wird die Eingabe abgelehnt mit dem Hinweis, dass das Datum nicht in der
      Vergangenheit liegen darf.
- [ ] Angenommen der Admin trägt eine maximale Whisky-Zahl außerhalb von 1 bis 10 ein,
      wenn er speichert, dann wird die Eingabe abgelehnt.
- [ ] Angenommen der Admin lässt das Limit leer, wenn er speichert, dann gilt für
      dieses Event kein Limit (die Anzahl mitgebrachter Whiskies ist frei).
- [ ] Angenommen der Admin wählt beim Anlegen keine weiteren Teilnehmer, wenn er
      speichert, dann wird das Event mit nur dem Gastgeber als Teilnehmer angelegt.
- [ ] Angenommen der Admin wählt einen Gastgeber, der kein aktives Mitglied ist, wenn
      er speichert, dann wird die Eingabe abgelehnt.

### Teilnehmerliste

- [ ] Angenommen der Admin bearbeitet die Teilnehmerliste, wenn er die Auswahl öffnet,
      dann sieht er alle aktiven Mitglieder als Auswahl; der Gastgeber ist markiert und
      lässt sich nicht abwählen.
- [ ] Angenommen der Admin entfernt einen Teilnehmer, der für dieses Event bereits
      einen Whisky eingetragen oder eine Bewertung abgegeben hat, wenn er speichert,
      dann wird das Entfernen abgelehnt mit einem entsprechenden Hinweis.
- [ ] Angenommen der Admin wechselt den Gastgeber eines Events, wenn er speichert, dann
      wird der neue Gastgeber automatisch zur Teilnehmerliste hinzugefügt.

### Bearbeiten

- [ ] Angenommen ein Event ist in Vorbereitung, wenn der Admin es öffnet, dann kann er
      Datum, Ort, Gastgeber, Teilnehmerliste, Limit und Thema ändern und speichern.
- [ ] Angenommen ein Event läuft bereits oder ist abgeschlossen, wenn der Admin es in
      der Liste sieht, dann werden Status und Eckdaten nur angezeigt, aber es gibt keine
      Bearbeiten-Aktion.
- [ ] Angenommen der Admin ändert etwas und das Speichern schlägt fehl (Netz/Server),
      wenn er es abschickt, dann erscheint eine Fehlermeldung und seine Eingaben bleiben
      erhalten.

### Löschen

- [ ] Angenommen ein Event ist in Vorbereitung und es hängen keine Whiskies oder
      Bewertungen daran, wenn der Admin „löschen" bestätigt, dann wird das Event
      entfernt und verschwindet aus der Liste.
- [ ] Angenommen ein Event ist in Vorbereitung, aber es wurde bereits mindestens ein
      Whisky eingetragen, wenn der Admin es löschen will, dann wird die Aktion abgelehnt
      mit dem Hinweis, dass erst die Whiskies entfernt werden müssen.
- [ ] Angenommen ein Event läuft oder ist abgeschlossen, wenn der Admin es betrachtet,
      dann gibt es keine Lösch-Aktion.
- [ ] Angenommen der Admin löst „löschen" aus, wenn der Bestätigungsdialog erscheint,
      dann sieht er, dass das Löschen endgültig ist, bevor er bestätigt.

### Liste & Zustände

- [ ] Angenommen es gibt Events, wenn der Admin die Liste öffnet, dann sieht er sie
      chronologisch nach Datum sortiert, jeweils mit Datum, Ort, Gastgeber,
      Teilnehmerzahl und einem Status-Badge (In Vorbereitung / Läuft / Abgeschlossen).
- [ ] Angenommen es gibt noch kein Event, wenn der Admin die Liste öffnet, dann sieht
      er einen Hinweis und die Aktion „Erstes Tasting anlegen".
- [ ] Angenommen die Liste wird geladen, wenn die Daten nicht abrufbar sind, dann
      erscheint eine Fehlermeldung mit erneutem Ladeversuch, keine leere Seite.
- [ ] Angenommen eine Aktion läuft (Anlegen / Speichern / Löschen), wenn der Admin
      wartet, dann ist die Schaltfläche im Ladezustand und ein zweiter Klick nicht
      möglich.

### Sicherheit

- [ ] Angenommen ein Teilnehmer ohne Admin-Rechte ruft die Event-Verwaltung direkt auf,
      wenn die Seite geladen wird, dann erhält er „Seite nicht gefunden".
- [ ] Angenommen ein Nicht-Admin schickt eine Anlege-, Bearbeiten- oder Lösch-Anfrage
      direkt an den Server, wenn sie verarbeitet wird, dann wird sie abgelehnt, weil die
      Admin-Rolle serverseitig geprüft wird.

## Edge Cases

- **Zwei Admins bearbeiten dasselbe Draft-Event gleichzeitig.** Erwartung: Die zuletzt
  gespeicherte Fassung gewinnt; kein Absturz, keine Teil-Speicherung.
- **Gastgeber wird gewechselt, nachdem der alte Gastgeber schon Whiskies eingetragen
  hat (PROJ-5).** Erwartung: Der Wechsel gelingt; die eingetragenen Whiskies des alten
  Gastgebers bleiben. Dass er dann eventuell einen über seinem regulären Limit hat,
  wird akzeptiert (das Limit wird nur beim Hinzufügen geprüft).
- **Limit wird nachträglich gesenkt, nachdem jemand schon mehr Whiskies eingetragen
  hat.** Erwartung: Die vorhandenen Whiskies bleiben; die Person kann nur keine
  weiteren hinzufügen. Kein Datenverlust.
- **Admin will einen Teilnehmer entfernen, der schon einen Whisky eingetragen hat.**
  Erwartung: abgelehnt mit Hinweis (Regel aus PROJ-1).
- **Der gewählte Gastgeber wird deaktiviert, während das Event in Vorbereitung ist.**
  Erwartung: Das Event bleibt bestehen; beim nächsten Speichern verlangt die Prüfung
  einen aktiven Gastgeber, der Admin muss einen anderen wählen. (Deckt sich mit PROJ-3:
  einen Gastgeber eines nicht abgeschlossenen Events kann man ohnehin nicht
  deaktivieren — dieser Fall entsteht nur, wenn die Reihenfolge umgangen wird.)
- **Netzwerkabbruch beim Speichern.** Erwartung: Fehlermeldung, Formular behält die
  Eingaben, erneuter Versuch möglich, kein doppelt angelegtes Event.
- **Datum genau heute.** Erwartung: erlaubt (nur echte Vergangenheit ist gesperrt).

## Technical Requirements

- **Sicherheit:** Anlegen, Bearbeiten und Löschen laufen serverseitig, nach Prüfung
  der Admin-Rolle. Direkte Schreibzugriffe auf die Event-Tabelle sind für normale
  Nutzer gesperrt (PROJ-1) — alles über die vorgesehenen Aktionen.
- **Datenintegrität serverseitig erzwungen:** „Datum nicht in der Vergangenheit",
  „Limit 1–10 oder leer", „Gastgeber ist aktives Mitglied", „kein Entfernen eines
  Teilnehmers mit Whiskies/Bewertungen", „Löschen nur ohne Whiskies/Bewertungen".
- **Bearbeiten/Löschen nur für Events im Status „In Vorbereitung".**
- **Mobile-first:** Formular in einer Spalte ab 375 px, Teilnehmerauswahl
  touch-freundlich, Datumsauswahl mit `shadcn calendar`.

## Open Questions

- [ ] Nach dem Anlegen: zurück zur Liste (aktuelle Entscheidung) oder direkt in die
      Bearbeiten-Ansicht des neuen Events? *(Tendenz: zurück zur Liste mit
      Hervorhebung.)*
- [ ] Soll die Liste eine kleine Whisky-Anzahl je Event zeigen (relevant, sobald PROJ-5
      läuft)? *(Tendenz: ja, sobald es Whiskies gibt — ggf. in PROJ-5/8 ergänzen.)*
- [ ] Rückwirkendes Erfassen alter Tastings als separate Funktion mit anderer
      Regel-Lage, falls die Runde ihre Papier-Historie digitalisieren will? *(offen,
      nach dem ersten echten Einsatz entscheiden.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| PROJ-4 deckt nur die Vorbereitung ab (anlegen + Draft bearbeiten + löschen) | Starten, Reihenfolge, Abschließen sind Sache des Gastgebers (PROJ-6); Whiskies sind PROJ-5; das Dashboard ist PROJ-8. Klare Rollen- und Testgrenzen | 2026-08-28 |
| Laufende/abgeschlossene Events sind in der Admin-Liste nur Info-Zeilen ohne Bearbeiten | Die PROJ-1-Regel lässt Kern-Änderungen ohnehin nur im Draft zu; nach dem Start gehört das Event dem Gastgeber | 2026-08-28 |
| Löschen nur für Draft-Events ohne Whiskies/Bewertungen | Ein abgesagter oder versehentlich angelegter Abend soll verschwinden können, aber niemand soll unangekündigt einen eingetragenen Whisky oder eine Bewertung verlieren. Braucht eine neue DB-Aktion `delete_event` | 2026-08-28 |
| Admin-Formularfelder: Datum, Ort, Gastgeber, Teilnehmer, Max-Whiskies, Thema | „Info zum Essen" und „Anmerkungen des Gastgebers" trägt der Gastgeber selbst ein (PROJ-6) — er kocht, er weiß es besser | 2026-08-28 |
| Datum muss heute oder später sein — kein Nachtragen alter Abende über dieses Formular | Schutz vor Jahres-Vertippern. Nachteil: ein altes Zettel-Tasting lässt sich nicht rückwirkend erfassen. Bei Bedarf später per `/refine` öffnen | 2026-08-28 |
| Teilnehmer beim Anlegen optional (nur Gastgeber Pflicht) | Zusagen kommen oft erst nach und nach; die Liste lässt sich jederzeit (solange Draft) ergänzen | 2026-08-28 |
| Eine chronologische Liste nach Datum, Status als Badge — keine Abschnitte | Bei wenigen Events pro Jahr reicht das | 2026-08-28 |
| Kein Limit setzen = freie Anzahl Whiskies | Entspricht der PROJ-1-Regel (`max_whiskies_per_participant` = NULL); der Gastgeber darf per PROJ-1-Logik ohnehin einen mehr als das Limit | 2026-08-28 |
| Löschen (zerstörend) hinter AlertDialog; das Speichern eines Formulars nicht | Löschen ist endgültig; ein Formular-Submit ist selbsterklärend | 2026-08-28 |

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
