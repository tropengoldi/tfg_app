# Product Requirements Document

> **Whisky-Tasting App** — digitale Verkostung für eine private Freundesrunde

## Vision

Eine mobile-first Web-App, die den Ablauf eines privaten Whisky-Tastings vom Zettel auf
das Smartphone holt. Jeder bringt Whiskies mit, der Gastgeber schenkt sie blind in einer nur
ihm bekannten Reihenfolge aus, alle bewerten Nase und Geschmack — und am Ende des Abends
steht die Rangliste sofort, statt mühsam ausgezählt zu werden. Jedes Tasting wird dauerhaft
archiviert, sodass die Runde über Jahre nachvollziehen kann, welche Flasche wann gewonnen hat.

## Target Users

**Die Runde (6–10 Personen, feste Gruppe, treffen sich reihum zu Hause).**

| Nutzer | Bedürfnis | Schmerzpunkt heute |
|--------|-----------|--------------------|
| **Teilnehmer** | Whisky blind bewerten, ohne von anderen beeinflusst zu werden; eigene Notizen festhalten | Zettel gehen verloren; man sieht, was der Nachbar vergibt; eigene Notizen aus früheren Abenden sind weg |
| **Gastgeber** (wechselt pro Abend) | Den Abend steuern: Reihenfolge festlegen, Runden weiterschalten, Ergebnisse auflösen | Muss parallel ausschenken, moderieren und Zettel einsammeln; das Auszählen dauert und unterbricht den Abend |
| **Admin** (eine Person, organisiert die Runde) | Termine anlegen, Teilnehmer verwalten, Gastgeber festlegen | Terminabsprache und Teilnehmerliste laufen über WhatsApp und sind nirgends verbindlich festgehalten |

Alle Nutzer sind private Freunde, keine Profis. Die App wird **während** des Tastings am
Handy bedient — mit einem Glas in der anderen Hand, oft bei gedämpftem Licht.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase-Infrastruktur (Schema, RLS, RPCs, Seed) | Planned |
| P0 (MVP) | Auth & Zugangskontrolle | Planned |
| P0 (MVP) | Admin – Teilnehmerverwaltung | Roadmap |
| P0 (MVP) | Admin – Tasting-Events verwalten | Roadmap |
| P0 (MVP) | Whisky-Erfassung (blind) | Roadmap |
| P0 (MVP) | Gastgeber-Steuerung & Ablauf | Roadmap |
| P0 (MVP) | Bewertungsansicht | Roadmap |
| P0 (MVP) | Tasting-Dashboard mit Live-Sync | Roadmap |
| P1 | Ergebnisse & Tasting-Historie | Roadmap |
| P2 | Profil-Seite mit persönlicher Bilanz | Roadmap |

Details und Abhängigkeiten: siehe [features/INDEX.md](../features/INDEX.md).

## Kernablauf eines Tastings

1. **Admin** legt ein Event an: Datum, Ort, Gastgeber, Teilnehmerliste, optional Thema und
   maximale Anzahl Whiskies pro Person.
2. **Teilnehmer** tragen vorab ein, welche Whiskies sie mitbringen — üblicherweise einen pro
   Person, **der Gastgeber darf als Bonus zwei einbringen**. Optional hinterlegen sie einen
   Link zu einem Verkostungsvideo. Niemand außer dem Bringer selbst und dem Gastgeber sieht
   diese Angaben.
3. **Gastgeber** legt die Ausschankreihenfolge fest und startet das Event.
4. **Alle** bewerten den aktuellen Whisky blind — sie sehen nur „Whisky 3 von 8".
   Nase 1–5, Geschmack 1–10, optional eigene Notizen.
5. **Gastgeber** schaltet auf den nächsten Whisky weiter; alle Handys springen automatisch mit.
6. **Gastgeber** schließt das Event ab. Erst jetzt werden die Whisky-Namen aufgelöst,
   die Rangliste erscheint samt Verkostungsvideos, und keine Bewertung kann mehr geändert
   werden.

## Success Metrics

- Ein kompletter Tasting-Abend läuft ohne Zettel und ohne manuelles Auszählen durch
- Die Rangliste steht innerhalb von Sekunden nach dem Abschluss durch den Gastgeber
- Alle Teilnehmer können die App ohne Erklärung bedienen — kein Onboarding nötig
- Kein Teilnehmer kann vor dem Abschluss sehen, welcher Whisky gerade im Glas ist oder wie
  andere bewertet haben (die Blindheit hält)
- Vergangene Tastings sind dauerhaft nachschlagbar

## Constraints

- **Zielgerät:** Smartphone. Desktop wird unterstützt, aber nicht optimiert.
- **Nutzung während des Abends:** kurze, große Bedienelemente; die Bewertung muss in
  wenigen Sekunden erledigt sein.
- **Typische Größe eines Abends:** 6–7 Teilnehmer, jeder bringt einen Whisky mit, der
  Gastgeber als Bonus zwei. In der Regel also **7–8 Whiskies, selten mehr als 10** — der
  Gläserstreifen und die Rangliste müssen bis 10 ohne Scrollen lesbar bleiben.
- **Verkostet werden schottische Single Malts.** Das ist keine technische Einschränkung
  (Regionen und Herkunft sind Freitext), prägt aber Beispieldaten, Platzhaltertexte und
  Wortwahl.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime), Projekt `tfg_app`, Region
  eu-central-1. Row Level Security ist die tragende Sicherheitsschicht — die Blindheit der
  Verkostung wird auf Datenbankebene erzwungen, nicht im Frontend.
- **Keine öffentliche Registrierung.** Der Admin lädt Teilnehmer per E-Mail ein. Signup ist
  in Supabase deaktiviert.
- **Höchstens ein Tasting gleichzeitig aktiv** — dadurch ist „das aktuelle Tasting" auf dem
  Dashboard immer eindeutig.
- **Deployment:** Vercel. Alle Secrets ausschließlich über Umgebungsvariablen (siehe unten).
- **Design system:** siehe [docs/design-system.md](design-system.md)
- **Team:** eine Person (der Admin) plus KI-gestützte Entwicklung.

### Umgebungsvariablen

| Variable | Quelle | Sichtbarkeit |
|----------|--------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon public` | Browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` | **Nur Server. Niemals mit `NEXT_PUBLIC_` präfixen.** |
| `NEXT_PUBLIC_SITE_URL` | lokal `http://localhost:3000`, live die Vercel-Domain | Browser |

`NEXT_PUBLIC_SITE_URL` muss zusätzlich in Supabase unter *Auth → URL Configuration →
Redirect URLs* eingetragen werden, sonst laufen die Einladungslinks ins Leere.

Lokal stehen die Werte in `.env.local` (gitignored), live als Environment Variables bei
Vercel. `.mcp.json` ist gitignored, weil sie einen Supabase Personal Access Token enthält.

## Non-Goals

- **Kein Zahlungs- oder Rechnungsmodul** — die Runde rechnet untereinander ab
- **Keine öffentliche Whisky-Datenbank** — Whiskies werden pro Event frei eingetragen, es gibt
  keinen Katalog und keine Anbindung an externe Whisky-APIs
- **Keine YouTube-Integration** — das Verkostungsvideo ist eine gespeicherte Verknüpfung, die
  in einem neuen Tab öffnet. Kein eingebetteter Player, keine API-Abfrage, kein automatisches
  Suchen von Videos beim Anlegen eines Whiskys
- **Keine Fotos oder Datei-Uploads** in dieser Version (Supabase Storage bleibt ungenutzt)
- **Keine Aromen-Räder, Flavour-Profile oder Tasting-Notes-Vorlagen** — nur Nase, Geschmack
  und ein Freitextfeld
- **Keine Einladung von Gästen außerhalb der Runde** — geschlossener Nutzerkreis
- **Keine parallelen Tastings** an unterschiedlichen Orten zur selben Zeit
- **Keine native App**, keine Push-Benachrichtigungen, keine Offline-Fähigkeit
- **Keine Auswertungen über die Runde hinweg** — die persönliche Bilanz auf der Profil-Seite
  (eigene Tastings, mitgebrachte Whiskies, beste Platzierung, Punkteschnitt) ist Teil von
  PROJ-10. Gruppenweite Ranglisten („wer vergibt die härtesten Noten") sind es nicht.

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
