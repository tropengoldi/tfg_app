# PROJ-6: Gastgeber-Steuerung & Ablauf

## Status: In Progress
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
- [ ] Soll `getMyTastings` (PROJ-5) künftig generell die Gastgeber-ID mitliefern,
      oder reicht ein abgeleitetes „istGastgeber"-Flag für die „Steuern"-Aktion?
      *(Detail für `/frontend`.)*
- [ ] „Aktualisieren" für den Bewertungs-Fortschritt: die ganze Seite neu
      berechnen oder nur den Zählwert nachladen? *(Tendenz: ganze Seite — einfacher,
      bei einem Knopfdruck egal.)*

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
| PROJ-6 ist Frontend-only — keine neue Migration, keine RPC | Alle fünf Zustandsübergänge + der Bewertungsfortschritt stehen aus PROJ-1; `requireHost(eventId)` (= Gastgeber oder Admin) liegt aus PROJ-2 vor | 2026-08-29 |
| Umsortieren über „nach oben / nach unten"-Buttons + „Zufällig mischen", **kein** Drag & Drop / keine DnD-Bibliothek | Mobil, einhändig, bei gedämpftem Licht sind zwei große Tap-Ziele zuverlässiger als eine Zieh-Geste; keine neue Abhängigkeit; von Haus aus barrierefrei. Weicht bewusst von der Spec-Formulierung „Drag & Drop" ab | 2026-08-29 |
| Reihenfolge lebt bis „Speichern" nur im Browser; „Tasting starten" speichert eine noch offene Reihenfolge automatisch mit | Der Gastgeber probiert mehrere Anordnungen (v. a. mit „Zufällig mischen"); ein Speichern pro Klick wäre unnötiger Netzverkehr | 2026-08-29 |
| `close_round` bekommt die aktuell angezeigte Position als erwarteten Wert mit | Nutzt PROJ-1s optimistische Sperre; die zweite von zwei parallelen Aktionen bekommt „bereits weitergeschaltet" statt eines Doppelsprungs | 2026-08-29 |
| Bewertungsfortschritt per „Aktualisieren"-Button (Seite neu berechnen), kein Polling, kein Realtime | Realtime ist PROJ-8 und zieht diese Ansicht dann mit; PROJ-6 zuerst gegen echten Zustand testbar machen | 2026-08-29 |
| Einstiegspunkt nur an der „Tastings"-Zeile des Gastgebers; kein eigener Admin-Einstieg aus `/admin/events` | Hält PROJ-6 klein; die Seite funktioniert für den Admin ohnehin per `requireHost` (direkte Adresse). Ein Admin-Link kann später ergänzt werden | 2026-08-29 |
| Mutationen als Server Actions in `src/lib/actions/host-control.ts`, jede mit Login-/Rollen-Vorabprüfung | Konsistent mit PROJ-4 / PROJ-5 | 2026-08-29 |
| Lesen über den nutzergebundenen Client (RLS) — Event-Eckdaten, Whiskys inkl. Namen (Gastgeber-Sicht), Bewertungsfortschritt per RPC | Kein Service-Schlüssel nötig; RLS `wd_select` gibt dem Gastgeber die Namen, die übrigen Teilnehmer sehen sie nicht | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** PROJ-6 ist reine Oberfläche. Eine neue Seite pro
> Abend, deren Inhalt sich nach dem Status richtet, dahinter die fünf
> Steuer-Aktionen, die PROJ-1 schon gebaut hat. Neue Pakete: keine.

### 1. Seitenstruktur

```
(app)-Bereich
└─ /tastings                          (aus PROJ-5) — an der Zeile eines Abends,
   │                                   dessen Gastgeber der Nutzer ist, zusätzlich
   │                                   die Aktion „Steuern"
   │
   └─ /tastings/[eventId]/gastgeber   Steuer-Seite (Zugang: Gastgeber oder Admin)
      │
      ├─ Status „In Vorbereitung"
      │   ├─ Eckdaten-Block   Thema · Info zum Essen · Anmerkungen  (+ „Speichern")
      │   ├─ Reihenfolge-Block
      │   │   ├─ Liste: Position · Whiskyname
      │   │   │   └─ pro Zeile: „nach oben" / „nach unten"
      │   │   ├─ Button „Zufällig mischen"
      │   │   ├─ Button „Reihenfolge speichern"  (nur wenn geändert)
      │   │   └─ Leerzustand: „Noch keine Whiskys — die Teilnehmer tragen sie ein."
      │   └─ Start-Block
      │       ├─ Checkliste: „N Whiskys eingetragen"
      │       └─ Button „Tasting starten"  (deaktiviert ohne Whisky)
      │
      ├─ Status „läuft"
      │   ├─ Eckdaten-Block  (weiter bearbeitbar)
      │   └─ Lauf-Block
      │       ├─ „Whisky 3 von 8"
      │       ├─ „5 von 7 haben bewertet"  + Button „Aktualisieren"
      │       ├─ Hauptaktion „Weiter zu Whisky 4 von 8"
      │       │     bzw. beim letzten Whisky „Tasting abschließen"
      │       ├─ Zweitaktion „Tasting abschließen"  (solange nicht letzter Whisky)
      │       └─ Reihenfolge nur noch als Anzeige, nicht sortierbar
      │
      └─ Status „abgeschlossen"
          └─ Platzhalter „Der Abend ist abgeschlossen." + Verweis auf die
             Ergebnisse (PROJ-9)

Bestätigungsdialog: nur vor „Tasting abschließen" (AlertDialog, „endgültig").
Lade- / Fehler- / Aktion-läuft-Zustände wie in PROJ-4 / PROJ-5.
```

**Neue Bausteine**

- Seite `/tastings/[eventId]/gastgeber` + `loading` + `error`.
- Komponenten unter `src/components/host/`: der Status-Router (`host-panel`), das
  Eckdaten-Formular, die Reihenfolge-Liste, der Start-Block, der Lauf-Block, der
  Abschluss-Dialog.
- Datenzugriff: eine Lese-Datei (Event-Eckdaten + Whiskys mit Namen +
  Bewertungs-Fortschritt), fünf Schreib-Aktionen, ein Eingabe-Schema für die
  Eckdaten.
- In PROJ-5s „Tastings"-Liste: die Zeile bekommt für den Gastgeber die
  „Steuern"-Aktion (die Abfrage `getMyTastings` liefert dazu die Gastgeber-ID mit).

### 2. Datenmodell (nichts Neues an Tabellen)

PROJ-6 nutzt ausschließlich, was PROJ-1 gebaut hat:

- **`tasting_events`** — Status, aktuelle Position, Thema, Info zum Essen,
  Anmerkungen des Gastgebers, Startzeit.
- **`whiskies`** — Position je Whisky (die der Gastgeber umsortiert).
- **`whisky_details`** — Name (der Gastgeber sieht ihn; die übrigen Teilnehmer
  erst nach dem Abschluss).
- **`ratings`** — nur **gezählt** (über die PROJ-1-Aktion „Bewertungsfortschritt"),
  nie im Detail.

Kein neues Feld, kein neuer Zustand. „Aktueller Whisky", „X von Y bewertet" und
„letzter Whisky?" sind abgeleitete Werte aus Position, Whisky-Anzahl und den
Zählwerten.

### 3. Die fünf Steuer-Aktionen — alle aus PROJ-1

| Aktion (Server Action) | ruft PROJ-1-Aktion | Regeln (in der Datenbank, nicht im Browser) |
|---|---|---|
| Eckdaten speichern | `update_event_host_fields` | Nur Gastgeber / Admin; Feldlängen (Thema ≤ 200, Essen ≤ 1000, Anmerkungen ≤ 2000) |
| Reihenfolge speichern | `set_whisky_order` | Nur Gastgeber / Admin; nur solange nicht abgeschlossen; die übergebene Reihenfolge muss **genau** zu den Whiskys des Events passen → sonst abgelehnt |
| Tasting starten | `start_event` | Nur Gastgeber / Admin; nur aus „In Vorbereitung"; ≥ 1 Whisky, lückenlose Positionen; **kein anderes Tasting darf laufen** |
| Weiter zur nächsten Runde | `close_round` (+ erwartete Position) | Nur Gastgeber / Admin; nur im laufenden Event; stimmt die erwartete Position nicht (zweites Gerät war schneller) → „bereits weitergeschaltet"; beim letzten Whisky → „jetzt nur noch abschließen" |
| Tasting abschließen | `close_event` | Nur Gastgeber / Admin; nur im laufenden Event |

Jede Server Action prüft zusätzlich vorab die Anmeldung und die
Gastgeber-/Admin-Rolle. Die Datenbank bleibt die eigentliche Schranke (Muster wie
PROJ-4 / PROJ-5). Kein Service-Schlüssel.

### 4. Reihenfolge umsortieren — ohne Drag-Bibliothek

Pro Zeile zwei große Buttons „nach oben" / „nach unten" (die oberste Zeile hat
kein „oben", die unterste kein „unten"). „Zufällig mischen" würfelt die
Anzeige-Liste einmal durch. Die Änderungen leben zunächst nur im Browser;
„Reihenfolge speichern" schickt die komplette Liste in Wunschreihenfolge an die
Datenbank. Beim „Tasting starten" wird eine noch nicht gespeicherte Reihenfolge
automatisch mitgespeichert.

Begründung für die Pfeile statt Drag & Drop: mobil, einhändig, bei gedämpftem
Licht sind zwei große Tap-Ziele zuverlässiger als eine Zieh-Geste; keine neue
Abhängigkeit; von Haus aus barrierefrei. Bei 7–10 Einträgen ist der
Komfortunterschied gering.

### 5. Kein Live-Update in PROJ-6

Die Seite lädt ihren Zustand serverseitig. Nach jeder Aktion wird die Seite neu
berechnet (die Aktion markiert sie als veraltet). Der Bewertungs-Fortschritt hat
zusätzlich einen „Aktualisieren"-Button, der genau diese Neuberechnung auslöst.
Das automatische Mitspringen aller Geräte beim Rundenwechsel ist PROJ-8 (Realtime)
und zieht diese Ansicht dann mit.

### 6. Wer kommt auf die Seite

- **Gastgeber:** über „Steuern" an der Zeile seines Abends in der
  „Tastings"-Liste. Der Link ist für den Gastgeber in jedem Status sichtbar (im
  Draft zum Vorbereiten, im Lauf zum Steuern, nach dem Abschluss führt er auf den
  Platzhalter).
- **Admin:** die Seite funktioniert für ihn per `requireHost` (= Gastgeber *oder*
  Admin) bei jedem Event. Ist der Admin selbst Gastgeber/Teilnehmer, sieht er
  „Steuern" ebenfalls in seiner Liste; andernfalls ruft er die Adresse direkt auf.
  Ein eigener Admin-Einstieg aus `/admin/events` ist bewusst nicht Teil von
  PROJ-6.

### 7. Zustände & Rückmeldungen (nach `docs/design-system.md`)

- **Laden:** Skeleton für Eckdaten + Liste bzw. Lauf-Block.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen".
- **Aktion läuft:** Button im Ladezustand, kein Doppelklick.
- **Aktion schlägt fehl:** konkrete deutsche Meldung, Zustand unverändert.
- **Leerzustand (keine Whiskys):** Hinweis im Reihenfolge-Block, „Tasting starten"
  deaktiviert.
- **Nach Abschluss:** Platzhalter mit Verweis auf die Ergebnisse.
- **Abschluss-Aktion:** `AlertDialog` mit dem Hinweis auf Endgültigkeit.

### 8. Neue Pakete

Keine. (`AlertDialog`, `Card`, `Button`, `Textarea`, `Input`, `Badge`,
`Skeleton`, `Progress` sind vorhanden; `sonner` für Toasts; `date-fns` für die
Datumsanzeige.)

### 9. Betriebsvoraussetzung

Keine neue.

### 10. Wie der Erfolg geprüft wird

- **Unit-Tests** für die reine Umsortier-Logik (nach oben/unten; „zufällig
  mischen" ändert nur die Reihenfolge, nicht die Menge) und die Ableitungen
  („letzter Whisky?", „Weiter"-Beschriftung, Eckdaten-Eingaberegeln).
- **Datenbank-Tests** (PROJ-1-Stil), soweit nicht schon durch PROJ-1 abgedeckt:
  Nicht-Gastgeber → jede Steuer-Aktion abgelehnt; `rating_progress` nur für
  Gastgeber/Admin; die optimistische Positionssperre bei `close_round`.
- **E2E-Tests** (Chromium + Mobile Safari): „Steuern" erscheint nur beim
  Gastgeber; Eckdaten speichern; umsortieren + „zufällig mischen" + speichern;
  starten (inkl. „kein Whisky" → deaktiviert); weiterschalten inkl. „X von Y
  bewertet"; letzter Whisky → „abschließen" wird Hauptaktion; abschließen mit
  Bestätigung → Platzhalter; Nicht-Gastgeber → „nicht gefunden".
- `npm run build` / `npm run lint` sauber.

## Implementation Notes (Frontend)

**Stand:** Seite, Komponenten, Queries und die fünf Server Actions geschrieben.
**Rein clientseitig lauffähig gegen das vorhandene PROJ-1-Backend** — alle
Zustandsübergänge (`update_event_host_fields`, `set_whisky_order`, `start_event`,
`close_round`, `close_event`) und `rating_progress` existieren. **Kein neuer
Backend-Schritt nötig** → nach diesem Durchlauf direkt `/qa`.

### Was gebaut wurde

**Reihenfolge-/Ablauf-Logik** — `src/lib/host-order.ts` (rein, unit-getestet, 12
Fälle in `host-order.test.ts`): `moveUp` / `moveDown` (unmutierend, Kanten
abgefangen), `shuffle` (Fisher-Yates, injizierbares `rng`), `sameOrder`,
`nextRoundLabel`, `isLastWhisky`.

**Eingaberegeln** — `src/lib/schemas/host.ts`: `eckdatenSchema` (Thema ≤ 200,
Essen ≤ 1000, Anmerkungen ≤ 2000, alle `''`-defaultend).

**Datenzugriff** — `src/lib/queries/host-control.ts`: `getHostControlData(eventId)`
liefert Event-Eckdaten + Status + `current_position`, die Whiskys mit Namen
(Gastgeber-Sicht, zwei Abfragen statt Embed wegen der doppelten FK-Beziehung
`whiskies`↔`whisky_details`) und — nur im laufenden Event — den
Bewertungs-Fortschritt für die aktuelle Position (`rating_progress`-RPC). Der
Zugriff ist vorher über `requireHost(eventId)` in der Seite geprüft.

**Server Actions** — `src/lib/actions/host-control.ts` (`'use server'`), jede mit
`requireHostOr(eventId)` (Login + `canAccessHostArea` = Gastgeber oder Admin) und
`messageForDbError`, revalidiert `/tastings/[eventId]/gastgeber`:
- `saveEckdatenAction` → `update_event_host_fields`
- `saveWhiskyOrderAction` → `set_whisky_order`
- `startEventAction(eventId, orderedIds?)` → optional erst `set_whisky_order`
  (noch nicht gespeicherte Reihenfolge), dann `start_event`
- `nextRoundAction(eventId, expectedPosition)` → `close_round` (optimistische
  Sperre)
- `closeEventAction` → `close_event`

**Seite & Komponenten**
- `(app)/tastings/[eventId]/gastgeber/` — `page.tsx` (`requireHost` +
  `getHostControlData` → `notFound()` bei `null`), `loading.tsx`, `error.tsx`.
- `src/components/host/`:
  - `host-panel` (Server) — Status-Router: rendert `EckdatenForm` immer, dazu
    `DraftControls` / `RunPanel` / Abschluss-Platzhalter je nach Status. Der
    `DraftControls`-`key` hängt an der servergelieferten Whisky-Reihenfolge →
    nach einem Speichern/Refresh frische lokale Baseline.
  - `eckdaten-form` (Client) — RHF + Zod; `readOnly`-Modus (nur Anzeige) bei
    abgeschlossenem Event.
  - `whisky-order-list` (Client, präsentational) — nummerierte Liste, pro Zeile
    „nach oben"/„nach unten" (an den Enden deaktiviert), „Zufällig mischen",
    „Reihenfolge speichern" (nur wenn geändert); Leerzustand „Noch keine
    Whiskys …". Wird im Lauf-Modus schreibgeschützt wiederverwendet.
  - `draft-controls` (Client) — hält den lokalen Reihenfolge-Zustand, Start-Block
    mit Checkliste („N Whiskys eingetragen" / „kein Whisky" → Button aus).
  - `run-panel` (Client) — „Whisky X von Y", „R von P haben bewertet" +
    „Aktualisieren" (Seite neu berechnen), Hauptaktion „Weiter zu Whisky N von M"
    bzw. beim letzten Whisky „Tasting abschließen"; „Tasting abschließen" hinter
    `ConfirmDialog` (aus `common/`).
- `src/components/tasting/tasting-row.tsx` — die Zeile ist nicht mehr ein
  einziger großer Link; für den Gastgeber (`row.is_host`) hängt rechts die
  „Steuern"-Aktion → `/tastings/[id]/gastgeber`. `getMyTastings` liefert dazu
  `is_host` mit.

### Verifikation in dieser Session
- `npm run build` ✅ · `npm run lint` ✅ · `npm test` ✅ (53, davon 12 neu) · `tsc` ✅
- Smoke gegen `next start`: `/tastings/<uuid>/gastgeber` leitet unangemeldet
  sauber auf `/login?redirect=…` (kein 500).
- **Nicht** getestet (braucht echte Daten / `/qa`): das Steuern im Browser
  (Eckdaten, Umsortieren, Starten, Weiterschalten, Abschließen), der
  Bewertungs-Fortschritt, die „Steuern"-Aktion in der Liste, Nicht-Gastgeber →
  „nicht gefunden".

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
