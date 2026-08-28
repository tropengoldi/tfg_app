# PROJ-3: Admin – Teilnehmerverwaltung

## Status: Architected
**Created:** 2026-08-27
**Last Updated:** 2026-08-27

## Dependencies
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — der `requireAdmin`-Guard und der
  `(admin)`-Bereich, die Landeseite `/passwort-setzen` + `/auth/confirm` für den
  Einladungslink, die App-Shell mit „Admin"-Tab.
- **Baut auf PROJ-1** — `profiles` (`role`, `is_active`), `is_admin()`, der
  Service-Zugang `src/lib/supabase/admin.ts`, der `handle_new_user`-Trigger,
  `tasting_events.host_id` (für die Gastgeber-Prüfung beim Deaktivieren).

## Kontext

Die Runde ist ein geschlossener Kreis: Es gibt keine öffentliche Registrierung. Der
Admin lädt jede Person per E-Mail ein, sieht auf einer Seite, wer schon dabei ist,
und legt ausgeschiedene Mitglieder still, ohne ihre Historie zu zerstören.

Zusätzlich kann der Admin eine Vertretung bestimmen: Er darf andere aktive Teilnehmer
zu Admins machen und ihnen die Rechte wieder entziehen — mit der Sicherung, dass immer
mindestens ein aktiver Admin übrig bleibt.

Die eigentliche Seite, auf der der Einladungslink landet (`/passwort-setzen`), sowie
die Anmeldesperre für deaktivierte Konten stammen aus PROJ-2. PROJ-3 liefert die
Verwaltungsoberfläche und die Aktionen dahinter.

## User Stories

- Als **Admin** möchte ich einen neuen Teilnehmer per E-Mail einladen, damit er sich
  ein Passwort setzen und mitmachen kann.
- Als **Admin** möchte ich alle Teilnehmer mit ihrem Status auf einen Blick sehen,
  damit ich weiß, wer schon dabei ist und wer die Einladung noch nicht angenommen hat.
- Als **Admin** möchte ich ein ausgeschiedenes Mitglied deaktivieren, damit es sich
  nicht mehr anmelden kann, ohne dass seine bisherigen Bewertungen verloren gehen.
- Als **Admin** möchte ich ein versehentlich deaktiviertes oder zurückgekehrtes
  Mitglied wieder aktivieren.
- Als **Admin** möchte ich eine Vertretung zum Admin machen (und Rechte wieder
  entziehen), damit die Organisation nicht an einer Person hängt.
- Als **Admin** möchte ich davor bewahrt werden, mich selbst oder den letzten Admin
  aus dem Admin-Bereich auszusperren.

## Out of Scope

- **Profilfelder außer dem bei der Einladung gesetzten Namen bearbeiten** → PROJ-10
  (der Teilnehmer pflegt Anzeigename, Bio, Lieblings-Dram usw. selbst).
- **Anzeigenamen durch den Admin ändern** — bewusst nicht. Der Name wird nur bei der
  Einladung gesetzt; danach gehört er dem Teilnehmer.
- **Teilnehmer endgültig löschen** — nie. Nur deaktivieren (Datenintegrität, PROJ-1
  Decision Log: Bewertungen/Whiskies eines Abends dürfen nicht rückwirkend verschwinden).
- **„Einladung erneut senden"** — nicht im MVP. Wer die Einladung verpasst oder einen
  abgelaufenen Link hat, nutzt „Passwort vergessen" auf der Login-Seite (funktioniert
  auch für noch nie angemeldete Konten).
- **Massen-Einladung / CSV-Import** — nicht vorgesehen (6–10 Personen).
- **E-Mail-Adresse eines Teilnehmers ändern** — nicht vorgesehen; dafür eine neue
  Einladung.
- **Suchfeld, Filter, Paginierung** in der Liste — bei höchstens ~15 Zeilen unnötig.
- **Die Landeseite des Einladungslinks (`/passwort-setzen`, `/auth/confirm`)** → PROJ-2.
- **Rollen jenseits von Admin/Teilnehmer** — es gibt nur diese zwei (PROJ-1).
- **Rate-Limiting der Admin-Aktionen** — eine Person, geringe Frequenz.
- **Audit-Log / Historie der Admin-Aktionen** — nicht im MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einladen

- [ ] Angenommen der Admin ist im Bereich „Teilnehmer", wenn er eine gültige, noch
      nicht vergebene E-Mail einträgt (Anzeigename optional), bestätigt und die Aktion
      abschließt, dann wird ein Konto angelegt, eine Einladungs-E-Mail verschickt und
      der Teilnehmer erscheint in der Liste mit dem Status „Eingeladen".
- [ ] Angenommen der Admin lädt jemanden ohne Anzeigenamen ein, wenn die Einladung
      abgeschickt wird, dann steht als Anzeigename zunächst der Teil der E-Mail vor
      dem @.
- [ ] Angenommen die eingegebene E-Mail gehört bereits zu einem Teilnehmer (aktiv,
      deaktiviert oder eingeladen), wenn der Admin einlädt, dann wird die Einladung
      abgelehnt mit dem Hinweis, dass diese Person schon in der Runde ist.
- [ ] Angenommen der Admin trägt eine ungültige E-Mail-Adresse ein, wenn er absendet,
      dann wird eine Validierungsmeldung angezeigt und keine Einladung verschickt.
- [ ] Angenommen die Einladungs-E-Mail kann nicht zugestellt werden, wenn die Aktion
      trotzdem ein Konto angelegt hat, dann erhält der Admin eine Fehlermeldung mit dem
      Hinweis, dass die Person sich alternativ über „Passwort vergessen" anmelden kann.
- [ ] Angenommen ein eingeladener Teilnehmer setzt über den Link sein Passwort (PROJ-2)
      und meldet sich das erste Mal an, wenn der Admin die Liste danach öffnet, dann
      steht die Person auf „Aktiv" statt „Eingeladen".

### Teilnehmerliste

- [ ] Angenommen es gibt Teilnehmer in verschiedenen Zuständen, wenn der Admin die
      Liste öffnet, dann sieht er zu jedem Eintrag Anzeigename, E-Mail, einen
      Status-Badge (Eingeladen / Aktiv / Deaktiviert) und eine Kennzeichnung für Admins.
- [ ] Angenommen der Admin öffnet die Liste, wenn sie geladen wird, dann sind die
      Teilnehmer alphabetisch nach Anzeigename sortiert.
- [ ] Angenommen der Admin selbst steht in der Liste, wenn er seine eigene Zeile
      betrachtet, dann sind „deaktivieren" und „Admin-Rechte entziehen" für ihn nicht
      auslösbar.
- [ ] Angenommen die Liste kann nicht geladen werden, wenn der Admin die Seite öffnet,
      dann sieht er eine Fehlermeldung mit erneutem Ladeversuch, keine leere Seite.

### Deaktivieren / Reaktivieren

- [ ] Angenommen ein aktiver Teilnehmer ist ausgewählt, wenn der Admin „deaktivieren"
      bestätigt, dann kann sich die Person nicht mehr anmelden, ihr Status wechselt auf
      „Deaktiviert", und ihre bisherigen Bewertungen und mitgebrachten Whiskies bleiben
      erhalten.
- [ ] Angenommen ein deaktivierter Teilnehmer hat noch eine offene Sitzung, wenn er
      nach der Deaktivierung eine geschützte Seite öffnet, dann wird er abgemeldet
      (Verhalten aus PROJ-2).
- [ ] Angenommen der Teilnehmer ist Gastgeber eines Events, das noch in Vorbereitung
      ist oder gerade läuft, wenn der Admin ihn deaktivieren will, dann wird die Aktion
      abgelehnt mit dem Hinweis auf das betroffene Event.
- [ ] Angenommen der Admin will sich selbst deaktivieren, wenn er die Aktion auslöst,
      dann wird sie abgelehnt.
- [ ] Angenommen ein deaktivierter Teilnehmer ist ausgewählt, wenn der Admin
      „reaktivieren" bestätigt, dann kann sich die Person wieder anmelden und ihr
      Status wechselt auf „Aktiv" (bzw. „Eingeladen", falls sie sich nie angemeldet
      hatte).

### Admin-Rechte

- [ ] Angenommen ein aktiver Teilnehmer ohne Admin-Rechte ist ausgewählt, wenn der
      Admin „zum Admin machen" bestätigt, dann erhält die Person Zugriff auf den
      Admin-Bereich und wird in der Liste als Admin gekennzeichnet.
- [ ] Angenommen ein Teilnehmer ist „Eingeladen" oder „Deaktiviert", wenn der Admin
      dessen Zeile betrachtet, dann ist „zum Admin machen" nicht verfügbar.
- [ ] Angenommen es gibt mehrere aktive Admins, wenn der Admin einem anderen Admin die
      Rechte entzieht (bestätigt), dann verliert diese Person den Zugriff auf den
      Admin-Bereich.
- [ ] Angenommen eine Person ist der einzige verbleibende aktive Admin, wenn jemand ihr
      die Admin-Rechte entziehen oder sie deaktivieren will, dann wird die Aktion
      abgelehnt mit dem Hinweis, zuerst jemand anderen zum Admin zu machen.
- [ ] Angenommen der Admin will sich selbst die Admin-Rechte entziehen, wenn es keinen
      weiteren aktiven Admin gibt, dann wird die Aktion abgelehnt; gibt es einen
      weiteren, dann gelingt sie.

### Sicherheit

- [ ] Angenommen ein Teilnehmer ohne Admin-Rechte ruft die Teilnehmerverwaltung direkt
      auf, wenn die Seite geladen wird, dann erhält er „Seite nicht gefunden"
      (Verhalten aus PROJ-2).
- [ ] Angenommen ein Nicht-Admin schickt eine Einladungs-, Deaktivierungs- oder
      Rollen-Anfrage direkt an den Server (unter Umgehung der Oberfläche), wenn die
      Anfrage verarbeitet wird, dann wird sie abgelehnt, weil die Admin-Rolle
      serverseitig geprüft wird.
- [ ] Angenommen eine ändernde Aktion, wenn der Admin sie in der Oberfläche auslöst,
      dann erscheint zuerst ein Bestätigungsdialog mit einer klaren Beschreibung der
      Folge.

### Zustände (nach design-system)

- [ ] Angenommen eine Aktion läuft (Einladen / Deaktivieren / …), wenn der Admin
      wartet, dann ist die Schaltfläche im Ladezustand und ein erneuter Klick nicht
      möglich.
- [ ] Angenommen eine Aktion schlägt fehl (Netz / Server), wenn der Admin sie ausgelöst
      hat, dann erscheint eine konkrete deutsche Fehlermeldung und die Liste bleibt
      unverändert.
- [ ] Angenommen eine Aktion gelingt, wenn sie abgeschlossen ist, dann aktualisiert
      sich die Liste sofort und eine kurze Bestätigung erscheint.

## Edge Cases

- **Zwei Admins gleichzeitig aktiv.** Beide versuchen, sich gegenseitig oder dieselbe
  dritte Person zu ändern. Erwartung: Die „mindestens ein aktiver Admin"-Prüfung
  passiert serverseitig beim Ausführen; die zweite Aktion sieht den bereits geänderten
  Stand und wird ggf. abgelehnt.
- **Einladung an eine E-Mail, die früher deaktiviert wurde.** Erwartung: abgelehnt
  („schon in der Runde") — der Admin soll stattdessen reaktivieren.
- **Deaktivieren, während die Person gerade bewertet.** Erwartung: Die laufende Aktion
  der Person kann noch abschließen; der nächste Seitenaufruf meldet sie ab (PROJ-2).
  Kein Datenverlust.
- **Gastgeber eines abgeschlossenen Events deaktivieren.** Erwartung: erlaubt — nur
  nicht abgeschlossene Events (Vorbereitung / laufend) blockieren.
- **Reaktivieren einer Person, die nie ihr Passwort gesetzt hat.** Erwartung: Status
  zurück auf „Eingeladen"; der ursprüngliche Einladungslink gilt eventuell nicht mehr
  → „Passwort vergessen".
- **Einladungs-E-Mail-Zustellung schlägt fehl.** Erwartung: Konto bleibt angelegt,
  klare Fehlermeldung, „Passwort vergessen" als Ausweg.
- **Admin lädt seine eigene E-Mail-Adresse ein.** Erwartung: abgelehnt („schon in der
  Runde").
- **Netzwerkabbruch mitten in einer Aktion.** Erwartung: Fehlermeldung, Liste
  unverändert, Aktion wiederholbar ohne Doppel-Effekt (Server prüft den Zustand).

## Technical Requirements

- **Sicherheit:** Einladung, Deaktivierung/Reaktivierung und Rollenänderungen laufen
  ausschließlich serverseitig, nach Prüfung der Admin-Rolle des Aufrufers
  (`getUser()` + `is_admin()`), *bevor* der Service-Zugang benutzt wird. Der
  Service-Role-Schlüssel wird nur an dieser einen Stelle verwendet.
- **Integrität serverseitig erzwungen:** „mindestens ein aktiver Admin", „kein
  Deaktivieren eines Gastgebers nicht abgeschlossener Events", „kein
  Selbst-Deaktivieren" — nicht nur in der Oberfläche.
- **Datenerhalt:** Deaktivieren ändert nur `is_active`; keine Zeile wird gelöscht
  (PROJ-1: `ON DELETE RESTRICT` auf den Historien-Bezügen).
- **Mobile-first:** die Liste ab 375 px als Karten/Zeilen lesbar, Aktionen über ein
  Menü pro Eintrag, Touch-Ziele ≥ 44 px.
- **Abhängig von** PROJ-1 (`profiles`, `is_admin()`, `src/lib/supabase/admin.ts`,
  `tasting_events.host_id`) und PROJ-2 (`requireAdmin`, `(admin)`-Bereich,
  `/passwort-setzen`).

## Open Questions

- [ ] Falls die Einladungs-E-Mail nicht rausgeht (SMTP / Rate-Limit): Konto ist
      angelegt, Admin bekommt eine Fehlermeldung, die Person nutzt „Passwort
      vergessen". Reicht das, oder braucht es doch ein „Einladung erneut senden"?
      *(Tendenz: nach dem ersten echten Einsatz nochmal draufschauen.)*
- [ ] Soll die Liste deaktivierte Mitglieder standardmäßig ausblenden (mit „Auch
      deaktivierte anzeigen"-Schalter), oder immer alle zeigen? *(Tendenz: immer alle,
      alphabetisch; bei ≤ ~15 Zeilen unkritisch.)*
- [ ] Badge/Hinweis in der Liste, wenn ein Teilnehmer Gastgeber eines anstehenden
      Events ist (macht den Blockier-Fall vorhersehbar)? *(Tendenz: nice-to-have, evtl.
      in PROJ-4.)*

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Einladen mit E-Mail (Pflicht) + optionalem Anzeigenamen | Ein sauberer Name von Anfang an macht Teilnehmerlisten und die Gastgeber-Auswahl (PROJ-4) lesbar; leer lassen ist erlaubt und fällt auf den E-Mail-Präfix zurück (wie der PROJ-1-Trigger) | 2026-08-27 |
| Deaktivieren statt Löschen, immer; kein Hard-Delete | Bewertungen und mitgebrachte Whiskies eines Abends dürfen nicht rückwirkend verschwinden (PROJ-1: `ON DELETE RESTRICT`). Deaktivierte Konten können sich nicht mehr anmelden (PROJ-2) | 2026-08-27 |
| Deaktivieren wird blockiert, wenn die Person Gastgeber eines nicht abgeschlossenen Events ist | Der Gastgeber muss sich anmelden können, um den Abend zu steuern. Erst Event umhängen, dann deaktivieren | 2026-08-27 |
| Drei sichtbare Zustände: Eingeladen / Aktiv / Deaktiviert | Der Admin muss erkennen, wer die Einladung noch nicht angenommen hat, ohne extern Buch zu führen | 2026-08-27 |
| Kein „Einladung erneut senden" im MVP | „Passwort vergessen" auf der Login-Seite funktioniert auch für noch nie angemeldete Konten und deckt verlorene E-Mails / abgelaufene Links ab | 2026-08-27 |
| Der Admin ändert keine Anzeigenamen (nur bei der Einladung setzbar) | Der Name gehört dem Teilnehmer; er pflegt ihn selbst (PROJ-10). Tippfehler bei der Einladung sind der seltene Ausnahmefall | 2026-08-27 |
| Der Admin kann andere aktive Teilnehmer zu Admins machen und Rechte entziehen | Vertretung / kein Flaschenhals. Bewusste Erweiterung über „Admin — eine Person" aus der PRD hinaus | 2026-08-27 |
| Es muss immer mindestens ein aktiver Admin übrig bleiben | Schutz vor dem Aussperren aus dem Admin-Bereich. „Rechte entziehen" und „deaktivieren" werden für den letzten aktiven Admin abgelehnt; Selbst-Degradierung nur bei vorhandenem zweiten aktiven Admin | 2026-08-27 |
| Nur aktive Teilnehmer können befördert werden | Ein deaktivierter Admin hätte ohnehin keine Rechte (PROJ-1: `is_admin()` verlangt `is_active`); „Admin, aber noch nie angemeldet" wäre erklärungsbedürftig | 2026-08-27 |
| Jede ändernde Aktion (einladen, deaktivieren, reaktivieren, befördern, degradieren) hinter einem Bestätigungsdialog | Der Admin-Bereich bewegt Zugänge und Rechte — ein versehentlicher Klick soll nicht reichen (design-system: unumkehrbare/folgenreiche Aktionen hinter AlertDialog) | 2026-08-27 |
| Rollen-/Status-Änderungen serverseitig mit erhöhten Rechten, nach Admin-Prüfung | `profiles.role` und `is_active` sind für normale Nutzer per Spalten-GRANT gesperrt (PROJ-1). Die Änderung braucht den Service-Zugang; davor wird die Admin-Rolle des Aufrufers geprüft — die einzige Stelle im Code mit dem Service-Role-Schlüssel | 2026-08-27 |

### Technical Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Status/Rollen-Änderungen laufen über **benannte Datenbank-Aktionen (RPCs)**, die die Admin-Rolle des Aufrufers selbst prüfen — nicht über den Service-Zugang | Eine solche Aktion läuft mit erhöhten Rechten und darf damit `profiles.role` / `is_active` schreiben (für normale Nutzer per Spalten-GRANT gesperrt, PROJ-1). Sie prüft Admin-Rolle + alle Integritätsregeln + schreibt in **einem** Schritt mit Zeilensperre → zwei gleichzeitige Admin-Aktionen können nicht beide „am letzten Admin vorbei". Kleinere Angriffsfläche als „alles über den Service-Schlüssel" | 2026-08-27 |
| Der **Service-Zugang** (`src/lib/supabase/admin.ts`) wird nur noch für **eine** Sache gebraucht: das Einladen (Anlegen eines Auth-Kontos + Auslösen der Einladungs-E-Mail über die Auth-Admin-API) | Dafür gibt es keine SQL-/RPC-Entsprechung. Alles andere (Liste lesen inkl. E-Mail, deaktivieren, Rolle ändern) geht über RPCs. Damit bleibt der Service-Schlüssel an genau einer, klar benennbaren Stelle | 2026-08-27 |
| Die **Teilnehmerliste inkl. E-Mail und Anmeldestatus** kommt ebenfalls über eine RPC (Admin-geprüft), nicht über einen Direktzugriff auf die Benutzerverwaltung | Die `profiles`-Tabelle hat bewusst keine E-Mail-Spalte (PROJ-1). Die E-Mail und „hat sich schon mal angemeldet?" stehen in der Benutzerverwaltung von Supabase; eine Admin-geprüfte RPC liest beides und gibt es gebündelt zurück | 2026-08-27 |
| Der **Status ist abgeleitet, nicht gespeichert**: Deaktiviert = `is_active` falsch; sonst Eingeladen = noch nie angemeldet; sonst Aktiv | Keine zusätzliche Zustandsspalte, die mit der Realität auseinanderlaufen könnte. „Noch nie angemeldet" ergibt sich aus dem letzten Anmeldezeitpunkt in der Benutzerverwaltung | 2026-08-27 |
| Mutationen als **Server Actions** in `src/lib/actions/admin.ts` (nicht als eigene `/api`-Route) | Konsistent mit PROJ-2; jede Aktion prüft zuerst die Admin-Rolle, ruft dann die passende RPC bzw. (nur beim Einladen) den Service-Zugang. Der Plan sprach von einem „Route Handler" — die Absicht (ein geprüfter serverseitiger Engpass) bleibt, die Form ist eine Server Action | 2026-08-27 |
| Nach jeder erfolgreichen Aktion wird die Seite serverseitig neu geladen (`revalidate` + Refresh) | Die Liste ist immer frisch, ohne eigene Zwischenspeicher-Logik. Kein Realtime nötig — der Admin ist allein auf der Seite | 2026-08-27 |
| Einladungslink zeigt auf `…/auth/confirm?next=/passwort-setzen` | Wiederverwendung der PROJ-2-Strecke: verifizieren → Passwort setzen → angemeldet. `NEXT_PUBLIC_SITE_URL` muss (wie schon für PROJ-2) in Supabase als Redirect-URL hinterlegt sein | 2026-08-27 |
| Der Anzeigename wird beim Einladen als **Benutzer-Metadatum** mitgegeben | Der `handle_new_user`-Trigger aus PROJ-1 liest genau dieses Feld; ist es leer, nimmt er den Teil vor dem @. Kein Sonderpfad nötig | 2026-08-27 |
| Keine neuen Pakete | `dropdown-menu`, `alert-dialog`, `dialog`, `badge`, `form`, `input` sind installiert | 2026-08-27 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** Eine einzige neue Seite im Admin-Bereich mit einer
> Teilnehmerliste und fünf Aktionen (einladen, deaktivieren, reaktivieren, zum Admin
> machen, Admin-Rechte entziehen). Die heiklen Prüfungen — „nicht den letzten Admin",
> „nicht den Gastgeber eines laufenden Abends", „nicht sich selbst" — passieren in der
> Datenbank, nicht nur im Bildschirm.

### 1. Seiten- und Komponentenstruktur

```
(admin)-Bereich  (Zugang: „nur Admins", aus PROJ-2)
└─ /admin                    Platzhalter → bekommt einen Link „Teilnehmer verwalten"
   └─ /admin/teilnehmer      NEU — die Teilnehmerverwaltung
      ├─ Kopfzeile + Button „Teilnehmer einladen"
      ├─ Einladen-Dialog
      │   └─ Formular: E-Mail (Pflicht) · Anzeigename (optional)
      │       → Bestätigen → Aktion „einladen"
      ├─ Teilnehmerliste  (alphabetisch nach Anzeigename)
      │   └─ pro Eintrag: Anzeigename · E-Mail · Status-Badge
      │       (Eingeladen / Aktiv / Deaktiviert) · Admin-Kennzeichen ·
      │       Aktionsmenü
      │       └─ je nach Status/Rolle: deaktivieren · reaktivieren ·
      │           zum Admin machen · Admin-Rechte entziehen
      │           → jede Aktion zuerst über einen Bestätigungsdialog
      ├─ Ladezustand:  Platzhalter-Zeilen (Skeleton)
      ├─ Fehlerzustand: „Liste konnte nicht geladen werden" + „Erneut versuchen"
      └─ (kein echter Leerzustand — der Admin selbst steht immer drin)

Serverseitige Bausteine
├─ src/lib/actions/admin.ts   die fünf Aktionen (Server Actions)
├─ src/lib/schemas/admin.ts   Eingaberegeln für das Einladen-Formular
└─ neue Datenbank-Aktionen (RPCs) für Liste lesen / deaktivieren /
   reaktivieren / Admin-Rolle setzen
```

### 2. Datenmodell (keine neuen Tabellen)

PROJ-3 legt **keine** neue Tabelle an. Es nutzt:

- **`profiles` (PROJ-1):** Anzeigename, Rolle (`admin` / `teilnehmer`), Aktiv-Status
  (`is_active`).
- **Benutzerverwaltung von Supabase:** die E-Mail-Adresse und „hat sich schon mal
  angemeldet?" (letzter Anmeldezeitpunkt).
- **`tasting_events` (PROJ-1):** wer Gastgeber welches Events ist und in welchem
  Zustand das Event ist — für die Prüfung beim Deaktivieren.

**Der Status pro Teilnehmer wird berechnet, nicht gespeichert:**

| Bedingung | Status |
|-----------|--------|
| `is_active` = falsch | **Deaktiviert** |
| aktiv, aber noch nie angemeldet | **Eingeladen** |
| aktiv und schon mindestens einmal angemeldet | **Aktiv** |

Neue Datenbank-Aktionen (RPCs), jeweils mit eingebauter Admin-Prüfung:

| Aktion | Was sie tut | Eingebaute Regeln |
|--------|-------------|-------------------|
| **Liste lesen** | gibt alle Profile mit E-Mail und Status gebündelt zurück | nur für Admins |
| **deaktivieren** | setzt `is_active` = falsch | nicht man selbst; nicht Gastgeber eines Events in Vorbereitung/laufend; wenn Ziel Admin ist: es muss ein weiterer **aktiver** Admin bleiben |
| **reaktivieren** | setzt `is_active` = wahr | nur für Admins |
| **Admin-Rolle setzen** | schaltet Rolle zwischen `admin` und `teilnehmer` | befördern nur bei Status „Aktiv"; entziehen nicht, wenn dann kein aktiver Admin übrig bliebe; Selbst-Entzug nur bei vorhandenem zweitem aktiven Admin |

### 3. Wo der Service-Schlüssel (noch) gebraucht wird

Der mächtige Service-Zugang (`src/lib/supabase/admin.ts`, aus PROJ-1) wird in PROJ-3
an **genau einer** Stelle benutzt: beim **Einladen**. Ein Auth-Konto anlegen und die
Einladungs-E-Mail auslösen ist die Auth-Admin-API — dafür gibt es keine SQL-Aktion.

Alles andere (Liste lesen inkl. E-Mail, deaktivieren, reaktivieren, Rolle ändern)
läuft über die Datenbank-Aktionen aus Abschnitt 2. Die dürfen `role` / `is_active`
schreiben, weil sie mit erhöhten Rechten laufen — aber jede prüft zuerst selbst, ob
der Aufrufer Admin ist.

**Damit ist der Service-Schlüssel weiterhin an einer einzigen, klar benennbaren
Stelle** — enger als der ursprüngliche Plan („ein Route Handler für alles").

### 4. Warum die Regeln in der Datenbank sitzen, nicht (nur) im Bildschirm

Die Oberfläche blendet unmögliche Aktionen aus (kein „deaktivieren" in der eigenen
Zeile usw.) — das ist Komfort, kein Schutz. Ein Admin könnte die Anfrage von Hand
stellen. Deshalb prüft **jede** Datenbank-Aktion die Regel noch einmal selbst, und
zwar **im selben Schritt wie die Änderung, mit einer kurzen Sperre auf den
betroffenen Zeilen**. So können nicht zwei Admins gleichzeitig „dem jeweils anderen
die Rechte entziehen" und am Ende steht die Runde ohne Admin da.

### 5. Der Weg einer Einladung

1. Admin füllt E-Mail (+ optional Name) aus, bestätigt.
2. Die Aktion prüft: bin ich Admin? Gibt es die E-Mail schon? → sonst Abbruch mit
   klarer Meldung.
3. Über die Auth-Admin-API wird ein Konto angelegt (Name als Metadatum) und die
   Einladungs-E-Mail verschickt; der Link zeigt auf die PROJ-2-Strecke
   `…/auth/confirm → /passwort-setzen`.
4. Der `handle_new_user`-Trigger (PROJ-1) legt automatisch das Profil an
   (Rolle „Teilnehmer", Name aus dem Metadatum oder E-Mail-Präfix).
5. In der Liste erscheint die Person mit Status **Eingeladen**.
6. Sobald sie ihr Passwort gesetzt und sich angemeldet hat, zeigt die Liste beim
   nächsten Laden **Aktiv**.

Geht die E-Mail nicht raus, ist das Konto trotzdem angelegt: Der Admin bekommt eine
Fehlermeldung, die Person kann „Passwort vergessen" nutzen.

### 6. Zustände & Rückmeldungen (nach design-system)

- **Laden:** Skeleton-Zeilen in der Form der echten Liste.
- **Fehler beim Laden:** Hinweis + „Erneut versuchen", nie eine leere Seite.
- **Aktion läuft:** Button im Ladezustand, kein Doppelklick möglich.
- **Aktion schlägt fehl:** konkrete deutsche Meldung als kurze Einblendung, Liste
  unverändert.
- **Aktion gelingt:** Liste lädt sofort neu, kurze Bestätigung.
- **Bestätigungsdialog vor jeder Änderung** mit klarer Folge
  („kann sich nicht mehr anmelden, bisherige Bewertungen bleiben erhalten" /
  „verliert den Admin-Bereich").

### 7. Neue Pakete

**Keine.** `dropdown-menu` (Aktionsmenü pro Zeile), `alert-dialog` (Bestätigungen),
`dialog` (Einladen-Formular), `badge` (Status), `form` / `input` sind bereits
installiert.

### 8. Betriebsvoraussetzung

Wie schon für PROJ-2: `NEXT_PUBLIC_SITE_URL` muss in Supabase unter *Auth → URL
Configuration → Redirect URLs* stehen (mit `/auth/confirm`) — sonst führt der
Einladungslink ins Leere. Für den echten Versand der Einladungs-E-Mails braucht das
Supabase-Projekt einen funktionierenden E-Mail-Versand (Standard-SMTP von Supabase
reicht für den Anfang, hat aber enge Limits) → `/deploy`-Checkliste.

### 9. Wie der Erfolg geprüft wird

- **Unit-Tests** für die abgeleitete Status-Logik und die Eingaberegeln des
  Einladen-Formulars.
- **Datenbank-Tests** für die RPC-Regeln in der Art der PROJ-1-Suite: letzter Admin
  lässt sich nicht degradieren/deaktivieren; Gastgeber eines laufenden Events lässt
  sich nicht deaktivieren; Nicht-Admin-Aufruf wird abgewiesen; „Eingeladen" lässt
  sich nicht befördern.
- **E2E-Tests** (Chromium + Mobile Safari): einladen → Person erscheint als
  „Eingeladen"; deaktivieren/reaktivieren; befördern/degradieren; Selbst-Aktionen
  und Letzter-Admin-Fälle werden geblockt; Nicht-Admin sieht die Seite als „nicht
  gefunden".
- `npm run build` / `npm run lint` sauber.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
