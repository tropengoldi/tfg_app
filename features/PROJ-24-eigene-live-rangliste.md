# PROJ-24: Eigene Live-Rangliste

## Status: Deployed
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
| Kein Backend-Umbau, keine Migration, kein neues Paket | Alle Daten liegen in der Bewertungsansicht schon vor (eigene Bewertungen + Ausschank-Nummern). Nach dem Abschluss kommen die Namen aus der bestehenden Ranglisten-Sicht | 2026-10-06 |
| Rangliste wird im Browser aus den eigenen gespeicherten Bewertungen berechnet | Während des Tastings gehen keine neuen Daten an den Browser, die Blindheit bleibt unberührt. Nach jedem Speichern wird ohnehin neu geladen, also ordnet sich die Liste sofort neu | 2026-10-06 |
| Eine gemeinsame Platzierungsregel für PROJ-24 und „Dein Platz“ (PROJ-25) | Bisher steckt die Regel in der Ergebnis-Statistik. Sie wird zu einer neutralen Stelle verschoben und von beiden genutzt. So können Live-Rangliste und Ergebnisseite nicht auseinanderlaufen | 2026-10-06 |
| Whisky-Namen nur im abgeschlossenen Tasting aus der Sicht `whisky_rankings` | Die Sicht liefert Namen ausschließlich für abgeschlossene Tastings, die Datenbank erzwingt das also. Im laufenden Tasting wird gar nicht danach gefragt | 2026-10-06 |
| Rangliste sitzt **in** der Bewertungsansicht-Komponente, nicht daneben | Nur so nutzt „Zeile antippen“ denselben Wechsel samt Rückfrage bei ungespeicherten Änderungen wie die Positionsleiste, ohne dass Logik doppelt entsteht | 2026-10-06 |
| Gemeinsamer Tipp-Zustand für Tipp-Feld und Pokal-Knöpfe | Heute merkt sich das Tipp-Feld seinen Tipp allein. Künftig halten beide einen gemeinsamen Stand und nutzen dieselbe Speicher-Aktion samt Fehlerbehandlung (BUG-1-Fix aus PROJ-22). So bleiben Feld und Pokal immer synchron | 2026-10-06 |
| Auf-/Zu-Zustand im Browser-Speicher des Geräts, für alle Tastings gemeinsam | „Pro Gerät merken“ ist genau das. Kein Server-Speicher nötig, und wer die Liste mag, hat sie auch beim nächsten Abend offen. Ist der Speicher gesperrt, startet die Liste zugeklappt (abgefangen, ohne Fehlermeldung) | 2026-10-06 |
| Aufklapp-Bereich mit shadcn `Collapsible` (wie „Alle Tipps“ und „Einzelbewertungen“) | Bereits installiert und in der App etabliert, gleiches Verhalten für Tastatur und Screenreader | 2026-10-06 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Ein reines Frontend-Feature. Die Rangliste wird im Browser aus den eigenen **gespeicherten**
Bewertungen berechnet, die die Bewertungsansicht schon heute lädt. Neu aus der Datenbank kommen
nur die Whisky-Namen, und zwar ausschließlich im abgeschlossenen Tasting, über die bestehende
Ranglisten-Sicht. Es gibt keine Migration, kein neues Paket, keine neue Seite und keine neue Route.

### A) Bausteine

```
Bewertungsseite (/tastings/[id]/bewerten)
+-- NEU: gemeinsamer Tipp-Zustand (umschließt Tipp-Feld + Bewertungsansicht)
|   +-- Tipp-Feld „Dein Sieger-Tipp“ (PROJ-22, liest/schreibt jetzt den gemeinsamen Stand)
|   +-- Bewertungsansicht (PROJ-7)
|       +-- Positionsleiste (bestehend)
|       +-- Bewertungskarte (bestehend)
|       +-- NEU: „Meine Rangliste (X von N bewertet)“, aufklappbar, Grundzustand zu
|           +-- Leerzustand „Noch nichts bewertet — …“
|           +-- Zeile je bewertetem Whisky
|               +-- Platz · „Whisky N“ · [nach Abschluss: Name] · Punkte · Nase · Gaumen
|               |   (antippen → springt zum Whisky, Rückfrage bei Ungespeichertem)
|               +-- Pokal-Knopf ≥ 44 px: ausgefüllt = „Dein Tipp“, leer = „Als Sieger tippen“
|                   (nach Abschluss gesperrt, Markierung bleibt)
```

Nicht angezeigt wird der Bereich im Entwurf, vor dem ersten Ausschank, für den Steward und für
Nicht-Teilnehmer. Die letzten beiden erreichen die Seite ohnehin nicht.

### B) Daten

| Was | Woher | Wann |
|---|---|---|
| Eigene Bewertungen (Nase, Gaumen) | wie bisher, nur die eigenen | immer |
| Ausschank-Nummern | wie bisher | immer |
| Eigener Sieger-Tipp | wie bisher (PROJ-22) | laufend + abgeschlossen |
| **Whisky-Namen** | NEU: Ranglisten-Sicht | **nur abgeschlossen** |
| Auf/Zu der Liste | Browser-Speicher des Geräts | immer, gerätelokal |

**Platzierung:** Gesamtpunkte ↓, dann Gaumen ↓, dann Nase ↓, dann Ausschank-Nummer ↑. Diese Regel
liegt künftig an **einer** Stelle, die sich Live-Rangliste und „Dein Platz“ (PROJ-25) teilen.

### C) Abläufe
- **Bewertung speichern** → die Seite lädt den neuen Stand (wie bisher) → die Liste ordnet sich neu.
- **Zeile antippen** → derselbe Wechsel wie über die Positionsleiste, inklusive Rückfrage bei
  ungespeicherten Werten.
- **Pokal antippen** → dieselbe Speicher-Aktion wie das Tipp-Feld. Bei Erfolg wandern Pokal und
  Feld gemeinsam mit, bei Fehler gibt es eine Meldung und beide bleiben beim alten Tipp.
- **Abschluss durch den Gastgeber** → die Ansicht aktualisiert sich live (bestehender Mechanismus).
  Danach erscheinen die Namen, und die Pokale sind gesperrt.

### D) Sicherheit / Blindheit
Während des Tastings gehen keine zusätzlichen Daten an den Browser. Namen liefert die Ranglisten-
Sicht nur für abgeschlossene Tastings, das erzwingt die Datenbank. Der Tipp läuft weiter über
die bestehende Datenbank-Funktion mit allen Regeln aus PROJ-22.

### E) Tests
- **Unit:** gemeinsame Platzierungsregel (Gleichstände, halbe Punkte, 0/0, Unbewertete fehlen) und
  die Zeilen-Aufbereitung. Bestehende Tests zu „Dein Platz“ laufen unverändert weiter.
- **E2E:** Grundzustand zu und gemerkt; Zeilen und Reihenfolge; Neuordnen nach dem Speichern;
  Zeile antippen inkl. Rückfrage; Pokal setzen und Feld synchron; Fehlerfall Tipp; nach dem Abschluss
  Namen und gesperrte Pokale; kein Bereich vor dem ersten Ausschank; 360 px mit 10 Whiskies.
- **Regression:** PROJ-7, PROJ-22, PROJ-25 („Dein Platz“).

### F) Abhängigkeiten (Pakete)
Keine. `Collapsible` (shadcn) ist bereits installiert.

### Arbeitsaufteilung
Nur `/frontend`. Kein `/backend` nötig, weil es keine Datenbankänderung gibt und nur eine
zusätzliche Leseabfrage auf eine bestehende Sicht hinzukommt.

### Implementation Notes (Frontend, 2026-10-06)
- **Platzierungsregel** `src/lib/own-ranking.ts` (`rankOwnRatings`, + 6 Unit-Tests). `ownPlacements`
  in `result-stats.ts` (PROJ-25 „Dein Platz“) nutzt sie jetzt ebenfalls. Die bestehenden Tests
  laufen unverändert grün.
- **Gemeinsamer Tipp-Zustand** `rating/winner-tip-context.tsx` (`WinnerTipProvider` /
  `useWinnerTip`): ein Speicherweg inkl. Netzwerkfehler-Abfang (PROJ-22 BUG-1). `winner-tip-field.tsx`
  liest und schreibt nur noch darüber (Props jetzt nur `total`). Die Bewertungsseite umschließt
  Tipp-Feld und Bewertungsansicht im laufenden und im abgeschlossenen Zweig mit dem Provider.
- **Rangliste** `rating/own-ranking.tsx`: shadcn `Collapsible` unter der Bewertungskarte, in
  `rating-view.tsx` eingebaut (Zeile → `requestSwitch`, also dieselbe Rückfrage wie die
  Positionsleiste). Zeile: Platz · „Whisky N“ [· Name] · Nase · Gaumen · Gesamt. Der Whisky im
  Fokus ist hinterlegt. Pokal-Knopf 44 px, `aria-pressed`, im abgeschlossenen Tasting gesperrt.
- **Auf/Zu** im `localStorage` (`whizzky.own-ranking.open`, gerätweit) über `useSyncExternalStore`:
  Der Server rendert „zu“, es gibt keine Hydration-Abweichung. Ist der Speicher gesperrt, wird der
  Zustand nur bis zum Neuladen gemerkt, ohne Fehlermeldung.
- **Namen** nach dem Abschluss: `getRatingViewData` fragt `whisky_rankings` nur bei Status `closed`.
- Kein neues Paket, keine Migration. Lint sauber, Unit 189/189, `npm run build` ok. Regression E2E
  PROJ-7/22/25: 42/42 grün (Chromium). Sichtprüfung per Screenshots bei 360 px (laufend,
  nach Neuladen, abgeschlossen mit langen Namen).
- **Für /qa notiert (vorbestehend, PROJ-7):** Im abgeschlossenen Tasting zeigt die Bewertungskarte
  weiterhin „Gespeichert — du kannst die Werte noch ändern.“

## QA Test Results

**Tested:** 2026-10-06
**App URL:** http://localhost:3000 gegen die Live-DB (vorher und nachher geprüft: kein aktives
Tasting, keine Test-Events übrig)
**Tester:** QA Engineer (AI)
**Browser:** Chromium (Desktop) + Mobile Safari (WebKit, iPhone 13); 360 px per Viewport

### Automatisierte Tests
- Unit: **189/189** (davon 6 in `src/lib/own-ranking.test.ts`; die PROJ-25-Tests zu `ownPlacements`
  laufen nach der Umstellung auf die gemeinsame Regel unverändert grün)
- E2E neu `tests/PROJ-24-eigene-rangliste.spec.ts`: **18/18** in Chromium, **18/18** in Mobile
  Safari. Mit `--workers=1` laufen lassen, weil die Suite aktive Events startet.
- Regression: PROJ-22 (Tipp-Feld läuft jetzt über den gemeinsamen Zustand) **19/19** in Mobile
  Safari. PROJ-7, PROJ-19, PROJ-25 grün in Chromium. PROJ-8 und PROJ-9 einzeln **22/22** grün. Im
  gemeinsamen Lauf mit anderen Specs fielen 2 PROJ-8/9-Tests um (Dashboard sieht ein „gerade
  abgeschlossenes“ Event einer anderen Spec). Das ist das bekannte Backlog-Thema „E2E-Specs
  sharden / `--workers=1`“ und betrifft keine von PROJ-24 berührte Seite.
- Zusätzlich während `/frontend`: Sichtprüfung per Screenshot bei 360 px (laufend, nach
  Neuladen, abgeschlossen mit langen Namen).

### Acceptance Criteria Status

#### Anzeige während des Tastings
- [x] Bereich „Meine Rangliste (X von N bewertet)“ unter der Bewertungskarte
- [x] Beim ersten Öffnen zugeklappt
- [x] Auf/Zu bleibt über Neuladen und Whisky-Wechsel erhalten (in beide Richtungen)
- [x] Nur bewertete Whiskies, Zeile mit Platz · „Whisky N“ · Nase · Gaumen · Gesamt
- [x] Halbe Punkte mit Komma („13,5“, „Nase 4,5“)
- [x] Leerzustand „Noch nichts bewertet — …“

#### Reihenfolge
- [x] Gleichstand: Gaumen → Nase → Ausschank-Nummer, eindeutige Plätze (Unit)
- [x] Nach dem Abschluss: Plätze = „Dein Platz“ auf der Ergebnisseite (E2E, 4 Whiskies)
- [x] Nach dem Speichern sofort neu geordnet, ohne Neuladen
- [x] Ungespeicherte Werte ändern die Liste nicht

#### Zum Whisky springen
- [x] Zeile antippen → Karte zeigt den Whisky mit gespeicherten Werten
- [x] Bei ungespeicherten Änderungen dieselbe Rückfrage „Nicht gespeicherte Bewertung“

#### Sieger-Tipp in der Rangliste
- [x] Ausgefüllter Pokal (`aria-pressed`) beim getippten Whisky
- [x] Pokal in anderer Zeile setzt den Tipp sofort; Bestätigung, Pokal wandert, Tipp-Feld zieht mit
- [x] Tipp über das Feld geändert → Pokal wandert mit
- [x] Getippter Whisky unbewertet → kein Pokal in der Liste, Feld zeigt den Tipp
- [x] Speichern schlägt fehl → Meldung, Pokal und Feld bleiben beim alten Tipp
- [x] Eigenen Tipp-Pokal erneut antippen → nichts passiert

#### Nach dem Abschluss
- [x] Liste bleibt, zusätzlich mit Whisky-Namen
- [x] Pokale gesperrt, Tipp bleibt markiert

#### Blindheit & Berechtigungen
- [x] Laufendes Tasting: kein Whisky-Name in der ausgelieferten Seite (HTML inkl. eingebetteter Daten)
- [x] Steward erreicht die Bewertungsansicht nicht, also keine Rangliste
- [x] In Vorbereitung und vor dem ersten Ausschank: keine Rangliste

#### Mobil
- [x] 360 px, 10 bewertete Whiskies: kein horizontales Scrollen, kein inneres Scrollen, Zeilen und
  Pokale ≥ 44 px
- [x] Lange Namen nach dem Abschluss brechen um, die Punkte bleiben sichtbar (Screenshot)

### Edge Cases Status
- [x] Nur ein Whisky bewertet / alles 0/0: eine Zeile bzw. Reihenfolge nach Ausschank-Nummer (Unit)
- [x] Gastgeber schaltet weiter: Fokus springt, die Liste bleibt offen (Whisky-Wechsel-Test)
- [x] Gastgeber schließt ab: bestehender Live-Refresh der Bewertungsansicht (PROJ-7); danach Namen
  und gesperrte Pokale (E2E nach Abschluss)
- [x] Gesperrter Gerätespeicher: startet zu, lässt sich öffnen, keine Fehlerseite (E2E mit
  werfendem `localStorage`)
- [x] 10 Whiskies ohne inneres Scrollen (E2E)
- [x] Zwei Geräte: Daten kommen bei jedem Laden frisch vom Server, wie in PROJ-7/22

### Security Audit Results
- [x] Keine neue Schreib-Schnittstelle. Der Tipp läuft weiter über `set_winner_tip` mit allen
  PROJ-22-Regeln
- [x] Namen werden nur bei Status `closed` abgefragt. Die Sicht `whisky_rankings` liefert sie
  ohnehin nur für abgeschlossene Tastings (DB-Ebene). E2E bestätigt: keine Namen im HTML
- [x] Nur eigene Bewertungen gehen in die Liste, es entsteht kein neuer Lesezugriff auf fremde Daten
- [x] `localStorage` hält nur „offen/zu“, keine personenbezogenen oder geheimen Daten
- [x] XSS: Namen werden als React-Text gerendert

### Bugs Found

#### BUG-1 (Low, vorbestehend aus PROJ-7): falscher Hinweis auf der Bewertungskarte nach dem Abschluss — BEHOBEN
- **Fix (2026-10-06):** `rating-view.tsx` zeigt bei nicht bearbeitbarer Ansicht „Gespeichert.“ bzw.
  „Nicht bewertet.“. Per E2E abgesichert (Abschluss-Test in `PROJ-24-eigene-rangliste.spec.ts`).
- **Steps to Reproduce:** abgeschlossenes Tasting → Bewertungsansicht → Karte eines bewerteten Whiskys
- **Expected:** ein Hinweis wie „Gespeichert.“ ohne Aufforderung zum Ändern
- **Actual:** „Gespeichert — du kannst die Werte noch ändern.“, obwohl alles eingefroren ist
- **Priority:** Nice to have. Nicht durch PROJ-24 entstanden, fällt hier aber stärker auf, weil die
  Seite nach dem Abschluss jetzt häufiger geöffnet wird

#### BUG-2 (Low): Screenreader-Text der gesperrten Pokale nach dem Abschluss — BEHOBEN
- **Fix (2026-10-06):** `own-ranking.tsx` benennt gesperrte, nicht getippte Pokale
  „Whisky N, nicht getippt“. Per E2E abgesichert (`toHaveAccessibleName`).
- **Steps to Reproduce:** abgeschlossenes Tasting → Rangliste aufklappen → Pokal einer nicht
  getippten Zeile mit dem Screenreader ansteuern
- **Expected:** z. B. „Whisky 3, nicht getippt“
- **Actual:** „Whisky 3 als Sieger tippen, gesperrt“: Der Text nennt eine Aktion, die es nicht mehr gibt
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 25/25 passed
- **Bugs Found:** 2 total (0 critical, 0 high, 0 medium, 2 low; davon 1 vorbestehend aus PROJ-7) — beide behoben;
  Nachtest PROJ-24 + PROJ-7 in Chromium und Mobile Safari 48/48 grün
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy

## Deployment

- **Production URL:** https://tfg-app-self.vercel.app
- **Deployed:** 2026-10-06 als `v1.11.0` (Push `f530a97` auf `main` → Vercel-Auto-Deploy, Status success)
- **DB-Migration:** keine (reines Frontend-Feature)
- **Pre-Deploy:** kein Tasting aktiv, Lint + Production-Build grün, keine neuen
  Umgebungsvariablen, kein neues Paket
- **Post-Deploy-Verifikation:** `tests/PROJ-24-eigene-rangliste.spec.ts`, `tests/PROJ-22-sieger-tipp.spec.ts`
  und `tests/PROJ-7-bewertungsansicht.spec.ts` gegen die Produktions-URL: **86/86 grün** (Chromium +
  Mobile Safari; 8 PROJ-7-Fälle laufen bewusst nur in Chromium). Danach kein aktives Tasting und
  keine Test-Events übrig
- **Behoben mit diesem Release:** PROJ-24 BUG-1 (vorbestehend aus PROJ-7: „du kannst die Werte noch
  ändern“ nach dem Abschluss) und BUG-2 (Screenreader-Text gesperrter Pokale)
- **Nebenwirkung:** „Dein Platz“ (PROJ-25) nutzt jetzt dieselbe Platzierungsregel wie die Live-Rangliste
  (gleiches Ergebnis, nur eine Stelle im Code)
- **Rollback:** Vercel → vorherige Version „Promote to Production“. Es gibt keine DB-Änderung, die
  zurückgenommen werden müsste
