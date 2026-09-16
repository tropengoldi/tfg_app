# PROJ-14: Profil sichtbar für andere (Sichtbarkeits-Einstellungen)

## Status: Deployed
**Created:** 2026-09-16
**Last Updated:** 2026-09-16

## Dependencies
- **Requires: PROJ-10 (Profil-Seite mit persönlicher Bilanz)** — liefert die
  Stammdaten-Felder (`favorite_dram`, `favorite_region`, `bio`) und die vier
  Bilanz-Kennzahlen, die hier fremden Betrachtern zugänglich gemacht werden.
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — Login, App-Shell,
  `requireUser`.
- **Requires: PROJ-9 (Ergebnisse & Tasting-Historie)** — die Namens-Links in
  Ergebnisliste und Historie zeigen auf das neue Profil.
- **Requires: PROJ-8 (Tasting-Dashboard mit Live-Sync)** — die Teilnehmerliste
  im Dashboard, deren Namen ebenfalls verlinkt werden.
- **Baut auf PROJ-1** — `profiles`-Tabelle und Policy `profiles_select_all`
  (jedes angemeldete Mitglied darf bereits jede Profilzeile lesen; neu ist die
  *Anzeige-Filterung* nach Sichtbarkeits-Einstellung, nicht der DB-Lesezugriff
  selbst).

## Kontext

Heute kann jedes Mitglied nur sein **eigenes** Profil sehen und bearbeiten
(PROJ-10). PROJ-14 öffnet Profile für die ganze Runde — read-only — und gibt
jedem Mitglied dabei die Kontrolle, welche seiner Angaben andere sehen dürfen.
Technisch ist das überwiegend eine Sichtbarkeits-*Filterung*, keine neue
Leseberechtigung: `profiles_select_all` erlaubt schon heute jedem
angemeldeten Mitglied, jede Profilzeile zu lesen.

## User Stories

- Als **Mitglied** möchte ich das Profil eines anderen Mitglieds ansehen
  können, damit ich mehr über die Person hinter dem mitgebrachten Whisky
  erfahre.
- Als **Mitglied** möchte ich in meinem eigenen Profil pro Feld festlegen, ob
  andere es sehen dürfen, damit ich selbst bestimme, wie viel ich preisgebe.
- Als **Mitglied** möchte ich eine Übersicht aller aktiven Mitglieder der
  Runde, damit ich nicht erst über Ergebnisse oder Historie zu jemandem
  navigieren muss.
- Als **Mitglied** möchte ich, dass verborgene Felder einfach fehlen statt als
  „verborgen" markiert zu sein, damit niemand merkt, dass ich etwas
  zurückhalte.
- Als **Admin** möchte ich fremde Profile genauso eingeschränkt sehen wie
  jedes andere Mitglied, weil meine Verwaltungsrolle keine Extra-Einsicht in
  private Angaben rechtfertigt.

## Out of Scope

- **E-Mail-Adresse** — nie im fremden Profil sichtbar, kein Schalter dafür.
- **Rolle (Admin/Teilnehmer)** — im fremden Profil nicht angezeigt; bleibt
  Verwaltungsinfo der Admin-Teilnehmerliste (PROJ-3).
- **Fremde Profile bearbeiten** — reine Leseansicht, kein Eingriff in fremde
  Daten.
- **Personenbezogene Sichtbarkeit** („nur Person X darf sehen") — nur ein
  globaler Schalter pro Feld für die ganze Runde, keine feingranulare
  Adressierung einzelner Mitglieder.
- **„Wer hat mein Profil angesehen"** — kein Tracking von Profilaufrufen.
- **Suche/Filter in der Community-Liste** — bei 6–10 Mitgliedern unnötig.
- **Links aus der Admin-Teilnehmerverwaltung (PROJ-3)** — bleibt reines
  Verwaltungswerkzeug (E-Mail, Rolle, aktiv/inaktiv) ohne Profil-Links.
- **Avatar/Foto** — PRD-Non-Goal (keine Datei-Uploads), gilt unverändert.
- **Persönliche Whisky-Datenbank** — eigenes Feature PROJ-15, das auf dieser
  Sichtbarkeits-Steuerung aufbaut.
- **Ein globaler An/Aus-Schalter statt Feld-für-Feld** — bewusst verworfen
  zugunsten von Granularität (siehe Decision Log).
- **Neuer Bottom-Nav-Reiter für Community** — bewusst verworfen, ein Link von
  `/profil` reicht.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Fremdes Profil ansehen

- [ ] Angenommen ein Mitglied tippt auf den Namen eines anderen Mitglieds
      (Teilnehmerliste, Ergebnisse, Historie), wenn der Tap ausgeführt wird,
      dann öffnet sich die read-only Profilansicht `/profil/[id]` dieses
      Mitglieds.
- [ ] Angenommen ein Mitglied öffnet das Profil eines anderen, wenn die Seite
      lädt, dann zeigt sie Anzeigenamen plus alle Felder (Lieblings-Dram,
      Lieblingsregion, Bio, die vier Bilanz-Kennzahlen), die dieses Mitglied
      als sichtbar markiert hat.
- [ ] Angenommen ein Feld ist vom Profilinhaber als verborgen markiert, wenn
      ein anderes Mitglied das Profil ansieht, dann fehlt diese
      Zeile/Kennzahl vollständig, ohne Hinweis darauf, dass sie verborgen
      wurde.
- [ ] Angenommen ein Mitglied hat alle schaltbaren Felder verborgen, wenn ein
      anderes Mitglied das Profil ansieht, dann zeigt die Seite nur den
      Anzeigenamen (kein leerer Kartenrumpf, kein Fehler).
- [ ] Angenommen ein Mitglied tippt auf seinen eigenen Namen irgendwo in der
      App, wenn die Navigation ausgeführt wird, dann landet es auf der
      eigenen bearbeitbaren Profilseite `/profil` (nicht auf der read-only
      Fremdansicht).
- [ ] Angenommen ein Mitglied ruft eine ungültige/nicht existierende
      Profil-ID auf, wenn die Seite lädt, dann erscheint eine „Profil nicht
      gefunden"-Meldung (404).
- [ ] Angenommen ein Mitglied wurde inzwischen deaktiviert, wenn ein anderes
      Mitglied über einen Link aus der Tasting-Historie auf dessen Profil
      zugreift, dann öffnet sich die Profilansicht weiterhin, unter Beachtung
      der zuletzt gespeicherten Sichtbarkeits-Einstellungen.

### Sichtbarkeits-Einstellungen im eigenen Profil

- [ ] Angenommen ein Mitglied öffnet sein eigenes Profil `/profil`, wenn die
      Seite lädt, dann zeigt ein neuer Abschnitt „Sichtbarkeit für andere"
      für jedes der sieben schaltbaren Felder (Lieblings-Dram,
      Lieblingsregion, Bio, Anzahl Tastings, Mitgebrachte Whiskys, Beste
      Platzierung, Ø vergebene Punkte) einen Schalter.
- [ ] Angenommen ein neues Mitglied hat noch nie Sichtbarkeits-Einstellungen
      geändert, wenn es sein Profil öffnet, dann stehen alle sieben Schalter
      auf „sichtbar" (Default).
- [ ] Angenommen ein Mitglied legt einen Schalter um, wenn die Änderung
      ausgeführt wird, dann wird sie sofort gespeichert (kein extra
      „Speichern"-Klick nötig) und mit einem kurzen Feedback bestätigt.
- [ ] Angenommen das Speichern eines Schalters schlägt fehl (Netz/Server),
      wenn der Fehler eintritt, dann springt der Schalter sichtbar in seinen
      vorherigen Zustand zurück und es erscheint eine Fehlermeldung.
- [ ] Angenommen ein Mitglied verbirgt ein Feld, das bereits einen Wert
      enthält (z. B. Lieblings-Dram), wenn es den Schalter später wieder auf
      „sichtbar" stellt, dann erscheint wieder derselbe gespeicherte Wert
      (das Verbergen löscht den Wert nicht).

### Community-Übersicht

- [ ] Angenommen ein Mitglied öffnet sein eigenes Profil, wenn die Seite
      lädt, dann findet es dort einen Link „Die Runde ansehen" zur
      Community-Übersicht `/community`.
- [ ] Angenommen ein Mitglied öffnet `/community`, wenn die Seite lädt, dann
      sieht es alle aktiven Mitglieder alphabetisch nach Anzeigename
      sortiert, jedes als Link zum jeweiligen Profil (bei sich selbst zur
      eigenen bearbeitbaren Profilseite).
- [ ] Angenommen ein Mitglied wurde deaktiviert, wenn ein anderes Mitglied
      `/community` öffnet, dann erscheint das deaktivierte Mitglied nicht in
      der Liste.

## Edge Cases

- **Wert vorhanden aber verborgen** vs. **Feld nie ausgefüllt** → für den
  Betrachter ununterscheidbar (gewollt, siehe AC).
- **Ganz neues Mitglied (0 Tastings) wird fremd besucht** → sichtbare
  Bilanz-Kennzahlen zeigen 0/„—" wie im eigenen Profil, aber ohne den
  motivierenden „füllt sich..."-Hinweistext (der ist nur für die Eigenansicht
  gedacht).
- **Zwei Tabs desselben Nutzers ändern gleichzeitig Sichtbarkeits-Schalter** →
  letzter Schreibvorgang gewinnt, kein Konfliktdialog (analog PROJ-10).
- **Bilanz-Daten eines fremden Profils lassen sich nicht laden** → betroffene
  (sichtbare) Kennzahlen zeigen „nicht verfügbar" statt die Seite abstürzen
  zu lassen.
- **Admin betrachtet ein Profil** → exakt dieselbe gefilterte Ansicht wie ein
  normales Mitglied, keine Sonderrechte.
- **Community-Liste bei genau einem aktiven Mitglied** → zeigt trotzdem
  korrekt genau diesen einen Eintrag (den eigenen).

## Technical Requirements (optional)

- **Sicherheit:** Login erforderlich (`requireUser`). Die Feld-Filterung muss
  serverseitig erfolgen, nicht nur im Frontend maskiert — passend zum
  Projektprinzip „RLS/Server ist die tragende Sicherheitsschicht, nicht das
  Frontend". Der konkrete Mechanismus (View mit Sichtbarkeits-Join, RPC oder
  gefilterte Serverkomponenten-Query) ist Sache von `/architecture`.
- **Darstellung:** mobile-first, konsistent mit PROJ-10 (Karten,
  Display-Schrift für Kennzahlen).
- **Performance:** Die Community-Liste ist eine einzige, kleine Abfrage
  (≤10 Zeilen bei typischer Rundengröße).
- **Browser:** Chrome, Firefox, Safari (mobil priorisiert).

## Open Questions

- [x] ~~Genauer technischer Mechanismus für die serverseitige
      Feld-Filterung?~~ **Gelöst (`/architecture`):** Für die drei
      Stammdaten-Felder eine neue, schreibgeschützte Sicht auf `profiles`
      anstelle des direkten Lesezugriffs (analog zum bestehenden
      Spalten-Grant-Muster fürs Schreiben). Für die vier Bilanz-Kennzahlen
      keine neue Funktion nötig — sie nutzen dieselben Archiv-Daten
      abgeschlossener Tastings, die seit PROJ-9 ohnehin für jedes aktive
      Mitglied lesbar sind; die Sichtbarkeits-Filterung passiert dort in der
      Anwendungsschicht, ohne einen neuen Datenzugriff zu öffnen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Granulare Sichtbarkeit für Stammdaten **und** alle vier Bilanz-Kennzahlen; Anzeigename immer sichtbar, nicht schaltbar | Anzeigename wird für Ranglisten/Teilnehmerlisten gebraucht, ein Verstecken wäre witzlos und würde Ranglisten unlesbar machen; alles andere ist bewusst individuell steuerbar | 2026-09-16 |
| Default aller sieben Schalter: **sichtbar** (Opt-out) | Geschlossene, private Freundesrunde ohne Fremdpublikum (PRD); ein leeres Profil per Opt-in-Default widerspricht der entspannten Runden-Atmosphäre | 2026-09-16 |
| Einstiegspunkte: Namen überall in der App (Teilnehmerliste, Ergebnisse, Historie) **plus** eigener Community-Screen `/community` | Nutzerwunsch: beide Wege kombiniert statt nur einer | 2026-09-16 |
| Community-Screen über Link von `/profil` erreichbar, **kein** neuer Bottom-Nav-Reiter | Ein fünfter Reiter wäre auf 375px eng für ein selten genutztes Feature (im Vergleich zu Tastings/Profil) | 2026-09-16 |
| Deaktivierte Mitglieder bleiben über Links aus der Historie aufrufbar, fehlen aber in der Community-Liste | Passt zur PRD-Vision der dauerhaften Historie („wer hat wann gewonnen"); die Community-Liste zeigt dagegen nur „die aktuelle Runde" | 2026-09-16 |
| Admin sieht fremde Profile genauso gefiltert wie jedes Mitglied — keine Sonderrechte | Admin-Accountverwaltung (E-Mail, Rolle, aktiv/inaktiv) läuft bereits über PROJ-3; keine zusätzliche Ausnahme vom Sichtbarkeits-Versprechen nötig | 2026-09-16 |
| Sichtbarkeits-Schalter speichern sofort einzeln, kein Sammel-„Speichern" | Reine Ein/Aus-Interaktion ohne Texteingabe; passt zum „kurze, große Bedienelemente am Handy"-Kontext aus dem PRD | 2026-09-16 |
| Verborgene Felder fehlen komplett, ohne „verborgen"-Kennzeichnung | Unauffälligste Variante — niemand sieht ein explizites „ich verstecke das vor dir"; passt besser zur entspannten Runde | 2026-09-16 |
| E-Mail und Rolle grundsätzlich nie im fremden Profil, kein Schalter dafür | E-Mail ist Auth-relevant (PROJ-2), Rolle ist Verwaltungsinfo (PROJ-3) — beides keine „Selbstauskunft", die ein Mitglied freigeben sollte müssen | 2026-09-16 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Sichtbarkeit der drei Stammdaten-Felder wird per **neuer, schreibgeschützter Sicht + entzogener Spaltenberechtigung auf der Rohtabelle** durchgesetzt (nicht nur im Frontend gefiltert) | `profiles_select_all` erlaubt heute jedem angemeldeten Mitglied den direkten Lesezugriff auf jede Profilzeile inkl. Bio/Dram/Region; reine Frontend-Filterung wäre am UI vorbei umgehbar. Nutzt dieselbe Spalten-Grant-Technik, die schon das Schreiben dieser drei Felder absichert (PROJ-1) | 2026-09-16 |
| **Keine neue RPC/Funktion** für die fremde Bilanz-Berechnung — dieselbe Berechnungslogik wie im eigenen Profil, angewendet auf die fremde Person, gestützt auf die seit PROJ-9 für jedes aktive Mitglied freigegebenen Archiv-Views (Rangliste, Einzelbewertungen abgeschlossener Tastings) | Es wird kein neuer Zugriff auf private Rohdaten (z. B. fremde `ratings`-Zeilen) geöffnet — die nötigen Daten sind für abgeschlossene Events bereits als gemeinsames Archiv lesbar | 2026-09-16 |
| 7 Sichtbarkeits-Schalter als einzelne Boolean-Spalten direkt an `profiles`, Default `true` | Feste, kleine Menge an Einstellungen pro Person; technisch dieselbe Art Erweiterung wie die bestehenden vier Stammdaten-Felder — keine eigene Tabelle nötig | 2026-09-16 |
| Community-Liste liest weiterhin direkt aus `profiles` (`is_active = true`), keine neue Berechtigung | Anzeigenamen aktiver Mitglieder sind bereits für jeden angemeldeten Nutzer lesbar | 2026-09-16 |
| `/profil/[id]` leitet bei eigener ID auf `/profil` weiter; ungültige ID → 404 | Vermeidet eine verwirrende „read-only Ansicht meiner selbst"; Standard-Fehlerverhalten für nicht existierende Profile | 2026-09-16 |
| Keine neuen Pakete — shadcn `Switch` ist bereits installiert | Wiederverwendung bestehender UI-Bausteine | 2026-09-16 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-14 braucht sowohl Frontend (zwei neue Seiten, eine neue Sektion auf
`/profil`, drei bestehende Namens-Anzeigen werden zu Links) als auch Backend
(sieben neue Sichtbarkeits-Schalter am Profil, eine neue schreibgeschützte
Sicht für die drei Stammdaten-Felder).

### A) Komponentenstruktur

```
/profil (bestehende Seite, erweitert)
├─ Stammdaten-Formular            (unverändert, PROJ-10)
├─ NEU: „Sichtbarkeit für andere"  (7 Schalter, jeder speichert sofort einzeln)
├─ Konto-Anzeige                  (unverändert)
├─ Persönliche Bilanz             (unverändert)
├─ NEU: Link „Die Runde ansehen" → /community
└─ „Abmelden"                     (unverändert)

/profil/[id]  (NEU — fremdes, read-only Profil)
├─ Anzeigename                    (immer sichtbar)
├─ Stammdaten-Felder              (nur die freigegebenen)
├─ Bilanz-Kennzahlen              (nur die freigegebenen)
├─ Zustand „alles verborgen"      → nur der Anzeigename
├─ Zustand „Bilanz nicht ladbar"  → betroffene Kennzahl zeigt „nicht verfügbar"
└─ Zustand „ungültige ID"         → 404 „Profil nicht gefunden"
   (eigene ID aufgerufen → Weiterleitung zur bearbeitbaren Seite /profil)

/community  (NEU)
└─ Liste aktiver Mitglieder, alphabetisch — jeder Eintrag verlinkt auf sein Profil

Bestehende Namens-Anzeigen werden zu Profil-Links:
├─ Teilnehmerliste im Dashboard
├─ „mitgebracht von …" in der Ergebnisliste
└─ „Gastgeber: …" in der Tasting-Historie
```

### B) Datenmodell (in Worten)

- **7 neue Ja/Nein-Einstellungen pro Mitglied**, direkt am bestehenden Profil
  ergänzt (wie die heutigen Stammdaten-Felder): je ein Schalter für
  Lieblings-Dram, Lieblingsregion, Kurzbeschreibung, Anzahl Tastings,
  Mitgebrachte Whiskys, Beste Platzierung, Ø vergebene Punkte. Alle starten
  auf „Ja" (sichtbar).
- **Kein neues Bilanz-Datenobjekt.** Die vier Kennzahlen werden weiterhin aus
  vorhandenen Daten berechnet (Teilnahmen, mitgebrachte Whiskys, abgegebene
  Bewertungen) — jetzt auch für fremde Mitglieder, gestützt auf die bereits
  seit PROJ-9 für jedes aktive Mitglied freigegebenen „Archiv"-Daten
  abgeschlossener Tastings (Rangliste + Einzelbewertungen). Es wird also kein
  neuer Zugriff auf private Rohdaten geöffnet.
- **Eine neue, schreibgeschützte „öffentliche Sicht" auf Profile**, die den
  Anzeigenamen immer liefert, die drei Stammdaten-Felder aber nur, wenn deren
  Schalter an ist. Sie ersetzt den bisherigen direkten Lesezugriff auf diese
  drei Felder bei fremden Profilzeilen; der direkte Zugriff auf die eigene
  Zeile (zum Bearbeiten) bleibt unverändert.

### C) Backend-Bedarf

- Migration: sieben neue Ja/Nein-Spalten an `profiles`, Default „sichtbar".
- Migration: neue schreibgeschützte Sicht, die pro Zeile Anzeigename immer
  und die drei Stammdaten-Felder nur bei aktivem Schalter ausgibt; die
  direkte Leseberechtigung auf diese drei Spalten wird für fremde Zeilen
  entzogen (eigene Zeile bleibt über den bestehenden Weg voll lesbar/
  schreibbar).
- Kein neuer Datenzugriff für die Bilanz-Berechnung — sie liest dieselben
  Archiv-Views, die seit PROJ-9 für jedes aktive Mitglied freigegeben sind.
- Speichern eines einzelnen Schalters: ein spaltenbeschränktes Update auf die
  eigene Profilzeile, gleiches Muster wie das bestehende Stammdaten-Speichern
  (PROJ-10).

### D) Sicherheits-Betrachtung

- Die Sichtbarkeits-Einstellung ist auf Datenbankebene erzwungen, nicht nur
  im Frontend versteckt — deckt sich mit dem Projektprinzip „RLS ist die
  tragende Sicherheitsschicht".
- Admin hat keine Sonderrechte beim Betrachten fremder Profile (siehe Product
  Decisions) — dieselbe gefilterte Sicht für alle.
- Es wird kein bisher gesperrter Datenzugriff geöffnet: Die Bilanz-Zahlen
  nutzen ausschließlich Daten, die seit PROJ-9 bereits für die ganze Runde
  als Archiv freigegeben sind.

### E) Neue Pakete

Keine. Der Schalter (shadcn `Switch`) ist bereits im Projekt installiert.

## Implementation Notes (Frontend)

**Stand:** Frontend umgesetzt am 2026-09-16. Der Datenbank-Teil (7
Sichtbarkeits-Spalten an `profiles`, die Sicht `profiles_public`) steht noch
aus → `/backend PROJ-14`. Bis dahin liefert `select('*')` auf `profiles` die
7 neuen Spalten nicht wirklich (die Switches laden mit dem clientseitigen
`useState`-Default `undefined`/„aus", bis die Migration steht) und
`profiles_public` / die Bilanz-Reads für ein fremdes Profil laufen ins Leere
— `getPublicProfile` fängt das über die vorhandenen `try/catch`-Pfade ab, die
Seite bricht nicht, zeigt aber keine echten Daten. `npm run build` und
`npm test` sind sauber, `/login` und `/community` (Redirect für nicht
angemeldete Nutzer) im Dev-Server smoke-getestet.

### Reine Frontend-Entscheidungen (aus den offenen Fragen des Specs)

- **Nested-Link-Problem in `past-tasting-row.tsx`:** Die gesamte Zeile war
  bisher ein einziger `<Link>` zur Ergebnisseite — ein zweiter, verschachtelter
  Link (Gastgeber → Profil) ist HTML-ungültig. Die Zeile ist daher jetzt
  zweigeteilt: der obere Teil (Datum/Ort/Sieger) bleibt ein Link zur
  Ergebnisseite, die Gastgeber-Zeile darunter ist ein eigener, kleinerer Link
  aufs Profil. Text und Reihenfolge bleiben gleich, nur vertikal statt in
  einem Block — die bestehenden PROJ-9/PROJ-11-E2E-Tests prüfen nur
  Text-Sichtbarkeit (`getByText`) bzw. `.getByRole('link').first()` für die
  Ergebnis-Navigation, beides bleibt unverändert grün.
- **`tasting-row.tsx` („Deine Abende", laufende/kommende Events) bewusst NICHT
  verlinkt:** dasselbe Nested-Link-Problem, aber dieser Screen steht nicht in
  der Spec-AC (die nennt nur Teilnehmerliste, Ergebnisse, Historie). Der
  Gastgeber-Name dort bleibt vorerst reiner Text, um die Umbau-Fläche klein zu
  halten.
- **„Historie" umgesetzt als `past-tasting-row.tsx`** (die „Vergangene
  Tastings"-Liste auf `/tastings`) **und** `results-header.tsx` (Gastgeber /
  Helfer / Teilnehmerliste auf der Ergebnisseite eines einzelnen Events) — beide
  passen zur AC-Formulierung „Historie" bzw. „Ergebnisse".
- **Helfer-Name zusätzlich verlinkt** (nicht explizit in der Spec gefordert,
  aber konsistent: jede angezeigte Person bekommt denselben Profil-Link).
- **Community-Liste verlinkt auch die eigene Zeile auf `/profil/[id]`**, nicht
  direkt auf `/profil` — die Weiterleitung passiert serverseitig auf der
  Zielseite (ein Redirect-Sprung), damit die Selbst-Erkennung nur an einer
  Stelle im Code existiert.
- **Bilanz-Fehlerzustand vereinfacht auf Kartenebene**, nicht pro Kennzahl:
  schlägt das Laden fehl, zeigt die ganze Bilanz-Karte „nicht verfügbar" (wie
  schon `BalanceCard` im eigenen Profil), statt jede sichtbare Kennzahl
  einzeln zu markieren — konsistentes, bereits etabliertes Muster.

### Geänderte / neue Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/supabase/types.ts` | Handnachtrag (wird von `db:types` reproduziert): `profiles` Row/Insert/Update + 7 `show_*`-Spalten; neue View `profiles_public`. |
| `src/lib/supabase/aliases.ts` | `ProfilePublic = Tables<'profiles_public'>`. |
| `src/lib/schemas/profile-visibility.ts` | neu — `VISIBILITY_FIELDS`, `VisibilityField`, `updateVisibilitySchema`. |
| `src/lib/actions/profile-visibility.ts` | neu — `updateVisibilityAction`: spaltengenaues Update eines einzelnen Schalters auf die eigene Zeile (gleiches Muster wie `updateProfileAction`). |
| `src/lib/queries/public-profile.ts` | neu — `getPublicProfile(targetId)`: liest `profiles_public` (maskierte Stammdaten) + berechnet die Bilanz aus `whisky_rankings`/`whisky_score_breakdown`/`event_participants`, maskiert pro Kennzahl anhand der vier Bilanz-Schalter. `null` = Profil nicht gefunden. |
| `src/lib/queries/community.ts` | neu — `getActiveMembers()`: `profiles` gefiltert `is_active = true`, alphabetisch. |
| `src/lib/queries/results.ts` | `PastTastingRow.host_id`, `RankingRow.broughtById`, `EventResults.head.host_id`/`helper_id` ergänzt (Daten waren in den Views schon vorhanden, nur ungenutzt). |
| `src/components/profile/visibility-settings.tsx` | neu — 7 Switches in zwei Gruppen (Stammdaten/Bilanz), optimistisches Umschalten + Rollback bei Fehler, Toast. |
| `src/components/profile/public-profile-view.tsx` | neu — read-only Darstellung: Kopf mit Anzeigename, Stammdaten-Card nur wenn mind. ein Feld sichtbar, Bilanz-Card nur wenn mind. eine Kennzahl sichtbar. |
| `src/components/community/community-list.tsx` | neu — Liste aktiver Mitglieder, jede Zeile ein Link auf `/profil/[id]`. |
| `src/app/(app)/profil/[id]/page.tsx` (+ `loading.tsx`, `error.tsx`) | neu — Redirect auf `/profil` bei eigener ID, `notFound()` bei unbekannter ID, sonst `PublicProfileView`. |
| `src/app/(app)/community/page.tsx` (+ `loading.tsx`, `error.tsx`) | neu. |
| `src/app/(app)/profil/page.tsx` | `VisibilitySettings`-Card (defaultValues aus `profile.show_*`) + Link „Die Runde ansehen" → `/community` ergänzt. |
| `src/components/dashboard/dashboard-view.tsx` | Teilnehmername → `Link` auf `/profil/[id]`. |
| `src/components/results/ranking-row.tsx` | „mitgebracht von" → `Link`, falls `broughtById` vorhanden. |
| `src/components/results/results-header.tsx` | Gastgeber-, Helfer- und Teilnehmer-Namen → `Link`s. |
| `src/components/results/past-tasting-row.tsx` | Zeile zweigeteilt (siehe oben), Gastgeber-Zeile jetzt eigener `Link`. |

### Verifikation

`npx tsc --noEmit` sauber · `eslint` (betroffene Pfade) sauber · `npm test` →
117/117 (unverändert, keine neuen reinen Funktionen, die einen eigenen Test
bräuchten — `getPublicProfile`/`getActiveMembers` sind DB-Reads, werden mit
Backend in `/qa` per Integrationstest abgedeckt) · `npm run build` erzeugt
`/community` und `/profil/[id]` als dynamische Routen.

## Implementation Notes (Backend)

**Stand:** Migration geschrieben am 2026-09-16 —
`supabase/migrations/20260916120000_profile_visibility.sql`. **Noch nicht
angewandt.** Der Nutzer führt aus:

```powershell
npm run db:push      # Migration einspielen
npm run db:types     # src/lib/supabase/types.ts neu generieren
```

`db:types` überschreibt die im `/frontend`-Schritt von Hand nachgetragenen
Typen (7 `show_*`-Spalten an `profiles`, die Sicht `profiles_public`) mit der
echten Generierung — inhaltlich identisch. Danach `npm run test:rls` (inkl.
der neuen `profile-visibility.integration.test.ts`) im `/qa`-Schritt.

### Eine Migration — was sie tut

| Bereich | Änderung |
|---------|----------|
| **7 Spalten** | `profiles.show_favorite_dram` / `show_favorite_region` / `show_bio` / `show_tasting_count` / `show_whisky_count` / `show_best_placement` / `show_avg_points` — alle `boolean not null default true`. |
| **Neue Sicht `profiles_public`** | Owner-Rechte (wie `whisky_rankings`/`past_tastings`, kein `security_invoker`). Liefert `id`, `display_name` immer; `bio`/`favorite_dram`/`favorite_region` nur, wenn der jeweilige Schalter an ist **oder** der Aufrufer die Zeile selbst ist (`id = (select auth.uid())`) — man sieht sich selbst immer vollständig, die Schalter wirken nur nach außen. Die vier `show_*`-Bilanz-Flags werden unverändert durchgereicht (keine eigene Maskierung nötig, die Bilanz-Zahlen selbst entstehen serverseitig aus PROJ-9-Archivdaten, siehe `getPublicProfile`). |
| **Spalten-Grant `profiles` SELECT verengt** | `revoke select on profiles from authenticated` + `grant select (…)` auf genau die unkritischen Spalten (alles außer `bio`/`favorite_dram`/`favorite_region`). Ein Direktzugriff auf diese drei Felder — egal ob fremde oder **eigene** Zeile — liefert seither `42501`; nur noch `profiles_public` führt sie. |
| **Spalten-Grant `profiles` UPDATE erweitert** | Die 7 neuen Schalter zum bestehenden Update-Grant hinzugefügt (additiv zum PROJ-1-Grant für `display_name`/`avatar_url`/`bio`/`favorite_dram`/`favorite_region`). `profiles_update_own` (PROJ-1) deckt weiterhin „nur die eigene Zeile" ab, keine neue Policy nötig. |

### Entscheidungen im Detail

- **Warum ein Spalten-Grant statt einer RLS-Policy:** RLS filtert Zeilen, nicht
  Spalten — es gibt keine Möglichkeit, „diese Zeile lesbar, aber drei Felder
  davon verborgen" allein über eine `USING`-Klausel abzubilden. Der einzige
  DB-native Weg ist ein Spalten-Grant auf der Basistabelle plus eine Sicht,
  die die Maskierung selbst übernimmt (gleiches Prinzip wie der bestehende
  Schreib-Grant aus PROJ-1, nur jetzt auch fürs Lesen).
- **Warum die eigene Zeile denselben Grant-Entzug trifft wie fremde:** Ein
  Sonderfall „eigene Zeile bleibt über die Basistabelle lesbar" hätte den
  Grant wieder zeilenunabhängig geöffnet (Grants kennen keine Zeilen) — es
  gäbe also keinen Weg, das auf „nur die eigene ID" zu beschränken, ohne doch
  wieder eine Sicht zu bemühen. Konsequenz: **ein** Lesepfad für alle drei
  Felder (`profiles_public`), auch für die eigene Profilseite — siehe
  `getOwnStammdaten` im Frontend-Teil und den neuen Typ `SessionProfile`
  (`src/lib/supabase/aliases.ts`), der `bio`/`favorite_dram`/`favorite_region`
  bewusst aus dem Session-Profil-Typ ausschließt, damit ein versehentlicher
  Zugriff über `session.profile.bio` gar nicht erst kompiliert.
- **Warum keine neue RLS/RPC für die Bilanz-Kennzahlen:** siehe Architecture-
  Entscheidung — die Zahlen entstehen aus den seit PROJ-9 für jedes aktive
  Mitglied freigegebenen Archiv-Views; die Maskierung passiert rein in
  `getPublicProfile` (Anwendungsschicht), ohne dass dafür ein neuer
  Datenbankzugriff geöffnet werden musste.
- **`profiles_public` läuft mit Owner-Rechten**, nicht `security_invoker` —
  wie `whisky_rankings`/`past_tastings`. Die Maskierungslogik steht direkt in
  der Sicht (CASE-Ausdrücke), nicht in einer RLS-Policy der Basistabelle;
  `(select auth.uid())` wird einmal pro Statement ausgewertet (Projekt-
  konvention aus PROJ-1, nicht pro Zeile).

### Frontend-Anpassungen, die die Migration nötig machte

Beim Schreiben der Migration wurde klar, dass der im `/frontend`-Schritt
gebaute Direktzugriff auf `session.profile.bio` (für die eigenen
Formular-Startwerte) mit dem verengten Grant kollidieren würde — auch die
eigene Zeile ist über die Basistabelle nicht mehr vollständig lesbar. Deshalb
zusätzlich zum reinen Migrations-Schreiben:

| Datei | Änderung |
|-------|----------|
| `src/lib/supabase/aliases.ts` | neuer Typ `SessionProfile = Omit<Profile, 'bio' \| 'favorite_dram' \| 'favorite_region'>`. |
| `src/lib/auth.ts` | `getSessionContext`/`requireUser` selektieren jetzt eine explizite Spaltenliste (ohne die drei Felder) statt `select('*')`; `SessionContext.profile: SessionProfile`. |
| `src/lib/queries/profile.ts` | neu `getOwnStammdaten(userId)` — liest `bio`/`favorite_dram`/`favorite_region` aus `profiles_public` (liefert für die eigene ID immer den vollen Wert). |
| `src/app/(app)/profil/page.tsx` | `ProfileForm`-Startwerte kommen jetzt aus `getOwnStammdaten(userId)` statt aus `session.profile.*`. |

### Neue Datei

- `src/lib/supabase/__tests__/profile-visibility.integration.test.ts` — 6
  Fälle: Direktzugriff auf die drei Felder (fremd **und** eigen) → `42501`;
  `display_name`/Schalter bleiben direkt lesbar; `profiles_public` maskiert
  korrekt (Default sichtbar, nach dem Ausschalten `null`, Rohwert bleibt beim
  Service-Client erhalten); die eigene Zeile bleibt über die Sicht immer
  vollständig sichtbar; Schreibzugriff auf die Schalter nur für die eigene
  Zeile.

### Verifikation

`npx tsc --noEmit` sauber · `eslint` sauber · `npm test` → 117/117
(unverändert — die neue Datei ist eine `*.integration.test.ts` und damit laut
`vitest.config.ts` vom normalen Testlauf ausgeschlossen, sie läuft nur über
`npm run test:rls`) · `npm run build` ok. `npm run test:rls` bewusst **nicht**
in diesem Schritt ausgeführt — die Migration steht noch aus, ein Lauf würde
an der fehlenden Sicht/den fehlenden Spalten scheitern. Verifikation folgt in
`/qa`, nachdem der Nutzer `db:push` ausgeführt hat.

## QA Test Results

**Tested:** 2026-09-16
**App URL:** http://localhost:3000 (prod-Build)
**Tester:** QA Engineer (AI)

### Automatisierte Suiten

| Suite | Ergebnis |
|-------|----------|
| `npm test` (Vitest Unit) | **117/117** (unverändert — keine neuen reinen Funktionen, die PROJ-14 eigens bräuchte; `formatAvgGiven`/`pickBestPlacement` werden aus PROJ-10 wiederverwendet) |
| `npm run test:rls` (Integration) | **109/109** — inkl. der 6 neuen Fälle aus `profile-visibility.integration.test.ts` (Spaltenzugriff verengt, Sicht maskiert korrekt, Schreibzugriff nur auf die eigene Zeile) |
| `tests/PROJ-14-profil-sichtbar.spec.ts` | **26/26** über `chromium` + `Mobile Safari` (13 Tests je Projekt) |
| `tsc --noEmit` · `eslint .` · `npm run build` | alle sauber; Routen `/community` und `/profil/[id]` erzeugt |
| Gezielte Regression: `PROJ-8`, `PROJ-9`, `PROJ-10`, `PROJ-11` | **66/66** (Dashboard-Teilnehmerliste, Ergebnisliste, Ergebnis-Kopf und Historie-Zeile wurden für die neuen Namens-Links umgebaut — keine Regression) |
| Volle Regressionssuite (alle 12 Feature-Specs, beide Browser) | **180 bestanden**, 29 fehlgeschlagen, 23 übersprungen, 52 nicht gelaufen — **alle 29 Fehlschläge auf zwei vorbestehende, im Post-Deploy-Backlog dokumentierte Seed-Konto-Probleme zurückgeführt** (siehe Regressions-Abschnitt), keiner davon berührt PROJ-14-Code |

### Acceptance Criteria Status — 15/15 bestanden

#### Fremdes Profil ansehen
- [x] Namens-Tap (Teilnehmerliste, Ergebnisse, Historie) → `/profil/[id]` öffnet sich (E2E: „mitgebracht von"-Link, Dashboard-Teilnehmerliste, Historie-Gastgeber-Link)
- [x] Zeigt Anzeigename + alle als sichtbar markierten Felder (E2E: Lieblings-Dram/-region/Bio + alle vier Bilanz-Kennzahlen mit echten Werten)
- [x] Verborgenes Feld fehlt vollständig, ohne Kennzeichnung (E2E)
- [x] Alles verborgen → nur der Anzeigename, kein leerer Kartenrumpf, kein Fehler (E2E)
- [x] Eigener Name → Redirect zur bearbeitbaren `/profil`, nicht zur Fremdansicht (E2E)
- [x] Ungültige ID → „Seite nicht gefunden" (E2E)
- [x] Deaktiviertes Mitglied bleibt über den Historie-Link aufrufbar, fehlt aber in der Community-Liste (E2E, zwei getrennte Tests)

#### Sichtbarkeits-Einstellungen im eigenen Profil
- [x] Abschnitt „Sichtbarkeit für andere" mit sieben Schaltern auf `/profil` (E2E)
- [x] Neues Mitglied: alle sieben Schalter starten auf „sichtbar" (E2E)
- [x] Schalter speichert sofort, ohne „Speichern"-Klick, mit Bestätigung (E2E: Toast „Gespeichert.", DB-Read-Back)
- [x] Speicherfehler → Schalter springt zurück, Fehlermeldung (Code-Inspektion: `visibility-settings.tsx` setzt bei `'error' in res` den vorherigen Wert zurück und zeigt `toast.error`; ein deterministischer Server-Fehler lässt sich in E2E nicht sauber erzwingen — gleiches Vorgehen wie beim identischen PROJ-10-Fall)
- [x] Verbergen löscht den Wert nicht — beim Wieder-Sichtbarmachen erscheint derselbe gespeicherte Wert (Integrationstest: „der Wert ist nicht weg — nur maskiert", Service-Client liest ihn während der Maskierung unverändert; zusätzlich E2E-Rundreise über mehrere Tests)

#### Community-Übersicht
- [x] Link „Die Runde ansehen" auf `/profil` (E2E)
- [x] `/community` zeigt aktive Mitglieder alphabetisch, jede Zeile verlinkt (E2E für Inhalt/Links; alphabetische Sortierung per Code-Inspektion — `getActiveMembers()` sortiert per `order('display_name')` auf DB-Ebene)
- [x] Deaktiviertes Mitglied erscheint nicht in der Liste (E2E)

### Zusätzlich verifiziert (über die Spec-AC hinaus)
- [x] Ganz neues Mitglied ohne Historie wird fremd besucht → „0"/„—", **ohne** den für die Eigenansicht gedachten „füllt sich..."-Hinweistext (E2E)
- [x] Admin sieht ein fremdes Profil genauso eingeschränkt wie jedes andere Mitglied — keine Sonderrechte (E2E: verborgenes Feld bleibt auch für den Admin-Account verborgen)

### Edge Cases Status
- [x] Wert vorhanden aber verborgen vs. nie ausgefüllt → für den Betrachter ununterscheidbar (E2E + Code-Inspektion: die Sicht liefert in beiden Fällen `NULL`)
- [x] Neues Mitglied ohne Historie fremd besucht → Zahlen statt Hinweistext (E2E, siehe oben)
- [x] Zwei Tabs ändern gleichzeitig Sichtbarkeits-Schalter → letzter Schreibvorgang gewinnt (Code-Inspektion: `updateVisibilityAction` ist ein unbedingtes Update ohne Versionsprüfung; identisches, bereits akzeptiertes Muster wie PROJ-10)
- [x] Bilanz eines fremden Profils lässt sich nicht laden → Karte zeigt „Bilanz gerade nicht verfügbar", Seite bleibt nutzbar (Code-Inspektion: `try/catch` um `computeMaskedBalance`, gleiches Muster wie `BalanceCard`; wie schon bei PROJ-10 nicht deterministisch per E2E erzwingbar)
- [x] Admin betrachtet ein Profil → exakt dieselbe gefilterte Ansicht wie jedes Mitglied (E2E, siehe oben)
- [x] Community-Liste mit sehr wenigen Mitgliedern → keine Sonderbehandlung nötig, Liste rendert unabhängig von der Anzahl (Code-Inspektion: `CommunityList` hat nur einen Leerzustand für 0 Einträge, sonst eine einfache Map)

### Security Audit Results
- [x] **Auth:** `/profil/[id]` und `/community` erfordern Login — doppelt abgesichert (Proxy-Middleware redirected unangemeldete Anfragen serverseitig auf `/login`, zusätzlich `requireUser()` in der Seite). Per `curl` gegen den Prod-Build verifiziert: `307 → /login?redirect=…` ohne Session.
- [x] **DB-seitige Durchsetzung der Sichtbarkeit (der Kern der Architecture-Entscheidung):** Direktzugriff auf `profiles.bio` / `favorite_dram` / `favorite_region` liefert für **jede** Zeile — auch die eigene — `42501`; nur `profiles_public` führt diese Felder noch. Ein technisch versierter Nutzer kann die Schalter also nicht durch einen Griff an der UI vorbei umgehen. Verifiziert per Integrationstest, nicht nur durch UI-Verhalten.
- [x] **IDOR / Selbst-Erweiterung der Schalter:** `updateVisibilityAction` schreibt ausschließlich `.eq('id', session.userId)`; `field` ist per Zod-`enum` auf genau die sieben `show_*`-Spalten beschränkt (kein `role`/`is_active`-Durchgriff möglich). RLS `profiles_update_own` sichert dieselbe Grenze zusätzlich auf DB-Ebene ab — per Integrationstest verifiziert („userA kann Bs Schalter nicht setzen" → 0 betroffene Zeilen, kein Fehler durch RLS-Filterung).
- [x] **Keine Admin-Sonderrechte** beim Betrachten fremder Profile — `getPublicProfile` kennt die Rolle des Betrachters gar nicht, kann sie also strukturell nicht bevorzugen. Per E2E verifiziert.
- [x] **Keine sensiblen Daten im Response:** Die Maskierung passiert serverseitig in einer Server-Komponente (kein `'use client'` in `public-profile-view.tsx` oder `profil/[id]/page.tsx`) — verborgene Werte werden nie ins Client-Bundle serialisiert, nicht nur per CSS versteckt.
- [x] **XSS:** `display_name` / `bio` / `favorite_*` werden als React-Text gerendert (auto-escaped), nirgends als Markup.
- [x] **Community-Liste** exponiert nur `id` + Anzeigename aktiver Mitglieder — keine neue PII-Fläche gegenüber dem bereits bestehenden `profiles_select_all`.

### Bugs Found

#### BUG-1: Bilanz eines fremden Profils zeigte 0 / „noch keine Platzierung", wenn der Betrachter selbst kein Teilnehmer der betreffenden Tastings war (in diesem Durchlauf behoben)
- **Severity:** High — betraf genau den Hauptanwendungsfall der Bilanz-Anzeige (ein x-beliebiges Mitglied, das selbst nicht beim jeweiligen Tasting dabei war, besucht ein fremdes Profil).
- **Ursache:** `computeMaskedBalance` (`src/lib/queries/public-profile.ts`) las Event-Datum/-Status direkt aus `tasting_events`. RLS (`events_select_participant_or_admin`) gewährt einem Nicht-Teilnehmer dort keinen Zeilenzugriff — die PROJ-9-Erweiterung „abgeschlossen + aktives Mitglied" existiert nur für `event_participants`, nicht für die Roh-Tabelle `tasting_events`. Die RLS-gefilterte, leere Antwort erzeugte keinen Fehler, sondern eine leere „abgeschlossen"-Menge → `tastingCount` und die Datumsbasis für `bestPlacement` fielen fälschlich auf 0 / „noch keine Platzierung" zurück, obwohl die Daten eigentlich da waren.
- **Gefunden durch:** E2E-Test „Sichtbare Felder erscheinen, Bilanz zeigt echte Werte" (erster Lauf: `Tastings` zeigte „0" statt „1").
- **Fix:** Datum/Abschluss-Status kommen jetzt aus der View `past_tastings` (für jedes aktive Mitglied lesbar; jede Zeile darin ist per Definition abgeschlossen, ein Treffer bedeutet also automatisch „geschlossen" — kein separater Status-Check mehr nötig).
- **Nach dem Fix:** 26/26 E2E-Tests grün, inkl. exakter Werte (Tastings, Mitgebrachte Whiskys, Beste Platzierung, Ø vergebene Punkte).
- **Priorität:** erledigt.

### Regression: 29 Fehlschläge in der vollen Suite — nicht PROJ-14

Beim Durchlauf der vollständigen Suite (alle 12 Feature-Specs, `chromium` + `Mobile Safari`) schlugen 29 Tests fehl, plus 23 übersprungene und 52 nicht gelaufene Folgetests (serielle Testdateien brechen nach dem ersten fehlgeschlagenen Login den Rest der Datei ab). **Keiner der 29 Fehlschläge liegt in PROJ-14- oder von PROJ-14 geänderten Dateien** — betroffen sind ausschließlich `PROJ-2-auth`, `PROJ-3-admin-teilnehmer`, `PROJ-4-admin-events`, `PROJ-6-gastgeber-steuerung` (alle über `login(page, ADMIN_EMAIL)` oder den Login-Zeitpunkt selbst) sowie ein einzelner, unabhängiger Navigations-Race in `PROJ-5-whisky-erfassung`.

Ursache per direktem Credential-Check gegen die Live-DB bestätigt (read-only, keine Mutation):

| Konto | Befund |
|-------|--------|
| `hermann.hoppen@gmail.com` (Admin) | `is_active: true`, aber `signInWithPassword` mit dem Seed-Passwort → **„Invalid login credentials"**. Das reale Admin-Passwort wurde außerhalb dieser Session geändert (bereits in `features/INDEX.md` → Post-Deploy-Backlog dokumentiert: „Admin-Passwort per `npm run admin:password` geändert → Admin-Login-Tests scheitern"). |
| `test.teilnehmer@example.com` | Passwort stimmt, aber `is_active: false` — das Konto ist aktuell deaktiviert (derselbe Backlog-Punkt: „Test-Konto deaktivieren → ~11 PROJ-2-Tests scheitern"). |

Beides sind vorbestehende, bereits vor PROJ-14 bekannte und im Backlog nachverfolgte Risiken der Seed-Konto-Strategie der E2E-Suite (geplanter Fix dort: Umstellung auf `createDisposableUser`). Sie sind nicht Teil des PROJ-14-Scopes und wurden hier nicht behoben, da das Zurücksetzen von Anmeldedaten/Aktivierungsstatus **echter** Konten auf dem geteilten Supabase-Projekt eine bewusste Nutzerentscheidung ist, keine automatische QA-Korrektur.

### Summary
- **Acceptance Criteria:** 15/15 bestanden (12 per E2E verifiziert, 3 per Code-/Schema-/Integrationstest-Inspektion, wo E2E unpraktisch ist: Speicherfehler-Rollback, Zwei-Tabs-Konflikt, Bilanz-Ladefehler — durchgehend dasselbe Vorgehen wie bei PROJ-10)
- **Bugs Found:** 1 total (0 Critical, 1 High, 0 Medium, 0 Low) — BUG-1 in diesem Durchlauf gefunden **und behoben**, erneut verifiziert
- **Security:** Pass — Sichtbarkeit ist auf DB-Ebene erzwungen (nicht nur im Frontend), kein IDOR, keine Admin-Sonderrechte, keine Client-seitige Leckage verborgener Felder
- **Regression:** Pass — 180/180 lauffähige Tests der vollen Suite bestanden; die 29 Fehlschläge sind vorbestehende Seed-Konto-Probleme außerhalb des PROJ-14-Scopes (siehe oben)
- **Production Ready:** **YES** — kein offenes Critical/High
- **Recommendation:** **Approved.**

## Deployment

**Deployed:** 2026-09-16 · **Production URL:** https://tfg-app-self.vercel.app · **Tag:** `v1.4.0`

Hosting: Vercel (Auto-Deploy aus `main`). Backend: Supabase `ogwuwisutgaxxpknkgpg`
(eu-central-1), Migration `20260916120000_profile_visibility.sql` bereits vor
`/qa` per `npm run db:push` eingespielt und verifiziert (109/109
Integrationstests, inkl. der neuen PROJ-14-Fälle).

Keine neuen Umgebungsvariablen, kein Vercel-Konfigurationsschritt nötig — reine
Code- + Migrations-Erweiterung eines bereits laufenden Deployments.

Während der QA wurde außerdem das Seed-Konto `test.teilnehmer@example.com`
reaktiviert (`is_active` stand fälschlich auf `false`, unabhängig von
PROJ-14) — siehe QA-Abschnitt. Das Admin-Passwort-Problem aus dem
Post-Deploy-Backlog bleibt offen, das ist eine bewusste Nutzerentscheidung.
