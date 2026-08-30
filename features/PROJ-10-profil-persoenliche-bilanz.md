# PROJ-10: Profil-Seite mit persönlicher Bilanz

## Status: Planned
**Created:** 2026-08-30
**Last Updated:** 2026-08-30

## Dependencies
- **Requires: PROJ-9 (Ergebnisse & Tasting-Historie)** — die Bilanz-Kennzahlen
  „beste Platzierung" und „Ø vergebene Punkte" lesen die Ranglisten-View
  `whisky_rankings` (nur abgeschlossene Events, seit PROJ-9 für jedes aktive
  Mitglied lesbar).
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — Login, App-Shell mit
  „Profil"-Tab, `requireUser`. Die Platzhalter-Seite `/profil` stammt von hier.
- **Baut auf PROJ-1** — die `profiles`-Tabelle (`display_name`, `favorite_dram`,
  `favorite_region`, `bio` samt CHECK-Constraints), die RLS-Policy
  `profiles_update_own` und der Spalten-GRANT, der genau diese vier Felder
  schreibbar macht. `event_participants`, `whisky_details`, `ratings` für die
  Bilanz-Zählungen.

## Kontext

Die Profil-Seite ist der einzige Ort, an dem ein Mitglied **seine eigenen
Stammdaten** pflegt — Anzeigename, Lieblings-Dram, Lieblingsregion, eine kurze
Selbstbeschreibung — und **seine persönliche Bilanz** über alle bisherigen Abende
sieht: wie viele Tastings, wie viele mitgebrachte Whiskys, die beste Platzierung
und der Schnitt der selbst vergebenen Punkte.

Heute ist `/profil` ein Platzhalter (Name · E-Mail · Rolle · „Abmelden"). PROJ-10
ersetzt ihn durch ein bearbeitbares Formular plus eine Bilanz-Karte. E-Mail,
Rolle und der „Abmelden"-Knopf bleiben als reine Anzeige erhalten.

Die Bilanz ist **rein persönlich** — sie vergleicht nichts mit anderen Mitgliedern
und rechnet nur über **abgeschlossene** Tastings, damit ein laufender Abend die
Zahlen nicht mitten im Tasting verschiebt.

## User Stories

- Als **Mitglied** möchte ich meinen Anzeigenamen ändern können, damit ich in
  Teilnehmerlisten und Ranglisten so heiße, wie ich möchte.
- Als **Mitglied** möchte ich meinen Lieblings-Dram, meine Lieblingsregion und
  eine kurze Beschreibung hinterlegen, damit die Runde mich besser einordnen kann.
- Als **Mitglied** möchte ich auf einen Blick sehen, an wie vielen Tastings ich
  teilgenommen und wie viele Whiskys ich mitgebracht habe.
- Als **Mitglied** möchte ich meine beste Platzierung sehen — welcher meiner
  Whiskys wie weit vorne lag — damit ich weiß, womit ich die Runde überzeugt habe.
- Als **Mitglied** möchte ich den Schnitt der von mir vergebenen Punkte sehen,
  damit ich einschätzen kann, ob ich eher milde oder streng bewerte.
- Als **neues Mitglied** möchte ich eine verständliche Profilseite vorfinden,
  auch wenn ich noch an keinem Tasting teilgenommen habe.

## Out of Scope

- **Fremde Profile ansehen** — PROJ-10 zeigt und bearbeitet nur das eigene
  Profil. Eine Ansicht fremder Profile (z. B. aus der Teilnehmerliste) ist ein
  eigener Screen für ein späteres Feature.
- **Avatar / Foto** — PRD-Non-Goal „keine Fotos oder Datei-Uploads". Kein
  Upload, auch kein `avatar_url`-URL-Textfeld (würde nirgends angezeigt).
- **E-Mail oder Passwort ändern** — Auth-Thema (PROJ-2). Die E-Mail steht hier
  nur als nicht editierbare Anzeige.
- **Rolle ändern** — macht der Admin (PROJ-3). Die Rolle ist reine Anzeige.
- **Runden-übergreifende Vergleiche** — kein „du bewertest härter als der
  Schnitt", keine Mitglieder-Rangliste. Nur die eigenen vier Kennzahlen.
  (PRD-Non-Goal.)
- **Verlaufsdiagramme / Zeitreihen** — keine Kurve „Ø-Punkte über die Jahre",
  nur die aktuellen Werte.
- **Aufschlüsselung / Absprünge aus der Bilanz** — kein Klick von „3 Tastings"
  auf eine Liste; die beste Platzierung nennt den einen Abend, mehr nicht.
  Absprünge in die Historie macht PROJ-9.
- **Konto deaktivieren oder löschen** — nicht vorgesehen.
- **Bearbeitbare Kennzahlen** — die Bilanz ist berechnet, nichts daran ist
  eingebbar.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Stammdaten bearbeiten

- [ ] Angenommen ein Mitglied öffnet `/profil`, wenn die Seite lädt, dann sind
      die Felder Anzeigename, Lieblings-Dram, Lieblingsregion und Kurzbeschreibung
      mit den gespeicherten Werten vorbefüllt; E-Mail und Rolle stehen als nicht
      editierbare Anzeige daneben.
- [ ] Angenommen ein Mitglied ändert einen oder mehrere Werte, wenn es auf
      „Speichern" tippt, dann werden die Werte gespeichert, es erscheint der
      Hinweis „Profil gespeichert." und die Seite zeigt die neuen Werte.
- [ ] Angenommen das Feld Anzeigename ist leer (oder nur Leerzeichen), wenn das
      Mitglied speichert, dann erscheint unter dem Feld „Anzeigename ist
      erforderlich" und nichts wird gespeichert.
- [ ] Angenommen ein Textfeld überschreitet sein Zeichenlimit (Anzeigename 80,
      Lieblings-Dram / Lieblingsregion 120, Kurzbeschreibung 500), wenn das
      Mitglied speichert, dann erscheint ein Zeichenlimit-Hinweis am Feld und
      nichts wird gespeichert.
- [ ] Angenommen ein optionales Feld wird geleert, wenn das Mitglied speichert,
      dann wird das Feld als „nicht gesetzt" gespeichert (nicht als leerer Text).
- [ ] Angenommen der Speichervorgang läuft, wenn das Mitglied erneut auf
      „Speichern" tippt, dann bleibt der Button gesperrt / zeigt „Wird
      gespeichert…" und es wird nicht doppelt gespeichert.
- [ ] Angenommen das Speichern schlägt fehl (Netz/Server), wenn der Fehler
      eintritt, dann bleibt die Eingabe im Formular erhalten und es erscheint
      eine Fehlermeldung.
- [ ] Angenommen ein Mitglied hat seinen Anzeigenamen geändert, wenn danach ein
      abgeschlossenes Tasting oder eine Teilnehmerliste geöffnet wird, dann steht
      dort der neue Name (rückwirkend, kein Schnappschuss).

### Persönliche Bilanz

- [ ] Angenommen ein Mitglied war an N abgeschlossenen Tastings als Teilnehmer
      eingetragen, wenn es die Bilanz betrachtet, dann zeigt „Anzahl Tastings"
      die Zahl N (laufende und vorbereitete Events zählen nicht mit).
- [ ] Angenommen ein Mitglied hat zu abgeschlossenen Tastings M Whiskys
      mitgebracht, wenn es die Bilanz betrachtet, dann zeigt „Mitgebrachte
      Whiskys" die Zahl M.
- [ ] Angenommen mindestens einer der mitgebrachten Whiskys eines Mitglieds
      wurde in einem abgeschlossenen Tasting platziert, wenn es die Bilanz
      betrachtet, dann zeigt „Beste Platzierung" den besten je erreichten Rang
      als „{n}. Platz" samt Whisky-Name und Datum des Abends; bei mehreren gleich
      guten Rängen der jüngste Abend.
- [ ] Angenommen ein Mitglied hat noch nie einen Whisky zu einem abgeschlossenen
      Tasting mitgebracht, wenn es die Bilanz betrachtet, dann steht bei „Beste
      Platzierung" „noch keine Platzierung".
- [ ] Angenommen ein Mitglied hat in abgeschlossenen Tastings insgesamt K
      Bewertungen abgegeben, wenn es die Bilanz betrachtet, dann zeigt „Ø
      vergebene Punkte" das Mittel der Gesamtpunkte (Nase + Geschmack) mit einer
      Nachkommastelle und Komma (z. B. „Ø 11,4") sowie klein „aus K Bewertungen".
- [ ] Angenommen ein Mitglied hat noch keine Bewertung in einem abgeschlossenen
      Tasting abgegeben, wenn es die Bilanz betrachtet, dann steht bei „Ø
      vergebene Punkte" „—".
- [ ] Angenommen ein neu eingeladenes Mitglied ohne abgeschlossenes Tasting
      öffnet `/profil`, wenn die Bilanz lädt, dann zeigt sie „0" bzw. „—"
      /„noch keine Platzierung" und darüber den Hinweis „Deine Bilanz füllt sich,
      sobald dein erstes Tasting abgeschlossen ist." (keine leere Karte, kein
      Fehler).
- [ ] Angenommen die Bilanz-Daten lassen sich nicht laden (View-/DB-Fehler),
      wenn das Mitglied `/profil` öffnet, dann bleibt das Formular bedienbar und
      nur die Bilanz-Karte zeigt „Bilanz gerade nicht verfügbar".

## Edge Cases

- **Nur-Leerzeichen-Anzeigename** → wird getrimmt; danach leer ⇒ „Anzeigename
  ist erforderlich".
- **Trailing-Whitespace in optionalen Feldern** → beim Speichern getrimmt.
- **Feld über Limit trotz Client-`maxlength`** → DB-CHECK greift, Server Action
  meldet verständlich, nichts wird gespeichert.
- **Speichern schlägt fehl** → Fehlermeldung, Eingaben bleiben stehen.
- **Dasselbe Profil in zwei Tabs** → letzter Speichervorgang gewinnt, kein
  Konflikt-Dialog (Ein-Personen-Seite).
- **Bilanz-View wirft, Formular lädt** → Seite bleibt nutzbar, nur die
  Bilanz-Karte zeigt den Fehlerhinweis.
- **Anzeigename ändern, während ein Tasting läuft** → erlaubt; der Name wechselt
  sofort überall (auch im laufenden Abend), die Bilanz-Zahlen bewegt es nicht
  (die zählen nur abgeschlossene Events).
- **Mitglied wurde deaktiviert** → kommt gar nicht bis `/profil` (`requireUser`
  leitet auf die Abmelde-Route).
- **Ein mitgebrachter Whisky in einem Tasting ganz ohne Bewertungen** → er hat
  in der Ranglisten-View trotzdem einen Rang (0 Punkte); er zählt bei
  „Mitgebrachte Whiskys" mit und kann theoretisch die „beste Platzierung"
  stellen. (Siehe Open Questions.)

## Technical Requirements (optional)

- **Sicherheit:** Login erforderlich. Schreiben nur die eigene Zeile
  (`profiles_update_own` + Spalten-GRANT auf genau die vier Felder — `role` /
  `is_active` sind darüber nicht erreichbar). Kein Selbst-Upgrade zum Admin.
- **Validierung:** clientseitig (Zod + `maxlength`) **und** serverseitig; die
  DB-CHECKs sind die letzte Instanz.
- **Darstellung:** mobile-first, eine Spalte ab 375 px. Die Bilanz-Kennzahlen
  groß und in der Display-Schrift (Design-System: „Punktzahlen sind der Held").
- **Performance:** reine Lesezugriffe für die Bilanz; Serverkomponente, kein
  Client-Fetch-Wasserfall.
- **Browser:** Chrome, Firefox, Safari (mobil priorisiert).

## Open Questions

- [ ] Zählt ein mitgebrachter Whisky aus einem Tasting **ganz ohne Bewertungen**
      bei „Mitgebrachte Whiskys" / „Beste Platzierung" mit? (Vorschlag: ja bei
      „Mitgebrachte Whiskys"; bei „Beste Platzierung" nur Ränge aus Tastings, in
      denen überhaupt bewertet wurde — sonst wäre ein „1. Platz" ohne jede
      Bewertung irreführend. Für `/architecture` zu präzisieren.)
- [ ] Braucht die Bilanz eine eigene DB-View / RPC, oder lässt sie sich aus
      wenigen gezielten Lesezugriffen auf `event_participants` /
      `whisky_details` / `whisky_rankings` / `ratings` zusammensetzen?
      (Architektur-Frage.)
- [ ] „Ø vergebene Punkte" — einfacher Mittelwert über alle Bewertungszeilen,
      oder erst je Tasting mitteln und dann über die Tastings? (Vorschlag:
      einfacher Mittelwert über alle Zeilen — verständlicher.)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Alle vier Bilanz-Kennzahlen rechnen nur über **abgeschlossene** Tastings | Ein laufender Abend soll die Zahlen nicht mitten im Tasting verschieben; deckt sich mit der Ranglisten-View, die ohnehin nur abgeschlossene Events kennt | 2026-08-30 |
| „Ø vergebene Punkte" = **eine** Zahl (Mittel der Gesamtpunkte), eine Nachkommastelle mit Komma, dazu „aus K Bewertungen"; 0 Bewertungen → „—" | Gesamtpunkte sind auch in der Rangliste die Leitzahl; getrenntes Nase-/Geschmack-Ø ist mehr Statistik als die Runde braucht | 2026-08-30 |
| „Beste Platzierung" als „{n}. Platz" + Whisky-Name + Datum; bei Gleichstand der jüngste Abend; nie mitgebracht → „noch keine Platzierung" | Die Kontextzeile macht die Zahl greifbar („womit habe ich überzeugt"), ohne einen zweiten Screen zu brauchen | 2026-08-30 |
| Vier bearbeitbare Felder: `display_name` (Pflicht 1–80), `favorite_dram` (≤120), `favorite_region` (≤120), `bio` (≤500). **Kein Avatar** | Genau die Felder, die der Spalten-GRANT schreibbar macht; PRD-Non-Goal schließt Foto-Uploads aus; ein `avatar_url`-Feld hätte keine Darstellung | 2026-08-30 |
| E-Mail und Rolle bleiben als nicht editierbare Anzeige, „Abmelden" bleibt | E-Mail-Wechsel ist Auth-Thema (PROJ-2), Rolle setzt der Admin (PROJ-3); die Seite bleibt der eine Ort für „wer bin ich hier" | 2026-08-30 |
| Nur das **eigene** Profil ansehen/bearbeiten; keine fremden Profile | Fremdansicht ist ein eigener Screen mit eigenen Sichtbarkeitsfragen — späteres Feature, nicht der P2-MVP | 2026-08-30 |
| Anzeigename ändert sich **rückwirkend überall**, kein Schnappschuss pro Event | Kleine, vertraute Runde; wer sich umbenennt, will auch in der Historie so heißen | 2026-08-30 |
| Speichern: Server Action → direkter `profiles`-Update, Toast, Inline-Validierung, Button-Sperre während des Speicherns; letzter Schreibvorgang gewinnt | Gleiches Muster wie Eckdaten (PROJ-6) / Bewertung (PROJ-7); Konflikt-Dialog bei einer Ein-Personen-Seite unnötig | 2026-08-30 |
| Neues Mitglied: Bilanz-Karte zeigt Nullwerte + Hinweis statt ausgeblendet zu sein | Kein Rätselraten, warum die Karte fehlt; der Hinweis erklärt, wann sie sich füllt | 2026-08-30 |
| Bilanz-Ladefehler blockiert die Seite nicht — nur die Karte zeigt „nicht verfügbar" | Das Bearbeiten der Stammdaten muss auch dann gehen, wenn die Auswertungs-Reads klemmen | 2026-08-30 |
| Optionale Felder leer → als NULL speichern, nicht als leerer String | Saubere Daten; „nicht gesetzt" und „leer eingegeben" sind dasselbe | 2026-08-30 |

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
