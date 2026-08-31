# PROJ-13: Marken-Auftritt (Whizzky)

## Status: Planned
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — `AuthCard`, das `(auth)`-Layout
  und die App-Shell / `PageHeader` stammen von dort.
- **Baut auf PROJ-12 (App-Icon & Homescreen)** — Tab-Titel („%s · Whizzky"),
  Homescreen-Name und `theme-color` sind bereits „Whizzky" bzw. `#161310`;
  PROJ-13 fasst diese **nicht** noch einmal an.
- **Nutzt** das Design-System (`docs/design-system.md`): dark-first,
  Bernstein-Akzent, Display-Schrift Fraunces, Grundfläche `#161310`.
- **Kein** Bezug zu Supabase, RLS oder Daten.

## Kontext

Die App heißt sichtbar noch „Whisky-Tasting" — als einzelne Zeile im
Marken-Block der Auth-Seiten (`AuthCard`). PROJ-13 ersetzt das durch den
eigentlichen Marken-Auftritt: die Haupt-Überschrift **„Whizzky"**, darunter
kleiner und gedämpft **„Treffpunkt feiner Geister"**. Dazu bekommt die App einen
Hauch Atmosphäre — ein **sehr dezentes, abstraktes Hintergrundbild** in
Bernstein-/Dunkeltönen hinter der Anmelde-Box und als schmales Band hinter den
Seiten-Überschriften.

Das Design-System ist bewusst dekorationsarm („keine Fass-Texturen, keine
Schnörkel — Wärme aus Farbe und Typografie"). Das Hintergrundbild ist der eine
zugelassene Gegenakzent und muss entsprechend zurückhaltend sein: fast
unmerklich, immer mit Scrim, nie auf Kosten der Lesbarkeit.

**Rein Frontend, keine DB-Änderung, kein Backend.** Betroffen sind genau zwei
Bausteine: der Marken-Block (`AuthCard`) und die Kopfzone (`(auth)`-Layout +
`PageHeader` / App-Shell).

## User Stories

- Als **Nutzer** möchte ich auf der Anmelde-Seite „Whizzky – Treffpunkt feiner
  Geister" sehen, damit die App einen Namen und einen Ton hat, nicht bloß eine
  Gattungsbezeichnung.
- Als **Teilnehmer** möchte ich, dass die App beim Öffnen etwas Atmosphäre
  ausstrahlt (warmer, ruhiger Hintergrund), ohne dass Text oder Bedienelemente
  dadurch schwerer lesbar werden.
- Als **Nutzer mit schwachem Sehvermögen** möchte ich, dass alle Texte auch mit
  dem Hintergrundbild klar lesbar bleiben (WCAG AA).
- Als **Nutzer auf einem schmalen Handy** möchte ich, dass die Überschrift und
  die Unterzeile vollständig und ordentlich umbrechen.
- Als **Nutzer mit langsamer Verbindung** möchte ich, dass die Seite auch ohne
  fertig geladenes Hintergrundbild ruhig und vollständig aussieht.

## Out of Scope

- **Animation** — kein Parallax, kein Ken-Burns, kein bewegter Verlauf. Das Bild
  ist statisch.
- **Wallpaper-/Theme-Picker**, saisonale Varianten, pro-Nutzer-Hintergrund.
- **Ein neuer Dauer-Header** in der angemeldeten App — die App-Shell bleibt
  Spalte + Bottom-Nav; „Whizzky" erscheint dort **nicht** als Kopfzeile.
- **Ein Bild-Logo / Grafik-Element** — „Whizzky" ist gesetzte Typografie. Das
  App-Icon ist PROJ-12.
- **Änderung an `theme-color`, Web-Manifest oder `<title>`** — alles PROJ-12.
- **Neue Seiten oder Layout-Umbauten** über das Hintergrund-Band und den
  Marken-Block hinaus.
- **DB / Backend / Server-Action.**
- **Light-Mode-Feinschliff** — die App läuft fest im Dark Mode
  (`enableSystem={false}`); die Behandlung wird nur für Dark gestaltet und
  getestet.
- **Projektweite Umbenennung** von „Whisky-Tasting" in `docs/PRD.md`,
  Kommentaren, Feature-Specs, `.env.local.example`, Repo-Name — PROJ-13 ändert
  nur sichtbare UI-Strings.
- **Änderung an `metadata.description`** — bleibt „Digitale Verkostung für unsere
  Runde".

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Marken-Block (Auth-Seiten)

- [ ] Angenommen ein Nutzer öffnet die Anmelde-Seite, wenn sie lädt, dann steht
      über der Karte **„Whizzky"** in der Display-Schrift (groß, Bernstein-Akzent)
      und direkt darunter kleiner und gedämpft **„Treffpunkt feiner Geister"** —
      nicht mehr „Whisky-Tasting".
- [ ] Angenommen ein Nutzer öffnet „Passwort setzen" oder „Passwort vergessen",
      wenn die Seite lädt, dann zeigt sie denselben Marken-Block (er kommt aus
      `AuthCard` und gilt für alle Auth-Seiten).
- [ ] Angenommen das Gerät ist nur 320 px breit, wenn der Marken-Block
      dargestellt wird, dann bricht „Treffpunkt feiner Geister" bei Bedarf um und
      wird nicht abgeschnitten; „Whizzky" bleibt einzeilig.

### Hintergrund — Auth-Seiten

- [ ] Angenommen ein Nutzer öffnet eine Auth-Seite, wenn sie lädt, dann liegt
      hinter der zentrierten Box ein sehr dezenter, abstrakter Hintergrund in
      Bernstein-/Dunkeltönen mit Scrim; die Karte, die Eingabefelder und die
      Buttons sitzen auf ihren eigenen deckenden Flächen.
- [ ] Angenommen eine Auth-Seite zeigt einen Fehler-Alert (deaktiviert /
      abgemeldet / „Link ungültig"), wenn er dargestellt wird, dann sitzt der
      Alert auf einer deckenden Fläche über dem Hintergrund und ist voll lesbar.

### Hintergrund — angemeldete App

- [ ] Angenommen ein angemeldeter Nutzer öffnet eine `(app)`-Seite, wenn sie
      lädt, dann liegt hinter dem `PageHeader` (Titel + optionale Unterzeile) ein
      dezentes Band, das nach unten weich in den Standard-Hintergrund `#161310`
      ausläuft; der übrige Seiteninhalt (Karten, Listen, Slider) steht auf dem
      ruhigen Standard-Hintergrund.
- [ ] Angenommen ein `PageHeader`-Titel ist sehr lang (z. B. „Hallo, {langer
      Anzeigename}"), wenn die Seite dargestellt wird, dann wächst das Band mit
      der Header-Höhe und der Verlauf nach unten bleibt weich.

### Lesbarkeit & Robustheit

- [ ] Angenommen irgendein Text liegt über dem Hintergrundbild, wenn der Kontrast
      gemessen wird, dann erreicht Fließtext ≥ 4,5:1 und große Überschrift ≥ 3:1
      gegen den tatsächlichen Hintergrund (WCAG 2.1 AA).
- [ ] Angenommen ein Bedienelement erhält Fokus, wenn der Fokusring dargestellt
      wird, dann ist er (Bernstein, `--ring`) über dem Hintergrund klar sichtbar.
- [ ] Angenommen das Hintergrundbild lädt nicht oder langsam, wenn die Seite
      dargestellt wird, dann zeigt der Bereich eine ruhige deckende Farbe bzw.
      einen CSS-Verlauf als Basis; nichts wirkt kaputt, aller Text bleibt lesbar.
- [ ] Angenommen JavaScript ist deaktiviert, wenn die Seite ausgeliefert wird,
      dann sind Marken-Block und Hintergrund vorhanden (reines CSS/Markup).
- [ ] Angenommen die Seite wird gedruckt oder im Reader-Modus geöffnet, wenn sie
      dargestellt wird, dann verschwindet der Hintergrund und der Inhalt bleibt
      vollständig (rein dekorativ, kein Inhalt, `aria-hidden` bzw.
      CSS-Background).

### Performance

- [ ] Angenommen ein Bild-Asset wird verwendet, wenn die Anmelde-Seite geladen
      wird, dann ist es ein einzelnes optimiertes Bild (WebP/AVIF, wenige KB) und
      die Lighthouse-Performance bleibt > 90.

## Edge Cases

- **Bild lädt nicht / langsam** → deckende Farbe bzw. CSS-Verlauf als Basis,
  Layout und Lesbarkeit unberührt.
- **320–375 px Breite** → Band und Marken-Block skalieren; Unterzeile bricht um,
  wird nicht abgeschnitten.
- **Sehr langer Header-Titel** → Band wächst mit, Verlauf bleibt weich.
- **Fehler-Alert auf Auth-Seite** → auf eigener deckender Fläche, voll lesbar.
- **JavaScript aus / langsam** → Marken-Block + Hintergrund sind CSS/Markup.
- **Druck / Reader-Modus** → Hintergrund weg, Inhalt vollständig.
- **Light Mode versehentlich aktiv** → Bild einfach nicht sichtbar / neutral;
  kein kaputtes Layout, aber auch kein Feinschliff.
- **Sehr großer Desktop-Viewport** → der Hintergrund kachelt / verzerrt nicht
  unschön; er bleibt ruhig (fest positioniert oder sauber skaliert).

## Technical Requirements (optional)

- **Rein statisch:** CSS + Markup + höchstens ein Bild-Asset unter `public/`.
  Keine Laufzeit-Erzeugung, keine JS-Abhängigkeit, keine neue Library, kein
  zusätzlicher Web-Font, kein Bild-CDN.
- **Betroffene Dateien (erwartet):** `src/components/auth/auth-card.tsx`
  (Marken-Block), `src/app/(auth)/layout.tsx` (Auth-Hintergrund),
  `src/components/layout/page-header.tsx` und/oder `src/components/layout/app-shell.tsx`
  (Kopf-Band), evtl. `src/app/globals.css` (Verlauf/Tokens).
- **Barrierefreiheit:** WCAG 2.1 AA für alle Textkontraste über dem Hintergrund;
  Fokusring bleibt sichtbar; der Hintergrund trägt keine Information
  (`aria-hidden` / CSS-Background).
- **Nur Dark Mode** gestaltet und getestet.
- **Performance:** kein spürbarer FCP-Verlust; Lighthouse-Performance > 90.
- **Browser:** aktuelle iOS-Safari, Android-Chrome, Desktop-Chrome/Firefox/Safari.

## Open Questions

- [ ] Bild vs. reine CSS-Lösung (Verlauf + Rauschen, null Bytes): Entscheidung
      für `/architecture` bzw. `/frontend` — die CSS-Variante ist bevorzugt,
      wenn sie den Effekt trägt.
- [ ] Falls Bild: konkrete Vorlage (der Nutzer stellt keine bereit) —
      abstraktes Bernstein-Bokeh / Verlaufsfläche, in `/frontend` zu erzeugen
      oder aus einer freien Quelle zu holen und stark nachzubearbeiten.
- [ ] Genaue Deckkraft / Scrim-Stärke — Richtwert 8–15 % Bildpräsenz; final per
      Kontrastmessung in `/qa`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Marken-Block **nur auf den Auth-Seiten**; in der angemeldeten App kein neuer Dauer-Header | Die App-Shell ist bewusst schlank (Spalte + Bottom-Nav); „Whizzky" lebt in der App über Tab-Titel und Homescreen-Namen (PROJ-12). Ein Header wäre verschenkte vertikale Höhe auf dem Handy | 2026-08-31 |
| „Whizzky" groß in der Display-Schrift + kleinere, gedämpfte Unterzeile „Treffpunkt feiner Geister" | Klare Hierarchie: Name zuerst, Ton darunter; passt zur Design-System-Typografie (Fraunces für Display, gedämpfte Metadaten) | 2026-08-31 |
| Ein **sehr dezentes, abstraktes** Hintergrund-Asset in Bernstein/Dunkel mit Scrim — kein erkennbares Foto, kein Blickfang-Motiv | Das Design-System ist dekorationsarm; ein starkes Bild würde dem widersprechen. Der Gegenakzent ist erlaubt, aber nur fast unmerklich | 2026-08-31 |
| Reine **CSS-Lösung bevorzugt** (Verlauf + Rauschen), Bild nur falls nötig | Null zusätzliche Bytes, keine Ladeabhängigkeit, am nächsten am Design-System | 2026-08-31 |
| Im angemeldeten Bereich: **Band hinter dem `PageHeader`**, das nach unten ausläuft — nicht die ganze Seite | Ranglisten, Formulare und Slider sollen nicht auf einem Bild „schwimmen"; oben ein Hauch Marke reicht | 2026-08-31 |
| Auth-Seiten dürfen den Hintergrund **präsenter** zeigen als die App-Seiten | Die Auth-Seiten sind leerer und tragen mehr Atmosphäre, ohne mit Inhalt zu konkurrieren | 2026-08-31 |
| **Nur Dark Mode** gestaltet | `ThemeProvider` läuft mit `defaultTheme="dark"` / `enableSystem={false}`; Light ist im Betrieb nie aktiv | 2026-08-31 |
| **Harte Lesbarkeits-Regel:** WCAG AA über dem Hintergrund, Fokusring bleibt sichtbar, Eingaben/Buttons/Karten auf eigenen deckenden Flächen | Ein Tasting wird abends bei gedämpftem Licht am Handy bedient — Lesbarkeit geht immer vor Optik | 2026-08-31 |
| Hintergrund **statisch**, keine Animation/Parallax | Ruhe; kein `prefers-reduced-motion`-Aufwand; kein Performance-Risiko | 2026-08-31 |
| PROJ-13 ändert **nur sichtbare UI-Strings**, keine projektweite Umbenennung | Eine Umbenennung von PRD/Doku/Repo ist ein eigenes, größeres Thema und nicht Teil einer visuellen Politur | 2026-08-31 |
| Fallback-Basisfarbe/-verlauf immer vorhanden, damit ein fehlendes Bild nichts bricht | Robustheit bei langsamer Verbindung / blockierten Assets | 2026-08-31 |

### Technical Decisions
_To be added by /architecture_

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
