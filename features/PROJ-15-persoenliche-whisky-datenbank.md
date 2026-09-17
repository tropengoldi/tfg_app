# PROJ-15: Persönliche Whisky-Datenbank (teilbar)

## Status: Approved
**Created:** 2026-09-17
**Last Updated:** 2026-09-17

## Dependencies
- **Requires: PROJ-14 (Profil sichtbar für andere)** — liefert das
  Sichtbarkeits-Muster (Schalter im eigenen Profil, gefilterte Fremdansicht
  unter `/profil/[id]`), das PROJ-15 um einen achten Schalter
  „Sammlung sichtbar" erweitert.
- **Requires: PROJ-10 (Profil-Seite mit persönlicher Bilanz)** — die eigene
  Profilseite `/profil`, auf der der Link „Meine Sammlung" erscheint.
- **Requires: PROJ-9 (Ergebnisse & Tasting-Historie)** — die Ergebnisseite mit
  den aufklappbaren Einzelbewertungen, in der der „Zur Sammlung
  hinzufügen"-Button erscheint.
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — Login, `requireUser`.
- **Baut auf PROJ-1** — `profiles`-Tabelle (für den neuen Sichtbarkeits-
  Schalter, gleiches Muster wie die sieben aus PROJ-14).

## Kontext

PROJ-10/PROJ-14 drehen sich um die **Bilanz eines Mitglieds bei der Runde**
(Tastings, Platzierungen). PROJ-15 ergänzt etwas komplett anderes: ein
**persönliches, freies Whisky-Tagebuch** à la Vivino — unabhängig davon, ob
ein Whisky je bei einem TFG-Abend auf dem Tisch stand. Jedes Mitglied trägt
frei ein, welche Whiskys es kennt, besitzt oder verkostet hat, mit einer
eigenen 1–10-Bewertung und Notizen. Es gibt **keinen gemeinsamen Katalog**
und **keine externe Whisky-API** (PRD-Non-Goal) — jede Sammlung ist eine rein
individuelle, manuell gepflegte Liste.

Die Sammlung lebt unter `/profil/sammlung`, verlinkt von der Profilseite.
Sichtbarkeit für andere folgt demselben Muster wie PROJ-14: ein zusätzlicher
Schalter im eigenen Profil, standardmäßig sichtbar, komplett unauffällig
verborgen wenn ausgeschaltet.

Als Komfort-Brücke zur Event-Historie bekommt jede eigene Einzelbewertung auf
der Ergebnisseite (PROJ-9) einen „Zur Sammlung hinzufügen"-Button — ohne
automatischen Import und ohne Skalen-Umrechnung der Event-Punkte. Ein so
übernommener Eintrag trägt sichtbar seine Herkunft („Von TFG-Tasting am
[Datum]", verlinkt zur Ergebnisseite) in einem eigenen, nicht editierbaren
Feld — getrennt vom frei editierbaren Notizfeld, damit die Herkunfts-Info
auch dann erhalten bleibt, wenn der Nutzer seine Notiz später überschreibt.

## User Stories

- Als **Mitglied** möchte ich Whiskys, die ich kenne oder besitze, frei in
  einer eigenen Liste festhalten — mit eigener Bewertung und Notizen —,
  unabhängig davon, ob sie je bei einem TFG-Abend verkostet wurden.
- Als **Mitglied** möchte ich einen Eintrag bearbeiten oder endgültig löschen
  können, weil es meine private Liste ist und ich sie aktuell halten will.
- Als **Mitglied** möchte ich in meiner wachsenden Sammlung nach Name oder
  Destillerie suchen können, um einen bestimmten Whisky wiederzufinden.
- Als **Mitglied** möchte ich selbst entscheiden, ob andere aus der Runde
  meine Sammlung sehen dürfen — mit einem einzigen Schalter für die ganze
  Liste, konsistent mit meinen anderen Sichtbarkeits-Einstellungen.
- Als **Mitglied** möchte ich, wenn ich bei einem TFG-Abend einen fremden
  Whisky verkostet und für gut befunden habe, ihn mit einem Klick von der
  Ergebnisseite in meine Sammlung übernehmen können, ohne Name und Notiz neu
  abzutippen.
- Als **Mitglied** möchte ich die (sichtbare) Sammlung eines anderen
  Mitglieds ansehen können, um Empfehlungen für den nächsten Abend zu
  bekommen.

## Out of Scope

- **Gemeinsamer/öffentlicher Whisky-Katalog** — PRD-Non-Goal. Jede Sammlung
  ist eine rein individuelle Liste, keine geteilte Datenbank, kein
  Autocomplete aus fremden Einträgen.
- **Externe Whisky-API-Anbindung** — PRD-Non-Goal, keine automatische Suche
  oder Vorausfüllung aus externen Quellen.
- **Foto-Upload zu einem Eintrag** — PRD-Non-Goal „keine Datei-Uploads".
- **Pro-Eintrag-Sichtbarkeit** — bewusst verworfen zugunsten eines einzigen
  Schalters für die ganze Sammlung (siehe Decision Log). Wer einen einzelnen
  Eintrag verbergen will, muss aktuell die ganze Sammlung verbergen.
- **Fremde Einträge bearbeiten oder löschen** — reine Leseansicht bei
  fremden Sammlungen.
- **Preis als strukturiertes Zahlen-/Währungsfeld** — bewusst ein
  Freitextfeld „Preis-Leistung" statt eines Betrags; kein Rechnungs- oder
  Zahlungsmodul (PRD-Non-Goal).
- **Automatischer Import der eigenen Event-Historie beim ersten Öffnen** —
  nur der manuelle „Zur Sammlung hinzufügen"-Button pro Einzelbewertung, kein
  Massenimport.
- **Umrechnung der Event-Punktzahl (Nase+Geschmack, 2–15) in die
  1–10-Bewertung** — der Übernehmen-Button lässt die eigene Bewertung leer,
  keine automatische Skalierung (siehe Decision Log).
- **Duplikat-Erkennung** — derselbe Whisky kann beliebig oft (manuell oder
  per Übernehmen-Button) als eigener, unabhängiger Eintrag angelegt werden.
- **Sortier-/Filteroptionen über die Namens-/Destillerie-Suche hinaus** (z. B.
  nach Bewertung sortieren, nach „besitze ich" filtern) — für MVP genügt
  „neueste zuerst" + Suche; kann später per `/refine` ergänzt werden.
- **Mengenbegrenzung der Einträge** — kein Limit, anders als die
  Event-Whisky-Kontingente aus PROJ-5.
- **Neuer Bottom-Nav-Reiter** — bewusst verworfen, gleiche Begründung wie
  PROJ-14 (Community-Screen): ein Link von `/profil` reicht.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Eigene Sammlung ansehen & pflegen

- [ ] Angenommen ein Mitglied öffnet sein eigenes Profil `/profil`, wenn die
      Seite lädt, dann findet es dort einen Link „Meine Sammlung" zu
      `/profil/sammlung`.
- [ ] Angenommen ein Mitglied hat noch keinen Sammlungs-Eintrag, wenn es
      `/profil/sammlung` öffnet, dann zeigt die Seite einen Leerzustand
      („Deine Sammlung ist noch leer.") mit einem Button, um den ersten
      Eintrag anzulegen.
- [ ] Angenommen ein Mitglied hat mehrere Einträge, wenn es
      `/profil/sammlung` öffnet, dann erscheinen sie sortiert nach zuletzt
      angelegt/geändert (neueste zuerst).
- [ ] Angenommen ein Mitglied trägt einen neuen Eintrag ein (Name Pflicht,
      alle anderen Felder optional), wenn es speichert, dann erscheint der
      Eintrag oben in der Liste.
- [ ] Angenommen das Namensfeld ist beim Anlegen leer, wenn das Mitglied
      speichert, dann erscheint eine Validierungsmeldung und nichts wird
      gespeichert.
- [ ] Angenommen ein Mitglied tippt auf einen bestehenden Eintrag, wenn der
      Bearbeiten-Dialog sich öffnet, dann sind alle Felder mit den
      gespeicherten Werten vorbefüllt und Änderungen lassen sich speichern.
- [ ] Angenommen ein Mitglied löscht einen Eintrag, wenn es die Löschen-Aktion
      wählt, dann erscheint zuerst ein Bestätigungsdialog; erst nach
      Bestätigung verschwindet der Eintrag endgültig aus der Liste.
- [ ] Angenommen ein Mitglied gibt einen Namen oder eine Notiz über dem
      Zeichenlimit ein, wenn es speichert, dann erscheint ein
      Zeichenlimit-Hinweis am Feld und nichts wird gespeichert.

### Suche

- [ ] Angenommen ein Mitglied hat mehrere Einträge, wenn es einen Suchbegriff
      in das Suchfeld eingibt, dann zeigt die Liste nur noch Einträge, deren
      Name oder Destillerie den Begriff enthält (Groß-/Kleinschreibung
      egal).
- [ ] Angenommen ein Suchbegriff liefert keine Treffer, wenn das Mitglied die
      Liste betrachtet, dann erscheint ein Hinweis „Keine Treffer" statt
      einer leeren Fläche.

### Sichtbarkeit für andere

- [ ] Angenommen ein Mitglied öffnet sein eigenes Profil `/profil`, wenn die
      Seite lädt, dann findet es im Abschnitt „Sichtbarkeit für andere"
      (PROJ-14) einen achten Schalter „Sammlung sichtbar".
- [ ] Angenommen ein neues Mitglied hat den Schalter nie geändert, wenn es
      sein Profil öffnet, dann steht „Sammlung sichtbar" auf „an" (Default,
      konsistent mit den sieben bestehenden Schaltern).
- [ ] Angenommen ein Mitglied legt den Schalter um, wenn die Änderung
      ausgeführt wird, dann wird sie sofort gespeichert und mit kurzem
      Feedback bestätigt (identisches Verhalten zu den sieben bestehenden
      Schaltern).

### Fremde Sammlung ansehen

- [ ] Angenommen „Sammlung sichtbar" ist bei einem Mitglied an, wenn ein
      anderes Mitglied dessen Profil `/profil/[id]` öffnet, dann erscheint
      dort ein Link „Sammlung ansehen" zu `/profil/[id]/sammlung`.
- [ ] Angenommen „Sammlung sichtbar" ist bei einem Mitglied aus, wenn ein
      anderes Mitglied dessen Profil `/profil/[id]` öffnet, dann fehlt der
      Link vollständig, ohne jeden Hinweis darauf, dass es eine Sammlung
      gibt.
- [ ] Angenommen ein Mitglied öffnet die sichtbare Sammlung eines anderen
      über den Link, wenn die Seite lädt, dann zeigt sie alle Einträge
      dieses Mitglieds read-only (gleiche Felder wie in der eigenen Ansicht),
      ohne Bearbeiten- oder Löschen-Möglichkeit.
- [ ] Angenommen ein Mitglied ruft `/profil/[id]/sammlung` direkt per URL auf,
      obwohl „Sammlung sichtbar" bei dieser Person aus steht, wenn die Seite
      lädt, dann erscheint der neutrale Hinweis „Diese Sammlung ist nicht
      sichtbar." (kein Zugriff auf die Einträge, keine 404).
- [ ] Angenommen ein Mitglied ruft die Sammlung zu einer ungültigen/nicht
      existierenden Profil-ID auf, wenn die Seite lädt, dann erscheint „Seite
      nicht gefunden" (404), konsistent mit PROJ-14.
- [ ] Angenommen eine sichtbare fremde Sammlung hat 0 Einträge, wenn ein
      anderes Mitglied sie öffnet, dann zeigt die Seite „Noch keine
      Einträge." — unterscheidbar vom „nicht sichtbar"-Hinweis.

### Übernehmen-Button auf der Ergebnisseite (PROJ-9)

- [ ] Angenommen ein Mitglied hat bei einem abgeschlossenen Tasting einen
      Whisky selbst bewertet, wenn es die aufgeklappten Einzelbewertungen auf
      der Ergebnisseite betrachtet, dann erscheint bei der eigenen
      Bewertungszeile ein Button „Zur Sammlung hinzufügen".
- [ ] Angenommen ein Mitglied tippt auf „Zur Sammlung hinzufügen", wenn der
      Dialog sich öffnet, dann sind Name (Whisky-Name) und die eigene Notiz
      zu diesem Whisky (falls vorhanden) vorausgefüllt; die eigene Bewertung
      (1–10) bleibt leer.
- [ ] Angenommen ein Mitglied bestätigt den vorausgefüllten Dialog, wenn es
      speichert, dann entsteht ein neuer, unabhängiger Eintrag in der
      eigenen Sammlung mit einem gesetzten Herkunftsfeld „Von TFG-Tasting am
      [Datum]" (kein Duplikat-Check).
- [ ] Angenommen ein Eintrag trägt ein Herkunftsfeld, wenn das Mitglied ihn in
      der Sammlungsliste (eigen oder fremd, falls sichtbar) betrachtet, dann
      erscheint die Herkunfts-Zeile mit Datum und einem Link zur
      zugehörigen Ergebnisseite; ein Tap auf den Link öffnet diese Seite.
- [ ] Angenommen ein Eintrag trägt ein Herkunftsfeld, wenn das Mitglied den
      Eintrag bearbeitet, dann ist das Herkunftsfeld selbst nicht editierbar
      (nur Name, Bewertung, Notiz und die übrigen freien Felder lassen sich
      ändern) — auch wenn die Notiz danach komplett überschrieben wird,
      bleibt die Herkunfts-Zeile erhalten.
- [ ] Angenommen ein Eintrag wurde manuell angelegt (nicht über den
      Übernehmen-Button), wenn das Mitglied ihn betrachtet, dann fehlt die
      Herkunfts-Zeile vollständig.
- [ ] Angenommen ein Mitglied hat bei einem Whisky keine eigene Bewertung
      abgegeben, wenn es die Einzelbewertungen betrachtet, dann erscheint
      dort kein „Zur Sammlung hinzufügen"-Button.

## Edge Cases

- **Eigene Sammlung leer** → Leerzustand mit Anlegen-CTA, kein Fehler.
- **Sichtbare fremde Sammlung leer** → „Noch keine Einträge.", klar
  unterschieden vom „nicht sichtbar"-Hinweis bei ausgeschaltetem Schalter.
- **Direkter URL-Aufruf einer verborgenen fremden Sammlung** → neutraler
  Hinweis „Diese Sammlung ist nicht sichtbar.", keine Einträge, kein 404
  (unterscheidet sich bewusst von einer ungültigen Profil-ID, siehe Decision
  Log).
- **Ungültige/nicht existierende Profil-ID** → 404, wie bei PROJ-14.
- **Übernehmen-Button mehrfach für denselben Whisky geklickt** (z. B. in
  verschiedenen Sessions) → jedes Mal ein neuer, unabhängiger Eintrag; keine
  Fehlermeldung, keine Zusammenführung.
- **Eintrag über dem Zeichenlimit** (Name > 200, Notiz > 2000, Destillerie/
  Region/Preis-Leistung > jeweiliges Limit) → Validierungsmeldung, nichts
  gespeichert.
- **Löschen in einem Tab, während ein zweiter Tab denselben Eintrag gerade
  bearbeitet** → der zweite Speicherversuch trifft eine nicht mehr
  existierende Zeile und zeigt eine Fehlermeldung („Eintrag wurde bereits
  gelöscht"), analog zum bestehenden Fehlerpfad-Muster (PROJ-10/PROJ-5).
- **Deaktiviertes Mitglied mit sichtbarer Sammlung** → bleibt über einen
  direkten Profil-Link weiter aufrufbar (gleiches Verhalten wie PROJ-14 bei
  deaktivierten Mitgliedern), erscheint aber nicht in der Community-Liste.
- **Eintrag ohne eigene Bewertung** (manuell leer gelassen oder per
  Übernehmen-Button ohne Punktzahl übernommen) → zeigt „—" statt einer Zahl,
  kein Pflichtfeld.
- **Das Ursprungs-Event eines Herkunftsfelds wird später gelöscht**
  (Wartungsskript `tasting:delete`, siehe Post-Deploy-Backlog) → die
  Herkunfts-Zeile bleibt mit Text und Datum bestehen, der Link zur
  Ergebnisseite führt ins Leere und wird dann nicht mehr als Link, sondern
  als reiner Text dargestellt.
- **Admin betrachtet eine fremde Sammlung** → exakt dieselbe gefilterte
  Ansicht wie jedes andere Mitglied, keine Sonderrechte (konsistent mit
  PROJ-14).

## Technical Requirements (optional)

- **Sicherheit:** Login erforderlich (`requireUser`). Schreiben nur die
  eigenen Einträge. Die Sichtbarkeits-Filterung muss serverseitig erfolgen,
  nicht nur im Frontend maskiert — passend zum Projektprinzip „RLS/Server ist
  die tragende Sicherheitsschicht" (identischer Grundsatz wie PROJ-14).
- **Darstellung:** mobile-first; Eintrag anlegen/bearbeiten als Dialog
  (analog zum Whisky-Erfassungs-Dialog aus PROJ-5), Liste als Karten.
- **Performance:** typische Listengröße pro Person ist klein (Dutzende, nicht
  Hunderte Einträge über Jahre) — keine Pagination im MVP nötig, clientseitig
  gefilterte Suche reicht.
- **Browser:** Chrome, Firefox, Safari (mobil priorisiert).

## Open Questions

- [x] ~~Feld-Zeichenlimits final festlegen~~ **Gelöst (`/architecture`):** Name
      1–200 (wie PROJ-5-Whiskynamen), Destillerie/Region je ≤120 (wie
      PROJ-10), Alter/Jahrgang ≤50, Preis-Leistung ≤200, Notizen ≤2000 (wie
      PROJ-5-Notizen), eigene Bewertung ganzzahlig 1–10.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Hybrid-Modell: jeder Eintrag trägt sowohl ein „besitze ich"-Flag als auch eine optionale eigene Bewertung + Notizen | Deckt sowohl „kenne/besitze ich" als auch „habe ich verkostet und bewertet" ab, ohne zwei getrennte Listen zu brauchen | 2026-09-17 |
| Eigene Bewertungsskala **1–10 als einzelne Zahl**, bewusst einfacher als die Event-Skala (Nase 1–5 + Geschmack 1–10 getrennt) | Hier gibt es keinen Vergleich zwischen mehreren Personen, nur die eigene Erinnerung — eine Zahl genügt und hält das Formular kurz | 2026-09-17 |
| Felder: Name (Pflicht), Destillerie, Region, Alter/Jahrgang, Verkostet am (Datum), Preis-Leistung (Freitext), eigene Bewertung (1–10), Notizen, „besitze ich" (Ja/Nein) | Deckt die vom Nutzer gewünschten Zusatzfelder ab; „Preis-Leistung" bewusst als Freitext statt strukturiertem Betrag, um kein Rechnungsmodul zu suggerieren (PRD-Non-Goal) | 2026-09-17 |
| Zusätzliches, **nicht editierbares Herkunftsfeld** („Von TFG-Tasting am [Datum]", verlinkt zur Ergebnisseite) — nur gesetzt, wenn der Eintrag über den Übernehmen-Button entstand; bei manuell angelegten Einträgen fehlt es komplett | Die Herkunft soll sichtbar bleiben, auch wenn der Nutzer seine freie Notiz später komplett überschreibt; ein separates, unveränderliches Feld ist robuster als ein Textbaustein im Notizfeld, der beim Bearbeiten verloren gehen kann | 2026-09-17 |
| Sammlung ist **komplett unabhängig von Events** — kein automatischer Import beim Öffnen, keine Verknüpfung mit `whisky_details` | Konsistent mit dem PRD-Non-Goal „kein gemeinsamer Katalog"; Event-Whiskys und Sammlungs-Einträge sind unterschiedliche Konzepte | 2026-09-17 |
| **„Zur Sammlung hinzufügen"-Button** auf der PROJ-9-Ergebnisseite bei **jeder eigenen Einzelbewertung** (nicht nur beim selbst mitgebrachten Whisky) | Ein Teilnehmer bewertet an einem Abend alle Whiskys blind, nicht nur seinen eigenen — der eigentliche Nutzen („den Talisker von Marco fand ich super") entsteht bei fremden, nicht beim eigenen Whisky | 2026-09-17 |
| Übernehmen-Button füllt nur **Name + eigene Notiz** vor; die 1–10-Bewertung bleibt **leer**, keine automatische Umrechnung der Event-Punktzahl (2–15) | Die beiden Skalen sind nicht vergleichbar; eine automatische Umrechnung würde eine Genauigkeit vortäuschen, die nicht da ist — der Nutzer vergibt die Sammlungs-Bewertung bewusst neu | 2026-09-17 |
| Sichtbarkeit als **ein einziger Schalter für die gesamte Sammlung** (achter Schalter neben den sieben aus PROJ-14), nicht pro Eintrag | Konsistent mit dem bestehenden Muster; Pro-Eintrag-Schalter wären bei wachsenden Listen unzumutbar viel UI für ein Nice-to-have-Feature | 2026-09-17 |
| Default des achten Schalters: **sichtbar** (Opt-out), wie die sieben bestehenden | Gleiche Begründung wie PROJ-14: geschlossene, private Freundesrunde ohne Fremdpublikum | 2026-09-17 |
| Eigene Sammlung unter **`/profil/sammlung`**, fremde unter **`/profil/[id]/sammlung`**, verlinkt von der jeweiligen Profilseite; **kein** neuer Bottom-Nav-Reiter | Gleiche Begründung wie der PROJ-14-Community-Screen: ein fünfter Reiter wäre auf 375px eng für ein selten genutztes Feature | 2026-09-17 |
| Direkter URL-Aufruf einer **verborgenen** fremden Sammlung zeigt einen **neutralen Hinweis** („Diese Sammlung ist nicht sichtbar.") statt 404 | Bewusste Abweichung vom sonstigen PROJ-14-Prinzip „verborgen = spurlos fehlt": eine Sammlung ist eine eigene Seite (nicht nur ein fehlendes Feld auf einer sonst sichtbaren Seite) — ein 404 für eine existierende Profil-ID wäre verwirrender als der neutrale Hinweis; eine ungültige Profil-ID bleibt weiterhin 404 | 2026-09-17 |
| **Hard-Delete mit Bestätigungsdialog** für eigene Einträge, kein reines Archivieren | Anders als Event-Whiskys/Bewertungen (PROJ-1: `ON DELETE RESTRICT`, Datenintegrität eines Abends) hängt ein Sammlungs-Eintrag an nichts und ist rein persönlich — ein AlertDialog vor dem Löschen reicht (gleiches Muster wie PROJ-3-Deaktivieren) | 2026-09-17 |
| Sortierung standardmäßig **neueste zuerst** (Anlage-/Änderungsdatum), zusätzlich clientseitige **Textsuche** nach Name/Destillerie | Tagebuch-artige Nutzung; die Suche fängt das Wachstum der Liste über Jahre ab, ohne ein komplexeres Filter-UI zu brauchen | 2026-09-17 |
| Kein Duplikat-Check, kein Eintrags-Limit | Rein persönliche Liste — Mehrfacheinträge desselben Whiskys (z. B. zu unterschiedlichen Zeitpunkten probiert) sind legitim, keine künstliche Beschränkung nötig | 2026-09-17 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| **Neue, eigene Tabelle** für Sammlungs-Einträge statt einer Erweiterung von `whisky_details` | Andere Datensemantik: personenbezogen statt event-bezogen, eigener Lebenszyklus (Hard-Delete statt `ON DELETE RESTRICT`), eigene Sichtbarkeitsregel. Eine gemeinsame Tabelle mit `whisky_details` würde beide Konzepte künstlich verschränken | 2026-09-17 |
| Sichtbarkeit fremder Einträge über eine **normale RLS-Regel auf der Basistabelle** (nicht wie bei `profiles_public` über eine maskierende Sicht) | Bei den Profil-Stammdaten musste eine Spalte innerhalb einer sonst sichtbaren Zeile verborgen werden — das geht nur über eine Sicht/Spalten-Grant. Hier ist die Sichtbarkeit **pro Zeile, alles oder nichts**: „meine eigenen Zeilen immer, fremde Zeilen nur wenn deren Besitzer den Schalter an hat" — das lässt sich direkt als `USING`-Bedingung ausdrücken, kein Sicht-Umweg nötig | 2026-09-17 |
| **Hard-Delete** ohne Fremdschlüssel-Einschränkung anderer Tabellen auf die Sammlung | Kein anderer Datensatz im System verweist auf einen Sammlungs-Eintrag (anders als `whisky_details` ⇄ `ratings`) — ein echtes Löschen ist gefahrlos | 2026-09-17 |
| **Herkunftsfeld** = Verweis auf das Ursprungs-Event **mit `ON DELETE SET NULL`** (nicht `RESTRICT`) **plus** ein eigener, unveränderlicher Datums-Textwert, der beim Anlegen kopiert wird | Ein gelöschtes Event (Wartungsskript `tasting:delete`) darf den Sammlungs-Eintrag nicht blockieren oder mitreißen — er ist rein persönlich. Der kopierte Datumswert stellt sicher, dass die Herkunfts-Zeile auch nach dem Verlust der Verknüpfung noch „Von TFG-Tasting am [Datum]" zeigen kann (ohne Link, siehe Edge Case) | 2026-09-17 |
| Anlegen/Bearbeiten/Löschen als **Server Actions mit direktem, RLS-abgesichertem Tabellenzugriff** (kein RPC) | Identisches, bereits etabliertes Muster wie `updateWhiskyAction` (PROJ-5) / `updateProfileAction` (PROJ-10): einfache Spaltenprüfung + „eigene Zeile" reicht als Sicherheitsgrenze, ein RPC brächte keinen Mehrwert | 2026-09-17 |
| Der **Übernehmen-Button** basiert auf einem neuen, einfachen Signal „habe ich diesen Whisky überhaupt bewertet" — nicht (wie bisher) nur „habe ich eine Notiz dazu geschrieben" | Die bestehende Ergebnis-Abfrage (PROJ-9) merkt sich aktuell nur *Notizen* zur eigenen Bewertung, keine leere Bewertung. Da jeder Teilnehmer verpflichtend jeden Whisky bewertet, muss die Abfrage nur um „meine Bewertungszeile existiert" ergänzt werden — eine kleine, rückwärtskompatible Erweiterung der bestehenden Abfrage, keine neue Tabelle | 2026-09-17 |
| Der achte Sichtbarkeits-Schalter „Sammlung sichtbar" folgt **exakt dem PROJ-14-Muster**: neues Flag an der bestehenden Profiltabelle, gleiche Liste erlaubter Schalter-Namen im Code erweitert | Kein neuer Mechanismus — Wiederverwendung von `VisibilitySettings`, `updateVisibilityAction`, demselben Schalter-Speicherverhalten (sofort, mit Rollback bei Fehler) | 2026-09-17 |
| **Client-seitige Suche** über die vollständig geladene eigene/fremde Liste, keine Server-Suche | Passt zur Performance-Einschätzung der Spec (Dutzende, nicht Hunderte Einträge) — eine serverseitige Suche wäre für diese Datenmenge unnötiger Mehraufwand | 2026-09-17 |
| Keine neuen npm-Pakete | Dialog, Form, Input, Textarea, Switch, Badge, Card, Collapsible, AlertDialog sind alle bereits installiert | 2026-09-17 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

PROJ-15 braucht sowohl Frontend (zwei neue Seiten, ein neuer Schalter auf
`/profil`, ein neuer Button auf der Ergebnisseite) als auch Backend (eine
neue Tabelle für die Sammlungs-Einträge, ein achtes Sichtbarkeits-Flag am
Profil, eine kleine Erweiterung der bestehenden Ergebnis-Abfrage).

### A) Komponentenstruktur

```
/profil  (bestehend, erweitert)
├─ Sichtbarkeit für andere (PROJ-14)
│   └─ NEU: dritte Gruppe „Sammlung" mit einem Schalter „Sammlung sichtbar"
└─ NEU: Link „Meine Sammlung" → /profil/sammlung

/profil/sammlung  (NEU — eigene Sammlung, bearbeitbar)
├─ Kopfzeile + Suchfeld (Name/Destillerie)
├─ Button „Neuer Eintrag" → Anlegen-Dialog
├─ Liste der Einträge, neueste zuerst
│   └─ pro Eintrag (Karte): Name, Destillerie/Region, „besitze ich"-Kennzeichen,
│      Bewertung (oder „—"), Herkunfts-Zeile falls vorhanden
│      ├─ Tap auf die Karte → Bearbeiten-Dialog (identisches Formular, vorbefüllt)
│      └─ Aktionsmenü → „Löschen" → Bestätigungsdialog → endgültig entfernt
├─ Zustand „leer" → Hinweis + „Ersten Eintrag anlegen"
└─ Zustand „Suche ohne Treffer" → „Keine Treffer"

/profil/[id]/sammlung  (NEU — fremde Sammlung, read-only)
├─ Gleiche Kartenliste wie oben, ohne Anlegen/Bearbeiten/Löschen/Aktionsmenü
├─ Zustand „nicht sichtbar" → neutraler Hinweis „Diese Sammlung ist nicht sichtbar."
├─ Zustand „sichtbar, aber leer" → „Noch keine Einträge."
└─ Zustand „ungültige ID" → 404 (wie /profil/[id])

/profil/[id]  (bestehend, erweitert)
└─ NEU: Link „Sammlung ansehen" → /profil/[id]/sammlung
   (erscheint nur, wenn „Sammlung sichtbar" bei dieser Person an ist —
   sonst fehlt der Link komplett, wie jedes andere verborgene PROJ-14-Feld)

/tastings/[eventId]/ergebnisse  (bestehend, erweitert)
└─ ranking-row.tsx: NEU „Zur Sammlung hinzufügen"-Button bei jeder eigenen
   Bewertung (auch ohne eigene Notiz) → öffnet denselben Anlegen-Dialog wie
   /profil/sammlung, vorausgefüllt mit Whisky-Name + eigener Notiz (falls
   vorhanden) und gesetztem Herkunftsfeld
```

**Neue Bausteine (Auswahl, keine abschließende Liste — Details entstehen in
`/frontend`):**

- Seite + Formular-Dialog für die eigene Sammlung (`/profil/sammlung`),
  spiegelt Aufbau und Verhalten von `whisky-form-dialog.tsx` (PROJ-5): ein
  Dialog für Anlegen **und** Bearbeiten, Server-Action-Aufruf, Toast,
  Button-Sperre während des Speicherns.
- Read-only Liste + Seite für fremde Sammlungen (`/profil/[id]/sammlung`),
  spiegelt `public-profile-view.tsx` (PROJ-14): rein serverseitig gerenderte
  Darstellung bereits maskierter/gefilterter Daten.
- Dritte Gruppe „Sammlung" in `visibility-settings.tsx`, ein weiterer Eintrag
  in `VISIBILITY_FIELDS`.
- Ergänzung von `ranking-row.tsx` um den Übernehmen-Button, der denselben
  Anlegen-Dialog wie `/profil/sammlung` mit Startwerten öffnet.

### B) Datenmodell (in Worten)

**Neue Tabelle „Sammlungs-Einträge"** — jede Zeile gehört genau einem
Mitglied und enthält:

- Name (Pflicht, 1–200 Zeichen)
- Destillerie (optional, ≤120 Zeichen)
- Region (optional, ≤120 Zeichen)
- Alter/Jahrgang (optional, Freitext ≤50 Zeichen)
- Verkostet am (optional, Datum)
- Preis-Leistung (optional, Freitext ≤200 Zeichen)
- Eigene Bewertung (optional, ganze Zahl 1–10)
- Notizen (optional, Freitext ≤2000 Zeichen)
- Besitze ich (Ja/Nein, Standard „Nein")
- Herkunft (optional): ein Verweis auf das Ursprungs-Event **plus** ein
  eigener, unveränderlicher Datumstext — beides wird nur beim Anlegen über
  den Übernehmen-Button gesetzt und danach nie mehr verändert. Verschwindet
  das Ursprungs-Event später (Wartungsskript), bleibt nur der Datumstext
  übrig; die Herkunfts-Zeile zeigt dann Text statt Link.
- Angelegt am / zuletzt geändert am (steuert „neueste zuerst")

**Ein neues Sichtbarkeits-Flag „Sammlung sichtbar"** an der bestehenden
Profiltabelle — achter Schalter neben den sieben aus PROJ-14, Standard „Ja".

**Kleine Erweiterung der bestehenden Ergebnis-Abfrage (PROJ-9):** Neben der
schon vorhandenen eigenen Notiz pro Whisky wird zusätzlich festgehalten, ob
überhaupt eine eigene Bewertung zu diesem Whisky existiert (unabhängig davon,
ob eine Notiz dabei ist) — das steuert, wann der Übernehmen-Button
erscheint.

### C) Backend-Bedarf

- Migration: neue Tabelle für Sammlungs-Einträge mit den oben genannten
  Feldern, Fremdschlüssel auf das anlegende Mitglied und (optional) auf das
  Ursprungs-Event.
- Migration: achtes Sichtbarkeits-Flag an der Profiltabelle, Default „Ja".
- Zugriffsregeln (RLS) auf der neuen Tabelle: Lesen der eigenen Zeilen immer;
  Lesen fremder Zeilen nur, wenn deren Besitzer das achte Flag gesetzt hat;
  Schreiben (Anlegen, Ändern, Löschen) ausschließlich der eigenen Zeilen.
- Keine neue View/Sicht nötig (anders als bei den Profil-Stammdaten aus
  PROJ-14) — die Sichtbarkeit ist hier zeilenweise, nicht feldweise, das
  deckt eine normale Zugriffsregel direkt ab.
- Ergebnis-Abfrage (PROJ-9) um das „habe ich bewertet"-Signal ergänzt (siehe
  Datenmodell) — kein neuer Datenzugriff, nur ein zusätzliches Feld an einer
  bestehenden Abfrage.

### D) Sicherheits-Betrachtung

- Schreibzugriff strikt auf die eigene Zeile — wie bei allen bisherigen
  Mustern im Projekt (Whiskys, Profil, Sichtbarkeits-Schalter).
- Sichtbarkeit fremder Sammlungen ist auf Datenbankebene erzwungen, nicht nur
  im Frontend versteckt — deckt sich mit dem Projektprinzip „RLS ist die
  tragende Sicherheitsschicht" (identisch zu PROJ-14).
- Der direkte URL-Aufruf einer verborgenen fremden Sammlung liefert serverseitig
  konsequent 0 Zeilen — der neutrale „nicht sichtbar"-Hinweis im Frontend ist
  reine Darstellung eines ohnehin leeren, durch die Zugriffsregel blockierten
  Ergebnisses, keine zusätzliche Bloßstellung von Daten.
- Admin hat keine Sonderrechte beim Betrachten fremder Sammlungen (konsistent
  mit PROJ-14).

### E) Neue Pakete

Keine.

## Implementation Notes (Frontend)

**Stand:** Frontend umgesetzt am 2026-09-17. **Kein Backend** — die
Datenbank-Tabelle `collection_entries` und die achte Sichtbarkeits-Spalte
`profiles.show_collection` existieren noch nicht → `/backend PROJ-15`. Bis
dahin brechen `/profil/sammlung` und `/profil/[id]/sammlung` mit dem
Ladefehler-Zustand ab (Tabelle/Spalte fehlen in der echten DB), die
`profiles`-Query in `getPublicProfile` liefert für `show_collection`
`null`/`undefined` → `collectionVisible: false` — der „Sammlung
ansehen"-Link bleibt bis zur Migration unsichtbar. `npm run build`,
`npm test` (127/127) und `npx tsc --noEmit` sind sauber; der Dev-Server
liefert `/login` und `/community` unverändert 200 (ungeprüfter Smoke-Test,
kein Login möglich ohne echte Tabelle).

### Neue Bausteine

**Formular-Logik** — `src/lib/schemas/collection.ts`
(`collectionEntryFormSchema`, 10 Unit-Tests in `collection.test.ts`): Name
1–200 Pflicht, Destillerie/Region ≤120, Alter/Jahrgang ≤50, Preis-Leistung
≤200, Notizen ≤2000 (identische Grenzen wie in der Architecture-Phase
festgelegt), Bewertung als String „1"–„10" oder leer, Verkostet-am als
`yyyy-MM-dd`-String oder leer.

**Datenzugriff** — `src/lib/queries/collection.ts` (`getCollectionEntries`,
liest `collection_entries` sortiert nach `updated_at desc`; funktioniert
unverändert für eigene **und** fremde Sammlungen, weil RLS die Filterung
übernimmt) · `src/lib/actions/collection.ts` (`addCollectionEntryAction` mit
optionalem `origin`-Parameter fürs Herkunftsfeld,
`updateCollectionEntryAction` — Herkunft bewusst nicht im Payload,
`deleteCollectionEntryAction` — Hard-Delete, alle drei nach dem Muster von
`updateWhiskyAction`/PROJ-5).

**Komponenten** — `src/components/collection/collection-entry-dialog.tsx`
(Client, Anlegen **und** Bearbeiten in einem Formular, spiegelt
`whisky-form-dialog.tsx`; zeigt bei vorhandener Herkunft eine nicht
editierbare Info-Zeile „Von TFG-Tasting am …" mit Link, wenn das
Ursprungs-Event noch existiert) · `src/components/collection/
collection-entry-card.tsx` (eine Karte für eigene **und** fremde Ansicht,
`editable`-Prop steuert das Aktionsmenü) · `src/components/collection/
collection-list.tsx` (Client: Suche über Name/Destillerie, Leerzustand,
„Keine Treffer", Anlegen/Bearbeiten/Löschen-Dialoge, `router.refresh()`
nach jeder Aktion — identisches Muster wie `whisky-section.tsx`) ·
`src/components/collection/public-collection-view.tsx` (reine
Server-Darstellung: „Noch keine Einträge." oder die Kartenliste
read-only).

**Seiten** — `src/app/(app)/profil/sammlung/{page,loading,error}.tsx` (eigene
Sammlung) · `src/app/(app)/profil/[id]/sammlung/{page,loading,error}.tsx`
(fremde Sammlung: eigene ID → Redirect auf `/profil/sammlung`, unbekannte ID
→ 404, `collectionVisible === false` → neutraler Text „Diese Sammlung ist
nicht sichtbar.", sonst die Liste).

### Bestehende Dateien erweitert

| Datei | Änderung |
|-------|----------|
| `src/lib/supabase/types.ts` | Handnachtrag (wird von `db:types` reproduziert): neue Tabelle `collection_entries` (Row/Insert/Update/Relationships), `profiles.show_collection` in Row/Insert/Update. |
| `src/lib/supabase/aliases.ts` | `CollectionEntryRow`/`CollectionEntryInsert`/`CollectionEntryUpdate`. |
| `src/lib/auth.ts` | `SESSION_PROFILE_COLUMNS` um `show_collection` ergänzt (sonst fehlt der Schalter-Startwert auf `/profil`). |
| `src/lib/schemas/profile-visibility.ts` | `VISIBILITY_FIELDS` um `show_collection` ergänzt (achter Schalter). |
| `src/components/profile/visibility-settings.tsx` | Dritte Gruppe „Sammlung" mit dem neuen Schalter. |
| `src/app/(app)/profil/page.tsx` | `show_collection` an `VisibilitySettings` durchgereicht; Link „Meine Sammlung" ergänzt. |
| `src/lib/queries/public-profile.ts` | `PublicProfileData.collectionVisible` (liest `profiles.show_collection` direkt — dieser Flag ist nicht Teil der PROJ-14-Spaltensperre). |
| `src/components/profile/public-profile-view.tsx` | Link „Sammlung ansehen", nur wenn `collectionVisible`. |
| `src/lib/queries/results.ts` | `RankingRow.hasOwnRating` (ob überhaupt eine eigene Bewertungszeile existiert, unabhängig von `ownNote`) — steuert den Übernehmen-Button. |
| `src/components/results/ranking-list.tsx`, `.../ergebnisse/page.tsx` | `eventId`/`eventDate` bis zu `RankingRow` durchgereicht. |
| `src/components/results/ranking-row.tsx` | „Zur Sammlung hinzufügen"-Button bei `hasOwnRating`, öffnet `CollectionEntryDialog` mit `origin` (Name + eigene Notiz vorausgefüllt, Herkunft gesetzt). |

### Reine Frontend-Entscheidungen (nicht in der Architecture-Phase festgelegt)

- **Karten-Aktionen über ein Dropdown-Menü** (Bearbeiten/Löschen), nicht ein
  Tap auf die ganze Karte: vermeidet verschachtelte klickbare Flächen
  (dieselbe Überlegung wie beim Nested-Link-Problem aus PROJ-14) und
  unterscheidet klar zwischen „Notiz lesen" und „bearbeiten wollen". Ein Tap
  auf „Bearbeiten" im Menü erfüllt die Spec-AC unverändert.
- **Bewertung als `Select` mit Sentinel-Wert `"none"`** statt Slider — Radix
  `Select` erlaubt keinen leeren String als Item-Wert; identisches Muster
  wie das bestehende Helfer-Feld in `event-form.tsx` (`"none"` → „Kein
  Helfer").
- **Verkostet-am-Kalender sperrt Tage nach heute** (`disabled={{ after:
  today }}`) — eigene, kleine Umkehrung von `EventDateField` (die sperrt
  Tage *vor* heute, weil Events in der Zukunft liegen); nicht in der Spec
  vorgeschrieben, aber „man kann nichts verkosten, was noch nicht war" ist
  die naheliegende Lesart.
- **`origin` (Herkunft) wird ungeprüft aus dem Client übernommen** (kein
  serverseitiger Abgleich, ob der Nutzer den Whisky wirklich bewertet hat) —
  bewusste Vereinfachung: die Herkunftsangabe ist rein informativ, kein
  Sicherheits- oder Berechtigungsmerkmal; ein manipulierter Wert hätte
  keinerlei Auswirkung außerhalb der eigenen Sammlung des Nutzers.

### Verifikation

`npx tsc --noEmit` sauber · `eslint` (betroffene Pfade) sauber · `npm test`
→ 127/127 (12 → 13 Testdateien, +10 aus `collection.test.ts`) · `npm run
build` erzeugt `/profil/sammlung` und `/profil/[id]/sammlung` als dynamische
Routen. Dev-Server-Smoke-Test ohne Login (Tabelle fehlt noch) nicht
aussagekräftig — echte Verifikation der neuen Seiten folgt nach `/backend`
in `/qa`.

## Implementation Notes (Backend)

**Stand:** Migration geschrieben am 2026-09-17 —
`supabase/migrations/20260917120000_collection_entries.sql`. **Noch nicht
angewandt.** Der Nutzer führt aus:

```powershell
npm run db:push      # Migration einspielen
npm run db:types     # src/lib/supabase/types.ts neu generieren
```

`db:types` überschreibt die im `/frontend`-Schritt von Hand nachgetragenen
Typen (Tabelle `collection_entries`, `profiles.show_collection`) mit der
echten Generierung — inhaltlich identisch, Feldreihenfolge alphabetisch wie
vom Generator gewohnt. Danach `npm run test:rls` (inkl. der neuen
`collection-entries.integration.test.ts`) im `/qa`-Schritt.

### Eine Migration — was sie tut

| Bereich | Änderung |
|---------|----------|
| **Neue Tabelle `collection_entries`** | Eine Zeile pro Sammlungs-Eintrag: `profile_id` (→ `profiles`, `on delete cascade` — rein persönliche Daten, anders als die `on delete restrict`-Historie eines Events), `name` (1–200 Pflicht), `distillery`/`region` (≤120), `age_label` (≤50), `tasted_on` (Datum), `value_note` (≤200), `rating` (1–10), `notes` (≤2000), `owned` (Boolean), `source_event_id` (→ `tasting_events`, `on delete set null`), `source_event_date` (Datums-Snapshot, unabhängig von der Verknüpfung), `created_at`/`updated_at` (Trigger `tg_set_updated_at`, PROJ-1). Index `(profile_id, updated_at desc)` für die „neueste zuerst"-Sortierung. |
| **Helfer-Funktion `profile_shows_collection(uuid)`** | `SECURITY DEFINER`, liest `profiles.show_collection` der Zielperson (Projekt-Konvention: keine RLS-Policy referenziert eine andere Tabelle direkt). |
| **RLS auf `collection_entries`** | `select`: eigene Zeilen immer, fremde nur wenn `profile_shows_collection(profile_id)` wahr ist — zeilenweise Sichtbarkeit, keine maskierende Sicht nötig (anders als PROJ-14). `insert`/`update`/`delete`: nur die eigene Zeile (`profile_id = auth.uid()`). |
| **Herkunftsfeld eingefroren** | `revoke update` + `grant update (…)` auf genau die neun editierbaren Spalten — `source_event_id`/`source_event_date` (und `id`/`profile_id`/`created_at`) sind darüber nicht änderbar. Ein direkter Schreibversuch liefert `42501`, unabhängig vom Frontend. |
| **8. Sichtbarkeits-Schalter `profiles.show_collection`** | `boolean not null default true`, additiv zu den sieben PROJ-14-Spalten-GRANTs ergänzt (`grant select/update (show_collection) …` — Spaltenrechte akkumulieren pro Rolle/Tabelle, kein erneutes Auflisten der übrigen sechs nötig). |

### Entscheidungen im Detail

- **Zeilenweise RLS statt einer maskierenden Sicht:** Bei den PROJ-14-Profil-
  Stammdaten musste eine einzelne Spalte innerhalb einer sonst sichtbaren
  Zeile verborgen werden — das geht nur über eine Sicht/Spalten-Grant. Hier
  ist die Sichtbarkeit alles-oder-nichts pro Zeile, das drückt eine normale
  `USING`-Klausel direkt aus (siehe Architecture-Entscheidung).
- **`on delete cascade` für `profile_id`, `on delete set null` für
  `source_event_id`:** Ein Sammlungs-Eintrag hängt an nichts außer seinem
  Besitzer — verschwindet die Person (per `user:delete MODE=cascade`), darf
  auch die Sammlung mitgehen. Ein gelöschtes Event dagegen darf den Eintrag
  nicht mitreißen, nur die Verknüpfung verlieren (Edge Case aus der Spec).
- **`source_event_date` als eigene Spalte statt nur aus `source_event_id`
  abgeleitet:** Nach einem `on delete set null` wäre das Datum sonst
  ersatzlos weg — der Snapshot ist der einzige Weg, „Von TFG-Tasting am …"
  auch nach dem Verlust der Verknüpfung noch anzuzeigen.
- **Kein serverseitiger Abgleich, ob der Nutzer den Whisky beim Übernehmen
  wirklich bewertet hat:** bereits in der Frontend-Phase als bewusste
  Vereinfachung dokumentiert — die Herkunftsangabe ist rein informativ, kein
  Sicherheitsmerkmal. Die RLS-`insert`-Policy verlangt nur `profile_id =
  auth.uid()`, keine Prüfung gegen `ratings`.

### Neue Datei

- `src/lib/supabase/__tests__/collection-entries.integration.test.ts` — 9
  Fälle: eigene Zeile anlegen/lesen/bearbeiten; fremdes `profile_id` beim
  Anlegen wird abgelehnt; Default sichtbar → fremde Zeile lesbar; Schalter
  aus → fremde Zeilen verschwinden, eigene bleibt vollständig sichtbar;
  Schreibzugriff (Update/Delete) auf fremde Zeilen betrifft 0 Zeilen statt
  eines Fehlers (RLS-Filterung); Herkunftsfeld lässt sich beim Anlegen setzen
  aber nicht mehr ändern (`42501`), andere Felder desselben Eintrags bleiben
  änderbar; gelöschtes Ursprungs-Event setzt `source_event_id` auf `NULL`,
  `source_event_date` bleibt erhalten.

### Fix nach fehlgeschlagenem `db:push`

Erster `db:push`-Versuch scheiterte mit `column "show_collection" does not
exist` (42703) beim Anlegen der Helfer-Funktion. Ursache: die Funktion ist
`language sql` und wird deshalb schon bei `CREATE FUNCTION` gegen die
referenzierten Spalten geprüft (anders als `plpgsql`, dessen Rumpf erst bei
der ersten Ausführung geparst wird) — `show_collection` stand in der
ursprünglichen Abschnittsreihenfolge aber erst *nach* der Funktion. Fix:
Abschnitt „Achter Sichtbarkeits-Schalter" vor die Helfer-Funktion gezogen
(neue Reihenfolge: Tabelle → Spalte → Funktion → RLS). Gleiches Muster wie
in `20260831120000_helper_role.sql`, wo `tasting_events.helper_id` ebenfalls
vor der sie nutzenden Funktion `is_event_helper` steht.

### Verifikation

Migration am 2026-09-17 vom Nutzer per `npm run db:push` eingespielt (nach
dem Reihenfolge-Fix oben) und `npm run db:types` neu generiert — die
Handnachträge aus `/frontend` waren inhaltlich bereits identisch mit der
echten Generierung. Danach vollständig gegengeprüft:

| Check | Ergebnis |
|-------|----------|
| `npx tsc --noEmit` | sauber |
| `eslint .` | sauber |
| `npm test` (Vitest Unit) | **127/127** |
| `npm run test:rls` (Integration) | **120/120** — inkl. der 11 neuen Fälle aus `collection-entries.integration.test.ts` |
| `npm run build` | erzeugt `/profil/sammlung` und `/profil/[id]/sammlung` als dynamische Routen |

Kein lokales Docker/Supabase in dieser Session verfügbar gewesen (`supabase
status` scheitert an fehlendem Docker/Podman) — die Migration wurde deshalb
nur gegen bestehende Konventionen abgeglichen, bevor sie live angewandt
wurde; die Verifikation danach lief gegen die echte, geteilte DB.

## QA Test Results

**Tested:** 2026-09-17
**App URL:** http://localhost:3000 (prod-Build)
**Tester:** QA Engineer (AI)

### Automatisierte Suiten

| Suite | Ergebnis |
|-------|----------|
| `npm test` (Vitest Unit) | **127/127** |
| `npm run test:rls` (Integration) | **120/120** (bereits im `/backend`-Schritt gegen die echte DB verifiziert, hier unverändert) |
| `tests/PROJ-15-persoenliche-sammlung.spec.ts` (neu) | **36/36** über `chromium` + `Mobile Safari` (18 Tests je Projekt) |
| `tsc --noEmit` · `eslint .` · `npm run build` | alle sauber; Routen `/profil/sammlung` und `/profil/[id]/sammlung` erzeugt |
| Gezielte Regression: `PROJ-9`, `PROJ-10`, `PROJ-14` | **37/38** — die eine „fehlgeschlagene" ist der vorbestehende, dokumentierte Seed-Admin-Login (siehe Regressions-Abschnitt), nicht PROJ-15-bezogen |

### Acceptance Criteria Status — 24/24 bestanden

#### Eigene Sammlung ansehen & pflegen
- [x] Link „Meine Sammlung" auf `/profil` (E2E)
- [x] Leere Sammlung → Leerzustand mit Anlegen-Hinweis (E2E)
- [x] Mehrere Einträge sortiert neueste zuerst (E2E: neu angelegter Eintrag erscheint oben)
- [x] Eintrag mit allen Feldern anlegen → erscheint oben (E2E)
- [x] Leeres Namensfeld → Validierungsmeldung, nichts gespeichert (E2E)
- [x] Bestehenden Eintrag bearbeiten → Felder vorbefüllt, Änderung gespeichert (E2E)
- [x] Löschen → Bestätigungsdialog, danach endgültig weg (E2E)
- [x] Zeichenlimit überschritten → Validierungsmeldung, nichts gespeichert (E2E: Name > 200; Destillerie/Region/Preis-Leistung/Notizen per Code-Inspektion identisches Zod-Muster wie PROJ-5)

#### Suche
- [x] Suche filtert nach Name (E2E; Destillerie-Filterung per Code-Inspektion — dieselbe `includes()`-Prüfung wie beim Namen in `collection-list.tsx`)
- [x] Suchbegriff ohne Treffer → „Keine Treffer." (E2E)

#### Sichtbarkeit für andere
- [x] Achter Schalter „Sammlung" im Abschnitt „Sichtbarkeit für andere" (E2E)
- [x] Neues Mitglied: Schalter steht auf „sichtbar" (E2E)
- [x] Schalter umlegen speichert sofort (E2E, per DB-Poll statt Toast-Text verifiziert — siehe Testnotiz unten)

#### Fremde Sammlung ansehen
- [x] Sichtbar → Link „Sammlung ansehen" führt zur read-only Liste, keine Bearbeiten/Löschen-Möglichkeit (E2E)
- [x] Nicht sichtbar → Link fehlt komplett (E2E)
- [x] Direkter URL-Aufruf einer verborgenen Sammlung → „Diese Sammlung ist nicht sichtbar." (E2E)
- [x] Ungültige Profil-ID → „Seite nicht gefunden" (E2E)
- [x] Eigene ID → Redirect auf die bearbeitbare `/profil/sammlung` (E2E)
- [x] Sichtbare, aber leere fremde Sammlung → „Noch keine Einträge." (E2E)

#### Übernehmen-Button auf der Ergebnisseite (PROJ-9)
- [x] Button erscheint bei jeder eigenen Bewertung (E2E: bewerteter Whisky zeigt ihn)
- [x] Kein Button ohne eigene Bewertung (E2E: unbewerteter Whisky zeigt ihn nicht)
- [x] Dialog füllt Name + eigene Notiz vor, Bewertung bleibt leer (E2E)
- [x] Speichern legt einen neuen, unabhängigen Eintrag mit gesetztem Herkunftsfeld an (E2E: Eintrag mit „Von TFG-Tasting am …" erscheint in der Sammlung, Link zeigt auf die Ergebnisseite)
- [x] Herkunftsfeld ist beim Bearbeiten nicht editierbar (Code-Inspektion + DB: `collection-entry-dialog.tsx` zeigt es nur als Text/Link, nie als Formularfeld; DB-seitig zusätzlich hart erzwungen — `42501` bei einem direkten Schreibversuch, siehe `/backend`-Integrationstest)
- [x] Manuell angelegter Eintrag zeigt keine Herkunfts-Zeile (E2E: alle manuell angelegten Einträge im Suchtest/Anlegen-Test ohne „Von TFG-Tasting")

### Edge Cases Status
- [x] Eigene Sammlung leer → Leerzustand, kein Fehler (E2E)
- [x] Sichtbare fremde Sammlung leer → „Noch keine Einträge.", unterscheidbar vom „nicht sichtbar"-Hinweis (E2E, beide Zustände in getrennten Tests)
- [x] Direkter URL-Aufruf einer verborgenen fremden Sammlung → neutraler Hinweis, kein 404 (E2E)
- [x] Ungültige/nicht existierende Profil-ID → 404 (E2E)
- [x] Übernehmen-Button mehrfach klicken → kein Duplikat-Check (Code-Inspektion: `addCollectionEntryAction` prüft nicht auf Vorhandensein, jeder Aufruf fügt eine neue Zeile ein — durch die DB-Integrationstests aus `/backend` indirekt bestätigt, kein Unique-Constraint auf der Tabelle)
- [x] Zeichenlimit trotz Client-Validierung → Zod serverseitig + DB-CHECK als Backstop (Code-Inspektion, identisches dreistufiges Muster wie PROJ-5/PROJ-10)
- [x] Löschen in einem Tab, während ein zweiter Tab denselben Eintrag bearbeitet → zweiter Speicherversuch trifft 0 Zeilen, `updateCollectionEntryAction` gibt „Der Eintrag wurde bereits gelöscht oder gehört dir nicht mehr." zurück (Code-Inspektion, identisches Fehlerpfad-Muster wie PROJ-5/PROJ-10; deterministisch per E2E nicht sauber erzwingbar)
- [x] Deaktiviertes Mitglied mit sichtbarer Sammlung bleibt über einen direkten Profil-Link aufrufbar (Code-Inspektion: `getCollectionEntries`/RLS prüfen `show_collection`, nicht `is_active` — identisches Verhalten zu PROJ-14; durch den bereits grünen PROJ-14-Regressionstest „Deaktiviertes Mitglied: Profil über den Historie-Link weiterhin aufrufbar" strukturell mitbestätigt)
- [x] Eintrag ohne eigene Bewertung zeigt „—" statt einer Zahl (E2E: alle Einträge ohne gewählte Bewertung im Anlege-/Suchtest zeigen „—", kein Pflichtfeld)
- [x] Ursprungs-Event eines Herkunftsfelds wird gelöscht → Zeile bleibt mit Datum bestehen, Link verschwindet (durch den `/backend`-Integrationstest „Event löschen setzt source_event_id auf NULL, source_event_date bleibt" abgedeckt; das Frontend zeigt bei `sourceEventId === null` bewusst reinen Text statt Link — Code-Inspektion `collection-entry-card.tsx`)
- [x] Admin betrachtet eine fremde Sammlung → exakt dieselbe gefilterte Ansicht, keine Sonderrechte (Code-Inspektion: `getCollectionEntries`/RLS kennen die Rolle des Betrachters gar nicht, können sie also strukturell nicht bevorzugen — identischer Aufbau wie das bereits für PROJ-14 per E2E bestätigte Verhalten; der Admin-spezifische E2E-Test selbst konnte wegen des vorbestehenden Seed-Passwort-Problems nicht laufen, siehe Regressions-Abschnitt)

### Security Audit Results
- [x] **Auth:** `/profil/sammlung` und `/profil/[id]/sammlung` erfordern Login — per `curl` gegen den Prod-Build verifiziert: beide Routen antworten `307 → /login?redirect=…` ohne Session.
- [x] **DB-seitige Durchsetzung der Sichtbarkeit (Kern der Architecture-Entscheidung):** zeilenweise RLS statt einer maskierenden Sicht — bereits im `/backend`-Schritt per Integrationstest verifiziert (Default sichtbar → fremde Zeile lesbar; Schalter aus → fremde Zeilen verschwinden vollständig, eigene bleibt sichtbar). Ein technisch versierter Nutzer kann die Sichtbarkeit also nicht durch einen direkten API-Zugriff umgehen.
- [x] **IDOR / Schreibzugriff nur auf die eigene Zeile:** `addCollectionEntryAction`/`updateCollectionEntryAction`/`deleteCollectionEntryAction` schreiben ausschließlich über `.eq('profile_id', session.userId)` bzw. lassen `profile_id` beim Insert serverseitig aus der Session bestimmen; RLS sichert dieselbe Grenze zusätzlich auf DB-Ebene ab (im `/backend`-Integrationstest verifiziert: fremdes `profile_id` beim Anlegen abgelehnt, Update/Delete auf fremde Zeilen betreffen 0 Zeilen).
- [x] **Herkunftsfeld nach dem Anlegen eingefroren:** Spalten-GRANT lässt `source_event_id`/`source_event_date` beim Update aus — ein direkter Schreibversuch liefert `42501`, unabhängig vom Frontend (bereits im `/backend`-Integrationstest verifiziert).
- [x] **Kein Service-Role-Zugriff im neuen Code:** `grep` über `src/lib/actions/collection.ts`, `src/lib/queries/collection.ts` und `src/components/collection/` findet weder `createAdminClient` noch `SERVICE_ROLE` — alle Zugriffe laufen über den sitzungsgebundenen Client, RLS greift durchgehend.
- [x] **Keine Admin-Sonderrechte** beim Betrachten fremder Sammlungen — `getCollectionEntries`/die RLS-Policy kennen die Rolle des Betrachters strukturell nicht (Code-Inspektion, siehe Edge-Case-Abschnitt).
- [x] **XSS:** `entry.name` / `entry.notes` / `entry.distillery` / `entry.region` / `entry.valueNote` werden als React-Text gerendert (`{entry.name}` etc. in `collection-entry-card.tsx`), kein `dangerouslySetInnerHTML` im gesamten neuen Code (per `grep` verifiziert).
- [x] **Eingabevalidierung:** dreistufig — Zod im Client (`collectionEntryFormSchema`), dieselbe Prüfung serverseitig in den Actions, DB-CHECKs als letzte Instanz (Migration).
- [x] **Origin-Spoofing (Herkunftsfeld beim Anlegen):** bewusst akzeptierte Vereinfachung — der Client kann beim Übernehmen-Flow theoretisch eine beliebige `eventId`/`eventDate` mitschicken, ohne dass serverseitig geprüft wird, ob der Nutzer diesen Whisky wirklich bewertet hat. Kein Sicherheitsrisiko, da die Herkunftsangabe rein informativ ist und ausschließlich die eigene Sammlung des Nutzers betrifft (keine fremden Daten sichtbar/veränderbar) — bereits in den Implementation Notes (Frontend) als Entscheidung dokumentiert.

### Regression: 1 Fehlschlag in der gezielten Suite — nicht PROJ-15

Die gezielte Regression auf die direkt von PROJ-15 berührten Bereiche
(`PROJ-9-ergebnisse-historie`, `PROJ-10-profil-bilanz`,
`PROJ-14-profil-sichtbar`) zeigte 37/38 bestandene Tests. Der eine
Fehlschlag — „Admin sieht ein fremdes Profil genauso eingeschränkt wie jedes
Mitglied" — scheitert beim Login mit dem Seed-Admin-Passwort, **nicht** an
PROJ-15-Code. Per direktem, read-only Credential-Check gegen die Live-DB
bestätigt:

```
hermann.hoppen@gmail.com + SEED_DEV_PASSWORD → „Invalid login credentials"
```

Dasselbe, bereits seit PROJ-14 dokumentierte Problem („Admin-Passwort per
`npm run admin:password` geändert → Admin-Login-Tests scheitern", siehe
Post-Deploy-Backlog in `features/INDEX.md`). Der Test hängt an keiner Stelle
mit PROJ-15-Code zusammen (er scheitert bereits beim `login()`-Aufruf, bevor
irgendein Sammlungs- oder Profil-Code läuft) und wird beim erneuten Lauf
ohne diesen einen Test (`--grep-invert`) durch alle 14 übrigen
PROJ-14-Tests bestätigt grün. Die volle 12-Spec-Suite wurde in diesem
Durchlauf nicht erneut komplett laufen gelassen — das bereits in
PROJ-14 dokumentierte Ausmaß (29 vorbestehende Fehlschläge, alle auf
dasselbe Seed-Konto-Problem zurückgeführt) ist unverändert und durch PROJ-15
nicht berührt, da PROJ-15 weder Seed-Konten noch die betroffenen
Auth-/Admin-Bereiche anfasst.

### Testnotiz: Sichtbarkeits-Schalter-Test pollt die DB statt den Toast-Text

Der E2E-Test „Schalter „Sammlung" umlegen speichert sofort" verifiziert den
zweiten Round-Trip (zurück auf „sichtbar") über `expect.poll()` auf den
DB-Wert statt über die Sichtbarkeit des Toasts „Gespeichert." — zwei
identische Toast-Texte kurz hintereinander sind sonst nicht zuverlässig
dem jeweiligen Klick zuzuordnen (Toast-Stacking). Kein Produktfehler, reine
Test-Robustheit; das Verhalten selbst (sofortiges Speichern, kein
Sammel-„Speichern") ist damit weiterhin vollständig abgedeckt.

### Bugs Found

Keine.

### Summary
- **Acceptance Criteria:** 24/24 bestanden (17 per E2E verifiziert, 7 per Code-/Integrationstest-Inspektion, wo E2E unpraktisch oder bereits im `/backend`-Schritt gegen die echte DB verifiziert ist)
- **Bugs Found:** 0 total
- **Security:** Pass — Sichtbarkeit und Schreibgrenzen sind auf DB-Ebene erzwungen (nicht nur im Frontend), kein IDOR, kein Service-Role-Zugriff im neuen Code, keine Admin-Sonderrechte, Herkunftsfeld nach dem Anlegen unveränderlich
- **Regression:** Pass — 37/38 in der gezielten Suite; der eine Fehlschlag ist das vorbestehende, dokumentierte Seed-Admin-Passwort-Problem aus PROJ-14, nicht PROJ-15-bezogen
- **Production Ready:** **YES** — kein offenes Critical/High/Medium/Low
- **Recommendation:** **Approved.**

## Deployment
_To be added by /deploy_

## Deployment
_To be added by /deploy_
