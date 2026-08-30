# PROJ-10: Profil-Seite mit persönlicher Bilanz

## Status: Approved
**Created:** 2026-08-30
**Last Updated:** 2026-08-30

## Dependencies
- **Requires: PROJ-9 (Ergebnisse & Tasting-Historie)** — die Bilanz-Kennzahlen
  „beste Platzierung" und „Ø vergebene Punkte" lesen die Ranglisten-View
  `whisky_rankings` (nur abgeschlossene Events, seit PROJ-9 für jedes aktive
  Mitglied lesbar).
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — Login, App-Shell mit
  „Profil"-Tab, `requireUser`. Die Platzhalter-Seite `/profil` stammt von hier.
- **Baut auf PROJ-1** — die `profiles`-Tabelle (`display_name`, `favorite_dram`,
  `favorite_region`, `bio` samt CHECK-Constraints), die RLS-Policy
  `profiles_update_own` und der Spalten-GRANT, der genau diese vier Felder
  schreibbar macht. `event_participants`, `whisky_details`, `ratings` für die
  Bilanz-Zählungen.

## Kontext

Die Profil-Seite ist der einzige Ort, an dem ein Mitglied **seine eigenen
Stammdaten** pflegt — Anzeigename, Lieblings-Dram, Lieblingsregion, eine kurze
Selbstbeschreibung — und **seine persönliche Bilanz** über alle bisherigen Abende
sieht: wie viele Tastings, wie viele mitgebrachte Whiskys, die beste Platzierung
und der Schnitt der selbst vergebenen Punkte.

Heute ist `/profil` ein Platzhalter (Name · E-Mail · Rolle · „Abmelden"). PROJ-10
ersetzt ihn durch ein bearbeitbares Formular plus eine Bilanz-Karte. E-Mail,
Rolle und der „Abmelden"-Knopf bleiben als reine Anzeige erhalten.

Die Bilanz ist **rein persönlich** — sie vergleicht nichts mit anderen Mitgliedern
und rechnet nur über **abgeschlossene** Tastings, damit ein laufender Abend die
Zahlen nicht mitten im Tasting verschiebt.

## User Stories

- Als **Mitglied** möchte ich meinen Anzeigenamen ändern können, damit ich in
  Teilnehmerlisten und Ranglisten so heiße, wie ich möchte.
- Als **Mitglied** möchte ich meinen Lieblings-Dram, meine Lieblingsregion und
  eine kurze Beschreibung hinterlegen, damit die Runde mich besser einordnen kann.
- Als **Mitglied** möchte ich auf einen Blick sehen, an wie vielen Tastings ich
  teilgenommen und wie viele Whiskys ich mitgebracht habe.
- Als **Mitglied** möchte ich meine beste Platzierung sehen — welcher meiner
  Whiskys wie weit vorne lag — damit ich weiß, womit ich die Runde überzeugt habe.
- Als **Mitglied** möchte ich den Schnitt der von mir vergebenen Punkte sehen,
  damit ich einschätzen kann, ob ich eher milde oder streng bewerte.
- Als **neues Mitglied** möchte ich eine verständliche Profilseite vorfinden,
  auch wenn ich noch an keinem Tasting teilgenommen habe.

## Out of Scope

- **Fremde Profile ansehen** — PROJ-10 zeigt und bearbeitet nur das eigene
  Profil. Eine Ansicht fremder Profile (z. B. aus der Teilnehmerliste) ist ein
  eigener Screen für ein späteres Feature.
- **Avatar / Foto** — PRD-Non-Goal „keine Fotos oder Datei-Uploads". Kein
  Upload, auch kein `avatar_url`-URL-Textfeld (würde nirgends angezeigt).
- **E-Mail oder Passwort ändern** — Auth-Thema (PROJ-2). Die E-Mail steht hier
  nur als nicht editierbare Anzeige.
- **Rolle ändern** — macht der Admin (PROJ-3). Die Rolle ist reine Anzeige.
- **Runden-übergreifende Vergleiche** — kein „du bewertest härter als der
  Schnitt", keine Mitglieder-Rangliste. Nur die eigenen vier Kennzahlen.
  (PRD-Non-Goal.)
- **Verlaufsdiagramme / Zeitreihen** — keine Kurve „Ø-Punkte über die Jahre",
  nur die aktuellen Werte.
- **Aufschlüsselung / Absprünge aus der Bilanz** — kein Klick von „3 Tastings"
  auf eine Liste; die beste Platzierung nennt den einen Abend, mehr nicht.
  Absprünge in die Historie macht PROJ-9.
- **Konto deaktivieren oder löschen** — nicht vorgesehen.
- **Bearbeitbare Kennzahlen** — die Bilanz ist berechnet, nichts daran ist
  eingebbar.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Stammdaten bearbeiten

- [ ] Angenommen ein Mitglied öffnet `/profil`, wenn die Seite lädt, dann sind
      die Felder Anzeigename, Lieblings-Dram, Lieblingsregion und Kurzbeschreibung
      mit den gespeicherten Werten vorbefüllt; E-Mail und Rolle stehen als nicht
      editierbare Anzeige daneben.
- [ ] Angenommen ein Mitglied ändert einen oder mehrere Werte, wenn es auf
      „Speichern" tippt, dann werden die Werte gespeichert, es erscheint der
      Hinweis „Profil gespeichert." und die Seite zeigt die neuen Werte.
- [ ] Angenommen das Feld Anzeigename ist leer (oder nur Leerzeichen), wenn das
      Mitglied speichert, dann erscheint unter dem Feld „Anzeigename ist
      erforderlich" und nichts wird gespeichert.
- [ ] Angenommen ein Textfeld überschreitet sein Zeichenlimit (Anzeigename 80,
      Lieblings-Dram / Lieblingsregion 120, Kurzbeschreibung 500), wenn das
      Mitglied speichert, dann erscheint ein Zeichenlimit-Hinweis am Feld und
      nichts wird gespeichert.
- [ ] Angenommen ein optionales Feld wird geleert, wenn das Mitglied speichert,
      dann wird das Feld als „nicht gesetzt" gespeichert (nicht als leerer Text).
- [ ] Angenommen der Speichervorgang läuft, wenn das Mitglied erneut auf
      „Speichern" tippt, dann bleibt der Button gesperrt / zeigt „Wird
      gespeichert…" und es wird nicht doppelt gespeichert.
- [ ] Angenommen das Speichern schlägt fehl (Netz/Server), wenn der Fehler
      eintritt, dann bleibt die Eingabe im Formular erhalten und es erscheint
      eine Fehlermeldung.
- [ ] Angenommen ein Mitglied hat seinen Anzeigenamen geändert, wenn danach ein
      abgeschlossenes Tasting oder eine Teilnehmerliste geöffnet wird, dann steht
      dort der neue Name (rückwirkend, kein Schnappschuss).

### Persönliche Bilanz

- [ ] Angenommen ein Mitglied war an N abgeschlossenen Tastings als Teilnehmer
      eingetragen, wenn es die Bilanz betrachtet, dann zeigt „Anzahl Tastings"
      die Zahl N (laufende und vorbereitete Events zählen nicht mit).
- [ ] Angenommen ein Mitglied hat zu abgeschlossenen Tastings M Whiskys
      mitgebracht, wenn es die Bilanz betrachtet, dann zeigt „Mitgebrachte
      Whiskys" die Zahl M.
- [ ] Angenommen mindestens einer der mitgebrachten Whiskys eines Mitglieds
      wurde in einem abgeschlossenen Tasting platziert, wenn es die Bilanz
      betrachtet, dann zeigt „Beste Platzierung" den besten je erreichten Rang
      als „{n}. Platz" samt Whisky-Name und Datum des Abends; bei mehreren gleich
      guten Rängen der jüngste Abend.
- [ ] Angenommen ein Mitglied hat noch nie einen Whisky zu einem abgeschlossenen
      Tasting mitgebracht, wenn es die Bilanz betrachtet, dann steht bei „Beste
      Platzierung" „noch keine Platzierung".
- [ ] Angenommen ein Mitglied hat in abgeschlossenen Tastings insgesamt K
      Bewertungen abgegeben, wenn es die Bilanz betrachtet, dann zeigt „Ø
      vergebene Punkte" das Mittel der Gesamtpunkte (Nase + Geschmack) mit einer
      Nachkommastelle und Komma (z. B. „Ø 11,4") sowie klein „aus K Bewertungen".
- [ ] Angenommen ein Mitglied hat noch keine Bewertung in einem abgeschlossenen
      Tasting abgegeben, wenn es die Bilanz betrachtet, dann steht bei „Ø
      vergebene Punkte" „—".
- [ ] Angenommen ein neu eingeladenes Mitglied ohne abgeschlossenes Tasting
      öffnet `/profil`, wenn die Bilanz lädt, dann zeigt sie „0" bzw. „—"
      /„noch keine Platzierung" und darüber den Hinweis „Deine Bilanz füllt sich,
      sobald dein erstes Tasting abgeschlossen ist." (keine leere Karte, kein
      Fehler).
- [ ] Angenommen die Bilanz-Daten lassen sich nicht laden (View-/DB-Fehler),
      wenn das Mitglied `/profil` öffnet, dann bleibt das Formular bedienbar und
      nur die Bilanz-Karte zeigt „Bilanz gerade nicht verfügbar".

## Edge Cases

- **Nur-Leerzeichen-Anzeigename** → wird getrimmt; danach leer ⇒ „Anzeigename
  ist erforderlich".
- **Trailing-Whitespace in optionalen Feldern** → beim Speichern getrimmt.
- **Feld über Limit trotz Client-`maxlength`** → DB-CHECK greift, Server Action
  meldet verständlich, nichts wird gespeichert.
- **Speichern schlägt fehl** → Fehlermeldung, Eingaben bleiben stehen.
- **Dasselbe Profil in zwei Tabs** → letzter Speichervorgang gewinnt, kein
  Konflikt-Dialog (Ein-Personen-Seite).
- **Bilanz-View wirft, Formular lädt** → Seite bleibt nutzbar, nur die
  Bilanz-Karte zeigt den Fehlerhinweis.
- **Anzeigename ändern, während ein Tasting läuft** → erlaubt; der Name wechselt
  sofort überall (auch im laufenden Abend), die Bilanz-Zahlen bewegt es nicht
  (die zählen nur abgeschlossene Events).
- **Mitglied wurde deaktiviert** → kommt gar nicht bis `/profil` (`requireUser`
  leitet auf die Abmelde-Route).
- **Ein mitgebrachter Whisky in einem Tasting ganz ohne Bewertungen** → er hat
  in der Ranglisten-View trotzdem einen Rang (0 Punkte); er zählt bei
  „Mitgebrachte Whiskys" mit und kann theoretisch die „beste Platzierung"
  stellen. (Siehe Open Questions.)

## Technical Requirements (optional)

- **Sicherheit:** Login erforderlich. Schreiben nur die eigene Zeile
  (`profiles_update_own` + Spalten-GRANT auf genau die vier Felder — `role` /
  `is_active` sind darüber nicht erreichbar). Kein Selbst-Upgrade zum Admin.
- **Validierung:** clientseitig (Zod + `maxlength`) **und** serverseitig; die
  DB-CHECKs sind die letzte Instanz.
- **Darstellung:** mobile-first, eine Spalte ab 375 px. Die Bilanz-Kennzahlen
  groß und in der Display-Schrift (Design-System: „Punktzahlen sind der Held").
- **Performance:** reine Lesezugriffe für die Bilanz; Serverkomponente, kein
  Client-Fetch-Wasserfall.
- **Browser:** Chrome, Firefox, Safari (mobil priorisiert).

## Open Questions

- [x] ~~Zählt ein mitgebrachter Whisky aus einem Tasting ganz ohne Bewertungen
      mit?~~ **Gelöst (`/architecture`):** „Mitgebrachte Whiskys" zählt **jeden**
      eigenen Whisky in einem abgeschlossenen Tasting. „Beste Platzierung"
      berücksichtigt nur Ränge von Whiskys mit **mindestens einer Bewertung**
      (`rating_count > 0`) — ein „1. Platz" ohne jede Bewertung wäre hohl.
- [x] ~~Eigene DB-View / RPC nötig?~~ **Gelöst:** nein. Die Bilanz setzt sich
      aus vier RLS-abgesicherten Lesezugriffen zusammen (Teilnahme-Zähler,
      `whisky_rankings` gefiltert auf `brought_by`, `ratings` gefiltert auf die
      eigene Person mit `!inner`-Verknüpfung auf abgeschlossene Events, ein
      Datums-Lookup fürs beste Ergebnis). **Keine Migration.**
- [x] ~~Ø über alle Zeilen oder je Tasting?~~ **Gelöst:** einfacher Mittelwert
      über alle eigenen Bewertungszeilen in abgeschlossenen Tastings.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Alle vier Bilanz-Kennzahlen rechnen nur über **abgeschlossene** Tastings | Ein laufender Abend soll die Zahlen nicht mitten im Tasting verschieben; deckt sich mit der Ranglisten-View, die ohnehin nur abgeschlossene Events kennt | 2026-08-30 |
| „Ø vergebene Punkte" = **eine** Zahl (Mittel der Gesamtpunkte), eine Nachkommastelle mit Komma, dazu „aus K Bewertungen"; 0 Bewertungen → „—" | Gesamtpunkte sind auch in der Rangliste die Leitzahl; getrenntes Nase-/Geschmack-Ø ist mehr Statistik als die Runde braucht | 2026-08-30 |
| „Beste Platzierung" als „{n}. Platz" + Whisky-Name + Datum; bei Gleichstand der jüngste Abend; nie mitgebracht → „noch keine Platzierung" | Die Kontextzeile macht die Zahl greifbar („womit habe ich überzeugt"), ohne einen zweiten Screen zu brauchen | 2026-08-30 |
| Vier bearbeitbare Felder: `display_name` (Pflicht 1–80), `favorite_dram` (≤120), `favorite_region` (≤120), `bio` (≤500). **Kein Avatar** | Genau die Felder, die der Spalten-GRANT schreibbar macht; PRD-Non-Goal schließt Foto-Uploads aus; ein `avatar_url`-Feld hätte keine Darstellung | 2026-08-30 |
| E-Mail und Rolle bleiben als nicht editierbare Anzeige, „Abmelden" bleibt | E-Mail-Wechsel ist Auth-Thema (PROJ-2), Rolle setzt der Admin (PROJ-3); die Seite bleibt der eine Ort für „wer bin ich hier" | 2026-08-30 |
| Nur das **eigene** Profil ansehen/bearbeiten; keine fremden Profile | Fremdansicht ist ein eigener Screen mit eigenen Sichtbarkeitsfragen — späteres Feature, nicht der P2-MVP | 2026-08-30 |
| Anzeigename ändert sich **rückwirkend überall**, kein Schnappschuss pro Event | Kleine, vertraute Runde; wer sich umbenennt, will auch in der Historie so heißen | 2026-08-30 |
| Speichern: Server Action → direkter `profiles`-Update, Toast, Inline-Validierung, Button-Sperre während des Speicherns; letzter Schreibvorgang gewinnt | Gleiches Muster wie Eckdaten (PROJ-6) / Bewertung (PROJ-7); Konflikt-Dialog bei einer Ein-Personen-Seite unnötig | 2026-08-30 |
| Neues Mitglied: Bilanz-Karte zeigt Nullwerte + Hinweis statt ausgeblendet zu sein | Kein Rätselraten, warum die Karte fehlt; der Hinweis erklärt, wann sie sich füllt | 2026-08-30 |
| Bilanz-Ladefehler blockiert die Seite nicht — nur die Karte zeigt „nicht verfügbar" | Das Bearbeiten der Stammdaten muss auch dann gehen, wenn die Auswertungs-Reads klemmen | 2026-08-30 |
| Optionale Felder leer → als NULL speichern, nicht als leerer String | Saubere Daten; „nicht gesetzt" und „leer eingegeben" sind dasselbe | 2026-08-30 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| **Kein Backend** — keine Migration, keine RPC, keine neue View | Die vier Schreibfelder haben seit PROJ-1 die Policy `profiles_update_own` + einen Spalten-GRANT genau auf `display_name` / `favorite_dram` / `favorite_region` / `bio`; die Bilanz-Zahlen lesen bestehende Tabellen und die `whisky_rankings`-View (seit PROJ-9 für jedes aktive Mitglied lesbar) | 2026-08-30 |
| Speichern über eine **Server Action mit direktem, spaltenbeschränktem `profiles`-Update** (kein RPC) | Identisches Muster wie `updateWhiskyAction` (PROJ-5): RLS erzwingt die eigene Zeile, der GRANT erzwingt die Spalten, `updated_at` setzt der Trigger. Ein RPC brächte keinen Sicherheitsgewinn | 2026-08-30 |
| Bilanz als **Serverkomponenten-Query aus vier Lesezugriffen**, Aggregation (Ø, min-Rang) in JavaScript | PostgREST kann `count` (Head-Request), aber nicht `avg` / `min` ohne RPC/View. Die Datenmengen sind winzig (ein Mitglied: ~1–2 Whiskys und ~8 Bewertungen pro Abend, wenige Abende/Jahr) — ein paar hundert Zeilen im Mittel. JS-Aggregation ist einfacher und testbar | 2026-08-30 |
| „Beste Platzierung" nur aus Whiskys mit `rating_count > 0`; bei Ranggleichheit der **jüngste** Abend | Ein „1. Platz" ohne jede Bewertung wäre irreführend; die Kontextzeile soll den überzeugendsten realen Auftritt zeigen | 2026-08-30 |
| Abschlussfilter für „Ø vergebene Punkte" über einen **`!inner`-Embed** `ratings → tasting_events(status = 'closed')` | Ein Lesezugriff statt zwei; `ratings` selbst trägt keinen Status | 2026-08-30 |
| Bilanz-Ladefehler wird in der **Seite abgefangen** (try/catch um die Query); nur die Bilanz-Karte zeigt dann „nicht verfügbar" | Das Bearbeiten der Stammdaten darf nicht an einem klemmenden Auswertungs-Read hängen (Spec-AC) | 2026-08-30 |
| Formular clientseitig mit **react-hook-form + Zod** (`profileFormSchema`), serverseitig dieselbe Schema-Prüfung, DB-CHECK als letzte Instanz | Projektstandard (Eckdaten PROJ-6, Bewertung PROJ-7); dreifache Absicherung | 2026-08-30 |
| Optionale Felder: leerer/geleerter Wert wird als **NULL** gespeichert (Server Action bildet `'' → null` ab) | „nicht gesetzt" und „leer eingegeben" sind dasselbe; verhindert leere Strings in der DB | 2026-08-30 |
| Keine neuen npm-Pakete | react-hook-form, zod, @hookform/resolvers und die shadcn-Bausteine (`form`, `input`, `textarea`, `card`, `alert`) sind alle vorhanden | 2026-08-30 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-10 ist **reine Frontend-Arbeit**. Es gibt keine Datenbank-Änderung:

- Die vier bearbeitbaren Felder sind seit PROJ-1 genau so vorgesehen — eine
  Sicherheitsregel „nur die eigene Zeile" und eine Spalten-Freigabe genau auf
  `display_name`, `favorite_dram`, `favorite_region`, `bio`. `role` und der
  Aktiv-Status sind darüber **nicht** erreichbar, ein Selbst-Upgrade zum Admin
  also ausgeschlossen.
- Die vier Bilanz-Zahlen ergeben sich aus Lesezugriffen auf schon vorhandene
  Daten: die Teilnahmeliste, die Ranglisten-View aus PROJ-9 und die eigenen
  Bewertungen.

Kein API-Endpunkt, kein RPC, keine neue View, keine neuen Pakete.

### A) Seiten- und Komponentenstruktur

```
/profil  (ersetzt den Platzhalter)
├─ Seitenkopf  „Profil"
├─ Stammdaten-Formular  (Client)
│   ├─ Anzeigename          Pflicht, 1–80
│   ├─ Lieblings-Dram       optional, ≤120
│   ├─ Lieblingsregion      optional, ≤120
│   ├─ Kurzbeschreibung     optional, ≤500, mehrzeilig
│   ├─ Fehler-Hinweis (rot) bei Speicherfehler, Eingaben bleiben stehen
│   └─ „Speichern"          gesperrt / „Wird gespeichert…" während der Anfrage
├─ Konto-Anzeige  (nicht editierbar)
│   ├─ E-Mail
│   └─ Rolle  (Admin / Teilnehmer)
├─ Persönliche Bilanz  (Server)
│   ├─ Zustand „vorhanden"
│   │   ├─ Anzahl Tastings        (Zahl, groß)
│   │   ├─ Mitgebrachte Whiskys   (Zahl, groß)
│   │   ├─ Beste Platzierung      „{n}. Platz" + Whisky · Datum  /  „noch keine Platzierung"
│   │   └─ Ø vergebene Punkte     „Ø 11,4"  + „aus K Bewertungen"  /  „—"
│   ├─ Zustand „neu"  (alle Werte 0 / —)  → zusätzlich der Hinweis
│   │     „Deine Bilanz füllt sich, sobald dein erstes Tasting abgeschlossen ist."
│   └─ Zustand „Ladefehler"  → „Bilanz gerade nicht verfügbar"
├─ „Abmelden"  (bestehender Button, unverändert)
├─ Laden        → Skelett
└─ Ladefehler (Formular)  → Hinweis + „Erneut versuchen"
```

**Neue Bausteine**

- `src/app/(app)/profil/page.tsx` — Umbau von Platzhalter zu Formular + Konto +
  Bilanz; dazu `loading.tsx` / `error.tsx` (gleiche Konvention wie die anderen
  Routen).
- `src/components/profile/profile-form.tsx` (Client) — spiegelt
  `eckdaten-form.tsx`: react-hook-form + Zod-Resolver, `useTransition`,
  Server-Action-Aufruf, Erfolgs-Toast, roter Sammel-Fehler.
- `src/components/profile/balance-card.tsx` (Server) — die vier Kennzahlen,
  der „neu"-Hinweis und die „nicht verfügbar"-Variante.
- `src/lib/schemas/profile.ts` — `profileFormSchema`.
- `src/lib/actions/profile.ts` — `updateProfileAction`.
- `src/lib/queries/profile.ts` — `getPersonalBalance(userId)`.
- `src/lib/personal-balance.ts` (+ `personal-balance.test.ts`) — reine
  Ableitungen (Ø formatieren, besten Rang wählen, „neu"-Erkennung).
- Wiederverwendet: `PageHeader`, `Form`/`Input`/`Textarea`/`Card`/`Alert`,
  `formatEventDate`, `messageForDbError`, `getSessionContext` / `requireUser`.

### B) Woher die Daten kommen

| Anzeige | Quelle | Zugriff |
|---|---|---|
| Formular-Startwerte, E-Mail, Rolle | `requireUser()` (Profil + Session, bereits geladen) | eigene Zeile |
| Speichern | direkter, spaltenbeschränkter `profiles`-Update (`display_name`, `favorite_dram`, `favorite_region`, `bio`) | `profiles_update_own` + Spalten-GRANT |
| Anzahl Tastings | `event_participants` (`profile_id` = ich) mit Pflicht-Verknüpfung auf `tasting_events` (Status „abgeschlossen") — Head-Zähler | RLS: eigene Teilnahme sichtbar |
| Mitgebrachte Whiskys · Beste Platzierung | View `whisky_rankings`, gefiltert `brought_by` = ich (liefert je Whisky: Rang, Anzahl Bewertungen, Name, Position, Event-ID) | seit PROJ-9 für aktive Mitglieder lesbar |
| Datum zum besten Ergebnis | ein `tasting_events`-Lookup auf die eine Event-ID | RLS: Teilnehmer |
| Ø vergebene Punkte | `ratings` (`profile_id` = ich) mit Pflicht-Verknüpfung auf `tasting_events` (Status „abgeschlossen"), Feld Gesamtpunkte + Zähler | `ratings_select` = eigene Zeilen |

Alle Bilanz-Reads laufen in der Serverkomponente; die Mittelung und die
Auswahl des besten Rangs passieren in JavaScript (die Zeilenmengen sind sehr
klein). Schlägt einer dieser Reads fehl, fängt die Seite das ab und rendert
statt der Karte den „nicht verfügbar"-Hinweis — das Formular bleibt nutzbar.

### C) Datenmodell

**Keine Änderung.** Genutzt werden bestehende Strukturen:

- `profiles`: `display_name` (1–80), `favorite_dram` (≤120), `favorite_region`
  (≤120), `bio` (≤500) — alle mit DB-CHECK; die letzten drei dürfen NULL sein.
- `event_participants` (Zuordnung ich ⇄ Event), `tasting_events.status`
  (Filter „abgeschlossen").
- `whisky_rankings` (PROJ-1/PROJ-9): pro Whisky eines abgeschlossenen Events —
  `brought_by`, `rank`, `rating_count`, `name`, `position`, `event_id`.
- `ratings`: `total_points` (generiert = Nase + Geschmack) der eigenen Zeilen.

**Ableitungen (`src/lib/personal-balance.ts`, unit-getestet):**

- **Ø vergebene Punkte:** Summe der Gesamtpunkte ÷ Anzahl der eigenen
  Bewertungszeilen (abgeschlossene Events), eine Nachkommastelle, Komma; bei 0
  Zeilen → `null` (Anzeige „—").
- **Beste Platzierung:** unter den eigenen `whisky_rankings`-Zeilen mit
  `rating_count > 0` die mit dem kleinsten `rank`; bei Gleichstand die mit dem
  jüngsten Event-Datum. Ergebnis: Rang + Whisky-Name + Datum; keine solche
  Zeile → `null` (Anzeige „noch keine Platzierung").
- **„Neu"-Erkennung:** Anzahl Tastings = 0 **und** mitgebrachte Whiskys = 0
  **und** keine Bewertungen → zeigt den „füllt sich"-Hinweis.

### D) Backend-Bedarf

**Keiner.** Bearbeiten läuft über RLS + Spalten-GRANT (seit PROJ-1), die
Bilanz über Lesezugriffe auf Bestehendes. Es gibt keine Migration, kein RPC,
keine neue View, keine Realtime-Anbindung (die Profilseite ist nicht live).

### E) Auswirkungen auf bereits gebaute Teile

- `src/app/(app)/profil/page.tsx` wird ersetzt (der bisherige Platzhalter-Text
  „… in einem späteren Schritt bearbeiten" entfällt).
- Der **Anzeigename** wirkt rückwirkend: Teilnehmerlisten (PROJ-8), „mitgebracht
  von" und Einzelbewertungen (PROJ-9), Gastgeber-Name in der Historie — alle
  lesen `profiles.display_name` live, es gibt nichts anzupassen.
- Kein anderer Screen ändert sich.

### F) Neue Pakete

Keine.

### G) Sicherheits- und Datenschutz-Betrachtung

- **Schreibgrenze:** Nur die eigene Profilzeile, nur die vier freigegebenen
  Spalten. `role` / Aktiv-Status sind über den Client-Pfad nicht setzbar
  (Spalten-GRANT), zusätzlich prüft die Server Action die angemeldete Person.
- **Bilanz liest nur Eigenes bzw. ohnehin Sichtbares:** eigene Teilnahmen,
  eigene Bewertungen, und `whisky_rankings` (nur abgeschlossene Events, für jedes
  aktive Mitglied — die Blindheit ist dort schon gewahrt). Kein Zugriff auf
  fremde Rohbewertungen oder fremde Notizen.
- **Validierung** dreifach: Zod im Client, dieselbe Prüfung in der Server
  Action, DB-CHECK als letzte Instanz. Anzeigename wird getrimmt; nur
  Leerzeichen ⇒ Pflichtfehler.
- **Kein Realtime, kein Cross-Device-Zustand** — die Seite ist statisch pro
  Aufruf.

## Implementation Notes (Frontend)

**Stand:** UI komplett. **Kein Backend** — bearbeitet über die bestehende RLS
(`profiles_update_own` + Spalten-GRANT aus PROJ-1), Bilanz aus Lesezugriffen auf
Bestehendes. Keine Migration, kein RPC, keine `types.ts`-Änderung.

### Was gebaut wurde

**Ableitungslogik** — `src/lib/personal-balance.ts` (rein, 9 Unit-Tests in
`personal-balance.test.ts`): `formatAvgGiven` (Ø der Gesamtpunkte, eine
Nachkommastelle mit Komma, `null` bei 0), `pickBestPlacement` (kleinster Rang
unter Whiskys mit `ratingCount > 0`, bei Gleichstand jüngstes Datum),
`ordinalPlace` („{n}. Platz"). Typen `PersonalBalance` / `BestPlacement` /
`RankingRowLike`.

**Datenzugriff** — `src/lib/queries/profile.ts`: `getPersonalBalance(userId)` →
drei parallele Reads (`event_participants` eigene, `whisky_rankings` gefiltert
`brought_by`, `ratings` eigene) + ein `tasting_events`-Lookup (Datum + Status)
für die Vereinigungsmenge der Event-IDs. Anzahl Tastings = eigene Teilnahmen an
abgeschlossenen Events; mitgebrachte Whiskys = Zeilen in `whisky_rankings` (die
View ist bereits closed-only); Ø = Mittel der `total_points` über eigene
Bewertungen in abgeschlossenen Events. Wirft bei Lesefehler.

**Stammdaten** — `src/lib/schemas/profile.ts` (`profileFormSchema`: displayName
1–80 Pflicht, favoriteDram/favoriteRegion ≤120, bio ≤500, optionale `''` →
serverseitig `null`) · `src/lib/actions/profile.ts` (`updateProfileAction` —
spaltengenauer Direkt-`update` auf `profiles`, `data.length === 0` → „bitte neu
anmelden", `messageForDbError`, `revalidatePath('/profil')`).

**Komponenten** — `src/components/profile/profile-form.tsx` (Client, spiegelt
`eckdaten-form`: RHF + Zod-Resolver, `useTransition`, Toast „Profil
gespeichert.", roter Sammel-Fehler, `maxLength` je Feld) ·
`src/components/profile/balance-card.tsx` (Server: 2×2-Raster mit großen Zahlen
in Display-Schrift; `bestPlacement === null` → „—" / „noch keine Platzierung";
`avgPointsGiven === null` → „—"; `isFresh` → Hinweis „füllt sich …"; `balance ===
null` → „Bilanz gerade nicht verfügbar.").

**Seite** — `src/app/(app)/profil/page.tsx` von Platzhalter zu
Formular + Konto-Karte (E-Mail / Rolle, nicht editierbar) + Bilanz-Karte +
„Abmelden" (unverändert). `getPersonalBalance` in `try/catch` → Fehler blockiert
die Seite nicht, nur die Karte. Dazu `loading.tsx` / `error.tsx`.

### Checks
- `npm test` → 108/108 (12 Dateien; +9 aus `personal-balance.test.ts`).
- `npx tsc --noEmit` · `eslint .` · `npm run build` → alle sauber.

## QA Test Results

**Tested:** 2026-08-30
**App URL:** http://localhost:3000 (prod-Build)
**Tester:** QA Engineer (AI)

### Automatisierte Suiten

| Suite | Ergebnis |
|-------|----------|
| `npm test` (Vitest Unit) | **108/108** (12 Dateien; +9 aus `personal-balance.test.ts`) |
| `npm run test:rls` (Integration) | **90/90** — unverändert, kein Regress (PROJ-10 fasst keine RLS/DB an) |
| `tests/PROJ-10-profil-bilanz.spec.ts` | **18/18** über `chromium` + `Mobile Safari` (9 Tests je Projekt) |
| `tsc --noEmit` · `eslint .` · `npm run build` | alle sauber; Route `/profil` erzeugt |
| Regression `tests/PROJ-2-auth.spec.ts` | **24/24** nach Fix von BUG-1 (3 veraltete Assertions) |

### Acceptance Criteria Status — 16/16 bestanden

#### Stammdaten bearbeiten
- [x] Formular mit gespeicherten Werten vorbefüllt; E-Mail + Rolle als nicht editierbare Anzeige (E2E)
- [x] Ändern + „Speichern" → „Profil gespeichert.", DB aktualisiert (E2E, Read-Back per Service-Client)
- [x] Leerer / nur-Leerzeichen-Anzeigename → „Anzeigename ist erforderlich", nichts gespeichert (E2E)
- [x] Feld über Limit → Zeichenlimit-Hinweis, nichts gespeichert (Zod `.max()` im Client **und** Server; `maxLength` am Input; DB-CHECK + `messageForDbError('23514')` als Backstop)
- [x] Optionales Feld geleert → als NULL gespeichert (E2E, Read-Back zeigt `null`)
- [x] Während des Speicherns Button gesperrt / „Wird gespeichert…" (`disabled={pending}` + Label-Wechsel; kein Doppel-Submit)
- [x] Speichern schlägt fehl → Fehlermeldung, Eingaben bleiben (`form.setError('root')`, RHF behält die Werte)
- [x] Anzeigename wirkt rückwirkend — neuer Name in einem abgeschlossenen Tasting (E2E: geänderter Name erscheint als „mitgebracht von …" auf der PROJ-9-Ergebnisseite)

#### Persönliche Bilanz
- [x] Anzahl Tastings = abgeschlossene Teilnahmen (E2E: Veteran = 2; laufende/vorbereitete zählen nicht)
- [x] Mitgebrachte Whiskys = eigene Einträge in abgeschlossenen Tastings (E2E: Veteran = 3)
- [x] Beste Platzierung als „{n}. Platz" + Whisky-Name + Datum (E2E: „1. Platz" · Ardbeg Uigeadail)
- [x] Nie mitgebracht → „noch keine Platzierung" (E2E: Rookie)
- [x] Ø vergebene Punkte = Mittel der Gesamtpunkte, eine Nachkommastelle mit Komma, + „aus K Bewertungen" (E2E: „Ø 10,0" · „aus 2 Bewertungen")
- [x] Keine Bewertung abgegeben → „—" / „noch nichts bewertet" (E2E: Rookie)
- [x] Neues Mitglied → „0"/„—" + Hinweis „Deine Bilanz füllt sich, sobald dein erstes Tasting abgeschlossen ist." (E2E: Rookie)
- [x] Bilanz-Ladefehler → Formular bleibt bedienbar, nur die Karte zeigt „Bilanz gerade nicht verfügbar." (`try/catch` in `page.tsx` → `balance === null`-Zweig in `BalanceCard`; in allen 18 E2E-Läufen rendert die Seite fehlerfrei, der Catch-Pfad ist codeseitig verifiziert)

### Edge Cases Status
- [x] Nur-Leerzeichen-Anzeigename → getrimmt, dann Pflichtfehler (E2E)
- [x] Trailing-Whitespace in optionalen Feldern → `z.string().trim()` im Schema
- [x] Feld über Limit trotz Client-`maxlength` → Server-Zod + DB-CHECK, verständliche Meldung
- [x] Speichern fehlgeschlagen → Sammel-Fehler, Eingaben stehen
- [x] Dasselbe Profil in zwei Tabs → letzter Schreibvorgang gewinnt (Direkt-`update`, kein optimistisches Sperren) — kein Konflikt-Dialog, gewollt
- [x] Bilanz wirft, Formular lädt → `try/catch`, Seite bleibt nutzbar
- [x] Anzeigename während laufendem Tasting ändern → erlaubt, rückwirkend; Bilanz-Zahlen unberührt (nur abgeschlossene Events)
- [x] Deaktiviertes Mitglied → kommt nicht bis `/profil` (`requireUser` → Abmelde-Route; PROJ-2, unverändert)
- [x] Mitgebrachter Whisky aus einem Tasting **ganz ohne Bewertungen** → zählt bei „Mitgebrachte Whiskys" mit, aber **nicht** bei „Beste Platzierung" (E2E: der ungewertete „Talisker 10" auf Rang 1 stellt die beste Platzierung nicht — es bleibt „1. Platz · Ardbeg")

### Security Audit Results
- [x] **Auth:** `/profil` erfordert Login (`requireUser`); nicht angemeldet → `/login` mit gemerktem Zielpfad (PROJ-2)
- [x] **Schreibgrenze:** `updateProfileAction` schreibt `profiles` direkt mit `.eq('id', session.userId)`; RLS `profiles_update_own` + Spalten-GRANT auf genau `display_name` / `favorite_dram` / `favorite_region` / `bio`. `role` / `is_active` sind weder im Payload noch grantbar → **kein Selbst-Upgrade zum Admin**. Die DB-Ebene ist per `rls.integration` („Teilnehmer A kann sich nicht selbst zum Admin machen" → `42501") abgesichert
- [x] **Bilanz liest nur Eigenes bzw. ohnehin Sichtbares:** eigene Teilnahmen, eigene `ratings`, `whisky_rankings` (nur abgeschlossene Events, seit PROJ-9 runden-sichtbar). Kein Zugriff auf fremde Rohbewertungen oder fremde Notizen
- [x] **XSS:** `display_name` / `bio` / `favorite_*` werden als React-Text gerendert (auto-escaped); `bio` erscheint nur als `<Textarea value>`, nirgends als Markup
- [x] **Eingabevalidierung:** dreifach — Zod im Client, dieselbe Prüfung in der Server Action, DB-CHECK als letzte Instanz
- [x] **Keine sensiblen Daten im Response:** die Bilanz-Query liefert nur skalare Zähler / Punkte

### Bugs Found

#### BUG-1: Drei veraltete Assertions in `tests/PROJ-2-auth.spec.ts` (in diesem Durchlauf behoben)
- **Severity:** Low
- **Ursache:** PROJ-8 hat die Dashboard-Begrüßung von „Willkommen, …" auf „Hallo, {Name}" umbenannt; drei Auth-E2E-Tests (Login, Einladungslink, Reset-Link) prüften weiter auf `/Willkommen,/`. Im vollen `playwright test`-Lauf der PROJ-8-QA gingen sie in der Last-Flakiness unter.
- **Kein Produktdefekt** — das Dashboard funktioniert, nur der Erwartungstext im Test war alt.
- **Fix:** `/Willkommen,/` → `/Hallo,/` in `tests/PROJ-2-auth.spec.ts` (nur Test, kein Produktcode). `tests/PROJ-2-auth.spec.ts` danach 24/24.
- **Priorität:** erledigt.

#### BUG-2: (projektweit, bekannt) Voll-Parallel-E2E-Last-Flakiness + Hydration-Doppelrender
- **Severity:** Low
- Nicht PROJ-10-spezifisch; steht auf der `/deploy`-Liste (Specs sharden / `--workers=1`).

### Summary
- **Acceptance Criteria:** 16/16 bestanden (11 per E2E verifiziert, 5 per Code-/Schema-Inspektion, wo E2E unpraktisch ist: Button-Sperre während des Speicherns, Server-Fehlerpfad, Limit-Backstop, „—"-Anzeige, Bilanz-Ladefehler)
- **Bugs Found:** 2 total (0 Critical, 0 High, 0 Medium, 2 Low) — BUG-1 in diesem Durchlauf behoben, BUG-2 ist die stehende Test-Infra-Notiz
- **Security:** Pass — Schreibzugriff strikt auf die eigene Zeile und die vier freigegebenen Felder, kein Selbst-Upgrade, Bilanz liest nur Eigenes
- **Production Ready:** **YES** — kein Critical/High
- **Recommendation:** **Approved.**

## Deployment

**Deployed:** 2026-08-30 · **Production URL:** https://tfg-app-self.vercel.app · **Tag:** `v1.0.0`

Gebündeltes Erst-Deployment von PROJ-1–10. Hosting: Vercel (Auto-Deploy aus `main`).
Backend: Supabase `ogwuwisutgaxxpknkgpg` (eu-central-1), Migrationen bis `20260830120000`.

Beim Deploy erledigt: Security-Header (`next.config.ts`), Vercel-Env-Vars, Supabase
Auth (Site URL + Redirect-Allowlist `/**` auf die Prod-Domain, Signup OFF, anonyme
Anmeldung OFF), Admin-Passwort vom Seed-Wert gelöst (`npm run admin:password`).

Folgeschritte (nicht blockierend): Custom SMTP statt eingebautem Supabase-Mailer
(rate-limitiert, nicht produktionstauglich); Sentry / Error-Tracking; Supabase
Advisors (Security/Performance) im Dashboard gegenprüfen; alten Supabase Personal
Access Token widerrufen; Test-Konto `test.teilnehmer@example.com` deaktivieren;
E2E-Specs in CI sharden / `--workers=1` (BUG-2).
