# PROJ-6: Gastgeber-Steuerung & Ablauf

## Status: Planned
**Created:** 2026-08-29
**Last Updated:** 2026-08-29

## Dependencies
- **Requires: PROJ-5 (Whisky-Erfassung)** — es müssen Whiskys mit Positionen
  existieren, damit sich eine Reihenfolge festlegen und ein Abend starten lässt.
- **Requires: PROJ-4 (Admin – Tasting-Events verwalten)** — das Event, sein
  Gastgeber und der Draft-Status entstehen dort.
- **Requires: PROJ-2** — App-Shell, Login, `requireHost(eventId)` (Helper liegt
  schon vor, die Route entsteht hier), die „Tastings"-Liste (aus PROJ-5).
- **Baut auf PROJ-1** — die RPCs `update_event_host_fields`, `set_whisky_order`,
  `start_event`, `close_round`, `close_event`, `rating_progress`, der Helper
  `is_event_host`, die Zeitstempel-/Status-Constraints, die
  „höchstens ein aktives Event"-Regel.

## Kontext

Der **Gastgeber** ist die Person, die den Abend fährt: er schenkt aus, moderiert
und schaltet weiter. PROJ-6 ist sein Steuerpult — eine Seite pro Abend, deren
Inhalt sich nach dem Status richtet.

Bis hierher hat der Admin das Event angelegt (PROJ-4) und die Runde ihre Whiskys
eingetragen (PROJ-5). Jetzt legt der Gastgeber die **Ausschankreihenfolge** fest
(so, dass niemand sie errät), **startet** den Abend, schaltet nach jedem Whisky
**eine Runde weiter** und **schließt** am Ende ab. Erst der Abschluss löst die
Namen auf und friert die Bewertungen ein.

Die Blindheit bleibt gewahrt: die Teilnehmer sehen weiterhin nur „Whisky 3 von 8".
Dass alle Geräte beim Weiterschalten automatisch mitspringen, ist **PROJ-8**
(Realtime). Die eigentliche Bewertung ist **PROJ-7**, die Rangliste nach dem
Abschluss ist **PROJ-9**.

## User Stories

- Als **Gastgeber** möchte ich die Ausschankreihenfolge der Whiskys festlegen —
  auch per Zufall —, damit die Runde blind verkostet und niemand die Reihenfolge
  errät.
- Als **Gastgeber** möchte ich Thema, Info zum Essen und eigene Anmerkungen zum
  Abend hinterlegen, damit die Runde die Eckdaten auf dem Dashboard sieht.
- Als **Gastgeber** möchte ich den Abend starten, wenn ausgeschenkt wird, damit
  die Bewertung für alle freigeschaltet ist.
- Als **Gastgeber** möchte ich nach jedem Whisky eine Runde weiterschalten, damit
  die Runde gemeinsam beim selben Glas ist.
- Als **Gastgeber** möchte ich sehen, wie viele Teilnehmer den aktuellen Whisky
  schon bewertet haben, damit ich weiß, wann ich weiterschalten kann.
- Als **Gastgeber** möchte ich den Abend abschließen, damit die Namen aufgelöst
  werden und die Rangliste steht — im Wissen, dass das endgültig ist.

## Out of Scope

- **Realtime-Sync auf die Geräte der übrigen Teilnehmer** (automatisches
  Mitspringen beim Rundenwechsel) → PROJ-8.
- **Die Bewertungsansicht selbst** (Nase/Geschmack/Notizen eingeben) → PROJ-7.
- **Die Ergebnis-/Ranglistenansicht** nach dem Abschluss → PROJ-9. PROJ-6 zeigt
  nach dem Abschluss nur einen Platzhalter mit Verweis.
- **Reihenfolge während des laufenden Abends ändern** — Drag & Drop nur solange
  „In Vorbereitung". (Die DB erlaubt das Umsortieren der noch nicht
  ausgeschenkten Positionen; PROJ-6 nutzt es bewusst nicht.)
- **Einen laufenden Abend abbrechen / zurück zu „In Vorbereitung"** — es gibt kein
  Zurück. Ein vorzeitiges Ende deckt „Tasting abschließen" pragmatisch ab. Ein
  echter Totalabbruch (samt Entscheidung über schon abgegebene Bewertungen) ist
  eine mögliche spätere Erweiterung (Open Question).
- **Einen einzelnen Schritt zurückschalten** — nicht vorgesehen; Bewertungen
  bleiben bis zum Event-Abschluss offen, ein versehentliches Weiterschalten sperrt
  also niemanden aus.
- **Eckdaten nach dem Abschluss ändern** — dann sind sie Teil der Historie und nur
  noch Anzeige.
- **Whiskys hinzufügen/entfernen** → das bleibt PROJ-5 (und geht ohnehin nur im
  Draft).
- **Gastgeber wechseln** → Admin in PROJ-4.
- **Neutraler Helfer, der statt des Gastgebers steuert** → PROJ-11.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einstieg & Zugang

- [ ] Angenommen der Nutzer ist Gastgeber eines Events, wenn er die „Tastings"-Liste
      öffnet, dann hat die Zeile dieses Events zusätzlich die Aktion „Steuern", die
      auf `/tastings/[eventId]/gastgeber` führt.
- [ ] Angenommen der Nutzer ist weder Gastgeber dieses Events noch Admin, wenn er
      `/tastings/[eventId]/gastgeber` aufruft, dann erhält er „Seite nicht
      gefunden".
- [ ] Angenommen der Admin öffnet `/tastings/[eventId]/gastgeber` für ein beliebiges
      Event, wenn die Seite lädt, dann kann er dieselben Steuer-Aktionen ausführen
      wie der Gastgeber.
- [ ] Angenommen das Event ist abgeschlossen, wenn der Gastgeber die Steuer-Seite
      öffnet, dann sieht er nur einen Hinweis „Der Abend ist abgeschlossen" mit
      Verweis auf die Ergebnisse, keine Steuer-Aktionen.

### Eckdaten (Thema, Essen, Anmerkungen)

- [ ] Angenommen das Event ist in Vorbereitung oder läuft, wenn der Gastgeber
      Thema, Info zum Essen oder Anmerkungen einträgt und speichert, dann sind die
      Werte gespeichert und beim erneuten Laden vorhanden.
- [ ] Angenommen der Gastgeber lässt alle drei Felder leer, wenn er speichert, dann
      wird das ohne Fehler akzeptiert (alle drei sind optional).
- [ ] Angenommen das Event ist abgeschlossen, wenn der Gastgeber die Eckdaten
      ansieht, dann werden sie nur angezeigt und lassen sich nicht mehr ändern.

### Ausschankreihenfolge

- [ ] Angenommen das Event ist in Vorbereitung und es sind Whiskys eingetragen,
      wenn der Gastgeber die Steuer-Seite öffnet, dann sieht er die Whiskys als
      sortierbare Liste (Position + Name) in der aktuellen Reihenfolge.
- [ ] Angenommen die sortierbare Liste ist offen, wenn der Gastgeber einen Eintrag
      per Drag & Drop verschiebt und speichert, dann ist die neue Reihenfolge
      gespeichert.
- [ ] Angenommen die sortierbare Liste ist offen, wenn der Gastgeber „Zufällig
      mischen" wählt, dann wird die Anzeige-Reihenfolge einmal durchgewürfelt; sie
      wird erst mit „Speichern" bzw. beim Start übernommen und lässt sich vorher
      noch von Hand anpassen.
- [ ] Angenommen ein Bringer hat seinen Whisky entfernt, nachdem der Gastgeber die
      Seite geöffnet hat, wenn der Gastgeber eine veraltete Reihenfolge speichert,
      dann wird das abgelehnt mit dem Hinweis, dass die Reihenfolge nicht mehr zu
      den Whiskys passt, und die Seite muss neu geladen werden.
- [ ] Angenommen das Event läuft bereits, wenn der Gastgeber die Steuer-Seite
      öffnet, dann ist die Reihenfolge nur noch Anzeige, nicht mehr sortierbar.

### Tasting starten

- [ ] Angenommen das Event ist in Vorbereitung und mindestens ein Whisky ist
      eingetragen, wenn der Gastgeber „Tasting starten" wählt, dann wechselt das
      Event in den Status „läuft", der erste Whisky ist aktiv, und die Seite zeigt
      die Lauf-Ansicht.
- [ ] Angenommen es ist noch kein Whisky eingetragen, wenn der Gastgeber die
      Steuer-Seite ansieht, dann ist „Tasting starten" deaktiviert mit dem Hinweis
      „Es ist noch kein Whisky eingetragen."
- [ ] Angenommen bereits ein anderes Tasting läuft, wenn der Gastgeber „Tasting
      starten" wählt, dann wird der Start abgelehnt mit dem Hinweis, dass zuerst das
      laufende Tasting abgeschlossen werden muss.
- [ ] Angenommen die Whisky-Positionen haben eine Lücke, wenn der Gastgeber „Tasting
      starten" wählt, dann wird der Start abgelehnt mit einem entsprechenden
      Hinweis.

### Runde weiterschalten

- [ ] Angenommen das Tasting läuft und der aktuelle Whisky ist nicht der letzte,
      wenn der Gastgeber „Weiter zu Whisky N von M" wählt, dann ist danach der
      nächste Whisky aktiv.
- [ ] Angenommen das Tasting läuft, wenn der Gastgeber die Lauf-Ansicht betrachtet,
      dann sieht er für den aktuellen Whisky „X von Y haben bewertet", aktualisiert
      beim Laden, nach jedem Weiterschalten und über einen „Aktualisieren"-Button.
- [ ] Angenommen zwei Geräte schalten kurz nacheinander weiter, wenn die zweite
      Aktion verarbeitet wird, dann wird sie abgelehnt mit dem Hinweis „Die Runde
      wurde bereits weitergeschaltet" und es entsteht kein Doppelsprung.
- [ ] Angenommen der aktuelle Whisky ist der letzte, wenn der Gastgeber die
      Lauf-Ansicht betrachtet, dann ersetzt „Tasting abschließen" den
      „Weiter"-Button als Hauptaktion.

### Tasting abschließen

- [ ] Angenommen das Tasting läuft, wenn der Gastgeber „Tasting abschließen" wählt,
      dann erscheint ein Bestätigungsdialog, der darauf hinweist, dass die Namen
      aufgelöst werden, die Rangliste erscheint, keine Bewertung mehr änderbar ist
      und das nicht rückgängig gemacht werden kann.
- [ ] Angenommen der Gastgeber bestätigt den Abschluss, wenn die Aktion durchläuft,
      dann wechselt das Event in „abgeschlossen" und die Seite leitet auf die
      Ergebnisse (bzw. zeigt bis PROJ-9 einen Platzhalter „Abend abgeschlossen").
- [ ] Angenommen das Tasting ist mitten im Ablauf (nicht beim letzten Whisky), wenn
      der Gastgeber „Tasting abschließen" wählt und bestätigt, dann wird der Abend
      trotzdem abgeschlossen (vorzeitiges Ende ist erlaubt).
- [ ] Angenommen das Event wurde bereits von einem anderen Gerät abgeschlossen,
      wenn der Gastgeber „Tasting abschließen" bestätigt, dann wird die Aktion
      abgelehnt mit dem Hinweis, dass der Abend schon abgeschlossen ist.

### Zustände & Rückmeldungen

- [ ] Angenommen eine Steuer-Aktion läuft (starten / weiterschalten / abschließen /
      Reihenfolge speichern / Eckdaten speichern), wenn der Gastgeber wartet, dann
      ist die Schaltfläche im Ladezustand und ein zweiter Klick nicht möglich.
- [ ] Angenommen eine Aktion schlägt fehl (Netz/Server), wenn der Gastgeber sie
      auslöst, dann erscheint eine konkrete deutsche Fehlermeldung, der Zustand
      bleibt unverändert und die Aktion ist erneut möglich.
- [ ] Angenommen die Steuer-Seite wird geladen und die Daten sind nicht abrufbar,
      wenn sie rendert, dann erscheint ein Fehlerhinweis mit erneutem Ladeversuch
      statt einer leeren Seite.
- [ ] Angenommen das Event ist in Vorbereitung und es sind keine Whiskys
      eingetragen, wenn der Gastgeber den Reihenfolge-Block ansieht, dann steht dort
      „Noch keine Whiskys — die Teilnehmer tragen sie selbst ein."

### Sicherheit

- [ ] Angenommen ein Nutzer ist nicht Gastgeber/Admin dieses Events, wenn er eine
      Steuer-Anfrage (starten / weiterschalten / abschließen / Reihenfolge /
      Eckdaten) direkt an den Server schickt, dann wird sie abgelehnt, weil die
      Rolle serverseitig geprüft wird.
- [ ] Angenommen ein Teilnehmer ruft `rating_progress`-Daten für ein Event ab,
      dessen Gastgeber er nicht ist, wenn die Anfrage verarbeitet wird, dann wird
      sie abgelehnt (die Zählwerte sieht nur Gastgeber/Admin).

## Edge Cases

- **Kein Whisky eingetragen (Vorbereitung).** Erwartung: Reihenfolge-Block zeigt
  den Leerzustand, „Tasting starten" ist deaktiviert.
- **Admin wechselt den Gastgeber (PROJ-4), während der alte auf der Seite ist.**
  Erwartung: beim nächsten Laden „nicht gefunden" für den alten, Zugriff für den
  neuen; laufende Aktionen des alten schlagen serverseitig fehl.
- **Ein Bringer entfernt seinen Whisky, während der Gastgeber sortiert.**
  Erwartung: das Speichern der Reihenfolge schlägt fehl („passt nicht mehr zu den
  Whiskys"), die Seite muss neu geladen werden. Kein Teil-Speichern.
- **Zwei Geräte (Gastgeber + Admin, oder Gastgeber auf zwei Geräten) lösen
  dieselbe Aktion aus.** Erwartung: die zweite Aktion läuft ins Leere mit klarer
  Meldung (bereits weitergeschaltet / es läuft schon ein Tasting / schon
  abgeschlossen). Kein Doppelsprung, kein Absturz.
- **Netzwerkabbruch beim Weiterschalten.** Erwartung: Fehlerhinweis, die Position
  bleibt unverändert, erneuter Versuch möglich; die optimistische Positionsprüfung
  verhindert einen versehentlichen Doppelsprung.
- **„Zufällig mischen" und dann Seite verlassen ohne Speichern.** Erwartung: die
  Reihenfolge ist unverändert — gemischt wird nur die Anzeige, endgültig erst beim
  Speichern/Start.
- **Gastgeber schließt den letzten Whisky ab und tippt dann noch „Weiter".**
  Erwartung: abgelehnt mit dem Hinweis, dass jetzt nur noch der Abschluss folgt.
- **Event über das Admin-Backend gelöscht (nur im Draft möglich), während der
  Gastgeber die Seite offen hat.** Erwartung: nächste Aktion → „nicht gefunden" /
  Fehlerhinweis, keine weiße Seite.

## Technical Requirements

- **Rollenprüfung serverseitig:** Alle Steuer-Aktionen laufen über die
  PROJ-1-RPCs, die `is_event_host` bzw. `is_admin` selbst prüfen. Das Frontend
  verlässt sich nicht auf eigene Prüfungen; die Seite selbst ist über
  `requireHost(eventId)` abgesichert.
- **Reihenfolge nur im Draft editierbar; Weiterschalten/Abschließen nur im
  laufenden Event.** Ergibt sich aus den RPC-Regeln, wird im UI gespiegelt.
- **Optimistische Sperre beim Weiterschalten:** die erwartete aktuelle Position
  wird mitgeschickt; eine veraltete Position führt zu einer klaren Meldung statt zu
  einem Doppelsprung.
- **Höchstens ein Tasting gleichzeitig aktiv** — beim Start durchgesetzt (PROJ-1).
- **Kein Realtime in PROJ-6.** Der Bewertungs-Fortschritt und der Status werden
  beim Laden / nach Aktionen / auf Knopfdruck aktualisiert. Live-Sync ist PROJ-8.
- **Mobile-first:** die Lauf-Ansicht muss mit einer Hand bedienbar sein — ein
  großer „Weiter"-Button, klar beschriftet („Weiter zu Whisky 4 von 8").
- **Zustände** (nach `docs/design-system.md`): Laden, Ladefehler mit Retry,
  Aktion-läuft, Leerzustand (keine Whiskys), Nach-Abschluss-Platzhalter.
  Zerstörende/endgültige Aktion (Abschluss) hinter `AlertDialog`.

## Open Questions

- [ ] Braucht die Runde einen echten **Totalabbruch** eines laufenden Abends
      (neue Backend-Aktion, plus Entscheidung: bleiben abgegebene Bewertungen
      erhalten oder werden sie verworfen)? *(Tendenz: erst nach dem ersten echten
      Einsatz entscheiden; „Tasting abschließen" deckt den Notfall vorerst ab.)*
- [ ] Soll die Lauf-Ansicht dem Gastgeber pro Whisky auch die **Namen** der noch
      fehlenden Bewerter zeigen (statt nur „5 von 7")? *(Tendenz: nein — reine Zahl
      reicht und ist datensparsamer; ggf. in PROJ-8 nachrüsten.)*
- [ ] Soll „Zufällig mischen" mehrfach hintereinander erlaubt sein, oder nach dem
      ersten Mischen gesperrt, bis gespeichert wurde? *(Tendenz: beliebig oft — der
      Gastgeber probiert, bis es passt.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Seite `/tastings/[eventId]/gastgeber`, Einstieg über eine „Steuern"-Aktion an der Zeile des Events in der „Tastings"-Liste | Symmetrisch zu `/tastings/[eventId]/whiskies` (PROJ-5); kein eigener Nav-Punkt, weil nicht jeder Nutzer je Gastgeber ist | 2026-08-29 |
| Seiteninhalt richtet sich nach dem Status: Vorbereitung (Eckdaten + Reihenfolge + Start) / läuft (Fortschritt + Weiter/Abschließen) / abgeschlossen (Platzhalter) | Ein Bildschirm pro Rolle, der immer den nächsten sinnvollen Schritt zeigt | 2026-08-29 |
| Drag & Drop nur solange „In Vorbereitung" | Hält die Lauf-Ansicht ruhig (großer Button, kein Verschieben mit Glas in der Hand) und vermeidet die Frage, was passiert, wenn eine gerade bewertete Position wegrutscht | 2026-08-29 |
| „Zufällig mischen"-Button zusätzlich zum manuellen Sortieren | Die Eintragereihenfolge aus PROJ-5 ist erahnbar; ein Klick würfelt sie durch, der Gastgeber justiert danach ggf. nach | 2026-08-29 |
| Kein Bestätigungsdialog beim Start und beim Weiterschalten | Start ist nicht zerstörend; ein Dialog bei jeder von 8 Runden nervt. Stattdessen eindeutige Button-Beschriftung („Weiter zu Whisky 4 von 8") | 2026-08-29 |
| Kein Einzelschritt zurück, kein Abbruch eines laufenden Abends | PROJ-1 kennt nur vorwärts; Bewertungen bleiben bis zum Event-Abschluss offen, ein Fehlklick sperrt also niemanden aus. Ein echter Abbruch bräuchte eine neue Aktion + Datenentscheidung → später | 2026-08-29 |
| „Tasting abschließen" ist immer verfügbar, solange das Event läuft | Deckt das vorzeitige Ende („wir hören auf") ohne neue Backend-Aktion ab; beim letzten Whisky wird es zur Hauptaktion | 2026-08-29 |
| „Tasting abschließen" hinter `AlertDialog` mit dem Hinweis auf Endgültigkeit | Auflösung der Namen + Einfrieren der Bewertungen ist irreversibel | 2026-08-29 |
| Eckdaten (Thema, Essen, Anmerkungen) bearbeitbar in Vorbereitung **und** während des Laufs, nach dem Abschluss nur Anzeige | „Info zum Essen" / „Anmerkungen" ergänzt man oft erst am Abend; nach dem Abschluss sind sie Historie | 2026-08-29 |
| Bewertungs-Fortschritt als reine Zahl „X von Y", kein Zwang zum Vollständig-Sein vor dem Weiterschalten | Der Gastgeber moderiert und entscheidet situativ; die Zahl ist Entscheidungshilfe, kein Tor | 2026-08-29 |
| Kein Realtime in PROJ-6 (Aktualisierung beim Laden / nach Aktion / per Button) | Die Realtime-Schicht ist PROJ-8 und zieht diese Ansicht dann mit; PROJ-6 zuerst gegen echten Zustand testbar machen | 2026-08-29 |
| Der Admin kann dieselben Steuer-Aktionen ausführen wie der Gastgeber | Die PROJ-1-RPCs erlauben `is_admin OR is_event_host`; nützlich als Notnagel, wenn der Gastgeber ausfällt | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
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
