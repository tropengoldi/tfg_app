# PROJ-7: Bewertungsansicht

## Status: Planned
**Created:** 2026-08-29
**Last Updated:** 2026-08-29

## Dependencies
- **Requires: PROJ-6 (Gastgeber-Steuerung)** — ein Event muss gestartet sein und
  `current_position` weiterlaufen, damit es überhaupt etwas zu bewerten gibt.
- **Requires: PROJ-5 (Whisky-Erfassung)** — Whiskys mit Positionen.
- **Requires: PROJ-2** — App-Shell, Login, die „Tastings"-Liste.
- **Baut auf PROJ-1** — die Tabelle `ratings` (Nase 1–5, Geschmack 1–10, beide
  Pflicht; `total_points` generiert; Notiz ≤ 2000; eine Zeile pro Whisky+Person),
  die Regel `can_rate_whisky` (Event **aktiv** + Whisky-Position ≤ aktuelle
  Position + Nutzer ist Teilnehmer), die Sperre `ratings_lock` beim
  **Event**-Abschluss (`TS001`), die RLS (jeder sieht vor dem Abschluss nur die
  eigenen Punkte) und der Spalten-GRANT (schreibbar nur Nase / Geschmack / Notiz).

## Kontext

Die Bewertungsansicht ist das **Kernstück** jedes Abends. Während das Tasting
läuft, vergibt hier jeder Teilnehmer — blind — für jeden ausgeschenkten Whisky
**Nasenpunkte (1–5)** und **Geschmackspunkte (1–10)** und schreibt optional eine
private Notiz. Alles änderbar, bis der Gastgeber den Abend abschließt; erst dann
sind die Bewertungen eingefroren und die Rangliste steht (PROJ-9).

Blind heißt: der Teilnehmer sieht nur „Whisky 3 von 8" — keinen Namen, keine
fremden Bewertungen, keine Durchschnitte. Auch der Gastgeber sieht vor dem
Abschluss keine Punkte.

Die Bedienung muss in wenigen Sekunden erledigt sein — mit einem Glas in der
anderen Hand, bei gedämpftem Licht: große Slider, ein Speichern-Knopf.

Der Ablauf wird vom Gastgeber gesteuert (PROJ-6). Dass alle Geräte beim
Rundenwechsel automatisch mitspringen, ist **PROJ-8** — in PROJ-7 gibt es dafür
einen „Aktualisieren"-Knopf. Die Auflösung der Namen und die Rangliste sind
**PROJ-9**.

## User Stories

- Als **Teilnehmer** möchte ich für den aktuellen Whisky Nase und Geschmack per
  Slider vergeben und speichern, damit meine Bewertung in die Wertung eingeht.
- Als **Teilnehmer** möchte ich zu einem Whisky eine eigene Notiz festhalten,
  damit ich später weiß, was ich geschmeckt habe — ohne dass jemand sie sieht.
- Als **Teilnehmer** möchte ich zu einem früher ausgeschenkten Whisky
  zurückspringen und meine Bewertung anpassen, solange der Abend noch läuft.
- Als **Teilnehmer** möchte ich sehen, welche Whiskys ich schon bewertet habe,
  damit ich keinen vergesse.
- Als **Teilnehmer** möchte ich sicher sein, dass niemand vor dem Abschluss meine
  Punkte oder Notizen sieht, damit die Verkostung blind bleibt.
- Als **Teilnehmer** möchte ich nach dem Abschluss meine eigenen Bewertungen noch
  einsehen können, auch wenn ich sie nicht mehr ändern kann.

## Out of Scope

- **Fremde Bewertungen, Durchschnitte, Rangliste, Sieger-Whisky** → PROJ-9.
- **Automatisches Mitspringen aller Geräte beim Rundenwechsel** (Realtime) →
  PROJ-8. PROJ-7 hat einen manuellen „Aktualisieren"-Knopf.
- **Der Absprung aus dem Tasting-Dashboard in die Bewertungsansicht** → PROJ-8.
- **Auflösung der Whisky-Namen** → PROJ-9. In PROJ-7 immer nur „Whisky X von Y".
- **„Bewertung löschen"** — nicht im MVP. Eine abgegebene Bewertung bleibt
  bestehen; man ändert nur die Werte.
- **Für jemand anderen bewerten / Admin-Override** — man gibt nur die eigene
  Bewertung ab. Ein Admin, der nicht Teilnehmer ist, bekommt „Seite nicht
  gefunden".
- **Zwischenstufen / Nachkommastellen auf den Slidern** — nur ganze Zahlen.
- **Sperre beim Rundenabschluss** — nur der **Event**-Abschluss friert
  Bewertungen ein (PROJ-1). Nach einem Rundenwechsel bleiben alle bisherigen
  Whiskys bewertbar.
- **Anzeige der Rating-Notizen für andere** — in PROJ-7 sieht die Notiz nur ihr
  Verfasser. Ob sie nach dem Abschluss irgendwo auftaucht, entscheidet PROJ-9.
- **Ein „x von y bewertet"-Zähler** — die Haken in der Positionsleiste reichen.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einstieg & Zugang

- [ ] Angenommen ein Event läuft und der Nutzer ist Teilnehmer, wenn er in der
      „Tastings"-Liste auf die Zeile dieses Events tippt, dann landet er auf
      `/tastings/[eventId]/bewerten`; „Meine Whiskys" bleibt über einen kleinen
      Zweitlink an der Zeile erreichbar.
- [ ] Angenommen der Nutzer ist kein Teilnehmer dieses Events oder die Event-ID
      existiert nicht, wenn er `/tastings/[eventId]/bewerten` aufruft, dann erhält
      er „Seite nicht gefunden".
- [ ] Angenommen das Event ist „In Vorbereitung", wenn der Nutzer `/bewerten`
      aufruft, dann sieht er den Hinweis „Der Abend hat noch nicht begonnen." und
      einen Link zu „Meine Whiskys", keine Slider.
- [ ] Angenommen das Event läuft, aber es ist noch kein Whisky ausgeschenkt
      (aktuelle Position 0), wenn der Teilnehmer die Seite öffnet, dann sieht er
      „Gleich geht's los — warte auf den ersten Whisky.".

### Bewerten

- [ ] Angenommen der aktuelle Whisky ist noch nicht bewertet, wenn der Teilnehmer
      die Seite öffnet, dann stehen die Slider auf der Mitte (Nase 3, Geschmack 5),
      sind als „noch nicht gespeichert" gekennzeichnet, und der jeweils gewählte
      Zahlenwert ist groß ablesbar.
- [ ] Angenommen der Teilnehmer stellt die Slider ein und drückt „Speichern", wenn
      der Vorgang durchläuft, dann ist die Bewertung gespeichert, der Whisky steht
      auf „gespeichert" und die Positionsleiste zeigt dort einen Haken.
- [ ] Angenommen für einen Whisky wurde schon gespeichert, wenn der Teilnehmer ihn
      erneut in den Fokus holt, dann stehen die Slider auf den gespeicherten
      Werten und lassen sich ändern und neu speichern.
- [ ] Angenommen der Teilnehmer schreibt eine Notiz, wenn er „Speichern" drückt,
      dann wird die Notiz zusammen mit Nase und Geschmack gespeichert.
- [ ] Angenommen der Teilnehmer gibt eine Notiz mit mehr als 2000 Zeichen ein,
      wenn er speichert, dann wird eine Validierungsmeldung angezeigt und nichts
      gespeichert.
- [ ] Angenommen das Speichern schlägt fehl (Netz/Server), wenn der Teilnehmer
      „Speichern" drückt, dann erscheint ein Fehlerhinweis, die eingestellten
      Werte bleiben stehen und es entsteht keine halb gespeicherte Bewertung.
- [ ] Angenommen der Teilnehmer bedient die Slider, wenn er Werte wählt, dann sind
      nur ganze Zahlen möglich (Nase 1–5, Geschmack 1–10).

### Positionsleiste & Navigation

- [ ] Angenommen das Event hat N Whiskys, wenn der Teilnehmer die Bewertungsseite
      öffnet, dann zeigt die Positionsleiste alle N Positionen; die bereits
      ausgeschenkten sind anklickbar (mit Haken, wo schon bewertet wurde), die noch
      nicht ausgeschenkten sind ausgegraut und nicht anklickbar.
- [ ] Angenommen der Teilnehmer tippt in der Leiste auf eine frühere ausgeschenkte
      Position, wenn die Ansicht wechselt, dann steht dieser Whisky im Fokus mit
      seiner (ggf. noch leeren) Bewertung.
- [ ] Angenommen der Teilnehmer betrachtet eine frühere Position, wenn diese nicht
      die aktuelle ist, dann sieht er den Hinweis „Du siehst Whisky 2 — aktuell ist
      Whisky 4" und einen Knopf „Zum aktuellen Whisky".
- [ ] Angenommen der Teilnehmer hat Slider oder Notiz verändert, ohne zu
      speichern, wenn er über die Positionsleiste zu einem anderen Whisky wechseln
      will, dann erscheint der Hinweis „Nicht gespeicherte Bewertung — trotzdem
      wechseln?" mit den Optionen „Wechseln" und „Hier bleiben".
- [ ] Angenommen der Gastgeber hat inzwischen weitergeschaltet, wenn der
      Teilnehmer „Aktualisieren" drückt, dann werden die neu ausgeschenkten
      Positionen bewertbar und der Fokus springt auf den neuen aktuellen Whisky.

### Abschluss & Sperre

- [ ] Angenommen der Gastgeber schließt das Event ab, während der Teilnehmer an
      einer Bewertung sitzt, wenn der Teilnehmer danach „Speichern" drückt, dann
      wird die Aktion abgelehnt mit dem Hinweis „Der Abend ist abgeschlossen —
      Bewertungen sind eingefroren." und die Seite wechselt in den
      Nur-Anzeige-Modus.
- [ ] Angenommen das Event ist beim Laden bereits abgeschlossen, wenn der
      Teilnehmer `/bewerten` öffnet, dann werden seine eigenen Bewertungen nur
      angezeigt (Slider gesperrt), mit dem Hinweis „Bewertungen sind eingefroren."
      und einem Link zu den Ergebnissen.
- [ ] Angenommen der Gastgeber schließt nur eine **Runde** ab (nicht das Event),
      wenn der Teilnehmer eine frühere Bewertung ändert und speichert, dann gelingt
      das (nur der Event-Abschluss sperrt).

### Blindheit & Sicherheit

- [ ] Angenommen der Teilnehmer bewertet, wenn er die Seite betrachtet, dann sieht
      er ausschließlich „Whisky X von Y" — keinen Namen, keine fremden Bewertungen,
      keine Durchschnitte.
- [ ] Angenommen ein Teilnehmer schickt eine Bewertung für einen noch **nicht
      ausgeschenkten** Whisky direkt an den Server, wenn sie verarbeitet wird, dann
      wird sie abgelehnt (die Regel „Whisky bereits ausgeschenkt" wird serverseitig
      geprüft).
- [ ] Angenommen ein Teilnehmer versucht, die Bewertung einer **anderen** Person
      zu ändern, wenn der Request verarbeitet wird, dann wird er abgelehnt.
- [ ] Angenommen das Event läuft, wenn ein anderer Teilnehmer (auch der Gastgeber)
      die Bewertungsdaten abfragt, dann bekommt er die fremden Punkte und Notizen
      **nicht**.

### Zustände & Rückmeldungen

- [ ] Angenommen ein Speichern läuft, wenn der Teilnehmer wartet, dann ist der
      Speichern-Knopf im Ladezustand und ein zweiter Klick nicht möglich.
- [ ] Angenommen die Seite wird geladen und die Daten sind nicht abrufbar, wenn
      sie rendert, dann erscheint ein Fehlerhinweis mit erneutem Ladeversuch statt
      einer leeren Seite.
- [ ] Angenommen eine Bewertung wurde gespeichert, wenn die Aktion durchläuft,
      dann erscheint eine kurze Bestätigung.

## Edge Cases

- **Speichern schlägt fehl (Netz/Server).** Erwartung: Fehlerhinweis, die
  eingestellten Werte bleiben, erneuter Versuch möglich, keine halb gespeicherte
  Bewertung.
- **Event wird abgeschlossen, während der Teilnehmer bewertet.** Erwartung: der
  nächste Speicher-Versuch wird abgelehnt („eingefroren"), die Seite wechselt in
  den Nur-Anzeige-Modus.
- **Zwei Geräte derselben Person.** Erwartung: es gibt genau **eine** Bewertung
  pro Whisky+Person; das zuletzt gespeicherte Gerät gewinnt; beim nächsten Laden
  auf dem anderen Gerät steht der aktuelle Stand. Kein Konfliktdialog.
- **Teilnehmer bewertet einen noch nicht ausgeschenkten Whisky** (über eine
  veraltete Positionsleiste). Erwartung: serverseitig abgelehnt; die Position ist
  in der Leiste ohnehin gesperrt.
- **Teilnehmer wird nach der Bewertung aus dem Event entfernt.** Erwartung:
  verhindert PROJ-4 bereits (`TS009`). Für PROJ-7 kein Sonderfall.
- **Notiz mit 2001 Zeichen.** Erwartung: Validierungsmeldung am Feld, nichts wird
  gespeichert.
- **Rundenwechsel während der Teilnehmer eine frühere Position bewertet.**
  Erwartung: seine Arbeit ist ungestört; „Aktualisieren" holt später den neuen
  Stand. Kein erzwungener Fokuswechsel.
- **Teilnehmer öffnet `/bewerten` für ein Event, dem er zwar zugeordnet war, das
  aber gelöscht wurde** (nur im Draft möglich, PROJ-4). Erwartung: „Seite nicht
  gefunden".

## Technical Requirements

- **Blindheit / Sicherheit auf Datenbankebene:** Anlegen und Ändern einer
  Bewertung laufen über die vorhandenen Pfade aus PROJ-1 — RLS
  (`ratings_insert_own` / `ratings_update_own` mit `can_rate_whisky`), der
  Spalten-GRANT (nur Nase / Geschmack / Notiz) und der Trigger `ratings_lock`
  (`TS001` nach Event-Abschluss). Das Frontend verlässt sich nicht auf eigene
  Prüfungen.
- **Nur die eigene Bewertung** ist les- und schreibbar, solange das Event nicht
  abgeschlossen ist. Danach kann die Runde alle Bewertungen sehen (PROJ-9) — in
  PROJ-7 wird nur die eigene angezeigt.
- **Bewertbar sind alle Whiskys mit Position ≤ aktueller Position, solange das
  Event aktiv ist.** Ergibt sich aus `can_rate_whisky`, wird im UI gespiegelt
  (Positionsleiste).
- **Kein Realtime in PROJ-7.** Der aktuelle Stand kommt beim Laden und über den
  „Aktualisieren"-Knopf. Live-Sync ist PROJ-8.
- **Mobile-first:** große Slider mit gut ablesbarem Zahlenwert, ein
  Speichern-Knopf, die Bewertung in wenigen Sekunden erledigt. Positionsleiste
  bis 10 Positionen ohne Scrollen lesbar.
- **Zustände** (nach `docs/design-system.md`): Laden, Ladefehler mit Retry,
  Speichern-läuft, „noch nicht begonnen", „gleich geht's los", „eingefroren"
  (Nur-Anzeige), „nicht gefunden". Der Wechsel-trotz-ungespeichert-Hinweis als
  Dialog.

## Open Questions

- [ ] Sollen die Slider zusätzlich diskrete Tick-Marken / antippbare Zahlen haben
      (für schnelleres, präzises Setzen auf dem Handy), oder reicht der reine
      Slider? *(Tendenz: Slider mit sichtbaren Ticks; Detail für `/frontend`.)*
- [ ] Soll „Aktualisieren" nur die Positionsleiste/Sperren nachziehen oder den
      Fokus immer hart auf den neuen aktuellen Whisky setzen — auch wenn der
      Teilnehmer gerade an einer früheren Position arbeitet? *(Tendenz: Fokus nur
      setzen, wenn keine ungespeicherten Änderungen offen sind; sonst nur die
      Leiste aktualisieren und den „aktuell ist Whisky N"-Hinweis zeigen.)*
- [ ] Nach dem Abschluss: in PROJ-7 direkt einen Link „Zu den Ergebnissen" zeigen
      (führt bis PROJ-9 auf einen Platzhalter) oder den Hinweis ohne Link lassen?
      *(Tendenz: Link auf `/tastings` bzw. den späteren Ergebnis-Pfad.)*
- [ ] Soll die Seite den `42501`-Fehler (RLS: Whisky noch nicht ausgeschenkt) in
      eine freundlichere Meldung übersetzen, oder reicht die generische „fehlende
      Berechtigung"? *(Selten, weil die Positionsleiste den Fall verhindert.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Seite `/tastings/[eventId]/bewerten`; bei laufendem Event ist sie der Haupt-Klick der „Tastings"-Zeile, „Meine Whiskys" nur noch Zweitlink | Während des Abends ist das Bewerten das Relevante; die Whisky-Erfassung ist dann ohnehin geschlossen | 2026-08-29 |
| Ein Whisky im Fokus (große Slider) + Positionsleiste `1…N` zum Zurückspringen | „In wenigen Sekunden bewerten" + der Teilnehmer darf laut PROJ-1 jede ausgeschenkte Position anpassen | 2026-08-29 |
| Slider starten auf der Mitte (Nase 3, Geschmack 5), aber erst „Speichern" macht die Bewertung gültig | Die DB kennt keine leere Bewertung; die Mittelstellung ist nur ein Ausgangspunkt, kein automatischer Wert | 2026-08-29 |
| Ein „Speichern" sichert Nase, Geschmack und Notiz zusammen | Eine Bewertung ist eine Einheit; kein getrenntes Speichern der Notiz | 2026-08-29 |
| Notiz privat, solange das Event läuft; nach dem Abschluss entscheidet PROJ-9 über die Anzeige | Blindheit; die technische Lesbarkeit nach dem Abschluss ist eine PROJ-9-Frage | 2026-08-29 |
| Kein Auto-Sync in PROJ-7 — manueller „Aktualisieren"-Knopf | Realtime ist PROJ-8; der Teilnehmer kann ohnehin alle ausgeschenkten Whiskys bewerten, ist also nie blockiert | 2026-08-29 |
| Warnung bei ungespeicherten Änderungen **nur** beim Positionswechsel über die Leiste | Häufigster Verlust-Fall; „Aktualisieren" / Seite verlassen ist selten und die Werte sind schnell wieder gesetzt | 2026-08-29 |
| Abgeschlossenes Event zeigt die eigenen Werte read-only statt auf die Ergebnisse umzuleiten | Der Teilnehmer will „was habe ich vergeben" nachsehen können; die Ergebnisansicht ist PROJ-9 | 2026-08-29 |
| Kein „Bewertung löschen", kein Admin-Override, nur ganze Zahlen | Klein halten; eine Bewertung ändert man, statt sie zu löschen; nur die eigene Bewertung; Ganzzahlen entsprechen der Skala | 2026-08-29 |
| Der Gastgeber bewertet hier ganz normal mit | Er ist Teilnehmer; die Steuerung liegt getrennt unter `/gastgeber` | 2026-08-29 |
| Kein „x von y bewertet"-Zähler | Die Haken in der Positionsleiste zeigen den Fortschritt ohne zusätzlichen Druck | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| PROJ-7 ist Frontend-only — keine Migration, keine RPC | `ratings` inkl. Upsert-Schreibrechten, `can_rate_whisky` und der `ratings_lock`-Trigger stehen aus PROJ-1 (Migration `20260827120800` hat den Upsert-Pfad bereits vorbereitet) | 2026-08-29 |
| Speichern als „Upsert" (anlegen **oder** ändern in einem) über den nutzergebundenen Client, gekapselt in einer Server Action | Genau eine Bewertungszeile pro Whisky+Person; RLS (`ratings_insert_own` / `ratings_update_own` + `can_rate_whisky`), der zusammengesetzte FK und die GENERATED-Spalte `total_points` sichern sie ab; Server Action konsistent mit PROJ-5/6 | 2026-08-29 |
| Lesen über den nutzergebundenen Client (RLS) — Event-Status + Position, Whisky-**Positionen**, **nur die eigenen** Bewertungen | Kein Service-Schlüssel; die DB gibt einem Teilnehmer vor dem Abschluss ohnehin keine fremden Bewertungen und keine Whisky-Namen heraus | 2026-08-29 |
| Neues Paket: `shadcn slider` (`@radix-ui/react-slider`) | Kein Slider im Projekt; der Radix-Slider ist touch- und tastaturbedienbar mit fester Schrittweite (Nase 1–5, Geschmack 1–10) | 2026-08-29 |
| „Aktualisieren" = die ganze Seite neu berechnen (`router.refresh`), kein Polling, kein Realtime | Realtime ist PROJ-8; der Teilnehmer ist nie blockiert, weil er alle ausgeschenkten Whiskys bewerten darf | 2026-08-29 |
| Warnung vor Datenverlust nur beim Positionswechsel über die Leiste (Dialog), nicht bei „Aktualisieren" / Seitenwechsel | Häufigster Verlustfall; die übrigen sind selten und die Werte schnell wieder gesetzt | 2026-08-29 |
| Mutation als Server Action in `src/lib/actions/ratings.ts`, mit Login-Vorabprüfung | Konsistent mit PROJ-4 / PROJ-5 / PROJ-6 | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** PROJ-7 ist reine Oberfläche. Eine neue Seite pro
> Abend mit zwei großen Slidern und einem Notizfeld; das Speichern schreibt
> direkt in die Bewertungs-Tabelle, die PROJ-1 schon mit allen Sicherheitsregeln
> vorbereitet hat. Ein neues Paket: der Slider-Baustein von shadcn.

### 1. Seitenstruktur

```
(app)-Bereich
└─ /tastings                          (aus PROJ-5/6) — bei laufendem Event führt
   │                                   der Haupt-Klick der Zeile auf „bewerten",
   │                                   „Meine Whiskys" bleibt als kleiner Zweitlink
   │
   └─ /tastings/[eventId]/bewerten    Bewertungsansicht (Zugang: Teilnehmer)
      │
      ├─ Positionsleiste  1 2 [3] 4 5 6 7 8
      │     ausgeschenkt = anklickbar, Haken bei „schon bewertet"
      │     noch nicht ausgeschenkt = ausgegraut / nicht anklickbar
      │
      ├─ Fokus-Whisky  „Whisky 3 von 8"
      │   ├─ (bei früherer Position im Fokus)
      │   │     Hinweis „Du siehst Whisky 2 — aktuell ist Whisky 4"
      │   │     + Knopf „Zum aktuellen Whisky"
      │   ├─ Nase       Slider 1–5   + großer Zahlenwert
      │   ├─ Geschmack  Slider 1–10  + großer Zahlenwert
      │   ├─ Notiz      Freitext (bis 2000 Zeichen), nur für dich
      │   ├─ Status     „noch nicht gespeichert" / „gespeichert"
      │   └─ Knopf „Speichern"  ·  Knopf „Aktualisieren"
      │
      ├─ Zustand „In Vorbereitung"   „Der Abend hat noch nicht begonnen." + Link
      ├─ Zustand „läuft, Position 0" „Gleich geht's los — warte auf den ersten Whisky."
      ├─ Zustand „abgeschlossen"     eigene Werte nur Anzeige, „eingefroren" + Link
      ├─ „Seite nicht gefunden"      kein Teilnehmer / ID unbekannt
      └─ Lade- / Fehler- / Speichern-Zustände wie in PROJ-5 / 6

Dialog „Nicht gespeicherte Bewertung — trotzdem wechseln?" nur beim
Positionswechsel über die Leiste.
```

**Neue Bausteine**

- Seite `/tastings/[eventId]/bewerten` + `loading` + `error`.
- Komponenten unter `src/components/rating/`: die Positionsleiste, der
  Fokus-Bewertungsblock (zwei Slider + Notiz + Speichern + Aktualisieren), der
  „ungespeichert"-Dialog (nutzt `ConfirmDialog` aus `common/`).
- Datenzugriff: eine Lese-Datei (Event-Status + Position + Whisky-Positionen +
  eigene Bewertungen), eine Schreib-Aktion, ein Eingabe-Schema.
- In PROJ-5s „Tastings"-Liste: bei laufendem Event zeigt die Zeile den
  „bewerten"-Haupt-Klick, „Meine Whiskys" als Zweitlink (der Gastgeber-Zweitlink
  „Steuern" aus PROJ-6 bleibt unberührt).

### 2. Datenmodell (nichts Neues an Tabellen)

PROJ-7 nutzt ausschließlich, was PROJ-1 gebaut hat:

- **`ratings`** — eine Zeile pro Whisky + Person: Nase (1–5), Geschmack (1–10),
  Gesamt (automatisch = Nase + Geschmack), Notiz. Eindeutig pro (Whisky, Person).
- **`whiskies`** — nur die Position (für die Positionsleiste); Namen bleiben
  verborgen.
- **`tasting_events`** — Status und aktuelle Position.

Eine Bewertung in PROJ-7:
- **Nase** (Pflicht, ganze Zahl 1–5)
- **Geschmack** (Pflicht, ganze Zahl 1–10)
- **Notiz** (optional, bis 2000 Zeichen, privat)
- *(intern)* Person = der angemeldete Nutzer, Whisky/Event aus dem Kontext,
  „Gesamt" rechnet die Datenbank.

„Aktueller Whisky", „schon bewertet?", „ausgeschenkt?" sind abgeleitete Werte aus
Position, Whisky-Anzahl und den vorhandenen eigenen Bewertungen.

### 3. Wo geschrieben wird — direkt in die Bewertungs-Tabelle

| Aktion | Mechanismus | Prüfungen (in der Datenbank, nicht im Browser) |
|---|---|---|
| Bewertung speichern (anlegen **oder** ändern) | Server Action → ein „Upsert" auf `ratings` | RLS: nur unter **eigenem** Namen; nur für einen **bereits ausgeschenkten** Whisky eines **laufenden** Events, bei dem der Nutzer Teilnehmer ist (`can_rate_whisky`); nach dem Event-Abschluss blockt der Trigger `ratings_lock` jede Änderung („eingefroren", `TS001`); „Gesamt" wird automatisch gerechnet |

Kein neuer Endpunkt, keine neue Datenbank-Aktion — PROJ-1 hat den Upsert-Pfad
inkl. der nötigen Spalten-Schreibrechte bereits vorbereitet (Migration
`20260827120800`). Kein Service-Schlüssel. Die Server Action prüft zusätzlich
vorab die Anmeldung; die Datenbank bleibt die eigentliche Schranke (Muster wie
PROJ-5 / 6).

### 4. Was der Teilnehmer sieht — und was nicht

- **Sieht:** „Whisky X von Y", seine eigenen Slider-Werte und seine eigene
  Notiz, die Haken in der Positionsleiste für seine bewerteten Whiskys.
- **Sieht nicht:** Whisky-Namen, fremde Bewertungen, Durchschnitte, irgendeine
  Aggregat-Zahl. Die Lese-Abfrage holt gezielt nur die eigenen Bewertungen; die
  Datenbank gäbe einem Teilnehmer vor dem Abschluss ohnehin keine fremden heraus.

### 5. Kein Live-Update in PROJ-7

Die Seite lädt ihren Stand beim Öffnen. Schaltet der Gastgeber weiter, merkt der
Teilnehmer das erst über den **„Aktualisieren"-Knopf** — der die Seite neu
berechnet, die neu ausgeschenkten Positionen freischaltet und (wenn keine
ungespeicherte Änderung offen ist) den Fokus auf den neuen aktuellen Whisky
setzt. Das automatische Mitspringen aller Geräte ist PROJ-8.

### 6. Ungespeicherte Änderungen

Hat der Teilnehmer an einem Slider oder der Notiz gedreht und noch nicht
gespeichert, kommt beim **Positionswechsel über die Leiste** ein Dialog „Nicht
gespeicherte Bewertung — trotzdem wechseln?" mit „Wechseln" / „Hier bleiben".
Beim „Aktualisieren" oder Verlassen der Seite gibt es diesen Hinweis bewusst
nicht.

### 7. Einstieg über die „Tastings"-Liste

Die Zeile eines Events, bei dem der Nutzer Teilnehmer ist, verhält sich je nach
Status: „In Vorbereitung" → Haupt-Klick auf „Meine Whiskys"; **„läuft" →
Haupt-Klick auf „bewerten"**, „Meine Whiskys" als kleiner Zweitlink;
„abgeschlossen" → später auf die Ergebnisse (PROJ-9). Der Gastgeber-Zweitlink
„Steuern" (PROJ-6) bleibt unabhängig davon bestehen.

### 8. Zustände & Rückmeldungen (nach `docs/design-system.md`)

- **Laden:** Skeleton für Leiste + Fokus-Block.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen".
- **Speichern läuft:** Knopf im Ladezustand, kein Doppelklick.
- **Speichern gelingt:** kurze Bestätigung, Status wechselt auf „gespeichert".
- **Speichern schlägt fehl:** konkrete deutsche Meldung; die eingestellten Werte
  bleiben; keine halbe Bewertung.
- **„Eingefroren" (Event abgeschlossen):** Slider gesperrt, Hinweis + Link zu den
  Ergebnissen.
- **„Noch nicht begonnen" / „Gleich geht's los" / „Seite nicht gefunden".**

### 9. Neue Pakete

| Paket | Zweck |
|-------|-------|
| `shadcn slider` (zieht `@radix-ui/react-slider` mit) | die beiden Bewertungs-Slider; touch- und tastaturbedienbar, feste Schrittweite |

Sonst nichts (`AlertDialog`, `Textarea`, `Card`, `Button`, `Badge`, `Skeleton`
sind vorhanden; `sonner` für Toasts; `date-fns` für die Datumsanzeige).

### 10. Betriebsvoraussetzung

Keine neue.

### 11. Wie der Erfolg geprüft wird

- **Unit-Tests** für die abgeleitete Logik (welche Positionen sind bewertbar,
  welche haben einen Haken, „aktueller Whisky", Fokus-Vorauswahl) und die
  Eingaberegeln (Nase 1–5 / Geschmack 1–10 ganzzahlig, Notiz ≤ 2000).
- **Datenbank-Tests** (PROJ-1-Stil), soweit nicht schon abgedeckt: Bewertung für
  einen **nicht ausgeschenkten** Whisky → abgelehnt; fremde Bewertung ändern →
  abgelehnt; nach Event-Abschluss speichern → `TS001`; nach reinem
  Rundenabschluss speichern → klappt; ein anderer Teilnehmer / der Gastgeber
  sieht die fremden Punkte **nicht**.
- **E2E-Tests** (Chromium + Mobile Safari): aktuellen Whisky bewerten + speichern
  (Haken erscheint); erneut öffnen → Werte stehen; zu einer früheren Position
  springen und ändern; „Aktualisieren" schaltet eine neue Position frei;
  ungespeicherter Positionswechsel → Dialog; abgeschlossenes Event → nur
  Anzeige; Nicht-Teilnehmer → „nicht gefunden"; ein Teilnehmer sieht die Werte
  eines anderen nicht.
- `npm run build` / `npm run lint` sauber.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
