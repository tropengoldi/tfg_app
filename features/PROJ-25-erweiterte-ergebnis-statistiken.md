# PROJ-25: Erweiterte Ergebnis-Statistiken

## Status: Deployed
**Created:** 2026-10-05
**Last Updated:** 2026-10-05

## Dependencies
- **Requires: PROJ-9 (Ergebnisse & Historie)** — Ergebnisseite, Rangliste, Historien-Liste.
- **Requires: PROJ-19 (Flexible Punkteskala)** — Punkte können halbe Werte und 0 sein;
  Anzeige über den gemeinsamen Punkte-Helfer.
- **Erweitert PROJ-5 (Whisky-Erfassung)** — das Eintrage-Formular bekommt die optionalen Felder
  Alkohol, Alter und Preis (heute nur Name, Video-Link, Notiz), inkl. Hinweis zur Preis-Sichtbarkeit.
- **Behebt PROJ-19 BUG-1 und BUG-2** (siehe unten).

## Kontext

Nach dem Abschluss zeigt die Ergebnisseite heute die Rangliste mit Name, Destillerie,
Region, „mitgebracht von", Punkten und Video. **Nicht** sichtbar sind: die
Ausschank-Nummer, die eigene Sicht des Betrachters, sowie Alkoholgehalt, Alter und Preis.

**Befund (2026-10-05, /architecture):** Alkoholgehalt, Alter und Preis werden heute **gar nicht
erfasst** — das Eintrage-Formular (PROJ-5) hat nur Name, Video-Link und Notiz, obwohl die
Datenbank die Felder kennt. In der Live-DB sind sie bei allen 8 Whiskies leer. PROJ-25
nimmt deshalb die drei Felder ins Formular auf (Entscheidung des Nutzers: Variante a).

PROJ-25 ergänzt:
0. im **Eintrage-Formular** die optionalen Felder Alkohol (%), Alter (Jahre) und Preis (€),
1. **Ausschank-Nummer** und **eigene Platzierung** in der Rangliste,
2. einen Abschnitt **„Statistiken"** unter der Rangliste mit Hervorhebungs-Karten,
3. zwei **Diagramme**: Balken mit Kennzahl-Umschalter und ein Punktdiagramm mit wählbaren Achsen,
4. die **Freigabe von Alkoholgehalt, Alter und Preis** nach dem Abschluss.

Alles gilt **pro Tasting**. Es gibt keine Auswertung über mehrere Tastings oder über die
Runde hinweg (PRD-Non-Goal).

### Kennzahlen und Definitionen

| Kennzahl | Definition |
|---|---|
| Ausschank-Nummer | Position im Ausschank („#3") |
| Gesamtplatzierung | Rang aus der bestehenden Rangliste |
| Nasenpunkte / Gaumenpunkte | Summen aller Bewertungen des Whiskys |
| Alkoholgehalt | Angabe des Bringers in %; fehlt → „keine Angabe" |
| Alter | Angabe des Bringers in Jahren; fehlt → **3 Jahre angenommen**, markiert |
| Preis | Angabe des Bringers in €; fehlt → „keine Angabe" |
| **Eigene Platzierung** | Rang nur aus den eigenen Punkten des Betrachters (Gesamt → Gaumen → Nase → Ausschank-Reihenfolge); unbewertet → „—" |
| **Preis-Leistungs-Sieger** | höchste „Punkte pro 10 €" (Gesamtpunkte ÷ Preis × 10); nur wenn ≥ 2 Whiskies einen Preis haben |
| **Konsens-Whisky / umstrittenster Whisky** | geringste / größte Streuung der Gesamtpunkte der einzelnen Bewertungen; nur Whiskies mit ≥ 3 Bewertungen |
| **Nase gegen Gaumen** | Whisky mit dem größten Abstand zwischen seinem Platz nach Nasenpunkten und seinem Platz nach Gaumenpunkten |
| **Deine Übereinstimmung** | Ø Abstand (in Plätzen) zwischen eigener Platzierung und Gesamtplatzierung über die selbst bewerteten Whiskies; dazu „Dein Favorit landete in der Runde auf Platz X" |

## User Stories
- Als **Teilnehmer** möchte ich in der Rangliste sehen, welche Nummer jeder Whisky beim
  Ausschank hatte, damit ich meine Notizen vom Abend zuordnen kann.
- Als **Teilnehmer** möchte ich neben der Gesamtplatzierung meine eigene Platzierung sehen,
  damit ich erkenne, wo ich anders lag als die Runde.
- Als **Mitglied** möchte ich die Whiskies eines Abends in einem Diagramm vergleichen
  (Punkte, Alkohol, Alter, Preis), damit Zusammenhänge sichtbar werden.
- Als **Mitglied** möchte ich zwei Kennzahlen gegeneinander auftragen (z. B. Alter gegen
  Gesamtpunkte), damit ich Fragen wie „gewinnen die älteren?" beantworten kann.
- Als **Mitglied** möchte ich Highlights wie Preis-Leistungs-Sieger, Konsens- und
  umstrittensten Whisky auf einen Blick sehen.
- Als **Teilnehmer** möchte ich wissen, wie nah mein Geschmack an dem der Runde lag.
- Als **Bringer** möchte ich beim Eintragen wissen, dass der Preis nach dem Abschluss für alle
  sichtbar wird, damit ich bewusst entscheide, ob ich ihn angebe.

## Out of Scope
- **Auswertungen über mehrere Tastings** (z. B. „wer vergibt die härtesten Noten", Verlauf
  über die Zeit) — PRD-Non-Goal.
- **Statistiken während des laufenden Tastings** — die eigene Live-Rangliste ist PROJ-24.
- **„Kenner der Woche"** — PROJ-22.
- **Weitere Whisky-Angaben im Diagramm** (Fassart, Abfüller, Region) — nur die genannten Kennzahlen.
- **Export / Teilen der Diagramme** (Bild, PDF).
- **Preis privat halten pro Whisky** — wer ihn nicht teilen will, trägt keinen ein.
- **Nachträgliches Ändern** von Alkohol/Alter/Preis nach dem Abschluss.
- **Destillerie / Region im Eintrage-Formular** — bewusst nicht Teil von PROJ-25 (eigener Wunsch bei Bedarf).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Rangliste
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Mitglied die Rangliste öffnet, dann
  steht bei jedem Whisky seine Ausschank-Nummer („#3").
- [ ] Angenommen der Betrachter hat Whiskies dieses Tastings bewertet, wenn er die Rangliste
  öffnet, dann steht bei jedem von ihm bewerteten Whisky „Dein Platz: X".
- [ ] Angenommen zwei vom Betrachter bewertete Whiskies haben dieselbe eigene Gesamtpunktzahl,
  wenn die eigene Platzierung berechnet wird, dann entscheiden Gaumenpunkte, dann Nasenpunkte,
  dann die Ausschank-Reihenfolge — jeder Platz ist eindeutig.
- [ ] Angenommen der Betrachter hat einen Whisky nicht bewertet, wenn die Rangliste angezeigt
  wird, dann steht dort „Dein Platz: —", und der Whisky zählt bei seinen Plätzen nicht mit.
- [ ] Angenommen der Betrachter hat nichts bewertet (z. B. Whisky-Steward, nicht teilnehmendes
  Mitglied), wenn er die Rangliste öffnet, dann gibt es keine Angabe „Dein Platz".
- [ ] Angenommen die Rangliste wird auf einem 360 px breiten Handy angezeigt, wenn ein Tasting
  10 Whiskies hat, dann bleiben Ausschank-Nummer und eigene Platzierung ohne horizontales
  Scrollen lesbar.

### Erfassung im Eintrage-Formular (PROJ-5)
- [ ] Angenommen ein Teilnehmer trägt einen Whisky ein oder bearbeitet ihn (Tasting in
  Vorbereitung), wenn er das Formular öffnet, dann gibt es die optionalen Felder „Alkohol (%)",
  „Alter (Jahre)" und „Preis (€)".
- [ ] Angenommen der Teilnehmer gibt „46,3" bzw. „46.3" bei Alkohol ein, wenn er speichert,
  dann wird 46,3 % gespeichert (Komma und Punkt erlaubt, eine Nachkommastelle).
- [ ] Angenommen ein Wert liegt außerhalb (Alkohol nicht zwischen 0 und 100, Alter keine ganze
  Zahl zwischen 0 und 100, Preis negativ oder mehr als zwei Nachkommastellen), wenn er
  speichert, dann erscheint eine Validierungsmeldung am Feld, und nichts wird gespeichert.
- [ ] Angenommen die Felder bleiben leer, wenn er speichert, dann wird ohne diese Angaben
  gespeichert (alle drei optional).
- [ ] Angenommen ein bestehender Whisky wird bearbeitet, wenn das Formular öffnet, dann sind
  vorhandene Werte vorausgefüllt (mit Komma).
- [ ] Angenommen das Formular wird auf 360 px angezeigt, dann sind die drei Felder ohne
  horizontales Scrollen bedienbar (Zahlentastatur auf dem Handy).

### Freigabe von Alkohol, Alter, Preis
- [ ] Angenommen ein Tasting ist abgeschlossen, wenn ein Mitglied die Ergebnisseite öffnet,
  dann sind Alkoholgehalt, Alter und Preis jedes Whiskys sichtbar, sofern eingetragen —
  auch bei Tastings, die vor PROJ-25 abgeschlossen wurden.
- [ ] Angenommen ein Tasting läuft noch oder ist in Vorbereitung, wenn ein Teilnehmer
  (nicht Bringer, nicht Gastgeber/Whisky-Steward) die Angaben abfragt, dann bleiben sie
  verborgen (auch auf Datenbankebene).
- [ ] Angenommen ein Teilnehmer trägt einen Whisky ein, wenn er das Preisfeld sieht, dann steht
  dort der Hinweis „Wird nach dem Abschluss für alle sichtbar".

### Statistik-Karten
- [ ] Angenommen ≥ 2 Whiskies haben einen Preis, wenn der Abschnitt „Statistiken" angezeigt
  wird, dann erscheint der Preis-Leistungs-Sieger mit „X Punkte pro 10 €".
- [ ] Angenommen weniger als 2 Whiskies haben einen Preis, dann erscheint keine
  Preis-Leistungs-Karte.
- [ ] Angenommen ≥ 1 Whisky hat ≥ 3 Bewertungen, wenn die Statistiken angezeigt werden, dann
  erscheinen „Konsens-Whisky" (geringste Streuung) und „Umstrittenster Whisky" (größte
  Streuung); erfüllt nur ein einziger Whisky die Bedingung, erscheint nur die Karte
  „Konsens-Whisky" (derselbe Whisky wird nicht doppelt genannt).
- [ ] Angenommen kein Whisky hat ≥ 3 Bewertungen, dann erscheinen diese Karten nicht.
- [ ] Angenommen die Statistiken werden angezeigt, dann nennt die Karte „Nase gegen Gaumen" den
  Whisky mit dem größten Abstand zwischen Nasen- und Gaumenplatz, z. B. „Nase Platz 1,
  Gaumen Platz 6"; ist der größte Abstand 0, erscheint die Karte nicht.
- [ ] Angenommen der Betrachter hat mindestens 2 Whiskies bewertet, dann erscheint „Deine
  Übereinstimmung" mit „Deine Plätze lagen im Schnitt X Plätze neben der Runde" und „Dein
  Favorit landete in der Runde auf Platz Y".
- [ ] Angenommen der Betrachter hat weniger als 2 Whiskies bewertet, dann erscheint diese Karte nicht.

### Balkendiagramm
- [ ] Angenommen der Abschnitt „Statistiken", wenn das Balkendiagramm angezeigt wird, dann kann
  man zwischen den Kennzahlen Platzierung, Nasenpunkte, Gaumenpunkte, Alkohol, Alter und Preis
  umschalten.
- [ ] Angenommen eine Kennzahl ist gewählt, dann gibt es pro Whisky einen waagerechten Balken,
  beschriftet mit Ausschank-Nummer und Name („#3 Talisker 10") und dem Wert.
- [ ] Angenommen „Platzierung" ist gewählt, dann ist der Balken des besser platzierten Whiskys
  länger (Platz 1 = längster Balken).
- [ ] Angenommen bei einem Whisky fehlt Alkoholgehalt oder Preis, wenn diese Kennzahl gewählt
  ist, dann steht bei ihm „keine Angabe" statt eines Balkens.
- [ ] Angenommen bei einem Whisky fehlt das Alter, wenn „Alter" gewählt ist, dann zeigt sein
  Balken 3 Jahre, ist blasser dargestellt und mit „angenommen" beschriftet.
- [ ] Angenommen ein Tasting mit 10 Whiskies, wenn das Balkendiagramm auf 360 px angezeigt
  wird, dann sind alle Balken ohne Scrollen lesbar.

### Punktdiagramm
- [ ] Angenommen der Abschnitt „Statistiken", wenn das Punktdiagramm angezeigt wird, dann steht
  waagerecht das Alter und senkrecht die Gesamtpunkte.
- [ ] Angenommen das Punktdiagramm, dann lassen sich beide Achsen frei aus Gesamtpunkte,
  Nasenpunkte, Gaumenpunkte, Alkohol, Alter und Preis wählen.
- [ ] Angenommen jeder Punkt ist ein Whisky, wenn man ihn antippt, dann erscheinen
  Ausschank-Nummer, Name und die beiden Werte.
- [ ] Angenommen bei einem Whisky fehlt ein Wert einer gewählten Achse (Alkohol oder Preis),
  dann wird er nicht dargestellt, und unter dem Diagramm steht „N Whiskies ohne Angabe nicht
  dargestellt".
- [ ] Angenommen bei einem Whisky fehlt das Alter, dann wird er mit 3 Jahren dargestellt und
  sein Punkt als „angenommen" markiert.
- [ ] Angenommen weniger als 2 Whiskies lassen sich darstellen, dann zeigt das Diagramm statt
  Punkten „Zu wenige Angaben für dieses Diagramm".

### Allgemein & Leerzustände
- [ ] Angenommen ein abgeschlossenes Tasting ohne jede Bewertung, wenn die Ergebnisseite
  geöffnet wird, dann erscheint der Abschnitt „Statistiken" nicht (wie die Rangliste heute).
- [ ] Angenommen ein laufendes Tasting, wenn die Ergebnisseite geöffnet wird, dann gibt es
  weiterhin nur den „läuft noch"-Hinweis — keine Statistiken.
- [ ] Angenommen halbe Punkte, wenn Statistiken und Diagramme Werte zeigen, dann mit Komma
  („23,5"), ganze ohne Nachkommastelle.
- [ ] Angenommen Dark- und Light-Mode, dann sind Diagramme in beiden lesbar.

### Mitbehobene Bugs aus PROJ-19
- [ ] **(PROJ-19 BUG-2)** Angenommen ein Tasting, in dem nur 0-Punkte vergeben wurden, wenn die
  Historien-Liste angezeigt wird, dann wird der Rang-1-Whisky als Sieger genannt (nicht
  „kein Sieger"); „kein Sieger" nur, wenn es gar keine Bewertung gab.
- [ ] **(PROJ-19 BUG-1)** Angenommen ein 0,5er-Tasting, wenn eine Bewertung mit einer
  unzulässigen Nachkommastelle (z. B. 2,3) gespeichert werden soll, dann lautet die Meldung
  „Nur ganze oder halbe Punkte" (nicht „nur ganze Punkte").

## Edge Cases
- **Ein einziger Whisky:** Rangliste wie bisher; Diagramme zeigen einen Balken, das
  Punktdiagramm „Zu wenige Angaben"; Karten „Nase gegen Gaumen" / „Übereinstimmung" entfallen.
- **Alle Whiskies gleich bewertet:** Konsens = umstritten möglich → nur „Konsens" zeigen, wenn
  alle Streuungen gleich sind.
- **Gleichstand bei Statistik-Karten** (z. B. zwei Whiskies gleich günstig pro Punkt): der
  besser platzierte Whisky gewinnt, sonst die niedrigere Ausschank-Nummer.
- **Preis 0 €** (geschenkt): kein „Punkte pro 10 €" berechenbar → wie „keine Angabe" für die
  Preis-Leistung, im Diagramm als 0 € dargestellt.
- **Whisky ohne Bewertungen** in einem sonst bewerteten Tasting: 0 Punkte in Diagrammen,
  zählt nicht für Streuung.
- **Deaktiviertes Mitglied** als Bringer: Angaben werden trotzdem angezeigt (wie „mitgebracht von").
- **Admin, der nicht teilgenommen hat:** sieht alles außer „Dein Platz" / „Deine Übereinstimmung".
- **Sehr lange Whisky-Namen** in Diagramm-Beschriftungen: werden gekürzt, voller Name beim Antippen.

## Technical Requirements (optional)
- Freigabe von Alkohol/Alter/Preis nach dem Abschluss wird **auf Datenbankebene** geregelt;
  vor dem Abschluss bleibt die bestehende Blindheit unverändert.
- Mobile-first: alles bei 360 px ohne horizontales Scrollen; Rangliste bis 10 Whiskies ohne
  Scrollen lesbar (PRD-Constraint).
- Diagramme in Dark- und Light-Mode lesbar; Farben aus dem Design-System.

## Open Questions
- [x] Diagramm-Bibliothek und genaue Darstellung → `/architecture`: shadcn-Chart (Recharts), siehe Tech Design.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zwei Diagramme: Balken mit Kennzahl-Umschalter **und** Punktdiagramm mit wählbaren Achsen | Balken sind für die Runde sofort verständlich; das Punktdiagramm beantwortet Zusammenhangsfragen („gewinnen die älteren?") | 2026-10-05 |
| Preis wird nach dem Abschluss für alle sichtbar | Ermöglicht Preis-Leistung und Preis als Kennzahl; wer nicht teilen will, trägt keinen Preis ein; Hinweis im Formular | 2026-10-05 |
| Auch Preise alter Tastings werden sichtbar | Ausdrückliche Entscheidung des Nutzers — kleine, vertraute Runde | 2026-10-05 |
| Eigene Platzierung nur aus eigenen Punkten, Gleichstandsregel wie Gesamt-Rangliste | Eindeutige Plätze, gleiche Logik wie die Runde | 2026-10-05 |
| Unbewertete Whiskies „—", ohne eigene Bewertung keine „Dein Platz"-Angabe | Kein erfundener Platz | 2026-10-05 |
| Statistik-Abschnitt unter der Rangliste | Die Rangliste bleibt das Wichtigste und steht oben | 2026-10-05 |
| Preis-Leistung als „Punkte pro 10 €", nur ab 2 Preisen | Lesbare Zahl; mit einem Preis gibt es nichts zu vergleichen | 2026-10-05 |
| Konsens/umstritten erst ab 3 Bewertungen | Mit zwei Werten ist eine Streuung Zufall | 2026-10-05 |
| Übereinstimmung als „Ø X Plätze daneben" + „Favorit landete auf Platz Y" | Ohne Statistik-Vorwissen verständlich (keine Korrelationskoeffizienten) | 2026-10-05 |
| Fehlendes Alter → 3 Jahre (markiert); fehlender Alkohol/Preis → „keine Angabe" | Alter-Regel vom Nutzer vorgegeben (gesetzliches Mindestalter für Scotch); ein angenommener Alkohol/Preis würde das Bild verfälschen | 2026-10-05 |
| Punktdiagramm startet mit Alter × Gesamtpunkte | Die naheliegendste Frage der Runde | 2026-10-05 |
| Alkohol/Alter/Preis werden als Teil von PROJ-25 im Eintrage-Formular erfasst (Variante a) | Ohne Erfassung wären Diagramme und Preis-Leistung leer; DB-Seite existiert bereits, Aufwand klein. Destillerie/Region bewusst nicht ergänzt | 2026-10-05 |
| PROJ-19 BUG-1 und BUG-2 werden hier mit behoben | BUG-2 betrifft dieselbe Ergebnis-Anzeige; BUG-1 ist klein und thematisch verwandt | 2026-10-05 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Diagramme mit der shadcn-Chart-Komponente (baut auf Recharts auf) | „shadcn first"-Regel des Projekts; Farben/Themes (Dark/Light) kommen aus dem Design-System; Recharts kann Balken- und Punktdiagramme und Tooltips beim Antippen und ist React-19-tauglich | 2026-10-05 |
| Verworfen: eigene SVG-Diagramme | Weniger Abhängigkeit, aber Achsen, Tooltips, Touch und Barrierefreiheit müssten selbst gebaut werden | 2026-10-05 |
| Alkohol/Alter/Preis kommen über die bestehende Ranglisten-Sicht (drei Spalten angehängt), **keine** Änderung an den Zugriffsregeln der geheimen Whisky-Tabelle | Die Sicht liefert ohnehin nur abgeschlossene Tastings an aktive Mitglieder — „sichtbar erst nach dem Abschluss" ist damit automatisch erfüllt, ohne die Blindheits-Regeln anzufassen | 2026-10-05 |
| Alle Statistiken werden auf dem Server aus bereits geladenen Daten berechnet (eigenes, testbares Rechen-Modul), keine neuen Datenbank-Funktionen | 7–10 Whiskies, ein paar Dutzend Einzelwertungen — trivial klein; reine Funktionen sind einfach zu testen und später (PROJ-24) wiederverwendbar | 2026-10-05 |
| Eigene Platzierung aus den eigenen Bewertungszeilen des Betrachters | Die eigene Zeile ist nach RLS ohnehin lesbar; keine neue Freigabe nötig | 2026-10-05 |
| Historie-Sieger über „Anzahl Bewertungen des Siegers > 0" statt „Punkte > 0" (PROJ-19 BUG-2) | 0 Punkte sind seit PROJ-19 eine gültige Bewertung | 2026-10-05 |
| Eigener Fehlercode TS022 „Nur ganze oder halbe Punkte." (PROJ-19 BUG-1) | Trennt „kein halber Schritt" (TS022) sauber von „halbe Punkte in einem 1er-Tasting" (TS021) | 2026-10-05 |
| Eintrage-Formular: Alkohol/Alter/Preis über die bestehenden Wege (Anlegen-Funktion, spaltengenaue Änderung) | Datenbank akzeptiert die Felder bereits (Parameter und Spalten-Rechte vorhanden) — nur Formular und Prüfregeln fehlen | 2026-10-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Überwiegend **Oberfläche + Rechenlogik**. Die Datenbank bekommt nur eine kleine Migration
(Spalten an zwei bestehende Sichten anhängen, Meldung für BUG-1). Keine neue Tabelle, keine
neue Zugriffsregel, keine neue Route. **Ein neues Paket:** Recharts (über die shadcn-Chart-Komponente).

### A) Bausteine

```
Meine Whiskys – Eintrage-Dialog (PROJ-5)
+-- bestehend: Name, Video-Link, Notiz
+-- NEU: Alkohol (%)   Alter (Jahre)   Preis (€)   (Zahlentastatur, alle optional)
    +-- Hinweis am Preis: „Wird nach dem Abschluss für alle sichtbar"

Ergebnisseite (PROJ-9)
+-- Ergebnis-Kopf (unverändert)
+-- Rangliste
|   +-- Zeile: NEU „#3" (Ausschank-Nummer) + NEU „Dein Platz: 2" (nur wer bewertet hat)
|   +-- aufgeklappt: NEU Alkohol · Alter · Preis (sofern vorhanden)
+-- NEU Abschnitt „Statistiken" (nur wenn es Bewertungen gibt)
    +-- Karten (je nur, wenn die Bedingung erfüllt ist)
    |   +-- Preis-Leistungs-Sieger
    |   +-- Konsens-Whisky / Umstrittenster Whisky
    |   +-- Nase gegen Gaumen
    |   +-- Deine Übereinstimmung
    +-- Balkendiagramm
    |   +-- Umschalter (Tabs): Platzierung · Nase · Gaumen · Alkohol · Alter · Preis
    |   +-- ein waagerechter Balken je Whisky „#3 Talisker 10"; „keine Angabe" / „angenommen"
    +-- Punktdiagramm
        +-- zwei Auswahlfelder: X-Achse, Y-Achse (Start: Alter × Gesamtpunkte)
        +-- Punkte antippbar (Tooltip: #, Name, beide Werte)
        +-- Fußzeile „N Whiskies ohne Angabe nicht dargestellt"

Historien-Liste (PROJ-9)
+-- Sieger-Anzeige mit korrigierter Regel (BUG-2)
```

### B) Daten — was neu erfasst oder sichtbar wird

**Erfassung (Eintrage-Formular):** Alkohol (0–100 %, eine Nachkommastelle), Alter (ganze
Jahre 0–100), Preis (€, ≥ 0, zwei Nachkommastellen) — alle optional. Die Datenbank kennt die
Felder seit PROJ-1; es fehlten nur Formular und Prüfregeln.

**Freigabe nach dem Abschluss:** Die bestehende Ranglisten-Sicht liefert zusätzlich
Alkohol, Alter und Preis je Whisky. Diese Sicht zeigt **nur abgeschlossene** Tastings und
**nur aktiven Mitgliedern** — vor dem Abschluss bleibt alles wie heute verborgen.

**Historie:** Die Historien-Sicht liefert zusätzlich die Anzahl der Bewertungen des
Siegers (für BUG-2).

**Eigene Platzierung / Übereinstimmung:** aus den eigenen Bewertungszeilen des Betrachters,
die er heute schon lesen darf.

### C) Rechenlogik (eigenes Modul, rein, unit-getestet)
Ein Modul „Ergebnis-Statistiken" bekommt Rangliste, Einzelwertungen und die eigenen
Bewertungen und liefert:
- eigene Platzierung je Whisky (Gleichstand: Gesamt → Gaumen → Nase → Ausschank)
- Preis-Leistung (Punkte pro 10 €; Preis 0 oder leer → nicht berücksichtigt; ≥ 2 Preise)
- Streuung je Whisky (ab 3 Bewertungen) → Konsens / umstritten (nicht doppelt)
- Nasen- und Gaumen-Platz je Whisky → größter Abstand (0 → keine Karte)
- Übereinstimmung: Ø Platzabstand über selbst bewertete Whiskies (ab 2), Platz des eigenen Favoriten
- Diagramm-Daten je Kennzahl inkl. „fehlt" / „angenommen" (Alter 3)
- Gleichstände bei Karten: besser platziert, dann niedrigere Ausschank-Nummer

Berechnet wird auf dem Server beim Laden der Ergebnisseite; an die Diagramme gehen nur die
fertigen Zahlen.

### D) Diagramme
shadcn-Chart-Komponente (Recharts) als Client-Bausteine:
- **Balken:** waagerecht, Beschriftung gekürzt, voller Name im Tooltip; bei „Platzierung" ist
  Platz 1 der längste Balken. Fehlende Werte als Text „keine Angabe".
- **Punkte:** zwei Achsen-Auswahlen (shadcn Select), Antippen zeigt Tooltip; ausgelassene
  Whiskies in einer Fußzeile; < 2 darstellbare → „Zu wenige Angaben".
- Farben über die Design-System-Variablen → Dark/Light automatisch.
- Höhe so bemessen, dass 10 Balken bei 360 px ohne Scrollen passen.

### E) Mitbehobene PROJ-19-Bugs
- **BUG-2:** Historie nennt den Sieger, sobald er mindestens eine Bewertung hat (statt „Punkte > 0").
- **BUG-1:** Die Bewertungs-Prüfung beim Speichern unterscheidet „kein ganzer/halber Schritt"
  (neu TS022 „Nur ganze oder halbe Punkte.") von „halbe Punkte im 1er-Tasting" (TS021).

### F) Migration (eine Datei)
1. Ranglisten-Sicht: Alkohol, Alter, Preis **ans Ende angehängt** (bestehende Spalten,
   Filter und Rechte unverändert).
2. Historien-Sicht: Anzahl Bewertungen des Siegers angehängt.
3. Bewertungs-Prüfung: TS022 für Werte, die kein Vielfaches von 0,5 sind.
Danach Typen neu erzeugen. Ausrollen wie gewohnt: `db:push` → App. Die alte App ignoriert
die neuen Spalten.

### G) Tests
- **Unit:** Rechen-Modul (alle Karten, Gleichstände, Leerzustände, Alter-Annahme),
  Formular-Schema (Komma/Punkt, Grenzen).
- **DB-Integration:** neue Spalten nur bei abgeschlossenen Tastings sichtbar (laufendes
  Tasting: Teilnehmer sieht weder über Sicht noch Tabelle Alkohol/Alter/Preis); BUG-1 (TS022);
  Historie mit 0-Punkten.
- **E2E:** Formular-Felder, „#3" + „Dein Platz", Karten, Umschalter, Achsenwahl, 360 px, Dark Mode.

### H) Abhängigkeiten (Pakete)
- `recharts` — über `npx shadcn@latest add chart` (bringt die shadcn-Chart-Hülle mit)

### Arbeitsaufteilung
- `/backend` (klein, zuerst): Migration, Typen, Integrationstests.
- `/frontend`: Formular-Felder, Rangliste-Ergänzungen, Rechen-Modul, Karten, Diagramme, BUG-2-Anzeige.

### Implementation Notes (Backend, 2026-10-05)
- Migration `supabase/migrations/20261007120000_results_stats.sql`:
  - `whisky_rankings` per `create or replace` um `abv`, `age_years`, `price_eur` **am Ende**
    erweitert (Filter `closed` + `is_active_member()`, Rechte, Gleichstandsregel unverändert).
  - `past_tastings` um `winner_rating_count` erweitert (PROJ-19 BUG-2).
  - `tg_ratings_step`: zuerst „kein Vielfaches von 0,5" → **TS022** „Nur ganze oder halbe
    Punkte.", danach wie bisher TS021 (PROJ-19 BUG-1).
  - Keine Änderung an RLS / `whisky_details`-Zugriffsregeln.
- App-Server: `schemas/whiskies.ts` um `abv` / `ageYears` / `price` (Strings, Komma oder Punkt;
  Alkohol 0–100 mit 1 Nachkommastelle, Alter ganze Jahre 0–100, Preis ≥ 0 mit ≤ 2
  Nachkommastellen) + Helfer `toNumber`; `actions/whiskies.ts` reicht die Werte an `add_whisky`
  (`p_abv`, `p_age_years`, `p_price_eur`) und an die spaltengenaue Änderung durch;
  `errors.ts` TS022.
- Tests: Unit 154/154 (neu: 5 Fälle Alkohol/Alter/Preis). Neuer Integrationstest
  `results-stats.integration.test.ts` (6 Fälle: Erfassen, Ändern, verborgen während des
  Tastings über Sicht **und** Tabelle, sichtbar nach Abschluss, Historie-Sieger bei 0-Punkten,
  ohne Bewertung); `rating-scale` erwartet jetzt strikt TS022. Laufen nach `db:push`.
- `db:push` durch den Nutzer am 2026-10-05, danach `db:types` (4 neue Zeilen). `npm run test:rls`: **156/156** grün (inkl. 6 neue + TS022 strikt).

### Implementation Notes (Frontend, 2026-10-05)
- **Neu:** `src/lib/result-stats.ts` (+ 19 Unit-Tests) — eigene Platzierung, Preis-Leistung,
  Streuung/Konsens/umstritten, Nase gegen Gaumen, Übereinstimmung, Kennzahl-Werte inkl.
  Alter-Annahme, Anzeige-Helfer `formatMetric` / `detailsLine`.
- **Neu:** `components/results/stats-section.tsx` (Karten + Rahmen),
  `metric-bar-chart.tsx` (shadcn Tabs als Umschalter, Recharts-Balken, eigene einzeilige
  Beschriftung — Recharts hätte „3 J. (angenommen)" sonst umgebrochen),
  `metric-scatter-chart.tsx` (zwei shadcn Selects, Tooltip beim Antippen, Hinweise
  „ohne Angabe" / „blasse Punkte"). `components/ui/chart.tsx` über `npx shadcn add chart`
  (bringt `recharts` ^2.15). Farben über `--chart-1` (Dark/Light).
- **Abfrage:** `queries/results.ts` lädt Alkohol/Alter/Preis aus `whisky_rankings` und die
  eigenen Punkte, berechnet die Statistiken auf dem Server; Historie nutzt
  `winner_rating_count` (BUG-2 behoben).
- **Rangliste:** „#N" vor dem Namen, „Dein Platz: X / —" unter den Punkten (nur wer bewertet
  hat), Zeile „46 % · 18 J. · 129 €" unter Destillerie/Region. **Abweichung vom Design:** die
  Angaben stehen direkt in der Zeile statt erst im aufgeklappten Bereich — kurz genug und
  ohne Tippen sichtbar.
- **Formular:** drei Felder nebeneinander (Alkohol/Alter/Preis, `inputMode` decimal/numeric),
  Hinweis zur Sichtbarkeit nach dem Abschluss; Liste „Meine Whiskys" zeigt die Angaben;
  Bearbeiten füllt sie mit Komma vor.
- **Feinschliff nach Sichtprüfung (Screenshot 360 px):** Achsenbeschriftung stärker gekürzt;
  bei Übereinstimmung 0 der Text „Deine Reihenfolge stimmte genau mit der Runde überein."
  statt „0,0 Plätze".
- Tests: Unit 173/173, Lint + Typecheck grün. E2E `PROJ-25-statistiken.spec.ts` (10) +
  Regression PROJ-5/9/15/19 (Chromium): **63/63 grün**.

## QA Test Results

**Tested:** 2026-10-05
**App URL:** http://localhost:3000 (Production-Build) gegen die Live-DB mit eingespielter
Migration `20261007120000_results_stats.sql` (vorher geprüft: kein echtes Tasting aktiv)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Erfassung im Eintrage-Formular
- [x] Felder Alkohol / Alter / Preis vorhanden (Anlegen + Bearbeiten) — E2E
- [x] „46,3" mit Komma gespeichert — E2E (DB geprüft) + Unit
- [x] Ungültige Werte → Meldung am Feld, nichts gespeichert — E2E + Unit
- [x] Leer → ohne Angaben gespeichert — Unit + Integration
- [x] Bearbeiten: Werte mit Komma vorausgefüllt — E2E
- [x] 360 px, Zahlentastatur (`inputMode`) — E2E (Overflow) + Code

#### Freigabe von Alkohol, Alter, Preis
- [x] Nach dem Abschluss für alle Mitglieder sichtbar — Integration + E2E
- [x] Vorher verborgen, auch auf DB-Ebene (Sicht **und** Tabelle) — Integration
- [x] Hinweis zur Sichtbarkeit im Formular — E2E

#### Rangliste
- [x] Ausschank-Nummer „#N" — E2E
- [x] „Dein Platz: X" — E2E
- [x] Gleichstand Gaumen → Nase → Ausschank — Unit
- [x] Nicht bewertet → „—" — Unit + Code
- [x] Ohne eigene Bewertung keine „Dein Platz"-Angabe — E2E (Nicht-Teilnehmer)
- [x] 10 Whiskies auf 360 px ohne horizontales Scrollen — E2E

#### Statistik-Karten
- [x] Preis-Leistung ab 2 Preisen („7,4 Punkte pro 10 €"), sonst keine Karte — E2E + Unit
- [x] Konsens / umstritten ab 3 Bewertungen; nur ein Kandidat → nur Konsens — E2E + Unit
- [x] Keine ≥ 3 Bewertungen → keine Karten — Unit + E2E (einzelner Whisky)
- [x] Nase gegen Gaumen inkl. „Nase Platz 1, Gaumen Platz 6"-Text; Abstand 0 → keine Karte — Unit + Sichtprüfung
- [x] Übereinstimmung ab 2 eigenen Bewertungen („stimmte genau …" bzw. „Ø X Plätze") — E2E + Unit
- [x] Weniger als 2 eigene Bewertungen → keine Karte — Unit + E2E

#### Balkendiagramm
- [x] Umschalter Platzierung · Nase · Gaumen · Alkohol · Alter · Preis — E2E
- [x] Balken je Whisky „#3 Name" + Wert — E2E + Sichtprüfung (Screenshot 360 px)
- [x] Platzierung: Platz 1 = längster Balken — Sichtprüfung
- [x] Fehlender Alkohol/Preis → „keine Angabe" — E2E
- [x] Fehlendes Alter → 3 J., blasser, „angenommen" — E2E + Sichtprüfung
- [x] 10 Whiskies auf 360 px ohne Scrollen (Diagrammhöhe ≤ 400 px) — E2E

#### Punktdiagramm
- [x] Start Alter × Gesamtpunkte — E2E
- [x] Beide Achsen frei wählbar — E2E
- [x] Antippen zeigt #, Name, Werte (Tooltip) — Code + Sichtprüfung
- [x] Fehlende Werte weggelassen + „N Whiskies ohne Angabe nicht dargestellt" — E2E
- [x] Fehlendes Alter → 3 Jahre, markiert („Blasse Punkte …") — E2E
- [x] < 2 darstellbare → „Zu wenige Angaben" — E2E

#### Allgemein & Leerzustände
- [x] Ohne jede Bewertung kein Abschnitt „Statistiken" — Code (`hasAnyRatings`) + PROJ-9-Regression
- [x] Laufendes Tasting: nur „läuft noch"-Hinweis — PROJ-9-Regression
- [x] Halbe Punkte mit Komma — Unit (`formatMetric`)
- [x] Dark- und Light-Mode — E2E (Dark) + Design-Tokens `--chart-1`

#### Mitbehobene PROJ-19-Bugs
- [x] BUG-2: Historie nennt Sieger bei reinen 0-Punkten — E2E + Integration
- [x] BUG-1: „Nur ganze oder halbe Punkte" (TS022) — Integration

### Edge Cases Status
- [x] Ein einziger Whisky — E2E
- [x] Alle gleich gestreut → nur Konsens — Unit
- [x] Gleichstände bei Karten → besser platziert — Unit
- [x] Preis 0 € → nicht in Preis-Leistung — Unit
- [x] Whisky ohne Bewertungen → 0 Punkte, keine Streuung — Unit
- [x] Admin / Nicht-Teilnehmer → kein „Dein Platz" / keine Übereinstimmung — E2E
- [x] Sehr lange Namen → gekürzt, voller Name im Tooltip — E2E (10 lange Namen) + Sichtprüfung

### Security Audit Results
- [x] Blindheit unverändert: Alkohol/Alter/Preis eines laufenden Tastings weder über die
  Ranglisten-Sicht noch über `whisky_details` lesbar — Integration
- [x] Freigabe nur für aktive Mitglieder (bestehender Sicht-Filter) — unverändert, Regression grün
- [x] XSS über Whisky-Namen (`<img onerror>`) in Karten, Achsen und Tooltips: nur als Text
  dargestellt, kein Skript ausgeführt — E2E
- [x] Eingaben Alkohol/Alter/Preis serverseitig (Zod) und per DB-CHECK begrenzt
- [x] Keine RLS-Änderung, keine neue Route, keine neuen Umgebungsvariablen; neues Paket
  `recharts` über die shadcn-Chart-Komponente

### Automatisierte Tests
- Unit: **173/173** (u. a. `result-stats.test.ts` 19 Fälle, Whisky-Schema)
- DB-Integration: **156/156** (u. a. `results-stats.integration.test.ts`)
- E2E `PROJ-25-statistiken.spec.ts`: **13 Tests × Chromium + Mobile Safari = 26/26 grün**
  (inkl. QA-Ergänzungen: 10 Whiskies / 360 px, einzelner Whisky, XSS)
- Regression E2E (Chromium) PROJ-4/5/6/7/8/9/10/11/14/15/16/18/19: alles grün bis auf die
  **3 vorbestehenden** Seed-Admin-Tests (PROJ-4, PROJ-6, PROJ-14) — bekanntes Backlog-Problem

### Bugs Found

#### BUG-1: Diagramme haben keine Textalternative für Screenreader
- **Severity:** Low
- **Steps to Reproduce:**
  1. Abgeschlossenes Tasting → Ergebnisseite → Abschnitt „Statistiken"
  2. Mit Screenreader zu den Diagrammen navigieren
  3. Expected: Name/Beschreibung des Diagramms (z. B. „Balkendiagramm: Platzierung") oder eine Tabelle
  4. Actual: das `aria-label` sitzt auf einem `div` ohne Rolle und wird ignoriert; die SVG-Inhalte sind nicht sinnvoll vorlesbar
- **Abmilderung:** alle Werte stehen auch in der Rangliste (Punkte, Angaben) und in den Karten
- **Priority:** Nice to have — z. B. `role="img"` am Diagramm-Container plus eine kurze Textzusammenfassung

### Summary
- **Acceptance Criteria:** 41/41 bestanden
- **Bugs Found:** 1 total (0 critical, 0 high, 0 medium, 1 low)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy. Migration ist bereits eingespielt. Nicht während eines laufenden Tastings deployen.

## Deployment

- **Production URL:** https://tfg-app-self.vercel.app
- **Deployed:** 2026-10-05 als `v1.9.0` (Push `8a6136c` auf `main` → Vercel-Auto-Deploy)
- **DB-Migration:** `20261007120000_results_stats.sql` vorab per `db:push` durch den Nutzer
  eingespielt (Reihenfolge DB → App eingehalten); `db:types` neu erzeugt
- **Neues Paket:** `recharts` ^2.15 (über `npx shadcn add chart`)
- **Pre-Deploy:** kein Tasting aktiv, Lint + Production-Build grün, keine neuen Umgebungsvariablen
- **Post-Deploy-Verifikation:** `tests/PROJ-25-statistiken.spec.ts` + `tests/PROJ-19-punkteskala.spec.ts`
  gegen die Produktions-URL — **46/46 grün** (Chromium + Mobile Safari)
- **Behoben mit diesem Release:** PROJ-19 BUG-1 (TS022) und BUG-2 (Historie-Sieger bei 0-Punkten)
- **Offen (Low):** BUG-1 — Diagramme ohne Textalternative für Screenreader (im Post-Deploy-Backlog)
- **Rollback:** Vercel → vorherige Version „Promote to Production". Die alte App ignoriert die
  neuen Sicht-Spalten; die Migration muss nicht zurückgedreht werden.
