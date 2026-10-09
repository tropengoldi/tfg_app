# PROJ-27: Release-Notes-Seite „Neuigkeiten“

## Status: Deployed
**Created:** 2026-10-09
**Last Updated:** 2026-10-09

## Dependencies
- **Requires: PROJ-13 (Marken-Auftritt)**: dezenter Marken-Hintergrund (`.brand-surface`), Whizzky-Schriften.
- **Inhalt:** Release Notes zu PROJ-18 bis PROJ-26 (Claude-Doc „Whizzky – Was gibt's Neues im Glas?“,
  2026-10-09).

## Kontext
Die Runde soll die neuen Funktionen (PROJ-18..26) in einer kurzen, charmanten Übersicht nachlesen
können. Der Text liegt als Doc vor; er soll zusätzlich **in der App** stehen, mit einem dezenten,
edlen Hintergrund, und **ohne Anmeldung** per Link erreichbar sein (z. B. für die WhatsApp-Gruppe).

Schlanker Ablauf (Entscheidung des Nutzers 2026-10-09): kurze Spec, Seite bauen, E2E-Test, Deploy —
kein separates Architektur-/QA-Interview. Reiner Inhalt, keine Datenbank.

## User Stories
- Als **Mitglied der Runde** möchte ich per Link nachlesen, was sich in der App geändert hat, ohne mich
  erst anmelden zu müssen.
- Als **Mitglied** möchte ich den Text auf dem Handy gut lesen können, auch bei gedämpftem Licht.
- Als **Admin** möchte ich den Link einfach in die Gruppe schicken können.

## Out of Scope
- Bearbeiten der Release Notes in der App (Text liegt im Code; Änderungen per Deploy)
- Mehrere Versionen / Archiv früherer Release Notes
- Benachrichtigungen über neue Release Notes (→ PROJ-17)
- Suchmaschinen-Indexierung (Seite ist öffentlich, aber `noindex`)

## Acceptance Criteria
- [x] Angenommen jemand ist nicht angemeldet, wenn er `/neuigkeiten` öffnet, dann sieht er die Release
  Notes und wird nicht auf `/login` umgeleitet.
- [x] Angenommen jemand ist angemeldet, wenn er `/neuigkeiten` öffnet, dann sieht er dieselbe Seite.
- [x] Angenommen die Seite ist geöffnet, dann zeigt sie Titel „Whizzky – Was gibt's Neues im Glas?“,
  Stand 09.10.2026 und die Abschnitte: Neue Begriffe, Punkte, Whisky-Steward, Sieger-Tipp, Während des
  Abends, Nach dem Abend, Hinter den Kulissen, Zum Wohl.
- [x] Angenommen die Seite ist geöffnet, dann liegt der Text auf einer Fläche mit dezentem
  Marken-Hintergrund; der Fließtext erfüllt den Kontrast für normalen Text (WCAG AA).
- [x] Angenommen ein Handy mit 360 px Breite, dann gibt es kein horizontales Scrollen.
- [x] Angenommen der Nutzer bevorzugt reduzierte Transparenz/Kontrast (bestehende Regel aus PROJ-13),
  dann entfällt der dekorative Hintergrund, der Text bleibt.
- [x] Angenommen eine Suchmaschine ruft die Seite ab, dann ist sie als `noindex` markiert.
- [x] Angenommen die Seite ist geöffnet, dann führt ein Link „Zur App“ zur Startseite (angemeldet) bzw.
  zur Anmeldung (nicht angemeldet).

## Edge Cases
- Angemeldete Nutzer werden von `/neuigkeiten` nicht weggeleitet (anders als von `/login`).
- Kein Bezug auf Nutzerdaten: die Seite ist für alle gleich.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Öffentlich ohne Login | Link direkt in die WhatsApp-Gruppe teilbar (Wunsch des Nutzers) | 2026-10-09 |
| Schlanker Ablauf als PROJ-27 | Reiner statischer Inhalt, kein Datenmodell | 2026-10-09 |
| Hintergrund: bestehender Marken-Hintergrund aus PROJ-13 plus Lesefläche | Dezent und edel, ohne neue Bilder; der Text liegt auf einer ruhigen Karte → Lesbarkeit | 2026-10-09 |
| Claude-Doc ohne Hintergrund | Das Doc kennt keinen Seitenhintergrund; der gestaltete Auftritt liegt in der App | 2026-10-09 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Statische Seite `src/app/neuigkeiten/page.tsx` außerhalb der Gruppen `(app)`/`(auth)` | Kein App-Rahmen mit Navigation nötig; Inhalt im Code | 2026-10-09 |
| `/neuigkeiten` in `PUBLIC_PATHS` von `src/proxy.ts`, nicht in `AUTHED_AWAY_FROM` | Ohne Login erreichbar, Angemeldete dürfen bleiben | 2026-10-09 |
| `robots: noindex` per Metadata | Öffentlich teilbar, aber nicht in Suchmaschinen | 2026-10-09 |

---

## Tech Design (Solution Architect)
Schlanker Ablauf: siehe Technical Decisions.

## Umsetzung (2026-10-09)
- Seite `src/app/neuigkeiten/page.tsx`: Whizzky-Schriftzug wie die Anmeldung, `.brand-surface` als
  fester Hintergrund (bernsteinfarbene Verläufe + feine Körnung, PROJ-13), Lesekarte mit Goldrand,
  Überschriften in der Display-Schrift, Fließtext in voller Vordergrundfarbe, Stand-Zeile, Link
  „Zur App“. Text = Claude-Doc vom 2026-10-09 (unverändert übernommen)
- `src/proxy.ts`: `/neuigkeiten` in `PUBLIC_PATHS`

## QA Test Results
**Tested:** 2026-10-09, Production-Build lokal
- `tests/PROJ-27-neuigkeiten.spec.ts`: Chromium 6/6 (inkl. Screenshot), Mobile Safari 5/5 + 1 übersprungen
  (Screenshot nur mit `SHOT_DIR`)
- Regression `proxy.ts`: PROJ-2 (Anmeldung/Umleitungen) auf Mobile Safari grün
- Sichtprüfung 390 px und 1280 px: gut lesbar, Hintergrund nur an den Rändern spürbar
- **Bugs:** keine. **Production Ready:** YES

## Deployment
- **Production URL:** https://tfg-app-self.vercel.app/neuigkeiten (öffentlich, ohne Login)
- **Deployed:** 2026-10-09 als `v1.16.0` (Commit `54796c0`, Vercel „Deployment has completed“)
- **Live geprüft:** ohne Anmeldung HTTP 200, keine Umleitung, Titel vorhanden
- Keine DB-Migration
