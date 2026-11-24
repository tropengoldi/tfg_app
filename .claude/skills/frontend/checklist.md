# Frontend Checklist

## Bausteine
- [ ] Für jedes UI-Element zuerst `src/components/ui/` geprüft, fehlende per `npx shadcn@latest add`
- [ ] Bestehende Komponenten im Bereich wiederverwendet; Design aus `docs/design-system.md`
- [ ] Komponentenbaum aus dem Tech Design umgesetzt (Abweichungen in der Spec notiert)

## Umsetzung
- [ ] Nur Tailwind; Props typisiert
- [ ] Lade-, Fehler- und Leerzustände; Eingaben bleiben bei Fehlern erhalten
- [ ] Server Actions in `useTransition` mit `try/catch`
- [ ] Mobile-first: 360–375 px ohne horizontales Scrollen, Bedienelemente ≥ 44 px
- [ ] Barrierefreiheit: semantisches HTML, Labels/ARIA-Namen, `role="status"`/`alert`

## Prüfung
- [ ] `npx tsc --noEmit` und `npx eslint <Dateien>` sauber
- [ ] Sichtprüfung per Playwright-Screenshot bei 375 px (Port 3000 frei, Hilfstest danach gelöscht)
- [ ] Alle Akzeptanzkriterien der Spec in der UI abgedeckt

## Abschluss
- [ ] Spec-Abschnitt „Frontend-Implementierung“, Status „In Progress“ in Spec und Index
- [ ] Commit lokal, Nutzer hat die Oberfläche gesehen bzw. beschrieben bekommen
