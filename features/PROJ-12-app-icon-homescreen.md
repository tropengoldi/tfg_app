# PROJ-12: App-Icon & Homescreen

## Status: In Progress
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

- [x] ~~Genaue Form des Glas-Motivs~~ **Gelöst (`/architecture`):** es gibt keine
      bestehende `whisky-glass.tsx` (die Design-System-Erwähnung wurde nie
      umgesetzt; das Dashboard nutzt das Lucide-`Wine`-Icon). Für PROJ-12 entsteht
      eine **neue, reduzierte Tumbler-Silhouette** als Quell-SVG. Der genaue Pfad
      ist ein `/frontend`-Detail; die Vorgabe steht im Tech Design.
- [x] ~~Dateiablage~~ **Gelöst:** Hybrid — Next-`app/`-Konventionen für
      `favicon`/`icon`/`apple-icon`/`manifest`, die Manifest-PNGs (192/512/
      maskable) unter `public/`, eine Quell-SVG unter `public/`.
- [ ] `apple-mobile-web-app-status-bar-style`: `default` (opake Leiste) oder
      `black-translucent` (Seite läuft unter die Statusleiste, braucht
      Safe-Area-Padding)? Vorschlag `default` — Detail für `/frontend`.

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
| Decision | Rationale | Date |
|----------|-----------|------|
| **Frontend-only**, keine DB, kein Backend, keine Server-Action | Icons + Manifest sind statische Dateien und `<head>`-Metadaten | 2026-08-31 |
| Eine **Quell-SVG** (`public/icon.svg`), daraus die Rastergrößen per Skript `scripts/gen-icons.mjs` (`npm run icons:gen`) | Reproduzierbar (eine Änderung → ein Befehl), passt zum Skript-Muster des Projekts (`seed`, `admin:password`, `user:delete`); die SVG ist zugleich das moderne SVG-Favicon | 2026-08-31 |
| **`sharp`** als neue **devDependency** (nur Autoren-/Buildzeit) | Rendert SVG mit vollem librsvg sauber nach PNG; kein Laufzeit-Code, kein `next/og`/Satori mit seinen SVG-Grenzen | 2026-08-31 |
| **Kein `favicon.ico`** — stattdessen `src/app/icon.svg` **und** `src/app/icon.png` (32) | Next verlinkt beide; moderne Browser nehmen SVG, ältere (Safari) das PNG. Ein echtes `.ico` bräuchte ein zweites Paket (`png-to-ico`) für minimalen Zusatznutzen | 2026-08-31 |
| Dateien über **Next-`app/`-Metadatei-Konventionen**: `src/app/icon.svg`, `src/app/icon.png`, `src/app/apple-icon.png`, `src/app/manifest.ts` | Next injiziert `<link rel="icon/apple-touch-icon/manifest">` automatisch; kein manuelles `<head>`-Gefrickel | 2026-08-31 |
| Manifest als **`src/app/manifest.ts`** (TS-Objekt), Icons zeigen auf `public/icon-192.png` / `icon-512.png` / `icon-512-maskable.png` | Next serviert es unter `/manifest.webmanifest`; die großen PNGs liegen als echte Dateien vor (Android/maskable brauchen sie verlässlich) | 2026-08-31 |
| `layout.tsx` `metadata.title` → **Title-Template** `{ default: 'Whizzky', template: '%s · Whizzky' }` | Der Tab-Titel soll nicht mehr der Rohwert „Whisky-Tasting" sein; die vorhandenen Seiten-Titel („Profil", „Bewerten" …) werden zu „Profil · Whizzky". Reine Metadaten, keine sichtbare UI-Überschrift (das ist PROJ-13) | 2026-08-31 |
| `metadata.appleWebApp` = `{ capable: true, title: 'Whizzky', statusBarStyle: 'default' }`, `applicationName: 'Whizzky'` | Erzeugt die `apple-mobile-web-app-*`-Meta-Tags für den iOS-Homescreen-Namen + Vollbildstart | 2026-08-31 |
| `viewport.themeColor` bleibt `#161310` (unverändert) | Bereits gesetzt; Spec schließt eine Änderung aus | 2026-08-31 |
| Neuer npm-Script `icons:gen` | Discoverability, wie `db:seed` / `tasting:list` | 2026-08-31 |
| **`/frontend`-Korrektur:** Icons **nicht** als `app/`-Metadateien, sondern unter `public/` + explizit über `metadata.icons` verlinkt | Turbopack (Next 16.1.1) paniert beim `next build`, sobald `src/app/icon.svg` existiert (FATAL, „Dependency tracking is disabled"). Per Bisektion die SVG-Metadatei. `public/` umgeht die `app/`-Metadaten-Pipeline; das gerenderte `<head>` ist identisch | 2026-08-31 |
| **`/frontend`-Ergänzung:** `manifest.webmanifest` in den `proxy.ts`-Matcher-Ausschluss aufgenommen | Sonst leitet die Auth-Middleware den Manifest-Request auf `/login` um (Android holt das Manifest teils ohne Session) → „Zum Startbildschirm" bekäme Name/Icons nicht | 2026-08-31 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

**Reine Frontend-/Asset-Arbeit.** Keine Datenbank, kein Backend, keine
Server-Action, keine Realtime. PROJ-12 legt eine Handvoll Bilddateien an und
ergänzt die `<head>`-Metadaten in `src/app/layout.tsx`. Die einzige neue
Abhängigkeit ist `sharp` — und die nur, um die Bilder aus einer Quell-SVG zu
rendern; sie läuft nie im Browser oder auf dem Server.

Wichtig: Die im Design-System erwähnte `whisky-glass.tsx` **existiert nicht** (das
Dashboard nutzt das Lucide-`Wine`-Icon). Das Icon-Motiv wird hier neu gezeichnet.

### A) Dateikarte (statt Komponentenbaum)

```
public/
├─ icon.svg                     ← Quell-SVG: Tumbler-Silhouette, Bernstein-Dram
│                                  auf deckendem #161310. Dient zugleich als
│                                  SVG-Favicon-Quelle.
├─ icon-192.png                 ← generiert, deckend, purpose "any"
├─ icon-512.png                 ← generiert, deckend, purpose "any"
└─ icon-512-maskable.png        ← generiert, Motiv in der inneren 80%-Safe-Zone,
                                   purpose "maskable"

src/app/
├─ icon.svg                     ← Kopie der Quell-SVG (Next → <link rel="icon"
│                                  type="image/svg+xml">)
├─ icon.png                     ← generiert, 32×32 (Next → <link rel="icon"
│                                  type="image/png">, Fallback ohne SVG-Support)
├─ apple-icon.png               ← generiert, 180×180, deckend, ohne runde Ecken
│                                  (Next → <link rel="apple-touch-icon">)
├─ manifest.ts                  ← Web-App-Manifest als TS-Objekt; Next serviert
│                                  es unter /manifest.webmanifest und injiziert
│                                  <link rel="manifest"> automatisch
└─ layout.tsx                   ← MODIFIZIERT: metadata.title-Template,
                                   appleWebApp, applicationName

scripts/
└─ gen-icons.mjs                ← npm run icons:gen — liest public/icon.svg,
                                   schreibt alle generierten PNGs. Einmalig /
                                   bei Icon-Änderung von Hand ausgeführt, die
                                   Ergebnisse werden committet.
```

### B) Das Icon-Motiv (Vorgabe fürs `/frontend`)

Eine **reduzierte Tumbler-Silhouette** (Whiskyglas, kein Stielglas):

- quadratische Fläche, vollflächig **deckend `#161310`**, kein transparenter
  Rand;
- mittig ein leicht konisches Glas (unten schmaler), Umriss als dünne, helle
  Linie (`--foreground`-nah);
- die unteren ~40 % der Glasfläche in **Bernstein** (`--primary`) als „Dram",
  mit einer dezenten helleren Oberkante;
- großzügiger Rand zum Bildrand, damit das Glas bei 32 px noch als Glas lesbar
  ist und beim adaptiven Zuschnitt (rund) nicht angeschnitten wird;
- für `icon-512-maskable.png` sitzt das komplette Motiv innerhalb des inneren
  80 %-Kreises (Android-Safe-Zone), außen nur die `#161310`-Fläche.

Keine Reflexe, keine Farbverläufe über das Nötigste hinaus, keine Beschriftung.

### C) „Datenmodell"

Kein Datenmodell. Die einzige „Konfiguration" ist das Manifest:

```
name             = "Whizzky – Treffpunkt feiner Geister"
short_name       = "Whizzky"
description      = kurzer Satz (aus der bestehenden metadata.description)
start_url        = "/"
display          = "standalone"
orientation      = "portrait"
theme_color      = "#161310"
background_color  = "#161310"
icons            = [ 192 any, 512 any, 512 maskable ]
```

### D) Änderungen an `src/app/layout.tsx`

- `metadata.title`: von `'Whisky-Tasting'` auf
  `{ default: 'Whizzky', template: '%s · Whizzky' }` — die vorhandenen
  Seiten-Titel („Profil", „Bewerten", „Ergebnisse" …) erscheinen dann als
  „Profil · Whizzky" im Tab. **Das ist der `<title>`-Tag, keine sichtbare
  Seiten-Überschrift** — die bleibt PROJ-13.
- `metadata.applicationName = 'Whizzky'`.
- `metadata.appleWebApp = { capable: true, title: 'Whizzky', statusBarStyle:
  'default' }`.
- `viewport.themeColor` **unverändert** `#161310`.
- Kein manuelles `<link>`-Markup — Next erzeugt alle Icon-/Manifest-Links aus
  den `app/`-Metadateien.

### E) Backend-Bedarf

Keiner.

### F) Neue Pakete

- **`sharp`** (devDependency) — rendert `public/icon.svg` nach PNG in
  `scripts/gen-icons.mjs`. Nur Autorenzeit. Kein `.ico`-Paket (SVG + PNG-32
  decken die Fallback-Fälle ab).

### G) Auswirkungen auf Bestehendes

- **`src/app/layout.tsx`** — die drei Metadaten-Felder oben. Der Tab-Titel
  ändert sich sichtbar (gewollt).
- **`package.json`** — `sharp` in `devDependencies`, Script `icons:gen`.
- Sonst nichts. Keine Route, keine Komponente, kein Test-Setup betroffen. Die
  bestehenden `next.svg` / `vercel.svg` / … in `public/` bleiben unangetastet
  (können später separat aufgeräumt werden, nicht Teil von PROJ-12).

### H) Verifikation (Hinweis für `/qa`)

- `npm run build` erzeugt `/manifest.webmanifest`, `/icon.svg`, `/icon.png`,
  `/apple-icon.png`; im gerenderten `<head>` stehen die vier `<link>`-Tags und
  die `apple-mobile-web-app-*`-Meta-Tags.
- Manuell am Gerät: iOS „Zum Home-Bildschirm" + Android „Zum Startbildschirm"
  zeigen Glas + „Whizzky", Start im Vollbild.
- Lighthouse „Installable"/PWA ist **kein** Prüfkriterium (kein Service-Worker).

## Implementation Notes (Frontend)

**Stand:** UI/Assets komplett. **Kein Backend.** Eine neue devDependency
(`sharp`), sonst nur statische Dateien + `<head>`-Metadaten.

### Was gebaut wurde

**Quell-SVG** — `public/icon.svg`: reduzierte Tumbler-Silhouette (heller
Umriss `#F3F1ED`, Bernstein-Dram `#E6A433` mit hellerer Oberkante `#EFC44D`) auf
deckendem `#161310`, großzügiger Rand.

**Generator** — `scripts/gen-icons.mjs` (`npm run icons:gen`, nutzt `sharp`):
rendert daraus `public/favicon-32.png`, `public/apple-icon.png` (180),
`public/icon-192.png`, `public/icon-512.png` und `public/icon-512-maskable.png`
(Motiv auf 80 % skaliert, mit `#161310` auf 512 aufgefüllt → Android-Safe-Zone).
Die PNGs werden eingecheckt.

**Manifest** — `src/app/manifest.ts`: `name`/`short_name` „Whizzky",
`display: standalone`, `orientation: portrait`, Farben `#161310`, drei
Manifest-Icons (192/512/maskable). Next serviert es unter `/manifest.webmanifest`.

**`src/app/layout.tsx`** — `metadata`:
- `title` → `{ default: 'Whizzky', template: '%s · Whizzky' }` (Tab-Titel, keine
  sichtbare Überschrift — die bleibt PROJ-13).
- `applicationName: 'Whizzky'`, `appleWebApp: { capable: true, title: 'Whizzky',
  statusBarStyle: 'default' }`.
- `icons`: `/icon.svg` + `/favicon-32.png` als `rel="icon"`, `/apple-icon.png`
  als `rel="apple-touch-icon"` — **explizit auf `public/`-Pfade** (nicht als
  `app/`-Metadatei, siehe Abweichung).
- `viewport.themeColor` unverändert `#161310`.

**`src/proxy.ts`** — `config.matcher` um `manifest.webmanifest` erweitert, damit
die Middleware den Manifest-Request **nicht** auf `/login` umleitet (Android
holt das Manifest teils ohne Session). Die Icon-Dateien waren über die
`.png`/`.svg`-Endungs-Ausnahme schon frei.

### Abweichungen von Tech Design

- **Kein `src/app/icon.svg` / `icon.png` / `apple-icon.png`.** Sobald eine
  `icon.svg` als `app/`-Metadatei liegt, paniert **Turbopack** beim `next build`
  („Dependency tracking is disabled so invalidation is not allowed", FATAL). Per
  Bisektion eindeutig die SVG-Metadatei. Lösung: alle Icons unter `public/`,
  Verlinkung über `metadata.icons` in `layout.tsx`. Ergebnis im `<head>`
  identisch. Der Generator schreibt entsprechend nach `public/` statt `src/app/`.
- **`favicon-32.png`** statt `icon.png` als Dateiname (liegt jetzt in `public/`).

### Checks
- `npm run build` → sauber (nach dem Umzug nach `public/`; mit `src/app/icon.svg`
  reproduzierbar FATAL).
- `curl` gegen `next start`: `<head>` enthält `manifest`, beide `icon`-Links,
  `apple-touch-icon`, `apple-mobile-web-app-*`, `mobile-web-app-capable`,
  `theme-color #161310`; `<title>` = „Anmelden · Whizzky".
- `/manifest.webmanifest` → HTTP 200 `application/manifest+json` mit gültigem
  JSON (nach dem `proxy.ts`-Fix; vorher 307 → `/login`).
- `/icon.svg` → 200 `image/svg+xml`, `/apple-icon.png` → 200 `image/png`.
- `npm test` → 108/108, `tsc` + `eslint` sauber.
- `npx playwright test tests/PROJ-2-auth.spec.ts --project=chromium` (wegen
  `proxy.ts`) → **21 passed / 1 flaky / 2 failed**. Die Non-Passes hängen **nicht**
  an PROJ-12, sondern an Post-Deploy-Änderungen an den Seed-Konten:
  - `test.teilnehmer@example.com` war deaktiviert (Post-Deploy-Hygiene) → `login()`
    im Helper bricht mit „Zugang deaktiviert" ab. Nach `npm run user:delete
    MODE=reactivate` wieder aktiv → 9 dieser Tests grün.
  - Die **2 verbleibenden Fehler** (`:258`, `:277`) sind Admin-Login-Tests: das
    Admin-Passwort wurde per `npm run admin:password` vom Seed-Wert gelöst, also
    schlägt der `SEED_PASSWORD`-Login als Admin fehl. Kein Code-Bezug zu PROJ-12.
  - `:228` einmal flaky (bekannter Nav-/Hydration-Race), auf Retry grün.
  PROJ-12 ändert nur `<head>`-Metadaten + `proxy.ts` (Matcher-Ausnahme, per curl
  als wirkungslos für Nicht-Manifest-Pfade bestätigt). Der eigentliche
  E2E-Infra-Schaden (Suite hängt an aktivem Seed-Konto + Seed-Passwörtern) ist im
  Post-Deploy-Backlog vermerkt.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
