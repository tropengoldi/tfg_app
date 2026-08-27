# Product Requirements Document

> **Whisky-Tasting App** — digitale Verkostung für eine private Freundesrunde

## Vision

Eine mobile-first Web-App, die den Ablauf eines privaten Whisky-Tastings vom Zettel auf
das Smartphone holt. Jeder bringt Whiskys mit, der Gastgeber schenkt sie blind in einer nur
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
| P0 (MVP) | Supabase-Infrastruktur (Schema, RLS, RPCs, Seed) | Roadmap |
| P0 (MVP) | Auth & Zugangskontrolle | Roadmap |
| P0 (MVP) | Admin – Teilnehmerverwaltung | Roadmap |
| P0 (MVP) | Admin – Tasting-Events verwalten | Roadmap |
| P0 (MVP) | Whisky-Erfassung (blind) | Roadmap |
| P0 (MVP) | Gastgeber-Steuerung & Ablauf | Roadmap |
| P0 (MVP) | Bewertungsansicht | Roadmap |
| P0 (MVP) | Tasting-Dashboard mit Live-Sync | Roadmap |
| P1 | Ergebnisse & Tasting-Historie | Roadmap |
| P2 | Profil-Seite | Roadmap |

Details und Abhängigkeiten: siehe [features/INDEX.md](../features/INDEX.md).

## Kernablauf eines Tastings

1. **Admin** legt ein Event an: Datum, Ort, Gastgeber, Teilnehmerliste, optional Thema und
   maximale Anzahl Whiskys pro Person.
2. **Teilnehmer** tragen vorab ein, welche Whiskys sie mitbringen. Niemand außer dem
   Bringer selbst und dem Gastgeber sieht diese Angaben.
3. **Gastgeber** legt die Ausschankreihenfolge fest und startet das Event.
4. **Alle** bewerten den aktuellen Whisky blind — sie sehen nur „Whisky 3 von 6".
   Nase 1–5, Geschmack 1–10, optional eigene Notizen.
5. **Gastgeber** schaltet auf den nächsten Whisky weiter; alle Handys springen automatisch mit.
6. **Gastgeber** schließt das Event ab. Erst jetzt werden die Whisky-Namen aufgelöst,
   die Rangliste erscheint und keine Bewertung kann mehr geändert werden.

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
- **Keine öffentliche Whisky-Datenbank** — Whiskys werden pro Event frei eingetragen, es gibt
  keinen Katalog und keine Anbindung an externe Whisky-APIs
- **Keine Fotos oder Datei-Uploads** in dieser Version (Supabase Storage bleibt ungenutzt)
- **Keine Aromen-Räder, Flavour-Profile oder Tasting-Notes-Vorlagen** — nur Nase, Geschmack
  und ein Freitextfeld
- **Keine Einladung von Gästen außerhalb der Runde** — geschlossener Nutzerkreis
- **Keine parallelen Tastings** an unterschiedlichen Orten zur selben Zeit
- **Keine native App**, keine Push-Benachrichtigungen, keine Offline-Fähigkeit
- **Keine Statistiken über mehrere Tastings hinweg** (Lieblingsdestillerie, Punkteschnitt pro
  Person über die Zeit) — denkbar für später, nicht im MVP

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
