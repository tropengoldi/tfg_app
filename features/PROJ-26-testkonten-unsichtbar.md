# PROJ-26: Testkonten für normale Nutzer unsichtbar

## Status: In Progress
**Created:** 2026-10-06
**Last Updated:** 2026-10-06

## Dependencies
- **Requires: PROJ-3 (Admin – Teilnehmerverwaltung)**: Dort wird markiert (Einladen-Dialog + Liste).
- **Requires: PROJ-14 (Profil sichtbar für andere)**: Fremde Profile von Testkonten werden ausgeblendet.
- **Berührt alle Stellen, die andere Personen oder Tastings zeigen:** PROJ-4 (Event-Verwaltung),
  PROJ-8 (Dashboard), PROJ-9 (Historie/Ergebnisse), PROJ-10 (Bilanz), PROJ-15 (Sammlung),
  PROJ-16 (Nachrichten), PROJ-22 (Tipps/Kenner), PROJ-25 (Statistiken), Community-Liste.
- **Erledigt den Backlog-Punkt „E2E-Suite hängt an den Seed-Konten“** (INDEX, Post-Deploy-Backlog).

## Kontext

Die App läuft mit einer einzigen Datenbank, der echten. Zum Ausprobieren und für die automatischen
Tests entstehen deshalb Konten und Tastings, die die Runde nicht sehen soll. Bisher erscheinen sie
in Teilnehmerlisten, in der Community, in der Historie und in Auswahllisten. Heute liegen außerdem
19 übrig gebliebene Wegwerf-Konten früherer Testläufe in der Datenbank.

Künftig markiert der Admin Konten als **Testkonto**. Normale Mitglieder sehen Testkonten nirgends.
Tastings, an denen ein Testkonto beteiligt ist, sind für sie komplett ausgeblendet. Durchgesetzt
wird das auf **Datenbankebene**, nicht nur in der Oberfläche.

## User Stories
- Als **Mitglied** möchte ich in Listen, Auswahlfeldern und der Historie nur echte Mitglieder und
  echte Abende sehen, damit die App aufgeräumt bleibt und keine Fantasie-Tastings auftauchen.
- Als **Admin** möchte ich ein Konto beim Einladen oder später als Testkonto markieren, damit ich
  die App auf dem echten System ausprobieren kann, ohne die Runde zu stören.
- Als **Admin** möchte ich Testkonten und Test-Tastings in meinen Listen erkennen („Test“), damit ich
  den Überblick behalte und Testläufe nachprüfen kann.
- Als **Admin** möchte ich, dass Test-Tastings meine eigene Bilanz nicht verfälschen.
- Als **Testkonto** möchte ich die App wie ein normales Mitglied durchklicken können, inklusive
  echter Historie und echter Profile. Ich soll aber keine echten Mitglieder anschreiben können.
- Als **Admin** möchte ich, dass die automatischen Tests nur Testkonten anlegen und nicht mehr mein
  echtes Admin-Konto benutzen, damit Testläufe für die Runde unsichtbar bleiben und mein Passwort
  geändert bleiben kann.

## Out of Scope
- **Parallel laufende Test- und echte Tastings:** Die Regel „höchstens ein Tasting gleichzeitig
  aktiv“ gilt weiterhin global (Entscheidung 2026-10-06). Ein Testlauf während eines echten Abends
  bleibt tabu. Die Testsuite kann einen laufenden echten Abend also weiterhin beenden, deshalb
  vorher prüfen (siehe Betriebsnotiz).
- **Eigene Test-Markierung am Tasting:** Ein Tasting ist genau dann ein Test-Tasting, wenn ein
  Testkonto beteiligt ist. Es gibt kein separates Häkchen.
- **Gemischte Tastings mit teilweiser Ausblendung:** Ist ein Testkonto beteiligt, ist das ganze
  Tasting unsichtbar. Es wird nicht nur das Testkonto herausgefiltert.
- **Separate Test-Datenbank / Staging-Umgebung:** nicht Teil dieses Features.
- **Testkonten als Admin:** Ein Admin-Konto kann nicht als Testkonto markiert werden. Die Testsuite
  bekommt dafür einen eigenen Wegwerf-Admin.
- **Automatisches Löschen alter Testkonten:** Aufräumen bleibt beim Wartungsskript `user:delete`.
- **Mails von echten Mitgliedern an Testkonten:** Für normale Mitglieder sind Testkonten ohnehin
  nicht auswählbar. Der Admin darf an alle schreiben.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Markieren (Admin)
- [ ] Angenommen der Admin lädt ein neues Mitglied ein, dann gibt es im Einladen-Dialog ein
  Häkchen „Testkonto“, standardmäßig aus. Ist es gesetzt, ist das Konto ab der Einladung ein
  Testkonto.
- [ ] Angenommen die Teilnehmerliste im Admin-Bereich, dann hat jedes Nicht-Admin-Konto einen
  Schalter „Testkonto“, und markierte Konten tragen ein Abzeichen „Test“.
- [ ] Angenommen der Admin markiert ein Konto, das an Tastings beteiligt ist, wenn er den Schalter
  umlegt, dann fragt eine Rückfrage nach: „N Tastings werden für die Runde ausgeblendet.“
- [ ] Angenommen der Admin entfernt die Markierung von einem Konto mit Test-Tastings, wenn er den
  Schalter umlegt, dann fragt eine Rückfrage nach: „N Tastings werden für die Runde sichtbar.“ Ist
  in einem dieser Tastings noch ein anderes Testkonto beteiligt, bleibt es weiterhin ausgeblendet,
  und die Zahl berücksichtigt das.
- [ ] Angenommen ein Admin-Konto, dann gibt es keinen Testkonto-Schalter. Ein Versuch über die
  Schnittstelle wird abgelehnt.
- [ ] Angenommen ein Testkonto, wenn der Admin es zum Admin machen will, dann wird das abgelehnt
  („Testkonten können keine Admins sein“).

### Test-Tastings
- [ ] Angenommen ein Tasting, an dem ein Testkonto als Gastgeber, Whisky-Steward oder Teilnehmer
  beteiligt ist, dann ist es ein Test-Tasting.
- [ ] Angenommen der Admin fügt in der Event-Verwaltung einem Tasting mit echten Mitgliedern ein
  Testkonto hinzu (oder umgekehrt einem Test-Tasting ein echtes Mitglied), wenn er speichert, dann
  warnt ein Hinweis: „Dieses Tasting wird für die Runde unsichtbar.“ Er kann bestätigen oder abbrechen.
- [ ] Angenommen ein Test-Tasting, dann trägt es in der Event-Verwaltung und in den Listen des
  Admins ein Abzeichen „Test“.

### Unsichtbarkeit für normale Mitglieder
- [ ] Angenommen ein normales Mitglied (kein Admin, kein Testkonto), dann erscheinen Testkonten
  nirgends: nicht in „Die Runde ansehen“, nicht als Empfänger von Nachrichten, nicht in
  Teilnehmerlisten, nicht als „mitgebracht von“, nicht als Kenner oder in „Alle Tipps“.
- [ ] Angenommen ein normales Mitglied ruft das Profil oder die Sammlung eines Testkontos direkt über
  die Adresse auf, dann sieht es „nicht gefunden“, wie bei einer unbekannten ID.
- [ ] Angenommen ein normales Mitglied, dann erscheinen Test-Tastings nirgends: nicht auf dem
  Dashboard, nicht unter „Meine Tastings“, nicht in der Historie. Ein direkter Aufruf von Ergebnis-,
  Bewertungs- oder Whisky-Seite eines Test-Tastings ergibt „nicht gefunden“.
- [ ] Angenommen ein normales Mitglied, dann zählen Test-Tastings nicht in seine Bilanz und nicht
  in die Bilanz anderer echter Mitglieder, die es ansieht (Tastings, mitgebrachte Whiskys, beste
  Platzierung, Ø Punkte, Kenner der Woche).
- [ ] Angenommen ein normales Mitglied fragt die Daten direkt über die Datenbank-Schnittstelle ab
  (statt über die Oberfläche), dann bekommt es ebenfalls keine Testkonten und keine Test-Tastings.

### Testkonten
- [ ] Angenommen ein Testkonto, dann sieht es alles, was ein normales Mitglied sieht, und
  zusätzlich andere Testkonten und alle Test-Tastings, an denen es beteiligt ist bzw. die
  abgeschlossen sind (gleiche Regeln wie für echte Tastings).
- [ ] Angenommen ein Testkonto schreibt eine Nachricht, dann kann es als Empfänger nur Testkonten
  wählen. Bei einer tasting-bezogenen Nachricht gehen Mails nur an die Testkonten unter den
  Teilnehmern. Ein Versuch, über die Schnittstelle ein echtes Mitglied anzuschreiben, wird abgelehnt.
- [ ] Angenommen ein Testkonto, dann zählen in seiner Bilanz auch seine Test-Tastings.
- [ ] Angenommen ein Testkonto öffnet „Die Runde ansehen“ oder eine Liste mit Test-Tastings, dann
  tragen Testkonten und Test-Tastings auch dort das Abzeichen „Test“, wie beim Admin.

### Admin
- [ ] Angenommen der Admin, dann sieht er alle Konten und alle Tastings. Testkonten und
  Test-Tastings tragen das Abzeichen „Test“ (Teilnehmerliste, Event-Verwaltung, Historie, Community,
  Teilnehmerlisten im Tasting).
- [ ] Angenommen der Admin nimmt selbst an einem Test-Tasting teil, dann zählt es nicht in seine
  eigene Bilanz.
- [ ] Angenommen der Admin schreibt eine Nachricht, dann kann er Testkonten und echte Mitglieder
  wählen (wie bisher).

### Automatische Tests & Einführung
- [ ] Angenommen die E2E-Suite legt Wegwerf-Konten an, dann sind sie automatisch Testkonten.
  Ausnahme sind nur Tests, die ausdrücklich das Verhalten eines normalen Mitglieds prüfen.
- [ ] Angenommen die E2E-Suite braucht einen Admin, dann legt sie einen Wegwerf-Admin an und
  benutzt nicht mehr das echte Admin-Konto. Die Suite läuft danach ohne das Seed-Passwort.
- [ ] Angenommen das Feature wird eingeführt, dann werden das Seed-Testkonto
  `test.teilnehmer@example.com` und die übrig gebliebenen Wegwerf-Konten (`qa-…@example.com`) als
  Testkonten markiert. Echte Konten bleiben unverändert, und das echte Tasting vom 2026-10-03
  bleibt sichtbar.
- [ ] Angenommen das Feature ist eingeführt, dann laufen alle bestehenden E2E-Tests weiter grün,
  einschließlich der bisher am Seed-Admin-Passwort gescheiterten.

## Edge Cases
- **Testkonto ist Gastgeber eines Tastings mit echten Teilnehmern:** Das ganze Tasting ist
  unsichtbar, und die echten Teilnehmer sehen „ihr“ Tasting nicht. Darauf weist die Warnung beim
  Speichern hin.
- **Testkonto wird während eines laufenden Tastings markiert:** Das Tasting verschwindet sofort für
  normale Mitglieder, auch vom Dashboard. Die Rückfrage nennt die Zahl betroffener Tastings.
- **Markierung wird entfernt:** Abgeschlossene Tastings des Kontos werden für alle sichtbar und
  zählen ab dann in die Bilanzen. Ausnahme: Ein anderes Testkonto ist noch beteiligt.
- **Testkonto deaktiviert** (PROJ-3): Es bleibt Testkonto. Beide Eigenschaften sind unabhängig.
- **Nachricht eines echten Mitglieds an ein Tasting, in dem nachträglich ein Testkonto
  auftaucht:** Das Tasting ist dann unsichtbar und nicht mehr wählbar. Bereits gesendete
  Nachrichten bleiben in der eigenen Gesendet-Liste. Empfängernamen von Testkonten werden dort für
  normale Mitglieder nicht angezeigt.
- **Normales Mitglied hat ein Profil-Lesezeichen auf ein Konto, das später markiert wird:** Es
  bekommt „nicht gefunden“.
- **„Höchstens ein aktives Tasting“:** Läuft ein Test-Tasting, kann kein echtes starten, und
  umgekehrt. Für normale Mitglieder sieht das so aus, als liefe nichts. Der Admin sieht im
  Dashboard das laufende Test-Tasting mit Abzeichen „Test“.
- **Wegwerf-Konto aus einem abgebrochenen Testlauf:** Es ist von Anfang an Testkonto und damit
  unsichtbar, auch wenn das Aufräumen fehlschlägt.

## Technical Requirements (optional)
- Die Unsichtbarkeit wird auf **Datenbankebene** erzwungen (Zugriffsregeln / Sichten), wie die
  Blindheit der Verkostung. Die Oberfläche filtert zusätzlich nur für die Anzeige („Test“-Abzeichen).
- Die Regel „Test-Tasting = Testkonto beteiligt“ ist an genau einer Stelle definiert.
- Nach der Einführung muss die bestehende Regressionssuite ohne das Seed-Admin-Passwort laufen.

## Open Questions
- [x] Sollen die 19 übrig gebliebenen Wegwerf-Konten bei der Einführung nur markiert oder gleich
  gelöscht werden? **Nur markieren.** Das ist sicher und sofort unsichtbar. Aufräumen danach in
  Ruhe per `user:delete` (Nutzer, 2026-10-06).
- [x] Sieht ein Testkonto, wer Test und wer echt ist? **Ja**, Abzeichen „Test“ auch für Testkonten
  (Nutzer, 2026-10-06).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Test-Tasting = sobald ein Testkonto beteiligt ist (Gastgeber, Steward, Teilnehmer) | Eindeutig und automatisch, keine zweite Markierung, die man vergessen kann. Die Warnung beim Speichern schützt echte Tastings | 2026-10-06 |
| Gemischte Tastings komplett ausblenden statt nur das Testkonto herauszufiltern | Sonst stünden in Ranglisten Punkte und Whiskys „unsichtbarer“ Personen, Summen und Plätze wären unerklärlich | 2026-10-06 |
| Testkonten sehen alles wie ein Mitglied + die Test-Welt | Realistisches Durchklicken mit echten Daten | 2026-10-06 |
| Testkonten dürfen nur Testkonten anschreiben | Kein Testlauf soll echte Mails an die Runde auslösen | 2026-10-06 |
| Markieren beim Einladen + Schalter in der Liste, Rückfrage mit Anzahl betroffener Tastings | Kein Zeitfenster, in dem ein neues Testkonto sichtbar ist. Die Rückfrage macht die Folgen sichtbar | 2026-10-06 |
| Admin-Konten können keine Testkonten sein (und umgekehrt) | Ein Test-Admin würde jedes von ihm angelegte Tasting zum Test-Tasting machen. Klare Trennung | 2026-10-06 |
| Test-Tastings zählen in keiner Bilanz echter Konten, auch nicht beim Admin; Testkonten zählen sie | Bilanzen spiegeln echte Abende. Die Bilanz bleibt trotzdem testbar | 2026-10-06 |
| Admin sieht alles mit Abzeichen „Test“ | Überblick und Nachprüfen von Testläufen ohne Umloggen | 2026-10-06 |
| Abzeichen „Test“ auch für Testkonten | Beim Durchklicken ist sonst nicht erkennbar, welche Profile und Tastings nur zum Testen da sind | 2026-10-06 |
| Übrig gebliebene `qa-…`-Konten bei der Einführung nur markieren, nicht löschen | Sofort unsichtbar ohne Risiko. Löschen bleibt ein bewusster Schritt per `user:delete` | 2026-10-06 |
| „Höchstens ein aktives Tasting“ bleibt global | Ausdrückliche Entscheidung des Nutzers. Testläufe während eines echten Abends bleiben tabu | 2026-10-06 |
| E2E-Wegwerf-Konten automatisch als Testkonto; Seed-Umbau (Wegwerf-Admin) im selben Feature | Testläufe sind sofort unsichtbar. Der vorbestehende Seed-Admin-Fehlschlag verschwindet, und das echte Admin-Passwort bleibt unberührt | 2026-10-06 |
| Einführung markiert Seed-Testkonto + übrig gebliebene `qa-…`-Konten | Seed-Konto ohne jeden Fußabdruck (geprüft 2026-10-06: 0 Teilnahmen, 0 Whiskys, 0 Bewertungen). Die `qa-…`-Konten sind Reste abgebrochener Testläufe | 2026-10-06 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Markierung als neues Profil-Merkmal „Testkonto“ (ja/nein), änderbar nur durch den Admin | Ein Merkmal am Konto ist die eine Quelle der Wahrheit. Mitglieder dürfen es an ihrem eigenen Profil nicht ändern (gleiche Technik wie bei den gesperrten Profilfeldern aus PROJ-14) | 2026-10-06 |
| Datenbank-Regel „Testkonto und Admin schließen sich aus“ | Wird in der Datenbank erzwungen, nicht nur im Formular. Gilt beim Markieren und beim Befördern zum Admin | 2026-10-06 |
| „Test-Tasting“ wird bei jeder Abfrage aus den Beteiligten **berechnet**, nicht als eigenes Feld gespeichert | Eine Stelle, keine Synchronisation, die auseinanderlaufen kann (Teilnehmer hinzufügen, Gastgeber wechseln, Markierung umlegen). Bei der Datenmenge der Runde (Dutzende Tastings) kostet das nichts Messbares | 2026-10-06 |
| Drei zentrale Prüfungen: „Betrachter darf Testdaten sehen“, „Profil ist sichtbar“, „Tasting ist sichtbar“ | Alle Zugriffsregeln und Sichten nutzen dieselben drei Bausteine, statt die Logik zu kopieren. Gleiches Muster wie die bestehenden Prüfungen „ist Admin“ / „ist Teilnehmer“ | 2026-10-06 |
| Zugriffsregeln werden **verschärft**, nicht ersetzt: zusätzliche Bedingung „sichtbar“ | Bestehende Rechte (Teilnehmer, Steward, Admin, abgeschlossen) bleiben unverändert. Hinzu kommt nur „und nicht Test, außer der Betrachter darf Test sehen“. Das senkt das Risiko für die Blindheit der Verkostung | 2026-10-06 |
| Sichten liefern zusätzlich eine Kennzeichnung „Test“ mit | Admin und Testkonten brauchen das Abzeichen, und die Bilanz echter Konten muss Test-Tastings herausrechnen, auch beim Admin, der sie sehen darf | 2026-10-06 |
| Bilanz-Regel: Bilanz eines echten Kontos ohne Test-Tastings, Bilanz eines Testkontos mit | Unabhängig davon, wer hinschaut. Für normale Mitglieder erledigt das schon die Datenbank, für den Admin rechnet die App die gekennzeichneten Tastings heraus | 2026-10-06 |
| Markierung beim Einladen über die geschützten Konto-Metadaten, die nur der Server setzen kann | Das Konto ist vom ersten Augenblick an Testkonto, ohne Zeitfenster. Die Metadaten kann der Nutzer selbst nicht verändern | 2026-10-06 |
| Rückfrage-Zahl „N Tastings werden aus-/eingeblendet“ von einer Admin-Funktion berechnet | Berücksichtigt korrekt, ob ein anderes Testkonto im selben Tasting beteiligt bleibt | 2026-10-06 |
| Mixed-Warnung im Event-Formular rein in der Oberfläche | Der Admin sieht die Markierung aller Konten ohnehin. Es ist eine Warnung, keine Sperre, deshalb braucht es keine Datenbank-Regel | 2026-10-06 |
| Nachrichten: Empfänger-Prüfung in der bestehenden Empfänger-Funktion (PROJ-16) | Ein Testkonto als Absender bekommt nur Testkonten als Empfänger aufgelöst. Ein Versuch mit echten Empfängern wird abgelehnt, auch über die Schnittstelle | 2026-10-06 |
| Regel „ein aktives Tasting“ unverändert | Produktentscheidung (global) | 2026-10-06 |
| Testsuite: Wegwerf-Konten standardmäßig Testkonto, Wegwerf-Admin statt Seed-Admin | Testläufe sind für die Runde unsichtbar, und die Suite hängt nicht mehr an echten Passwörtern | 2026-10-06 |

### Betriebsnotiz
- Weil die Regel „ein aktives Tasting“ global bleibt, gilt weiter: **vor jedem E2E-Lauf prüfen,
  dass kein echtes Tasting läuft** (`npm run tasting:list`).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Ein Backend-lastiges Feature. Neu sind ein Merkmal „Testkonto“ am Profil und drei zentrale
Sichtbarkeits-Prüfungen in der Datenbank. Alle bestehenden Zugriffsregeln, Sichten und
Admin-Funktionen, die andere Personen oder Tastings liefern, bekommen eine zusätzliche Bedingung.
Die Oberfläche bekommt nur kleine Ergänzungen (Abzeichen, Häkchen, Schalter, Rückfragen,
Warnung). Dazu kommt der Umbau der Testsuite. Es gibt kein neues Paket und keine neue Seite.

### A) Sichtbarkeitsmodell

| Betrachter | Testkonten | Test-Tastings | Abzeichen „Test“ | Bilanz zählt Test-Tastings |
|---|---|---|---|---|
| Normales Mitglied | unsichtbar | unsichtbar (auch als Teilnehmer) | – | nein |
| Testkonto | sichtbar | sichtbar (nach den üblichen Regeln) | ja | ja (eigene Bilanz) |
| Admin | sichtbar | sichtbar | ja | nein (eigene Bilanz) |

Ein Test-Tasting ist ein Tasting, bei dem Gastgeber, Whisky-Steward oder ein Teilnehmer
Testkonto ist. Das wird bei jeder Abfrage berechnet.

### B) Datenmodell
- **Profil:** NEU Merkmal „Testkonto“ (ja/nein, Standard nein). Nur der Admin kann es ändern.
  Datenbank-Regel: nie gleichzeitig Admin.
- **Konto-Anlage:** Das Merkmal wird aus den geschützten Konto-Metadaten übernommen, die beim
  Einladen bzw. von der Testsuite gesetzt werden.
- **Keine neue Tabelle**, kein gespeichertes „Test-Tasting“-Feld.

### C) Datenbank-Bausteine (eine Migration)

**Drei zentrale Prüfungen**
1. *Betrachter darf Testdaten sehen*: Admin oder selbst Testkonto.
2. *Profil sichtbar*: eigenes Profil, kein Testkonto, oder Betrachter darf Testdaten sehen.
3. *Tasting sichtbar*: kein Test-Tasting, oder Betrachter darf Testdaten sehen.

**Zugriffsregeln (zusätzliche Bedingung)**

| Bereich | heute | neu zusätzlich |
|---|---|---|
| Profile | alle lesbar | nur sichtbare Profile |
| Tastings, Teilnehmerlisten, Whiskys, Whisky-Details | Teilnehmer / Steward / Admin / abgeschlossen | und Tasting sichtbar |
| Sammlungen (PROJ-15) | eigene / freigegeben | und Profil sichtbar |
| Eigene Bewertungen, Tipps, Nachrichten | nur eigene | unverändert |

**Sichten** (Profil-Sicht, Historie, Ranglisten, Einzelbewertungen, aufgedeckte Tipps): Sie filtern
mit denselben Prüfungen und liefern die Kennzeichnung „Test“ mit (Tasting bzw. Person).

**Funktionen**
- Admin-Listen „Mitglieder“ und „Events“: liefern die Kennzeichnung „Test“.
- NEU Admin-Funktion „Testkonto setzen“ mit Ergebnis „N Tastings betroffen“ und NEU
  „Auswirkung abfragen“ für die Rückfrage, bevor gesetzt wird.
- „Zum Admin machen“: lehnt Testkonten ab.
- Nachrichten-Empfänger auflösen: Testkonto als Absender → nur Testkonten. Echte Empfänger
  werden abgelehnt (neuer Fehlercode).
- Konto-Anlage: übernimmt das Merkmal.

**Datenpflege in derselben Migration:** Das Seed-Testkonto und alle `qa-…@example.com`-Konten
werden als Testkonto markiert. Echte Konten bleiben unberührt.

### D) Oberfläche

```
Admin › Teilnehmer (PROJ-3)
+-- Einladen-Dialog: NEU Häkchen „Testkonto“
+-- Zeile: NEU Abzeichen „Test“ + Schalter „Testkonto“ (nicht bei Admins)
    +-- Rückfrage „N Tastings werden für die Runde aus-/eingeblendet“

Admin › Events (PROJ-4)
+-- Liste: NEU Abzeichen „Test“
+-- Formular: NEU Warnung beim Speichern eines gemischten Tastings („wird für die Runde unsichtbar“)

Überall dort, wo Personen/Tastings erscheinen (Community, Historie, Dashboard, Teilnehmerlisten,
Ergebnis-Kopf): NEU Abzeichen „Test“, nur für Admin und Testkonten sichtbar
(gemeinsame kleine Komponente auf Basis des shadcn `Badge`)

Profil-Bilanz (PROJ-10/14): rechnet Test-Tastings heraus, wenn das betrachtete Konto echt ist
Nachrichten (PROJ-16): Empfänger-Auswahl zeigt, was die Datenbank liefert, also für ein
Testkonto automatisch nur Testkonten
```

„Nicht gefunden“ für direkte Aufrufe ergibt sich von selbst: Die Seiten bekommen keine Daten mehr
und antworten wie bei unbekannten IDs.

### E) Testsuite
- Wegwerf-Konten werden standardmäßig als Testkonto angelegt. Eine Option erzeugt bei Bedarf ein
  „normales Mitglied“.
- NEU Wegwerf-Admin. Die etwa 40 Anmeldungen mit Seed-Admin bzw. Seed-Testkonto in 5 Testdateien
  (PROJ-2, 3, 4, 6, 14) werden darauf umgestellt.
- Neue Integrationstests (Datenbank) für alle drei Betrachter-Rollen: Profile, Tastings,
  Teilnehmerlisten, Whiskys, Sichten, Sammlung, Nachrichten-Empfänger, Admin-Regel, Markieren.
- Neue E2E-Tests: Einladen mit Häkchen, Schalter + Rückfrage, Mixed-Warnung, Unsichtbarkeit für
  ein normales Mitglied (Liste und direkter Aufruf), Abzeichen, Admin-Bilanz ohne Test-Tastings.
- Danach die **volle Regressionssuite** (`--workers=1`), weil alle Lesewege betroffen sind.

### F) Einführung (Reihenfolge)
1. Nutzer spielt die Migration ein (`db:push`) und erzeugt die Typen neu. Die alte App läuft weiter,
   weil nur Spalten hinzukommen und Regeln verschärft werden.
2. Integrationstests (`test:rls`) bestätigen die Regeln gegen die Live-Datenbank.
3. Code-Push.
4. Kontrolle: Das echte Tasting vom 2026-10-03 ist für Mitglieder sichtbar, die `qa-…`-Konten
   nicht. Danach optional Aufräumen per `user:delete`.

### G) Risiken
- **Blindheit:** Die Zugriffsregeln für Whiskys und Details werden nur verschärft, nie geöffnet.
  Die bestehenden Blindheits-Tests laufen unverändert mit.
- **Leistung:** Die Berechnung „Test-Tasting“ läuft pro Zeile. Bei der Größe der Runde ist das
  unkritisch. Ändert sich das, kann später ein gespeichertes Merkmal nachgezogen werden.

### H) Abhängigkeiten (Pakete)
Keine.

### Arbeitsaufteilung
`/backend` zuerst (Migration, Typen, Server-Aktionen, Integrationstests, Testsuite-Helfer), dann
`/frontend` (Abzeichen, Häkchen, Schalter, Rückfragen, Warnung, Bilanz-Filter).

### Implementation Notes (Backend, 2026-10-06)
- **Migration** `supabase/migrations/20261009120000_test_accounts.sql` (vom Nutzer per `db:push`
  eingespielt, danach `db:types`):
  - `profiles.is_test` (Default false), Constraint `profiles_test_not_admin`, nur `select`-Grant
    für die Spalte, kein `update`-Grant → ändern nur über `admin_set_test_account`.
  - Prüfungen (SECURITY DEFINER): `viewer_sees_tests()`, `is_test_profile(id)`,
    `is_test_event(id)` (die eine Regel: Gastgeber/Steward/Teilnehmer ist Testkonto),
    `profile_visible(id)`, `event_visible(id)`.
  - Policies verschärft (bestehende Bedingung UND sichtbar): `profiles_select_all`,
    `events_select_participant_or_admin`, `participants_select_same_event`,
    `whiskies_select_participant_or_admin`, `wd_select`. Sammlung über
    `profile_shows_collection` (+ `profile_visible`).
  - Sichten mit Filter und angehängter Spalte `is_test`: `profiles_public`, `whisky_rankings`,
    `past_tastings`, `whisky_score_breakdown`, `winner_tips_revealed`.
  - `admin_list_members` / `admin_list_events` neu angelegt (+ `is_test`).
    `admin_test_account_impact`, `admin_set_test_account` (geben die Zahl betroffener Tastings
    zurück, intern `test_account_impact_internal`). `set_member_admin` lehnt Testkonten ab (TS025).
  - `resolve_message_recipients`: Testkonto (kein Admin) → nur Testkonten, sonst TS024.
    Unsichtbare Empfänger fallen still heraus.
  - `handle_new_user` übernimmt `is_test` aus den Metadaten der Anlage.
  - Datenpflege: 20 Konten markiert (Seed-Testkonto + 19 `qa-…`), alle `teilnehmer` ohne
    Fußabdruck. Nachgeprüft: 0 Admins markiert, 0 echte Konten markiert, Tasting 2026-10-03 kein
    Test-Tasting.
- **Abweichung vom Design:** `app_metadata` funktioniert für die Markierung bei der Anlage
  **nicht**, weil GoTrue sie erst nach dem INSERT setzt und der Trigger sie dadurch nicht sieht
  (per Probe nachgewiesen). Verwendet wird `user_metadata.is_test`, das beim INSERT vorliegt. Das ist
  genauso sicher, weil die Registrierung gesperrt ist (Konten legt nur der Server an) und der
  Trigger nur beim Anlegen läuft. Die Admin-Einladung (`inviteUserByEmail` → `data`) nutzt ohnehin
  diesen Weg.
- **App-Server:** `errors.ts` TS024/TS025. `schemas/admin.ts` `isTest` (optional) + `uuidSchema`.
  `actions/admin.ts`: Einladung reicht `is_test` durch, NEU `getTestAccountImpactAction`,
  `setTestAccountAction` (revalidiert app-weit). `queries/admin.ts` `MemberRow.is_test`.
  `auth.ts` Session-Spalten + `is_test`.
- **Testsuite:** `createDisposableUser` legt standardmäßig Testkonten an (`test: false` als
  Ausnahme). `setRole(…, 'admin')` entfernt die Markierung. NEU `createDisposableAdmin`. Die 5
  Specs mit Seed-Anmeldung (PROJ-2, 3, 4, 6, 14) nutzen jetzt pro Worker einen Wegwerf-Admin bzw.
  ein Wegwerf-Mitglied, inklusive Aufräumen (vorher die vom Admin angelegten Tastings). „Befördern
  und degradieren“ (PROJ-3) nutzt bewusst ein normales Mitglied.
- **Dabei aufgedeckt und mitbehoben (veraltete Tests, liefen seit der Admin-Passwort-Änderung
  nicht mehr):** PROJ-3 erwartete die alte TS013-Meldung ohne „oder Whisky-Steward“. PROJ-4 griff
  unspezifisch auf „das“ Auswahlfeld zu, seit PROJ-11 gibt es zwei.
- **Tests:** neuer Integrationstest `test-accounts.integration.test.ts` (21 Fälle, alle drei
  Rollen). `npm run test:rls` **188/188**. Unit 189/189, Lint + Typcheck sauber.
- **Volle E2E-Regression (Chromium, `--workers=1`):** PROJ-2/3/4/6/14 mit Wegwerf-Konten 83 grün
  (2 vorbestehende `fixme` in PROJ-3). Alle übrigen 15 Specs **161/161** grün. Die Suite läuft damit
  erstmals seit der Admin-Passwort-Änderung komplett, ohne Seed-Konten.

### Implementation Notes (Frontend, 2026-10-06)
- **Bausteine:** `common/test-badge.tsx` (shadcn `Badge`, gestrichelt, „Test“). `lib/test-accounts.ts`
  (+ 10 Unit-Tests): `tastingMix` (real/test/mixed), `testToggleDescription` (Text der Rückfrage),
  `countsForBalance` (Bilanz-Regel). `queries/test-flags.ts` `testEventIds()`: fragt
  `is_test_event` nur ab, wenn der Betrachter Testdaten sehen darf. Für normale Mitglieder gibt es
  keine Zusatzabfrage.
- **Abzeichen-Prinzip:** Abzeichen erscheinen schlicht bei `is_test`. Normale Mitglieder bekommen
  solche Datensätze von der Datenbank gar nicht, sehen also nie ein Abzeichen.
- **Admin › Teilnehmer:** Abzeichen + Schalter „Testkonto“ je Nicht-Admin-Zeile (unter der E-Mail,
  44 px hoch). Umlegen fragt zuerst die Auswirkung ab und zeigt dann die Rückfrage „… N Tastings
  werden für die Runde aus-/eingeblendet“. „Zum Admin machen“ ist für Testkonten ausgeblendet.
  Einladen-Dialog: Häkchen „Testkonto“.
- **Admin › Events:** Abzeichen in der Liste. Im Formular stehen Abzeichen hinter den Namen
  (Gastgeber, Teilnehmer, Steward). Bei gemischter Zusammensetzung erscheint ein Hinweis im
  Formular und beim Speichern eine Rückfrage „Tasting wird unsichtbar“.
- **Abzeichen in Mitglieder-Ansichten:** Community, Historie, Meine Tastings, Dashboard
  (Tasting + Teilnehmer), Ergebnis-Kopf (Tasting + „Wer war dabei“).
- **Bilanz:** `getPersonalBalance(userId, ownerIsTest)` und das fremde Profil rechnen Test-Tastings
  für echte Konten heraus (Tastings, mitgebrachte Whiskys, beste Platzierung, Ø, Kenner).
  `getKennerCount(…, ownerIsTest)`.
- **Nachrichten:** `getComposeData(userId, senderIsTest)` bietet einem Testkonto nur Testkonten an
  (allgemein + je Tasting). Ein Hinweis im Formular erklärt das. Die Datenbank lehnt den Rest mit
  TS024 ab.
- Typcheck + Lint sauber, Unit **199/199**. Sichtprüfung per Screenshots bei 360 px (Admin-Liste,
  Rückfrage, Event-Formular gemischt, Community als Testkonto).
- **Aufgeräumt (2026-10-06, auf Wunsch des Nutzers):** weitere Testreste ohne `qa-`-Präfix
  gelöscht: „hermann-68-“ (vom Nutzer angelegt) sowie „Repro A/C/E“ (`repro…@example.com`, aus
  der PROJ-16-Fehlersuche vom 2026-09-28). Alle ohne Fußabdruck. Die drei Repro-Konten hielten
  allerdings je eine gesendete Testnachricht („Testnachricht“, „Testnachricht 2“, „seq test“,
  ohne verbliebene Empfänger). Die Nachrichten wurden zuerst gelöscht, weil `messages.sender_id`
  das Löschen mit `on delete restrict` blockiert.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
