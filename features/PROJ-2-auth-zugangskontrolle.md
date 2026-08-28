# PROJ-2: Auth & Zugangskontrolle

## Status: Approved
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

| Decision | Rationale | Date |
|----------|-----------|------|
| Drei Route-Gruppen `(auth)` / `(app)` / `(admin)`, je mit eigenem Layout und eigener Zugangsregel | Die Prüfung „wer darf hier rein" steht damit an genau einer Stelle pro Bereich statt in jeder einzelnen Seite. Neue Seiten in einem Bereich erben die Regel automatisch | 2026-08-27 |
| Die Middleware macht nur Session-Auffrischung + billiges Redirect für Unangemeldete — **keine** Rollenprüfung | Ein Rollen-Lookup ist ein Datenbank-Treffer. Ihn in jede Anfrage zu legen (auch für Bilder und Assets) wäre teuer. Die Rollenprüfung sitzt im Layout, das nur bei echten Seitenaufrufen läuft | 2026-08-27 |
| Fehlende Rolle → „Seite nicht gefunden" statt „Zugriff verweigert" | „Zugriff verweigert" bestätigt, dass es den Bereich gibt. „Nicht gefunden" verrät nichts über die Existenz von `/admin` | 2026-08-27 |
| Immer die verifizierende Nutzerabfrage (`getUser`), nie das bloße Auslesen des Session-Cookies (`getSession`) | Nur die verifizierende Variante fragt den Auth-Server und erkennt ein manipuliertes oder abgelaufenes Cookie. Das Cookie allein lässt sich fälschen | 2026-08-27 |
| Die Middleware gibt exakt das Antwortobjekt zurück, auf das der Supabase-Client seine aufgefrischten Cookies geschrieben hat | Ein neu erzeugtes Antwortobjekt würde die gerade erneuerte Session verlieren → der Nutzer fliegt nach ~1 h grundlos raus. Der PROJ-1-Helfer `updateSession` ist bereits so gebaut | 2026-08-27 |
| `requireUser()` prüft zusätzlich `is_active` (und behandelt „kein Profil" wie deaktiviert) | Deaktivierte Konten dürfen keinen Zugriff behalten; konsistent mit PROJ-1, wo `is_admin()` schon `is_active` verlangt | 2026-08-27 |
| Anmelden / Passwort setzen / Abmelden als **Server Actions**, nicht als eigene API-Routen | Serverseitige Aktion mit dem nutzergebundenen Supabase-Client, kein Service-Role-Key — konsistent mit der Hausregel aus PROJ-1. Einzige Ausnahme: der Link aus der E-Mail ruft eine URL auf, das ist zwangsläufig eine Route | 2026-08-27 |
| Einladungs-/Reset-Link → unsichtbare Verifizierungs-Route → dann `/passwort-setzen` | Der Link enthält einen Einmal-Token. Eine kleine Route tauscht ihn gegen eine Session und leitet dann auf die Passwort-Seite weiter. So braucht die Passwort-Seite selbst keine Token-Logik | 2026-08-27 |
| `?redirect=`-Parameter nur für **pfad-relative, interne** Ziele | Rückkehr zum gewünschten Pfad nach erneutem Login — aber ein absoluter oder fremder Link im Parameter wird verworfen (Schutz gegen Weiterleitung auf fremde Seiten) | 2026-08-27 |
| `requireHost(eventId)` als Funktion mit Unit-Tests, ohne eigene Route in PROJ-2 | Die Route `/gastgeber/[eventId]` braucht echte Events mit Gastgeber (ab PROJ-4). Die reine Prüf-Logik ist jetzt schon testbar; die Route folgt in PROJ-6 | 2026-08-27 |
| Bottom-Navigation als eigene kleine Komponente (Links + Icons), Admin-Eintrag serverseitig bedingt gerendert | shadcn/ui bringt keine fertige mobile Tab-Leiste. Der Admin-Eintrag wird nur erzeugt, wenn die Rolle stimmt — nicht bloß per CSS versteckt | 2026-08-27 |
| Ein Zod-Schema je Formular in `src/lib/schemas/`, geteilt von Browser-Validierung und Server Action | Eine Wahrheit für die Eingaberegeln; das Frontend kann nicht „lockerer" prüfen als der Server | 2026-08-27 |
| Keine neuen Pakete | `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react` (Icons) und `sonner` (Toasts) sind bereits im Projekt | 2026-08-27 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** PROJ-2 baut die Tür und den Flur — die Login-Seiten, die
> unsichtbare Wache, die bei jeder Anfrage prüft „bist du angemeldet?", und die
> App-Hülle mit der unteren Navigationsleiste. Die Räume dahinter sind vorerst leere
> Platzhalter; sie werden in späteren Features eingerichtet.

### 1. Seiten- und Bereichsstruktur

```
Unsichtbare Wache (läuft vor JEDER Anfrage)
└─ frischt die Anmelde-Session auf; schickt Unangemeldete auf /login und merkt
   sich den ursprünglich gewünschten Pfad. Prüft KEINE Rollen (zu teuer pro Anfrage).

Öffentlicher Bereich  (ohne Anmeldung erreichbar)
├─ /login                 E-Mail + Passwort, Auge-Symbol zum Passwort-Einblenden,
│                         Link „Passwort vergessen?" — KEIN „Registrieren"
├─ /passwort-vergessen    E-Mail eintragen → Reset-Link anfordern
│                         (Antwort immer gleich, egal ob die Adresse bekannt ist)
├─ /passwort-setzen       landet hier per Einladungs- ODER Reset-Link;
│                         neues Passwort + Wiederholung → danach angemeldet
├─ (Verifizierungs-Route) unsichtbar: tauscht den Link-Token gegen eine Session
└─ (Abmelde-Route)        unsichtbar: beendet die Session → /login

Angemeldeter Bereich  (gemeinsames Layout mit Zugangsregel „angemeldet + aktiv")
├─ App-Hülle
│  ├─ Kopfzeile (Seitentitel)
│  └─ Untere Navigationsleiste: Start · Tastings · Profil
│        └─ zusätzlicher Eintrag „Admin" — nur wenn die Rolle admin ist
├─ /              Start    — Platzhalter „Willkommen, {Name}"   → echter Inhalt: PROJ-8
├─ /tastings      Tastings — Platzhalter                         → PROJ-9
└─ /profil        Profil   — Platzhalter mit „Abmelden"          → PROJ-10

Admin-Bereich  (eigenes Layout mit zusätzlicher Regel „Rolle = admin", sonst
               „Seite nicht gefunden")
└─ /admin         Admin-Start — Platzhalter                      → PROJ-3 / PROJ-4

Wiederverwendbare Bausteine
├─ Zugangs-Helfer:  „nur Angemeldete" / „nur Admins" / „nur der Gastgeber dieses Events"
│                   (der letzte als Funktion + Test, seine Seite kommt in PROJ-6)
├─ App-Hülle, untere Navigation, Kopfzeile
└─ ein Eingaberegel-Satz (Zod-Schema) je Formular, geteilt von Browser und Server
```

### 2. Welche Daten PROJ-2 nutzt (keine neuen Tabellen)

PROJ-2 legt **kein** neues Datenmodell an. Es liest:

- **aus der Anmeldeverwaltung von Supabase:** die E-Mail und die Session des Nutzers
  (Passwörter verwaltet Supabase, die App sieht sie nie);
- **aus der `profiles`-Tabelle (PROJ-1):** Anzeigename, Rolle (`admin` oder
  `teilnehmer`) und den Aktiv-Status (`is_active`).

Geschrieben wird nur, was die Anmeldeverwaltung selbst tut, wenn jemand auf
`/passwort-setzen` ein Passwort vergibt.

### 3. Die drei Sicherheitsschichten (Wiederholung aus dem Plan, hier eingeordnet)

| Schicht | Wo | Aufgabe | Was sie NICHT tut |
|---------|-----|---------|-------------------|
| **1 · Wache** | läuft vor jeder Anfrage | Session auffrischen; Unangemeldete auf `/login` schicken, Zielpfad merken | keine Rollenprüfung (zu teuer pro Anfrage) |
| **2 · Bereichs-Layout** | einmal je Bereich (`app`, `admin`) | „angemeldet + aktiv?" bzw. „Rolle = admin?"; sonst abmelden bzw. „nicht gefunden" | keine zeilengenaue Datenprüfung |
| **3 · RLS** | Datenbank (PROJ-1) | welche Zeilen der Nutzer sehen/ändern darf | nichts über Seiten/Navigation |

Kein doppeltes Umleiten: Schicht 1 kümmert sich nur um „angemeldet ja/nein", Schicht 2
nur um Rollen. Ein Nicht-Admin, der `/admin` eintippt, ist angemeldet — also winkt
Schicht 1 durch, und Schicht 2 antwortet „Seite nicht gefunden".

### 4. Der Weg eines eingeladenen Teilnehmers

1. Admin löst die Einladung aus (PROJ-3) → Supabase schickt eine E-Mail mit einem Link.
2. Der Link zeigt auf die App (Adresse aus `NEXT_PUBLIC_SITE_URL`) und trägt einen
   Einmal-Token.
3. Eine **unsichtbare Verifizierungs-Route** prüft den Token und startet eine Session.
4. Weiterleitung auf `/passwort-setzen`: neues Passwort + Wiederholung.
5. Danach ist die Person angemeldet und landet auf der Startseite.

Der Passwort-Zurücksetzen-Weg ist derselbe — nur der Anlass des Links unterscheidet
sich. Deshalb genügt **eine** Seite `/passwort-setzen`.

Ist der Link abgelaufen oder schon benutzt, zeigt die Seite „Der Link ist ungültig oder
abgelaufen" mit Verweis auf „Passwort vergessen".

### 5. Deaktivierte Konten

Der Zugangs-Helfer „nur Angemeldete" prüft **zusätzlich** den Aktiv-Status. Eine
deaktivierte Person kann sich zwar bei Supabase noch authentifizieren, wird aber sofort
wieder abgemeldet und sieht auf `/login`: „Dein Zugang wurde deaktiviert. Wende dich an
den Admin." Derselbe Mechanismus greift, wenn eine noch offene Session einer inzwischen
deaktivierten Person eine geschützte Seite öffnet.

### 6. Untere Navigationsleiste

- Feste Einträge für alle: **Start · Tastings · Profil**.
- **Admin** erscheint nur, wenn die Rolle stimmt — und wird serverseitig gar nicht erst
  erzeugt, nicht bloß per Gestaltung versteckt.
- Kein „Gastgeber"-Eintrag: Gastgeber ist man pro Event, das erreicht man vom Dashboard.
- Berücksichtigt den unteren Sicherheitsrand des Geräts (Home-Indikator), Touch-Ziele
  mindestens 44 px, aktiver Eintrag hervorgehoben.

Aussehen und Farben kommen aus [docs/design-system.md](../docs/design-system.md)
(dark-first, Bernstein-Akzent) — Sache von `/frontend`.

### 7. Wo geschrieben wird

| Aktion | Mechanismus | Warum |
|--------|-------------|-------|
| Anmelden | Server Action, nutzergebundener Client | kein Service-Role-Key, Hausregel PROJ-1 |
| Passwort setzen (Einladung/Reset) | Server Action | dito |
| Abmelden | Server Action / kleine Route | dito |
| Link-Token verifizieren | unsichtbare Route | der Link ruft zwangsläufig eine URL auf |

### 8. Neue Pakete

**Keine.** `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`,
`lucide-react` (Icons) und `sonner` (kurze Hinweis-Einblendungen) sind bereits im
Projekt. `sonner` wird einmal zentral eingebunden, damit Meldungen wie „Du wurdest
abgemeldet" überall erscheinen können.

### 9. Betriebsvoraussetzung (gehört in die Abnahme / `/deploy`)

`NEXT_PUBLIC_SITE_URL` muss lokal in `.env.local` **und** in Supabase unter *Auth → URL
Configuration → Redirect URLs* stehen — sonst laufen die Einladungs- und Reset-Links
ins Leere.

### 10. Wie der Erfolg geprüft wird

- **Unit-Tests** für die Zugangs-Helfer (angemeldet? aktiv? Admin? Gastgeber dieses
  Events?) — inklusive `requireHost`, obwohl dessen Seite erst in PROJ-6 entsteht.
- **E2E-Tests** (Chromium + Mobile Safari): Anmeldung mit Seed-Admin und Seed-Testkonto,
  Durchklicken der Platzhalterseiten, Nachweis dass `/admin` nur für den Admin
  erreichbar ist und für den Teilnehmer „nicht gefunden" liefert; Abmelden; Zugriff auf
  eine geschützte Seite ohne Anmeldung landet auf `/login` mit gemerktem Zielpfad.
- `npm run build` und `npm run lint` sauber; die Wache (Middleware) ist aktiv.

## Implementation Notes (Frontend)

**Stand:** UI komplett gebaut und rendernd. Die serverseitigen Teile (Wache,
Server Actions, Verifizierungs-/Abmelde-Route, Zugangs-Helfer) sind ebenfalls
enthalten und funktionsfähig — Auth lässt sich nicht sinnvoll in „nur UI" und
„nur Server" trennen. `/backend` konzentriert sich auf Härtung + Integrationstests
(siehe unten).

### Was gebaut wurde

**Design-Grundlage**
- `src/app/globals.css` — Token-Werte auf das Whisky-Farbschema aus
  [docs/design-system.md](../docs/design-system.md) umgestellt (dark-first,
  Bernstein-`--primary`), plus `--gold/--silver/--bronze/--success` und ein
  16-px-Minimum für Eingabefelder (iOS-Zoom-Schutz).
- `tailwind.config.ts` — `font-sans`/`font-display` (Inter / Fraunces via
  `next/font`) und die semantischen Farben registriert.
- `src/app/layout.tsx` — Fonts, `lang="de"`, `ThemeProvider` (fest dark),
  `<Toaster>` (sonner) zentral. `src/components/theme-provider.tsx`.

**Wache** — `src/proxy.ts` (Next 16 hat `middleware` → `proxy` umbenannt).
Nutzt `updateSession` aus PROJ-1. Unangemeldete → `/login?redirect=<pfad>`;
Angemeldete weg von `/login` und `/passwort-vergessen`. Keine Rollenprüfung.
`matcher` schließt Assets aus.

**Zugangs-Helfer**
- `src/lib/auth-rules.ts` — reine Prädikate `isActiveMember` / `isAdmin` /
  `isEventHost` / `canAccessHostArea` (kein Next-Import → isoliert testbar).
- `src/lib/auth.ts` — `getSessionContext` / `requireUser` (prüft `is_active`,
  bei deaktiviert → `/auth/abmelden?reason=deactivated`) / `requireAdmin`
  (→ `notFound()`) / `requireHost(eventId)` (→ `notFound()`; Route erst PROJ-6).
- `src/lib/auth-rules.test.ts` — 8 Unit-Tests, decken u. a. die
  `requireHost`-Entscheidungslogik (Gastgeber vs. fremd vs. Admin vs.
  deaktivierter Admin) ab.

**Server Actions** — `src/lib/actions/auth.ts`: `signInAction` (inkl.
`is_active`-Prüfung + `signOut` bei deaktiviert), `requestPasswordResetAction`
(immer gleiche Antwort außer bei 429), `updatePasswordAction`, `signOutAction`.
`src/lib/safe-redirect.ts` — `safeInternalPath` (nur pfad-relative Ziele,
Open-Redirect-Schutz), genutzt von Wache, Actions und Confirm-Route.

**Routen** — `src/app/auth/confirm/route.ts` (Token → Session via `verifyOtp`,
dann Weiterleitung; Fehler → `/passwort-setzen?fehler=link`),
`src/app/auth/abmelden/route.ts` (`signOut` → `/login?reason=…`).

**Seiten & Shell**
- `(auth)/` — `layout.tsx` (zentrierte Karte), `/login` (liest `reason` +
  `redirect`), `/passwort-vergessen`, `/passwort-setzen` (zeigt „Link ungültig",
  wenn keine Session).
- `(app)/` — `layout.tsx` (`requireUser` + `AppShell`), `/` (Start-Platzhalter,
  Begrüßung), `/tastings`, `/profil` (Name + E-Mail + „Abmelden"-Formular).
- `(admin)/` — `layout.tsx` (`requireAdmin` + `AppShell`), `/admin`-Platzhalter.
- `src/app/not-found.tsx` — deutsche 404.
- Komponenten: `src/components/auth/{auth-card,password-input,login-form,
  forgot-password-form,set-password-form}.tsx`,
  `src/components/layout/{app-shell,bottom-nav,page-header}.tsx`.
- Formulare: `react-hook-form` + `zodResolver` gegen `src/lib/schemas/auth.ts`,
  Fehler als `Alert` + `toast`. Passwort-Feld mit Auge-Umschalter.
- `src/app/page.tsx` (Starter-Kit-Landing) gelöscht — kollidierte mit `(app)/page.tsx`.

### Verifikation in dieser Session
- `npm run build` ✅  ·  `npm run lint` ✅  ·  `npm test` ✅ (15: 7 errors + 8 auth-rules)
- Dev-Server-Smoke-Test: `/login`, `/passwort-vergessen`, `/passwort-setzen`
  rendern (200); `/` und `/admin` ohne Anmeldung → `307 → /login?redirect=%2F…`;
  keine Runtime-Fehler im Log.
- **Nicht** in dieser Session: der angemeldete Durchstich (Login → Shell →
  Bottom-Nav → Admin-Gating → Abmelden). Das schreibt `/qa` als E2E-Suite.

## Implementation Notes (Backend)

**Kein neues Schema, keine neuen `/api`-Routen** — PROJ-2 ist Auth-Glue. Der
`/backend`-Durchlauf war Härtung + Verifikation gegen die echte Supabase-Instanz.

### Änderungen

- **`src/app/auth/confirm/route.ts`** unterstützt jetzt **beide** Link-Formen:
  `?code=…` → `exchangeCodeForSession` (PKCE — `@supabase/ssr` nutzt per Default
  `flowType: 'pkce'`, verifiziert im `node_modules`); `?token_hash=…&type=…` →
  `verifyOtp`. Fehler → `/passwort-setzen?fehler=link`. Damit funktionieren die
  Supabase-Default-Templates out of the box; für robustere Geräte-Wechsel siehe
  Betrieb unten.
- **`src/lib/safe-redirect.test.ts`** — 5 Unit-Tests für den Open-Redirect-Guard
  (absolute URLs, `//`, `/\`, Steuerzeichen/Header-Injection, Fallback).

### Verifikation gegen die Live-Instanz (Playwright-Smoke, wegwerf)

Angemeldeter Durchstich mit den Seed-Konten (`hermann.hoppen@gmail.com` = admin,
`test.teilnehmer@example.com` = teilnehmer, PW `tasting-dev-2026`):

| Prüfung | Ergebnis |
|---|---|
| unauth `/profil` → `/login?redirect=%2Fprofil` | ✅ |
| Teilnehmer-Login → `/`, Begrüßung, Bottom-Nav Start/Tastings/Profil | ✅ |
| Teilnehmer: **kein** Admin-Eintrag in der Nav | ✅ |
| Teilnehmer öffnet `/admin` → „Seite nicht gefunden" | ✅ |
| Profil zeigt E-Mail; „Abmelden" → `/login?reason=signed-out` + Hinweis | ✅ |
| Admin-Login → `/`, Bottom-Nav **mit** Admin-Eintrag | ✅ |
| Admin öffnet `/admin` → Seite rendert (HTTP 200, `<h1>Admin</h1>`) | ✅ |
| Angemeldet + `/login` → `/` | ✅ |

`profiles` der Seed-Konten geprüft: Rollen/`is_active` korrekt
(`admin`/`teilnehmer`, beide aktiv).

### Betrieb / `/deploy`-Checkliste

- **`NEXT_PUBLIC_SITE_URL`** ist in `.env.local` gesetzt; muss zusätzlich in
  Supabase unter *Auth → URL Configuration → Redirect URLs* stehen (mit
  `/auth/confirm`). Sonst laufen Einladungs-/Reset-Links ins Leere.
- **Optionale Härtung:** E-Mail-Templates (Invite + Recovery) im Supabase-
  Dashboard auf `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next=/passwort-setzen`
  umstellen. Dann greift der `token_hash`-Pfad der Confirm-Route und die Links
  funktionieren auch geräteübergreifend (PKCE braucht denselben Browser).
- **Signup OFF / anon OFF** im Dashboard (schon aus PROJ-1 FINDING-1 offen).

### Offen für `/qa`
- E2E-Suite `tests/PROJ-2-auth.spec.ts` (Chromium + Mobile Safari), ein `test()`
  je Akzeptanzkriterium. Hinweis aus dem Smoke-Lauf: **mobiles Viewport** und
  `page.waitForURL(...)` statt `waitForLoadState('networkidle')` verwenden — mit
  Desktop-Viewport + networkidle war der Klick auf den fixierten Bottom-Nav-Link
  flaky (App selbst korrekt).
- Deaktivierter Nutzer mit offener Session: `requireUser` → `/auth/abmelden` →
  `/login?reason=deactivated` gegen ein testweise deaktiviertes Konto prüfen.
- Passwort-Reset-Link end-to-end (echte E-Mail nötig oder Supabase-Inbucket).

## QA Test Results

**Tested:** 2026-08-27
**Tester:** QA Engineer (AI) + Red-Team
**Setup:** Playwright chromium + webkit installiert. E2E laufen gegen einen
Produktions-Build (`next build && next start`) — der Dev-Server war unter
WebKit/Mobile-Safari zu langsam für die Auth-Round-Trips.

### Automatisierte Tests

| Suite | Ergebnis |
|-------|----------|
| `npm run build` | ✅ |
| `npm run lint` | ✅ (Ausschlüsse ergänzt: `test-results/`, `playwright-report/`) |
| `npm test` (Vitest) | ✅ **20/20** — `errors` (7), `auth-rules` (8), `safe-redirect` (5) |
| `npm run test:e2e` (`tests/PROJ-2-auth.spec.ts`) | ✅ **48/48** — 24 Tests × Chromium + Mobile Safari (iPhone 13) |

### Akzeptanzkriterien

| Gruppe | Kriterien | Status |
|--------|-----------|--------|
| **Anmeldung** | aktives Konto → Startseite; gemerkter Zielpfad; falsche Kombination → allgemeiner Fehler + E-Mail bleibt; bereits angemeldet → Startseite; Passwort ein-/ausblenden; leeres Formular → Validierung | ✅ E2E |
| **Deaktivierte Konten** | Login abgewiesen + Session beendet + Hinweis; offene Session + nachträgliche Deaktivierung → beim Seitenaufruf raus | ✅ E2E (Wegwerf-Konten via Service-Client) |
| **Einladung / Passwort setzen** | gültiger Einladungslink → Passwort → angemeldet; gültiger Reset-Link → neues Passwort → Login damit; ungültiger Link → Hinweis + Verweis; < 6 Zeichen abgelehnt; Passwörter müssen übereinstimmen | ✅ E2E (Links via `generateLink`) |
| **Passwort vergessen** | unbekannte Adresse → gleiche Bestätigung (keine Enumeration) | ✅ E2E |
| **Passwort vergessen** | Rate-Limit-Hinweis bei zu vielen Anfragen | ⚠️ Code-Review (Handler prüft 429 / `over_email_send_rate_limit`); nicht E2E — schwer reproduzierbar auslösbar |
| **Abmelden** | „Abmelden" → `/login?reason=signed-out` + Hinweis; danach Zurück-Button auf geschützte Seite → `/login` | ✅ E2E |
| **Geschützte Bereiche & Rollen** | unauth → `/login` mit `?redirect=`; Teilnehmer `/admin` → „Seite nicht gefunden"; Admin `/admin` → Admin-Seite; `requireHost` | ✅ E2E + `requireHost` per Unit-Test (`auth-rules`) |
| **App-Shell & Navigation** | Bottom-Nav Start/Tastings/Profil; „Admin" nur für Admins; aktiver Eintrag markiert; fehlende Session beim Seitenwechsel → `/login` | ✅ E2E |
| **App-Shell & Navigation** | Session-Ablauf mit erfolgreichem Hintergrund-Refresh → bleibt angemeldet | ⚠️ nur die Kehrseite getestet (Cookies gelöscht → `/login`). Der Refresh selbst ist der `@supabase/ssr`-Standardmechanismus aus PROJ-1 |
| **Grundlage** | `npm run build`/`lint` sauber, Wache aktiv; E2E mit Seed-Admin + Seed-Testkonto | ✅ |

### Security-Audit (Red-Team)

| Angriff | Abwehr | Ergebnis |
|---------|--------|----------|
| Unangemeldet auf geschützte Seite | Wache (Redirect) **+** Layout-Guard `requireUser` (`getUser()` verifiziert das JWT, kein `getSession()`) | ✅ |
| Gefälschtes Session-Cookie | `getUser()` fragt den Auth-Server → null → Redirect | ✅ |
| Teilnehmer → Admin-Bereich | `requireAdmin` → `notFound()` (kein „Zugriff verweigert" → keine Existenz-Bestätigung); Admin-Nav-Eintrag serverseitig gar nicht gerendert; Rolle nicht selbst änderbar (PROJ-1 Spalten-GRANT) | ✅ E2E |
| Deaktiviertes Konto behält Zugriff | `requireUser` liest `is_active` bei jeder Anfrage frisch; `signInAction` meldet zusätzlich sofort ab | ✅ E2E |
| Open Redirect über `?redirect=` | `safeInternalPath` — nur pfad-relative interne Ziele, keine `//`, `/\`, Steuerzeichen (5 Unit-Tests) | ✅ |
| Nutzer-Enumeration (Login / Passwort vergessen) | identische Meldung unabhängig davon, ob die Adresse existiert | ✅ (Timing-Seitenkanal: siehe FINDING-2) |
| XSS über Anzeigename / URL-Parameter | React-Escaping; `reason` nur über feste Map; `redirect` nie gerendert; kein `dangerouslySetInnerHTML` | ✅ |
| Service-Role-Key im Client-Bundle | `admin.ts` in PROJ-2 nirgends importiert; nur der Test-Helfer nutzt einen Service-Client (nicht gebündelt) | ✅ |
| Login-Brute-Force | eingebautes Supabase-Rate-Limit (App-Throttling bewusst out of scope) | ✅ (akzeptiert) |

### Bugs Found

#### BUG-1: Abmelden über progressives Server-Action-Formular → „unexpected response"
- **Severity:** Medium → **behoben** (`1e028f0`)
- **Repro:** `/profil` → „Abmelden" (`<form action={signOutAction}>`). Sporadisch
  (~1 von 3) Runtime-Error „An unexpected response was received from the server",
  keine Abmeldung.
- **Fix:** Abmelden läuft jetzt über ein einfaches `<form method="post"
  action="/auth/abmelden">` auf den Route-Handler (POST ergänzt). `signOutAction`
  entfernt. 48/48 E2E danach stabil grün, kein Flake mehr.

### Findings (Low, dokumentiert, kein Handlungsbedarf für PROJ-2)

- **FINDING-1:** `GET`/`POST /auth/abmelden` ohne CSRF-/Origin-Prüfung → Logout-CSRF
  (ein fremder `<img src=…/auth/abmelden>` meldet den Nutzer ab). Nur Belästigung,
  kein Datenverlust. Für den geschlossenen Freundeskreis akzeptiert; ggf. bei
  `/deploy` eine Origin-Prüfung ergänzen.
- **FINDING-2:** Login-Timing minimal unterschiedlich für existierende vs. nicht
  existierende E-Mail (echter Passwort-Check + Profil-Query vs. nur Passwort-Check).
  Inhärent an Supabase, für diesen Nutzerkreis vernachlässigbar.
- **FINDING-3:** Ein bereits angemeldeter Nutzer kann `/passwort-setzen` aufrufen
  und sein **eigenes** Passwort ändern (die Wache leitet nur von `/login` und
  `/passwort-vergessen` weg). Keine Schwachstelle, kleine Abweichung vom
  Spec-Wortlaut („oder eine andere Auth-Seite").
- **FINDING-4:** Rate-Limit-Meldung bei „Passwort vergessen" nur per Code-Review
  abgedeckt, nicht E2E.
- **FINDING-5:** Der erfolgreiche stille Session-Refresh ist nicht automatisiert
  geprüft (nur die Kehrseite: Cookies weg → `/login`).

### Regression
- Keine PROJ-1-Dateien angefasst; kein Schema-Change. `npm test` (20) grün. Die
  RLS-Suite (`npm run test:rls`) ist DB-gebunden und war nicht Teil dieses Laufs
  (unverändert seit PROJ-1: 39/39).

### Betrieb / `/deploy`-Gate (nicht blockierend für „Approved")
- `NEXT_PUBLIC_SITE_URL` in Supabase → *Auth → URL Configuration → Redirect URLs*
  eintragen (mit `/auth/confirm`), sonst tote Einladungs-/Reset-Links.
- Optional: E-Mail-Templates auf `{{ .TokenHash }}` umstellen (geräteübergreifende
  Links; siehe Backend-Notes).
- Signup OFF / anon OFF im Dashboard (schon aus PROJ-1 FINDING-1 offen).

### Summary
- **Acceptance Criteria:** alle automatisierbaren ✅ (E2E 48/48); 3 Teilaspekte
  per Code-Review statt E2E (Rate-Limit-Meldung, stiller Refresh) — dokumentiert.
- **Bugs:** 1 Medium — **behoben**. Keine Critical/High.
- **Findings:** 5 × Low, dokumentiert/akzeptiert.
- **Security:** Red-Team bestanden. Dreischicht-Absicherung greift, keine
  Rollen-/Redirect-/Enumeration-Lücke.
- **Production Ready:** ✅ **JA** — keine offenen Critical/High. Die drei
  Betriebspunkte oben gehören in `/deploy`.

## Deployment
_To be added by /deploy_
