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
| PROJ-11 | Neutraler Helfer pro Event | Roadmap | – | 2026-08-29 |
| PROJ-12 | App-Icon & Homescreen | Roadmap | – | 2026-08-30 |
| PROJ-13 | Marken-Auftritt (Whizzky) | Roadmap | – | 2026-08-30 |

<!-- Add features above this line -->

## Next Available ID: PROJ-14

## Nächste Umsetzung (vor PROJ-11)

Reihenfolge: **PROJ-12 → PROJ-13**. Beides ist rein visuell/Frontend, keine
DB-Änderung. PROJ-11 (Neutraler Helfer) folgt danach.

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
- [x] **Test-Konto `test.teilnehmer@example.com`** ist deaktiviert (`is_active =
      false`). Es hat noch einen Fußabdruck (1 Event als Gastgeber, 5 Whiskys, 4
      Bewertungen — E2E-/Seed-Reste); bei Bedarf mit
      `npm run user:delete` + `MODE=cascade CONFIRM=yes` ganz entfernen.
- [ ] **E2E-Specs in CI sharden / `--workers=1`** (BUG-2) plus der projektweite
      transiente Hydration-Doppelrender

### Wartungsskripte (Service-Role, kein UI)

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
