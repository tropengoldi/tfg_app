# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | Supabase-Infrastruktur | Approved | [PROJ-1-supabase-infrastruktur.md](PROJ-1-supabase-infrastruktur.md) | 2026-08-27 |
| PROJ-2 | Auth & Zugangskontrolle | In Progress | [PROJ-2-auth-zugangskontrolle.md](PROJ-2-auth-zugangskontrolle.md) | 2026-08-27 |
| PROJ-3 | Admin – Teilnehmerverwaltung | Roadmap | – | 2026-08-27 |
| PROJ-4 | Admin – Tasting-Events verwalten | Roadmap | – | 2026-08-27 |
| PROJ-5 | Whisky-Erfassung (blind) | Roadmap | – | 2026-08-27 |
| PROJ-6 | Gastgeber-Steuerung & Ablauf | Roadmap | – | 2026-08-27 |
| PROJ-7 | Bewertungsansicht | Roadmap | – | 2026-08-27 |
| PROJ-8 | Tasting-Dashboard mit Live-Sync | Roadmap | – | 2026-08-27 |
| PROJ-9 | Ergebnisse & Tasting-Historie | Roadmap | – | 2026-08-27 |
| PROJ-10 | Profil-Seite mit persönlicher Bilanz | Roadmap | – | 2026-08-27 |

<!-- Add features above this line -->

## Next Available ID: PROJ-11

---

## Feature Map

Empfohlene Baureihenfolge: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10**.
Sie folgt dem Datenlebenszyklus, damit jedes Feature gegen echte Daten des Vorgängers
end-to-end testbar ist — die Bewertungsansicht lässt sich nicht sinnvoll prüfen, bevor
Whiskies existieren und eine Runde läuft.

| ID | Feature | Beschreibung | Prio | Abhängig von |
|----|---------|--------------|------|--------------|
| **PROJ-1** | **Supabase-Infrastruktur** | Datenbankschema, Constraints, Indizes, RLS-Policies und Helper-Funktionen, RPCs für alle Zustandsübergänge, Ranglisten-Views, Realtime-Publication, Seed-Daten (Admin + Testteilnehmer + Beispiel-Event), generierte TypeScript-Typen, Supabase-Clients | P0 | – |
| **PROJ-2** | **Auth & Zugangskontrolle** | Login, Passwort setzen und zurücksetzen, SSR-Session-Middleware, App-Shell mit Bottom-Navigation, Rollenprüfungen für Admin- und Gastgeber-Bereiche, öffentliche Registrierung gesperrt | P0 | PROJ-1 |
| **PROJ-3** | **Admin – Teilnehmerverwaltung** | Teilnehmer per E-Mail einladen, auflisten und deaktivieren | P0 | PROJ-2 |
| **PROJ-4** | **Admin – Tasting-Events verwalten** | Event anlegen und bearbeiten: Gastgeber, Datum, Ort, Teilnehmerliste, maximale Anzahl Whiskies pro Person (Gastgeber darf einen mehr), Thema | P0 | PROJ-3 |
| **PROJ-5** | **Whisky-Erfassung (blind)** | Teilnehmer trägt die von ihm mitgebrachten Whiskies ein inkl. optionalem Link zum Verkostungsvideo; Limitprüfung mit Gastgeber-Bonus; nur der Bringer und der Gastgeber sehen die Details | P0 | PROJ-4 |
| **PROJ-6** | **Gastgeber-Steuerung & Ablauf** | Eckdaten des Abends (Thema, Essen, Anmerkungen), Ausschankreihenfolge per Drag & Drop, Event starten, Runde abschließen, Event abschließen | P0 | PROJ-5 |
| **PROJ-7** | **Bewertungsansicht** | Nasenpunkte 1–5 und Geschmackspunkte 1–10 per Slider, optionale Notizen, änderbar bis zum Abschluss des Events | P0 | PROJ-6 |
| **PROJ-8** | **Tasting-Dashboard mit Live-Sync** | Eckdaten, Teilnehmerliste, Whiskyglas-Fortschritt, Absprünge zu Bewertung/Gastgeber/Historie, Realtime-Aktualisierung aller Geräte beim Rundenwechsel | P0 | PROJ-7 |
| **PROJ-9** | **Ergebnisse & Tasting-Historie** | Rangliste nach Abschluss (Gesamt-, Nasen-, Geschmackspunkte) mit Link zum Verkostungsvideo je Whisky, Liste vergangener Tastings mit Datum, Gastgeber und Sieger-Whisky, Detailansicht | P1 | PROJ-7 |
| **PROJ-10** | **Profil-Seite mit persönlicher Bilanz** | Eigene Daten bearbeiten (Anzeigename, Lieblings-Dram, Lieblingsregion, Kurzbeschreibung) plus persönliche Bilanz: Anzahl Tastings, mitgebrachte Whiskies, beste Platzierung, Ø vergebene Punkte | P2 | PROJ-9 |

### Anmerkungen zur Aufteilung

- **App-Shell und Navigation liegen in PROJ-2**, nicht im Dashboard — sonst bräuchte jedes
  spätere Feature eine Wegwerf-Navigation zum Testen.
- **PROJ-8 ist bewusst das letzte P0.** Das Dashboard ist überwiegend Komposition dessen,
  was PROJ-4 bis PROJ-7 bereits gebaut haben, plus die Realtime-Schicht — und die lässt sich
  erst dann sinnvoll verifizieren, wenn es echten Zustand zu bewegen gibt.
- **Admin- und Teilnehmer-Funktionen sind getrennt** (PROJ-3/PROJ-4 vs. PROJ-5), weil sie
  unterschiedliche Rollen bedienen und unabhängig testbar sein müssen.
- **PROJ-9 ist P1**, weil ein erstes Tasting auch ohne Historienansicht durchführbar ist —
  die Daten entstehen trotzdem von Anfang an korrekt.
- **PROJ-10 hängt an PROJ-9, nicht an PROJ-2**, obwohl es nur eine Profilseite ist: die
  persönliche Bilanz („beste Platzierung", „Ø vergebene Punkte") liest die Ranglisten-View,
  die erst mit PROJ-9 gebaut wird. Die reine Stammdaten-Bearbeitung ginge früher — es lohnt
  sich aber nicht, die Seite zweimal anzufassen.
- **Der Link zum Verkostungsvideo** entsteht in PROJ-5 (eingeben) und wird in PROJ-9 sichtbar
  (nach der Auflösung). Er liegt in der geheimen Whisky-Tabelle, weil eine YouTube-URL den
  Whisky verrät — vor dem Abschluss sehen ihn nur der Bringer und der Gastgeber.
