/**
 * Gemeinsamer Service-Role-Client für die Wartungsskripte (delete-user,
 * delete-tasting, set-admin-password kann später auch hierher).
 *
 * Erwartet via `node --env-file=.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

const clean = (v) => (v ?? '').trim().replace(/^['"]|['"]$/g, '').trim()

/** Liefert `{ url, supabase }` mit Service-Role-Rechten oder bricht ab. */
export function serviceClient() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, '')
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY).replace(/\s+/g, '')

  const problems = []
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))
    problems.push(`NEXT_PUBLIC_SUPABASE_URL sieht falsch aus: "${url}"`)
  if (key.split('.').length !== 3)
    problems.push('SUPABASE_SERVICE_ROLE_KEY ist kein gültiges JWT (nicht 3 Teile)')
  if (/your_service_role_key_here|your-project-ref/.test(key + url))
    problems.push('In .env.local stehen noch Platzhalterwerte')

  if (problems.length > 0) {
    console.error('\n  .env.local passt nicht:\n\n    - ' + problems.join('\n    - ') + '\n')
    process.exit(1)
  }

  return {
    url,
    supabase: createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  }
}

/** Findet einen Auth-User anhand der E-Mail (paginiert). `null`, wenn keiner. */
export async function findUserByEmail(supabase, email) {
  let page = 1
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit
    if (data.users.length < 200) return null
    page += 1
  }
}

/** Wirft, wenn `res.error` gesetzt ist. */
export function must(res, label) {
  if (res?.error) {
    throw new Error(`${label}: ${res.error.message ?? JSON.stringify(res.error)}`)
  }
  return res
}

// ---------------------------------------------------------------------------
// PROJ-28 · Whisky-Fotos im privaten Bucket
// ---------------------------------------------------------------------------
export const PHOTO_BUCKET = 'whisky-photos'

/**
 * Alle Dateien unter einem Präfix (rekursiv). Storage listet nur eine Ebene;
 * Einträge ohne `id` sind Ordner. Liefert `{ name, created_at }` mit vollem Pfad.
 */
export async function listPhotoFiles(supabase, prefix) {
  const out = []
  const walk = async (dir) => {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .list(dir, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
      if (error) throw new Error(`list ${dir}: ${error.message}`)
      for (const item of data ?? []) {
        const path = dir ? `${dir}/${item.name}` : item.name
        if (item.id === null) await walk(path)
        else out.push({ name: path, created_at: item.created_at })
      }
      if ((data ?? []).length < 1000) break
    }
  }
  await walk(prefix.replace(/\/+$/, ''))
  return out
}

/** Löscht alle Dateien unter einem Präfix; liefert die Anzahl. */
export async function removePhotoFolder(supabase, prefix) {
  const files = await listPhotoFiles(supabase, prefix)
  for (let i = 0; i < files.length; i += 100) {
    const chunk = files.slice(i, i + 100).map((f) => f.name)
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(chunk)
    if (error) throw new Error(`remove ${prefix}: ${error.message}`)
  }
  return files.length
}
