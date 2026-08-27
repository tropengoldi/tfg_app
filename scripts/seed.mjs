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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const password = process.env.SEED_DEV_PASSWORD || 'tasting-dev-2026'
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'hermann.hoppen@gmail.com'
const testEmail = process.env.SEED_TEST_EMAIL || 'test.teilnehmer@example.com'

if (!url || !serviceKey) {
  console.error(
    '\n  Fehlende Umgebungsvariablen. Aufruf:\n' +
      '    node --env-file=.env.local scripts/seed.mjs\n' +
      '  (oder `npm run db:seed`)\n',
  )
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
