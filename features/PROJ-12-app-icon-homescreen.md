# PROJ-12: App-Icon & Homescreen

## Status: Planned
**Created:** 2026-08-31
**Last Updated:** 2026-08-31

## Dependencies
- **Requires: PROJ-2 (Auth & Zugangskontrolle)** — dort entstand `src/app/layout.tsx`
  mit `metadata` und `viewport` (inkl. `themeColor: '#161310'`), an dem die
  Icon-/Manifest-Verknüpfungen hängen.
- **Nutzt** das Design-System (`docs/design-system.md`): dunkles warmes Braun
  `#161310` als Grundfläche, Bernstein als Akzent, das Signature-Whiskyglas
  (`src/components/icons/whisky-glass.tsx`).
- **Kein** Bezug zu Supabase, RLS oder Daten.

## Kontext

Die App ist mobile-first und wird während des Tastings am Handy bedient. Wer sie
regelmäßig nutzt, legt sie sich auf den Startbildschirm — heute mit einem
hässlichen Screenshot/Buchstaben, weil kein Icon-Set hinterlegt ist. PROJ-12
liefert genau dieses Set: ein schlichtes Whiskyglas-Mark in der
Design-System-Palette, ein Web-App-Manifest, `apple-touch-icon`, Favicon-Varianten
und den Homescreen-Namen **„Whizzky"**.

Rein `<head>`-Metadaten und statische Asset-Dateien — **keine sichtbare Änderung
in der App selbst** (Überschriften, Login-Optik und Hintergrundbild sind
PROJ-13). Kein Service-Worker, keine Offline-Fähigkeit, keine Push (PRD-Non-Goals).

## User Stories

- Als **Teilnehmer** möchte ich die App auf meinen Homescreen legen können und
  dort ein erkennbares Icon statt eines leeren Kästchens sehen.
- Als **Teilnehmer** möchte ich, dass die vom Homescreen gestartete App im
  Vollbild öffnet, damit Gläserstreifen und Bewertung die volle Höhe bekommen.
- Als **Nutzer** möchte ich im Browser-Tab ein passendes Favicon sehen, damit
  ich die App zwischen vielen Tabs wiederfinde.
- Als **Admin** möchte ich, dass die abgelegte App „Whizzky" heißt, passend zum
  kommenden Marken-Auftritt, damit niemand die Verknüpfung zweimal anlegen muss.

## Out of Scope

- **Service-Worker, Offline-Fähigkeit, Caching von App-Inhalten** — PRD-Non-Goal.
  Ohne Netz zeigt die App die normale Browser-Fehlerseite.
- **Push-Benachrichtigungen** — PRD-Non-Goal.
- **Eigener „App installieren"-Button / Install-Prompt-UI in der App** — „Zum
  Startbildschirm hinzufügen" ist die Funktion von iOS-Safari bzw. Android-Chrome
  selbst; PROJ-12 liefert nur die Metadaten dafür.
- **Der proaktive Chrome-„Install"-Mini-Infobar / ein grüner Lighthouse-PWA-Haken
  / „installierbar" nach PWA-Kriterien** — die verlangen teils einen
  Service-Worker und sind nicht die Messlatte.
- **Gerätespezifische iOS-Splash-Screen-Bilder** (`apple-touch-startup-image` in
  vielen Auflösungen) — der schlichte Farbstart aus dem Manifest reicht.
- **App-Store / TWA / Packaging als native App.**
- **Sichtbare UI-Änderungen** (Überschriften, Login-Maske, Hintergrundbild) →
  **PROJ-13**. Einzige Ausnahme hier: der Homescreen-*Name* im Manifest.
- **Änderung an `theme-color`** über den bereits gesetzten Wert `#161310` hinaus.
- **Ein helles Icon-Alternativ für Light-Mode-Tabs** — ein einziges deckendes
  Icon deckt beide Modi ab.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Homescreen — iOS

- [ ] Angenommen ein Nutzer öffnet die Live-App in iOS-Safari, wenn er über
      „Teilen → Zum Home-Bildschirm" geht, dann zeigt die Vorschau das
      Whiskyglas-Icon (deckend, dunkler Grund) und den Namen „Whizzky".
- [ ] Angenommen der Nutzer hat die App so abgelegt, wenn er sie vom Homescreen
      startet, dann öffnet sie im Vollbild ohne Safari-Adressleiste.

### Homescreen — Android

- [ ] Angenommen ein Nutzer öffnet die Live-App in Android-Chrome, wenn er über
      „⋮ → Zum Startbildschirm hinzufügen" geht, dann zeigt die Vorschau dasselbe
      Whiskyglas-Icon und den Namen „Whizzky".
- [ ] Angenommen der Nutzer startet die abgelegte App, wenn sie lädt, dann
      erscheint kurz ein Startbildschirm in `#161310` (kein weißes Blitzen) und
      die App öffnet im Vollbild, hochkant.
- [ ] Angenommen das Handy stellt Icons adaptiv (rund/rundeckig) dar, wenn das
      App-Icon angezeigt wird, dann bleibt das Glas-Motiv vollständig sichtbar
      (Safe-Zone eingehalten, wird nicht angeschnitten).

### Browser-Tab

- [ ] Angenommen ein Nutzer öffnet die App in einem Desktop- oder mobilen
      Browser, wenn der Tab dargestellt wird, dann zeigt er das Whiskyglas-Favicon
      statt des Default-Globus.
- [ ] Angenommen der Browser unterstützt kein SVG-Favicon (ältere Safari), wenn
      der Tab dargestellt wird, dann greift ein `.ico`/PNG-Fallback.

### Titel & Farbe

- [ ] Angenommen die Seite lädt, wenn der Browser den Titel liest, dann steht im
      Tab/der Fensterleiste ein sinnvoller Name (nicht mehr „Whisky-Tasting" als
      Rohwert, sondern der Marken-Titel).
- [ ] Angenommen ein mobiler Browser rendert die UI-Chrome-Farbe, wenn die Seite
      geladen ist, dann ist die Statusleisten-/Chrome-Farbe `#161310` (bereits
      über `viewport.themeColor` gesetzt, bleibt erhalten).

### Robustheit

- [ ] Angenommen JavaScript ist deaktiviert oder lädt langsam, wenn die Seite
      ausgeliefert wird, dann sind Favicon, `apple-touch-icon` und Manifest
      trotzdem vorhanden (statische Referenzen im `<head>` bzw. unter `public/`).

## Edge Cases

- **Vor PROJ-12 abgelegte Verknüpfung** → behält ihr altes Icon/ihren alten
  Namen; lässt sich nicht nachträglich ändern. Betroffene legen die Verknüpfung
  einmal neu an. Bekannte Einschränkung, kein Fix.
- **Favicon-Caching** → Browser cachen Favicons hartnäckig; nach dem Deploy kann
  der leere Zustand noch kurz hängen. Verschwindet von selbst.
- **Transparenz im `apple-touch-icon`** → iOS legt Transparenz auf Schwarz; daher
  vollflächig deckend, kein transparenter Hintergrund.
- **Icon auf sehr hellem Handy-Wallpaper** → deckend dunkler Grund mit
  Bernstein-Motiv, „verschwindet" auf keinem Hintergrund.
- **Sehr kleine Darstellung (16–32 px Favicon)** → das Motiv muss auch dort noch
  als Glas lesbar sein (reduzierte Form, keine feinen Details).
- **`display: standalone` ohne Netz** → die App zeigt die Browser-Fehlerseite
  (kein Offline-Fallback, gewollt).

## Technical Requirements (optional)

- **Statisch:** Icons + Manifest als Dateien, keine Laufzeit-Erzeugung, keine
  Abhängigkeit von React/JS.
- **Eine Quell-SVG** → daraus die benötigten Rastergrößen. Kein handgepflegtes
  Pixel-Set.
- **Größen:** Favicon (SVG + `.ico`/PNG-Fallback, 32 px wirksam),
  `apple-touch-icon` 180×180 (deckend, ohne eigene runde Ecken), Manifest-Icons
  192×192 und 512×512, dazu eine 512×512-`maskable`-Variante mit ~20 % Safe-Zone.
- **Manifest:** `name` = „Whizzky – Treffpunkt feiner Geister", `short_name` =
  „Whizzky", `display: standalone`, `orientation: portrait`,
  `theme_color: #161310`, `background_color: #161310`, `start_url` = `/`.
- **iOS:** `apple-mobile-web-app-capable`, `apple-mobile-web-app-title` =
  „Whizzky", `apple-mobile-web-app-status-bar-style` passend zu `#161310`.
- **Performance:** vernachlässigbar — wenige KB statische Assets.
- **Browser:** aktuelle iOS-Safari, Android-Chrome, Desktop-Chrome/Firefox/Safari.

## Open Questions

- [ ] Genaue Form des Glas-Motivs (identisch zum bestehenden
      `whisky-glass.tsx`-Pfad, oder eine noch weiter reduzierte Silhouette fürs
      Icon?) — Detail für `/architecture` bzw. `/frontend`.
- [ ] Dateiablage: Next-App-Router-Konventionen (`src/app/icon.svg`,
      `src/app/apple-icon.png`, `src/app/manifest.ts`) vs. klassisch unter
      `public/` — Entscheidung für `/architecture`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Motiv = stilisiertes **Whiskyglas** (kein „W"-Monogramm, kein externes Logo) | Signature-Element des Design-Systems, markenunabhängig erkennbar, bei 32 px besser lesbar als ein Buchstabe; es gibt bereits eine Glas-SVG im Projekt | 2026-08-31 |
| Homescreen-Name **schon jetzt „Whizzky"**, obwohl PROJ-13 erst danach kommt | Reine Metadaten-Konfiguration ohne PROJ-13-Abhängigkeit; der Name ist nach dem Ablegen schwer zu ändern — so muss niemand die Verknüpfung zweimal anlegen | 2026-08-31 |
| `display: standalone`, `orientation: portrait` | „Zum Startbildschirm" soll sich wie eine App anfühlen und dem Gläserstreifen die volle Höhe geben; braucht keinen Service-Worker, verstößt nicht gegen den „keine native App"-Non-Goal | 2026-08-31 |
| Deckendes Icon (dunkler `#161310`-Grund), kein transparenter Hintergrund | iOS legt Transparenz auf Schwarz; ein deckendes Icon bleibt auf hellem wie dunklem Wallpaper erkennbar | 2026-08-31 |
| Icon-Set auf die drei gängigen Ziele begrenzt (Tab-Favicon, iOS `apple-touch-icon`, Android-Manifest 192/512 + maskable) | Deckt iOS, Android und Desktop ab; mehr Größen / gerätespezifische Splash-Bilder bringen keinen spürbaren Mehrwert | 2026-08-31 |
| Kein Service-Worker, kein Install-Prompt-UI, kein Lighthouse-PWA-Ziel | PRD-Non-Goal „keine Offline-Fähigkeit"; die Messlatte ist „OS-eigenes ‚Zum Startbildschirm' zeigt Icon + Name und startet im Vollbild" | 2026-08-31 |
| Ein einziges deckendes Icon für Light- und Dark-Mode-Tabs | Eine helle Zweitvariante wäre Mehraufwand ohne erkennbaren Nutzen im geschlossenen Nutzerkreis | 2026-08-31 |

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
