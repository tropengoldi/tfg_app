# PROJ-28: Whisky-Fotos

## Status: Architected
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
- [ ] Angenommen der Admin, wenn er bei einem Tasting im Entwurf oder während es läuft das Foto eines fremden Whiskys ändern will, dann ist das möglich (Admin darf immer)
- [ ] Angenommen ein Gastgeber oder Steward, der den Whisky nicht mitgebracht hat und kein Admin ist, wenn er versucht, dessen Foto zu ändern, dann wird das abgelehnt — auch bei direktem Aufruf ohne Oberfläche

### Sichtbarkeit (Blindheit)
- [ ] Angenommen ein Tasting ist noch nicht abgeschlossen, wenn ein normaler Teilnehmer (nicht Bringer, nicht Gastgeber/Steward mit Detail-Einblick, nicht Admin) versucht, das Foto eines fremden Whiskys abzurufen — auch über eine direkte Bild-Adresse —, dann bekommt er es nicht
- [ ] Angenommen ein Tasting ist noch nicht abgeschlossen, wenn der Bringer, der Gastgeber (ohne benannten Steward) bzw. der Steward oder der Admin das Foto abruft, dann wird es angezeigt (gleiche Regel wie für Name und Details)
- [ ] Angenommen für ein Tasting ist ein Steward benannt, wenn der Gastgeber (der dann blind mitverkostet) das Foto eines fremden Whiskys vor dem Abschluss abrufen will, dann bekommt er es nicht
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Teilnehmer dieses Tastings die Ergebnisseite öffnet, dann sieht er alle vorhandenen Fotos
- [ ] Angenommen jemand ist kein Teilnehmer eines Tastings (und kein Admin), wenn er ein Foto dieses Tastings abrufen will, dann bekommt er es nicht — auch nicht nach dem Abschluss
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
- [ ] HEIC-Bilder aus der Galerie auf Android-Browsern: werden sie gelesen oder greift die Fehlermeldung? (in `/qa` auf einem echten Android-Handy prüfen)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Genau ein Foto pro Whisky bzw. Sammlungs-Eintrag | Hält Bedienung und Speicher schlank; typischer Zweck ist Flasche/Etikett | 2026-11-23 |
| Bringer und Admin dürfen das Foto jederzeit pflegen (Entwurf, laufend, abgeschlossen) | „Nachträglich" ist der Kernwunsch; der Admin muss Lücken füllen können (z. B. nachträglich erfasste Abende) | 2026-11-23 |
| Gastgeber/Steward dürfen keine Fotos für fremde Whiskys hochladen | Klare Zuständigkeit; Admin deckt die Ausnahmefälle ab | 2026-11-23 |
| Foto ist die einzige Ausnahme von der Sperre nach dem Start | Ein Foto verändert keine Bewertungsgrundlage; Name/Details nachträglich zu ändern wäre ein eigenes Thema | 2026-11-23 |
| Sichtbarkeit wie die Whisky-Details (vor Abschluss Bringer, Gastgeber bzw. Steward, Admin; danach alle Teilnehmer) | Ein Etikettfoto verrät den Whisky genauso wie der Name — eine einzige, schon bewährte Regel | 2026-11-23 |
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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
