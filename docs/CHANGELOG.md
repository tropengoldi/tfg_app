# Changelog

> Versionshistorie der Whizzky-App (vorher Abschnitt „Stand der Roadmap“ in `features/INDEX.md`).
> Details zu jedem Feature stehen im Deployment- und QA-Abschnitt seiner Spec unter `features/`.
> Neue Einträge unten anhängen (chronologisch).

## Versionen

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
PROJ-20 (Whisky-Steward: Live-Einblick — Karte „Wertungen“ auf der Steuerungsseite mit
Einzelwertungen, Notizen und Sieger-Tipps aller Teilnehmer, nur solange das Tasting läuft; Hinweise
für die Teilnehmer am Notiz- und Tipp-Feld) am 2026-10-07 als `v1.13.0` live (mit DB-Migration
`20261010120000_steward_insight.sql` — zwei lesende Funktionen, Zugriffsregeln unverändert; 27/27 AC,
0 Bugs).
PROJ-21 (Whisky-Steward bringt Whiskies mit — Eintragen auf „Meine Whiskys“ mit Teilnehmer-Limit,
Zugang über „Meine Tastings“ und die Dashboard-Vorschau, Steward-Wechsel mit Whiskies blockiert, Bilanz
zählt mitgebracht, nicht Tastings) am 2026-10-09 als `v1.14.0` live (mit DB-Migration
`20261011120000_steward_brings_whiskies.sql` — `add_whisky` + `update_event` angepasst, Lese-Regeln
unverändert; 19/19 AC, 0 Bugs).
Am 2026-10-09 als `v1.14.1` nachgezogen (ohne DB-Migration): PROJ-25 BUG-1 behoben (Diagramme mit
`role="img"` und Wert-Zusammenfassung für Screenreader); dazu Wartungsskript `user:delete` kennt
gesendete Nachrichten und die Steward-Rolle.
PROJ-23 (Vergleichs-Merker — private Vergleichsgruppen in der Bewertungskarte, „Vergleichen mit“ +
Nummern-Knöpfe, Gruppen verschmelzen, nur ausgeschenkte Whiskies, nach dem Abschluss gelöscht) am
2026-10-09 als `v1.15.0` live (mit DB-Migration `20261012120000_compare_marks.sql` — Tabelle
`compare_marks`, RPC `toggle_compare_mark` (TS026), Aufräum-Auslöser beim Abschluss; 19/19 AC,
0 Bugs). Damit ist von der Roadmap nur noch PROJ-17 (Web-Push) offen.
PROJ-27 (Release-Notes-Seite „Neuigkeiten“: öffentliche Seite `/neuigkeiten` ohne Login, `noindex`,
Release Notes zu PROJ-18..26 auf dem Marken-Hintergrund) am 2026-10-09 als `v1.16.0` live, ohne
DB-Migration.
PROJ-28 (Whisky-Fotos: je ein optionales Foto pro Tasting-Whisky und Sammlungs-Eintrag, im Browser
verkleinert und ohne GPS, privater Bucket mit signierten Links, Blindheit bis zum Abschluss, danach
Archiv für alle aktiven Mitglieder; Mini-Bilder in Rangliste, Ausschankliste und Sammlung; Kopie bei
„Zur Sammlung hinzufügen“; neues Wartungsskript `photos:cleanup`) am 2026-11-23 als `v1.17.0` live (mit
DB-Migration `20261123120000_whisky_photos.sql`; 34/34 AC nach Re-Test, 1 High-Bug während der QA
gefunden und behoben — Whisky-Dialog auf dem Handy nicht abschließbar —, BUG-2 akzeptiert, BUG-3 Low
im Backlog).
PROJ-29 (Steward-Bewertung: Teilnehmer geben dem Whisky-Steward während des Tastings eine Note 0–10 mit
optionalem Kommentar, geheim bis zum Abschluss — auch für den Steward —, danach mit Namen auf der Ergebnisseite;
Bilanz „Als Whisky-Steward" mit eigenem Schalter) am 2026-11-24 als `v1.18.0` live (mit DB-Migration
`20261124120000_steward_scores.sql` — Tabelle `steward_scores`, RPCs `set_steward_score` /
`clear_steward_score` (TS028), Sicht `steward_scores_revealed`, `profiles.show_steward_balance`; 26/26 AC,
1 Medium-Bug während der QA gefunden und behoben — leere Bilanz-Karte im fremden Profil).
PROJ-30 (Feedback-Formular: dezenter Link „Fehler gefunden oder eine Idee?“ auf der Startseite, Seite `/feedback`
mit Art + Beschreibung, Versand per Gmail-SMTP an `FEEDBACK_EMAIL` mit Reply-To = Absender und Technik-Angaben,
Inhalt nicht gespeichert, max. 5 pro Stunde je Person über eine Zähler-Tabelle; E2E im Trockenlauf
`FEEDBACK_DRY_RUN=1`) am 2026-11-24 als `v1.19.0` live (mit DB-Migration
`20261125120000_feedback_submissions.sql` — Tabelle `feedback_submissions`, RPC `register_feedback` (TS029); 19/19 AC,
1 Low-Bug offen).
Offen auf der Roadmap: PROJ-17 (Web-Push).
Sonstige offene Arbeit siehe Post-Deploy-Backlog.

## Erledigte Betriebsaufgaben (ehemals Post-Deploy-Backlog)

- [x] **Custom SMTP** — Gmail-SMTP in Supabase eingerichtet, Mailversand läuft.
- [x] **Passwort-Reset / Einladung repariert** — die E-Mail-Vorlagen „Reset
      Password" und „Invite user" bauen den Link jetzt aus
      `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next=/passwort-setzen`
      statt aus `{{ .ConfirmationURL }}`. Damit entfällt die Abhängigkeit von der
      `redirect_to`-Allowlist **und** vom PKCE-`code_verifier`-Cookie; es ist der
      Pfad, den `src/app/auth/confirm/route.ts` + die PROJ-2-E2E-Tests abdecken.
      Voraussetzung: Supabase **Site URL** = `https://tfg-app-self.vercel.app`
      (ohne Slash). Siehe [[auth-email-tokenhash-template-fix]].
- [x] ~~**`siteUrl()` aus Request-Headern ableiten**~~ — **verworfen 2026-10-09.** Die
      Mail-Vorlagen bauen den Link aus `{{ .SiteURL }}` (Supabase-Einstellung) und nutzen das
      `redirectTo` aus `siteUrl()` gar nicht mehr; eine falsche `NEXT_PUBLIC_SITE_URL` bricht
      die Links also nicht. Den Ursprung aus `Host`-Headern abzuleiten, wäre zudem anfällig für
      Host-Header-Poisoning. Kein Code geändert.
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
- [x] **PROJ-25 BUG-1 (Low): Diagramme ohne Textalternative** — behoben 2026-10-09 (`role="img"` + Wert-Zusammenfassung als Label). — Balken- und Punktdiagramm
      auf der Ergebnisseite tragen ihr `aria-label` auf einem `div` ohne Rolle; Screenreader
      ignorieren es. Fix: `role="img"` + kurze Textzusammenfassung je Diagramm
      (`metric-bar-chart.tsx`, `metric-scatter-chart.tsx`).
- [x] **`user:delete`-Bericht kennt keine Nachrichten** — behoben 2026-10-09: Fußabdruck, `hard` und `cascade` kennen jetzt auch gesendete Nachrichten **und** die Rolle Whisky-Steward (`helper_id`, ebenfalls `on delete restrict`, war auch unbekannt). `cascade` nimmt den Steward aus Events und löscht gesendete Nachrichten. Mit Wegwerf-Konten geprüft. — `MODE=report` meldet „hard ist sicher“,
      obwohl gesendete Nachrichten (`messages.sender_id … on delete restrict`, PROJ-16) das
      Löschen blockieren („Database error deleting user“). Fix: im Bericht mitzählen und bei
      `hard` darauf hinweisen (`scripts/delete-user.mjs`). Aufgefallen bei PROJ-26 (2026-10-06).
