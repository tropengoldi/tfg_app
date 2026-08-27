# Design System — Whisky Tasting

> Gelesen von `/frontend` vor jeder UI-Arbeit. Clean und modern, Thema Whisky,
> **mobile-first** und **dark-first**.

## Haltung

Ein Tasting findet abends statt, bei gedämpftem Licht, mit einem Glas in der einen und dem
Handy in der anderen Hand. Daraus folgt alles Weitere: dunkle Flächen statt weißer, große
Bedienelemente statt dichter Listen, warme Bernsteintöne statt kühlem Blau. Die App soll
sich anfühlen wie ein gutes Etikett — reduziert, warm, mit Sorgfalt gesetzt — und nicht wie
ein Formular.

**Nicht** rustikal, kein Holzimitat, keine Fass-Texturen, keine Schnörkel. Modern und ruhig,
die Wärme kommt aus der Farbe und der Typografie, nicht aus Dekoration.

## Farben

Umgesetzt als HSL-Tokens in `src/app/globals.css`. Die shadcn-Token-Struktur bleibt
unverändert, nur die Werte werden ersetzt. Dark ist der Standard, Light wird mitgepflegt.

| Rolle | Dark (Standard) | Light | Verwendung |
|-------|-----------------|-------|------------|
| `--background` | `24 12% 8%` — fast schwarzes warmes Braun | `40 30% 97%` | Seitenhintergrund |
| `--card` | `24 10% 12%` | `0 0% 100%` | Karten, Flächen |
| `--foreground` | `40 20% 94%` | `24 20% 12%` | Fließtext |
| `--muted-foreground` | `36 10% 62%` | `24 8% 44%` | Sekundärtext, Labels |
| `--primary` | `38 78% 55%` — **Bernstein** | `32 82% 44%` | Primäraktion, aktives Glas, Akzente |
| `--primary-foreground` | `24 20% 10%` | `40 30% 98%` | Text auf Primärflächen |
| `--secondary` | `26 14% 18%` | `36 24% 92%` | Sekundärbuttons, Chips |
| `--accent` | `26 16% 20%` | `38 40% 92%` | Hover, ausgewählte Zeilen |
| `--border` / `--input` | `26 12% 22%` | `32 16% 86%` | Rahmen |
| `--ring` | `38 78% 55%` | `32 82% 44%` | Fokusring — immer sichtbar, nie entfernen |
| `--destructive` | `0 62% 45%` | `0 72% 46%` | Löschen, Abbrechen von Runden |

**Semantische Zusatzfarben** (als eigene Tokens ergänzen):

| Token | Wert | Bedeutung |
|-------|------|-----------|
| `--gold` | `44 84% 62%` | Platz 1 in der Rangliste |
| `--silver` | `30 6% 72%` | Platz 2 |
| `--bronze` | `26 44% 48%` | Platz 3 |
| `--success` | `152 42% 44%` | „Bewertung gespeichert" |

`--radius: 0.75rem` — etwas runder als der shadcn-Standard, wirkt auf dem Handy weicher.

## Typografie

Beide über `next/font/google` in `src/app/layout.tsx` geladen, als CSS-Variablen in
`tailwind.config.ts` registriert.

| Rolle | Schrift | Einsatz |
|-------|---------|---------|
| Display | **Fraunces** (Serif, `variable`, `opsz` genutzt) | Seitentitel, Whisky-Namen bei der Auflösung, Rangliste Platz 1–3, Punktzahlen |
| Text | **Inter** | alles andere: Fließtext, Labels, Buttons, Formulare |

Fallback-Stacks immer mitgeben (`ui-serif, Georgia, serif` bzw. `system-ui, sans-serif`).

Größen mobil: Seitentitel `text-2xl`, Kartentitel `text-lg`, Fließtext `text-base`
(nie kleiner als 16 px in Eingabefeldern — sonst zoomt iOS Safari beim Fokus), Labels
`text-sm`, Metadaten `text-xs`.

Punktzahlen werden groß und in der Display-Schrift gesetzt — sie sind der Held der App.

## Layout & Interaktion (mobile-first)

- **Eine Spalte ab 375 px.** Breakpoints nur dort einsetzen, wo eine zweite Spalte echten
  Mehrwert bringt (Rangliste auf dem Desktop, Admin-Tabellen).
- **Bottom-Navigation** statt Header-Menü, `env(safe-area-inset-bottom)` respektieren.
  Vier Ziele: Tasting, Meine Whiskys, Historie, Profil. Admin und Gastgeber sind
  kontextuelle Absprünge, keine Dauer-Navigation.
- **Touch-Ziele ≥ 44 px** (`min-h-11`). Gilt auch für Icon-Buttons und Listeneinträge.
- **Sticky Aktionsleiste** am unteren Rand für die Primäraktion („Bewertung speichern",
  „Runde abschließen") — nie ans Seitenende scrollen müssen.
- `dvh` statt `vh`, sonst springt das Layout, wenn die mobile Adressleiste ein- und ausfährt.
- **Zerstörende oder unumkehrbare Aktionen** („Runde abschließen", „Event abschließen")
  immer hinter einem `AlertDialog` mit klarem Hinweis auf die Konsequenz.

## Signature-Elemente

### Whiskyglas-Fortschritt
Das visuelle Herz des Dashboards. Ein eigenes SVG `src/components/icons/whisky-glass.tsx`
mit den Zuständen `full` (noch ausstehend), `active` (aktuell im Glas, in `--primary`
hervorgehoben, dezent pulsierend) und `empty` (bereits verkostet). Lucide hat kein passendes
Icon — deshalb ausnahmsweise ein eigenes.

Darüber die Textangabe „Whisky 3 von 6" für alle, die den Gläserstreifen nicht deuten wollen,
plus `aria-label` für Screenreader. Bei mehr als 8 Gläsern horizontal scrollbar statt
schrumpfen.

### Bewertungs-Slider
`shadcn/ui slider` mit vergrößertem Thumb (mindestens 28 px) und einem Zahlen-Badge, das den
aktuellen Wert in der Display-Schrift zeigt. Nase 1–5, Geschmack 1–10, Schrittweite 1.
Beide Slider bekommen sichtbare Skalenmarkierungen an den Enden und einen `aria-valuetext`
in Worten („4 von 5 Nasenpunkten").

### Blind-Karte
Solange nicht aufgelöst ist, zeigt die Whisky-Karte nur die Nummer, groß und in der
Display-Schrift, auf dunklem Grund — kein Platzhaltertext wie „Unbekannt", sondern
selbstbewusst die Ziffer. Nach dem Abschluss wird an derselben Stelle der Name eingeblendet.

## Zustände (Pflicht für jede Ansicht)

`.claude/rules/frontend.md` verlangt Loading-, Error- und Empty-States. Konkret hier:

| Zustand | Umsetzung |
|---------|-----------|
| Loading | `shadcn Skeleton` in der Form des echten Inhalts, nie ein Spinner mitten auf der Seite |
| Empty | Kurzer Satz plus die naheliegende Aktion („Noch keine Whiskys eingetragen. Whisky hinzufügen") |
| Error | `sonner`-Toast mit deutscher, konkreter Meldung — nie „Ein Fehler ist aufgetreten" |
| Offline / Realtime weg | Dezenter Hinweisstreifen „Verbindung unterbrochen — Ansicht könnte veraltet sein" |

## Sprache

Durchgehend **Deutsch**, geduzt. Sachlich und knapp, nicht kumpelhaft.
Fachbegriffe der Runde beibehalten: Dram, Nase, Abgang, Destillerie, Fassstärke.

Fehlermeldungen sagen, was zu tun ist:
„Die Runde wurde bereits weitergeschaltet." statt „Konflikt (409)".

## Regeln

- **shadcn/ui first** (`.claude/rules/frontend.md`): 37 Komponenten liegen in
  `src/components/ui/`. Keine davon nachbauen. Fehlen nur `slider` und `calendar` —
  per `npx shadcn@latest add <name> --yes` nachinstallieren.
- Ausschließlich Tailwind-Klassen. Keine Inline-Styles, keine CSS-Module.
- Farben nur über Tokens ansprechen (`bg-primary`), nie als Literal (`bg-amber-500`) —
  sonst bricht der Light-Mode.
- Eigene Komponenten sind nur für fachliche Kompositionen da und benutzen intern
  shadcn-Primitive.
