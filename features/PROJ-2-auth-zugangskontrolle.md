# PROJ-2: Auth & Zugangskontrolle

## Status: Planned
**Created:** 2026-08-27
**Last Updated:** 2026-08-27

## Dependencies
- **Requires: PROJ-1 (Supabase-Infrastruktur)** — `profiles`-Tabelle mit `role` und
  `is_active`, die Supabase-Clients in `src/lib/supabase/{client,server,middleware}.ts`,
  der `handle_new_user`-Trigger und die zwei Seed-Konten (Admin + Testkonto).

## Kontext

PROJ-2 ist die Eintrittsschicht der App: Wer die Seite öffnet, ohne angemeldet zu sein,
sieht nur den Login. Wer angemeldet ist, bewegt sich in einer App-Shell mit
Bottom-Navigation und kommt nur in die Bereiche, die zu seiner Rolle passen.

Es gibt **keine öffentliche Registrierung**. Der Admin lädt Teilnehmer per E-Mail ein
(die Einladung selbst kommt in PROJ-3); PROJ-2 baut die Seite, auf der ein Einladungs-
oder Passwort-Zurücksetzen-Link landet.

Die eigentliche Datensicherheit liegt in der Datenbank (PROJ-1, RLS). PROJ-2 ergänzt die
zwei Schichten davor: eine Middleware, die die Session frisch hält und Unangemeldete
wegschickt, und Rollen-Prüfungen in den Layouts der geschützten Bereiche.

## User Stories

- Als **Teilnehmer** möchte ich mich mit E-Mail und Passwort anmelden, damit ich Zugang
  zur App unserer Runde habe.
- Als **neu eingeladener Teilnehmer** möchte ich über den Einladungslink ein eigenes
  Passwort vergeben und danach direkt angemeldet sein, damit ich ohne Umweg loslegen kann.
- Als **Teilnehmer, der sein Passwort vergessen hat**, möchte ich mir per E-Mail einen
  Link zum Zurücksetzen schicken lassen, damit ich wieder reinkomme, ohne den Admin zu
  fragen.
- Als **angemeldeter Nutzer** möchte ich mich abmelden können, damit auf einem geteilten
  Gerät niemand meinen Zugang weiterbenutzt.
- Als **Admin** möchte ich, dass die Admin-Bereiche für Nicht-Admins gar nicht sichtbar
  sind (nicht nur gesperrt), damit niemand herumprobiert.
- Als **ausgeschiedener Ex-Teilnehmer** soll ich mich nicht mehr einloggen können, damit
  deaktivierte Mitglieder keinen Zugriff behalten.
- Als **Nutzer am Handy** möchte ich per Bottom-Navigation zwischen Start, Tastings und
  Profil wechseln, damit sich die App wie eine App anfühlt.

## Out of Scope

- **„Registrieren"-Formular / öffentliche Anmeldung** — gibt es nicht (PRD: geschlossener
  Kreis). Das Abschalten von Signup in Supabase ist eine Dashboard-Einstellung und bereits
  als `/deploy`-Aufgabe erfasst (PROJ-1, FINDING-1).
- **Einladungen versenden, Teilnehmerliste, Deaktivieren** → PROJ-3. PROJ-2 baut nur die
  Landeseite des Einladungslinks und die `is_active`-Prüfung beim Login.
- **Profil bearbeiten** (Anzeigename, Bio, Lieblings-Dram, Region) → PROJ-10. PROJ-2
  liefert nur eine Platzhalter-Profilseite mit „Abmelden".
- **Echter Dashboard-Inhalt** (aktuelles Tasting, Glas-Fortschritt, Absprünge) → PROJ-8.
  PROJ-2 liefert „Start" als Platzhalter.
- **Inhalt der Tastings-/Historienliste** → PROJ-9. Platzhalter in PROJ-2.
- **Gastgeber-Bereich `/gastgeber/[eventId]` als Route** → PROJ-6. PROJ-2 liefert nur den
  `requireHost`-Helper samt Unit-Tests.
- **E-Mail-Bestätigung nach Anmeldung** — aus (`enable_confirmations = false`); eingeladene
  Nutzer sind bereits bestätigt.
- **Zwei-Faktor-Authentifizierung, Passkeys, Social-Login** (Google usw.) — nicht vorgesehen.
- **„Angemeldet bleiben"-Checkbox** — die Session bleibt immer erhalten und wird still
  erneuert.
- **App-eigenes Login-Throttling / Kontosperre nach X Fehlversuchen** — es gilt das
  eingebaute Rate-Limit von Supabase Auth.
- **Passwort-Stärke-Erzwingung** über die Supabase-Mindestlänge hinaus.
- **Rollen-Verwaltung** (wer wird Admin) — die Rolle steht in `profiles` (PROJ-1),
  gesetzt per Seed bzw. Admin-Route (PROJ-3). PROJ-2 liest sie nur.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anmeldung

- [ ] Angenommen ein aktives Konto existiert, wenn der Nutzer auf `/login` E-Mail und
      korrektes Passwort eingibt, dann wird er angemeldet und landet auf der Startseite
      (bzw. auf dem zuvor angeforderten Pfad).
- [ ] Angenommen der Nutzer gibt eine falsche E-Mail-/Passwort-Kombination ein, wenn er
      absendet, dann erscheint eine allgemeine Fehlermeldung („E-Mail oder Passwort stimmt
      nicht"), ohne zu verraten, ob die E-Mail existiert, und die eingegebene E-Mail bleibt
      im Feld stehen.
- [ ] Angenommen der Nutzer ist bereits angemeldet, wenn er `/login` oder eine andere
      Auth-Seite öffnet, dann wird er direkt zur Startseite weitergeleitet.
- [ ] Angenommen das Anmeldeformular wird abgeschickt, wenn die Verbindung fehlschlägt,
      dann erscheint eine Fehlermeldung und die Eingaben bleiben erhalten.
- [ ] Angenommen der Nutzer tippt sein Passwort, wenn er auf das Augensymbol tippt, dann
      wird das Passwort im Klartext angezeigt bzw. wieder verborgen.

### Deaktivierte Konten

- [ ] Angenommen ein Konto ist deaktiviert (`is_active = false`), wenn sich die Person mit
      korrektem Passwort anmeldet, dann wird die Session sofort beendet und es erscheint der
      Hinweis „Dein Zugang wurde deaktiviert. Wende dich an den Admin." — kein Zugriff auf
      geschützte Seiten.
- [ ] Angenommen ein deaktiviertes Konto hat noch eine gültige Session im Browser, wenn die
      Person eine geschützte Seite öffnet, dann wird sie abgemeldet und mit demselben
      Hinweis zur Login-Seite geleitet.

### Einladung annehmen / Passwort setzen

- [ ] Angenommen ein Teilnehmer öffnet einen gültigen Einladungslink, wenn die Seite
      `/passwort-setzen` lädt, dann kann er ein neues Passwort vergeben und ist danach
      angemeldet auf der Startseite.
- [ ] Angenommen ein Teilnehmer öffnet einen gültigen Passwort-Zurücksetzen-Link, wenn er
      auf `/passwort-setzen` ein neues Passwort vergibt, dann kann er sich anschließend
      damit anmelden.
- [ ] Angenommen der Link ist abgelaufen oder wurde bereits benutzt, wenn die Person
      `/passwort-setzen` öffnet, dann erscheint „Der Link ist ungültig oder abgelaufen" mit
      einem Verweis auf „Passwort vergessen".
- [ ] Angenommen der Nutzer gibt auf `/passwort-setzen` ein Passwort mit weniger als
      6 Zeichen ein, wenn er absendet, dann wird es abgelehnt mit einem Hinweis auf die
      Mindestlänge.
- [ ] Angenommen der Nutzer gibt Passwort und Wiederholung ein, wenn beide nicht
      übereinstimmen, dann wird das Speichern verhindert und die Abweichung angezeigt.

### Passwort vergessen

- [ ] Angenommen der Nutzer ist auf `/passwort-vergessen`, wenn er seine E-Mail einträgt
      und absendet, dann erscheint immer dieselbe Bestätigung („Falls ein Konto zu dieser
      Adresse existiert, ist eine E-Mail unterwegs") — unabhängig davon, ob die Adresse
      bekannt ist.
- [ ] Angenommen der Nutzer fordert mehrfach kurz hintereinander einen Link an, wenn das
      Rate-Limit von Supabase greift, dann erscheint ein verständlicher Hinweis, es später
      erneut zu versuchen.

### Abmelden

- [ ] Angenommen der Nutzer ist angemeldet, wenn er auf der Profilseite auf „Abmelden"
      tippt, dann wird die Session beendet und er landet auf `/login` mit dem Hinweis
      „Du wurdest abgemeldet".
- [ ] Angenommen der Nutzer hat sich abgemeldet, wenn er über den Zurück-Button des
      Browsers auf eine geschützte Seite geht, dann wird er zur Login-Seite geleitet.

### Geschützte Bereiche & Rollen

- [ ] Angenommen ein Nutzer ist nicht angemeldet, wenn er eine App-Seite außer den
      Auth-Seiten öffnet, dann wird er nach `/login` umgeleitet und der ursprüngliche Pfad
      als Ziel gemerkt.
- [ ] Angenommen ein angemeldeter Teilnehmer (Rolle `teilnehmer`), wenn er `/admin` oder
      einen Unterpfad davon öffnet, dann erhält er eine „Seite nicht gefunden"-Antwort
      (nicht „Zugriff verweigert") — der Bereich verrät seine Existenz nicht.
- [ ] Angenommen ein angemeldeter Admin, wenn er `/admin` öffnet, dann sieht er die in
      PROJ-2 als Platzhalter angelegte Admin-Startseite.
- [ ] Angenommen ein Nutzer ist nicht Gastgeber eines Events, wenn `requireHost(eventId)`
      für ihn ausgewertet wird, dann liefert es „nicht gefunden" statt Zugriff (per
      Unit-Test abgesichert; die Route folgt in PROJ-6).

### App-Shell & Navigation

- [ ] Angenommen der Nutzer ist angemeldet, wenn er die App am Handy (375 px) nutzt, dann
      sieht er unten eine Navigationsleiste mit Start, Tastings und Profil, die den unteren
      Safe-Area-Rand berücksichtigt.
- [ ] Angenommen der angemeldete Nutzer hat die Rolle `admin`, wenn die Bottom-Navigation
      gerendert wird, dann erscheint zusätzlich ein Eintrag „Admin"; für Teilnehmer
      erscheint er nicht.
- [ ] Angenommen der Nutzer ist auf einer bestimmten Seite, wenn die Bottom-Navigation
      gerendert wird, dann ist der zugehörige Eintrag als aktiv markiert.
- [ ] Angenommen die Session läuft während der Nutzung ab, wenn sie im Hintergrund erneuert
      werden kann, dann bleibt der Nutzer ohne sichtbare Unterbrechung angemeldet; wenn
      nicht, wird er beim nächsten Seitenwechsel zur Login-Seite geleitet.

### Grundlage

- [ ] Angenommen die Auth-Schicht ist gebaut, wenn `npm run build` und `npm run lint`
      laufen, dann kompiliert alles fehlerfrei und die Middleware ist aktiv.
- [ ] Angenommen ein E2E-Test meldet sich mit dem Seed-Admin und dem Seed-Testkonto an,
      wenn er die geschützten Platzhalterseiten aufruft, dann ist der Admin-Bereich nur für
      den Admin erreichbar und die übrigen Bereiche für beide.

## Edge Cases

- **Angemeldeter Auth-User ohne `profiles`-Zeile.** Sollte durch den `handle_new_user`-
  Trigger (PROJ-1) nicht vorkommen. Falls doch: `requireUser` behandelt „kein Profil" wie
  „deaktiviert" → Abmeldung + Hinweis.
- **Zwei Tabs offen, in einem abmelden.** Der andere Tab bemerkt es beim nächsten
  Seitenwechsel (Server-Prüfung) bzw. beim nächsten geschützten Request und leitet auf
  `/login`. Kein aktiver Live-Rauswurf nötig.
- **Einladungslink auf einem anderen Gerät geöffnet.** Funktioniert — der Link ist an den
  Token gebunden, nicht ans Gerät.
- **Passwort-Reset-Link für ein inzwischen deaktiviertes Konto.** Das Passwort lässt sich
  setzen, aber `requireUser` blockiert den anschließenden Zugang mit dem
  „deaktiviert"-Hinweis.
- **`NEXT_PUBLIC_SITE_URL` fehlt in Supabase → Redirect URLs.** Einladungs- und Reset-Links
  laufen ins Leere. Betriebsvoraussetzung (PRD), gehört in die `/deploy`-Checkliste.
- **Falsch gestellte Geräte-Uhr.** Der Token gilt vorzeitig als abgelaufen → Nutzer landet
  auf `/login`; nach Korrektur normal. Technisch nicht abfangbar, nur benannt.
- **Middleware und Layout-Guard gleichzeitig.** Die Middleware macht nur Session-Refresh +
  billiges Redirect für Unangemeldete; die Rollenprüfung passiert im Layout
  (`requireAdmin`) mit `notFound()`. Kein doppelter Redirect.
- **Direkter Aufruf eines Supabase-Signup-Endpunkts aus der Browserkonsole.** Wird von
  Supabase abgewiesen (Signup deaktiviert). Kein App-Code nötig, als Sicherheitsannahme
  dokumentiert.
- **Leeres Login-Formular abgeschickt.** Für jedes Pflichtfeld erscheint eine
  Validierungsmeldung; es wird kein Request gesendet.

## Technical Requirements

- **Sicherheit:** Session serverseitig über Cookies (`@supabase/ssr`). Immer
  `supabase.auth.getUser()` (verifiziert das JWT), nie `getSession()`. Dreischichtig:
  Middleware (Refresh + billiges Redirect), Layout-Guards (Rollen, `notFound()`), RLS
  (PROJ-1).
- **Sicherheit:** Keine Nutzer-Enumeration — Login und „Passwort vergessen" antworten immer
  gleich, egal ob die Adresse existiert.
- **Sicherheit:** Admin-Erkennung über die `profiles`-Rolle aus der Datenbank, nicht über
  einen JWT-Claim (konsistent mit PROJ-1).
- **Betrieb:** `NEXT_PUBLIC_SITE_URL` muss in Supabase unter *Auth → URL Configuration →
  Redirect URLs* eingetragen sein.
- **Mobile-first:** eine Spalte ab 375 px, Touch-Ziele ≥ 44 px, Bottom-Navigation mit
  `safe-area-inset-bottom`, `dvh` statt `vh`.
- **Abhängig von PROJ-1:** `profiles` (`role`, `is_active`), `src/lib/supabase/*`,
  `handle_new_user`-Trigger, Seed-Konten.

## Open Questions

- [ ] Soll die Profil-Platzhalterseite außer „Abmelden" schon etwas zeigen (z. B.
      Anzeigename und E-Mail read-only), oder wirklich nur den Button? *(Tendenz: Name +
      E-Mail read-only anzeigen; Bearbeiten kommt in PROJ-10.)*
- [ ] Einladungs- und Reset-E-Mails: Supabase-Standardvorlagen oder angepasster Text/
      Absender? *(Tendenz: für MVP Standardvorlagen, Feinschliff bei `/deploy`.)*
- [ ] Braucht es eine eigene „Session abgelaufen"-Zwischenmeldung, oder reicht der stille
      Sprung auf `/login`? *(Tendenz: stiller Sprung, optional ein dezenter Hinweis auf der
      Login-Seite.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Deaktivierte Konten werden beim Login abgewiesen (`requireUser` prüft `is_active`) | Ausgeschiedene Mitglieder dürfen keinen Zugriff behalten; konsistent mit PROJ-1, wo `is_admin()` bereits `is_active` verlangt. Klare Meldung statt stillem Leer-Dashboard | 2026-08-27 |
| Eine Seite `/passwort-setzen` für Einladung **und** Passwort-Reset | Beide Fälle enden gleich: Token gegen Session tauschen, neues Passwort vergeben, eingeloggt. Ein Codepfad, weniger Redundanz | 2026-08-27 |
| Bottom-Nav: Start · Tastings · Profil; „Admin" nur für Admins; kein „Gastgeber"-Tab | Feste Tabs für alle. Der Gastgeber-Status gilt pro Event und wird vom Dashboard aus erreicht — ein eigener Tab wäre für die meisten meist tot | 2026-08-27 |
| PROJ-2 baut minimale Platzhalterseiten für Start / Tastings / Profil / Admin | Nur so sind `requireUser`/`requireAdmin` end-to-end testbar; spätere Features ersetzen den Inhalt | 2026-08-27 |
| `requireHost` als Helper mit Unit-Tests; die Route `/gastgeber/[eventId]` erst in PROJ-6 | Ein sinnvoller E2E-Test für `requireHost` braucht echte Events mit Gastgeber (ab PROJ-4). Die reine Logik ist jetzt schon testbar | 2026-08-27 |
| Passwort-Mindestlänge = Supabase-Default (6), keine zusätzlichen Frontend-Regeln | Geschlossene Freundesrunde, Bedienung am Handy; Reibung vermeiden. Kann später angehoben werden | 2026-08-27 |
| Nach erneutem Login zurück zum ursprünglich angeforderten Pfad (`?redirect=`) | Läuft die Session mitten im Tasting-Abend ab, soll man die Navigation zum aktuellen Event nicht wiederholen müssen | 2026-08-27 |
| Rollen-Fehler führen zu `notFound()` statt `redirect()` | „Zugriff verweigert" bestätigt die Existenz des Bereichs; „nicht gefunden" verrät nichts. Aus dem Implementierungsplan übernommen | 2026-08-27 |
| Kein „Angemeldet bleiben", keine App-eigene Login-Sperre, kein 2FA / Social-Login | Kleiner, geschlossener Nutzerkreis; Supabase-Session-Refresh und das eingebaute Rate-Limit reichen für MVP | 2026-08-27 |
| Kein Signup-UI; die Signup-Deaktivierung bleibt eine Dashboard-Einstellung | PRD: geschlossener Kreis, der Admin lädt ein. Der Dashboard-Schalter ist bereits als `/deploy`-Aufgabe erfasst (PROJ-1, FINDING-1) | 2026-08-27 |

### Technical Decisions
_To be added by /architecture_

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
