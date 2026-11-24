---
paths:
  - "src/components/**"
  - "src/app/**/page.tsx"
  - "src/app/**/layout.tsx"
  - "src/hooks/**"
---

# Frontend Rules

## shadcn/ui zuerst
- Vor jeder neuen UI-Komponente in `src/components/ui/` nachsehen. Button, Input, Select, Checkbox, Switch, Dialog,
  Alert, Toast (sonner), Table, Tabs, Card, Badge, Dropdown, Popover, Tooltip, RadioGroup, Collapsible usw. werden
  nicht nachgebaut, weil die vorhandenen bereits ans Design-System angepasst sind.
- Fehlt eine: `npx shadcn@latest add <name> --yes`. Eigene Komponenten sind Kompositionen daraus.
- Import: `import { Button } from '@/components/ui/button'`.
- Farben, Schriften und Abstände aus `docs/design-system.md` (dunkles Whisky-Thema, `font-display` für Titel).

## Komponenten
- Nur Tailwind (keine Inline-Styles, keine CSS-Module); Props mit TypeScript-Interfaces.
- Mobile-first: bei 360–375 px ohne horizontales Scrollen, Bedienelemente ≥ 44 px (`min-h-11`); Tablet und Desktop
  müssen funktionieren, sind aber zweitrangig.
- Lade-, Fehler- und Leerzustände; semantisches HTML, ARIA-Namen für Icons/Regler, `role="status"`/`alert` für
  Rückmeldungen.
- Server Components laden Daten über `src/lib/queries/`; Client Components rufen Server Actions in `useTransition`
  auf, immer mit `try/catch`, und behalten bei Fehlern die Eingaben.
- Logik, die sich testen lässt (Punkte, Sortierung, Texte), in reine Funktionen unter `src/lib/` auslagern und dort
  unit-testen.

## Auth
- Seiten im angemeldeten Bereich holen den Nutzer mit `requireUser()` (`requireAdmin()` für Admin-Seiten).
- Nach dem Login per `window.location.href` weiterleiten, erst wenn `data.session` existiert; Ladezustand in allen
  Pfaden zurücksetzen.
