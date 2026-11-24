# PROJ-30: Feedback-Formular (Fehler & Wünsche)

## Status: In Progress
**Created:** 2026-11-24
**Last Updated:** 2026-11-24

## Dependencies
- **Requires: PROJ-2 (Auth & Zugangskontrolle)**: Nur angemeldete, aktive Mitglieder können Feedback senden. Name und
  E-Mail-Adresse kommen aus der Sitzung.
- **Reuses: PROJ-16 (Nachrichten an Teilnehmer)**: Der Mailversand über das vorhandene Gmail-SMTP (`SMTP_*`-Variablen)
  ist bereits eingerichtet.
- **Analog zu: PROJ-27 (Neuigkeiten)**: Der dezente Link auf der Startseite steht direkt neben „Was gibt's Neues in
  Whizzky?“.

## Kontext
Fehler und Ideen aus der Runde kommen heute verstreut per WhatsApp oder im Gespräch beim Tasting an und gehen leicht
verloren. Ein einfaches Formular in der App soll beides direkt in das Postfach des Admins bringen. Technische Angaben
(Seite, Gerät) werden mitgeschickt, damit sich ein Fehler nachvollziehen lässt.

## User Stories
- Als **Mitglied** möchte ich einen Fehler, den ich in der App bemerke, schnell melden, ohne die Adresse des Admins
  kennen oder ein Mailprogramm öffnen zu müssen.
- Als **Mitglied** möchte ich eine Idee für eine neue Funktion einreichen, damit sie nicht im Gruppenchat untergeht.
- Als **Mitglied** möchte ich nach dem Absenden eine klare Bestätigung sehen. Schlägt das Senden fehl, möchte ich
  meinen Text nicht verlieren.
- Als **Admin** möchte ich jede Einreichung als E-Mail erhalten und mit „Antworten“ direkt dem Absender schreiben
  können.
- Als **Admin** möchte ich bei Fehlermeldungen sehen, auf welcher Seite und mit welchem Gerät sie entstanden sind.

## Out of Scope
- **Speichern in der Datenbank** oder eine Admin-Übersicht der Einreichungen. Gmail ist das Archiv.
- **Feedback ohne Anmeldung.** Es gibt keinen Link auf der öffentlichen Seite `/neuigkeiten` und kein Formular für
  Nicht-Mitglieder.
- **Anhänge und Screenshots.** Das PRD-Non-Goal „Keine Datei-Uploads außer Whisky-Fotos“ bleibt bestehen.
- **Status-Rückmeldung in der App** („in Arbeit“, „erledigt“). Rückmeldung gibt es per Mail-Antwort.
- **Eingangsbestätigung per Mail an den Absender.** Die Bestätigung erscheint nur in der App.
- **Ein frei wählbarer Betreff.** Der Betreff entsteht automatisch.
- **Push-Benachrichtigung** an den Admin (→ PROJ-17).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einstieg
- [ ] Angenommen ein Mitglied ist auf der Startseite, dann sieht es unten neben dem Neuigkeiten-Link einen zweiten,
  gleich dezenten Link „Fehler gefunden oder eine Idee?“. Ein Antippen öffnet das Feedback-Formular.
- [ ] Angenommen jemand ist nicht angemeldet, wenn er die Formular-Adresse direkt aufruft, dann wird er wie bei allen
  App-Seiten zur Anmeldung umgeleitet.

### Formular
- [ ] Angenommen das Formular ist geöffnet, dann zeigt es die Pflichtauswahl **Art** mit „Fehler“, „Wunsch“ und
  „Sonstiges“ (vorausgewählt ist keine) sowie ein Textfeld **Beschreibung** mit Zeichenzähler.
- [ ] Angenommen „Fehler“ ist gewählt, dann zeigt das Textfeld einen passenden Platzhalter, z. B. „Was hast du gemacht,
  was ist passiert, was hättest du erwartet?“. Bei „Wunsch“ erscheint ein eigener Platzhalter.
- [ ] Angenommen das Formular ist geöffnet, dann steht ein kurzer Hinweis darunter: Die Nachricht geht mit deinem
  Namen und deiner E-Mail-Adresse an den Admin, dazu technische Angaben (Seite, Gerät/Browser).
- [ ] Angenommen keine Art ist gewählt oder die Beschreibung hat nach dem Entfernen von Leerzeichen am Anfang und Ende
  weniger als 10 Zeichen, wenn das Mitglied absendet, dann erscheint am betroffenen Feld eine Fehlermeldung und
  nichts wird gesendet.
- [ ] Angenommen die Beschreibung ist länger als 2000 Zeichen, dann warnt der Zähler sichtbar und der Knopf
  „Absenden“ ist gesperrt.
- [ ] Angenommen das Mitglied tippt auf „Absenden“, dann ist der Knopf bis zur Antwort gesperrt und zeigt einen
  Ladezustand. Doppeltes Antippen erzeugt keine zweite Mail.

### Versand
- [ ] Angenommen das Formular ist gültig, wenn es abgesendet wird, dann geht eine E-Mail an die hinterlegte
  Feedback-Adresse des Admins.
- [ ] Angenommen eine Feedback-Mail kommt an, dann lautet der Betreff „[Whizzky] Fehler von {Anzeigename}“ (bzw.
  „Wunsch“ oder „Sonstiges“). Die Mail enthält die Beschreibung im Klartext, den Absender (Anzeigename und E-Mail),
  Datum und Uhrzeit (deutsche Zeit), die Seite, von der das Mitglied ins Formular kam, die Browser-/Gerätekennung
  und die App-Version, sofern verfügbar.
- [ ] Angenommen der Admin tippt in seinem Mailprogramm auf „Antworten“, dann ist die E-Mail-Adresse des Absenders
  als Empfänger eingetragen (Reply-To).
- [ ] Angenommen die Beschreibung enthält HTML, Skript-Code oder Zeilenumbrüche, dann erscheint sie in der Mail als
  reiner Text. Nichts davon wird ausgeführt oder verändert Kopfzeilen der Mail (keine Header-Injection).

### Rückmeldung
- [ ] Angenommen der Versand ist erfolgreich, dann sieht das Mitglied eine Bestätigung („Danke! Deine Nachricht ist
  beim Admin angekommen.“), das Formular ist geleert, und es führt ein Weg zurück zur Startseite.
- [ ] Angenommen der Versand schlägt fehl (SMTP nicht erreichbar, Netzwerkfehler), dann sieht das Mitglied eine
  verständliche Fehlermeldung. Art und Beschreibung bleiben erhalten, ein erneuter Versuch ist möglich, und es
  erscheint kein Absturz und keine Fehlergrenze.
- [ ] Angenommen ein Mitglied hat in der letzten Stunde bereits 5 Nachrichten gesendet, wenn es eine sechste
  absendet, dann wird sie nicht gesendet. Es sieht den Hinweis „Du hast gerade viele Nachrichten geschickt – bitte
  versuch es später noch einmal.“, und sein Text bleibt erhalten.

### Zugriff
- [ ] Angenommen ein Konto ist deaktiviert, dann kann es kein Feedback senden. Es gilt dieselbe Sperre wie für alle
  App-Seiten.
- [ ] Angenommen jemand ruft den Versand ohne gültige Sitzung direkt auf (z. B. per manipulierter Anfrage), dann wird
  keine Mail gesendet.

## Edge Cases
- **Feedback-Adresse nicht konfiguriert** (Umgebungsvariable fehlt): Der Versand schlägt mit der normalen
  Fehlermeldung fehl, der Text bleibt erhalten. Im Server-Log steht ein klarer Hinweis auf die fehlende Konfiguration.
- **Admin meldet selbst etwas:** Das ist erlaubt. Die Mail geht an die eigene Adresse.
- **Testkonto (PROJ-26)** sendet Feedback: Das ist erlaubt. Der Betreff erhält zusätzlich „(Testkonto)“, damit E2E-Läufe
  im Postfach erkennbar sind.
- **Herkunftsseite unbekannt** (Formular direkt aufgerufen): Die Mail enthält dann „Seite: unbekannt“.
- **Manipulierte Herkunftsangabe** (eine fremde Domain, eine sehr lange Zeichenkette): Sie wird nur als gekürzter
  Klartext übernommen. Nichts davon wird als Link ausgeführt.
- **Sehr lange Browserkennung:** Sie wird gekürzt (z. B. auf 300 Zeichen).
- **Seite neu laden nach dem Absenden:** Es entsteht keine zweite Mail.
- **Emoji und Umlaute** in der Beschreibung oder im Anzeigenamen kommen unverändert in der Mail an.

## Technical Requirements
- Security: Versand nur serverseitig nach Prüfung der Sitzung. Die Empfängeradresse liegt in einer
  Server-Umgebungsvariable und erscheint nie im Browser.
- Rate-Limit: höchstens 5 Einreichungen pro Person und Stunde.
- Mobile-first: Das Formular ist bei 360 px ohne horizontales Scrollen bedienbar und hat große Bedienelemente.
- Antwortzeit: Die Bestätigung erscheint in der Regel innerhalb weniger Sekunden.

## Open Questions
- [x] ~~Rate-Limit ohne Speicherung?~~ Gelöst mit einer minimalen Zähler-Tabelle ohne Inhalte (siehe Tech Design).
- [x] ~~Woher kommt die App-Version?~~ Kurze Commit-Kennung des Vercel-Deployments, lokal „lokal“.
- [x] ~~Wie verhindern E2E-Tests echte Mails?~~ Mit dem Trockenlauf `FEEDBACK_DRY_RUN=1`, den Playwright beim Start des
  Servers setzt.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Formular in der App statt `mailto:`-Link | Funktioniert ohne eingerichtetes Mailprogramm am Handy, Admin-Adresse bleibt verborgen, Technik-Angaben automatisch | 2026-11-24 |
| Nur angemeldete Mitglieder | Geschlossener Nutzerkreis; Absender automatisch bekannt; kein Spam-Schutz nötig | 2026-11-24 |
| Reply-To = Absender | Admin kann Rückfragen direkt per „Antworten“ stellen | 2026-11-24 |
| Empfänger als Umgebungsvariable statt „alle Admins“ | Änderbar ohne Code; heute ohnehin nur ein Admin | 2026-11-24 |
| Nur E-Mail, keine Speicherung der Inhalte | Schlank; Gmail ist das Archiv; bei Fehler bleibt der Text im Formular | 2026-11-24 |
| Felder: Art + Beschreibung, Betreff automatisch | Wenig Tipparbeit am Handy; Betreff trotzdem filterbar in Gmail | 2026-11-24 |
| Technik-Angaben (Seite, Gerät, Version) mitsenden, mit Hinweis | Fehler nachvollziehbar, ohne Rückfrage; Transparenz durch Hinweis | 2026-11-24 |
| Rate-Limit 5 pro Stunde je Person | Schützt Postfach und Gmail-Versandlimit vor Fehlbedienung | 2026-11-24 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Seite `/feedback` im angemeldeten Bereich + Server-Aktion | Anmeldeprüfung und Muster wie bei allen Formularen (PROJ-16) | 2026-11-24 |
| Rate-Limit über minimale Zähler-Tabelle (nur Mitglied + Zeitpunkt), Zugriff nur per DB-Funktion, neuer Code TS029 | Arbeitsspeicher auf Vercel unzuverlässig, Cookie umgehbar; keine Inhalte gespeichert, Einträge > 1 Tag werden gelöscht | 2026-11-24 |
| Fehlgeschlagene Versuche zählen mit | Bremst gerade das wiederholte Absenden bei kaputtem Versand; 5/h stört niemanden | 2026-11-24 |
| Empfänger `FEEDBACK_EMAIL` (Server-Variable) | Nie im Browser; änderbar ohne Code | 2026-11-24 |
| Browserkennung serverseitig aus der Anfrage, Herkunftsseite per Link-Parameter, Version = Vercel-Commit-Kennung | Zuverlässig ohne Browser-Code; alles gekürzter Klartext | 2026-11-24 |
| SMTP-Transport mit PROJ-16 teilen | Keine doppelte Konfiguration | 2026-11-24 |

---

## Tech Design (Solution Architect)

### Überblick
Eine neue App-Seite **`/feedback`** mit einem Formular und eine Server-Aktion, die die Mail verschickt. Wiederverwendet
werden der Mailversand aus PROJ-16 (Nodemailer über Gmail-SMTP, feste Absenderadresse, Reply-To), die Anmeldeprüfung
der App-Seiten (PROJ-2) und die Fehlertexte über die TS-Codes. Neu im Backend ist nur ein **schlanker Zähler** für das
Stundenlimit. Er speichert keine Inhalte.

### A) Komponenten
```
Startseite (bestehend)
+-- Fußzeile mit dezenten Links
    +-- „Was gibt's Neues in Whizzky?"  (bestehend, PROJ-27)
    +-- „Fehler gefunden oder eine Idee?"  (neu, Sprechblasen-Icon, gleicher Stil)

/feedback  (neue Seite im angemeldeten Bereich, mit Seitenkopf wie die anderen Seiten)
+-- Feedback-Formular (Karte)
|   +-- Art: Auswahl Fehler / Wunsch / Sonstiges (shadcn RadioGroup als große Kacheln)
|   +-- Beschreibung: Textfeld mit Zeichenzähler, Platzhalter je nach Art
|   +-- Hinweis: was mitgeschickt wird (Name, E-Mail, Seite, Gerät/Browser)
|   +-- Knopf „Absenden" (mit Ladezustand gesperrt)
|   +-- Fehlermeldung (Alert), Text bleibt stehen
+-- Bestätigung (statt des Formulars nach Erfolg)
    +-- „Danke! Deine Nachricht ist beim Admin angekommen."
    +-- Knöpfe „Zur Startseite" und „Noch etwas melden"
```
Alle Bausteine sind vorhandene shadcn-Komponenten: Card, RadioGroup, Textarea, Button, Alert und Label.

### B) Daten
**Der Inhalt einer Einreichung wird nirgends gespeichert.** Er existiert nur in der Mail.

Für das Limit von 5 pro Stunde gibt es eine neue, minimale Tabelle **„Feedback-Zähler“**. Jede Zeile enthält nur:
- wer gesendet hat (Mitglied)
- wann gesendet wurde

Art, Text und Technik-Angaben stehen nicht darin. Mitglieder können die Tabelle weder lesen noch beschreiben. Der
Zugriff läuft nur über eine Datenbankfunktion, die in einem Schritt drei Dinge tut:
1. prüfen, ob die Person aktives Mitglied ist
2. die Einträge der letzten Stunde zählen. Sind es schon 5, lehnt sie mit dem neuen Code **TS029** ab („Du hast gerade
   viele Nachrichten geschickt – bitte versuch es später noch einmal.“)
3. einen neuen Eintrag anlegen und Einträge löschen, die älter als einen Tag sind

Die Tabelle bleibt so immer winzig. Löscht man ein Konto, verschwinden seine Einträge automatisch mit.

**Technik-Angaben in der Mail:**
- **Seite:** Der Link auf der Startseite übergibt die Herkunftsseite. Fehlt sie, steht „unbekannt“ in der Mail. Der
  Server übernimmt sie nur als gekürzten Klartext.
- **Gerät/Browser:** Der Server liest die Browserkennung aus der Anfrage, gekürzt auf 300 Zeichen. Der Browser muss
  sie nicht selbst mitschicken.
- **App-Version:** Kurze Commit-Kennung des Vercel-Deployments, z. B. „Version 4ab533f“. Vercel stellt sie automatisch
  bereit. Lokal steht „lokal“ in der Mail.
- **Zeitpunkt:** Serverzeit, ausgegeben in deutscher Zeit.

**Empfänger:** neue Server-Umgebungsvariable **`FEEDBACK_EMAIL`**, lokal in `.env.local` und bei Vercel. Sie wird in
`.env.local.example` dokumentiert und hat bewusst kein `NEXT_PUBLIC_`-Präfix, damit sie nie im Browser landet.

### C) Ablauf beim Absenden
1. Das Formular prüft im Browser Art und Länge (Zod und react-hook-form, gleiche Regeln wie auf dem Server).
2. Die Server-Aktion prüft die Sitzung und dieselben Regeln noch einmal.
3. Sie prüft, ob `FEEDBACK_EMAIL` gesetzt ist. Fehlt die Variable, gibt es die normale Fehlermeldung und einen
   Log-Hinweis, und es wird nichts gezählt.
4. Der Zähler reserviert den Platz. Ist das Limit erreicht, kommt die TS029-Meldung.
5. Die Mail geht per Nodemailer raus:
   - Absender „Whizzky“
   - Reply-To: Absender
   - Betreff „[Whizzky] {Art} von {Name}“, bei Testkonten mit „(Testkonto)“
   - Inhalt als reiner Text
6. Bei Erfolg zeigt die Seite die Bestätigung. Bei einem Fehler zeigt sie die Meldung und behält den Text.

Ein fehlgeschlagener Versand zählt mit. Das ist bewusst so, denn genau das Hämmern auf einen kaputten Versand soll
gebremst werden. Bei 5 Versuchen pro Stunde stört das niemanden.

### D) Technische Entscheidungen (Begründung)
- **Server-Aktion statt API-Route:** Das ist das Muster aller bisherigen Formulare (z. B. Nachrichten in PROJ-16),
  mit Sitzung und Fehlertexten wie gewohnt.
- **Zähler in der Datenbank statt im Arbeitsspeicher:** Vercel startet Server-Instanzen beliebig neu und parallel. Ein
  Zähler im Arbeitsspeicher würde das Limit nicht zuverlässig durchsetzen. Ein Cookie könnte man einfach löschen.
- **Zähler ohne Inhalte:** Das hält die Produktentscheidung „nur E-Mail, keine Speicherung“ ein. Gespeichert wird
  nur, dass und wann jemand gesendet hat, und auch das höchstens einen Tag lang.
- **Header-Injection ausgeschlossen:** Betreff und Reply-To entstehen nur aus Anzeigename, Art und Sitzungs-E-Mail.
  Zeilenumbrüche im Namen werden entfernt. Nutzertext kommt ausschließlich in den Mail-Inhalt, als reiner Text.
- **Mailversand teilt sich den SMTP-Zugang mit PROJ-16:** Die Transport-Einrichtung wird gemeinsam genutzt statt
  dupliziert.

### E) Abhängigkeiten
Keine neuen Pakete, `nodemailer` ist seit PROJ-16 vorhanden. Es gibt eine neue DB-Migration (Zähler-Tabelle und
Funktion). Sie muss **vor** dem Code-Push per `db:push` eingespielt werden.

### F) Tests (Vorschau für /backend und /qa)
- Integration: Limit greift beim 6. Aufruf; deaktiviertes Konto und anonymer Aufruf werden abgelehnt; die Tabelle ist
  für Mitglieder nicht lesbar.
- Unit: Formular-Regeln, Betreff- und Mail-Aufbau inklusive Kürzen und Entfernen von Zeilenumbrüchen.
- E2E: Link auf der Startseite, Formular-Validierung, Erfolg und Fehlerfall. Der echte Mailversand wird in E2E durch
  einen Testmodus ersetzt, damit dein Postfach nicht vollläuft. Wie genau, entscheidet /backend.

## Backend-Implementierung (2026-11-24)

**Migration** `supabase/migrations/20261125120000_feedback_submissions.sql`:
- Tabelle `feedback_submissions(id, profile_id → profiles ON DELETE CASCADE, created_at)` mit Index
  `(profile_id, created_at)`. RLS ist an, es gibt **keine Policy** und alle Rechte für `anon`/`authenticated` sind
  entzogen. Die Tabelle speichert keine Inhalte.
- `register_feedback()` (SECURITY DEFINER, nur `authenticated`):
  - prüft auf aktives Mitglied, sonst TS004
  - nimmt einen Advisory-Lock pro Person, damit parallele Aufrufe das Limit nicht überholen
  - löscht alle Einträge, die älter als einen Tag sind
  - lehnt ab 5 Einträgen in der letzten Stunde mit TS029 ab, legt sonst einen Eintrag an

**App-Code:**
- `src/lib/email/transport.ts`: Der SMTP-Transport und die Absenderadresse kommen aus `send-message.ts` (PROJ-16) und
  werden jetzt gemeinsam genutzt.
- `src/lib/schemas/feedback.ts`: Art `bug|wish|other` mit deutschen Bezeichnungen, Beschreibung getrimmt mit 10–2000
  Zeichen, optional `from`.
- `src/lib/feedback-mail.ts` (rein, testbar):
  - baut Betreff und Klartext
  - `oneLine` entfernt Steuerzeichen und Zeilenumbrüche (Schutz vor Header-Injection im Betreff) und kürzt
  - `sanitizeFromPage` lässt nur App-Pfade zu, die mit genau einem „/“ beginnen, sonst „unbekannt“
  - die Browserkennung wird auf 300 Zeichen gekürzt
  - die Version sind die ersten 7 Zeichen von `VERCEL_GIT_COMMIT_SHA`, sonst „lokal“
  - die Zeit wird in Europe/Berlin ausgegeben
- `src/lib/email/send-feedback.ts`: Versand mit Absender „Whizzky“ und Reply-To = Absender. Ist
  **`FEEDBACK_DRY_RUN=1`** gesetzt, wird nur geloggt und nichts verschickt.
- `src/lib/actions/feedback.ts`, `sendFeedbackAction(input)`, in dieser Reihenfolge:
  1. Sitzung prüfen
  2. Zod-Validierung
  3. `FEEDBACK_EMAIL` vorhanden? Sonst Fehlermeldung und Log, nichts gezählt
  4. `register_feedback`
  5. Mail verschicken
  6. Ergebnis `{ok:true}` oder `{error}`. Ein SMTP-Fehler wird abgefangen, nichts wirft bis in die Fehlergrenze.
- `src/lib/errors.ts`: TS029.
- `.env.local.example`: `FEEDBACK_EMAIL` und der Hinweis zu `FEEDBACK_DRY_RUN`.
- `playwright.config.ts`: `webServer.env.FEEDBACK_DRY_RUN = '1'`. Damit verschickt E2E keine echten Mails, sofern der
  Server von Playwright gestartet wird.

**Tests:**
- Unit: `feedback.test.ts` (5) und `feedback-mail.test.ts` (10), alle grün.
- Integration: `feedback.integration.test.ts` (8) prüft Limit, pro Person, Parallelität, Aufräumen nach einem Tag,
  anonym, deaktiviert, kein Direktzugriff und CASCADE. Er läuft nach `db:push`.

Damit ist die offene Frage zu E2E-Mails beantwortet: Trockenlauf per Umgebungsvariable statt Abfangen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
