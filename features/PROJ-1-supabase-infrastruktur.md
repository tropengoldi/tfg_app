# PROJ-1: Supabase-Infrastruktur

## Status: Planned
**Created:** 2026-08-27
**Last Updated:** 2026-08-27

## Dependencies
- None — dies ist das Fundament, auf dem PROJ-2 bis PROJ-10 aufbauen

## Kontext

Dieses Feature baut keine Oberfläche. Es legt das Datenfundament und — vor allem — die
**Zugriffsregeln**, die die Blindverkostung überhaupt erst tragfähig machen.

Der entscheidende Punkt: Die Geheimhaltung ist **keine Frontend-Aufgabe**. Wenn ein
Teilnehmer während des Tastings die Whisky-Namen nicht sehen darf, dann muss die Datenbank
sie ihm verweigern — nicht die Oberfläche sie ausblenden. Sonst genügt ein Blick in die
Entwicklerkonsole, um den Abend zu ruinieren. Alles, was in diesem Feature entsteht, dient
diesem einen Ziel.

## User Stories

- Als **Teilnehmer** möchte ich, dass meine vergebenen Punkte bis zum Abschluss des Tastings
  für niemanden einsehbar sind — auch nicht für den Gastgeber —, damit sich niemand
  beeinflussen lässt und niemand nachträglich vergleicht.
- Als **Teilnehmer** möchte ich, dass der Whisky, den ich mitbringe, geheim bleibt, damit
  ihn beim Verkosten niemand an Name oder Herkunft erkennt.
- Als **Gastgeber** möchte ich als Einziger die vollständige Whisky-Liste sehen, damit ich in
  der von mir festgelegten Reihenfolge ausschenken kann.
- Als **Admin** möchte ich, dass sich niemand von außen registrieren kann, damit unsere Runde
  ein geschlossener Kreis bleibt.
- Als **Entwickler** möchte ich zwei funktionierende Konten mit unterschiedlichen Rollen
  haben, damit ich die Zugriffsregeln von beiden Seiten gegenprüfen kann.

## Out of Scope

Dieses Feature liefert ausschließlich Datenbank, Regeln und Zugänge — **keine einzige Seite
und kein einziger Button**. Konkret nicht enthalten:

- **Login-, Passwort- und Session-Oberflächen** → PROJ-2
- **Einladen und Verwalten von Teilnehmern** → PROJ-3 (die *Tabelle* für Profile entsteht
  hier, die Verwaltung nicht)
- **Anlegen und Bearbeiten von Tasting-Events** → PROJ-4
- **Eingabemasken für Whiskies und das Verkostungsvideo** → PROJ-5 (die *Spalten* inklusive
  `video_url` entstehen hier)
- **Gastgeber-Steuerung und Drag-and-Drop-Reihenfolge** → PROJ-6 (die *Regeln*, wer wann
  weiterschalten darf, entstehen hier)
- **Bewertungsformular** → PROJ-7
- **Realtime-Abonnements im Browser** → PROJ-8 (die *Freigabe* der Tabellen für Realtime
  passiert hier)
- **Rangliste und Historie als Ansicht** → PROJ-9 (die *Berechnung* entsteht hier)
- **Beispiel-Tastings als Seed-Daten** — bewusst nicht, siehe Produktentscheidungen
- **Datei- und Bild-Uploads** — Supabase Storage bleibt in dieser Version ungenutzt
- **Deployment und Umgebungsvariablen bei Vercel** → `/deploy`

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Geheimhaltung der Whiskies

- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer die Whisky-Daten eines fremden
      Whiskys abfragt, dann erhält er kein Ergebnis — weder Name noch Destillerie, Region,
      Alter, Stärke, Preis oder Video-Link
- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer seinen **eigenen** mitgebrachten
      Whisky abfragt, dann sieht er dessen vollständige Daten
- [ ] Angenommen ein Tasting läuft, wenn der **Gastgeber** die Whisky-Liste abfragt, dann
      sieht er alle Whiskies mit allen Angaben
- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer die Whisky-Liste abfragt, dann sieht
      er zwar, **dass** es acht Whiskies gibt und an welcher Position jeder steht, aber zu
      keinem davon einen Namen
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer die Whisky-Liste abfragt,
      dann sieht er zu jedem Whisky alle Angaben einschließlich Video-Link und der Person,
      die ihn mitgebracht hat
- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer die Anlagezeitpunkte der Whiskies
      abfragt, dann erhält er sie nicht — sonst ließe sich über die Reihenfolge der Eingaben
      erschließen, wer welchen Whisky mitgebracht hat

### Geheimhaltung der Bewertungen

- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer die Bewertungen eines anderen
      abfragt, dann erhält er kein Ergebnis
- [ ] Angenommen ein Tasting läuft, wenn der **Gastgeber** Bewertungen abfragt, dann erhält
      er ebenfalls kein Ergebnis — auch er darf vor dem Abschluss keine Punkte sehen
- [ ] Angenommen ein Tasting läuft, wenn der Gastgeber den Bewertungsfortschritt abfragt,
      dann erhält er ausschließlich Zählwerte („6 von 7"), niemals Punkte oder Namen
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer die Bewertungen der
      anderen abfragt, dann sieht er sie vollständig

### Bewerten

- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer eine Bewertung für den aktuellen oder
      einen bereits ausgeschenkten Whisky speichert, dann wird sie angenommen
- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer einen Whisky bewerten will, der noch
      nicht ausgeschenkt wurde, dann wird die Eingabe abgelehnt
- [ ] Angenommen ein Teilnehmer hat einen Whisky bereits bewertet, wenn er dieselbe Bewertung
      erneut speichert, dann wird sie überschrieben statt ein zweiter Eintrag angelegt
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer eine Bewertung ändern
      oder löschen will, dann wird der Versuch abgelehnt
- [ ] Angenommen ein Teilnehmer bewertet, wenn er Nasenpunkte außerhalb von 1 bis 5 oder
      Geschmackspunkte außerhalb von 1 bis 10 einträgt, dann wird die Eingabe abgelehnt
- [ ] Angenommen ein Teilnehmer bewertet, wenn er versucht die Bewertung unter fremdem Namen
      zu speichern, dann wird der Versuch abgelehnt

### Sichtbarkeit von Events

- [ ] Angenommen jemand ist nicht zu einem Tasting eingeladen, wenn er das Event abfragt,
      dann erhält er kein Ergebnis
- [ ] Angenommen jemand ist zu einem Tasting eingeladen, wenn er das Event abfragt, dann
      sieht er dessen Eckdaten und die Teilnehmerliste
- [ ] Angenommen ein beliebiger Nutzer fragt die Teilnehmerliste eines fremden Events ab,
      wenn die Abfrage ausgeführt wird, dann kommt ein leeres Ergebnis zurück und **keine
      Fehlermeldung über eine Endlosschleife in den Zugriffsregeln**

### Ablaufsteuerung

- [ ] Angenommen ein Tasting ist in Vorbereitung, wenn der Gastgeber es startet und mindestens
      ein Whisky mit lückenloser Reihenfolge vorliegt, dann wechselt es in den laufenden
      Zustand und der erste Whisky wird zum aktuellen
- [ ] Angenommen ein Tasting ist in Vorbereitung, wenn der Gastgeber es ohne festgelegte
      Reihenfolge starten will, dann wird der Start abgelehnt
- [ ] Angenommen ein Tasting läuft, wenn der Gastgeber zweimal kurz hintereinander „Runde
      abschließen" auslöst, dann rückt die Runde **genau einmal** weiter
- [ ] Angenommen der letzte Whisky ist im Glas, wenn der Gastgeber „Runde abschließen"
      auslöst, dann wird der Versuch abgelehnt mit dem Hinweis, dass nur noch der Abschluss
      des Tastings möglich ist
- [ ] Angenommen ein Teilnehmer ist nicht Gastgeber, wenn er eine Runde weiterschalten oder
      das Tasting abschließen will, dann wird der Versuch abgelehnt
- [ ] Angenommen ein Gastgeber versucht den Zustand des Events direkt zu ändern statt über
      die vorgesehene Aktion, wenn er das tut, dann wird die Änderung abgelehnt
- [ ] Angenommen ein Tasting läuft, wenn der Gastgeber die Reihenfolge ändert, dann lassen
      sich nur noch nicht ausgeschenkte Whiskies verschieben
- [ ] Angenommen ein Tasting läuft, wenn der Gastgeber zwei Positionen tauscht, dann gelingt
      das in einem Zug ohne Zwischenzustand, in dem zwei Whiskies dieselbe Position haben

### Whiskies eintragen

- [ ] Angenommen ein Tasting ist in Vorbereitung und ein Limit von einem Whisky pro Person ist
      gesetzt, wenn ein normaler Teilnehmer einen zweiten einträgt, dann wird der Versuch
      abgelehnt
- [ ] Angenommen dieselbe Situation, wenn der **Gastgeber** einen zweiten einträgt, dann wird
      er angenommen — der Gastgeber darf genau einen mehr als das Limit
- [ ] Angenommen kein Limit ist gesetzt, wenn ein Teilnehmer Whiskies einträgt, dann ist die
      Anzahl frei
- [ ] Angenommen ein Tasting läuft bereits, wenn ein Teilnehmer einen Whisky nachtragen will,
      dann wird der Versuch abgelehnt

### Rangliste

- [ ] Angenommen ein Tasting läuft, wenn ein Teilnehmer die Rangliste abfragt, dann erhält er
      **kein** Ergebnis — es darf kein Zwischenstand entstehen, der aus unvollständigen Daten
      wie ein echtes Ergebnis aussieht
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer die Rangliste abfragt,
      dann erhält er für jeden Whisky die Summe der Nasenpunkte, die Summe der
      Geschmackspunkte, die Gesamtsumme, die Anzahl der abgegebenen Bewertungen und den Rang
- [ ] Angenommen zwei Whiskies haben dieselbe Gesamtsumme, wenn die Rangliste erstellt wird,
      dann entscheidet zuerst der Geschmack, dann die Nase, zuletzt die Ausschankposition
- [ ] Angenommen ein Teilnehmer hat einen Whisky nicht bewertet, wenn die Rangliste erstellt
      wird, dann wird die Summe trotzdem gebildet und die abweichende Anzahl der Bewertungen
      mit ausgewiesen

### Rollen und Zugang

- [ ] Angenommen ein Teilnehmer ist eingeloggt, wenn er versucht sich selbst zum Admin zu
      machen, dann wird der Versuch abgelehnt
- [ ] Angenommen ein Teilnehmer ist eingeloggt, wenn er seinen Anzeigenamen oder seine
      Profilangaben ändert, dann gelingt das
- [ ] Angenommen jemand ruft die Registrierung von Supabase direkt auf, wenn er ein Konto
      anlegen will, dann schlägt das fehl, weil die öffentliche Registrierung abgeschaltet ist
- [ ] Angenommen ein neues Konto wird angelegt, wenn die Anlage erfolgreich war, dann existiert
      automatisch ein zugehöriges Profil mit der Rolle „Teilnehmer"

### Grundlage für die spätere App

- [ ] Angenommen die Datenbank ist eingerichtet, wenn die Anwendung gebaut wird, dann läuft
      `npm run build` fehlerfrei durch — die aktuell defekte Supabase-Anbindung mit dem
      doppelten Export ist ersetzt
- [ ] Angenommen die Datenbank ist eingerichtet, wenn die TypeScript-Typen erzeugt werden,
      dann bilden sie alle Tabellen, Ansichten und Aktionen ab
- [ ] Angenommen der Gastgeber schaltet eine Runde weiter, wenn ein anderes Gerät die
      Änderung beobachtet, dann wird sie ihm zugestellt — die Freigabe für Live-Updates ist
      auf Event- und Whisky-Tabelle gesetzt, aber **nicht** auf Bewertungen und Whisky-Details
- [ ] Angenommen die Datenbank ist eingerichtet, wenn die Sicherheits- und Performance-Prüfung
      von Supabase läuft, dann meldet sie keine Befunde
- [ ] Angenommen die Einrichtung ist abgeschlossen, wenn ich mich mit dem Admin-Konto und mit
      dem Testkonto anmelde, dann funktionieren beide

## Edge Cases

- **Zwei Geräte schalten gleichzeitig weiter.** Der Gastgeber hat Handy und Tablet offen und
  löst auf beiden „Runde abschließen" aus. Erwartung: Die Runde rückt genau einmal weiter,
  das zweite Gerät bekommt eine verständliche Meldung, dass bereits weitergeschaltet wurde.
- **Reihenfolge tauschen kollidiert mit sich selbst.** Whisky 2 und 3 tauschen die Plätze.
  Zwischenzeitlich hätten beide dieselbe Position. Erwartung: Der Tausch gelingt als eine
  einzige Änderung, ohne dass die Eindeutigkeitsregel dazwischenfunkt.
- **Ein Mitglied verlässt die Runde.** Erwartung: Ergebnisse abgeschlossener Tastings bleiben
  unverändert — die Person wird stillgelegt, nicht gelöscht. Andernfalls würde sich die
  Rangliste eines Abends von 2024 rückwirkend ändern.
- **Jemand ist am Tasting-Abend nicht da und bewertet eine Runde nicht.** Erwartung: Die
  Summe wird trotzdem gebildet, die abweichende Anzahl Bewertungen ist sichtbar.
- **Ein zweites Tasting soll parallel starten.** Erwartung: Der Start wird abgelehnt, solange
  ein anderes Tasting läuft. Events in Vorbereitung sind beliebig viele erlaubt.
- **Ein Teilnehmer manipuliert Anfragen im Browser.** Erwartung: Jede Regel greift auf
  Datenbankebene. Es gibt keine Anfrage, die ein manipuliertes Frontend stellen könnte und
  die Geheimhaltung bricht.
- **Whisky-Details ohne passenden Whisky.** Erwartung: Strukturell ausgeschlossen — ein
  Detaileintrag kann nicht zu einem anderen Event gehören als der Whisky, an dem er hängt.

## Technical Requirements

- **Sicherheit:** Row Level Security auf allen Tabellen, aktiv für jede Operation. Keine
  Regel darf eine andere Tabelle direkt referenzieren (Endlosschleifen-Gefahr).
- **Sicherheit:** Der Service-Role-Schlüssel wird in diesem Feature nirgends verwendet.
- **Sicherheit:** Öffentliche Registrierung und anonyme Anmeldung in Supabase abgeschaltet.
  Das ist eine Einstellung im Supabase-Dashboard, kein Code — sie muss manuell geprüft werden.
- **Performance:** Indizes auf allen Spalten, nach denen gefiltert, sortiert oder verknüpft
  wird. Die Zugriffsprüfungen dürfen nicht pro Zeile neu ausgewertet werden.
- **Datenintegrität:** Punktebereiche, Textlängen und Zustandsübergänge werden von der
  Datenbank erzwungen, nicht nur von der Anwendung.
- **Region:** eu-central-1, Projekt `tfg_app` (`ogwuwisutgaxxpknkgpg`), PostgreSQL 17.

## Open Questions

- [x] `.env.local.example` konnte nicht angelegt werden → Deny-Regeln `Read(**/.env*)` und
      `Edit(**/.env*)` in `.claude/settings.json` auf die echten Env-Dateien verengt
      (`.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`,
      `.env.*.local`). Vorlagen mit Dummy-Werten sind damit erlaubt, echte Secrets weiterhin
      hart blockiert. Datei angelegt und als nicht-ignoriert verifiziert (2026-08-27)
- [x] Supabase Personal Access Token aus `.mcp.json` entfernt → der gehostete MCP-Server
      nutzt jetzt den Browser-Login (dynamische Client-Registrierung); ein Token wird nur in
      CI-Umgebungen gebraucht. Zugriff zusätzlich auf Projekt `ogwuwisutgaxxpknkgpg` und die
      Funktionsgruppen `database`, `debugging`, `development`, `docs` eingegrenzt.
      **Offen bleibt: den alten Token im Supabase-Dashboard widerrufen** (2026-08-27)
- [ ] Context7-MCP ist nicht eingerichtet — für dieses Feature nicht nötig, für spätere
      Fragen zu Next.js und Supabase aber hilfreich.
- [ ] Soll das Dev-Passwort der Testkonten vor dem ersten echten Tasting geändert oder das
      Testkonto gelöscht werden? Entscheidung spätestens vor `/deploy`.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Geheimhaltung wird in der Datenbank erzwungen, nicht im Frontend | Ein ausgeblendetes Feld ist keine Geheimhaltung — ein Blick in die Entwicklerkonsole würde reichen. Die Blindverkostung ist der Kern des Produkts und muss unmanipulierbar sein | 2026-08-27 |
| Auch der Gastgeber sieht keine Bewertungen vor dem Abschluss | Er sieht ohnehin alle Whisky-Namen; dürfte er zusätzlich die Punkte sehen, wüsste er das Ergebnis vor allen anderen und könnte den Abend unbewusst färben. Für seine Steuerungsaufgabe genügen Zählwerte | 2026-08-27 |
| Der Gastgeber sieht die Whisky-Namen | Er schenkt aus — ohne die Zuordnung kann er die Reihenfolge nicht umsetzen. Ein vollständig blinder Gastgeber wäre nur mit physisch nummerierten Flaschen möglich und würde den Abend verkomplizieren | 2026-08-27 |
| Bewertungen sind bis zum Abschluss des **Events** änderbar, nicht nur bis zum Rundenende | Verzeiht Fehleingaben und erlaubt es, eine verpasste Runde nachzutragen. Die ursprüngliche Anforderung war an dieser Stelle widersprüchlich und wurde so aufgelöst | 2026-08-27 |
| Whiskies können nur vor dem Start eingetragen werden | Klare, unmissverständliche Regel. Nachträgliches Einfügen würde die bereits festgelegte Reihenfolge und die Positionsnummern durcheinanderbringen | 2026-08-27 |
| Der Gastgeber darf einen Whisky mehr als das Limit einbringen | Gelebte Praxis der Runde als Bonus für die Ausrichtung des Abends | 2026-08-27 |
| Der Video-Link liegt bei den geheimen Whisky-Daten | Eine Video-Adresse enthält den Whisky-Namen und würde die Blindverkostung genauso brechen wie das Namensfeld selbst | 2026-08-27 |
| Höchstens ein Tasting gleichzeitig aktiv | Macht „das aktuelle Tasting" auf dem Dashboard eindeutig und erspart eine Event-Auswahl am Abend. Events in Vorbereitung bleiben unbegrenzt | 2026-08-27 |
| Rangliste erst nach Abschluss, nie als Zwischenstand | Ein Teilnehmer sieht vorher nur seine eigenen Punkte. Eine daraus gebildete Summe sähe aus wie ein echtes Ergebnis, wäre aber falsch — das ist schädlicher als gar kein Ergebnis | 2026-08-27 |
| Rangliste als Summe, nicht als Durchschnitt | Ausdrücklich so gewünscht. Bekannter Nachteil: Wer eine Runde verpasst, kostet „seinem" Whisky bis zu 15 Punkte. Deshalb wird die Anzahl der Bewertungen immer mit ausgewiesen | 2026-08-27 |
| Ausscheidende Mitglieder werden stillgelegt statt gelöscht | Sonst würde sich die Rangliste eines abgeschlossenen Tastings rückwirkend ändern. Weicht bewusst von der Projektregel „Fremdschlüssel mit Löschweitergabe" ab | 2026-08-27 |
| Keine E-Mail-Adresse in der Profiltabelle | Zugriffsregeln wirken zeilenweise, Spaltenrechte gelten für die ganze Rolle. Jede Regel, die dem Admin E-Mails zeigt, zeigt sie auch allen Teilnehmern. Die Adresse bleibt daher in der Benutzerverwaltung von Supabase | 2026-08-27 |
| **Minimaler Seed: nur Admin und ein Testkonto, keine Beispiel-Events** | Ausdrücklich so gewünscht. Konsequenz: Die Prüfung der Zugriffsregeln legt sich ihre Testdaten selbst an, statt auf Seed-Daten aufzusetzen — das macht die Tests unabhängiger und wiederholbar. Zweite Konsequenz: Dashboard und Rangliste lassen sich erst ab PROJ-4 an echten Daten ansehen | 2026-08-27 |
| **Beide Seed-Konten erhalten ein Entwicklungs-Passwort** | Ausdrücklich so gewünscht, macht das Entwickeln und automatisierte Anmelden einfacher. Auflagen: Das Passwort wird nirgends als echtes Passwort wiederverwendet, das Seed-Skript läuft nur gegen die Entwicklungsumgebung, und vor dem ersten echten Tasting wird das Admin-Passwort geändert | 2026-08-27 |

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
