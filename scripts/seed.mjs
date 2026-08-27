/**
 * PROJ-1 · Seed der zwei Entwicklungskonten.
 *
 *   npm run db:seed
 *
 * Erwartet in der Umgebung (via `node --env-file=.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   SEED_DEV_PASSWORD   (Default: 'tasting-dev-2026')
 *   SEED_ADMIN_EMAIL    (Default: 'hermann.hoppen@gmail.com')
 *   SEED_TEST_EMAIL     (Default: 'test.teilnehmer@example.com')
 *
 * Legt echte Auth-User an (Passwort korrekt gehasht, identities inklusive).
 * Der profiles-Eintrag entsteht über den Trigger handle_new_user; danach wird
 * das Admin-Konto per Direkt-Update auf role = 'admin' gehoben.
 *
 * Idempotent: vorhandene Konten werden erkannt und nur aktualisiert.
 */

import { createClient } from '@supabase/supabase-js'

// --env-file lässt Anführungszeichen/Whitespace teils stehen → selbst säubern.
const clean = (v) => (v ?? '').trim().replace(/^['"]|['"]$/g, '').trim()

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, '')
const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY).replace(/\s+/g, '')
const password = process.env.SEED_DEV_PASSWORD || 'tasting-dev-2026'
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'hermann.hoppen@gmail.com'
const testEmail = process.env.SEED_TEST_EMAIL || 'test.teilnehmer@example.com'

const problems = []
if (!url) problems.push('NEXT_PUBLIC_SUPABASE_URL fehlt')
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))
  problems.push(
    `NEXT_PUBLIC_SUPABASE_URL sieht falsch aus: "${url}"\n` +
      '    erwartet: https://<project-ref>.supabase.co  (kein Slash/Pfad am Ende)',
  )
if (!serviceKey) problems.push('SUPABASE_SERVICE_ROLE_KEY fehlt')
else if (serviceKey.split('.').length !== 3)
  problems.push('SUPABASE_SERVICE_ROLE_KEY ist kein gültiges JWT (nicht 3 Teile) — evtl. abgeschnitten oder umgebrochen')
else if (/your_service_role_key_here|your-project-ref/.test(serviceKey + url))
  problems.push('In .env.local stehen noch Platzhalterwerte aus .env.local.example')

if (problems.length > 0) {
  console.error(
    '\n  .env.local passt noch nicht:\n\n    - ' +
      problems.join('\n    - ') +
      '\n\n  Werte: Supabase-Dashboard -> Project Settings -> API\n' +
      '    NEXT_PUBLIC_SUPABASE_URL   = Project URL\n' +
      '    SUPABASE_SERVICE_ROLE_KEY  = Project API keys -> service_role (secret), am Stück in EINE Zeile\n',
  )
  process.exit(1)
}

// Preflight: zeigt exakt, was der Auth-Admin-Endpunkt zurückgibt.
try {
  const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const body = await res.text()
  if (!res.ok) {
    console.error(
      `\n  Auth-Admin-API antwortet mit HTTP ${res.status}.\n` +
        `  Body: ${body || '(leer)'}\n\n` +
        (res.status === 401
          ? '  → Der service_role-Key gehört nicht zu dieser Projekt-URL (oder ist kein service_role-Key).\n'
          : '  → URL prüfen.\n'),
    )
    process.exit(1)
  }
} catch (err) {
  console.error(`\n  Verbindung zu ${url} fehlgeschlagen: ${err.message}\n`)
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Findet einen Auth-User anhand der E-Mail (paginiert). */
async function findUserByEmail(email) {
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

async function upsertUser({ email, displayName }) {
  const existing = await findUserByEmail(email)

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    })
    if (error) throw error
    console.log(`  ~ aktualisiert: ${email}  (${data.user.id})`)
    return data.user
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })
  if (error) throw error
  console.log(`  + angelegt:     ${email}  (${data.user.id})`)
  return data.user
}

async function ensureProfile(userId, { displayName, role }) {
  // Trigger handle_new_user hat die Zeile bei createUser schon erzeugt; bei einem
  // schon vorhandenen Konto stellen wir sie hier sicher.
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, display_name: displayName, role, is_active: true },
      { onConflict: 'id' },
    )
  if (error) throw error
}

async function main() {
  console.log(`\nSeed gegen ${url}\n`)

  const admin = await upsertUser({ email: adminEmail, displayName: 'Admin' })
  await ensureProfile(admin.id, { displayName: 'Admin', role: 'admin' })

  const test = await upsertUser({ email: testEmail, displayName: 'Test-Teilnehmer' })
  await ensureProfile(test.id, { displayName: 'Test-Teilnehmer', role: 'teilnehmer' })

  console.log(
    `\nFertig. Beide Konten haben das Passwort: ${password}` +
      `\n(vor dem ersten echten Tasting das Admin-Passwort ändern — siehe Spec Open Questions)\n`,
  )
}

main().catch((err) => {
  console.error('\nSeed fehlgeschlagen:\n', err)
  process.exit(1)
})
