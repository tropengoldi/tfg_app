# PROJ-19: Flexible Punkteskala (0 Punkte, 0,5er-Schritte)

## Status: Approved
**Created:** 2026-10-05
**Last Updated:** 2026-10-05

## Dependencies
- **Requires: PROJ-18 (Begriffe)** — alle Texte verwenden bereits „Nasenpunkte" / „Gaumenpunkte".
- **Ändert PROJ-4 (Admin – Tasting-Events)** — neue Einstellung „Schrittweite" im Event-Formular.
- **Ändert PROJ-7 (Bewertungsansicht)** — Slider-Bereich, Startwert, −/+-Tasten, Rückfrage bei 0/0.
- **Ändert PROJ-9 (Ergebnisse)** und **PROJ-10/14 (Bilanz)** — Summen und Durchschnitte mit halben Punkten.
- **Ändert PROJ-15 (Private Sammlung)** — Note 0–10 in 0,5er-Schritten.
- **Behebt PROJ-18 BUG-1** — Slider ohne zugänglichen Namen.
- **Ist Voraussetzung für PROJ-22, PROJ-24, PROJ-25** — alles, was mit Punkten rechnet.

## Kontext

Bisher: Nasenpunkte **1–5**, Gaumenpunkte **1–10**, nur ganze Zahlen; Slider starten
bei 3 bzw. 5. Private Sammlung: eine optionale Gesamtnote 1–10 (ganze Zahl).

Neu:

| | Tasting (1er-Schritte) | Tasting (0,5er-Schritte) | Private Sammlung |
|---|---|---|---|
| Nasenpunkte | 0, 1 … 5 | 0, 0,5 … 5 | – |
| Gaumenpunkte | 0, 1 … 10 | 0, 0,5 … 10 | – |
| Gesamtnote | – | – | keine **oder** 0, 0,5 … 10 |
| Wer legt fest | Admin pro Tasting | Admin pro Tasting | immer 0,5er |

**Kernregeln**
- Die Schrittweite ist eine Eigenschaft des **Tastings**. Voreinstellung **1er-Schritte**.
  Nur der **Admin** stellt sie ein, im Event-Formular; änderbar, solange das Tasting **in
  Vorbereitung** ist, ab dem Start gesperrt.
- Alle bestehenden Tastings gelten als **1er-Tastings**; ihre Bewertungen bleiben unverändert.
- **0 Punkte** sind in beiden Kategorien erlaubt.
- Beide Slider **starten bei 0** (bei einer bereits gespeicherten Bewertung: beim
  gespeicherten Wert).
- Neben jedem Slider gibt es **„−" / „+"-Tasten**, die genau einen Schritt (1 oder 0,5)
  weiterschalten.
- Speichert jemand mit **0 Nasen- und 0 Gaumenpunkten**, erscheint eine Rückfrage. Eine 0 in
  nur einer Kategorie wird ohne Rückfrage gespeichert.

### Anzeige halber Punkte
- Dezimal-**Komma**, die Nachkommastelle nur wenn nötig: „9", „9,5" — nie „9,0".
- Gilt überall, wo Punkte stehen: Slider-Wert, Rangliste (Summen, Einzelwertungen,
  Gesamtpunkte), Ø-Werte, Profil-Bilanz, Sammlungs-Karte („7,5 / 10").
- Ø-Werte bleiben wie bisher mit einer Nachkommastelle („Ø 13,4").

## User Stories
- Als **Admin** möchte ich pro Tasting festlegen, ob in ganzen oder halben Punkten bewertet
  wird, damit die Runde je nach Abend feiner unterscheiden kann.
- Als **Teilnehmer** möchte ich auch 0 Punkte vergeben können, damit ein wirklich
  misslungener Dram als solcher zählt.
- Als **Teilnehmer** möchte ich, dass die Slider bei 0 starten, damit mich keine vorgegebene
  Mitte beeinflusst.
- Als **Teilnehmer** möchte ich halbe Punkte mit „−"/„+" präzise einstellen können, auch mit
  einem Glas in der anderen Hand.
- Als **Teilnehmer** möchte ich gewarnt werden, wenn ich versehentlich 0/0 speichere.
- Als **Mitglied** möchte ich in meiner privaten Sammlung halbe Punkte vergeben können.
- Als **Teilnehmer mit Screenreader** möchte ich hören, welcher Slider welcher ist und welchen
  Wert er hat.

## Out of Scope
- **Andere Skalen** (z. B. 0–100, Nasenpunkte bis 10) — nur Minimum und Schrittweite ändern sich.
- **Umstellen der Schrittweite nach dem Start** — bewusst gesperrt.
- **Gastgeber oder Whisky-Steward stellen die Schrittweite ein** — nur der Admin.
- **Umrechnen alter Bewertungen** — bestehende Tastings bleiben 1er-Tastings.
- **Getrennte Nasen-/Gaumenpunkte in der privaten Sammlung** — dort bleibt es bei einer Gesamtnote.
- **Slider in der privaten Sammlung** — die Auswahlliste bleibt (wegen „keine Bewertung").
- **Neue Statistiken** — PROJ-25. **Eigene Live-Rangliste** — PROJ-24. **Sieger-Tipp** — PROJ-22.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einstellung am Tasting (Admin)
- [ ] Angenommen der Admin legt ein neues Tasting an, wenn er das Formular öffnet, dann gibt es
  eine Einstellung „Bewertung in" mit den Optionen „ganzen Punkten" und „halben Punkten",
  vorausgewählt „ganzen Punkten".
- [ ] Angenommen ein Tasting ist in Vorbereitung, wenn der Admin die Schrittweite ändert und
  speichert, dann gilt die neue Schrittweite für dieses Tasting.
- [ ] Angenommen ein Tasting läuft oder ist abgeschlossen, wenn der Admin das Formular öffnet,
  dann ist die Schrittweite sichtbar, aber nicht änderbar.
- [ ] Angenommen jemand versucht die Schrittweite eines gestarteten Tastings auf anderem Weg
  zu ändern, wenn die Änderung beim Server ankommt, dann wird sie abgelehnt.
- [ ] Angenommen ein Tasting nutzt halbe Punkte, wenn ein Mitglied das Tasting-Dashboard
  öffnet, dann steht dort „Bewertung in halben Punkten".
- [ ] Angenommen ein Tasting wurde vor PROJ-19 angelegt, wenn es geöffnet wird, dann gilt es als
  Tasting in ganzen Punkten, und alle Bewertungen sind unverändert.

### Bewertungsansicht
- [ ] Angenommen ein Teilnehmer öffnet einen Whisky, den er noch nicht bewertet hat, wenn die
  Slider erscheinen, dann stehen beide auf **0**.
- [ ] Angenommen ein Teilnehmer hat einen Whisky bereits bewertet, wenn er ihn wieder öffnet,
  dann stehen die Slider auf den gespeicherten Werten.
- [ ] Angenommen ein Tasting in ganzen Punkten, wenn der Teilnehmer die Slider bewegt, dann
  sind nur 0–5 bzw. 0–10 in ganzen Schritten wählbar.
- [ ] Angenommen ein Tasting in halben Punkten, wenn der Teilnehmer die Slider bewegt, dann
  sind 0–5 bzw. 0–10 in 0,5er-Schritten wählbar, und der Wert wird als „2,5" angezeigt.
- [ ] Angenommen ein Slider steht auf 2,5 (halbe Punkte), wenn der Teilnehmer „+" tippt, dann
  steht er auf 3; tippt er „−", steht er auf 2.
- [ ] Angenommen ein Slider steht auf 0, wenn der Teilnehmer „−" sieht, dann ist die Taste
  deaktiviert; ebenso „+" beim Maximum.
- [ ] Angenommen beide Slider stehen auf 0, wenn der Teilnehmer speichert, dann erscheint die
  Rückfrage „Wirklich 0 Nasen- und 0 Gaumenpunkte vergeben?" mit „Ja, speichern" und „Zurück".
- [ ] Angenommen die Rückfrage ist offen, wenn der Teilnehmer „Zurück" wählt, dann wird nichts
  gespeichert, und die Slider bleiben bedienbar.
- [ ] Angenommen nur eine Kategorie steht auf 0, wenn der Teilnehmer speichert, dann wird ohne
  Rückfrage gespeichert.
- [ ] Angenommen ein Tasting in ganzen Punkten, wenn jemand auf anderem Weg einen halben Wert
  (z. B. 2,5) speichern will, dann lehnt der Server das ab.
- [ ] Angenommen ein Screenreader liest die Bewertungsansicht, wenn er einen Slider erreicht,
  dann sagt er z. B. „Nasenpunkte, Schieberegler, 2,5" (behebt PROJ-18 BUG-1).
- [ ] Angenommen ein Screenreader erreicht die Tasten, dann heißen sie „Nasenpunkte verringern"
  / „Nasenpunkte erhöhen" bzw. „Gaumenpunkte verringern" / „Gaumenpunkte erhöhen".
- [ ] Angenommen das Tasting wird auf einem 360 px breiten Handy bedient, wenn die
  Bewertungsansicht angezeigt wird, dann sind Slider und −/+-Tasten ohne horizontales Scrollen
  bedienbar und die Tasten mindestens 44 × 44 px groß.

### Ergebnisse & Bilanz
- [ ] Angenommen ein abgeschlossenes Tasting mit halben Punkten, wenn ein Mitglied die
  Rangliste öffnet, dann zeigen Gesamtpunkte, „Nase X · Gaumen Y" und Einzelwertungen halbe
  Punkte mit Komma (z. B. „Nase 9,5 · Gaumen 17").
- [ ] Angenommen ein Wert ist ganzzahlig, wenn er angezeigt wird, dann ohne Nachkommastelle
  („17", nicht „17,0").
- [ ] Angenommen zwei Whiskies haben exakt dieselbe Gesamtpunktzahl (auch mit halben Punkten),
  wenn die Rangliste berechnet wird, dann gelten dieselben Gleichstandsregeln wie bisher.
- [ ] Angenommen ein Teilnehmer hat 0 Punkte vergeben, wenn die Rangliste berechnet wird, dann
  zählt die 0 als abgegebene Bewertung („k von m Bewertungen") und senkt den Durchschnitt.
- [ ] Angenommen ein Mitglied hat an Tastings mit ganzen und halben Punkten teilgenommen, wenn
  es seine Profil-Bilanz öffnet, dann ist „Ø vergebene Punkte" über alle Bewertungen korrekt
  berechnet (eine Nachkommastelle).

### Private Sammlung
- [ ] Angenommen ein Mitglied legt einen Sammlungs-Eintrag an, wenn es die Note wählt, dann
  enthält die Auswahl „Keine Bewertung", 0, 0,5, 1 … 10.
- [ ] Angenommen ein Eintrag hat die Note 7,5, wenn die Karte angezeigt wird, dann steht dort
  „7,5 / 10"; bei „Keine Bewertung" steht keine Note.
- [ ] Angenommen ein Eintrag hat die Note 0, wenn die Karte angezeigt wird, dann steht dort
  „0 / 10" (nicht „keine Bewertung").
- [ ] Angenommen bestehende Sammlungs-Einträge mit ganzen Noten, wenn sie nach PROJ-19 geöffnet
  werden, dann sind die Noten unverändert.
- [ ] Angenommen ein anderes Mitglied sieht die geteilte Sammlung (PROJ-14/15), wenn eine Karte
  eine halbe Note hat, dann wird sie dort ebenso angezeigt.

## Edge Cases
- **0/0 versehentlich:** Rückfrage nur, wenn beide Kategorien 0 sind (siehe AC).
- **Bewertung gespeichert, dann auf 0/0 geändert:** dieselbe Rückfrage beim erneuten Speichern.
- **Schrittweite ändern vor dem Start:** es gibt vor dem Start keine Bewertungen — kein
  Umrechnungsproblem. Nach dem Start gesperrt.
- **Gleichzeitiges Speichern** durch den Admin (Schrittweite) und den Gastgeber/Steward
  (Start): Wird das Tasting zuerst gestartet, wird die spätere Änderung der Schrittweite
  abgelehnt; die Meldung erklärt, dass das Tasting bereits läuft.
- **Halber Wert in einem 1er-Tasting** über manipulierte Anfrage: Server lehnt ab (AC).
- **Werte außerhalb des Bereichs** (z. B. −0,5, 5,5, 10,5) oder andere Nachkommastellen
  (2,3): Server lehnt ab.
- **Ø-Rundung:** Durchschnitte über halbe Punkte werden auf eine Nachkommastelle gerundet;
  ganzzahlige Summen bleiben ohne Komma.
- **Abgeschlossene Tastings vor PROJ-19:** unverändert, gelten als 1er-Tastings.
- **E-Mails und andere Texte** mit Punktangaben gibt es nicht — keine Anpassung nötig.

## Technical Requirements (optional)
- Die Regeln (Bereich, Schrittweite, Sperre nach Start) werden **serverseitig** erzwungen,
  nicht nur im Formular.
- Bestehende Bewertungen und Sammlungs-Einträge bleiben verlustfrei erhalten.
- Bedienelemente mindestens 44 × 44 px (Design-System: Bedienung mit einer Hand).

## Open Questions
- [x] Wie die Gleichstandsregel und die Ranglisten-Sichten mit Dezimalwerten umgehen, legt
  `/architecture` fest (fachlich: gleiche Regeln wie bisher). → Sichten werden mit
  Dezimal-Summen neu angelegt, Gleichstandsregel unverändert (Tech Design C/E).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Voreinstellung 1er-Schritte | Gewohnte Bewertung der Runde; alte Tastings bleiben automatisch 1er-Tastings; 0,5 ist eine bewusste Wahl | 2026-10-05 |
| Nur der Admin stellt die Schrittweite ein, im Event-Formular | Gehört zu den Rahmenbedingungen des Abends wie „Max. Whiskies pro Person"; keine neue Einstellung für Gastgeber/Steward | 2026-10-05 |
| Änderbar nur bis zum Start | Vor dem Start gibt es keine Bewertungen — so kann es nie Bewertungen in der „falschen" Schrittweite geben | 2026-10-05 |
| Slider starten bei 0 (statt 3/5) | Wunsch des Nutzers: keine vorgegebene Mitte, die die Bewertung beeinflusst | 2026-10-05 |
| Rückfrage nur bei 0/0, keine Sperre | Fängt das versehentliche Speichern ohne Bewegung ab; eine einzelne 0 ist vermutlich Absicht | 2026-10-05 |
| −/+-Tasten neben jedem Slider, in beiden Schrittweiten | 21 Positionen auf ~300 px sind mit dem Daumen schwer zu treffen; gleiche Ansicht unabhängig von der Schrittweite | 2026-10-05 |
| Private Sammlung: Auswahlliste statt Slider, 0–10 in 0,5 + „Keine Bewertung" | Ein Slider kennt keinen Zustand „nichts gewählt"; „keine Bewertung" ≠ „0 Punkte" | 2026-10-05 |
| Halbe Punkte mit Komma, Nachkommastelle nur wenn nötig | Deutsche Schreibweise; „17,0" wäre Rauschen | 2026-10-05 |
| PROJ-18 BUG-1 (Slider-Name für Screenreader) wird hier mit behoben | Die Slider werden ohnehin umgebaut; der vorbereitete Test wird scharf geschaltet | 2026-10-05 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Punkte als exakte Dezimalzahl mit einer Nachkommastelle speichern (statt Ganzzahl) | Halbe Punkte müssen exakt bleiben — keine Rundungsfehler wie bei Gleitkomma; „2,5" bleibt „2,5". Bestehende Ganzzahlen werden beim Umstellen verlustfrei übernommen | 2026-10-05 |
| Verworfen: halbe Punkte als „doppelte Ganzzahl" speichern (2,5 → 5) | Spart die Typänderung, aber jede Anzeige, Summe und jeder spätere Bericht müsste halbieren — dauerhafte Fehlerquelle | 2026-10-05 |
| Schrittweite als eigenes Feld am Tasting mit genau zwei erlaubten Werten (1 oder 0,5), Voreinstellung 1 | Der Wert ist direkt die Prüfregel („muss ein Vielfaches der Schrittweite sein"); bestehende Tastings bekommen automatisch 1 | 2026-10-05 |
| Bereich + „Vielfaches von 0,5" als Tabellen-Regel; „passt zur Schrittweite des Tastings" in der bestehenden Bewertungs-Prüfung beim Speichern | Bewertungen werden direkt (unter RLS) geschrieben, nicht über eine Funktion — die Prüfung muss deshalb in der Datenbank beim Speichern greifen, sonst ließe sie sich umgehen | 2026-10-05 |
| Neuer Fehlercode TS021 für „Wert passt nicht zur Schrittweite" | TS-Klasse statt PT (PT-Codes werden von PostgREST als HTTP-Status interpretiert); TS018–020 sind vergeben | 2026-10-05 |
| Sperre nach dem Start nutzt die bestehende Regel „Eckdaten nur im Entwurf" (TS005) | `update_event` lehnt nicht-Entwurfs-Events bereits ab — keine neue Regel nötig | 2026-10-05 |
| Event-Anlegen/-Bearbeiten bekommen einen zusätzlichen Parameter „Schrittweite" (Voreinstellung 1) | Admin-Schreibzugriff läuft ausschließlich über diese Funktionen; Signaturänderung erfordert Neuanlage + erneute Rechtevergabe, Rümpfe aus der PROJ-18-Fassung | 2026-10-05 |
| Die drei Ranglisten-Sichten werden in derselben Migration abgebaut und mit Dezimal-Summen neu angelegt | Eine Spalte, von der Sichten abhängen, lässt sich nicht im Typ ändern; die Sichten casten heute auf Ganzzahl und würden halbe Punkte abschneiden | 2026-10-05 |
| Gemeinsamer Anzeige-Helfer „Punkte formatieren" (Komma, Nachkommastelle nur wenn nötig) | Eine Regel an einer Stelle statt verstreuter Formatierungen in Rangliste, Bilanz, Sammlung, Slider | 2026-10-05 |
| Bestehende shadcn-Slider-Komponente minimal erweitern, damit der Name am bedienbaren Element landet | Behebt PROJ-18 BUG-1 an der Wurzel; kein Nachbau der Komponente | 2026-10-05 |
| −/+ als shadcn-Buttons, 0/0-Rückfrage als shadcn-AlertDialog | Beide Bausteine sind installiert; keine neuen Pakete | 2026-10-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-19 berührt **Datenbank** (Typen, Regeln, Ranglisten-Sichten, Event-Funktionen) und
**Oberfläche** (Event-Formular, Bewertungsansicht, Ergebnis-/Bilanz-/Sammlungsanzeige).
Keine neue Seite, keine neue Route, keine neuen Pakete.

### A) Bausteine

```
Admin – Event-Formular (PROJ-4)
+-- NEU: Auswahl „Bewertung in: ganzen Punkten | halben Punkten" (RadioGroup)
    +-- im Entwurf änderbar, danach nur Anzeige

Tasting-Dashboard (PROJ-8)
+-- NEU: Hinweis „Bewertung in halben Punkten" (nur wenn 0,5)

Bewertungsansicht (PROJ-7)
+-- Nasenpunkte
|   +-- [−]  Slider 0–5 (Schritt 1 oder 0,5, Start 0)  [+]   Wert „2,5"
+-- Gaumenpunkte
|   +-- [−]  Slider 0–10 (Schritt 1 oder 0,5, Start 0) [+]   Wert „7"
+-- Notizen (unverändert)
+-- Speichern
    +-- NEU: Rückfrage-Dialog bei 0/0 („Ja, speichern" / „Zurück")

Ergebnisse (PROJ-9), Bilanz (PROJ-10/14), Sammlung (PROJ-15)
+-- alle Punktwerte über den gemeinsamen Helfer „Punkte formatieren"

Private Sammlung – Eintrag-Dialog (PROJ-15)
+-- Auswahl „Keine Bewertung, 0, 0,5 … 10"
```

### B) Datenmodell (Änderungen)

**Tasting**
- NEU: **Schrittweite** — 1 oder 0,5; Voreinstellung 1. Alle bestehenden Tastings → 1.

**Bewertung** (eine pro Person und Whisky)
- Nasenpunkte: bisher ganze Zahl 1–5 → **Dezimalzahl 0–5**, Vielfaches von 0,5
- Gaumenpunkte: bisher ganze Zahl 1–10 → **Dezimalzahl 0–10**, Vielfaches von 0,5
- Gesamtpunkte: weiterhin automatisch berechnet (Nase + Gaumen), jetzt Dezimal
- NEU als Regel beim Speichern: Der Wert muss zur Schrittweite **seines** Tastings passen
  (in einem 1er-Tasting keine halben Punkte) → sonst Fehler TS021

**Sammlungs-Eintrag**
- Note: bisher ganze Zahl 1–10 → **Dezimalzahl 0–10**, Vielfaches von 0,5, weiterhin optional

Bestehende Werte werden beim Umstellen unverändert übernommen (3 bleibt 3).

### C) Datenbank-Migration (eine Datei, in fester Reihenfolge)
1. Die drei Ranglisten-Sichten abbauen (sie hängen an den Punkt-Spalten).
2. Die berechnete Gesamtsumme vorübergehend entfernen, Punkt-Spalten auf Dezimal umstellen,
   neue Bereichsregeln setzen, Gesamtsumme wieder anlegen.
3. Schrittweite am Tasting ergänzen.
4. Prüfung „passt zur Schrittweite" in die bestehende Bewertungs-Prüfung beim Speichern
   aufnehmen (dort, wo heute schon „Tasting abgeschlossen → keine Änderung" geprüft wird).
5. Event-Anlegen / -Bearbeiten mit neuem Parameter „Schrittweite" neu anlegen (aus der
   PROJ-18-Fassung, Rechte neu vergeben). Admin-Event-Liste liefert die Schrittweite mit.
6. Ranglisten-Sichten mit Dezimal-Summen und unveränderter Gleichstandsregel neu anlegen
   (Rechte und „nur aktive Mitglieder"-Filter wie bisher; Einzelwertungen weiterhin
   **ohne** Notizen).
7. Sammlungs-Note auf Dezimal umstellen.

Danach: TypeScript-Typen neu erzeugen.

### D) Prüfregeln — wo welche Regel greift

| Regel | Formular (sofortiges Feedback) | Datenbank (verbindlich) |
|---|---|---|
| Nase 0–5, Gaumen 0–10 | ✔ | ✔ Tabellen-Regel |
| Vielfaches von 0,5 | ✔ | ✔ Tabellen-Regel |
| Passt zur Schrittweite des Tastings | ✔ (Slider erlaubt nichts anderes) | ✔ beim Speichern (TS021) |
| Schrittweite nur im Entwurf änderbar | ✔ (Feld gesperrt) | ✔ bestehende Entwurfs-Regel (TS005) |
| Sammlungs-Note 0–10 in 0,5 oder leer | ✔ | ✔ Tabellen-Regel |

### E) Anzeige
- Ein gemeinsamer Helfer formatiert jeden Punktwert: Komma, „,5" nur wenn nötig.
- Ø-Werte bleiben bei einer Nachkommastelle (bestehende Funktionen, jetzt mit Dezimal-Eingaben).
- Gleichstand („punktgleich") wird wie bisher auf exakt gleiche Summen geprüft — Dezimalwerte
  mit einer Nachkommastelle sind exakt vergleichbar.

### F) Barrierefreiheit (PROJ-18 BUG-1)
Die vorhandene Slider-Komponente wird so erweitert, dass ihr Name am bedienbaren Element
selbst ankommt. Die −/+-Tasten tragen eigene Namen („Nasenpunkte erhöhen" …). Der
vorbereitete `fixme`-Test in `tests/PROJ-18-begriffe.spec.ts` wird scharf geschaltet.

### G) Tests
- **DB-Integration:** Bereiche (0 und Maximum erlaubt, −0,5 / 5,5 / 2,3 abgelehnt),
  halbe Punkte im 1er-Tasting abgelehnt (TS021), im 0,5er-Tasting erlaubt, Schrittweite nach
  Start nicht änderbar (TS005), Ranglisten-Summen mit halben Punkten, Sammlungs-Noten.
  Bestehende Tests mit „0 wird abgelehnt" werden auf die neue Untergrenze angepasst.
- **Unit:** Punkte-Formatierung, −/+-Grenzen, Formular-Schemas (Bewertung, Event, Sammlung).
- **E2E:** Event-Formular-Einstellung, Slider-Start 0, −/+, 0/0-Rückfrage, Anzeige „9,5",
  Sammlung „7,5 / 10", Screenreader-Namen, 360 px.

### H) Ausrollen
1. Migration einspielen (`db:push`, durch den Nutzer) — **vor** dem App-Deploy.
2. App deployen.
Zwischen 1 und 2 funktioniert die alte App weiter: Sie sendet nur ganze Werte ≥ 1, die
weiterhin gültig sind; neue Tastings bekommen automatisch Schrittweite 1. Ein laufendes
Tasting ist von der Umstellung nicht betroffen (Werte bleiben gleich) — trotzdem nicht
während eines Tasting-Abends einspielen.

### I) Abhängigkeiten (Pakete)
Keine.

### Arbeitsaufteilung
- `/frontend` — Formular-Einstellung, Bewertungsansicht (Slider, −/+, Rückfrage), Anzeige-Helfer, Sammlung, Slider-Namen.
- `/backend` — Migration (Schritte 1–7), Typen, Server-Aktionen um „Schrittweite" erweitern, Integrationstests.

### Implementation Notes (Backend, 2026-10-05)
- Migration `supabase/migrations/20261006120000_flexible_rating_scale.sql` (eine Transaktion,
  Schritte 1–7 wie im Tech Design):
  - `ratings.nose_points` / `taste_points` → `numeric(3,1)`, CHECK 0–5 / 0–10 und
    „Vielfaches von 0,5"; `total_points` neu als `numeric(4,1)` GENERATED.
  - `tasting_events.rating_step numeric(2,1) not null default 1`, CHECK `in (1, 0.5)`.
  - Neuer Trigger `ratings_step` (SECURITY DEFINER, `search_path = ''`): Wert muss Vielfaches
    der Schrittweite des Tastings sein, sonst **TS021** „In diesem Tasting werden nur ganze
    Punkte vergeben."
  - `create_event` / `update_event` mit `p_rating_step numeric default 1` (Prüfung 1 | 0,5 →
    TS021, **nach** der Admin-Prüfung); Rümpfe aus der PROJ-18-Fassung; Sperre nach Start =
    bestehende TS005-Regel. Rechte neu vergeben.
  - `whisky_rankings` / `past_tastings` / `whisky_score_breakdown` neu, nur `::int` →
    `::numeric` bei den Punktsummen; Filter, Gleichstandsregel, „ohne notes" unverändert.
  - `collection_entries.rating` → `numeric(3,1)`, CHECK 0–10 und Vielfaches von 0,5.
  - Alte CHECK-Constraints werden **ohne** `if exists` gedroppt — hieße einer anders, bricht
    die Transaktion laut ab, statt eine alte „ab 1"-Regel stehen zu lassen.
- **Abweichung vom Design:** `admin_list_events` liefert die Schrittweite **nicht** mit — das
  Bearbeiten-Formular lädt das Event mit allen Spalten (`select('*')`), die Liste braucht sie nicht.
- App-Server: `schemas/rating.ts` (0–5 / 0–10, `multipleOf(0.5)`), `schemas/collection.ts`
  („Keine" oder 0–10 in 0,5; Wert als „7.5"), `schemas/admin-events.ts` (`ratingStep` `'1' | '0.5'`,
  Default `'1'`), `actions/admin-events.ts` reicht `p_rating_step` an beide RPCs durch,
  `errors.ts` TS021.
- Tests: Unit 138/138 (u. a. neue Bereichs-/Halbpunkt-Fälle, Schrittweite im Event-Schema).
  Neuer Integrationstest `rating-scale.integration.test.ts` (16 Fälle) — läuft nach `db:push`.
- `db:push` durch den Nutzer am 2026-10-05; danach `db:types` (5 neue Zeilen: `rating_step`, `p_rating_step`). `npm run test:rls`: **149/149** grün (alle bisherigen 133 + 16 neue).
- Befund beim Test: Der BEFORE-Trigger `ratings_step` läuft vor den CHECK-Constraints — ein Wert wie 2,3 im 0,5er-Tasting wird deshalb mit TS021 („nur ganze Punkte“) statt 23514 abgelehnt. Abgelehnt wird korrekt; die Meldung ist für diesen Fall unpräzise, aber über die Oberfläche nicht erreichbar. Test erwartet „TS021 oder 23514“.

### Implementation Notes (Frontend, 2026-10-05)
- **Neu:** `src/lib/points.ts` (`formatPoints`, `stepValue`, `toRatingStep`, + Unit-Tests),
  `src/components/rating/score-field.tsx` (Slider 0–max + −/+ als shadcn-Buttons 44 × 44 px,
  `aria-valuetext` mit Komma).
- **Bewertungsansicht:** Startwerte 0/0 (`NOSE_DEFAULT`/`TASTE_DEFAULT`), Schrittweite aus
  `tasting_events.rating_step` (Query → Seite → `RatingView`), Rückfrage bei 0/0 über den
  bestehenden `ConfirmDialog` („Ja, speichern" / „Zurück").
- **BUG-1 behoben:** `ui/slider.tsx` reicht `aria-label` / `aria-valuetext` an den Thumb
  (`role="slider"`) weiter statt an den Root — minimale Erweiterung der shadcn-Komponente.
  Der `fixme`-Test in `tests/PROJ-18-begriffe.spec.ts` ist scharf geschaltet und grün.
- **Event-Formular:** `RadioGroup` „Bewertung in: ganzen / halben Punkten", Default „ganzen".
- **Dashboard:** Zeile „Bewertung: in halben Punkten" in der Eckdaten-Karte (nur bei 0,5).
- **Anzeige:** Rangliste (Gesamt, Summenzeile, Einzelwertungen) und Sammlungs-Karte über
  `formatPoints`; DB-`numeric`-Werte werden in den Queries mit `Number()` normalisiert.
- **Sammlung:** Auswahl „Keine Bewertung", 0, 0,5 … 10 (`/ 10`).
- **Gefundene Fallen (behoben):** Sammlungs-Karte und Bearbeiten-Dialog prüften `entry.rating ?`
  — eine Note **0** wäre als „keine Bewertung" erschienen. Jetzt `!== null`.
- **Abweichung von AC „nach dem Start sichtbar, aber nicht änderbar (Formular)":** Das
  Bearbeiten-Formular ist für gestartete Tastings schon seit PROJ-4 gar nicht erreichbar
  (Weiterleitung zur Liste). Die Schrittweite ist dann auf dem Dashboard sichtbar; die
  Sperre greift serverseitig (TS005).
- **Bekannte Grenze:** Die Historien-Liste zeigt den Sieger nur bei `winner_points > 0`
  (bestehende Logik aus PROJ-9). Haben **alle** Teilnehmer **alle** Whiskies mit 0/0
  bewertet, erscheint dort „kein Sieger" — praktisch ausgeschlossen, nicht angepasst.
- Tests: Unit 145/145, Lint + Typecheck grün. E2E (Chromium) `PROJ-19-punkteskala.spec.ts`
  (11 Tests) + Regression PROJ-7/15/18: **42/42 grün**.

## QA Test Results

**Tested:** 2026-10-05
**App URL:** http://localhost:3000 (Production-Build) gegen die Live-DB mit eingespielter
Migration `20261006120000_flexible_rating_scale.sql` (vorher geprüft: kein echtes Tasting aktiv)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Einstellung am Tasting (Admin)
- [x] Formular „Bewertung in: ganzen / halben Punkten", Voreinstellung ganze — E2E
- [x] Im Entwurf änderbar und gespeichert (und beim erneuten Öffnen vorausgewählt) — E2E + Integration
- [~] Nach dem Start „sichtbar, aber nicht änderbar" im Formular — **Abweichung (bewusst):** das
  Bearbeiten-Formular ist für gestartete Tastings seit PROJ-4 gar nicht erreichbar; Schrittweite
  ist auf dem Dashboard sichtbar. Fachlich erfüllt (nicht änderbar), siehe Implementation Notes.
- [x] Änderung nach dem Start serverseitig abgelehnt (TS005) — Integration
- [x] Teilnehmer kann die Schrittweite nicht direkt setzen — Integration
- [x] Dashboard zeigt „Bewertung: in halben Punkten" nur bei 0,5 — E2E (Chromium + Mobile Safari)
- [x] Alte Tastings gelten als 1er-Tastings, Bewertungen unverändert — Migration (Default 1,
  verlustfreie Typumstellung) + Regression PROJ-7/9/10 grün

#### Bewertungsansicht
- [x] Unbewerteter Whisky: beide Slider auf 0 — E2E
- [x] Bewerteter Whisky: gespeicherte Werte — E2E (PROJ-7-Regression)
- [x] Ganze Punkte: nur 1er-Schritte, „+" endet beim Maximum — E2E
- [x] Halbe Punkte: 0,5er-Schritte, Anzeige „2,5" — E2E
- [x] „+" / „−" um genau einen Schritt — E2E + Unit (`stepValue`)
- [x] „−" bei 0 und „+" beim Maximum deaktiviert — E2E
- [x] 0/0 → Rückfrage mit „Ja, speichern" / „Zurück" — E2E
- [x] „Zurück" speichert nichts — E2E (DB geprüft)
- [x] Nur eine Kategorie 0 → ohne Rückfrage — E2E
- [x] Halber Wert im 1er-Tasting → Server lehnt ab (TS021) — Integration
- [x] Screenreader: „Nasenpunkte, Schieberegler, 2,5" (`aria-valuetext`) — E2E, **PROJ-18 BUG-1 behoben**
- [x] Tasten heißen „Nasenpunkte verringern/erhöhen" usw. — E2E
- [x] 360 px: kein horizontales Scrollen, Tasten ≥ 44 × 44 px — E2E

#### Ergebnisse & Bilanz
- [x] Rangliste mit halben Punkten und Komma („Nase 9,5 · Gaumen 17", „26,5", Einzelwertungen) — E2E
- [x] Ganze Werte ohne Nachkommastelle — E2E + Unit (`formatPoints`)
- [x] Gleichstand auch mit halben Punkten exakt erkannt — Unit (`tieRanks`)
- [x] 0 zählt als abgegebene Bewertung (`rating_count`) — Integration
- [x] Ø in der Bilanz über ganze + halbe + 0 korrekt — Unit (`formatAvgGiven`)

#### Private Sammlung
- [x] Auswahl „Keine Bewertung", 0, 0,5 … 10 — E2E
- [x] „7,5/10" auf der Karte; keine Note → „—" — E2E
- [x] Note 0 → „0/10" (nicht „keine Bewertung") — E2E (vorher Falle `entry.rating ?`, im Frontend behoben)
- [x] Bestehende ganze Noten unverändert — verlustfreie Typumstellung, PROJ-15-Regression grün
- [x] Geteilte Sammlung zeigt halbe Noten gleich — gleiche Karte + gleiche Abfrage (`public-collection-view` → `CollectionEntryCard`, `queries/collection.ts`)

### Edge Cases Status
- [x] 0/0 versehentlich / nach Änderung erneut auf 0/0 → Rückfrage (gleicher Pfad)
- [x] Schrittweite vor dem Start ändern: keine Bewertungen vorhanden → kein Umrechnungsproblem
- [x] Gleichzeitiges Starten und Ändern der Schrittweite: `update_event` sperrt die Zeile
  (`for update`) und lehnt nach dem Start mit TS005 ab
- [x] Manipulierte Werte: −1, 5,5, 10,5 → 23514; 2,3 / 5,25 → abgelehnt (siehe BUG-1)
- [x] Ø-Rundung auf eine Stelle — Unit
- [x] Alte Tastings unverändert

### Security Audit Results
- [x] Schrittweite nur über `create_event` / `update_event` (Admin-Prüfung zuerst);
  Direkt-Update auf `tasting_events` für `authenticated` weiterhin entzogen — getestet
- [x] Halbe Punkte im 1er-Tasting: verbindlich per Trigger, nicht nur im Formular — getestet
- [x] Umgehung über fremde `event_id` (0,5er-Event-ID + Whisky eines 1er-Events) unmöglich:
  zusammengesetzter FK `(whisky_id, event_id) → whiskies(id, event_id)`; zudem nur ein aktives Tasting
- [x] Trigger-Funktion `SECURITY DEFINER` mit `search_path = ''`, `execute` für alle Rollen entzogen
- [x] Neu angelegte Ranglisten-Sichten: Filter (`closed` + `is_active_member()`), Rechte
  (anon entzogen) und „Einzelwertungen ohne Notizen" unverändert — Integration (alle 133 Altfälle grün)
- [x] Keine neue Route, keine neuen Umgebungsvariablen, keine neuen Pakete

### Automatisierte Tests
- Unit: 15 Dateien, **149/149** (neu: `points.test.ts`, Halbpunkt-/0-Fälle in `rating`,
  `collection`, `admin-events`, `results`, `personal-balance`)
- DB-Integration: **150/150** (neu: `rating-scale.integration.test.ts`, 17 Fälle)
- E2E `PROJ-19-punkteskala.spec.ts` (11) + `PROJ-18-begriffe.spec.ts` (inkl. BUG-1-Test):
  Chromium + Mobile Safari grün. Ein WebKit-Flake im Dashboard-Test („navigation interrupted"
  durch zusätzliches `goto('/')` nach dem Login) im Test behoben — danach 8/8 Wiederholungen grün.
- Regression E2E (Chromium) PROJ-4/6/7/8/9/10/11/14/15/16/18: alle grün bis auf **3
  vorbestehende** Admin-Tests (PROJ-4, PROJ-6, PROJ-14), die sich als Seed-Admin mit
  `SEED_PASSWORD` anmelden — bekanntes Backlog-Problem, nicht PROJ-19.

### Bugs Found

#### BUG-1: Unpräzise Meldung für unzulässige Nachkommastellen im 0,5er-Tasting
- **Severity:** Low
- **Steps to Reproduce:**
  1. 0,5er-Tasting läuft
  2. Bewertung mit 2,3 Nasenpunkten direkt an die API senden (über die Oberfläche unmöglich)
  3. Expected: Ablehnung mit „Nur ganze oder halbe Punkte"
  4. Actual: Ablehnung mit „In diesem Tasting werden nur ganze Punkte vergeben." (TS021) — der
     BEFORE-Trigger greift vor dem CHECK-Constraint
- **Priority:** Nice to have — nur über manipulierte Anfragen erreichbar; abgelehnt wird korrekt

#### BUG-2: Historie zeigt „kein Sieger", wenn ausschließlich 0-Punkte vergeben wurden
- **Severity:** Low
- **Steps to Reproduce:**
  1. Tasting, in dem **alle** Teilnehmer **alle** Whiskies mit 0/0 bewerten, abschließen
  2. Tasting-Historie öffnen
  3. Expected: Sieger-Whisky (Rang 1) wird genannt
  4. Actual: „— kein Sieger" (PROJ-9-Logik `winner_points > 0` stammt aus der Zeit mit Minimum 1)
- **Priority:** Nice to have — praktisch ausgeschlossen; die Ergebnisseite selbst zeigt die Rangliste korrekt

### Summary
- **Acceptance Criteria:** 29/30 bestanden, 1 bewusste Abweichung (Formular nach Start nicht
  erreichbar statt read-only — fachlich erfüllt)
- **Bugs Found:** 2 total (0 critical, 0 high, 0 medium, 2 low)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy. Migration ist bereits eingespielt. Nicht während eines laufenden Tastings deployen.

## Deployment
_To be added by /deploy_
