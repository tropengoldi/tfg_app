# PROJ-26: Testkonten für normale Nutzer unsichtbar

## Status: Planned
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
| _To be added by /architecture_ | | |

### Betriebsnotiz
- Weil die Regel „ein aktives Tasting“ global bleibt, gilt weiter: **vor jedem E2E-Lauf prüfen,
  dass kein echtes Tasting läuft** (`npm run tasting:list`).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
