# PROJ-13: Marken-Auftritt (Whizzky)

## Status: In Progress
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

- [x] ~~Bild vs. reine CSS-Lösung~~ **Gelöst (`/architecture`): reine CSS-Lösung**,
      kein Bild-Asset. Zwei weiche Bernstein-Radialverläufe + ein sehr feines
      Rausch-Muster als Inline-Data-URI, alles über der Grundfläche `#161310`.
      Null zusätzliche Bytes, keine Ladeabhängigkeit.
- [x] ~~Konkrete Bildvorlage~~ **Entfällt** — kein Bild.
- [ ] Finale Zahlenwerte (Verlaufs-Alpha, Rausch-Deckkraft, Bandhöhe): Startwerte
      im Tech Design, final per Kontrastmessung in `/qa` justiert.

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
| Decision | Rationale | Date |
|----------|-----------|------|
| **Frontend-only**, keine DB, kein Backend, keine Server-Action, keine neue Library, kein Bild-Asset, kein Web-Font | Es geht um zwei Textzeilen und eine dekorative Fläche | 2026-08-31 |
| **Reine CSS-Fläche** statt Bild: zwei weiche Radialverläufe in `--primary` / `--gold` mit sehr niedrigem Alpha über `#161310`, plus ein feines Rausch-Muster als Inline-SVG-`data:`-URI (kein File) | Null Bytes, keine Ladeabhängigkeit, am nächsten am dekorationsarmen Design-System; ein „fehlendes Bild" kann nichts brechen, weil es keins gibt | 2026-08-31 |
| **Eine gemeinsame Rezeptur in `src/app/globals.css`** — zwei Utility-Klassen (`brand-surface` für die Auth-Fläche, `header-band` für das App-Band) | Auth-Seiten und App-Header teilen dieselbe Farbstimmung; QA hat **einen** Ort zum Feinjustieren der Alpha-Werte | 2026-08-31 |
| Auth-Hintergrund als **fest positionierte, `aria-hidden`, `pointer-events-none` Deko-Ebene** hinter `{children}` im `(auth)`-Layout (`-z-10`) | Deckt den ganzen Viewport ruhig ab, ohne Scroll-Effekt; trägt keine Information; fängt keine Klicks ab | 2026-08-31 |
| App-Band an **`PageHeader`** (nicht an der App-Shell): der Header bekommt einen nach unten auslaufenden Verlauf, der über die `main`-Innenbreite reicht | „Hinter den Seiten-Überschriften" ist genau `PageHeader`; er sitzt auf jeder `(app)`-Seite ganz oben. Kein Eingriff in `AppShell`/Routing | 2026-08-31 |
| **Kein Text und kein Bedienelement sitzt direkt auf der Deko-Ebene** — nur der Marken-Block (Auth) und `PageHeader`-Titel/Unterzeile. Karten, Inputs, Buttons, Alerts haben ihre eigenen deckenden Token-Flächen (`--card` / `--input` / …) | Damit ist die Lesbarkeit strukturell abgesichert; QA misst nur die zwei Textblöcke | 2026-08-31 |
| Startwerte: Radial-Alpha ~0,05–0,08, Rausch-Deckkraft ~0,03, Bandhöhe ~140 px, Auth-Fläche etwas präsenter als das App-Band | Richtwerte aus der Spec (8–15 % Präsenz); `/qa` justiert per Kontrastmessung | 2026-08-31 |
| `@media print` schaltet die Deko-Ebene ab | Druck / Reader-Modus: nur Inhalt | 2026-08-31 |
| Marken-Block: `AuthCard` rendert statt der einen Zeile zwei — `„Whizzky"` (`font-display`, groß, `text-primary`) + `„Treffpunkt feiner Geister"` (klein, `text-muted-foreground`) | Klare Hierarchie, bestehende Design-Tokens, kein neues Markup-Muster | 2026-08-31 |
| Nur Dark: keine Anpassung der Light-Tokens, kein Light-`@media`-Zweig für die neuen Klassen | `ThemeProvider` läuft fest dark; doppelter Aufwand für einen unsichtbaren Modus vermeiden | 2026-08-31 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

Rein visuell, **kein** Backend, **keine** neue Abhängigkeit, **kein** Bild.
Drei kleine Eingriffe:

1. **Marken-Block** — `AuthCard` zeigt statt „Whisky-Tasting" zwei Zeilen:
   „Whizzky" groß, „Treffpunkt feiner Geister" klein darunter.
2. **Auth-Hintergrund** — eine dekorative CSS-Fläche hinter der zentrierten Box.
3. **App-Band** — ein nach unten auslaufender Verlauf hinter jedem `PageHeader`.

Die „Bild"-Idee aus der Spec wird als **reine CSS-Lösung** umgesetzt: zwei sehr
schwache Bernstein-Radialverläufe plus ein feines Rauschen (Inline-Data-URI)
über der Grundfläche `#161310`. Das ist dem dekorationsarmen Design-System am
nächsten und hat keine Ladeabhängigkeit.

### A) Betroffene Bausteine

```
src/app/globals.css
  └─ NEU: zwei Utility-Klassen (eine Rezeptur, ein Ort zum Justieren)
       .brand-surface  — die Auth-Deko-Ebene (Radialverläufe + Rauschen + Scrim)
       .header-band     — der nach unten auslaufende Verlauf hinter dem PageHeader
     + @media print { … } schaltet beide ab

src/app/(auth)/layout.tsx
  └─ hinter {children}: eine fest positionierte, aria-hidden,
     pointer-events-none Ebene mit .brand-surface (-z-10), Viewport-füllend

src/components/auth/auth-card.tsx
  └─ der eine <p>„Whisky-Tasting"</p> wird zum Marken-Block:
       „Whizzky"                    font-display, groß, text-primary
       „Treffpunkt feiner Geister"  klein, text-muted-foreground

src/components/layout/page-header.tsx
  └─ der <header> bekommt .header-band: ein oben verankerter Verlauf, der
     innerhalb der ~140 px Bandhöhe weich nach transparent (#161310) ausläuft;
     reicht über die main-Innenbreite. Titel/Unterzeile bleiben unverändert.
```

Kein Eingriff in `AppShell`, Routing, Layout-Struktur oder Tailwind-Config.

### B) Wie die Lesbarkeit strukturell gesichert ist

- Die Deko-Ebene liegt **immer hinter** deckenden Token-Flächen: `Card`
  (`--card`), `Input` (`--input`), `Button`, `Alert` haben jeweils eigenen
  Hintergrund. Auf diesen Elementen ändert sich am Kontrast **nichts**.
- Direkt auf der Deko-Ebene steht nur:
  - der **Marken-Block** (Auth) — „Whizzky" in `--primary`, Unterzeile in
    `--muted-foreground`, auf nahezu `#161310`.
  - der **`PageHeader`** — Titel in `--foreground`, Unterzeile in
    `--muted-foreground`, auf dem `header-band`.
- Beide Fälle misst `/qa` gegen WCAG 2.1 AA (Fließtext ≥ 4,5:1, große
  Überschrift ≥ 3:1). Die Startwerte (Alpha ~0,05–0,08 für die Verläufe, ~0,03
  fürs Rauschen) sind bewusst so niedrig, dass der effektive Hintergrund von
  `#161310` praktisch nicht abweicht.
- Der Fokusring (`--ring`, Bernstein) sitzt auf den Bedienelementen, nicht auf
  der Deko-Ebene — unverändert sichtbar.

### C) „Datenmodell"

Keins. Die einzige „Konfiguration" sind die Alpha-/Größenwerte in den zwei
CSS-Klassen — an einer Stelle, von `/qa` justierbar.

### D) Backend-Bedarf

Keiner.

### E) Auswirkungen auf Bestehendes

- **`AuthCard`** wird auf allen Auth-Seiten (Login, Passwort setzen, Passwort
  vergessen) verwendet → der Marken-Block erscheint überall gleich. Keine dieser
  Seiten ändert sonst ihr Verhalten.
- **`PageHeader`** wird auf **jeder** `(app)`-Seite verwendet (Dashboard,
  Tastings, Bewerten, Ergebnisse, Gastgeber, Whiskys, Profil, Admin-Seiten) →
  das Band erscheint überall oben. Titeltexte, Abstände (`mb-6`) und die
  Semantik (`<h1>`) bleiben.
- **`globals.css`** bekommt zwei Klassen + einen `@media print`-Block. Bestehende
  Tokens und der `body`-Block bleiben unangetastet.
- Der sichtbare String „Whisky-Tasting" verschwindet aus der laufenden App
  (er stand nur im `AuthCard`). PRD/Doku/Kommentare bleiben (Spec-Grenze).

### F) Neue Pakete

Keine.

### G) Robustheit / Randfälle (wie abgedeckt)

- **Kein Bild** → „Bild lädt nicht" ist gegenstandslos; Basis ist immer
  `#161310`, die Verläufe sind CSS.
- **Schmales Gerät** → der Marken-Block ist zentrierter Fließtext, bricht
  natürlich um; das Band ist ein Verlauf ohne feste Breite.
- **Langer Header-Titel** → das Band ist am `<header>` verankert und wächst mit
  dessen Höhe; der Verlauf endet relativ zur Bandhöhe weich.
- **JS aus** → alles CSS/Markup.
- **Druck / Reader** → `@media print` (und der rein dekorative Charakter)
  entfernt die Flächen.
- **Light Mode** (versehentlich aktiv) → die Verläufe nutzen `--primary` /
  `--gold`, die auch Light-Werte haben; die Fläche wäre dort einfach ein
  minimaler warmer Hauch, kein kaputtes Layout. Kein Feinschliff (Spec-Grenze).

### H) Verifikation (Hinweis für `/qa`)

- Kontrastmessung an „Whizzky", „Treffpunkt feiner Geister" und einem
  `PageHeader`-Titel/-Unterzeile über der Deko-Ebene → WCAG AA.
- Sichtprüfung: Fläche „fast unmerklich", kein Blickfang, kein harter Bandschnitt.
- Fokusring auf Login-Feldern klar sichtbar.
- `npm run build` / Lighthouse-Performance unverändert (kein Netzwerk-Asset).
- Bestehende E2E (Auth, App-Shell) unverändert grün — der Marken-Block-Text
  ändert sich (ein E2E, das auf „Whisky-Tasting" prüft, müsste angepasst werden;
  Grep zeigt aktuell keins).

## Implementation Notes (Frontend)

**Stand:** komplett. **Kein Backend, keine neue Abhängigkeit, kein Bild-Asset.**
Vier Dateien:

- **`src/app/globals.css`** — zwei Klassen im `@layer components` plus ein
  `@media print`-Block:
  - `.brand-surface`: `background-color: hsl(var(--background))` + zwei weiche
    Radialverläufe (`--primary / 0.07` oben-links, `--gold / 0.055`
    unten-rechts) + ein feines graustufiges Rauschen als Inline-SVG-`data:`-URI
    (`feTurbulence`, `rect` mit `opacity 0.035`, 140 px gekachelt).
  - `.header-band`: `position: relative; isolation: isolate;` + ein
    `::before` (`z-index: -1`, `pointer-events: none`), das zu den `main`-Rändern
    blutet (`left/right: -1rem`, `top: -1.5rem`, `height: 9rem`) und einen
    Radial- (`--primary / 0.06`) + Linearverlauf (`--gold / 0.035` → transparent)
    trägt.
  - `@media print` schaltet beide ab.
- **`src/app/(auth)/layout.tsx`** — hinter `{children}` eine `aria-hidden`,
  `pointer-events-none`, `fixed inset-0 -z-10` Ebene mit `.brand-surface`.
- **`src/components/auth/auth-card.tsx`** — die eine Zeile „Whisky-Tasting" →
  Marken-Block: „Whizzky" (`font-display text-3xl leading-none text-primary`) +
  „Treffpunkt feiner Geister" (`text-sm text-muted-foreground`).
- **`src/components/layout/page-header.tsx`** — `<header>` bekommt zusätzlich die
  Klasse `header-band`. Titel/Unterzeile/Abstände unverändert.

Der einzige verbliebene „Whisky-Tasting"-Treffer in `src/` ist ein
**Kommentar** in `globals.css` (Doku-Referenz) — bewusst gelassen (keine
projektweite Umbenennung, Spec-Grenze).

### Checks (Frontend)
- `npm test` → 108/108. `tsc` + `eslint` sauber. `npm run build` sauber.
- `curl` gegen `next start`: `/login` enthält `brand-surface`, „Whizzky",
  „Treffpunkt feiner Geister" — **nicht** mehr „Whisky-Tasting". Das
  CSS-Bundle enthält `.brand-surface{…radial-gradient…}`, `feTurbulence`,
  `.header-band{isolation:isolate;…}` und `@media print`.
- Überschlägige Kontraste (formale Messung in `/qa`): „Whizzky"
  (`text-primary` ≈ `#E6A433`) auf ~`#161310` ≈ 6,5:1; „Treffpunkt feiner
  Geister" (`text-muted-foreground`) ≈ 5,5:1; `PageHeader`-Titel
  (`text-foreground`) auf dem Band ≈ 15:1 — alle über WCAG AA.
- Die faint Verläufe bewegen den effektiven Hintergrund praktisch nicht von
  `#161310` weg.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
