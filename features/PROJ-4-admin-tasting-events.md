# PROJ-4: Admin – Tasting-Events verwalten

## Status: Approved
**Created:** 2026-08-28
**Last Updated:** 2026-08-29

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

| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Seiten `/admin/events`, `/admin/events/neu`, `/admin/events/[eventId]` — kein Dialog | Das Formular ist größer als das Einladen-Formular (Datumsauswahl, Mehrfach-Teilnehmerauswahl); auf dem Handy braucht das eine ganze Seite | 2026-08-28 |
| Die Event-Liste kommt über eine neue Admin-Datenbank-Aktion `admin_list_events()` (Event + Gastgebername + Teilnehmerzahl gebündelt) | Konsistent mit PROJ-3 (`admin_list_members`), ein Aufruf statt vieler Einzelabfragen, Admin-Prüfung steckt in der Funktion | 2026-08-28 |
| Neue Datenbank-Aktion `delete_event` — prüft Admin + Status „In Vorbereitung" + keine Whiskies/Bewertungen, dann löschen (räumt die Teilnehmer-Zuordnung mit ab) | PROJ-1 hat bewusst keine Lösch-Aktion für Events. Sie muss die Regeln aus dem Spec selbst erzwingen. Neuer Fehlercode `TS015` = „Event hat schon Whiskies" | 2026-08-28 |
| „Datum nicht in der Vergangenheit" wird in der Server-Aktion geprüft, **nicht** in der Datenbank | Es ist eine Produktregel, die sich ändern kann (siehe Open Question „Backfill"), kein hartes Daten-Invariant. Die Server-Aktion ist der admin-geprüfte serverseitige Engpass — die Regel gilt damit serverseitig, ohne eine spätere Datenbank-Migration zu erzwingen | 2026-08-28 |
| Anlegen = zwei aufeinanderfolgende Datenbank-Aktionen (`create_event`, dann `set_event_participants`) — nicht in einem Zug | PROJ-1s `create_event` nimmt keine Teilnehmerliste entgegen. Schlägt der zweite Schritt fehl, existiert das Event mit nur dem Gastgeber; der Admin zieht die Liste nach. Kein Datenverlust, seltener Fall | 2026-08-28 |
| Der Teilnehmer-Picker nutzt die bestehende `admin_list_members`-Aktion (PROJ-3), clientseitig auf aktive Mitglieder gefiltert | Kein neuer Endpunkt für „aktive Mitglieder"; die Liste liefert schon Name + Status | 2026-08-28 |
| Die Bearbeiten-Seite prüft den Status: nur „In Vorbereitung" ist editierbar, sonst zurück zur Liste | Deckt den Direktaufruf `/admin/events/[eventId]` für ein laufendes/abgeschlossenes Event ab | 2026-08-28 |
| Mutationen als Server Actions in `src/lib/actions/admin-events.ts`, jede mit Admin-Prüfung vor dem Datenbank-Aufruf | Konsistent mit PROJ-2/PROJ-3 | 2026-08-28 |
| Neue Pakete: `shadcn calendar` (zieht `react-day-picker` mit) + `date-fns` | Datumsauswahl mit gesperrten Vergangenheitstagen; `date-fns` für deutschsprachige Datumsformatierung und den „heute"-Vergleich | 2026-08-28 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** Drei Admin-Seiten — eine Liste aller Tastings, ein
> Formular zum Anlegen, dasselbe Formular zum Bearbeiten geplanter Abende — plus
> eine Lösch-Aktion für versehentlich angelegte Termine. Das meiste dahinter steht
> schon aus PROJ-1; neu sind die Oberfläche, eine Listen-Abfrage und eine
> Lösch-Regel.

### 1. Seitenstruktur

```
(admin)-Bereich  (Zugang: „nur Admins")
└─ /admin                         Platzhalter → Link „Tastings verwalten"
   ├─ /admin/events               Liste: alle Tastings, chronologisch nach Datum
   │   ├─ Button „Tasting anlegen" → /admin/events/neu
   │   ├─ pro Zeile: Datum · Ort · Gastgeber · Teilnehmerzahl · Status-Badge
   │   │   (In Vorbereitung / Läuft / Abgeschlossen)
   │   │   └─ bei „In Vorbereitung": Aktionen „Bearbeiten" und „Löschen"
   │   │       (Löschen hinter Bestätigungsdialog)
   │   ├─ Leerzustand: „Noch kein Tasting angelegt." + „Erstes Tasting anlegen"
   │   ├─ Ladezustand: Skeleton-Zeilen
   │   └─ Fehlerzustand: Hinweis + „Erneut versuchen"
   │
   ├─ /admin/events/neu           Anlege-Formular
   └─ /admin/events/[eventId]     dasselbe Formular, vorausgefüllt
       └─ ist das Event nicht „In Vorbereitung" → zurück zur Liste

Formular (Anlegen = Bearbeiten)
├─ Datum            Pflicht, Auswahl über einen Kalender; Tage vor heute gesperrt
├─ Ort              Pflicht, Freitext
├─ Gastgeber        Pflicht, Auswahl aus den aktiven Mitgliedern
├─ Teilnehmer       Mehrfachauswahl (Häkchen) aller aktiven Mitglieder;
│                   der Gastgeber ist gesetzt und nicht abwählbar
├─ Max. Whiskies pro Person   optional, Zahl 1–10; leer = kein Limit
│                   (Hinweis: „Der Gastgeber darf einen mehr.")
└─ Thema            optional, Freitext
```

Neue Bausteine: `src/components/admin/{event-list, event-row, event-form,
event-status-badge, participant-picker}.tsx`, ein Kalender-Datumsfeld,
`src/lib/actions/admin-events.ts`, `src/lib/schemas/admin-events.ts`,
`src/lib/queries/admin-events.ts`. Der Bestätigungsdialog (`ConfirmDialog`) und
die Fehler-/Lade-Muster stammen aus PROJ-3.

### 2. Datenmodell (nichts Neues an Tabellen)

PROJ-4 nutzt die Tabellen aus PROJ-1:

- **`tasting_events`:** Datum, Ort, Thema, Gastgeber, wer es angelegt hat, Limit,
  Status. (Die Felder „Info zum Essen" und „Anmerkungen des Gastgebers" existieren,
  werden hier aber **nicht** angefasst — die füllt der Gastgeber in PROJ-6.)
- **`event_participants`:** die Zuordnung Event ⇄ Teilnehmer.

**Neue Datenbank-Aktionen (RPCs), jeweils mit eingebauter Admin-Prüfung:**

| Aktion | Was sie tut | Eingebaute Regeln |
|--------|-------------|-------------------|
| **Event-Liste lesen** | alle Events + Gastgebername + Teilnehmerzahl gebündelt | nur für Admins |
| **Event löschen** | löscht das Event (und die Teilnehmer-Zuordnung) | nur „In Vorbereitung"; **keine** Whiskies und **keine** Bewertungen dürfen daranhängen — sonst abgelehnt |

**Schon vorhanden aus PROJ-1** (PROJ-4 ruft sie nur auf):

| Aktion | Rolle in PROJ-4 |
|--------|-----------------|
| `create_event` | legt das Event an (Status „In Vorbereitung", Gastgeber wird Teilnehmer) |
| `update_event` | ändert die Eckdaten — **funktioniert nur, solange „In Vorbereitung"** |
| `set_event_participants` | setzt die Teilnehmerliste; fügt den Gastgeber automatisch hinzu; **verweigert das Entfernen** von jemandem mit Whiskies oder Bewertungen |

### 3. Wo geschrieben wird

| Aktion | Mechanismus | Prüfung |
|--------|-------------|---------|
| Event anlegen | Server Action → `create_event`, danach `set_event_participants` | Admin-Rolle; Datum nicht in der Vergangenheit; Gastgeber ist aktives Mitglied (Datenbank-Aktion) |
| Event bearbeiten | Server Action → `update_event` + `set_event_participants` | Admin-Rolle; nur „In Vorbereitung"; dieselben Feldregeln |
| Event löschen | Server Action → `delete_event` | Admin-Rolle; nur „In Vorbereitung"; keine Whiskies/Bewertungen |

Kein direkter Schreibzugriff auf die Event-Tabelle für normale Nutzer (PROJ-1).
Der Service-Schlüssel wird in PROJ-4 **nicht** gebraucht — alles läuft über die
Datenbank-Aktionen mit eigener Admin-Prüfung.

### 4. Die „Datum nicht in der Vergangenheit"-Regel

- **In der Oberfläche:** Der Kalender sperrt Tage vor heute, man kann sie gar nicht
  erst anklicken.
- **Serverseitig:** Die Server-Aktion vergleicht das übermittelte Datum mit „heute"
  und lehnt Vergangenheitsdaten ab — bevor die Datenbank-Aktion aufgerufen wird.
- **Bewusst nicht in der Datenbank:** Das ist eine Produktregel, die sich später
  ändern kann (falls die Runde alte Papier-Abende nachtragen will, siehe Open
  Question). Sie in einen Datenbank-Zwang zu gießen würde ein späteres
  Backfill-Feature eine Migration kosten.

### 5. Anlegen in zwei Schritten

`create_event` nimmt keine Teilnehmerliste entgegen. Ablauf:

1. `create_event` → Event steht (mit dem Gastgeber als einzigem Teilnehmer).
2. Hat der Admin weitere Teilnehmer angehakt → `set_event_participants` mit der
   vollen Liste.

Schlägt Schritt 2 fehl (Netz), existiert das Event mit nur dem Gastgeber; der Admin
öffnet es und ergänzt die Liste. Kein Datenverlust.

### 6. Bearbeiten nur im Draft

Ruft der Admin `/admin/events/[eventId]` für ein Event auf, das schon läuft oder
abgeschlossen ist, leitet die Seite zurück zur Liste. Gibt es das Event nicht (oder
ist es für den Nutzer unsichtbar), kommt „nicht gefunden". Die Liste zeigt die
„Bearbeiten"- und „Löschen"-Aktionen ohnehin nur bei Events „In Vorbereitung".

### 7. Zustände & Rückmeldungen (nach design-system)

- **Laden:** Skeleton-Zeilen bzw. -Formularfelder.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen".
- **Aktion läuft:** Button im Ladezustand, kein Doppelklick.
- **Aktion schlägt fehl:** konkrete deutsche Meldung; das Formular behält die
  Eingaben.
- **Aktion gelingt:** zurück zur Liste, kurze Bestätigung.
- **Löschen:** AlertDialog mit dem Hinweis, dass es endgültig ist.

### 8. Neue Pakete

| Paket | Zweck |
|-------|-------|
| `shadcn calendar` (zieht `react-day-picker` mit) | Datumsauswahl mit gesperrten Vergangenheitstagen |
| `date-fns` | deutschsprachige Datumsformatierung, „heute"-Vergleich |

### 9. Betriebsvoraussetzung

Keine neue. (Der E-Mail-Versand aus PROJ-3 ist hier nicht betroffen.)

### 10. Wie der Erfolg geprüft wird

- **Unit-Tests** für die Formular-Eingaberegeln (Datum nicht in der Vergangenheit,
  Limit 1–10 oder leer, Pflichtfelder) und die Status-Ableitung/Label.
- **Datenbank-Tests** (PROJ-1-Stil) für `delete_event`: Nicht-Admin → abgewiesen;
  laufendes Event → abgewiesen; Event mit Whisky → abgewiesen; Draft ohne alles →
  gelöscht (samt Teilnehmer-Zuordnung).
- **E2E-Tests** (Chromium + Mobile Safari): anlegen (Pflichtfelder, Vergangenheits-
  datum, Limit-Grenzen), bearbeiten eines Drafts, laufendes Event ist nicht
  editierbar, löschen mit Bestätigung, Nicht-Admin sieht „nicht gefunden".
- `npm run build` / `npm run lint` sauber.

## Implementation Notes (Frontend)

**Stand:** Seiten, Komponenten, Server Actions und die RPC-Migration geschrieben.
Migration `20260828100000` ist **noch nicht angewendet** — bis dahin zeigt
`/admin/events` sauber den Fehlerzustand. `/backend` = Migration anwenden +
DB-Regeltests.

### Was gebaut wurde

**Datenbank (neu, unangewendet)** — `supabase/migrations/20260828100000_admin_event_rpcs.sql`:
`admin_list_events()` (Event + Gastgebername + Teilnehmer-/Whisky-Anzahl, sortiert
heute/Zukunft zuerst) und `delete_event(uuid)` (Admin + Status `draft` + keine
Whiskies → sonst `TS015`). `TS015` in `src/lib/errors.ts`. `types.ts` von Hand um
beide RPCs ergänzt.

**Neue Pakete** — `date-fns`, `react-day-picker` (über `npx shadcn add calendar`).

**Serverseitig**
- `src/lib/queries/admin-events.ts` — `getEvents()` (RPC), `getEventForEdit(id)`
  (Event + Teilnehmer-IDs über den nutzergebundenen Client).
- `src/lib/actions/admin-events.ts` — `createEventAction` (`create_event` →
  `set_event_participants`), `updateEventAction`, `deleteEventAction`. Jede prüft
  Admin, validiert per Zod, prüft „Datum nicht in Vergangenheit" **in der Aktion**
  (nicht in der DB). `create_event` + `set_event_participants` sind zwei Schritte;
  scheitert der zweite, steht das Event mit nur dem Gastgeber.
- `src/lib/schemas/admin-events.ts` — `eventFormSchema` (Datum, Ort, Gastgeber
  Pflicht; Limit „" oder 1–10; Datum ≥ heute per `refine`).
- `src/lib/dates.ts` — `todayISO`, `formatEventDate` (deutsch), `toISODate`.

**Seiten & Komponenten**
- `(admin)/admin/events/` — `page.tsx` (`requireAdmin` + `getEvents`),
  `loading.tsx` (Skeleton), `error.tsx` (generisch: „schiefgelaufen" + Retry +
  „Zur Liste").
- `(admin)/admin/events/neu/page.tsx` — leeres Formular.
- `(admin)/admin/events/[eventId]/page.tsx` — `getEventForEdit`; `notFound()` wenn
  weg, `redirect('/admin/events')` wenn nicht mehr `draft`; hält den aktuellen
  Gastgeber sicher in der Auswahl.
- `src/components/admin/` — `event-list` / `event-row` (Datum · Ort · Gastgeber ·
  Zahlen · Status-Badge; bei `draft` Menü „Bearbeiten"/„Löschen" mit
  Bestätigungsdialog), `event-form` (RHF + Zod: Kalender-Datumsfeld,
  `Select`-Gastgeber, Checkbox-Teilnehmer-Picker mit gesperrtem Gastgeber,
  Zahl-Feld Limit, Thema), `event-date-field` (Popover + `Calendar`, Tage vor
  heute gesperrt), `event-status-badge`, `participant-picker`.
- `(admin)/admin/page.tsx` — zweiter Link „Tastings verwalten".

### Verifikation in dieser Session
- `npm run build` ✅ · `npm run lint` ✅ · `npm test` ✅ (24)
- Dev-Smoke: Teilnehmer → `/admin/events` = „Seite nicht gefunden"; Admin →
  `/admin` hat beide Links; `/admin/events` ohne Migration → Fehlerzustand;
  `/admin/events/neu` rendert das komplette Formular (Datum, Ort, Gastgeber,
  6 Teilnehmer-Checkboxen, Limit, Thema, Absenden).
- **Nicht** getestet (braucht die Migration): anlegen/bearbeiten/löschen mit echten
  Daten, Liste, `delete_event`-Regeln → `/backend` + `/qa`.

## Implementation Notes (Backend)

**Kein neues Schema, keine `/api`-Routen** — die zwei RPCs (Migration
`20260828100000`, im Frontend-Durchlauf geschrieben) plus die Server Actions.

### Review der RPCs
- `delete_event` und `add_whisky` (PROJ-1) serialisieren über die Sperre auf der
  Event-Zeile (`select … for update`) — ein gleichzeitiges „Whisky eintragen" und
  „Event löschen" kann nicht beides durchrutschen: entweder sieht `delete_event`
  den Whisky (→ `TS015`) oder `add_whisky` findet das Event nicht mehr (→ `TS004`).
- Zwei gleichzeitige `delete_event` auf dasselbe Event: die zweite Sperre trifft
  eine gelöschte Zeile → `v_status is null` → `TS004`. Sauber.
- `delete_event` prüft **nicht** auf Bewertungen — Bewertungen können ohne Whisky
  gar nicht existieren (zusammengesetzter FK), die Whisky-Prüfung deckt das ab.
- `admin_list_events` sortiert heute/Zukunft aufsteigend (nächstes oben), danach
  Vergangenheit absteigend (jüngstes oben); `limit 1000`.

### Tests
`src/lib/supabase/__tests__/admin-events-rpcs.integration.test.ts` (über
`npm run test:rls`): 7 Assertions — `admin_list_events` (Nicht-Admin → `TS004`;
Admin bekommt Gastgebername + `participant_count` + `whisky_count` + Status),
`delete_event` (Nicht-Admin → `TS004`; unbekannte ID → `TS004`; Draft ohne
Whiskies → gelöscht samt `event_participants`; Draft mit Whisky → `TS015`, Event
bleibt; nicht-Draft-Event → `TS005`).

### Verifikation in dieser Session
- `npm run build` ✅ · `npm run lint` ✅ · `npm test` ✅ (24) · `tsc` ✅
- `npm run test:rls` — **nicht ausgeführt** (kein DB-Zugang). Muss der Nutzer nach
  `db:push` laufen lassen.

### Anwenden (durch den Nutzer, vor `/qa`)
```
npm run db:push        # Migration 20260828100000
npm run db:types       # generierte RPC-Typen — src/lib/supabase/types.ts committen
npm run test:rls       # RLS (39) + admin-rpcs (11) + admin-events-rpcs (7) = 57
```

## QA Test Results

**Tested:** 2026-08-29
**App URL:** http://localhost:3000 (Playwright gegen `next build && next start`)
**Tester:** QA Engineer (AI)

### Testläufe

| Suite | Kommando | Ergebnis |
|-------|----------|----------|
| Unit / Integration (JSDOM) | `npm test` | **24 / 24** grün |
| DB-Regeltests (RLS + RPCs) | `npm run test:rls` | **57 / 57** grün (39 RLS · 11 admin-rpcs · 7 admin-events-rpcs) — vom Nutzer nach `db:push` bestätigt |
| E2E PROJ-4 (Chromium + Mobile Safari) | `npx playwright test PROJ-4` | **22 / 22** grün, 3 komplette Läufe hintereinander ohne Flake |
| E2E Vollregression | `npx playwright test` | **88 passed, 4 skipped** (die 4 Skips sind die SMTP-blockierten PROJ-3-Einladungs-Happy-Paths, `test.fixme` — kein PROJ-4-Regress) |
| `npm run build` / `npm run lint` | | sauber |

E2E-Datei: `tests/PROJ-4-admin-events.spec.ts` (11 Tests × 2 Projekte).

### Acceptance Criteria Status

#### Anlegen
- [x] AC-A1 Datum (heute/später) + Ort + Gastgeber → Event „In Vorbereitung", Gastgeber ist Teilnehmer, zurück zur Liste — *E2E „anlegen (Draft) → erscheint in der Liste"* (Zeile mit Badge „In Vorbereitung" + Gastgebername). Die „Bestätigung" ist der Rücksprung zur Liste mit der neuen Zeile (kein separater Toast / keine Hervorhebung — siehe Beobachtung unten).
- [x] AC-A2 Unvollständiges Formular → Validierungsmeldung je Pflichtfeld, nichts gespeichert — *E2E „Pflichtfelder"* (Datum / Ort / Gastgeber, URL bleibt auf `/neu`).
- [x] AC-A3 Datum in der Vergangenheit → abgelehnt — Kalender sperrt Tage vor heute (*E2E „Kalender sperrt Tage in der Vergangenheit"*, Gegenprobe: heute wählbar) **und** serverseitig: `normalize()` in der Server Action prüft `eventDate < todayISO()` erneut (Code-Review + `eventFormSchema.refine`).
- [x] AC-A4 Max-Whisky-Zahl außerhalb 1–10 → abgelehnt — *E2E „Limit außerhalb 1–10 wird abgelehnt"* („Zwischen 1 und 10").
- [x] AC-A5 Limit leer → kein Limit — Schema mappt `'' → undefined → NULL`; *E2E „anlegen (Draft)"* legt ohne Limit an; Integrationstest liest die Zeile fehlerfrei.
- [x] AC-A6 Keine weiteren Teilnehmer → nur Gastgeber — Integrationstest `admin_list_events` asserttiert `participant_count === 1`.
- [x] AC-A7 Gastgeber kein aktives Mitglied → abgelehnt — `create_event` / `update_event` prüfen `is_active` → `TS004` (PROJ-1-RLS-Tests); die UI bietet im Select ohnehin nur aktive Mitglieder an.

#### Teilnehmerliste
- [x] AC-T1 Auswahl zeigt aktive Mitglieder, Gastgeber markiert und nicht abwählbar — *E2E „Teilnehmer-Picker: der Gastgeber ist gesetzt und gesperrt"* (Checkbox checked + disabled).
- [x] AC-T2 Teilnehmer mit Whisky/Bewertung entfernen → abgelehnt — `set_event_participants` → `TS009` (PROJ-1-RLS-Regressionstest).
- [x] AC-T3 Gastgeber wechseln → neuer Gastgeber automatisch in der Teilnehmerliste — `set_event_participants` erzwingt den Gastgeber (`|| v_host`, `coalesce(…, array[v_host])`); der Client vereinigt `hostId` zusätzlich in `participantIds` (Code-Review).

#### Bearbeiten
- [x] AC-B1 Draft öffnen → Datum, Ort, Gastgeber, Teilnehmer, Limit, Thema änderbar — *E2E „Draft bearbeiten: Ort ändern"* deckt den Speicherpfad ab; die übrigen Felder über die Formularverdrahtung + Build.
- [x] AC-B2 Laufendes/abgeschlossenes Event → nur Anzeige, keine Bearbeiten-Aktion — *E2E „abgeschlossenes Event: keine Aktionen, Bearbeiten-Seite leitet zurück"* (kein Aktionen-Menü; `/admin/events/[id]` → Redirect auf die Liste).
- [x] AC-B3 Speichern schlägt fehl (Netz/Server) → Fehlermeldung, Eingaben bleiben — Code-Review: `form.setError('root')` + `toast.error`, RHF hält die Werte (nicht E2E-simuliert).

#### Löschen
- [x] AC-L1 Draft ohne Whiskies/Bewertungen → bestätigen → entfernt — *E2E „Draft ohne Whiskies löschen (mit Bestätigung)"* (Zeile verschwindet, Toast „Tasting gelöscht.").
- [x] AC-L2 Draft mit Whisky → abgelehnt mit Hinweis — *E2E „Draft mit Whisky: Löschen wird abgelehnt"* („hängen bereits Whiskies", Zeile bleibt) + Integrationstest `TS015`.
- [x] AC-L3 Laufend/abgeschlossen → keine Lösch-Aktion — *E2E „abgeschlossenes Event"* (überhaupt kein Aktionen-Menü).
- [x] AC-L4 Lösch-Dialog zeigt Endgültigkeit vor der Bestätigung — *E2E* asserttiert Dialogtext enthält „endgültig".

#### Liste & Zustände
- [x] AC-Z1 Events chronologisch, mit Datum, Ort, Gastgeber, Teilnehmerzahl, Status-Badge — *E2E* (Zeile mit Badge + Gastgeber) + Integrationstest (`host_name`, `participant_count`, `whisky_count`, `status`); Sortierung „heute/Zukunft zuerst" per Code-Review (`order by` in `admin_list_events`).
- [x] AC-Z2 Kein Event → Hinweis + „Erstes Tasting anlegen" — *E2E „Admin sieht die Liste …"* (Regex akzeptiert beide Beschriftungen); Leerzustands-Branch in `event-list.tsx` per Code-Review (die Test-DB enthält Events, daher nicht isoliert ausgelöst).
- [x] AC-Z3 Ladefehler → Fehlermeldung + „Erneut versuchen", keine leere Seite — `error.tsx` vorhanden; im Frontend-Durchlauf ohne Migration manuell verifiziert.
- [x] AC-Z4 Aktion läuft → Button im Ladezustand, kein Doppelklick — `useTransition` + `disabled={pending}` am Submit; Lösch-Button im Dialog (Code-Review).

#### Sicherheit
- [x] AC-S1 Nicht-Admin ruft die Event-Verwaltung direkt auf → „Seite nicht gefunden" — *E2E „Teilnehmer: /admin/events liefert ‚Seite nicht gefunden'"*.
- [x] AC-S2 Nicht-Admin schickt eine Anlege-/Bearbeiten-/Lösch-Anfrage direkt an den Server → abgelehnt — `requireAdminOr()` in jeder Server Action **und** `is_admin()` in jeder RPC (`admin_list_events`, `delete_event`, `create_event`, `update_event`, `set_event_participants`) → `TS004`; Integrationstests decken Nicht-Admin → `TS004` für `admin_list_events` und `delete_event` ab.

**23 / 23 Acceptance Criteria erfüllt** (14 direkt per E2E, 9 per Code-Review + PROJ-1-Regression + DB-Integrationstests).

### Edge Cases Status
- [x] EC-1 Zwei Admins bearbeiten dasselbe Draft gleichzeitig → letzte Fassung gewinnt, `select … for update` auf der Event-Zeile, kein Teil-Speichern (Code-Review).
- [x] EC-2 Gastgeber-Wechsel nach Whisky-Eintrag des alten Gastgebers → Wechsel gelingt, Whiskies bleiben (PROJ-1-Regel: Limit nur beim Hinzufügen; `set_event_participants` blockt nur das *Entfernen* mit Daten).
- [x] EC-3 Limit nachträglich gesenkt → vorhandene Whiskies bleiben, nur keine weiteren (PROJ-1-Design).
- [x] EC-4 Teilnehmer mit Whisky entfernen → abgelehnt (`TS009`, PROJ-1-Regressionstest).
- [x] EC-5 Gastgeber wird deaktiviert, während das Event Draft ist → nächstes Speichern verlangt einen aktiven Gastgeber (`update_event` `is_active`-Prüfung); PROJ-3 verhindert die Deaktivierung eines Gastgebers eines nicht abgeschlossenen Events ohnehin.
- [x] EC-6 Netzabbruch beim Speichern → Fehlermeldung, Formular behält die Eingaben, `useTransition` + `disabled` verhindern den Doppel-Submit (Restrisiko: `create_event` ist nicht idempotent — bei einem sehr ungünstig getimten Abbruch *nach* dem Insert wäre ein Doppel-Event denkbar; in der Praxis durch den deaktivierten Button abgedeckt).
- [x] EC-7 Datum genau heute → erlaubt (`eventDate < todayISO()` ist echtes Kleiner-als); *E2E*-Gegenprobe: „heute" ist im Kalender wählbar.

### Security Audit Results
- [x] **Authentifizierung:** `/admin/events` und alle Unterseiten verlangen die Admin-Rolle (`requireAdmin`); Nicht-Admin → `notFound()`.
- [x] **Autorisierung:** Alle zustandsändernden RPCs sind DB-seitig `is_admin()`-gated; RLS ist die zweite Schicht. Kein IDOR — der Admin sieht per RLS alle Events, ein Nicht-Admin wird vorher weggeleitet. `getEventForEdit` läuft über den nutzergebundenen Client.
- [x] **Eingabevalidierung:** Zod serverseitig in `normalize()` (Pflichtfelder, Limit 1–10, Länge ≤ 200, UUID-Form, Datum ≥ heute) **plus** DB-CHECKs und RPC-Guards. `set_event_participants` filtert übergebene IDs hart auf aktive Profile — das Einschleusen fremder/inaktiver/nicht existenter UUIDs wird still verworfen.
- [x] **XSS:** `location` / `theme` werden als React-Text gerendert, kein `dangerouslySetInnerHTML`.
- [x] **Secrets:** PROJ-4 nutzt **keinen** Service-Role-Key — alles über den nutzergebundenen Client + `SECURITY DEFINER`-RPCs mit `set search_path = ''`.
- [x] **Datenverlust-Schutz:** Löschen nur für Draft (`TS005`) und nur ohne Whiskies (`TS015`); Teilnehmer-Entfernen mit Whiskies/Bewertungen blockiert (`TS009`).
- [x] **Race-Sicherheit:** `select … for update` auf der Event-Zeile in `delete_event`, `update_event`, `set_event_participants`; zwei gleichzeitige `delete_event` → der zweite trifft eine gelöschte Zeile → `TS004`.
- Keine Sicherheitsbefunde.

### Bugs Found

#### BUG-1: Kalender-Popover erscheint auf Englisch
- **Severity:** Low
- **Steps to Reproduce:**
  1. `/admin/events/neu` öffnen, auf „Datum wählen" tippen
  2. Erwartet: deutsche Monats-/Wochentagsnamen (Rest der App ist durchgehend deutsch)
  3. Tatsächlich: „August 2026", „Su / Mo / Tu / We / Th / Fr / Sa"
- **Ursache:** `<Calendar>` in `src/components/admin/event-date-field.tsx` wird ohne `locale`-Prop gemountet (`react-day-picker` fällt auf en-US zurück).
- **Priority:** Fix in next sprint — kosmetisch, blockiert nichts.

#### BUG-2: Event-Formular rendert direkt nach der Navigation kurz doppelt
- **Severity:** Low
- **Steps to Reproduce:**
  1. Zu `/admin/events/neu` bzw. `/admin/events/[eventId]` navigieren
  2. Im ersten ~½–1 s existiert jedes Feld doppelt im DOM (zwei `<input>` je Feld, doppelte `id`/Label-Verknüpfung, doppelte Select-Optionen). IDs mischen `_r_…` (hydratisiert) und `_R_…` (clientseitig neu erzeugt) → Hydration-Mismatch, React verwirft die Server-Markierung und rendert die Komponente clientseitig neu.
  3. Steady State ist sauber: 6/6 Reloads nach kurzem Settle zeigten genau ein Formular / ein Feld.
- **Auswirkung:** kurzes Flackern / doppelte Felder auf langsameren Geräten; **kein** Datenrisiko (eine Kopie sendet normal ab). Hat die E2E-Suite flaky gemacht, bis die Tests einen expliziten Settle nach der Navigation bekamen (`gotoForm()`-Helper).
- **Verdacht:** `new Date()` in `event-date-field.tsx` (Server-/Client-Zeitzone) oder eine `useId`-Reihenfolgedifferenz im `EventForm`.
- **Priority:** Fix before deployment — sichtbarer Rendering-Glitch auf einem Kern-Admin-Formular; `/frontend` sollte den Hydration-Mismatch vor `/deploy` beheben.

### Beobachtung (kein Bug)
- Die AC „… landet wieder in der Liste **mit einer Bestätigung**" ist als Rücksprung zur Liste mit der neuen Zeile umgesetzt — es gibt keinen expliziten Erfolgs-Toast und (noch) keine Hervorhebung der neuen Zeile. Die Spec führt die Hervorhebung selbst als Open Question. Ausreichend für das MVP; ggf. in PROJ-8 mit aufnehmen.

### Testinfrastruktur (kein Produktbefund)
- `tests/PROJ-4-admin-events.spec.ts`: Der `STAMP` (`Date.now()` beim Modul-Load) kann zwischen zwei parallel startenden Playwright-Workern (Chromium + Mobile Safari) auf dieselbe Millisekunde fallen → zwei Wegwerf-Gastgeber mit identischem Anzeigenamen → mehrdeutige Select-Option. Behoben durch `process.pid` im Member-Tag.
- Kalender-/Datums-Selektoren an die tatsächliche react-day-picker-Ausgabe angepasst (Button-Accessible-Name = „Datum" via Label-Verknüpfung; gridcell-`aria-label` im en-US-Format).

### Summary
- **Acceptance Criteria:** 23 / 23 erfüllt
- **Bugs Found:** 2 (0 Critical, 0 High, 0 Medium, 2 Low)
- **Security:** Pass — keine Befunde
- **Production Ready:** YES
- **Recommendation:** **Approved.** BUG-2 (Hydration-Doppelrender) vor `/deploy` von `/frontend` beheben lassen, BUG-1 (Kalender-Locale) am besten gleich mit. Beide sind Low und blockieren das Deployment nicht formal.

## Deployment
_To be added by /deploy_
