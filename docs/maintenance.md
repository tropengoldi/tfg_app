# Wartungsskripte (Service-Role, kein UI)

> Ausgelagert aus `features/INDEX.md`. Alle Skripte laufen mit dem Service-Role-Key aus `.env.local`
> gegen die Produktions-Datenbank — destruktive Modi nur mit `CONFIRM=yes`.


- `npm run tasting:list` — alle Events auflisten (Datum · Status · Whiskys/
  Bewertungen · Gastgeber · **ID** · Ort). Gleiches Skript ohne `EVENT_ID`.
- `npm run tasting:delete` — Event komplett löschen (`EVENT_ID=…`,
  `CONFIRM=yes`). Trockenlauf ohne `CONFIRM`. Whiskys/Details/Bewertungen/
  Teilnahme gehen per CASCADE mit.
- `npm run user:delete` — Nutzer verwalten (`EMAIL=…`, `MODE=report|soft|
  reactivate|hard|cascade`, `CONFIRM=yes` für alles Destruktive). `report` zeigt
  den Fußabdruck; `soft` = `is_active=false` (versteckt, Historie bleibt);
  `hard` nur ohne geschützte Verweise (Gastgeber, Ersteller, Whisky-Steward,
  mitgebrachte Whiskys, Bewertungen, gesendete Nachrichten); `cascade` löscht auch
  die Historie und ist für Admin-/`created_by`-Konten gesperrt.
- `npm run photos:cleanup` (PROJ-28) — verwaiste Whisky-Fotos im Bucket finden
  (Trockenlauf) und mit `CONFIRM=yes` löschen. `tasting:delete` und `user:delete`
  räumen die Foto-Ordner bereits selbst mit weg.
- Details in den Datei-Köpfen von `scripts/delete-tasting.mjs` /
  `scripts/delete-user.mjs` / `scripts/cleanup-photos.mjs`.

**Konkrete Beispiele (PowerShell, im Projektordner):**

```powershell
# 1) Events auflisten und die ID heraussuchen
npm run tasting:list

# 2) Trockenlauf für ein Event (zeigt nur, was gelöscht würde)
$env:EVENT_ID='2c7cb11e-4157-4b53-94f3-75835f99f5c9'; npm run tasting:delete

# 3) wirklich löschen (Event + Whiskys + Bewertungen + Teilnahme)
$env:EVENT_ID='2c7cb11e-4157-4b53-94f3-75835f99f5c9'; $env:CONFIRM='yes'; npm run tasting:delete

# 4) danach die gesetzten Variablen wieder entfernen
Remove-Item Env:EVENT_ID, Env:CONFIRM
```

```powershell
# Nutzer: Fußabdruck ansehen, dann deaktivieren (reversibel, Historie bleibt)
$env:EMAIL='alt.mitglied@example.com'; $env:MODE='report'; npm run user:delete
$env:MODE='soft'; $env:CONFIRM='yes'; npm run user:delete
Remove-Item Env:EMAIL, Env:MODE, Env:CONFIRM
```

Als Einzeiler (setzt, führt aus, räumt auf):

```powershell
$env:EVENT_ID='<ID>'; $env:CONFIRM='yes'; npm run tasting:delete; Remove-Item Env:EVENT_ID, Env:CONFIRM
```
