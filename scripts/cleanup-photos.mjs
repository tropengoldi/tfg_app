/**
 * PROJ-28 · Verwaiste Whisky-Fotos im Bucket `whisky-photos` finden und löschen.
 *
 * „Verwaist" = eine Datei, auf die weder `whisky_details` noch
 * `collection_entries` verweist — z. B. nach einem abgebrochenen Upload oder
 * wenn eine Datenbank-Kaskade (Event/Nutzer gelöscht) den Verweis entfernt hat.
 * Dateien, die jünger als 1 Stunde sind, bleiben stehen: zwischen Upload und
 * Eintragen in die Datenbank liegt ein kurzer Moment.
 *
 * Trockenlauf (zeigt nur, was gelöscht würde):
 *   npm run photos:cleanup
 *
 * Wirklich löschen (PowerShell):
 *   $env:CONFIRM='yes' ; npm run photos:cleanup ; Remove-Item Env:CONFIRM
 *
 * bash:
 *   CONFIRM=yes npm run photos:cleanup
 */
import { listPhotoFiles, PHOTO_BUCKET, serviceClient } from './_supa.mjs'

const confirmed = (process.env.CONFIRM ?? '').trim().toLowerCase() === 'yes'
const MIN_AGE_MS = 60 * 60 * 1000

const { url, supabase } = serviceClient()

async function referencedPaths() {
  const refs = new Set()
  for (const table of ['whisky_details', 'collection_entries']) {
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from(table)
        .select('photo_path, photo_thumb_path')
        .not('photo_path', 'is', null)
        .range(from, from + 999)
      if (error) throw new Error(`${table}: ${error.message}`)
      for (const r of data ?? []) {
        refs.add(r.photo_path)
        refs.add(r.photo_thumb_path)
      }
      if ((data ?? []).length < 1000) break
    }
  }
  return refs
}

async function main() {
  console.log(`\n  Projekt : ${url}`)
  console.log(`  Bucket  : ${PHOTO_BUCKET}`)

  const { data: bucket } = await supabase.storage.getBucket(PHOTO_BUCKET)
  if (!bucket) {
    console.log('\n  Bucket existiert nicht (Migration PROJ-28 noch nicht eingespielt?).\n')
    return
  }

  const [files, refs] = await Promise.all([
    Promise.all([listPhotoFiles(supabase, 'tasting'), listPhotoFiles(supabase, 'collection')]).then(
      ([a, b]) => [...a, ...b],
    ),
    referencedPaths(),
  ])

  const now = Date.now()
  const orphans = files.filter(
    (f) => !refs.has(f.name) && now - new Date(f.created_at ?? 0).getTime() > MIN_AGE_MS,
  )

  console.log(`\n  ${files.length} Datei(en) im Bucket, ${refs.size} referenziert, ${orphans.length} verwaist.`)
  for (const f of orphans.slice(0, 50)) console.log(`    ${f.name}`)
  if (orphans.length > 50) console.log(`    … und ${orphans.length - 50} weitere`)

  if (orphans.length === 0) {
    console.log('\n  Nichts zu tun.\n')
    return
  }
  if (!confirmed) {
    console.log('\n  Trockenlauf. Zum wirklichen Löschen zusätzlich CONFIRM=yes setzen.\n')
    return
  }

  for (let i = 0; i < orphans.length; i += 100) {
    const chunk = orphans.slice(i, i + 100).map((f) => f.name)
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(chunk)
    if (error) throw new Error(`remove: ${error.message}`)
  }
  console.log(`\n  ✓ ${orphans.length} verwaiste Datei(en) gelöscht.\n`)
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
