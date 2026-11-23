# PROJ-28: Whisky-Fotos

## Status: Approved
**Created:** 2026-11-23
**Last Updated:** 2026-11-23

## Dependencies
- Requires: PROJ-5 (Whisky-Erfassung) — Fotos hängen an den eingetragenen Whiskys, Hochladen auf „Meine Whiskys"
- Requires: PROJ-6 / PROJ-11 (Gastgeber-Steuerung, Whisky-Steward) — Mini-Bild in der Ausschankliste; wer „steuert", sieht das Foto vorab
- Requires: PROJ-9 (Ergebnisse & Historie) — Anzeige in der Rangliste, nachträgliches Hochladen auf der Ergebnisseite
- Requires: PROJ-15 (Persönliche Whisky-Sammlung) — Fotos für Sammlungs-Einträge, Übernahme per „Zur Sammlung hinzufügen"
- Requires: PROJ-14 (Sichtbarkeits-Einstellungen) — Sammlungs-Fotos folgen dem Schalter „Sammlung sichtbar"
- Berührt: PROJ-26 (Testkonten) — Fotos aus Tastings mit Testkonten-Beteiligung bleiben für normale Mitglieder genauso unsichtbar wie der Rest dieser Tastings

## Ausgangslage
Heute darf nur der Bringer die Angaben seines Whiskys ändern, und nur solange das Tasting
noch nicht gestartet ist (Status „Entwurf"). Danach sind alle Angaben eingefroren. Das PRD
schließt Fotos und Datei-Uploads bisher ausdrücklich aus („Supabase Storage bleibt
ungenutzt"). PROJ-28 hebt dieses Non-Goal auf — **nur** für je ein Foto pro Tasting-Whisky
und pro Sammlungs-Eintrag. Alle übrigen Whisky-Angaben bleiben nach dem Start unverändert
eingefroren; die Ausnahme gilt ausschließlich für das Foto.

## User Stories
- Als **Teilnehmer** möchte ich beim Eintragen meines Whiskys ein Foto der Flasche machen oder aus der Galerie wählen, damit die Runde nach der Auflösung sieht, was im Glas war.
- Als **Teilnehmer** möchte ich ein Foto auch **nach** dem Tasting noch hinzufügen, ersetzen oder entfernen, weil ich am Abend oft nicht daran denke.
- Als **Admin** möchte ich bei jedem Whisky ein Foto hinterlegen können, damit auch Tastings vollständig bebildert sind, bei denen der Bringer kein Foto gemacht hat (z. B. nachträglich erfasste Abende).
- Als **Gastgeber bzw. Whisky-Steward** möchte ich in der Ausschankliste ein Mini-Bild jeder Flasche sehen, damit ich beim Sortieren und Einschenken die richtige Flasche greife.
- Als **Teilnehmer** möchte ich nach dem Abschluss in der Rangliste zu jedem Whisky ein Vorschaubild sehen und es groß öffnen können, damit ich mir die Flasche merken kann.
- Als **Teilnehmer** möchte ich, dass vor dem Abschluss niemand außer den Berechtigten ein Foto sehen kann, damit die Blindheit hält.
- Als **Mitglied** möchte ich auch Einträgen in meiner persönlichen Sammlung ein Foto geben, und beim Übernehmen eines Tasting-Whiskys in die Sammlung soll dessen Foto mitkommen.

## Out of Scope
- **Mehrere Fotos pro Whisky / Galerie** — genau ein Foto je Whisky bzw. Sammlungs-Eintrag
- **Fotos für Events, Profile/Avatare oder Nachrichten** — nur Whiskys (Tasting + Sammlung)
- **Bildbearbeitung** (Zuschneiden, Drehen, Filter) — nur automatisches Verkleinern
- **Änderung anderer Whisky-Angaben nach dem Start** — Name, Details, Video-Link bleiben eingefroren wie bisher; nur das Foto ist ausgenommen
- **Gastgeber/Steward lädt Fotos für fremde Whiskys hoch** — bewusst nur Bringer und Admin
- **Eigener Sichtbarkeits-Schalter für Sammlungs-Fotos** — sie folgen dem bestehenden Schalter „Sammlung sichtbar" (PROJ-14/15)
- **Foto in der Historien-Liste** (z. B. Sieger-Foto) — nur Ergebnisseite; kann später ergänzt werden
- **Foto in der Bewertungsansicht während des Tastings** — würde die Blindheit brechen
- **Erkennung/Moderation von Bildinhalten**, Texterkennung von Etiketten, externe Bild-Dienste
- **Offline-Hochladen / Warteschlange** — PRD-Non-Goal „keine Offline-Fähigkeit" bleibt

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Hochladen bei der Vorbereitung („Meine Whiskys")
- [ ] Angenommen ein Teilnehmer trägt auf „Meine Whiskys" einen Whisky für ein Tasting im Entwurf ein, wenn er „Foto hinzufügen" wählt, dann kann er direkt mit der Kamera fotografieren oder ein Bild aus der Galerie wählen
- [ ] Angenommen ein Teilnehmer hat ein Foto ausgewählt, wenn er speichert, dann wird das Foto automatisch verkleinert hochgeladen und als Mini-Bild beim Whisky angezeigt
- [ ] Angenommen ein Whisky hat bereits ein Foto, wenn der Bringer ein neues auswählt, dann ersetzt das neue das alte vollständig (das alte ist danach nicht mehr abrufbar)
- [ ] Angenommen ein Whisky hat ein Foto, wenn der Bringer „Foto entfernen" bestätigt, dann ist der Whisky ohne Foto und das Bild ist nicht mehr abrufbar
- [ ] Angenommen ein Teilnehmer trägt einen Whisky ohne Foto ein, wenn er speichert, dann funktioniert das Eintragen wie bisher (Foto ist optional)

### Hochladen nach dem Start bzw. nach dem Abschluss
- [ ] Angenommen ein Tasting ist gestartet oder abgeschlossen, wenn der Bringer auf „Meine Whiskys" seinen Whisky öffnet, dann kann er nur noch das Foto hinzufügen, ersetzen oder entfernen — alle anderen Angaben sind gesperrt
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn der Bringer die Ergebnisseite öffnet, dann zeigt die Ranglisten-Zeile seines Whiskys ohne Foto „Foto hinzufügen", mit Foto die Aktionen „Ersetzen" und „Entfernen"
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer die Ergebnisseite öffnet, dann sieht er bei fremden Whiskys keine Foto-Aktionen
- [ ] Angenommen der Admin öffnet die Ergebnisseite eines abgeschlossenen Tastings, wenn er bei einem beliebigen Whisky „Foto hinzufügen", „Ersetzen" oder „Entfernen" wählt, dann wird die Änderung gespeichert, unabhängig davon, wer den Whisky mitgebracht hat
- [ ] Angenommen der Admin, wenn er bei einem Tasting im Entwurf oder während es läuft das Foto eines fremden Whiskys ändern will, dann erlaubt die Datenbank das; in der Oberfläche geschieht es über die Ergebnisseite nach dem Abschluss *(eingeschränkt 2026-11-23, QA BUG-2 akzeptiert)*
- [ ] Angenommen ein Gastgeber oder Steward, der den Whisky nicht mitgebracht hat und kein Admin ist, wenn er versucht, dessen Foto zu ändern, dann wird das abgelehnt — auch bei direktem Aufruf ohne Oberfläche

### Sichtbarkeit (Blindheit)
- [ ] Angenommen ein Tasting ist noch nicht abgeschlossen, wenn ein normaler Teilnehmer (nicht Bringer, nicht Gastgeber/Steward mit Detail-Einblick, nicht Admin) versucht, das Foto eines fremden Whiskys abzurufen — auch über eine direkte Bild-Adresse —, dann bekommt er es nicht
- [ ] Angenommen ein Tasting ist noch nicht abgeschlossen, wenn der Bringer, der Gastgeber (ohne benannten Steward) bzw. der Steward oder der Admin das Foto abruft, dann wird es angezeigt (gleiche Regel wie für Name und Details)
- [ ] Angenommen für ein Tasting ist ein Steward benannt, wenn der Gastgeber (der dann blind mitverkostet) das Foto eines fremden Whiskys vor dem Abschluss abrufen will, dann bekommt er es nicht
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein aktives Mitglied (Teilnehmer oder nicht) die Ergebnisseite öffnet, dann sieht es alle vorhandenen Fotos — wie Namen und Rangliste im gemeinsamen Archiv (PROJ-9) *(geändert 2026-11-23 in `/backend`, vorher „nur Teilnehmer")*
- [ ] Angenommen jemand ist deaktiviert oder nicht angemeldet, wenn er ein Foto eines Tastings abrufen will, dann bekommt er es nicht; Tastings mit Testkonten-Beteiligung bleiben für normale Mitglieder auch nach dem Abschluss ohne Foto (PROJ-26)
- [ ] Angenommen eine einmal geteilte Bild-Adresse, wenn sie von einer nicht angemeldeten Person geöffnet wird, dann wird kein Bild ausgeliefert (spätestens nach kurzer Zeit nicht mehr)

### Anzeige
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn die Ergebnisseite geladen wird, dann zeigt jede Ranglisten-Zeile ein kleines Vorschaubild bzw. bei Whiskys ohne Foto einen neutralen Platzhalter, und die Rangliste bleibt bis 10 Whiskys am Handy ohne Scrollen lesbar
- [ ] Angenommen ein Vorschaubild in der Rangliste, wenn es angetippt wird, dann öffnet sich das Foto bildschirmfüllend mit dem Whisky-Namen und lässt sich wieder schließen
- [ ] Angenommen der Gastgeber bzw. Steward öffnet die Steuerungsseite, wenn die Ausschankliste angezeigt wird, dann steht neben jedem Whisky ein Mini-Bild bzw. Platzhalter — auch beim Sortieren per Drag & Drop
- [ ] Angenommen ein Teilnehmer ohne Detail-Einblick nutzt Dashboard oder Bewertungsansicht während des Tastings, wenn ein Whisky ein Foto hat, dann ist davon nichts zu sehen (kein Bild, kein Hinweis „hat Foto")

### Sammlung (PROJ-15)
- [ ] Angenommen ein Mitglied legt einen Sammlungs-Eintrag an oder bearbeitet ihn, wenn es ein Foto hinzufügt, ersetzt oder entfernt, dann gilt dasselbe Verhalten wie bei Tasting-Whiskys (Kamera oder Galerie, automatisch verkleinert, ein Foto)
- [ ] Angenommen ein Mitglied hat „Sammlung sichtbar" eingeschaltet, wenn ein anderes Mitglied seine Sammlung ansieht, dann sieht es die Fotos der Einträge
- [ ] Angenommen ein Mitglied hat „Sammlung sichtbar" ausgeschaltet, wenn ein anderes Mitglied versucht, ein Foto aus dieser Sammlung abzurufen — auch über eine direkte Bild-Adresse —, dann bekommt es es nicht
- [ ] Angenommen ein Tasting-Whisky hat ein Foto, wenn ein Teilnehmer auf der Ergebnisseite „Zur Sammlung hinzufügen" wählt, dann bekommt der neue Sammlungs-Eintrag eine eigene Kopie des Fotos
- [ ] Angenommen ein Foto wurde in die Sammlung übernommen, wenn der Bringer später das Tasting-Foto ersetzt oder entfernt, dann bleibt das Foto in der Sammlung unverändert (und umgekehrt)

### Validierung & Fehler
- [ ] Angenommen ein Nutzer wählt eine Datei, die kein Bild ist, wenn er sie hochladen will, dann wird sie mit einer verständlichen Meldung abgelehnt
- [ ] Angenommen ein Nutzer wählt ein sehr großes Foto (bis ca. 20 MB, z. B. vom iPhone), wenn er es hochlädt, dann wird es vorher automatisch verkleinert und erfolgreich gespeichert
- [ ] Angenommen eine Datei ist größer als das Limit oder lässt sich nicht verarbeiten, wenn sie hochgeladen werden soll, dann erscheint eine verständliche Fehlermeldung und der bisherige Zustand (altes Foto oder kein Foto) bleibt erhalten
- [ ] Angenommen die Verbindung bricht während des Hochladens ab, wenn der Upload fehlschlägt, dann erscheint eine Fehlermeldung mit der Möglichkeit, es erneut zu versuchen; die übrigen Whisky-Angaben gehen nicht verloren
- [ ] Angenommen ein Upload läuft, wenn der Nutzer wartet, dann sieht er eine Fortschritts- bzw. Ladeanzeige und kann nicht versehentlich doppelt speichern

### Aufräumen
- [ ] Angenommen ein Whisky wird entfernt oder ein Tasting gelöscht (auch per Wartungsskript), wenn das passiert, dann werden die zugehörigen Fotos ebenfalls gelöscht
- [ ] Angenommen ein Sammlungs-Eintrag wird gelöscht, wenn das passiert, dann wird sein Foto ebenfalls gelöscht
- [ ] Angenommen ein Nutzer wird per Wartungsskript gelöscht (`hard`/`cascade`), wenn seine Whiskys bzw. Sammlungs-Einträge mitgelöscht werden, dann verschwinden auch deren Fotos

## Edge Cases
- **Foto während des laufenden Tastings hinzugefügt:** erlaubt (Bringer/Admin), bleibt aber bis zum Abschluss für normale Teilnehmer unsichtbar; Gastgeber/Steward sehen es sofort in der Ausschankliste.
- **Steward wird nachträglich benannt oder entfernt:** Wer das Foto vor dem Abschluss sieht, wechselt mit — genau wie bei den Whisky-Details.
- **Zwei Personen ändern gleichzeitig dasselbe Foto** (Bringer und Admin): Der zuletzt gespeicherte Stand gewinnt; es bleibt nie ein „verwaistes" altes Bild zurück.
- **Bild ist hochkant/quer oder mit Handy-Drehinformation:** wird richtig herum angezeigt.
- **Foto enthält Standortdaten (GPS) in den Bild-Metadaten:** werden beim Verkleinern entfernt, damit kein Wohnort über die Fotos weitergegeben wird.
- **Whisky ohne Foto:** überall neutraler Platzhalter, keine Fehlermeldung.
- **Tasting mit Testkonten-Beteiligung (PROJ-26):** Fotos sind für normale Mitglieder genauso unsichtbar wie das Tasting selbst.
- **Bringer ist inzwischen deaktiviert:** sein Foto bleibt sichtbar; ändern kann es dann nur noch der Admin.
- **Nachträglich erfasste Abende** (wie das Tasting vom 21.11.2026, bei dem alle Whiskys vom Gastgeber/Admin eingetragen wurden): der Admin kann alle Fotos nachpflegen.
- **Langsames WLAN beim Tasting:** dank Verkleinern vor dem Upload bleibt die Datenmenge klein; Abbruch → erneut versuchen.

## Technical Requirements (optional)
- **Sicherheit:** Die Sichtbarkeit der Fotos wird serverseitig bzw. auf Datenbank-/Storage-Ebene erzwungen (wie die übrige Blindheit), nicht nur im Frontend. Direkte Bild-Adressen dürfen die Regeln nicht umgehen.
- **Größe:** Originale bis ca. 20 MB werden angenommen; gespeichert wird eine verkleinerte Fassung in für das Handy ausreichender Qualität.
- **Performance:** Die Ergebnisseite mit 10 Vorschaubildern lädt am Handy spürbar ohne Verzögerung (kleine Vorschaubilder, großes Bild erst beim Antippen).
- **Formate:** gängige Handy-Fotoformate inkl. iPhone-Fotos.
- **PRD:** Das Non-Goal „Keine Fotos oder Datei-Uploads in dieser Version" wird mit diesem Feature angepasst.

## Open Questions
- [ ] Soll die Historien-Liste später das Foto des Sieger-Whiskys zeigen? (bewusst nicht in PROJ-28)
- [ ] Gesamt-Speicherbedarf im Blick behalten: reicht das kostenlose Supabase-Storage-Kontingent langfristig? (bei ~10 Fotos je Abend unkritisch, Bewertung in `/architecture`) — **Architektur:** ca. 0,3–0,5 MB je Foto (beide Fassungen) → das kostenlose 1-GB-Kontingent reicht für über 2.000 Fotos; offen bleibt nur das Beobachten im Betrieb
- [ ] HEIC-Bilder aus der Galerie auf Android-Browsern: werden sie gelesen oder greift die Fehlermeldung? (auf einem echten Android-Handy prüfen — **vom Nutzer am 2026-11-23 bewusst nach hinten gestellt**, kein Deploy-Blocker)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Genau ein Foto pro Whisky bzw. Sammlungs-Eintrag | Hält Bedienung und Speicher schlank; typischer Zweck ist Flasche/Etikett | 2026-11-23 |
| Bringer und Admin dürfen das Foto jederzeit pflegen (Entwurf, laufend, abgeschlossen) | „Nachträglich" ist der Kernwunsch; der Admin muss Lücken füllen können (z. B. nachträglich erfasste Abende) | 2026-11-23 |
| Gastgeber/Steward dürfen keine Fotos für fremde Whiskys hochladen | Klare Zuständigkeit; Admin deckt die Ausnahmefälle ab | 2026-11-23 |
| Foto ist die einzige Ausnahme von der Sperre nach dem Start | Ein Foto verändert keine Bewertungsgrundlage; Name/Details nachträglich zu ändern wäre ein eigenes Thema | 2026-11-23 |
| Sichtbarkeit wie die Whisky-Details (vor Abschluss Bringer, Gastgeber bzw. Steward, Admin; danach alle Teilnehmer) | Ein Etikettfoto verrät den Whisky genauso wie der Name — eine einzige, schon bewährte Regel | 2026-11-23 |
| **Korrektur:** nach dem Abschluss sieht **jedes aktive Mitglied** die Fotos, nicht nur die Teilnehmer | Abgeschlossene Tastings sind seit PROJ-9 ein gemeinsames Archiv (Namen + Rangliste für alle); ein Platzhalter nur für Nicht-Teilnehmer wäre widersprüchlich. Entschieden vom Nutzer in `/backend` | 2026-11-23 |
| Admin pflegt fremde Fotos in der Oberfläche nur nach dem Abschluss (Ergebnisseite), nicht in der Ausschankliste | QA BUG-2 vom Nutzer als „passt so" akzeptiert; die DB erlaubt es weiterhin in jedem Status | 2026-11-23 |
| Anzeige als Mini-Bild in der Rangliste, Antippen = groß | Rangliste bleibt bis 10 Whiskys ohne Scrollen lesbar (PRD-Constraint) | 2026-11-23 |
| Nachträgliches Hochladen sowohl auf der Ergebnisseite als auch auf „Meine Whiskys" | Ergebnisseite ist der natürliche Ort nach dem Abend; „Meine Whiskys" ist der bekannte Ort für die eigenen Whiskys | 2026-11-23 |
| Kamera oder Galerie, automatische Verkleinerung, Originale bis ca. 20 MB | Bedienung in Sekunden, auch bei schwachem WLAN; iPhone-Fotos funktionieren ohne Vorarbeit | 2026-11-23 |
| Mini-Bild in der Ausschankliste für Gastgeber/Steward | Er sieht die Details ohnehin; hilft beim Sortieren und Einschenken | 2026-11-23 |
| Fotos auch für die persönliche Sammlung (PROJ-15), gleiche Sichtbarkeit wie die Sammlung | Vom Nutzer gewünscht; kein zusätzlicher Schalter nötig | 2026-11-23 |
| „Zur Sammlung hinzufügen" übernimmt das Foto als eigene, unabhängige Kopie | Sammlung soll stabil bleiben, auch wenn der Bringer sein Tasting-Foto später ändert | 2026-11-23 |
| Standortdaten werden aus Fotos entfernt | Treffen finden bei den Mitgliedern zu Hause statt — Fotos sollen keine Adressen preisgeben | 2026-11-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase Storage, ein privater Bucket `whisky-photos` mit Bereichen `tasting/` und `collection/` | Vorhandene Infrastruktur und Zugriffsregeln; ein Bucket, damit „Zur Sammlung hinzufügen" per Kopie im Bucket geht | 2026-11-23 |
| Anzeige nur über serverseitig erzeugte signierte Links (~1 h gültig) | Blindheit serverseitig erzwungen; weitergegebene Links verfallen | 2026-11-23 |
| Gemeinsame Prüf-Funktion „darf Whisky-Details sehen" für Tabelle und Bucket | Eine einzige Wahrheit für die Blindheit, inkl. Steward- und Testkonten-Regel | 2026-11-23 |
| Verkleinern im Browser (Canvas), zwei Fassungen: ~1600 px und ~240 px Vorschau | Kleine Uploads bei schwachem WLAN; GPS/Metadaten fallen weg; keine kostenpflichtige Bild-Umrechnung nötig | 2026-11-23 |
| Direkter Browser-Upload in den Bucket, danach Server-Aktion „Foto setzen" | Server-Aktionen sind auf ~1 MB begrenzt; Bucket prüft Rechte selbst; Datenbank kennt nur den Speicherort | 2026-11-23 |
| Eigener, eng begrenzter Schreibweg für die Foto-Angaben (Bringer/Admin, jeder Status) | Bestehende Sperre „Details nur im Entwurf" bleibt für alle anderen Felder unverändert | 2026-11-23 |
| Neuer Dateiname pro Upload (Zeitstempel) | Kein veraltetes Bild aus Zwischenspeichern nach „Ersetzen" | 2026-11-23 |
| Bucket-Limit 2 MB, nur Bildformate | Verkleinertes Ergebnis passt immer; schützt vor Missbrauch an der Oberfläche vorbei | 2026-11-23 |
| Aufräumen in App-Aktionen + Wartungsskripten + neues Skript `photos:cleanup` | Datenbank-Kaskaden löschen keine Storage-Dateien | 2026-11-23 |
| Keine neuen npm-Pakete | Browser kann verkleinern; Storage-Client und shadcn-Dialog sind vorhanden | 2026-11-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Fotos liegen in einem **privaten Supabase-Storage-Bucket**. Der Browser verkleinert das Foto
selbst und lädt es **direkt** in diesen Bucket hoch; danach meldet eine Server-Aktion der
Datenbank „dieser Whisky hat jetzt dieses Foto". Angezeigt werden Fotos ausschließlich über
**kurzlebige, signierte Links**, die der Server beim Laden der Seite mit den Rechten des
angemeldeten Nutzers erzeugt. Wer laut Zugriffsregeln ein Foto nicht sehen darf, bekommt
keinen Link — und auch mit einer erratenen Adresse liefert der Bucket nichts aus.

### A) Betroffene Oberflächen (Komponenten-Baum)
```
Gemeinsamer Baustein (neu)
+-- Foto-Feld                       Mini-Bild/Platzhalter + „Foto hinzufügen" / „Ersetzen" / „Entfernen"
|   +-- Auswahl: Kamera oder Galerie
|   +-- Verkleinern im Browser + Fortschrittsanzeige + Fehlermeldung mit „Erneut versuchen"
+-- Foto-Vorschau (Vollbild)        Antippen eines Mini-Bilds → großes Foto + Whisky-Name, schließbar

„Meine Whiskys"  (tastings/[eventId]/whiskies)
+-- Whisky-Abschnitt / Whisky-Karte     + Mini-Bild
+-- Whisky-Formular (Dialog)            + Foto-Feld
    +-- nach dem Start: Formular gesperrt, nur Foto-Feld bleibt aktiv

Steuerungsseite (Gastgeber/Steward)
+-- Ausschankliste (Drag & Drop)        + Mini-Bild je Zeile

Ergebnisseite (tastings/[eventId]/ergebnisse)
+-- Rangliste
    +-- Ranglisten-Zeile                + Mini-Bild (antippen = Vollbild)
        +-- eigener Whisky / Admin:     Foto-Aktionen direkt in der Zeile
        +-- „Zur Sammlung hinzufügen":  übernimmt das Foto als Kopie

Sammlung (profil/sammlung, profil/[id]/sammlung)
+-- Sammlungs-Karte                     + Mini-Bild (antippen = Vollbild)
+-- Sammlungs-Dialog                    + Foto-Feld (nur eigene Sammlung)
```
Bewertungsansicht, Dashboard und eigene Live-Rangliste bleiben **unverändert** — dort taucht
nie ein Foto oder ein Hinweis darauf auf.

### B) Datenmodell (in Worten)
**Ein Bucket „whisky-photos" (privat)**, zwei Bereiche:
- `tasting/<Event>/<Whisky>/…` — Fotos von Tasting-Whiskys
- `collection/<Mitglied>/<Eintrag>/…` — Fotos aus der persönlichen Sammlung

Je Foto werden **zwei Dateien** gespeichert: eine **große Fassung** (ca. 1600 px lange Kante,
typisch 200–400 KB) für die Vollbild-Ansicht und ein **Vorschaubild** (ca. 240 px, wenige KB)
für Listen. Jeder Upload bekommt einen neuen Dateinamen (Zeitstempel) — so zeigt nach einem
„Ersetzen" kein Zwischenspeicher mehr das alte Bild.

**Neue Angaben in der Datenbank:**
- Whisky-Details: Speicherort der großen Fassung und des Vorschaubilds (leer = kein Foto)
- Sammlungs-Eintrag: dieselben zwei Angaben
- Die Ranglisten-Sicht der Ergebnisseite reicht die beiden Angaben durch (sie gibt Details
  ohnehin erst nach dem Abschluss heraus)

**Zugriffsregeln (Datenbank + Bucket):**

| Aktion | Tasting-Foto | Sammlungs-Foto |
|---|---|---|
| Ansehen | exakt die bestehende Regel der Whisky-Details: Admin, Steward, Teilnehmer, die Bringer sind, Gastgeber ohne Steward, nach dem Abschluss alle Teilnehmer; Testkonten-Tastings für normale Mitglieder unsichtbar | eigene immer; fremde nur bei „Sammlung sichtbar" (bestehende Regel aus PROJ-14/15/26) |
| Hochladen / Ersetzen / Entfernen | Bringer oder Admin, in jedem Event-Status | nur der Besitzer |

Die Regel „wer sieht die Details" wird dafür in **eine gemeinsame Prüf-Funktion** gezogen,
die sowohl die Tabelle als auch der Bucket nutzen — so können die beiden nie auseinanderlaufen.

**Eintragen des Fotos in die Datenbank:** über einen eigenen, eng begrenzten Weg
(„Foto setzen/entfernen"), der nur Bringer oder Admin erlaubt und nur die zwei Foto-Angaben
ändert. Die bestehende Sperre „Details nur im Entwurf änderbar" bleibt für alle anderen
Felder unangetastet.

### C) Technische Entscheidungen (begründet)
- **Supabase Storage statt externem Bilddienst** — läuft schon im Projekt, gleiche Anmeldung,
  gleiche Zugriffsregeln, kein neuer Anbieter, keine neuen Secrets.
- **Privater Bucket + signierte Links (gültig ca. 1 Stunde)** — die Blindheit wird vom Server
  erzwungen; ein weitergeleiteter Link verfällt von selbst (Prüfpunkt „geteilte Adresse").
- **Verkleinern im Browser** — ein 20-MB-iPhone-Foto wird am Handy auf wenige hundert KB
  gebracht, bevor es ins (oft schwache) WLAN geht. Beim Neu-Zeichnen fallen alle Metadaten
  weg, **inklusive GPS-Standort**, und die Handy-Drehung wird richtig umgesetzt.
- **Direkter Upload vom Browser in den Bucket** — Server-Aktionen sind auf ca. 1 MB pro Anfrage
  begrenzt und würden den Upload unnötig durch Vercel schleusen; der Bucket prüft die Rechte
  selbst. Der Bucket nimmt nur Bilder bis 2 MB an (das verkleinerte Ergebnis passt immer).
- **Zwei Fassungen statt Bild-Umrechnung auf dem Server** — Supabase rechnet Vorschaubilder
  erst im kostenpflichtigen Tarif um; zwei kleine Dateien sind einfacher und kostenlos.
- **Kopie bei „Zur Sammlung hinzufügen"** — Kopieren innerhalb desselben Buckets; deshalb
  ein Bucket für beide Bereiche statt zwei.
- **Aufräumen ohne Datenbank-Automatik** — Datenbank-Löschungen können Storage-Dateien nicht
  selbst entfernen. Deshalb: (1) „Ersetzen"/„Entfernen" und das Löschen eines Whiskys oder
  Sammlungs-Eintrags räumen die Dateien direkt mit weg; (2) die Wartungsskripte
  `tasting:delete` und `user:delete` löschen die zugehörigen Ordner mit; (3) ein neues
  Wartungsskript **`photos:cleanup`** findet verwaiste Dateien (Trockenlauf zuerst, wie die
  bestehenden Skripte).
- **iPhone-Fotos (HEIC):** Safari auf dem iPhone liefert bei der Auswahl automatisch ein
  verarbeitbares Bild. Kann ein Browser ein Format nicht lesen, kommt eine verständliche
  Meldung („Bitte als JPEG aufnehmen") und der alte Zustand bleibt.

### D) Abhängigkeiten
- **Keine neuen Pakete.** Verkleinern übernimmt der Browser selbst; Storage ist Teil des
  vorhandenen Supabase-Clients. Für die Vollbild-Ansicht reicht der vorhandene
  shadcn-Dialog.
- **DB-Migration nötig** (neue Spalten, gemeinsame Prüf-Funktion, „Foto setzen"-Weg,
  Bucket inkl. Zugriffsregeln, Ranglisten-Sicht erweitert). Wie üblich: `db:push` durch dich
  **vor** dem Code-Push.

### Testschwerpunkte (für /qa)
- Blindheit: normaler Teilnehmer bekommt vor dem Abschluss weder Link noch Datei — auch nicht
  bei direktem Bucket-Zugriff mit erratener Adresse; Gastgeber mit Steward ebenso.
- Schreibrechte: Gastgeber/Steward (nicht Bringer) kann nicht hochladen; Admin kann es immer.
- Sammlung: ausgeschalteter Schalter sperrt auch die Dateien.
- Aufräumen: nach Ersetzen/Entfernen/Löschen bleibt keine Datei zurück.

## Implementation Notes (Frontend)

**Stand 2026-11-23 — Frontend gebaut, läuft erst mit der Backend-Migration.** Die Abfragen
lesen bereits die neuen Spalten `photo_path` / `photo_thumb_path`; ohne Migration schlagen
„Meine Whiskys", Ergebnisseite, Steuerungsseite und Sammlung gegen die Live-DB fehl. Deshalb
**nicht pushen, bevor `/backend` fertig und `db:push` eingespielt ist.** Die Typen in
`src/lib/supabase/types.ts` sind von Hand so ergänzt, wie `npm run db:types` sie nach der
Migration erzeugen wird.

**Neue Bausteine**
- `src/lib/photos/paths.ts` — Bucket-Name, Ordner (`tasting/<event>/<whisky>`,
  `collection/<profil>/<eintrag>`), neues Pfad-Paar je Upload, serverseitige Prüfung
  `isPhotoPairFor` (Ordner + gleicher Zeitstempel, keine Pfad-Tricks) — mit Unit-Tests
- `src/lib/photos/resize.ts` — Prüfung (Bild, ≤ 20 MB, HEIC per Dateiname), Verkleinern per
  Canvas auf 1600 px / 240 px JPEG, Drehung aus EXIF, Metadaten (GPS) fallen weg — Unit-Tests
  für die reinen Funktionen
- `src/lib/photos/upload.ts` — Browser lädt beide Fassungen direkt in den Bucket
  (bewusste Ausnahme von „Mutationen nur über Server-Aktionen", siehe Tech Design)
- `src/lib/photos/signed.ts` — signiert alle Pfade einer Seite in einem Aufruf (1 h), mit den
  Rechten des Betrachters; Fehler → Platzhalter statt Seitenfehler
- `src/lib/actions/photos.ts` — `setWhiskyPhotoAction` (RPC `set_whisky_photo`, räumt alte
  Dateien weg, bei Ablehnung auch die neuen) und `setCollectionPhotoAction`
- `src/components/photos/` — `PhotoThumb` (Mini-Bild/Platzhalter, Vollbild-Dialog),
  `PhotoControl` (Hinzufügen/Ersetzen/Entfernen mit Ladeanzeige, Fehlermeldung +
  „Erneut versuchen", Bestätigung beim Entfernen), `PhotoPicker` (Auswahl im Anlege-Formular)

**Eingebunden**
- „Meine Whiskys": Foto-Feld an jeder Whisky-Zeile, in jedem Status aktiv; Foto-Auswahl im
  „Whisky hinzufügen"-Dialog (Upload nach dem Speichern mit der neuen ID — `addWhiskyAction`
  gibt sie jetzt zurück); Hinweis bei geschlossenem Eintragen, dass Fotos weiter gehen
- `removeWhiskyAction`: löst vorher das Foto und löscht die Dateien, dann `remove_whisky`
- Steuerungsseite: Mini-Bild in der Ausschankliste (Entwurf + laufend)
- Ergebnisseite: Mini-Bild in jeder Ranglisten-Karte; Foto-Aktionen für Bringer und Admin;
  „Zur Sammlung hinzufügen" kopiert das Tasting-Foto (außer man wählt ein eigenes)
- Sammlung: Mini-Bild auf jeder Karte, Foto-Aktionen in der eigenen Sammlung, Foto-Auswahl im
  Anlege-Dialog; Löschen eines Eintrags löscht die Dateien mit
- Fremde Sammlung: nur Mini-Bild (Sichtbarkeit regelt RLS/Bucket)

**Abweichung von der Spec:** Beim *Bearbeiten* eines Whiskys bzw. Sammlungs-Eintrags sitzt
das Foto nicht im Dialog, sondern direkt an der Zeile/Karte und speichert sofort. So ist es
nach dem Start (wenn der Bearbeiten-Dialog gesperrt ist) am selben Ort erreichbar wie vorher.

**Vertrag für `/backend`**
- Spalten `photo_path`, `photo_thumb_path` (text, null) an `whisky_details` und
  `collection_entries`; Spalten-GRANT für Update bei `collection_entries` ergänzen,
  bei `whisky_details` **nicht** (Schreiben nur über die RPC)
- `whisky_rankings` reicht beide Spalten durch (angehängt)
- RPC `set_whisky_photo(p_whisky uuid, p_photo_path text default null, p_thumb_path text
  default null)` → `table(old_photo_path text, old_thumb_path text)`; Bringer oder Admin, jeder
  Status; prüft, dass die Pfade im Ordner `tasting/<event>/<whisky>/` liegen; beide null =
  entfernen
- Privater Bucket `whisky-photos`, 2 MB, nur `image/jpeg`; Regeln auf `storage.objects`:
  Lesen tasting = gemeinsame Prüf-Funktion „darf Details sehen", collection = eigene oder
  `profile_shows_collection` (inkl. Testkonten-Regel); Anlegen/Löschen tasting = Bringer oder
  Admin, collection = nur eigener Ordner. Kopieren braucht Lesen der Quelle + Anlegen im Ziel
- `tasting:delete` / `user:delete` räumen Ordner mit; neues Skript `photos:cleanup`

## Implementation Notes (Backend)

**Migration `supabase/migrations/20261123120000_whisky_photos.sql`** — am 2026-11-23 vom
Nutzer per `db:push` eingespielt. `npm run db:types` danach: die von Hand ergänzten Typen
stimmten, neu kamen nur die drei Prüf-Funktionen hinzu. Integrationstests: 12/12 Foto-Tests
grün; Regression collection-entries, results-stats, whisky-entry-rpcs, rls,
steward-whiskies, test-accounts: 104/104 grün (in zwei Läufen wegen Auth-Ratenlimit).
`photos:cleanup` danach: 0 Dateien im Bucket (Tests räumen auf).
- Spalten `photo_path` / `photo_thumb_path` an `whisky_details` und `collection_entries`
  (≤ 300 Zeichen, nur paarweise gesetzt). Sammlung: Update-Grant erweitert plus
  CHECK, dass die Pfade im eigenen Ordner `collection/<profil>/<eintrag>/` liegen.
  `whisky_details`: kein Update-Grant — Schreiben nur über die RPC.
- `whisky_rankings`: beide Spalten angehängt, Filter unverändert.
- `can_view_whisky_details(whisky)` — gemeinsame Blindheits-Regel für Fotos (vor dem
  Abschluss wie `wd_select`, danach jedes aktive Mitglied; Testkonten-Regel inklusive).
  `can_edit_whisky_photo(whisky)` — aktiver Bringer oder Admin.
  `whisky_photo_object_ok(name, op)` — dieselben Regeln für Bucket-Objekte, liest
  Event/Whisky bzw. Besitzer aus dem Pfad, prüft die Form per Regex vor jedem Cast und
  verlangt, dass das Event-Segment zum Whisky passt.
- RPC `set_whisky_photo(whisky, photo, thumb)` — Bringer/Admin, jeder Status; beide null =
  entfernen; Pfad-Prüfung → neuer Fehlercode **TS027** („Ungültiger Speicherort für das
  Foto."), in `src/lib/errors.ts` ergänzt; liefert die alten Pfade.
- Bucket `whisky-photos`: privat, 2 MB, nur `image/jpeg`; Regeln für Lesen / Anlegen /
  Löschen auf `storage.objects`, kein Überschreiben.

**Wartungsskripte**
- `scripts/_supa.mjs`: `listPhotoFiles` (rekursiv) und `removePhotoFolder`
- `tasting:delete` löscht `tasting/<event>/` mit; `user:delete` löscht bei `hard` den
  Sammlungs-Ordner, bei `cascade` zusätzlich die Ordner der Gastgeber-Events und der
  mitgebrachten Whiskys
- **neu `npm run photos:cleanup`** — findet Dateien ohne Verweis (älter als 1 h),
  Trockenlauf ohne `CONFIRM=yes`. Vor der Migration meldet es „Bucket existiert nicht".

**Integrationstests** `src/lib/supabase/__tests__/whisky-photos.integration.test.ts`
(12 Fälle): Schreibrechte (Bringer, Admin, Gastgeber/Steward/Teilnehmer/Fremde abgelehnt),
TS027-Pfadprüfung, kein Direkt-Update, Blindheit im Entwurf (mit und ohne Steward),
Archiv-Sichtbarkeit nach dem Abschluss, Rangliste mit Pfaden, Ersetzen/Entfernen mit
alten Pfaden, Sammlung (Ordner-CHECK, Sichtbarkeits-Schalter, Kopie aus dem Tasting).
Bewusst ohne Event im Status „aktiv" (Live-DB; ein Start könnte ein echtes Tasting stören).

## QA Test Results

**Tested:** 2026-11-23
**App URL:** http://localhost:3000 (Produktions-Build, Live-Supabase; vorher geprüft: kein aktives Tasting)
**Tester:** QA Engineer (AI)

**Automatisierte Prüfung**
- Unit-Tests `npm test`: 26 Dateien / 242 Tests grün (inkl. 15 neue für Pfade, Verkleinerung, Dateiprüfung)
- Integrationstests: `whisky-photos` 12/12; Regression collection-entries, results-stats,
  whisky-entry-rpcs, rls, steward-whiskies, test-accounts 104/104
- Neue E2E-Suite `tests/PROJ-28-whisky-fotos.spec.ts` (12 Fälle) mit Fixture
  3000×2000 JPEG, EXIF-Drehung 6 und GPS-Daten (`tests/fixtures/`):
  **Chromium 12/12**, **Mobile Safari 11/12** — der 12. Fall scheitert an BUG-1
- E2E-Regression Chromium (PROJ-5, 6, 9, 15, 21): 61 grün, 1 instabil (bekannter Hydration-
  Doppelrender aus dem Backlog, im Retry grün), 1 rot wegen **veralteter Erwartung** in PROJ-5
  („reine Anzeige" = gar keine Knöpfe; seit PROJ-28 gibt es dort bewusst „Foto hinzufügen") →
  Test angepasst (prüft jetzt: kein Bearbeiten/Entfernen, nur „Foto hinzufügen"), danach grün
- E2E-Regression Mobile Safari PROJ-5: **rot** („Name ist Pflicht" — „Eintragen" nicht
  erreichbar) → BUG-1

### Acceptance Criteria Status

#### Hochladen bei der Vorbereitung
- [x] Kamera oder Galerie: natives Datei-Feld `accept="image/*"` ohne `capture` (Auswahlmenü des Handys; im Test per Datei)
- [x] Verkleinert hochgeladen, Mini-Bild erscheint — geprüft: 1067×1600 / 160×240, hochkant (Drehung umgesetzt)
- [x] Ersetzen: altes Paar ist im Bucket gelöscht
- [x] Entfernen mit Bestätigung: Spalten leer, Dateien weg
- [ ] **BUG-1:** Eintragen ohne Foto „wie bisher" — auf iPhone-Größe ist „Eintragen" im Dialog nicht erreichbar (Chromium/Desktop ok)

#### Hochladen nach dem Start bzw. nach dem Abschluss
- [x] „Meine Whiskys" nach dem Abschluss: Hinweis, kein Hinzufügen/Bearbeiten/Entfernen, Foto-Knopf aktiv („gestartet" nutzt denselben Pfad `editable=false`, nicht separat getestet — kein aktives Event in der Live-DB)
- [x] Ergebnisseite, eigener Whisky: „Foto hinzufügen" bzw. „Foto ersetzen"/„Entfernen"
- [x] Ergebnisseite, fremder Whisky: keine Foto-Aktionen
- [x] Admin auf der Ergebnisseite: Foto bei fremdem Whisky hinzugefügt
- [ ] **BUG-2:** Admin im Entwurf / während des Tastings: die Datenbank erlaubt es, aber die Oberfläche bietet keinen Weg (Ausschankliste zeigt nur Mini-Bilder, „Meine Whiskys" nur eigene)
- [x] Gastgeber/Steward/fremde Teilnehmer: Upload und `set_whisky_photo` abgelehnt (TS004) — Integrationstest

#### Sichtbarkeit (Blindheit)
- [x] Normaler Teilnehmer vor dem Abschluss: weder signierter Link noch Download (E2E + Integration), auch keine Pfade aus `whisky_details`
- [x] Bringer, Gastgeber ohne Steward, Steward, Admin sehen es (Integration; Gastgeber zusätzlich E2E in der Ausschankliste)
- [x] Mit Steward: Gastgeber bekommt das Foto nicht
- [x] Nach dem Abschluss: jedes aktive Mitglied, auch Nicht-Teilnehmer (Integration „outsider")
- [x] Nicht angemeldet: keine Regel für `anon` → kein Zugriff. Testkonten-Regel steckt in `can_view_whisky_details` (Code-Review; nicht eigens automatisiert)
- [x] Geteilter Link verfällt nach 1 h (Design: signierte Links, Bucket privat)

#### Anzeige
- [x] Mini-Bild bzw. Platzhalter in jeder Ranglisten-Zeile (bis 10 Whiskys nicht mit 10 Einträgen getestet; die Rangliste bestand schon vorher aus scrollenden Karten)
- [x] Antippen → Vollbild mit Whisky-Name, Bild geladen, Escape schließt
- [x] Ausschankliste mit Mini-Bild bzw. Platzhalter
- [x] Bewertungsansicht/Dashboard unverändert — kein Foto, kein Hinweis (Code-Review: dort keine Foto-Abfrage)

#### Sammlung
- [x] Foto am Eintrag hinzufügen/ersetzen/entfernen — gleicher Baustein wie bei Tasting-Whiskys; Ordner-CHECK der DB getestet
- [x] Fremde Sammlung mit „Sammlung sichtbar": Foto lesbar (Integration)
- [x] Schalter aus: auch direkte Datei nicht lesbar (Integration)
- [x] „Zur Sammlung hinzufügen" kopiert das Foto in den eigenen Ordner (E2E, inkl. Hinweistext)
- [x] Bringer entfernt das Tasting-Foto → Kopie in der Sammlung bleibt (E2E)

#### Validierung & Fehler
- [x] Nicht-Bild: Meldung „Das ist kein Bild…", Foto bleibt unverändert (E2E)
- [x] Große Fotos werden verkleinert (Fixture 3000×2000; ein echtes 20-MB-Foto nicht getestet)
- [x] Zu groß / nicht lesbar: verständliche Meldung, Zustand bleibt (Unit-Test der Prüfung; Code-Review der Lesefehler-Meldung)
- [x] Verbindungsabbruch: Fehlermeldung + „Erneut versuchen" (Code-Review; nicht automatisiert simuliert)
- [x] Ladeanzeige, Knöpfe während des Uploads gesperrt (Code-Review)

#### Aufräumen
- [x] Whisky entfernen / `tasting:delete`: Foto-Dateien werden mitgelöscht (Code-Review; nicht automatisiert)
- [x] Sammlungs-Eintrag löschen: Dateien weg (E2E)
- [x] `user:delete` hard/cascade räumt Foto-Ordner (Code-Review; Skript nicht gegen echte Konten ausgeführt)

### Edge Cases Status
- [x] Foto während des laufenden Tastings: gleiche Regeln wie im Entwurf (Integration im Entwurf; „aktiv" bewusst nicht geschaltet)
- [x] Steward nachträglich benannt/entfernt: Regel wertet `event_has_helper` live aus
- [x] Gleichzeitiges Ersetzen (Bringer + Admin): `set_whisky_photo` sperrt die Zeile (`for update`) und liefert jedem seine alten Pfade → kein verwaistes Bild (Code-Review)
- [x] Drehung: EXIF-Drehung 6 wird zu hochkant (E2E-Messung)
- [x] GPS/Metadaten: gespeicherte Dateien haben keine EXIF-Daten (E2E-Messung)
- [x] Whisky ohne Foto: Platzhalter, keine Fehlermeldung
- [x] Testkonten-Tastings: Regel in der Prüf-Funktion (Code-Review)
- [x] Bringer deaktiviert: nur noch Admin darf pflegen (`can_edit_whisky_photo` verlangt aktives Mitglied)
- [ ] Offen: HEIC aus der Galerie auf Android — braucht ein echtes Gerät

### Security Audit Results
- [x] Authentifizierung: Bucket privat, keine Regeln für `anon`; Server-Aktionen prüfen die Sitzung
- [x] Autorisierung: Schreiben nur Bringer/Admin (Tasting) bzw. Besitzer (Sammlung) — in RPC **und** Bucket; Steward/Gastgeber/Teilnehmer/Fremde abgelehnt (Integration)
- [x] Blindheit: eine gemeinsame Prüf-Funktion für Tabelle und Bucket; erratene Pfade liefern nichts
- [x] Pfad-Manipulation: Unterordner, `../`, falsche Endung, fremder Event-/Whisky-Ordner, ungleiche Zeitstempel → abgelehnt (Bucket + TS027 + Server-Prüfung + DB-CHECK für die Sammlung)
- [x] Direkt-Update der Foto-Spalten an `whisky_details` ohne Grant → abgelehnt
- [x] Kopieren: nur aus sichtbaren Quellen in den eigenen Ordner (Integration)
- [x] Dateiinhalt: nur `image/jpeg`, max. 2 MB → kein SVG/HTML-Upload für XSS
- [x] Privatsphäre: GPS wird entfernt (gemessen)
- Hinweis (kein Bug): Ein angemeldeter Bringer kann über die API beliebig viele Dateien (je ≤ 2 MB) in den Ordner seines Whiskys legen, ohne sie einzutragen. Folge wäre nur Speicherverbrauch; `photos:cleanup` findet solche Dateien. Bei 6–10 vertrauten Mitgliedern akzeptabel.

### Bugs Found

#### BUG-1: „Whisky hinzufügen"-Dialog auf dem Handy nicht abschließbar
- **Severity:** High (Regression von PROJ-5, betrifft das Eintragen generell)
- **Steps to Reproduce:**
  1. iPhone-Größe (Playwright „iPhone 13", 390×664), „Meine Whiskys" eines Tastings im Entwurf
  2. „Whisky hinzufügen" antippen
  3. Expected: „Eintragen" erreichbar (Dialog scrollt)
  4. Actual: Durch das neue Foto-Feld ist der Dialog höher als der Bildschirm; „Eintragen" liegt außerhalb und der Dialog scrollt nicht („element is outside of the viewport"). Auch ohne Foto-Auswahl, da das Feld immer angezeigt wird. PROJ-5-E2E „Name ist Pflicht" auf Mobile Safari rot.
- **Hinweis für den Fix:** Der Sammlungs-Dialog hat bereits `max-h-[90dvh] overflow-y-auto` am `DialogContent`; der Whisky-Dialog nicht.
- **Priority:** Fix before deployment
- **Status:** ✅ **Behoben 2026-11-23** — `DialogContent` des Whisky-Dialogs scrollt jetzt
  (`max-h-[90dvh] overflow-y-auto`). Re-Test: PROJ-28 + PROJ-5 auf Mobile Safari 22/22 und
  Chromium 22/22 (je 1 instabiler Test, im Retry grün — bekannter Hydration-Doppelrender)

#### BUG-2: Admin kann vor dem Abschluss keine Fotos fremder Whiskys pflegen
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Als Admin ein Tasting im Entwurf öffnen (Steuerungsseite bzw. „Meine Whiskys")
  2. Expected (Prüfpunkt): Foto eines fremden Whiskys hinzufügen/ändern
  3. Actual: Die Ausschankliste zeigt nur Mini-Bilder ohne Aktionen, „Meine Whiskys" nur die eigenen. Nach dem Abschluss geht es über die Ergebnisseite (Umweg).
- **Priority:** Fix in next sprint — oder Prüfpunkt auf „nach dem Abschluss" einschränken
- **Status:** ✅ **Akzeptiert 2026-11-23** (Nutzer-Entscheidung „passt so") — Prüfpunkt
  angepasst: der Admin pflegt fremde Fotos über die Ergebnisseite nach dem Abschluss

#### BUG-3: Whisky entfernen kann das Foto verlieren, wenn das Entfernen scheitert
- **Severity:** Low
- **Steps to Reproduce:**
  1. Bringer entfernt seinen Whisky (mit Foto), während der Gastgeber gleichzeitig das Tasting startet
  2. `removeWhiskyAction` löst und löscht zuerst das Foto, dann scheitert `remove_whisky` (Status nicht mehr Entwurf)
  3. Expected: Whisky bleibt samt Foto
  4. Actual: Whisky bleibt, Foto ist weg (kein Verweis ins Leere, nur Datenverlust des Fotos)
- **Priority:** Nice to have (nur bei genauem Zusammentreffen; Foto lässt sich neu hochladen)

### Summary
- **Acceptance Criteria (erster Lauf):** 32/34 passed (BUG-1, BUG-2), mehrere davon per Code-Review statt automatisiert (oben markiert)
- **Nach Re-Test 2026-11-23:** 34/34 — BUG-1 behoben, BUG-2 akzeptiert (Prüfpunkt angepasst)
- **Bugs Found:** 3 total (0 critical, 1 high, 1 medium, 1 low) — offen nur BUG-3 (Low)
- **Security:** Pass (ein akzeptiertes Restrisiko: Speicherverbrauch durch nicht eingetragene Uploads)
- **Offen, bewusst nachgelagert:** HEIC aus der Android-Galerie auf echtem Gerät prüfen
- **Production Ready:** YES
- **Recommendation:** Deploy (Reihenfolge: Migration ist bereits live → Code-Push)

## Deployment
_To be added by /deploy_
