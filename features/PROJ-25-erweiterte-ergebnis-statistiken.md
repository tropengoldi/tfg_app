# PROJ-25: Erweiterte Ergebnis-Statistiken

## Status: Planned
**Created:** 2026-10-05
**Last Updated:** 2026-10-05

## Dependencies
- **Requires: PROJ-9 (Ergebnisse & Historie)** — Ergebnisseite, Rangliste, Historien-Liste.
- **Requires: PROJ-19 (Flexible Punkteskala)** — Punkte können halbe Werte und 0 sein;
  Anzeige über den gemeinsamen Punkte-Helfer.
- **Nutzt PROJ-5 (Whisky-Erfassung)** — Alkoholgehalt, Alter und Preis werden dort (optional)
  erfasst; das Eintrage-Formular bekommt einen Hinweis zur Preis-Sichtbarkeit.
- **Behebt PROJ-19 BUG-1 und BUG-2** (siehe unten).

## Kontext

Nach dem Abschluss zeigt die Ergebnisseite heute die Rangliste mit Name, Destillerie,
Region, „mitgebracht von", Punkten und Video. **Nicht** sichtbar sind: die
Ausschank-Nummer, die eigene Sicht des Betrachters, sowie Alkoholgehalt, Alter und Preis —
diese Angaben werden beim Eintragen erfasst, bleiben aber auch nach der Auflösung geheim.

PROJ-25 ergänzt die Ergebnisseite um:
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
- [ ] Diagramm-Bibliothek und genaue Darstellung → `/architecture`.

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
| PROJ-19 BUG-1 und BUG-2 werden hier mit behoben | BUG-2 betrifft dieselbe Ergebnis-Anzeige; BUG-1 ist klein und thematisch verwandt | 2026-10-05 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
