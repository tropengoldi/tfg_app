# PROJ-1: Supabase-Infrastruktur

## Status: Architected
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

| Decision | Rationale | Date |
|----------|-----------|------|
| Blindheit über zwei getrennte Tabellen (`whiskies` sichtbar / `whisky_details` geheim) statt über Spaltenrechte oder eine geheime Sicht | Die Zugriffsregeln von PostgreSQL wirken zeilenweise, nicht spaltenweise. „Name für den Bringer und den Gastgeber sichtbar, für alle anderen erst nach Abschluss" ist damit als Spaltenregel nicht ausdrückbar, als Zeilenregel auf einer zweiten Tabelle dagegen mühelos. Eine geheime Sicht schied aus, weil Live-Updates auf Sichten nicht funktionieren | 2026-08-27 |
| `brought_by` (wer den Whisky mitgebracht hat) liegt in der geheimen Tabelle | Wer weiß, wessen Whisky an Position 3 steht, hat die Blindheit halb gebrochen | 2026-08-27 |
| Anlage- und Änderungszeitpunkte der sichtbaren Whisky-Tabelle werden Teilnehmern entzogen | Über die Reihenfolge der Eingaben ließe sich sonst erschließen, wer welchen Whisky gebracht hat | 2026-08-27 |
| Zustand des Abends steht als zwei Felder am Event (Status + aktuelle Position), nicht als Status pro Whisky | Ein Rundenwechsel ist damit die Änderung einer einzigen Zeile → genau eine Live-Benachrichtigung pro Gerät. Der Glas-Fortschritt ergibt sich rechnerisch aus der Position, es gibt keinen zweiten Wahrheitsort, der auseinanderlaufen kann | 2026-08-27 |
| Alle Zustandsübergänge (Event starten, Runde abschließen, Event abschließen, Reihenfolge setzen, Whisky anlegen/entfernen, Teilnehmerliste setzen) laufen über benannte Datenbank-Aktionen (RPCs), nicht über direkte Schreibzugriffe | Ein gültiger Übergang ist eine Prüfung über den alten *und* den neuen Zustand plus eine Zählung („nächste Position darf die Whisky-Anzahl nicht überschreiten") und muss zusätzlich festlegen, welche Felder sich ändern dürfen. Zeilenregeln allein können das nicht. Die Aktion bündelt Berechtigung, Zulässigkeit, Gleichzeitigkeits-Schutz und Zeitstempel an einer prüfbaren Stelle | 2026-08-27 |
| Der Gastgeber bekommt gar kein direktes Schreibrecht auf die Event-Tabelle | Zeilenregeln können nicht einschränken, *welche* Spalten geschrieben werden — mit Schreibrecht könnte der Gastgeber aus dem Browser heraus `host_id` oder `status` umschreiben. Stattdessen: Schreibrechte komplett entzogen, alles über RPCs | 2026-08-27 |
| „Runde abschließen" nimmt die erwartete aktuelle Position als Parameter entgegen | Optimistische Sperre gegen Doppel-Tap: Löst der Gastgeber die Aktion auf zwei Geräten aus, greift nur die erste, die zweite wird wirkungslos statt zum Doppelsprung | 2026-08-27 |
| Kein Zugriffs-Prädikat verweist direkt auf eine andere Tabelle; jede tabellenübergreifende Prüfung läuft über eine Helfer-Funktion | Eine Regel auf der Teilnehmer-Tabelle, die die Teilnehmer-Tabelle abfragt, erzeugt eine Endlosschleife (Fehler 42P17) — ebenso der Zyklus Event → Teilnehmer → Event. Die Helfer laufen mit erhöhten Rechten und brechen den Zyklus beim ersten Sprung ab | 2026-08-27 |
| Admin-Erkennung per Datenbank-Lookup, nicht über einen Token-Claim | Ein Claim im Anmelde-Token ist bis zur nächsten Erneuerung (bis zu 1 Stunde) veraltet. Bei rund zehn Profilen ist der Lookup ein einzelner Index-Treffer pro Abfrage | 2026-08-27 |
| Schutz vor Selbst-Beförderung zum Admin über ein Spaltenrecht, nicht über eine Zeilenregel | Eine Zeilenregel kann nicht verhindern, dass jemand in seiner *eigenen* Profilzeile die Rolle ändert. Das Schreibrecht wird daher auf die unkritischen Profilfelder (Anzeigename, Bio, Lieblings-Dram, Lieblingsregion, Avatar) eingegrenzt; Rolle und Aktiv-Status bleiben außen vor. Einzige Stelle, an der Rechtetrennung über ein Spaltenrecht statt über eine Zeilenregel läuft | 2026-08-27 |
| Rangliste und Historie als Datenbank-Sichten, die hart auf abgeschlossene Events gefiltert sind und mit den Rechten des Abfragenden laufen | Der scheinbare Widerspruch („fremde Einzelbewertungen unsichtbar, Rangliste aggregiert genau die") löst sich auf, weil beide Sichtbarkeiten im selben Moment kippen — beim Abschluss. Der harte Filter verhindert den gefährlicheren Fall: ein unvollständiges Aggregat aus nur den eigenen Bewertungen, das wie ein echtes Zwischenergebnis aussieht | 2026-08-27 |
| Live-Updates nur für die Event-Tabelle und die sichtbare Whisky-Tabelle freigegeben, nicht für Bewertungen und Whisky-Details | So wandert kein Geheimnis je über einen Live-Kanal. Die Auflösung beim Abschluss ist ein Nachladen: Die Event-Änderung kommt an, die Seite lädt ihre Daten neu, und erst dann geben die Regeln die Namen frei | 2026-08-27 |
| Vier getrennte Supabase-Zugänge im Code (Browser, Server, Session-Auffrischung, Verwaltung) | Jeder Kontext hat andere Anforderungen an Cookie-Handling und Rechte. Der Verwaltungs-Zugang mit dem mächtigen Service-Schlüssel wird in genau einer Datei angelegt und in diesem Feature noch nirgends benutzt | 2026-08-27 |
| Schema wird als versionierte Migrationsdateien im Repo geführt (`supabase/migrations/`) | Nachvollziehbarkeit und Wiederholbarkeit: Die Datenbank lässt sich aus dem Repo neu aufbauen, Änderungen sind in der Git-Historie sichtbar, `/qa` und spätere Features setzen auf einem definierten Stand auf | 2026-08-27 |
| TypeScript-Typen werden aus dem laufenden Schema generiert, nicht von Hand gepflegt | Die Typen bleiben automatisch deckungsgleich mit der Datenbank; ein Schema-Fehler fällt beim Bauen auf statt zur Laufzeit | 2026-08-27 |
| Fehlercodes der Datenbank werden in einer eigenen Datei auf deutsche Meldungen abgebildet | Die Zustands-Aktionen melden Konflikte über PostgreSQL-Fehlercodes (z. B. „Runde bereits weitergeschaltet"). Die Übersetzung an einer Stelle hält die Meldungen konsistent und die Aktionen frei von UI-Text | 2026-08-27 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> **Für PMs in einem Satz:** Dieses Feature baut keine Oberfläche. Es legt die Datenbank an
> und — der eigentliche Kern — die Regeln, die dafür sorgen, dass niemand vor dem Abschluss
> sehen kann, welcher Whisky im Glas ist oder wie andere bewerten. Diese Regeln liegen in
> der Datenbank, nicht im Browser, und lassen sich deshalb nicht durch einen Blick in die
> Entwicklerkonsole aushebeln.

### 1. Was gebaut wird (Überblick)

```
Datenbank (Supabase / PostgreSQL)
├── 5 Tabellen            Profile, Events, Event-Teilnehmer, Whiskies (sichtbar),
│                         Whisky-Details (geheim), Bewertungen
├── Zugriffsregeln        auf jeder Tabelle, für jede Operation (Lesen/Anlegen/Ändern/Löschen)
├── 6 Helfer-Funktionen   beantworten "ist Admin?", "ist Teilnehmer?", "ist Gastgeber?",
│                         "ist das Event abgeschlossen?" — einmal zentral statt überall neu
├── ~9 benannte Aktionen  jeder Zustandswechsel des Abends (starten, Runde weiter, abschließen,
│                         Reihenfolge setzen, Whisky anlegen/entfernen, Teilnehmerliste)
├── 2 Sichten             Rangliste (nach Abschluss) und Liste vergangener Tastings
└── Live-Freigabe         nur Event- und Whisky-Tabelle senden Änderungen an alle Geräte

Code im Repo
├── supabase/migrations/  das Schema als versionierte Dateien
├── src/lib/supabase/     vier Zugänge: Browser, Server, Session-Auffrischung, Verwaltung
├── src/lib/supabase/types.ts   automatisch aus dem Schema erzeugte TypeScript-Typen
└── src/lib/errors.ts     Datenbank-Fehlercodes → deutsche Meldungen

Seed-Daten
└── Admin-Konto (deine E-Mail) + ein Testkonto, beide mit Entwicklungs-Passwort.
    Keine Beispiel-Events (bewusst — siehe Decision Log).
```

**Keine** UI-Komponenten, **keine** Seiten, **keine** API-Routen entstehen hier. Der
Service-Schlüssel (mächtiger Verwaltungszugang) wird zwar als Datei angelegt, aber in diesem
Feature noch nirgends verwendet.

### 2. Datenmodell (in Alltagssprache)

**Profil** — eine Zeile pro Person in der Runde
- Anzeigename, Rolle (Admin oder Teilnehmer), Aktiv-Status (still­gelegt statt gelöscht)
- Kurzbeschreibung, Lieblings-Dram, Lieblingsregion, Avatar
- **Keine E-Mail-Adresse** — die bleibt in der Benutzerverwaltung von Supabase, weil jede
  Regel, die dem Admin E-Mails zeigt, sie auch allen Teilnehmern zeigen würde

**Tasting-Event** — eine Zeile pro Abend
- Datum, Ort, Thema, Info zum Essen, Anmerkungen des Gastgebers
- Gastgeber, wer es angelegt hat, maximale Whisky-Zahl pro Person
- Status (in Vorbereitung / läuft / abgeschlossen), aktuelle Position, Start- und Abschlusszeit
- Höchstens **ein** Event darf gleichzeitig „läuft" sein — von der Datenbank erzwungen

**Event-Teilnehmer** — verbindet Event und Profil, eine Zeile pro eingeladener Person

**Whisky (sichtbar)** — eine Zeile pro Whisky des Abends
- Nur Event-Zugehörigkeit und Position („Whisky 3 von 8")
- Das ist alles, was ein Teilnehmer während des Tastings sieht
- Positionen sind lückenlos und eindeutig — von der Datenbank erzwungen

**Whisky-Details (geheim)** — die zweite Hälfte desselben Whiskys, streng abgeschirmt
- Name, Destillerie, Region, Alter, Stärke, Fasstyp, Abfüller, Preis
- Eigene Notizen des Bringers, **Link zum Verkostungsvideo**
- Wer den Whisky mitgebracht hat
- Sichtbar nur für den Bringer und den Gastgeber — für alle anderen erst nach Abschluss
- Strukturell an den sichtbaren Whisky gekoppelt: ein Detaileintrag kann gar nicht zu einem
  anderen Event gehören als sein Whisky

**Bewertung** — eine Zeile pro Person pro Whisky
- Nasenpunkte 1–5, Geschmackspunkte 1–10, Gesamtpunkte (automatisch die Summe), Notizen
- Genau eine Bewertung pro Person und Whisky — erneutes Speichern überschreibt
- Punktebereiche von der Datenbank erzwungen, nicht nur vom Formular

**Rangliste (Sicht)** — pro Whisky Gesamt-, Nasen- und Geschmackssumme, Anzahl abgegebener
Bewertungen, Rang. Liefert **nur bei abgeschlossenen Events** Daten. Gleichstand: erst
Geschmack, dann Nase, dann Ausschankposition.

**Vergangene Tastings (Sicht)** — Datum, Gastgeber, Sieger-Whisky je abgeschlossenem Event.

### 3. Wer darf was sehen (die Kernregel des Produkts)

| Wer | Sichtbare Whisky-Liste | Whisky-Details (Namen) | Bewertungen | Rangliste |
|-----|------------------------|------------------------|-------------|-----------|
| Teilnehmer, Event läuft | alle (nur Position) | **nur die eigenen** | **nur die eigenen** | **nichts** |
| Gastgeber, Event läuft | alle | **alle** (er schenkt aus) | **nichts** (auch er nicht) | **nichts** |
| Teilnehmer, Event abgeschlossen | alle | alle | alle | vollständig |
| Nicht-Teilnehmer | nichts | nichts | nichts | nichts |
| Admin | alle | alle | alle | vollständig |

Für „6 von 7 haben bewertet" ruft der Gastgeber eine eigene Aktion auf, die **nur Zählwerte**
zurückgibt — nie Punkte, nie Namen.

### 4. Warum die Zwei-Tabellen-Aufteilung bei den Whiskies

Die Zugriffsregeln von PostgreSQL entscheiden pro *Zeile*, nicht pro *Spalte*. Die Anforderung
„das Namensfeld sehen nur Bringer und Gastgeber, die Positionsangabe alle" lässt sich als
Spaltenregel nicht formulieren. Indem die geheimen Felder in einer **zweiten Tabelle** liegen,
wird die Geheimhaltung zu einer ganz normalen Zeilenregel. Der Link zum Verkostungsvideo liegt
mit in dieser geheimen Tabelle, weil eine Video-Adresse den Whisky genauso verrät wie sein Name.

Verworfen wurde eine „geheime Sicht" auf die Namen — auf Sichten funktionieren die Live-Updates
nicht, die das Dashboard später braucht.

### 5. Warum Zustandswechsel über benannte Aktionen laufen

„Runde weiterschalten" ist kein simpler Schreibvorgang. Es muss geprüft werden: Ist der
Aufrufer der Gastgeber? Läuft das Event? Gibt es überhaupt noch einen nächsten Whisky? Und es
muss verhindert werden, dass ein Doppel-Tap auf zwei Geräten die Runde zweimal weiterschaltet.
Solche Prüfungen über alten und neuen Zustand kann eine reine Zeilenregel nicht leisten. Jede
benannte Aktion bündelt Berechtigung, Zulässigkeit, Gleichzeitigkeits-Schutz und Zeitstempel
an einer Stelle, die sich testen lässt. Der Gastgeber hat deshalb **kein** direktes Schreibrecht
auf das Event — sonst könnte er aus dem Browser heraus Felder wie den Status umschreiben.

### 6. Live-Updates (Grundlage für das Dashboard in PROJ-8)

Nur die Event-Tabelle und die sichtbare Whisky-Tabelle senden Änderungen an alle Geräte.
Bewertungen und Whisky-Details bleiben bewusst außen vor — so kann kein Geheimnis über einen
Live-Kanal entweichen. Wenn der Gastgeber das Event abschließt, ändert sich eine Event-Zeile,
alle Geräte laden ihre Daten neu, und **erst dieses Neuladen** bringt die Namen zum Vorschein.

### 7. Neue Pakete

| Paket | Zweck |
|-------|-------|
| `@supabase/ssr` | Verbindet Supabase mit dem Server-Rendering von Next.js (Session in Cookies) — Voraussetzung für die vier Zugänge und für PROJ-2 |

`date-fns`, `@dnd-kit/*` und die shadcn-Komponenten `slider`/`calendar` aus dem
Implementierungsplan gehören zu späteren Features und werden dort installiert, nicht hier.

### 8. Manuelle Schritte außerhalb des Codes (gehören in die Abnahme)

1. **Supabase → Auth → Providers → Email:** „Allow new users to sign up" = **OFF**
2. **Supabase → Auth → Providers:** „Allow anonymous sign-ins" = **OFF**
3. Alten Supabase Personal Access Token im Dashboard widerrufen (siehe Open Questions)

Kein Code im Repo kann diese drei erzwingen — `/qa` prüft sie manuell.

### 9. Wie der Erfolg geprüft wird

Die Sichtbarkeitsmatrix aus Abschnitt 3 wird als ausführbare Testsuite umgesetzt: zwei
gleichzeitig angemeldete Test-Nutzer, die reihum versuchen, aufeinander zuzugreifen, mit
Prüfungen auf „0 Zeilen" bzw. „Fehlercode X". Zusätzlich läuft nach der Migration die
Sicherheits- und Performance-Prüfung von Supabase und muss ohne Befund durchlaufen.
`npm run build` und `npm run lint` müssen sauber sein — der aktuell defekte Supabase-Import
mit dem doppelten Export wird dabei ersetzt.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
