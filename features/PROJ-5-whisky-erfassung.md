# PROJ-5: Whisky-Erfassung (blind)

## Status: In Progress
**Created:** 2026-08-29
**Last Updated:** 2026-08-29

## Dependencies
- **Requires: PROJ-4 (Admin – Tasting-Events verwalten)** — es muss Events „In
  Vorbereitung" mit einer Teilnehmerliste geben; nur benannte Teilnehmer dürfen
  eintragen.
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — App-Shell, der Bottom-Nav-Tab
  „Tastings", Login, Session.
- **Baut auf PROJ-1** — die Tabellen `whiskies` (sichtbar: nur Position) und
  `whisky_details` (geheim: Name, Herkunft, Video-Link, Bringer), die RPCs
  `add_whisky` / `remove_whisky`, die RLS-Policy `wd_update_own` (Bringer darf die
  Sachfelder direkt ändern, solange `draft`), die Limit-Logik inkl.
  Gastgeber-Bonus und die 10-Whiskys-Obergrenze.

## Kontext

Bevor ein Tasting-Abend läuft, tragen alle Teilnehmer vorab ein, **welche Whiskys
sie mitbringen**. Genau das macht PROJ-5 — und sonst nichts. Es ist die
Teilnehmer-Seite zu PROJ-4: der Admin setzt den Abend an, die Runde füllt ihn mit
Flaschen.

Die Blindheit der Verkostung beginnt hier. Was jemand einträgt, sieht außer ihm
selbst nur der Gastgeber (er muss ausschenken) und der Admin. Kein anderer
Teilnehmer erfährt, was im Glas landen wird — nicht mal, wie viele Whiskys schon
eingetragen sind.

Das meiste dahinter steht bereits aus PROJ-1: die geheime Tabelle, die
Eintrag-/Entfernen-Aktionen, die Limit-Prüfung mit „+1 für den Gastgeber", das
Sichtbarkeitsmodell. PROJ-5 ist überwiegend die Oberfläche: eine Seite „Meine
Whiskys" pro Abend, ein schlankes Formular, Bearbeiten und Entfernen.

Die Ausschankreihenfolge festzulegen und das Event zu starten ist **PROJ-6**
(Gastgeber-Steuerung). Die Gesamtübersicht aller Whiskys für den Gastgeber ist
ebenfalls PROJ-6. Bewerten ist PROJ-7. Die Auflösung der Namen und der Video-Links
für alle ist PROJ-9.

## User Stories

- Als **Teilnehmer** möchte ich die Whiskys eintragen, die ich zu einem geplanten
  Tasting mitbringe, damit sie in die Verkostung aufgenommen werden.
- Als **Teilnehmer** möchte ich zu einem Whisky optional einen Link zu einem
  Verkostungsvideo hinterlegen, damit er nach der Auflösung für alle abrufbar ist.
- Als **Teilnehmer** möchte ich mir zu einem Whisky eine private Notiz machen,
  damit ich am Abend weiß, warum ich ihn ausgewählt habe — ohne dass jemand anderes
  sie sieht.
- Als **Teilnehmer** möchte ich einen eingetragenen Whisky noch ändern oder
  austauschen, solange der Abend nicht gestartet ist.
- Als **Gastgeber** (der ebenfalls Teilnehmer ist) möchte ich meinen Bonus-Whisky
  zusätzlich eintragen können, weil ich als Gastgeber zwei mitbringen darf.
- Als **Teilnehmer** möchte ich sicher sein, dass niemand außer dem Gastgeber
  sieht, was ich mitbringe, damit die Verkostung wirklich blind bleibt.

## Out of Scope

- **Ausschankreihenfolge festlegen, Event starten / Runde / abschließen** → PROJ-6.
- **Gesamtübersicht aller Whiskys für den Gastgeber** (alle Einträge des Abends auf
  einen Blick) → PROJ-6. In PROJ-5 ist der Gastgeber ein Bringer wie jeder andere
  und sieht auf „Meine Whiskys" nur die eigenen Einträge.
- **Zusatzfelder** Brennerei, Region, Alter, ABV, Fasstyp, Abfüller, Preis — die
  Spalten existieren in `whisky_details` (PROJ-1), das MVP-Formular nutzt sie
  **nicht**. Nur Name, Video-Link, private Notiz.
- **Video-Player / YouTube-Einbettung / automatische Video-Suche** → PRD Non-Goal.
  Der Link ist reiner Text, der später (PROJ-9) in einem neuen Tab öffnet.
- **Foto- oder Datei-Upload** → PRD Non-Goal.
- **Whisky-Katalog / Auswahl aus einer Datenbank / externe Whisky-APIs** → PRD
  Non-Goal. Name ist Freitext.
- **Auflösung der Namen, Rangliste, Video-Links für alle** → PROJ-9.
- **Bewerten (Nase / Geschmack / Notizen zur Bewertung)** → PROJ-7.
- **Anzeige, wie viele andere schon eingetragen haben** oder ob die Liste des
  Abends „vollständig" ist — bewusst weggelassen (verrät am Abend etwas über die
  eigene Position; ist Sache des Gastgebers in PROJ-6).
- **Neutraler Helfer pro Event** (Rolle mit Einblick, aber ohne Mitverkosten) →
  PROJ-11.
- **Positionsnummer je eigenem Whisky** in der Liste — die Positionen werden vom
  Gastgeber in PROJ-6 ohnehin neu gemischt; eine Nummer vor dem Start wäre
  bedeutungslos oder irreführend.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einstieg & Liste

- [ ] Angenommen der Teilnehmer ist eingeloggt und bei mindestens einem Tasting „In
      Vorbereitung" eingetragen, wenn er den Tab „Tastings" öffnet, dann sieht er
      diese Tastings (kommende zuerst) mit Datum, Ort und Gastgeber.
- [ ] Angenommen der Teilnehmer tippt in dieser Liste auf ein Tasting „In
      Vorbereitung", wenn die Seite lädt, dann sieht er „Meine Whiskys" für diesen
      Abend mit seiner — ggf. leeren — Liste und der Aktion „Whisky hinzufügen".
- [ ] Angenommen der Nutzer ist bei diesem Event kein Teilnehmer oder die Event-ID
      existiert nicht, wenn er `/tastings/[eventId]/whiskies` aufruft, dann erhält
      er „Seite nicht gefunden".
- [ ] Angenommen der Teilnehmer hat für diesen Abend noch keinen eigenen Whisky,
      wenn er „Meine Whiskys" öffnet, dann sieht er einen kurzen Erklärtext („Trag
      ein, was du mitbringst — sieht außer dir nur der Gastgeber.") und den Button
      „Whisky hinzufügen".

### Hinzufügen

- [ ] Angenommen die Seite ist offen und das eigene Kontingent ist nicht
      ausgeschöpft, wenn der Teilnehmer „Whisky hinzufügen" wählt, einen Namen
      eingibt und speichert, dann erscheint der Whisky in seiner Liste und außer
      ihm sehen ihn nur der Gastgeber und der Admin.
- [ ] Angenommen der Teilnehmer lässt den Namen leer, wenn er speichert, dann wird
      eine Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen der Teilnehmer trägt einen Video-Link ohne `http://` oder
      `https://` ein, wenn er speichert, dann wird eine Validierungsmeldung am Feld
      angezeigt und nichts gespeichert.
- [ ] Angenommen der Teilnehmer lässt Video-Link und Notiz leer, wenn er speichert,
      dann wird der Whisky nur mit dem Namen angelegt.
- [ ] Angenommen das eigene Kontingent ist erreicht, wenn der Teilnehmer die Seite
      betrachtet, dann ist „Whisky hinzufügen" deaktiviert mit dem Hinweis, dass
      das Limit erreicht ist und er einen entfernen muss, um zu tauschen.
- [ ] Angenommen das Limit wurde gesenkt, nachdem die Seite geladen war, wenn der
      Teilnehmer trotzdem einen weiteren Whisky speichert, dann lehnt der Server ab
      und es erscheint der Hinweis „Limit erreicht"; die vorhandenen Einträge
      bleiben unverändert.
- [ ] Angenommen der Nutzer ist Gastgeber des Abends und es gibt ein Limit von n,
      wenn er seine Whiskys einträgt, dann darf er n+1 eintragen und der
      Kontingent-Hinweis nennt den Gastgeber-Bonus ausdrücklich.
- [ ] Angenommen für den Abend ist kein Limit gesetzt, wenn der Teilnehmer die
      Seite betrachtet, dann steht dort „Keine Begrenzung für diesen Abend" und
      „Whisky hinzufügen" bleibt verfügbar, bis das Event insgesamt 10 Whiskys hat.
- [ ] Angenommen das Event hat bereits 10 Whiskys, wenn der Teilnehmer einen
      weiteren speichern will, dann wird die Aktion abgelehnt mit dem Hinweis, dass
      mehr als 10 Whiskys pro Tasting nicht vorgesehen sind.

### Bearbeiten & Entfernen

- [ ] Angenommen ein eigener Whisky existiert und das Event ist „In Vorbereitung",
      wenn der Teilnehmer „Bearbeiten" wählt, Angaben ändert und speichert, dann
      ist der Eintrag aktualisiert und die Liste zeigt den neuen Stand.
- [ ] Angenommen ein eigener Whisky existiert, wenn der Teilnehmer „Entfernen"
      wählt, dann erscheint ein Bestätigungsdialog mit dem Hinweis, dass die
      Angaben dann endgültig weg sind, bevor etwas passiert.
- [ ] Angenommen der Teilnehmer bestätigt „Entfernen", wenn die Aktion durchläuft,
      dann verschwindet der Whisky aus seiner Liste und sein Kontingent ist wieder
      um eins frei.
- [ ] Angenommen das Event ist nicht mehr „In Vorbereitung" (läuft schon oder ist
      abgeschlossen), wenn der Teilnehmer „Meine Whiskys" öffnet, dann sieht er
      seine Einträge nur als Anzeige — ohne „Hinzufügen", „Bearbeiten" oder
      „Entfernen" — mit dem Hinweis „Das Eintragen für diesen Abend ist
      geschlossen."

### Blindheit & Sicherheit

- [ ] Angenommen andere Teilnehmer haben für denselben Abend Whiskys eingetragen,
      wenn der Teilnehmer „Meine Whiskys" öffnet, dann sieht er ausschließlich
      seine eigenen Einträge — keine fremden Namen, keine Anzahl, keinen Hinweis
      darauf, dass es fremde Whiskys gibt.
- [ ] Angenommen ein Nutzer ist kein Teilnehmer des Events, wenn er einen
      Hinzufügen-, Ändern- oder Entfernen-Request direkt an den Server schickt,
      dann wird er abgelehnt, weil Teilnahme und Event-Status serverseitig geprüft
      werden.
- [ ] Angenommen ein Teilnehmer versucht, den Whisky eines anderen Bringers zu
      ändern oder zu entfernen, wenn der Request verarbeitet wird, dann wird er
      abgelehnt.
- [ ] Angenommen das Event läuft bereits oder ist abgeschlossen, wenn ein
      Teilnehmer einen Hinzufügen-, Ändern- oder Entfernen-Request direkt an den
      Server schickt, dann wird er abgelehnt (Eintragen nur im Status „In
      Vorbereitung").

### Zustände & Rückmeldungen

- [ ] Angenommen das Speichern schlägt fehl (Netz/Server), wenn der Teilnehmer das
      Formular abschickt, dann erscheint ein Fehlerhinweis, seine Eingaben bleiben
      erhalten und es entsteht kein doppelter Eintrag.
- [ ] Angenommen die Seite wird geladen und die Daten sind nicht abrufbar, wenn sie
      rendert, dann erscheint ein Fehlerhinweis mit erneutem Ladeversuch statt
      einer leeren Seite.
- [ ] Angenommen eine Aktion läuft (Speichern oder Entfernen), wenn der Teilnehmer
      wartet, dann ist die Schaltfläche im Ladezustand und ein zweiter Klick nicht
      möglich.

## Edge Cases

- **Limit wird gesenkt, nachdem jemand schon mehr eingetragen hat** (Admin in
  PROJ-4). Erwartung: Die vorhandenen Whiskys bleiben; die Person kann nur keinen
  weiteren hinzufügen. Kein Datenverlust. (PROJ-1: Limit wird nur beim Hinzufügen
  geprüft.)
- **Teilnehmer wird aus der Teilnehmerliste entfernt, während er Whiskys drin
  hat.** Erwartung: verhindert PROJ-4 bereits (`TS009`). Für PROJ-5 kein
  Sonderfall; tritt er selbst zurück, ist das ohnehin nicht vorgesehen.
- **Zwei Geräte, paralleles Eintragen.** Erwartung: Beide Einträge landen (auf
  verschiedenen Positionen), solange das Kontingent reicht; sonst greift die
  Limit-Prüfung beim zweiten. Kein Absturz, keine kaputte Positionsfolge.
- **Das Event wird gelöscht (PROJ-4), während der Teilnehmer auf der Seite ist.**
  Erwartung: Der nächste Lade- oder Speicherversuch führt zu „Seite nicht
  gefunden" bzw. einem Fehlerhinweis — keine weiße Seite, kein stiller Fehlschlag.
- **Gastgeber trägt seinen Bonus-Whisky ein und wird danach als Gastgeber
  abgelöst** (Admin wechselt ihn). Erwartung: Der Bonus-Eintrag bleibt; er kann
  nur nichts mehr über sein reguläres Limit hinaus hinzufügen. (PROJ-1-Verhalten.)
- **Video-Link mit führenden/abschließenden Leerzeichen.** Erwartung: wird beim
  Speichern getrimmt; ein Feld, das nach dem Trimmen leer ist, gilt als „kein
  Link".
- **Sehr langer Name / sehr lange Notiz.** Erwartung: Name > 200 Zeichen bzw.
  Notiz > 2000 Zeichen werden mit Validierungsmeldung abgelehnt (DB-Grenzen aus
  PROJ-1), nichts wird abgeschnitten gespeichert.

## Technical Requirements

- **Sicherheit / Blindheit auf Datenbankebene:** Hinzufügen, Ändern und Entfernen
  laufen über die vorhandenen Pfade aus PROJ-1 (`add_whisky`, `remove_whisky`,
  `wd_update_own`), die Teilnahme, Bringer-Identität und Event-Status = `draft`
  selbst prüfen. Das Frontend verlässt sich nicht auf eigene Prüfungen.
- **Nur der Bringer, der Gastgeber und der Admin** sehen die Details eines Whiskys,
  solange das Event nicht abgeschlossen ist (RLS `wd_select` aus PROJ-1).
- **Bearbeiten und Entfernen nur im Status „In Vorbereitung".**
- **Kontingent-Anzeige** spiegelt die Server-Regel (`max_whiskies_per_participant`,
  für den Gastgeber +1, NULL = frei, Event-Obergrenze 10), ist aber nie die
  einzige Schranke — die Datenbank weist ein Überschreiten in jedem Fall ab.
- **Mobile-first:** eine Spalte ab 375 px, große Tap-Ziele, das Formular in
  Sekunden ausfüllbar. Bestätigungsdialog fürs Entfernen (Muster aus
  PROJ-3/PROJ-4).
- **Zustände** (nach `docs/design-system.md`): Leerzustand, Ladezustand,
  Ladefehler mit Retry, Aktion-läuft-Zustand, „Eintragen geschlossen"-Zustand.

## Open Questions

- [ ] Soll die „Tastings"-Liste auch **laufende** und **abgeschlossene** Tastings
      des Teilnehmers zeigen (dann als Absprung zu Bewertung / Historie)? *(Tendenz:
      ja, aber die Ziele davon sind PROJ-7 / PROJ-8 / PROJ-9 — in PROJ-5 zeigt ein
      Klick darauf vorerst nur „Meine Whiskys" im Nur-Anzeige-Modus.)*
- [ ] Braucht der Gastgeber schon in PROJ-5 einen Hinweis „x von y Teilnehmern
      haben eingetragen"? *(Tendenz: nein — gehört in die Gastgeber-Steuerung
      PROJ-6, wo auch die Gesamtliste lebt.)*
- [ ] Sollen die ausgeblendeten Zusatzfelder (v. a. **Preis**, für die spätere
      Abrechnung in der Runde) in einem eigenen späteren Durchgang nachgezogen
      werden? *(offen — nach dem ersten echten Einsatz entscheiden.)*
- [ ] Wohin wandert der gemeinsam genutzte `ConfirmDialog` (heute unter
      `src/components/admin/`) — `src/components/ui/` wie eine shadcn-Ergänzung oder
      `src/components/common/`? *(Detail für `/frontend`.)*
- [ ] Reicht für den neuen Code `TS016` ein kleiner DB-Test, oder soll ein
      E2E-Fall mit 10 vorbefüllten Whiskys her? *(Tendenz: DB-Test — schneller und
      robuster als 10 Einträge über die Oberfläche.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Seite „Meine Whiskys" pro Abend unter `/tastings/[eventId]/whiskies`, erreichbar über den „Tastings"-Tab | Es kann mehrere Events „In Vorbereitung" geben; eine Zwischenliste macht die Auswahl eindeutig und ist später der natürliche Ort für Absprünge zu Bewertung/Historie | 2026-08-29 |
| MVP-Formular nur: Name (Pflicht), Video-Link (optional), private Notiz (optional) | PRD-Kernablauf nennt genau diese; die Runde bedient die App am Handy nebenbei. Die übrigen `whisky_details`-Felder bleiben in der DB für später | 2026-08-29 |
| Kontingent im Klartext über der Liste; „Hinzufügen" wird bei erreichtem Limit deaktiviert (nicht erst beim Klick) | Am Tasting-Abend soll sofort klar sein, ob noch etwas geht; die DB-Ablehnung (`TS003`) ist nur das Netz darunter | 2026-08-29 |
| Gastgeber-Bonus wird im Kontingent-Hinweis ausdrücklich benannt („1 von 2 – ein Bonus als Gastgeber") | Sonst wirkt die höhere Zahl wie ein Fehler | 2026-08-29 |
| Entfernen hinter Bestätigungsdialog, Bearbeiten nicht | Entfernen ist endgültig (kein Undo); ein Formular-Submit ist selbsterklärend. Konsistent mit PROJ-3/PROJ-4 | 2026-08-29 |
| „Meine Whiskys" zeigt ausschließlich die eigenen Einträge — keine Zahl, kein Hinweis auf fremde Whiskys | Schon „erst 4 Whiskys drin" verrät am Abend etwas über die eigene Position. Vollständigkeit ist Sache des Gastgebers (PROJ-6) | 2026-08-29 |
| In PROJ-5 ist der Gastgeber ein Bringer wie jeder andere; keine Gastgeber-Sonderansicht | Die Gesamtübersicht aller Whiskys und das Reihenfolge-Festlegen sind PROJ-6 — dort gehört die Ausschank-Perspektive hin | 2026-08-29 |
| Keine Positionsnummer je eigenem Whisky in der Liste | Der Gastgeber mischt die Positionen in PROJ-6 neu; eine Nummer vor dem Start wäre bedeutungslos oder irreführend | 2026-08-29 |
| „Neutraler Helfer pro Event" als eigenes späteres Feature ausgegliedert (PROJ-11) | Verfeinert das Rollenmodell (Gastgeber verkostet dann blind mit); betrifft RLS, Event-Anlage und Gastgeber-Steuerung — die Runde kann das erst nach dem ersten Einsatz beurteilen | 2026-08-29 |
| Kein Video-Player, nur ein gespeicherter Link | PRD Non-Goal; der Link öffnet später (PROJ-9) in einem neuen Tab | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| PROJ-5 ist Frontend-only bis auf einen neuen Fehlercode `TS016` | Schema, Schreibpfade (`add_whisky` / `remove_whisky`), Sichtbarkeits-RLS und Limit-Logik stehen komplett aus PROJ-1 | 2026-08-29 |
| Bearbeiten läuft als direkte Änderung an `whisky_details`, nicht über eine neue RPC | PROJ-1 hat dafür bereits eine spaltengenaue Schreibregel (`wd_update_own`: nur Bringer, nur die Sachfelder, nur `draft`) — eine RPC wäre Doppelarbeit | 2026-08-29 |
| Neuer Fehlercode `TS016` für „mehr als 10 Whiskys pro Abend" | `add_whisky` nutzt dafür heute `TS008` (= „Reihenfolge unvollständig") → im Frontend käme der falsche Hilfetext | 2026-08-29 |
| „Meine Whiskys" fragt nur die eigenen `whisky_details`-Zeilen ab und ignoriert die `whiskies`-Positionen | Die DB gibt einem Teilnehmer ohnehin nur die eigenen Detailzeilen; die für alle sichtbaren Positionen würden die Gesamtzahl verraten (Blindheit) | 2026-08-29 |
| Formular als Dialog (Hinzufügen / Bearbeiten), Entfernen hinter `ConfirmDialog` | Konsistent mit PROJ-3 (Einladen-Dialog) und PROJ-4 (Löschen-Dialog); 3 Felder brauchen keine eigene Seite; auf dem Handy volle Breite | 2026-08-29 |
| `ConfirmDialog` von `src/components/admin/` an einen gemeinsamen Ort verschieben | Wird jetzt auch außerhalb des Admin-Bereichs gebraucht | 2026-08-29 |
| „Tastings"-Liste zeigt kommende + vergangene Events des Nutzers; ein Klick führt immer zuerst auf „Meine Whiskys" | Ein Ziel pro Zeile hält PROJ-5 klein; Bewertung / Dashboard / Historie hängen sich später an | 2026-08-29 |
| Kein Realtime in PROJ-5 | Vor dem Start bewegt sich am Zustand nichts Zeitkritisches; Live-Sync ist PROJ-8 | 2026-08-29 |
| Lesezugriff über den nutzergebundenen Client (RLS), Schreiben über Server Actions mit Vorab-Login-Prüfung | Muster wie PROJ-4; die DB bleibt die eigentliche Schranke | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** PROJ-5 ist fast reine Oberfläche. Der „Tastings"-Tab
> wird zur echten Liste, dahinter liegt pro geplantem Abend eine Seite „Meine
> Whiskys" mit einem kleinen Formular (Name, Video-Link, private Notiz). Speichern,
> Ändern und Löschen laufen über die Wege, die PROJ-1 schon gebaut hat — neu ist
> nur eine sauberere Fehlermeldung für den seltenen Fall „mehr als 10 Whiskys".

### 1. Seitenstruktur

```
(app)-Bereich  (jeder angemeldete, aktive Nutzer)
└─ /tastings                         „Tastings" (Bottom-Nav) — jetzt eine echte Liste
   │   pro Zeile: Datum · Ort · Gastgeber · Status-Badge
   │   Sortierung: kommende zuerst, dann vergangene
   │   Leerzustand: „Noch bist du bei keinem Tasting eingetragen."
   │   Ladezustand: Skeleton-Zeilen   Fehlerzustand: Hinweis + „Erneut versuchen"
   │
   └─ /tastings/[eventId]/whiskies   „Meine Whiskys" für diesen Abend
      ├─ Kontingent-Hinweis   „Du kannst 1 von 1 eintragen" /
      │                       „1 von 2 – ein Bonus als Gastgeber" / „Keine Begrenzung"
      ├─ Liste der eigenen Whiskys
      │   └─ pro Eintrag: Name · Video-Link-Symbol · „Bearbeiten" · „Entfernen"
      ├─ Button „Whisky hinzufügen"   (deaktiviert, wenn Kontingent voll)
      ├─ Dialog-Formular (Hinzufügen = Bearbeiten, dann vorbefüllt)
      │   ├─ Name            Pflicht, Freitext (1–200 Zeichen)
      │   ├─ Video-Link      optional, muss mit http:// oder https:// beginnen
      │   └─ Notiz für dich  optional, Freitext (bis 2000 Zeichen), nur du siehst sie
      ├─ Leerzustand: kurzer Erklärtext + „Whisky hinzufügen"
      ├─ „Eintragen geschlossen": Event läuft / ist abgeschlossen → nur Anzeige
      └─ „Seite nicht gefunden": kein Teilnehmer / Event-ID unbekannt
```

**Neue Bausteine**

- Seiten: `/tastings` (ersetzt den Platzhalter) mit `loading` / `error`;
  `/tastings/[eventId]/whiskies` mit `loading` / `error`.
- Komponenten unter `src/components/tasting/`: Tasting-Liste + Zeile, „Meine
  Whiskys"-Liste + Zeile, das Dialog-Formular, der Kontingent-Hinweis.
- `ConfirmDialog` (heute `src/components/admin/confirm-action.tsx`) wandert an
  einen gemeinsamen Ort und wird von hier wie von PROJ-3/PROJ-4 genutzt.
- Datenzugriff: eine Lese-Datei „meine Tastings / meine Whiskys + Kontingent",
  drei Schreib-Aktionen (hinzufügen / ändern / entfernen), ein Eingabe-Schema.

### 2. Datenmodell (nichts Neues an Tabellen)

PROJ-5 nutzt ausschließlich, was PROJ-1 gebaut hat:

- **`whiskies`** — die *sichtbare* Hälfte: nur eine laufende Position pro Whisky.
  Für alle Teilnehmer lesbar, in PROJ-5 aber **nicht** angezeigt (die Positionen
  sind für den Gläserstreifen in PROJ-8 da).
- **`whisky_details`** — die *geheime* Hälfte: Name, Video-Link, private Notiz und
  wer den Whisky mitbringt. Die Datenbank gibt einem Teilnehmer von dieser Tabelle
  nur die **eigenen** Zeilen heraus (der Gastgeber sieht alle, alle anderen erst
  nach dem Abschluss). PROJ-5 muss also nicht selbst filtern.

Ein Whisky besteht in PROJ-5 aus:
- **Name** (Pflicht, 1–200 Zeichen)
- **Video-Link** (optional, muss eine `http(s)`-Adresse sein)
- **Private Notiz** (optional, bis 2000 Zeichen)
- *(intern)* Bringer = der angemeldete Nutzer, Position = automatisch vergeben

**Kontingent** ist eine abgeleitete Zahl, kein gespeichertes Feld: Limit des
Abends (oder „kein Limit"), plus 1 wenn der Nutzer Gastgeber ist, minus die schon
eingetragenen eigenen Whiskys. Dazu die harte Obergrenze von 10 Whiskys pro Abend.

### 3. Wo geschrieben wird — alles über vorhandene Wege

| Aktion | Mechanismus | Prüfungen (in der Datenbank, nicht im Browser) |
|--------|-------------|-----------------------------------------------|
| Whisky **hinzufügen** | Server-Aktion → bestehende DB-Aktion `add_whisky` (PROJ-1) | Nutzer ist Teilnehmer · Event „In Vorbereitung" · Kontingent nicht überschritten (inkl. Gastgeber-Bonus) · höchstens 10 im Event · Position wird automatisch gesetzt |
| Whisky **bearbeiten** | Server-Aktion → direkte Änderung an `whisky_details` | DB-Regel `wd_update_own`: nur der Bringer, nur die Sachfelder (Name, Link, Notiz), nur solange „In Vorbereitung" |
| Whisky **entfernen** | Server-Aktion → bestehende DB-Aktion `remove_whisky` (PROJ-1) | Nur Bringer oder Admin · nur „In Vorbereitung" · die Positionslücke wird automatisch geschlossen |

Kein direkter Schreibzugriff auf `whiskies`; der Service-Schlüssel wird **nicht**
gebraucht. Jede Server-Aktion prüft zusätzlich vorab die Anmeldung — die Datenbank
bleibt aber die eigentliche Schranke (Muster wie PROJ-4).

### 4. Die eine kleine Backend-Änderung: eigene Fehlermeldung für „mehr als 10"

`add_whisky` meldet den Fall „mehr als 10 Whiskys pro Abend" heute mit demselben
Fehlercode wie „Ausschankreihenfolge unvollständig" (`TS008`) — dadurch käme im
Frontend der falsche Hilfetext. PROJ-5 gibt diesem Fall einen eigenen Code
(`TS016`) mit klarer Meldung („Für diesen Abend sind schon 10 Whiskys eingetragen
— mehr sind nicht vorgesehen."). Das ist eine kleine Migration plus ein Eintrag in
der Fehlertext-Liste; sonst ändert sich am Backend nichts.

*(Der Fall ist im Normalbetrieb kaum erreichbar — die Kontingent-Anzeige und die
Limit-Prüfung greifen vorher. Die saubere Meldung ist trotzdem jetzt billiger als
später.)*

### 5. Die „Tastings"-Liste

Der Tab zeigt die Abende, bei denen der Nutzer als Teilnehmer eingetragen ist —
kommende zuerst, dann vergangene. Die Datenbank gibt einem Teilnehmer ohnehin nur
„seine" Events heraus, eine einfache Abfrage reicht.

- Klick auf ein Event **„In Vorbereitung"** → „Meine Whiskys" (bearbeitbar).
- Klick auf ein **laufendes / abgeschlossenes** Event → vorerst ebenfalls „Meine
  Whiskys", dann im Nur-Anzeige-Modus mit dem Hinweis „Eintragen geschlossen". Die
  späteren Ziele (Bewertung PROJ-7, Dashboard PROJ-8, Historie PROJ-9) hängen sich
  hier an.

### 6. „Meine Whiskys" im Detail

- Beim Laden: die eigenen Whisky-Einträge für diesen Abend + der Event-Status + die
  Zahlen fürs Kontingent (Limit, bin-ich-Gastgeber, aktuelle Anzahl).
- **Kein Teilnehmer** dieses Events oder ID unbekannt → „Seite nicht gefunden"
  (die Datenbank liefert dann schlicht kein Event).
- Event **nicht** „In Vorbereitung" → Formular und Aktionen sind aus, die Liste
  bleibt als Anzeige, oben der Hinweis „Das Eintragen für diesen Abend ist
  geschlossen."
- Formular als **Dialog** (Hinzufügen) bzw. vorbefüllter Dialog (Bearbeiten) —
  konsistent mit dem Einladen-Dialog aus PROJ-3, auf dem Handy volle Breite.
- Nach jeder Aktion: kurze Bestätigung, die Liste aktualisiert sich, kein Neuladen
  der Seite.

### 7. Zustände & Rückmeldungen (nach `docs/design-system.md`)

- **Laden:** Skeleton-Zeilen.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen".
- **Aktion läuft:** Button im Ladezustand, kein Doppelklick.
- **Aktion schlägt fehl:** konkrete deutsche Meldung, das Formular behält die
  Eingaben.
- **Kontingent voll:** „Hinzufügen" deaktiviert mit Hinweis „Limit erreicht —
  entferne einen, um zu tauschen."
- **Video-Link ohne `http(s)`:** Meldung direkt am Feld, nichts wird gespeichert.
- **Leerzustand / Eintragen-geschlossen / Seite-nicht-gefunden** wie in Abschnitt 1.

### 8. Neue Pakete

Keine. Alles vorhanden (shadcn `dialog`, `form`, `input`, `button`, `card`,
`badge`, `skeleton`, `alert-dialog`; `date-fns` aus PROJ-4 für die Datumsanzeige).

*(Fehlt `textarea` als shadcn-Komponente noch, wird sie einmalig über die
Standard-Vorlage hinzugefügt — kein echtes Paket.)*

### 9. Betriebsvoraussetzung

Keine neue.

### 10. Wie der Erfolg geprüft wird

- **Unit-Tests** für die Kontingent-Berechnung (Limit, Gastgeber-Bonus, „kein
  Limit", 10er-Obergrenze) und die Eingaberegeln (Name Pflicht, Video-Link-Form,
  Längen).
- **Datenbank-Tests** (PROJ-1-Stil) für den neuen Fehlercode `TS016` und dafür,
  dass Bearbeiten nur dem Bringer und nur im Draft gelingt, Entfernen nur
  dem Bringer / Admin.
- **E2E-Tests** (Chromium + Mobile Safari): hinzufügen (Pflichtfeld,
  Video-Link-Validierung, Kontingent-Grenze, Gastgeber-Bonus), bearbeiten,
  entfernen mit Bestätigung, „Eintragen geschlossen" nach Start, Nicht-Teilnehmer
  sieht „nicht gefunden", ein Teilnehmer sieht die Whiskys eines anderen nicht.
- `npm run build` / `npm run lint` sauber.

## Implementation Notes (Frontend)

**Stand:** Seiten, Komponenten, Queries, Server Actions und die Eingaberegeln
geschrieben. **Rein clientseitig lauffähig gegen das vorhandene PROJ-1-Backend** —
`add_whisky` / `remove_whisky` / der direkte `whisky_details`-Update existieren
bereits. Der neue Fehlercode `TS016` (aus dem Tech Design) ist **noch nicht**
angelegt; bis dahin zeigt der äußerst seltene „>10 Whiskys"-Fall die etwas
unpassende `TS008`-Meldung. `/backend` = `TS016`-Migration + `errors.ts`-Eintrag,
danach `/qa`.

### Was gebaut wurde

**Gemeinsame Komponenten** — `ConfirmDialog` und `EventStatusBadge` von
`src/components/admin/` nach `src/components/common/` verschoben (`git mv`), die
zwei Admin-Importe angepasst. Kein Verhaltensunterschied.

**Eingaberegeln** — `src/lib/schemas/whiskies.ts`: `whiskyFormSchema`
(Name 1–200 Pflicht, Video-Link `''` oder `^https?://.+` bis 2048 Zeichen, Notiz
bis 2000). Unit-Tests `whiskies.test.ts` (8).

**Kontingent** — `src/lib/whisky-quota.ts`: `computeQuota()` (rein, testbar) —
Limit + Gastgeber-Bonus − eigene Anzahl, harte 10er-Obergrenze, fertiger
Hinweistext + `canAdd`. Unit-Tests `whisky-quota.test.ts` (8).

**Datenzugriff** — `src/lib/queries/tastings.ts`:
- `getMyTastings(userId)` — Events des Nutzers über `event_participants`
  (RLS-gescoped), Gastgebernamen per zweiter Abfrage, Sortierung kommende
  aufsteigend / vergangene absteigend.
- `getWhiskyEntryData(eventId, userId)` — prüft Teilnahme explizit (kein
  Teilnehmer → `null` → `notFound()`), lädt Event-Eckdaten, die **eigenen**
  `whisky_details` und die Gesamt-Whiskyzahl des Events (für die Obergrenze).

**Server Actions** — `src/lib/actions/whiskies.ts` (`'use server'`):
- `addWhiskyAction(eventId, input)` → `add_whisky`-RPC.
- `updateWhiskyAction(eventId, whiskyId, input)` → **direkter, spaltengenauer
  `whisky_details`-Update** (RLS `wd_update_own` erzwingt Bringer + Draft); 0
  betroffene Zeilen → verständliche Fehlermeldung.
- `removeWhiskyAction(eventId, whiskyId)` → `remove_whisky`-RPC.
- Jede prüft Login vorab, mappt DB-Fehler über `messageForDbError`, revalidiert
  `/tastings/[eventId]/whiskies`.

**Seiten**
- `(app)/tastings/page.tsx` — ersetzt den Platzhalter: `requireUser` +
  `getMyTastings` + `<TastingList>`. Dazu `loading.tsx` (Skeleton) und
  `error.tsx` (Retry + „Zur Startseite").
- `(app)/tastings/[eventId]/whiskies/page.tsx` — `requireUser`,
  `getWhiskyEntryData` → `notFound()` bei `null`; `computeQuota`; „Zurück"-Link;
  bei Status ≠ `draft` ein `Alert` „Eintragen geschlossen"; `<WhiskySection>`.
  Dazu `loading.tsx` und `error.tsx`.

**Komponenten** — `src/components/tasting/`:
- `tasting-list` / `tasting-row` — anklickbare Zeilen (Datum · Ort · Gastgeber ·
  Status-Badge) → `/tastings/[id]/whiskies`; Leerzustand als Karte.
- `whisky-section` (Client) — Kontingent-Hinweis, „Whisky hinzufügen" (deaktiviert
  bei `!canAdd`), Liste der eigenen Whiskys mit Video-Link (`target="_blank"
  rel="noopener noreferrer"`) und Notiz, je Zeile „Bearbeiten"/„Entfernen"
  (Entfernen hinter `ConfirmDialog`), im Nur-Anzeige-Modus ohne Aktionen. Nach
  jeder Aktion `router.refresh()`.
- `whisky-form-dialog` (Client) — RHF + Zod, dient Anlegen **und** Bearbeiten; der
  Aufrufer setzt beim Moduswechsel einen anderen `key`, damit die Startwerte
  frisch übernommen werden.

### Verifikation in dieser Session
- `npm run build` ✅ · `npm run lint` ✅ · `npm test` ✅ (40, davon 16 neu) · `tsc` ✅
  (über den Build)
- Smoke gegen `next start`: `/tastings` und `/tastings/<uuid>/whiskies` leiten
  unangemeldet sauber auf `/login?redirect=…` (kein 500).
- **Nicht** getestet (braucht echte Daten / `/qa`): das Eintragen/Bearbeiten/
  Entfernen im Browser, das Kontingent-Verhalten am echten Event, die
  „Eintragen geschlossen"-Ansicht, Blindheit gegenüber anderen Teilnehmern.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
