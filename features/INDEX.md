# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | Supabase-Infrastruktur | Deployed | [PROJ-1-supabase-infrastruktur.md](PROJ-1-supabase-infrastruktur.md) | 2026-08-27 |
| PROJ-2 | Auth & Zugangskontrolle | Deployed | [PROJ-2-auth-zugangskontrolle.md](PROJ-2-auth-zugangskontrolle.md) | 2026-08-27 |
| PROJ-3 | Admin – Teilnehmerverwaltung | Deployed | [PROJ-3-admin-teilnehmerverwaltung.md](PROJ-3-admin-teilnehmerverwaltung.md) | 2026-08-27 |
| PROJ-4 | Admin – Tasting-Events verwalten | Deployed | [PROJ-4-admin-tasting-events.md](PROJ-4-admin-tasting-events.md) | 2026-08-27 |
| PROJ-5 | Whisky-Erfassung (blind) | Deployed | [PROJ-5-whisky-erfassung.md](PROJ-5-whisky-erfassung.md) | 2026-08-27 |
| PROJ-6 | Gastgeber-Steuerung & Ablauf | Deployed | [PROJ-6-gastgeber-steuerung.md](PROJ-6-gastgeber-steuerung.md) | 2026-08-27 |
| PROJ-7 | Bewertungsansicht | Deployed | [PROJ-7-bewertungsansicht.md](PROJ-7-bewertungsansicht.md) | 2026-08-27 |
| PROJ-8 | Tasting-Dashboard mit Live-Sync | Deployed | [PROJ-8-tasting-dashboard.md](PROJ-8-tasting-dashboard.md) | 2026-08-27 |
| PROJ-9 | Ergebnisse & Tasting-Historie | Deployed | [PROJ-9-ergebnisse-tasting-historie.md](PROJ-9-ergebnisse-tasting-historie.md) | 2026-08-27 |
| PROJ-10 | Profil-Seite mit persönlicher Bilanz | Deployed | [PROJ-10-profil-persoenliche-bilanz.md](PROJ-10-profil-persoenliche-bilanz.md) | 2026-08-27 |
| PROJ-11 | Neutraler Helfer pro Event | Deployed | [PROJ-11-neutraler-helfer-pro-event.md](PROJ-11-neutraler-helfer-pro-event.md) | 2026-08-29 |
| PROJ-12 | App-Icon & Homescreen | Deployed | [PROJ-12-app-icon-homescreen.md](PROJ-12-app-icon-homescreen.md) | 2026-08-30 |
| PROJ-13 | Marken-Auftritt (Whizzky) | Deployed | [PROJ-13-marken-auftritt-whizzky.md](PROJ-13-marken-auftritt-whizzky.md) | 2026-08-30 |
| PROJ-14 | Profil sichtbar für andere (Sichtbarkeits-Einstellungen) | Deployed | [PROJ-14-profil-sichtbar-fuer-andere.md](PROJ-14-profil-sichtbar-fuer-andere.md) | 2026-09-16 |
| PROJ-15 | Persönliche Whisky-Datenbank (teilbar) | Deployed | [PROJ-15-persoenliche-whisky-datenbank.md](PROJ-15-persoenliche-whisky-datenbank.md) | 2026-09-16 |
| PROJ-16 | Nachrichten an Teilnehmer | Deployed | [PROJ-16-nachrichten-an-teilnehmer.md](PROJ-16-nachrichten-an-teilnehmer.md) | 2026-09-28 |
| PROJ-17 | Web Push Benachrichtigungen für Nachrichten | Roadmap | – | 2026-09-29 |
| PROJ-18 | Begriffe: Gaumenpunkte & Whisky-Steward | Deployed | [PROJ-18-begriffe-gaumenpunkte-whisky-steward.md](PROJ-18-begriffe-gaumenpunkte-whisky-steward.md) | 2026-10-05 |
| PROJ-19 | Flexible Punkteskala (0 Punkte, 0,5er-Schritte) | Deployed | [PROJ-19-flexible-punkteskala.md](PROJ-19-flexible-punkteskala.md) | 2026-10-05 |
| PROJ-20 | Whisky-Steward: Live-Einblick in Wertungen | Planned | [PROJ-20-steward-live-einblick.md](PROJ-20-steward-live-einblick.md) | 2026-10-05 |
| PROJ-21 | Whisky-Steward bringt Whiskies mit | Roadmap | – | 2026-10-05 |
| PROJ-22 | Sieger-Tipp & „Kenner der Woche" | Deployed | [PROJ-22-sieger-tipp-kenner-der-woche.md](PROJ-22-sieger-tipp-kenner-der-woche.md) | 2026-10-05 |
| PROJ-23 | Vergleichs-Merker | Roadmap | – | 2026-10-05 |
| PROJ-24 | Eigene Live-Rangliste | Deployed | [PROJ-24-eigene-live-rangliste.md](PROJ-24-eigene-live-rangliste.md) | 2026-10-05 |
| PROJ-25 | Erweiterte Ergebnis-Statistiken | Deployed | [PROJ-25-erweiterte-ergebnis-statistiken.md](PROJ-25-erweiterte-ergebnis-statistiken.md) | 2026-10-05 |
| PROJ-26 | Testkonten für normale Nutzer unsichtbar | Deployed | [PROJ-26-testkonten-unsichtbar.md](PROJ-26-testkonten-unsichtbar.md) | 2026-10-05 |

<!-- Add features above this line -->

## Next Available ID: PROJ-27

## Stand der Roadmap

PROJ-1..16 **Deployed**. PROJ-11 (Neutraler Helfer) am 2026-08-31 als `v1.3.0`
live (mit DB-Migration `20260831120000_helper_role.sql`). PROJ-14 (Profil für
andere Teilnehmer einsehbar, mit granularer Sichtbarkeitssteuerung) am
2026-09-16 als `v1.4.0` live (mit DB-Migration
`20260916120000_profile_visibility.sql`; 15/15 Acceptance Criteria, 1
High-Bug während der QA gefunden und behoben, Security-Audit ohne Befund).
Die volle E2E-Regressionssuite zeigt daneben 29 vorbestehende, nicht
PROJ-14-bezogene Fehlschläge durch ein Seed-Konto-Problem
(Admin-Passwort ≠ Seed-Passwort — `test.teilnehmer@example.com` wurde
während der QA bereits reaktiviert) — siehe QA-Abschnitt der Spec und den
Backlog-Punkt unten. PROJ-15 (persönliche, optional teilbare
Whisky-Sammlung à la Vivino, baut auf PROJ-14 auf) am 2026-09-17 als
`v1.5.0` live (mit DB-Migration `20260917120000_collection_entries.sql` —
neue Tabelle mit zeilenweiser RLS statt einer maskierenden Sicht,
Herkunftsfeld per Spalten-GRANT eingefroren; ein erster `db:push`-Versuch
scheiterte an der Anlage-Reihenfolge Spalte/Funktion, nach Fix erfolgreich
eingespielt; 24/24 Acceptance Criteria, 36/36 neue E2E-Tests, 0 Bugs,
Security-Audit ohne Befund). Die gezielte Regression auf PROJ-9/10/14 zeigt
daneben 1 vorbestehenden, nicht PROJ-15-bezogenen Fehlschlag durch dasselbe
Seed-Admin-Passwort-Problem wie bei PROJ-14 (siehe QA-Abschnitt der Spec und
den Backlog-Punkt unten). PROJ-16 (Nachrichten an Teilnehmer — tasting-bezogen
oder allgemein, v1 per E-Mail, spätere Ausbaustufe als In-App-Push) am
2026-09-28 als `v1.6.0` live (mit DB-Migration `20260928120000_messages.sql`
— 2 Tabellen, 2 SECURITY-DEFINER-RPCs, kein Direktschreibzugriff; 16/16
Acceptance Criteria, 2 High-Bugs während der QA gefunden und behoben:
Nodemailer-Versand korrumpierte den wiederverwendeten Supabase-Client vor dem
zweiten RPC-Aufruf — jeder Versand schlug zuverlässig fehl; außerdem brach
ein für den pausierten VPS-Pfad gesetztes `output: 'standalone'` die
komplette lokale E2E-Infrastruktur, betraf also nicht nur PROJ-16. Security-
Audit inkl. gezielt getesteter E-Mail-Header-Injection ohne Befund). Am
2026-09-28 als `v1.6.1` nachgezogen: der Helfer (PROJ-11) fehlte als
möglicher Empfänger einer tasting-bezogenen Nachricht (Nutzer-Fund nach dem
Go-Live) — Migration `20260928130000_messages_include_helper.sql` behebt es,
133/133 Integrationstests, 18/18 E2E-Tests.
PROJ-18 (Begriffe: Nasenpunkte/Gaumenpunkte, Rolle „Whisky-Steward") am
2026-10-05 als `v1.7.0` live (mit DB-Migration
`20261005120000_whisky_steward_messages.sql` — nur Meldungstexte; 18/19
Prüfpunkte, 1 vorbestehender Low-Bug (Slider ohne zugänglichen Namen, BUG-1)
wird mit PROJ-19 behoben).
PROJ-19 (Flexible Punkteskala: 0 Punkte, 0,5er-Schritte je Tasting, private
Sammlung immer 0,5er, Slider ab 0 mit −/+, Rückfrage bei 0/0) am 2026-10-05 als
`v1.8.0` live (mit DB-Migration `20261006120000_flexible_rating_scale.sql` —
Punkte als `numeric(3,1)`, `tasting_events.rating_step`, Trigger TS021,
Ranglisten-Sichten neu; 29/30 AC + 1 bewusste Abweichung, 2 Low-Bugs offen →
PROJ-25; PROJ-18 BUG-1 (Slider-Screenreader-Name) dabei behoben).
PROJ-25 (Erweiterte Ergebnis-Statistiken: Ausschank-Nr. + „Dein Platz" in der
Rangliste, Statistik-Karten, Balken- und Punktdiagramm; dazu Alkohol/Alter/Preis
im Eintrage-Formular, nach dem Abschluss für alle sichtbar) am 2026-10-05 als
`v1.9.0` live (mit DB-Migration `20261007120000_results_stats.sql` — Spalten an
`whisky_rankings` / `past_tastings` angehängt, TS022; neues Paket `recharts`;
41/41 AC, 1 Low-Bug offen; PROJ-19 BUG-1/BUG-2 mitbehoben).
PROJ-22 (Sieger-Tipp & „Kenner der Woche": blinder Tipp während des Tastings,
Kenner beim Sieger + „Alle Tipps" auf der Ergebnisseite, Zähler in der Bilanz mit
eigenem Sichtbarkeits-Schalter) am 2026-10-06 als `v1.10.0` live (mit DB-Migration
`20261008120000_winner_tips.sql` — Tabelle `winner_tips`, RPC `set_winner_tip`
(TS023), Sicht `winner_tips_revealed`, `profiles.show_kenner_count`; 24/24 AC,
1 Medium-Bug während der QA gefunden und behoben — Netzwerkfehler beim Tippen/
Bewerten landete in der Fehlergrenze, Fix gilt auch für PROJ-7).
PROJ-24 (Eigene Live-Rangliste: aufklappbar in der Bewertungsansicht, nur aus den
eigenen gespeicherten Wertungen, Zeile springt zum Whisky, Pokal-Knopf setzt den
Sieger-Tipp, nach dem Abschluss mit Namen) am 2026-10-06 als `v1.11.0` live — ohne
DB-Migration; gemeinsame Platzierungsregel mit „Dein Platz" (PROJ-25); 25/25 AC,
2 Low-Bugs gefunden und behoben (davon 1 vorbestehend aus PROJ-7).
PROJ-26 (Testkonten für normale Nutzer unsichtbar: Admin markiert Konten als Testkonto, normale
Mitglieder sehen weder Testkonten noch Tastings mit Testkonten-Beteiligung, Durchsetzung per RLS;
E2E-Wegwerfkonten automatisch Testkonten, Wegwerf-Admin statt Seed-Admin) am 2026-10-07 als
`v1.12.0` live (mit DB-Migration `20261009120000_test_accounts.sql`; 26/26 AC, 2 High-Bugs während
der QA: BUG-1 behoben, BUG-2 umgangen — Dashboard ohne „Test“-Abzeichen, Live-Neuladen robuster).
Sonstige offene Arbeit siehe Post-Deploy-Backlog.

## Post-Deploy-Backlog (Betrieb)

Betriebsaufgaben rund um das Live-Deployment (2026-08-30, v1.0.0). Kein
`/write-spec` nötig — Konfiguration bzw. kleine Chores.

- [x] **Custom SMTP** — Gmail-SMTP in Supabase eingerichtet, Mailversand läuft.
- [x] **Passwort-Reset / Einladung repariert** — die E-Mail-Vorlagen „Reset
      Password" und „Invite user" bauen den Link jetzt aus
      `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next=/passwort-setzen`
      statt aus `{{ .ConfirmationURL }}`. Damit entfällt die Abhängigkeit von der
      `redirect_to`-Allowlist **und** vom PKCE-`code_verifier`-Cookie; es ist der
      Pfad, den `src/app/auth/confirm/route.ts` + die PROJ-2-E2E-Tests abdecken.
      Voraussetzung: Supabase **Site URL** = `https://tfg-app-self.vercel.app`
      (ohne Slash). Siehe [[auth-email-tokenhash-template-fix]].
- [ ] **`siteUrl()` aus Request-Headern ableiten** statt aus
      `NEXT_PUBLIC_SITE_URL` (`src/lib/actions/auth.ts` + `admin.ts`) — kleiner
      `/refine PROJ-2`-Nachzug, damit eine falsch gesetzte Env-Var diese Links
      nicht mehr brechen kann.
- [ ] **Sentry / Error-Tracking** — siehe `docs/production/error-tracking.md`
- [ ] **Supabase Advisors** (Security + Performance) im Dashboard prüfen;
      Leaked-Password-Protection einschalten. Die „Security Definer View"-Warnung
      für `whisky_rankings` / `past_tastings` / `whisky_score_breakdown` ist
      gewollt (PROJ-9).
- [ ] **Alten Supabase Personal Access Token widerrufen** (steckte in `.mcp.json`)
- [x] **E2E-Suite hängt an den Seed-Konten** — erledigt mit PROJ-26 (`v1.12.0`): Wegwerf-Konten
      sind automatisch Testkonten, Admin-Pfad über einen Wegwerf-Admin, kein Seed-Passwort mehr nötig.
      Ursprünglich: (`tests/helpers/auth.ts`): der
      „normaler Teilnehmer"-Pfad meldet sich als `test.teilnehmer@example.com`
      an, der Admin-Pfad als `hermann.hoppen@gmail.com` — beide mit
      `SEED_PASSWORD`. Post-Deploy stört das:
      - Test-Konto deaktivieren → ~11 PROJ-2-Tests scheitern („Zugang
        deaktiviert"). Konto steht deshalb **wieder auf `is_active = true`**;
        Fußabdruck 0.
      - Admin-Passwort per `npm run admin:password` geändert → Admin-Login-Tests
        scheitern (2 in PROJ-2, evtl. weitere in PROJ-3..12).
      **Fix:** Helper auf `createDisposableUser` (+ `setRole(..., 'admin')` für
      einen Wegwerf-Admin) umstellen, damit die Suite unabhängig von den
      Seed-Konten läuft. Danach kann das Test-Konto endgültig weg und das
      Admin-Passwort bleibt geändert.
- [ ] **PROJ-25 BUG-1 (Low): Diagramme ohne Textalternative** — Balken- und Punktdiagramm
      auf der Ergebnisseite tragen ihr `aria-label` auf einem `div` ohne Rolle; Screenreader
      ignorieren es. Fix: `role="img"` + kurze Textzusammenfassung je Diagramm
      (`metric-bar-chart.tsx`, `metric-scatter-chart.tsx`).
- [ ] **`user:delete`-Bericht kennt keine Nachrichten** — `MODE=report` meldet „hard ist sicher“,
      obwohl gesendete Nachrichten (`messages.sender_id … on delete restrict`, PROJ-16) das
      Löschen blockieren („Database error deleting user“). Fix: im Bericht mitzählen und bei
      `hard` darauf hinweisen (`scripts/delete-user.mjs`). Aufgefallen bei PROJ-26 (2026-10-06).
- [ ] **E2E-Specs in CI sharden / `--workers=1`** (BUG-2) plus der projektweite
      transiente Hydration-Doppelrender

### Wartungsskripte (Service-Role, kein UI)

- `npm run tasting:list` — alle Events auflisten (Datum · Status · Whiskys/
  Bewertungen · Gastgeber · **ID** · Ort). Gleiches Skript ohne `EVENT_ID`.
- `npm run tasting:delete` — Event komplett löschen (`EVENT_ID=…`,
  `CONFIRM=yes`). Trockenlauf ohne `CONFIRM`. Whiskys/Details/Bewertungen/
  Teilnahme gehen per CASCADE mit.
- `npm run user:delete` — Nutzer verwalten (`EMAIL=…`, `MODE=report|soft|
  reactivate|hard|cascade`, `CONFIRM=yes` für alles Destruktive). `report` zeigt
  den Fußabdruck; `soft` = `is_active=false` (versteckt, Historie bleibt);
  `hard` nur ohne geschützte Verweise; `cascade` löscht auch die Historie und
  ist für Admin-/`created_by`-Konten gesperrt.
- Details in den Datei-Köpfen von `scripts/delete-tasting.mjs` /
  `scripts/delete-user.mjs`.

**Konkrete Beispiele (PowerShell, im Projektordner):**

```powershell
# 1) Events auflisten und die ID heraussuchen
npm run tasting:list

# 2) Trockenlauf für ein Event (zeigt nur, was gelöscht würde)
$env:EVENT_ID='2c7cb11e-4157-4b53-94f3-75835f99f5c9'; npm run tasting:delete

# 3) wirklich löschen (Event + Whiskys + Bewertungen + Teilnahme)
$env:EVENT_ID='2c7cb11e-4157-4b53-94f3-75835f99f5c9'; $env:CONFIRM='yes'; npm run tasting:delete

# 4) danach die gesetzten Variablen wieder entfernen
Remove-Item Env:EVENT_ID, Env:CONFIRM
```

```powershell
# Nutzer: Fußabdruck ansehen, dann deaktivieren (reversibel, Historie bleibt)
$env:EMAIL='alt.mitglied@example.com'; $env:MODE='report'; npm run user:delete
$env:MODE='soft'; $env:CONFIRM='yes'; npm run user:delete
Remove-Item Env:EMAIL, Env:MODE, Env:CONFIRM
```

Als Einzeiler (setzt, führt aus, räumt auf):

```powershell
$env:EVENT_ID='<ID>'; $env:CONFIRM='yes'; npm run tasting:delete; Remove-Item Env:EVENT_ID, Env:CONFIRM
```

---

## Feature Map

Empfohlene Baureihenfolge: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10**.
Sie folgt dem Datenlebenszyklus, damit jedes Feature gegen echte Daten des Vorgängers
end-to-end testbar ist — die Bewertungsansicht lässt sich nicht sinnvoll prüfen, bevor
Whiskies existieren und eine Runde läuft.

| ID | Feature | Beschreibung | Prio | Abhängig von |
|----|---------|--------------|------|--------------|
| **PROJ-1** | **Supabase-Infrastruktur** | Datenbankschema, Constraints, Indizes, RLS-Policies und Helper-Funktionen, RPCs für alle Zustandsübergänge, Ranglisten-Views, Realtime-Publication, Seed-Daten (Admin + Testteilnehmer + Beispiel-Event), generierte TypeScript-Typen, Supabase-Clients | P0 | – |
| **PROJ-2** | **Auth & Zugangskontrolle** | Login, Passwort setzen und zurücksetzen, SSR-Session-Middleware, App-Shell mit Bottom-Navigation, Rollenprüfungen für Admin- und Gastgeber-Bereiche, öffentliche Registrierung gesperrt | P0 | PROJ-1 |
| **PROJ-3** | **Admin – Teilnehmerverwaltung** | Teilnehmer per E-Mail einladen, auflisten und deaktivieren | P0 | PROJ-2 |
| **PROJ-4** | **Admin – Tasting-Events verwalten** | Event anlegen und bearbeiten: Gastgeber, Datum, Ort, Teilnehmerliste, maximale Anzahl Whiskies pro Person (Gastgeber darf einen mehr), Thema | P0 | PROJ-3 |
| **PROJ-5** | **Whisky-Erfassung (blind)** | Teilnehmer trägt die von ihm mitgebrachten Whiskies ein inkl. optionalem Link zum Verkostungsvideo; Limitprüfung mit Gastgeber-Bonus; nur der Bringer und der Gastgeber sehen die Details | P0 | PROJ-4 |
| **PROJ-6** | **Gastgeber-Steuerung & Ablauf** | Eckdaten des Abends (Thema, Essen, Anmerkungen), Ausschankreihenfolge per Drag & Drop, Event starten, Runde abschließen, Event abschließen | P0 | PROJ-5 |
| **PROJ-7** | **Bewertungsansicht** | Nasenpunkte 1–5 und Geschmackspunkte 1–10 per Slider, optionale Notizen, änderbar bis zum Abschluss des Events | P0 | PROJ-6 |
| **PROJ-8** | **Tasting-Dashboard mit Live-Sync** | Eckdaten, Teilnehmerliste, Whiskyglas-Fortschritt, Absprünge zu Bewertung/Gastgeber/Historie, Realtime-Aktualisierung aller Geräte beim Rundenwechsel | P0 | PROJ-7 |
| **PROJ-9** | **Ergebnisse & Tasting-Historie** | Rangliste nach Abschluss (Gesamt-, Nasen-, Geschmackspunkte) mit Link zum Verkostungsvideo je Whisky, Liste vergangener Tastings mit Datum, Gastgeber und Sieger-Whisky, Detailansicht | P1 | PROJ-7 |
| **PROJ-10** | **Profil-Seite mit persönlicher Bilanz** | Eigene Daten bearbeiten (Anzeigename, Lieblings-Dram, Lieblingsregion, Kurzbeschreibung) plus persönliche Bilanz: Anzahl Tastings, mitgebrachte Whiskies, beste Platzierung, Ø vergebene Punkte | P2 | PROJ-9 |
| **PROJ-11** | **Neutraler Helfer pro Event** | Optionale Rolle je Event: eine Person, die selbst nicht mitverkostet, aber Einblick in die geheimen Whisky-Details hat und den Ablauf steuern darf (Ausschankreihenfolge festlegen, Runden weiterschalten u. ä.). Ist ein Helfer für ein Event benannt, hat der Gastgeber dieses Abends nur noch die Einblicke eines normalen Teilnehmers (er verkostet dann blind mit). Betrifft Rollen-/Berechtigungsmodell (RLS, Helper-Funktionen), Event-Anlage (PROJ-4) und Gastgeber-Steuerung (PROJ-6). | P2 | PROJ-6 |
| **PROJ-12** | **App-Icon & Homescreen** | Icon-Set für „Zum Startbildschirm hinzufügen" auf dem Handy: Web-App-Manifest (`manifest.webmanifest`), `apple-touch-icon`, Favicon-Varianten, `theme-color`. Kein Service-Worker / keine Offline-Fähigkeit (PRD-Non-Goal), nur das Icon + der Name auf dem Homescreen. | P2 | PROJ-2 |
| **PROJ-13** | **Marken-Auftritt (Whizzky)** | Bündelt zwei visuelle Änderungen an denselben Bausteinen (Auth-Layout, App-Shell-Header, `PageHeader`): (a) Haupt-Überschrift auf **„Whizzky"** mit kleinerer Unterzeile **„Treffpunkt feiner Geister"** statt „Whisky Tasting"; (b) ein dezentes, thematisch passendes Hintergrundbild in der Anmelde-Maske und hinter den Seiten-Überschriften. Rein Frontend, keine DB-Änderung. Assets liegen unter `public/`. | P2 | PROJ-2 |
| **PROJ-14** | **Profil sichtbar für andere** | Andere Teilnehmer können das Profil eines Nutzers read-only einsehen (Stammdaten + persönliche Bilanz aus PROJ-10). Jeder legt in seinem eigenen Profil pro Feld fest, ob es für andere sichtbar ist. Betrifft Datenmodell/RLS (neue Sichtbarkeits-Flags) und die PROJ-10-Profilseite (neue Detailansicht für fremde Profile). | P2 | PROJ-10 |
| **PROJ-15** | **Persönliche Whisky-Datenbank** | Eigene Sammlung/Tasting-Log im Profilbereich, unabhängig von Events (Vivino-artig): Whiskies frei eintragen, eigene Bewertung/Notizen. Sichtbarkeit für andere Teilnehmer folgt denselben Einstellungen wie PROJ-14 — keine öffentliche, gemeinsame Datenbank und kein externer Katalog (das PRD-Non-Goal bleibt bestehen, siehe dort). | P2 | PROJ-14 |
| **PROJ-16** | **Nachrichten an Teilnehmer** | Mitglieder schreiben Nachrichten an andere Mitglieder — entweder an alle Teilnehmer eines bestimmten Tastings (Adressaten automatisch aus der Teilnehmerliste) oder frei an eine Auswahl aktiver Mitglieder. Erste Ausbaustufe per E-Mail-Versand, spätere Ausbaustufe als In-App-Push. | P2 | PROJ-4 |
| **PROJ-17** | **Web Push Benachrichtigungen für Nachrichten** | Ausbaustufe von PROJ-16: Empfänger einer Nachricht können zusätzlich zur E-Mail eine Push-Benachrichtigung auf ihrem Smartphone erhalten (Android & iOS), sofern sie die App als PWA zum Homescreen hinzugefügt und Push aktiviert haben. Web-Push-Standard (VAPID), kein Drittanbieter-Dienst, keine native App. | P2 | PROJ-16, PROJ-12 |
| **PROJ-18** | **Begriffe: Gaumenpunkte & Whisky-Steward** | Reine Umbenennung in allen sichtbaren Texten (UI, Fehlermeldungen, E-Mail-Texte, Doku): „Nase" → **„Nasenpunkte"**, „Geschmack" → **„Gaumenpunkte"**, „Helfer" → **„Whisky-Steward"**. DB-Bezeichner (`nose_points`, `taste_points`, `helper_id`) bleiben unverändert. Eine Migration ist nur zulässig, um sichtbare DB-Fehlermeldungen („Nur Gastgeber, Helfer oder Admin …") umzutexten — Weg entscheidet `/architecture`. | P1 | – |
| **PROJ-19** | **Flexible Punkteskala** | (a) **0 Punkte** werden erlaubt (Nasenpunkte 0–5, Gaumenpunkte 0–10). (b) Der Admin legt **pro Tasting** fest, ob in **1er- oder 0,5er-Schritten** bewertet wird; nach dem Start des Events nicht mehr änderbar. (c) Die private Sammlung (PROJ-15) bewertet **immer in 0,5er-Schritten** (0–10). Betrifft DB-Spaltentypen (Ganzzahl → Dezimal), die generierte Gesamtsumme, alle Ranglisten-Views, die Slider (PROJ-7) und die Bilanz-Durchschnitte (PROJ-10). | P1 | PROJ-18 |
| **PROJ-20** | **Whisky-Steward: Live-Einblick in Wertungen** | Ist für ein Tasting ein Steward benannt, sieht er **während** des Tastings alle Zwischenstände: abgegebene Einzelwertungen aller Teilnehmer **inkl. ihrer privaten Notizen**. Teilnehmer sehen in der Bewertungsansicht einen **Hinweis**, dass der Steward ihre Notizen lesen kann. Bricht bewusst die bisherige Zusage „fremde Notizen sind nie lesbar" (`whisky_score_breakdown` ohne `notes`) — nur für die Steward-Rolle, nur für sein Event. Die Blindheit der Verkoster bleibt unberührt. | P2 | PROJ-18 |
| **PROJ-21** | **Whisky-Steward bringt Whiskies mit** | Der Steward darf optional Whiskies für sein Tasting einreichen, obwohl er selbst nicht mitverkostet. Die Teilnehmer bewerten sie wie alle anderen. Offen für die Spec: welches Limit gilt für ihn (wie Teilnehmer / wie Gastgeber-Bonus) und wie erscheint er in Rangliste und Bilanz („mitgebrachte Whiskies"). | P2 | PROJ-18 |
| **PROJ-22** | **Sieger-Tipp & „Kenner der Woche"** | Während eines laufenden Tastings tippt jeder Teilnehmer blind („Whisky 3"), welcher Whisky gewinnt. Nach dem Abschluss werden alle mit richtigem Tipp als **„Kenner der Woche"** ausgewiesen — **im jeweiligen Tasting** (Ergebnisseite) und als **Zähler in der eigenen Profil-Bilanz** (PROJ-10/14). **Keine** Kenner-Rangliste über alle Tastings hinweg (PRD-Non-Goal bleibt). Tipps anderer bleiben bis zum Abschluss unsichtbar. | P2 | PROJ-19 |
| **PROJ-23** | **Vergleichs-Merker** | Privater Merker während des Tastings: Pro Whisky kann man per Mehrfachauswahl festhalten, mit welchen anderen Whiskies man ihn noch einmal direkt vergleichen möchte (z. B. „Whisky 2 ↔ 5"). Nur für einen selbst sichtbar. | P2 | – |
| **PROJ-24** | **Eigene Live-Rangliste** | Während des Tastings sieht jeder Teilnehmer seine **persönliche** Rangliste, berechnet nur aus den eigenen bisherigen Wertungen (blinde Nummern, keine Namen, keine fremden Punkte). | P2 | PROJ-19 |
| **PROJ-25** | **Erweiterte Ergebnis-Statistiken** | Nach dem Abschluss: (1) Rangliste zeigt die **Ausschank-Nummer** jedes Whiskys; (2) Rangliste zeigt je Whisky die **eigene Platzierung** des Betrachters; (3) **Vergleichsdiagramm** der Tasting-Whiskies über Gesamtplatzierung, Nasenpunkte, Gaumenpunkte, Alkoholgehalt und Alter (ohne Altersangabe: 3 Jahre angenommen, im Diagramm als „angenommen" markiert). Zusatzvorschläge für die Spec: **Preis-Leistungs-Sieger** (Punkte je Euro, nur wenn Preise erfasst sind — `price_eur` existiert bereits), **Konsens- vs. umstrittenster Whisky** (Streuung der Bewertungen), **Nase-/Gaumen-Diskrepanz** (größte Abweichung zwischen Nasen- und Gaumenrang), **persönliche Übereinstimmung** mit der Gesamtrangliste. Alles pro Tasting, keine Auswertung über die Runde hinweg. **Mit erledigen:** PROJ-19 BUG-2 (Historie zeigt „kein Sieger", wenn nur 0-Punkte vergeben wurden — Logik `winner_points > 0`) und BUG-1 (TS021-Meldung bei manipulierten Nachkommastellen). | P1 | PROJ-19 |
| **PROJ-26** | **Testkonten für normale Nutzer unsichtbar** | Der Admin markiert Konten als **Testkonto**. Normale Mitglieder sehen markierte Konten nirgends (Teilnehmerauswahl, Nachrichten-Empfänger, Teilnehmerlisten, Profile, „mitgebracht von"); **Tastings mit Testkonten-Beteiligung** werden für normale Nutzer komplett ausgeblendet (Dashboard, Historie, Ergebnisse, Bilanz). Testkonten sehen sich gegenseitig, damit Testläufe funktionieren; der Admin sieht alle, Testkonten mit Kennzeichen. Durchsetzung auf **Datenbankebene (RLS/Views)**, nicht nur im Frontend. Gilt auf Staging und Produktion. Für die Spec offen: Wegwerf-Konten der E2E-Suite automatisch markieren; Zusammenspiel mit dem Backlog-Punkt „E2E-Suite hängt an den Seed-Konten". | P2 | PROJ-3, PROJ-14 |

### Anmerkungen zur Aufteilung

- **App-Shell und Navigation liegen in PROJ-2**, nicht im Dashboard — sonst bräuchte jedes
  spätere Feature eine Wegwerf-Navigation zum Testen.
- **PROJ-8 ist bewusst das letzte P0.** Das Dashboard ist überwiegend Komposition dessen,
  was PROJ-4 bis PROJ-7 bereits gebaut haben, plus die Realtime-Schicht — und die lässt sich
  erst dann sinnvoll verifizieren, wenn es echten Zustand zu bewegen gibt.
- **Admin- und Teilnehmer-Funktionen sind getrennt** (PROJ-3/PROJ-4 vs. PROJ-5), weil sie
  unterschiedliche Rollen bedienen und unabhängig testbar sein müssen.
- **PROJ-9 ist P1**, weil ein erstes Tasting auch ohne Historienansicht durchführbar ist —
  die Daten entstehen trotzdem von Anfang an korrekt.
- **PROJ-10 hängt an PROJ-9, nicht an PROJ-2**, obwohl es nur eine Profilseite ist: die
  persönliche Bilanz („beste Platzierung", „Ø vergebene Punkte") liest die Ranglisten-View,
  die erst mit PROJ-9 gebaut wird. Die reine Stammdaten-Bearbeitung ginge früher — es lohnt
  sich aber nicht, die Seite zweimal anzufassen.
- **Der Link zum Verkostungsvideo** entsteht in PROJ-5 (eingeben) und wird in PROJ-9 sichtbar
  (nach der Auflösung). Er liegt in der geheimen Whisky-Tabelle, weil eine YouTube-URL den
  Whisky verrät — vor dem Abschluss sehen ihn nur der Bringer und der Gastgeber.
- **PROJ-11 (Neutraler Helfer)** ist bewusst nach hinten gelegt: Die P0-Kette geht davon
  aus, dass der Gastgeber ausschenkt und deshalb die Details sieht. Der Helfer ist eine
  Verfeinerung dieses Rollenmodells, die die Runde erst nach dem ersten echten Einsatz
  wirklich beurteilen kann. Wird zusammen mit / nach PROJ-6 spezifiziert, weil sie dieselben
  Berechtigungspfade (Ausschankreihenfolge, Runden schalten) betrifft.
- **PROJ-15 hängt an PROJ-14, nicht nur an PROJ-10**: „teilbar wie bei Vivino" heißt, die
  Sammlung nutzt dieselbe Sichtbarkeits-Steuerung, die PROJ-14 einführt. Erst wenn geklärt
  ist, was ein Nutzer über sich preisgibt, lässt sich sinnvoll festlegen, was er über seine
  Whisky-Sammlung preisgibt.
- **PROJ-18..25 (Feature-Wünsche vom 2026-10-05)** — empfohlene Reihenfolge
  **18 → 19 → 25 → 22 → 24 → 20 → 21 → 23**. PROJ-18 zuerst, weil die Umbenennung fast
  jede Datei mit sichtbarem Text berührt; danach schreiben alle Specs gleich die neuen
  Begriffe. PROJ-19 vor allem, was mit Punkten rechnet (Tipp, Live-Rangliste, Statistiken),
  weil sich mit Dezimalpunkten Summen und Gleichstände ändern. Die beiden Steward-Wünsche
  (PROJ-20/21) sind getrennt, weil sie unabhängige RLS-Pfade betreffen (Lesen fremder
  Wertungen vs. Einreichen von Whiskies). PROJ-22: „Kenner" bewusst nur pro Tasting + als
  Zähler in der eigenen Bilanz — eine Kenner-Rangliste über alle Tastings wäre eine
  gruppenweite Auswertung (PRD-Non-Goal).
