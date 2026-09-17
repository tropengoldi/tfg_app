# PROJ-15: Persönliche Whisky-Datenbank (teilbar)

## Status: Planned
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

- [ ] Feld-Zeichenlimits final festlegen (Vorschlag angelehnt an bestehende
      Muster: Name 1–200 wie PROJ-5-Whiskynamen, Destillerie/Region je ≤120
      wie PROJ-10, Alter/Jahrgang ≤50, Preis-Leistung ≤200, Notizen ≤2000 wie
      PROJ-5-Notizen) — final zu bestätigen in `/architecture`.

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
