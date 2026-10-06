# PROJ-24: Eigene Live-Rangliste

## Status: Planned
**Created:** 2026-10-06
**Last Updated:** 2026-10-06

## Dependencies
- **Requires: PROJ-7 (Bewertungsansicht)**: Dort erscheint die Rangliste, und die eigenen Bewertungen sind ihre Datenbasis.
- **Requires: PROJ-19 (Punkteskala)**: Halbe Punkte und 0 Punkte gehen in Summe und Reihenfolge ein.
- **Requires: PROJ-22 (Sieger-Tipp)**: Pokal-Markierung und Tippen aus der Liste heraus.
- **Abgestimmt mit PROJ-25 (Erweiterte Ergebnis-Statistiken)**: Es gilt dieselbe Platzierungsregel wie bei „Dein Platz“.

## Kontext

Während eines laufenden Tastings sieht jeder Mitverkoster in der Bewertungsansicht seine
**persönliche** Rangliste. Sie wird nur aus den **eigenen gespeicherten** Wertungen berechnet und zeigt
blinde Nummern („Whisky 3“), keine Namen und keine fremden Punkte. Über einen Pokal-Knopf je Zeile
kann man direkt aus der Liste den Sieger-Tipp setzen. Nach dem Abschluss bleibt die Liste sichtbar
und zeigt dann zusätzlich die aufgelösten Whisky-Namen.

## User Stories
- Als **Teilnehmer** möchte ich während des Tastings sehen, in welcher Reihenfolge ich die bisherigen
  Whiskies bewertet habe. So behalte ich den Überblick über meinen Favoriten, ohne Zettel.
- Als **Teilnehmer** möchte ich aus meiner Rangliste direkt zu einem Whisky springen, um meine
  Bewertung zu korrigieren, wenn mir die Reihenfolge nicht mehr stimmig vorkommt.
- Als **Teilnehmer** möchte ich in meiner Rangliste sehen, auf welchen Whisky ich als Sieger getippt
  habe, und den Tipp mit einem Tippen dort ändern.
- Als **Teilnehmer** möchte ich, dass niemand sonst meine Rangliste sieht und ich keine fremden Punkte
  sehe. Die Blindheit soll halten.
- Als **Teilnehmer** möchte ich nach dem Abschluss meine Rangliste mit den echten Namen sehen, um sie
  mit der Runde zu vergleichen.
- Als **Teilnehmer** möchte ich, dass die Rangliste beim Bewerten nicht stört. Sie ist standardmäßig
  zugeklappt, und meine Wahl bleibt gespeichert.

## Out of Scope
- **Rangliste auf dem Dashboard:** nur in der Bewertungsansicht (Entscheidung 2026-10-06).
- **Fremde Punkte, Durchschnitt der Runde, Zwischenstände anderer:** Das widerspräche der Blindheit.
  Der Live-Einblick für den Steward ist PROJ-20.
- **Rangliste per Ziehen umsortieren:** Die Reihenfolge ergibt sich nur aus den Punkten. Wer sie
  ändern will, ändert die Bewertung.
- **Unbewertete Whiskies in der Liste:** Sie erscheinen nicht. Auf sie tippt man weiter über das
  Tipp-Feld (PROJ-22).
- **Vergleichs-Merker** („Whisky 2 ↔ 5 nochmal vergleichen“): PROJ-23.
- **Geteilte Plätze bei Gleichstand:** Es gilt die eindeutige Regel aus PROJ-25.
- **Statistik über mehrere Tastings:** PRD-Non-Goal.
- **Live-Aktualisierung über Geräte hinweg:** Eine Bewertung, die auf einem anderen Gerät gespeichert
  wurde, erscheint nach dem Aktualisieren der Seite, wie bisher bei den Bewertungen (PROJ-7).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anzeige während des Tastings
- [ ] Angenommen ein Tasting läuft, der erste Whisky ist ausgeschenkt und der Nutzer verkostet mit,
  wenn er die Bewertungsansicht öffnet, dann gibt es unterhalb der Bewertungskarte einen
  aufklappbaren Bereich „Meine Rangliste (X von N bewertet)“.
- [ ] Angenommen der Nutzer öffnet die Bewertungsansicht zum ersten Mal, dann ist der Bereich
  zugeklappt.
- [ ] Angenommen der Nutzer hat den Bereich aufgeklappt, wenn er die Seite neu lädt oder zum nächsten
  Whisky wechselt, dann bleibt der Bereich auf diesem Gerät aufgeklappt. Das gilt genauso für
  „zugeklappt“.
- [ ] Angenommen der Nutzer hat 3 von 8 Whiskies bewertet, wenn er den Bereich aufklappt, dann sieht
  er genau 3 Zeilen der Form „1. Whisky 3 · 12 Punkte · Nase 4 · Gaumen 8“. Unbewertete Whiskies
  erscheinen nicht.
- [ ] Angenommen das Tasting bewertet in halben Punkten, dann werden Punkte mit Komma angezeigt
  („11,5“), wie in der übrigen App.
- [ ] Angenommen der Nutzer hat noch nichts bewertet, wenn er den Bereich aufklappt, dann steht dort
  „Noch nichts bewertet — deine Rangliste füllt sich mit jeder Bewertung.“

### Reihenfolge
- [ ] Angenommen zwei Whiskies haben dieselbe Gesamtpunktzahl, dann entscheidet zuerst die höhere
  Gaumenpunktzahl, dann die höhere Nasenpunktzahl, dann die kleinere Ausschank-Nummer. Jeder Platz
  ist eindeutig.
- [ ] Angenommen das Tasting ist abgeschlossen, dann stimmen die Plätze der eigenen Rangliste mit
  „Dein Platz“ auf der Ergebnisseite (PROJ-25) überein.
- [ ] Angenommen der Nutzer bewertet einen Whisky neu oder ändert eine Bewertung, wenn er speichert,
  dann ordnet sich die Rangliste sofort neu, ohne dass er die Seite neu laden muss.
- [ ] Angenommen der Nutzer hat Werte verändert, aber noch nicht gespeichert, dann zeigt die
  Rangliste weiterhin den zuletzt gespeicherten Stand.

### Zum Whisky springen
- [ ] Angenommen die Rangliste ist aufgeklappt, wenn der Nutzer eine Zeile antippt, dann zeigt die
  Bewertungskarte diesen Whisky mit seinen gespeicherten Werten.
- [ ] Angenommen der Nutzer hat ungespeicherte Änderungen am aktuell gezeigten Whisky, wenn er eine
  Zeile antippt, dann erscheint dieselbe Rückfrage wie beim Wechsel über die Positionsleiste
  („Nicht gespeicherte Bewertung“).

### Sieger-Tipp in der Rangliste
- [ ] Angenommen der Nutzer hat auf einen Whisky getippt, der in seiner Rangliste steht, dann trägt
  dessen Zeile einen ausgefüllten Pokal-Knopf („Dein Tipp“).
- [ ] Angenommen der Nutzer tippt in einer anderen Zeile auf den leeren Pokal-Knopf („Als Sieger
  tippen“), dann wird der Tipp sofort gespeichert. Es erscheint eine kurze Bestätigung, der Pokal
  wandert in diese Zeile, und das Tipp-Feld oben zeigt denselben Whisky.
- [ ] Angenommen der Nutzer ändert den Tipp über das Tipp-Feld oben, dann wandert der Pokal in der
  Rangliste mit.
- [ ] Angenommen der getippte Whisky ist noch nicht bewertet, dann steht kein Pokal in der Liste, und
  das Tipp-Feld oben zeigt den Tipp weiter an.
- [ ] Angenommen das Speichern des Tipps schlägt fehl (z. B. Netzwerk), dann erscheint eine
  Fehlermeldung, und der Pokal bleibt beim zuletzt gespeicherten Tipp.
- [ ] Angenommen der Nutzer tippt auf den ausgefüllten Pokal seines aktuellen Tipps, dann passiert
  nichts. Ein Tipp lässt sich nicht zurücknehmen, nur ändern (wie in PROJ-22).

### Nach dem Abschluss
- [ ] Angenommen das Tasting ist abgeschlossen und der Nutzer hat bewertet, wenn er die
  Bewertungsansicht öffnet, dann ist „Meine Rangliste“ weiterhin vorhanden. Jede Zeile zeigt
  zusätzlich den aufgelösten Whisky-Namen („1. Whisky 3 · Talisker 10 · 12 Punkte …“).
- [ ] Angenommen das Tasting ist abgeschlossen, dann sind die Pokal-Knöpfe nicht mehr bedienbar. Der
  Pokal beim getippten Whisky bleibt als Markierung sichtbar.

### Blindheit & Berechtigungen
- [ ] Angenommen ein Tasting läuft, dann enthält die Rangliste keine Whisky-Namen und keine fremden
  Punkte, auch nicht in den Daten, die an den Browser gehen.
- [ ] Angenommen der Nutzer ist Whisky-Steward oder nimmt nicht teil, dann sieht er keine
  Rangliste, weil er die Bewertungsansicht nicht erreicht.
- [ ] Angenommen das Tasting ist in Vorbereitung oder der erste Whisky ist noch nicht ausgeschenkt,
  dann gibt es keine Rangliste.

### Mobil
- [ ] Angenommen ein 360 px breites Handy und 10 bewertete Whiskies, dann ist die aufgeklappte
  Rangliste ohne horizontales Scrollen lesbar. Zeilen und Pokal-Knöpfe sind mindestens 44 px hoch.
- [ ] Angenommen lange Whisky-Namen nach dem Abschluss, dann werden sie umgebrochen oder gekürzt,
  ohne dass die Punkte aus dem Bild rutschen.

## Edge Cases
- **Nur ein Whisky bewertet:** Die Liste hat eine Zeile mit Platz 1. Das ist in Ordnung.
- **Alle mit 0/0 bewertet (PROJ-19):** Die Reihenfolge ergibt sich dann nur aus der
  Ausschank-Nummer. Alle Zeilen zeigen „0 Punkte“.
- **Gastgeber schaltet weiter, während die Liste offen ist:** Die Liste bleibt offen, und der Fokus
  springt wie bisher auf den neuen Whisky. Die Liste ändert sich erst, wenn etwas gespeichert wird.
- **Gastgeber schließt ab, während die Liste offen ist:** Nach der Aktualisierung erscheinen die
  Namen, und die Pokal-Knöpfe sind gesperrt. Ein Tipp, der genau in diesem Moment abgeschickt wird,
  wird wie in PROJ-22 mit Meldung abgelehnt.
- **Zwei Geräte:** Auf Gerät A gespeicherte Bewertungen erscheinen auf Gerät B nach dem
  Aktualisieren. Ein auf Gerät A geänderter Tipp ebenso.
- **Gespeicherter Auf-/Zu-Zustand nicht lesbar** (privates Fenster, gesperrter Speicher): Die Liste
  startet zugeklappt, und es gibt keine Fehlermeldung.
- **Tasting mit 10 Whiskies, alle bewertet:** Alle 10 Zeilen sind ohne inneres Scrollen sichtbar
  (PRD: bis 10 ohne Scrollen lesbar).

## Technical Requirements (optional)
- Die Blindheit gilt wie bisher auf Datenbankebene. Die Rangliste nutzt während des Tastings nur
  Daten, die der Nutzer ohnehin lesen darf (eigene Bewertungen, Ausschank-Nummern).
- Die Platzierungsregel ist an genau einer Stelle definiert und wird von PROJ-25 („Dein Platz“) und
  PROJ-24 gemeinsam genutzt.

## Open Questions
- [x] Soll der Bereich auch vor dem ersten Ausschank (Tasting läuft, Position 0) schon leer
  sichtbar sein? **Nein.** Er erscheint erst, wenn der erste Whisky ausgeschenkt ist
  (Nutzer, 2026-10-06).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Ort: Bewertungsansicht, aufklappbar unter der Bewertungskarte | Dort ist man während des Tastings ohnehin, kein Wechsel nötig. Zugeklappt lenkt sie nicht ab | 2026-10-06 |
| Zeile: Platz, „Whisky N“, Gesamtpunkte, Nase · Gaumen; Zeile antippbar → springt zum Whisky | Abstände und Gleichstände werden sichtbar, und Korrigieren geht schnell | 2026-10-06 |
| Gleichstand wie „Dein Platz“ (PROJ-25): Gesamt → Gaumen → Nase → Ausschank-Nr. | Kein Widerspruch zwischen Live-Rangliste und Ergebnisseite | 2026-10-06 |
| Nach dem Abschluss bleibt die Liste sichtbar und zeigt zusätzlich die Namen | Ausdrücklicher Nutzerwunsch: die eigene Reihenfolge mit Namen auf einen Blick, direkt in der Bewertungsansicht | 2026-10-06 |
| Sieger-Tipp in der Liste: Pokal-Markierung **und** Tippen per Pokal-Knopf am Zeilenende | Ausdrücklicher Nutzerwunsch. Ein eigener Knopf, weil die Zeile schon „zum Whisky springen“ bedeutet | 2026-10-06 |
| Standardmäßig zugeklappt, Wahl wird pro Gerät gemerkt | Bewerten steht im Vordergrund. Wer die Liste mag, muss nicht jedes Mal aufklappen | 2026-10-06 |
| Nur **gespeicherte** Bewertungen zählen | Die Liste soll nicht bei jedem Schieberegler-Ruck springen. Gleiches Prinzip wie der Haken in der Positionsleiste | 2026-10-06 |
| Unbewertete Whiskies erscheinen nicht | Ohne Bewertung kein Platz (wie „Dein Platz: —“ in PROJ-25). Tippen darauf weiter über das Tipp-Feld | 2026-10-06 |
| Tipp nicht zurücknehmbar, nur änderbar | Gleiche Regel wie in PROJ-22 | 2026-10-06 |
| Vor dem ersten Ausschank kein Bereich | Dort ist noch keine Bewertung möglich, ein leerer Bereich wäre nur Ballast | 2026-10-06 |
| Keine Rangliste auf dem Dashboard | Bewusst schlank gehalten. Kann später per `/refine` ergänzt werden | 2026-10-06 |

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
