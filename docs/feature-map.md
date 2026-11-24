# Feature Map

> Ausgelagert aus `features/INDEX.md`: Beschreibung, Priorität und Abhängigkeiten aller Features
> sowie die Begründungen der Aufteilung. Status steht weiterhin in `features/INDEX.md`.


Empfohlene Baureihenfolge: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10**.
Sie folgt dem Datenlebenszyklus, damit jedes Feature gegen echte Daten des Vorgängers
end-to-end testbar ist — die Bewertungsansicht lässt sich nicht sinnvoll prüfen, bevor
Whiskies existieren und eine Runde läuft.

| ID | Feature | Beschreibung | Prio | Abhängig von |
|----|---------|--------------|------|--------------|
| **PROJ-1** | **Supabase-Infrastruktur** | Datenbankschema, Constraints, Indizes, RLS-Policies und Helper-Funktionen, RPCs für alle Zustandsübergänge, Ranglisten-Views, Realtime-Publication, Seed-Daten (Admin + Testteilnehmer + Beispiel-Event), generierte TypeScript-Typen, Supabase-Clients | P0 | – |
| **PROJ-2** | **Auth & Zugangskontrolle** | Login, Passwort setzen und zurücksetzen, SSR-Session-Middleware, App-Shell mit Bottom-Navigation, Rollenprüfungen für Admin- und Gastgeber-Bereiche, öffentliche Registrierung gesperrt | P0 | PROJ-1 |
| **PROJ-3** | **Admin – Teilnehmerverwaltung** | Teilnehmer per E-Mail einladen, auflisten und deaktivieren | P0 | PROJ-2 |
| **PROJ-4** | **Admin – Tasting-Events verwalten** | Event anlegen und bearbeiten: Gastgeber, Datum, Ort, Teilnehmerliste, maximale Anzahl Whiskies pro Person (Gastgeber darf einen mehr), Thema | P0 | PROJ-3 |
| **PROJ-5** | **Whisky-Erfassung (blind)** | Teilnehmer trägt die von ihm mitgebrachten Whiskies ein inkl. optionalem Link zum Verkostungsvideo; Limitprüfung mit Gastgeber-Bonus; nur der Bringer und der Gastgeber sehen die Details | P0 | PROJ-4 |
| **PROJ-6** | **Gastgeber-Steuerung & Ablauf** | Eckdaten des Abends (Thema, Essen, Anmerkungen), Ausschankreihenfolge per Drag & Drop, Event starten, Runde abschließen, Event abschließen | P0 | PROJ-5 |
| **PROJ-7** | **Bewertungsansicht** | Nasenpunkte 1–5 und Geschmackspunkte 1–10 per Slider, optionale Notizen, änderbar bis zum Abschluss des Events | P0 | PROJ-6 |
| **PROJ-8** | **Tasting-Dashboard mit Live-Sync** | Eckdaten, Teilnehmerliste, Whiskyglas-Fortschritt, Absprünge zu Bewertung/Gastgeber/Historie, Realtime-Aktualisierung aller Geräte beim Rundenwechsel | P0 | PROJ-7 |
| **PROJ-9** | **Ergebnisse & Tasting-Historie** | Rangliste nach Abschluss (Gesamt-, Nasen-, Geschmackspunkte) mit Link zum Verkostungsvideo je Whisky, Liste vergangener Tastings mit Datum, Gastgeber und Sieger-Whisky, Detailansicht | P1 | PROJ-7 |
| **PROJ-10** | **Profil-Seite mit persönlicher Bilanz** | Eigene Daten bearbeiten (Anzeigename, Lieblings-Dram, Lieblingsregion, Kurzbeschreibung) plus persönliche Bilanz: Anzahl Tastings, mitgebrachte Whiskies, beste Platzierung, Ø vergebene Punkte | P2 | PROJ-9 |
| **PROJ-11** | **Neutraler Helfer pro Event** | Optionale Rolle je Event: eine Person, die selbst nicht mitverkostet, aber Einblick in die geheimen Whisky-Details hat und den Ablauf steuern darf (Ausschankreihenfolge festlegen, Runden weiterschalten u. ä.). Ist ein Helfer für ein Event benannt, hat der Gastgeber dieses Abends nur noch die Einblicke eines normalen Teilnehmers (er verkostet dann blind mit). Betrifft Rollen-/Berechtigungsmodell (RLS, Helper-Funktionen), Event-Anlage (PROJ-4) und Gastgeber-Steuerung (PROJ-6). | P2 | PROJ-6 |
| **PROJ-12** | **App-Icon & Homescreen** | Icon-Set für „Zum Startbildschirm hinzufügen" auf dem Handy: Web-App-Manifest (`manifest.webmanifest`), `apple-touch-icon`, Favicon-Varianten, `theme-color`. Kein Service-Worker / keine Offline-Fähigkeit (PRD-Non-Goal), nur das Icon + der Name auf dem Homescreen. | P2 | PROJ-2 |
| **PROJ-13** | **Marken-Auftritt (Whizzky)** | Bündelt zwei visuelle Änderungen an denselben Bausteinen (Auth-Layout, App-Shell-Header, `PageHeader`): (a) Haupt-Überschrift auf **„Whizzky"** mit kleinerer Unterzeile **„Treffpunkt feiner Geister"** statt „Whisky Tasting"; (b) ein dezentes, thematisch passendes Hintergrundbild in der Anmelde-Maske und hinter den Seiten-Überschriften. Rein Frontend, keine DB-Änderung. Assets liegen unter `public/`. | P2 | PROJ-2 |
| **PROJ-14** | **Profil sichtbar für andere** | Andere Teilnehmer können das Profil eines Nutzers read-only einsehen (Stammdaten + persönliche Bilanz aus PROJ-10). Jeder legt in seinem eigenen Profil pro Feld fest, ob es für andere sichtbar ist. Betrifft Datenmodell/RLS (neue Sichtbarkeits-Flags) und die PROJ-10-Profilseite (neue Detailansicht für fremde Profile). | P2 | PROJ-10 |
| **PROJ-15** | **Persönliche Whisky-Datenbank** | Eigene Sammlung/Tasting-Log im Profilbereich, unabhängig von Events (Vivino-artig): Whiskies frei eintragen, eigene Bewertung/Notizen. Sichtbarkeit für andere Teilnehmer folgt denselben Einstellungen wie PROJ-14 — keine öffentliche, gemeinsame Datenbank und kein externer Katalog (das PRD-Non-Goal bleibt bestehen, siehe dort). | P2 | PROJ-14 |
| **PROJ-16** | **Nachrichten an Teilnehmer** | Mitglieder schreiben Nachrichten an andere Mitglieder — entweder an alle Teilnehmer eines bestimmten Tastings (Adressaten automatisch aus der Teilnehmerliste) oder frei an eine Auswahl aktiver Mitglieder. Erste Ausbaustufe per E-Mail-Versand, spätere Ausbaustufe als In-App-Push. | P2 | PROJ-4 |
| **PROJ-17** | **Web Push Benachrichtigungen für Nachrichten** | Ausbaustufe von PROJ-16: Empfänger einer Nachricht können zusätzlich zur E-Mail eine Push-Benachrichtigung auf ihrem Smartphone erhalten (Android & iOS), sofern sie die App als PWA zum Homescreen hinzugefügt und Push aktiviert haben. Web-Push-Standard (VAPID), kein Drittanbieter-Dienst, keine native App. | P2 | PROJ-16, PROJ-12 |
| **PROJ-18** | **Begriffe: Gaumenpunkte & Whisky-Steward** | Reine Umbenennung in allen sichtbaren Texten (UI, Fehlermeldungen, E-Mail-Texte, Doku): „Nase" → **„Nasenpunkte"**, „Geschmack" → **„Gaumenpunkte"**, „Helfer" → **„Whisky-Steward"**. DB-Bezeichner (`nose_points`, `taste_points`, `helper_id`) bleiben unverändert. Eine Migration ist nur zulässig, um sichtbare DB-Fehlermeldungen („Nur Gastgeber, Helfer oder Admin …") umzutexten — Weg entscheidet `/architecture`. | P1 | – |
| **PROJ-19** | **Flexible Punkteskala** | (a) **0 Punkte** werden erlaubt (Nasenpunkte 0–5, Gaumenpunkte 0–10). (b) Der Admin legt **pro Tasting** fest, ob in **1er- oder 0,5er-Schritten** bewertet wird; nach dem Start des Events nicht mehr änderbar. (c) Die private Sammlung (PROJ-15) bewertet **immer in 0,5er-Schritten** (0–10). Betrifft DB-Spaltentypen (Ganzzahl → Dezimal), die generierte Gesamtsumme, alle Ranglisten-Views, die Slider (PROJ-7) und die Bilanz-Durchschnitte (PROJ-10). | P1 | PROJ-18 |
| **PROJ-20** | **Whisky-Steward: Live-Einblick in Wertungen** | Ist für ein Tasting ein Steward benannt, sieht er **während** des Tastings alle Zwischenstände: abgegebene Einzelwertungen aller Teilnehmer **inkl. ihrer privaten Notizen**. Teilnehmer sehen in der Bewertungsansicht einen **Hinweis**, dass der Steward ihre Notizen lesen kann. Bricht bewusst die bisherige Zusage „fremde Notizen sind nie lesbar" (`whisky_score_breakdown` ohne `notes`) — nur für die Steward-Rolle, nur für sein Event. Die Blindheit der Verkoster bleibt unberührt. | P2 | PROJ-18 |
| **PROJ-21** | **Whisky-Steward bringt Whiskies mit** | Der Steward darf optional Whiskies für sein Tasting einreichen, obwohl er selbst nicht mitverkostet. Die Teilnehmer bewerten sie wie alle anderen. Offen für die Spec: welches Limit gilt für ihn (wie Teilnehmer / wie Gastgeber-Bonus) und wie erscheint er in Rangliste und Bilanz („mitgebrachte Whiskies"). | P2 | PROJ-18 |
| **PROJ-22** | **Sieger-Tipp & „Kenner der Woche"** | Während eines laufenden Tastings tippt jeder Teilnehmer blind („Whisky 3"), welcher Whisky gewinnt. Nach dem Abschluss werden alle mit richtigem Tipp als **„Kenner der Woche"** ausgewiesen — **im jeweiligen Tasting** (Ergebnisseite) und als **Zähler in der eigenen Profil-Bilanz** (PROJ-10/14). **Keine** Kenner-Rangliste über alle Tastings hinweg (PRD-Non-Goal bleibt). Tipps anderer bleiben bis zum Abschluss unsichtbar. | P2 | PROJ-19 |
| **PROJ-23** | **Vergleichs-Merker** | Privater Merker während des Tastings: Pro Whisky kann man per Mehrfachauswahl festhalten, mit welchen anderen Whiskies man ihn noch einmal direkt vergleichen möchte (z. B. „Whisky 2 ↔ 5"). Nur für einen selbst sichtbar. | P2 | – |
| **PROJ-24** | **Eigene Live-Rangliste** | Während des Tastings sieht jeder Teilnehmer seine **persönliche** Rangliste, berechnet nur aus den eigenen bisherigen Wertungen (blinde Nummern, keine Namen, keine fremden Punkte). | P2 | PROJ-19 |
| **PROJ-25** | **Erweiterte Ergebnis-Statistiken** | Nach dem Abschluss: (1) Rangliste zeigt die **Ausschank-Nummer** jedes Whiskys; (2) Rangliste zeigt je Whisky die **eigene Platzierung** des Betrachters; (3) **Vergleichsdiagramm** der Tasting-Whiskies über Gesamtplatzierung, Nasenpunkte, Gaumenpunkte, Alkoholgehalt und Alter (ohne Altersangabe: 3 Jahre angenommen, im Diagramm als „angenommen" markiert). Zusatzvorschläge für die Spec: **Preis-Leistungs-Sieger** (Punkte je Euro, nur wenn Preise erfasst sind — `price_eur` existiert bereits), **Konsens- vs. umstrittenster Whisky** (Streuung der Bewertungen), **Nase-/Gaumen-Diskrepanz** (größte Abweichung zwischen Nasen- und Gaumenrang), **persönliche Übereinstimmung** mit der Gesamtrangliste. Alles pro Tasting, keine Auswertung über die Runde hinweg. **Mit erledigen:** PROJ-19 BUG-2 (Historie zeigt „kein Sieger", wenn nur 0-Punkte vergeben wurden — Logik `winner_points > 0`) und BUG-1 (TS021-Meldung bei manipulierten Nachkommastellen). | P1 | PROJ-19 |
| **PROJ-26** | **Testkonten für normale Nutzer unsichtbar** | Der Admin markiert Konten als **Testkonto**. Normale Mitglieder sehen markierte Konten nirgends (Teilnehmerauswahl, Nachrichten-Empfänger, Teilnehmerlisten, Profile, „mitgebracht von"); **Tastings mit Testkonten-Beteiligung** werden für normale Nutzer komplett ausgeblendet (Dashboard, Historie, Ergebnisse, Bilanz). Testkonten sehen sich gegenseitig, damit Testläufe funktionieren; der Admin sieht alle, Testkonten mit Kennzeichen. Durchsetzung auf **Datenbankebene (RLS/Views)**, nicht nur im Frontend. Gilt auf Staging und Produktion. Für die Spec offen: Wegwerf-Konten der E2E-Suite automatisch markieren; Zusammenspiel mit dem Backlog-Punkt „E2E-Suite hängt an den Seed-Konten". | P2 | PROJ-3, PROJ-14 |
| **PROJ-27** | **Release-Notes-Seite „Neuigkeiten“** | Öffentliche Seite `/neuigkeiten` (ohne Login, `noindex`) mit den Release Notes zu PROJ-18..26 auf dezentem Marken-Hintergrund. Schlanker Ablauf, reiner Inhalt. | P2 | PROJ-13 |
| **PROJ-28** | **Whisky-Fotos** | Optional ein Foto je Whisky hinterlegen — sowohl bei der Vorbereitung (Eintragen auf „Meine Whiskys") als auch nachträglich nach dem Tasting. Ein Etikettfoto verrät den Whisky: vor dem Abschluss nur für Bringer und Gastgeber/Steward sichtbar, danach für alle (Ergebnisseite/Historie). Hebt das PRD-Non-Goal „Keine Fotos oder Datei-Uploads" für Whisky-Fotos auf (Supabase Storage). Spec: ein Foto je Whisky, Bringer + Admin jederzeit, Mini-Bild in Rangliste und Ausschankliste, auch für Sammlungs-Einträge (PROJ-15, Kopie bei „Zur Sammlung hinzufügen"). | P2 | PROJ-5, PROJ-9, PROJ-15 |
| **PROJ-29** | **Steward-Bewertung durch Teilnehmer** | Ist bei einem Tasting ein Whisky-Steward benannt, können die Teilnehmer ihn mit 0–10 Punkten bewerten. Spec (2026-11-23): bewertet wird während des laufenden Tastings (Karte in der Bewertungsansicht), geheim bis zum Abschluss — auch für den Steward —, danach alle Noten mit Namen + optionalem Kommentar auf der Ergebnisseite; Schrittweite wie das Tasting; Bilanz „Als Whisky-Steward: N Abende · Ø X" mit eigenem Schalter (PROJ-14). Keine Steward-Rangliste über alle Tastings (PRD-Non-Goal). | P2 | PROJ-11, PROJ-18 |
| **PROJ-30** | **Feedback-Formular (Fehler & Wünsche)** | Dezenter Link auf der Startseite (neben „Neuigkeiten“) zu einem Formular: Art (Fehler/Wunsch/Sonstiges) + Beschreibung; Versand per E-Mail über das vorhandene SMTP an eine feste Admin-Adresse (Umgebungsvariable), Reply-To = Absender, mit Seite/Gerät/Version; nur angemeldet, keine Speicherung der Inhalte, max. 5 pro Stunde je Person. | P2 | PROJ-2, PROJ-16 |

### Anmerkungen zur Aufteilung

- **App-Shell und Navigation liegen in PROJ-2**, nicht im Dashboard — sonst bräuchte jedes
  spätere Feature eine Wegwerf-Navigation zum Testen.
- **PROJ-8 ist bewusst das letzte P0.** Das Dashboard ist überwiegend Komposition dessen,
  was PROJ-4 bis PROJ-7 bereits gebaut haben, plus die Realtime-Schicht — und die lässt sich
  erst dann sinnvoll verifizieren, wenn es echten Zustand zu bewegen gibt.
- **Admin- und Teilnehmer-Funktionen sind getrennt** (PROJ-3/PROJ-4 vs. PROJ-5), weil sie
  unterschiedliche Rollen bedienen und unabhängig testbar sein müssen.
- **PROJ-9 ist P1**, weil ein erstes Tasting auch ohne Historienansicht durchführbar ist —
  die Daten entstehen trotzdem von Anfang an korrekt.
- **PROJ-10 hängt an PROJ-9, nicht an PROJ-2**, obwohl es nur eine Profilseite ist: die
  persönliche Bilanz („beste Platzierung", „Ø vergebene Punkte") liest die Ranglisten-View,
  die erst mit PROJ-9 gebaut wird. Die reine Stammdaten-Bearbeitung ginge früher — es lohnt
  sich aber nicht, die Seite zweimal anzufassen.
- **Der Link zum Verkostungsvideo** entsteht in PROJ-5 (eingeben) und wird in PROJ-9 sichtbar
  (nach der Auflösung). Er liegt in der geheimen Whisky-Tabelle, weil eine YouTube-URL den
  Whisky verrät — vor dem Abschluss sehen ihn nur der Bringer und der Gastgeber.
- **PROJ-11 (Neutraler Helfer)** ist bewusst nach hinten gelegt: Die P0-Kette geht davon
  aus, dass der Gastgeber ausschenkt und deshalb die Details sieht. Der Helfer ist eine
  Verfeinerung dieses Rollenmodells, die die Runde erst nach dem ersten echten Einsatz
  wirklich beurteilen kann. Wird zusammen mit / nach PROJ-6 spezifiziert, weil sie dieselben
  Berechtigungspfade (Ausschankreihenfolge, Runden schalten) betrifft.
- **PROJ-15 hängt an PROJ-14, nicht nur an PROJ-10**: „teilbar wie bei Vivino" heißt, die
  Sammlung nutzt dieselbe Sichtbarkeits-Steuerung, die PROJ-14 einführt. Erst wenn geklärt
  ist, was ein Nutzer über sich preisgibt, lässt sich sinnvoll festlegen, was er über seine
  Whisky-Sammlung preisgibt.
- **PROJ-18..25 (Feature-Wünsche vom 2026-10-05)** — empfohlene Reihenfolge
  **18 → 19 → 25 → 22 → 24 → 20 → 21 → 23**. PROJ-18 zuerst, weil die Umbenennung fast
  jede Datei mit sichtbarem Text berührt; danach schreiben alle Specs gleich die neuen
  Begriffe. PROJ-19 vor allem, was mit Punkten rechnet (Tipp, Live-Rangliste, Statistiken),
  weil sich mit Dezimalpunkten Summen und Gleichstände ändern. Die beiden Steward-Wünsche
  (PROJ-20/21) sind getrennt, weil sie unabhängige RLS-Pfade betreffen (Lesen fremder
  Wertungen vs. Einreichen von Whiskies). PROJ-22: „Kenner" bewusst nur pro Tasting + als
  Zähler in der eigenen Bilanz — eine Kenner-Rangliste über alle Tastings wäre eine
  gruppenweite Auswertung (PRD-Non-Goal).
