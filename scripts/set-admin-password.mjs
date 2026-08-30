/**
 * Einmal-Werkzeug: setzt das Passwort des Admin-Kontos direkt über die
 * Supabase-Admin-API — ohne E-Mail, ohne Rate-Limit, ohne das Test-Konto
 * anzufassen (anders als `npm run db:seed`).
 *
 * Aufruf (Windows PowerShell):
 *   $env:NEW_ADMIN_PASSWORD='dein-starkes-passwort'
 *   node --env-file=.env.local scripts/set-admin-password.mjs
 *   Remove-Item Env:NEW_ADMIN_PASSWORD        # danach wieder entfernen
 *
 * Aufruf (bash):
 *   NEW_ADMIN_PASSWORD='dein-starkes-passwort' node --env-file=.env.local scripts/set-admin-password.mjs
 *
 * Erwartet in der Umgebung (via --env-file=.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 *   SEED_ADMIN_EMAIL   (Default: 'hermann.hoppen@gmail.com')
 *   NEW_ADMIN_PASSWORD (das neue Passwort — PFLICHT, nur nicht aus .env.local)
 */

import { createClient } from '@supabase/supabase-js'

const clean = (v) => (v ?? '').trim().replace(/^['"]|['"]$/g, '').trim()

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, '')
const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY).replace(/\s+/g, '')
const adminEmail = clean(process.env.SEED_ADMIN_EMAIL) || 'hermann.hoppen@gmail.com'
const newPassword = process.env.NEW_ADMIN_PASSWORD ?? ''

const problems = []
if (!url) problems.push('NEXT_PUBLIC_SUPABASE_URL fehlt')
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))
  problems.push(`NEXT_PUBLIC_SUPABASE_URL sieht falsch aus: "${url}"`)
if (!serviceKey) problems.push('SUPABASE_SERVICE_ROLE_KEY fehlt')
else if (serviceKey.split('.').length !== 3)
  problems.push('SUPABASE_SERVICE_ROLE_KEY ist kein gültiges JWT (nicht 3 Teile)')

if (!newPassword) {
  problems.push(
    'NEW_ADMIN_PASSWORD ist nicht gesetzt.\n' +
      "      PowerShell:  $env:NEW_ADMIN_PASSWORD='...'; node --env-file=.env.local scripts/set-admin-password.mjs\n" +
      "      bash:        NEW_ADMIN_PASSWORD='...' node --env-file=.env.local scripts/set-admin-password.mjs",
  )
} else if (newPassword.length < 12) {
  problems.push('NEW_ADMIN_PASSWORD ist zu kurz — mindestens 12 Zeichen für das Admin-Konto.')
} else if (newPassword === 'tasting-dev-2026') {
  problems.push('NEW_ADMIN_PASSWORD ist das bekannte Seed-Passwort. Nimm ein echtes.')
}

if (problems.length > 0) {
  console.error('\n  Abbruch:\n\n    - ' + problems.join('\n    - ') + '\n')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

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

async function main() {
  console.log(`\n  Ziel-Projekt : ${url}`)
  console.log(`  Konto        : ${adminEmail}`)

  const user = await findUserByEmail(adminEmail)
  if (!user) {
    console.error(`\n  Kein Auth-User mit E-Mail ${adminEmail} gefunden.\n`)
    process.exit(1)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle()
  console.log(`  Rolle        : ${profile?.role ?? '?'} (aktiv: ${profile?.is_active ?? '?'})`)

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  })
  if (error) throw error

  console.log('\n  ✓ Passwort gesetzt. Der Login mit dem alten Passwort funktioniert nicht mehr.')
  console.log('    Lösch jetzt NEW_ADMIN_PASSWORD wieder aus der Shell-Umgebung.\n')
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
