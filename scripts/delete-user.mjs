/**
 * Nutzer verwalten / löschen. Nutzt den Service-Role-Key.
 *
 *   $env:EMAIL='wer@example.com' ; $env:MODE='report' ; node --env-file=.env.local scripts/delete-user.mjs
 *   Remove-Item Env:EMAIL, Env:MODE, Env:CONFIRM
 *
 *   bash:  EMAIL='...' MODE='report' node --env-file=.env.local scripts/delete-user.mjs
 *
 * MODE (Default: report):
 *   report      — zeigt nur den „Fußabdruck" des Kontos und empfiehlt einen Modus.
 *   soft        — profiles.is_active = false. Reversibel, versteckt aus Auswahllisten.
 *                 Bleibt in der Historie sichtbar (Name-Erhalt, gewollt).
 *   reactivate  — macht `soft` rückgängig (is_active = true).
 *   hard        — löscht Auth-User + Profil (+ Teilnahmen per CASCADE). Nur wenn der
 *                 Nutzer NICHTS Geschütztes referenziert (kein host_id / created_by /
 *                 mitgebrachter Whisky / abgegebene Bewertung). Sonst Abbruch mit Liste.
 *   cascade     — die harte Tour: löscht zuerst alle Events, in denen der Nutzer
 *                 Gastgeber ist, dann seine Whiskys und Bewertungen in FREMDEN Events,
 *                 dann den Nutzer. ÄNDERT damit die Historie anderer Mitglieder.
 *                 Verboten für Admins und für `created_by`-Konten.
 *
 * Alles außer report/reactivate verlangt zusätzlich CONFIRM=yes.
 */
import { serviceClient, findUserByEmail, must } from './_supa.mjs'

const email = (process.env.EMAIL ?? '').trim()
const mode = (process.env.MODE ?? 'report').trim().toLowerCase()
const confirmed = (process.env.CONFIRM ?? '').trim().toLowerCase() === 'yes'

const MODES = ['report', 'soft', 'reactivate', 'hard', 'cascade']
if (!email || !MODES.includes(mode)) {
  console.error(`\n  EMAIL fehlt oder MODE ungültig (${MODES.join(' | ')}).\n`)
  process.exit(1)
}

const { url, supabase } = serviceClient()

async function footprint(profileId) {
  const q = (t, col) =>
    supabase.from(t).select('id', { count: 'exact', head: true }).eq(col, profileId)
  const qe = (col) =>
    supabase.from('tasting_events').select('id', { count: 'exact', head: true }).eq(col, profileId)
  const [hosted, created, brought, rated, part] = await Promise.all([
    qe('host_id'),
    qe('created_by'),
    supabase
      .from('whisky_details')
      .select('whisky_id', { count: 'exact', head: true })
      .eq('brought_by', profileId),
    q('ratings', 'profile_id'),
    supabase
      .from('event_participants')
      .select('profile_id', { count: 'exact', head: true })
      .eq('profile_id', profileId),
  ])
  return {
    hosted: hosted.count ?? 0,
    created: created.count ?? 0,
    brought: brought.count ?? 0,
    rated: rated.count ?? 0,
    participations: part.count ?? 0,
  }
}

async function main() {
  console.log(`\n  Projekt : ${url}`)

  const user = await findUserByEmail(supabase, email)
  if (!user) {
    console.error(`\n  Kein Auth-User mit E-Mail ${email}.\n`)
    process.exit(1)
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  const fp = await footprint(user.id)
  console.log(`\n  Konto   : ${email}  (${user.id})`)
  console.log(`  Name    : ${profile?.display_name ?? '?'}`)
  console.log(`  Rolle   : ${profile?.role ?? '?'}  ·  aktiv: ${profile?.is_active ?? '?'}`)
  console.log(
    `  Fußabdruck: ${fp.hosted} Events als Gastgeber · ${fp.created} als Ersteller · ` +
      `${fp.brought} mitgebrachte Whiskys · ${fp.rated} Bewertungen · ${fp.participations} Teilnahmen`,
  )

  const isAdmin = profile?.role === 'admin'
  const hasProtected = fp.hosted + fp.created + fp.brought + fp.rated > 0

  if (mode === 'report') {
    console.log('\n  Empfehlung:')
    if (isAdmin) console.log('    • Admin-Konto — nicht löschen. Höchstens „soft".')
    else if (!hasProtected) console.log('    • Kein geschützter Bezug → „hard" ist sicher.')
    else console.log('    • Hat echte Spuren → „soft" (versteckt, Historie bleibt heil) oder „cascade" (löscht Historie mit).')
    console.log()
    return
  }

  if (mode === 'reactivate') {
    must(await supabase.from('profiles').update({ is_active: true }).eq('id', user.id), 'reactivate')
    console.log('\n  ✓ Wieder aktiv.\n')
    return
  }

  if (!confirmed) {
    console.log(`\n  Trockenlauf (MODE=${mode}). Zum Ausführen zusätzlich CONFIRM=yes setzen.\n`)
    return
  }

  if (mode === 'soft') {
    must(await supabase.from('profiles').update({ is_active: false }).eq('id', user.id), 'soft')
    console.log('\n  ✓ Deaktiviert. Verschwindet aus Auswahllisten; bleibt in vergangenen Tastings.\n')
    return
  }

  if (mode === 'hard') {
    if (isAdmin) {
      console.error('\n  Abbruch: Admin-Konto. Nimm „soft".\n')
      process.exit(1)
    }
    if (hasProtected) {
      const { data: hostedEv } = await supabase
        .from('tasting_events')
        .select('id, event_date, location')
        .or(`host_id.eq.${user.id},created_by.eq.${user.id}`)
      console.error('\n  Abbruch: geschützte Verweise vorhanden.')
      console.error(`    ${fp.brought} mitgebrachte Whiskys, ${fp.rated} Bewertungen — die hängen in Events.`)
      for (const e of hostedEv ?? [])
        console.error(`    Event ${e.id}  ${e.event_date} · ${e.location}`)
      console.error('  → erst diese Events mit scripts/delete-tasting.mjs löschen, oder MODE=cascade nutzen.\n')
      process.exit(1)
    }
    must(await supabase.auth.admin.deleteUser(user.id), 'deleteUser')
    console.log('\n  ✓ Auth-User + Profil gelöscht (Teilnahmen per CASCADE).\n')
    return
  }

  if (mode === 'cascade') {
    if (isAdmin || fp.created > 0) {
      console.error('\n  Abbruch: Admin bzw. `created_by` auf Events — ein Cascade würde fremde/alle Events mitnehmen.')
      console.error('  Für so ein Konto gibt es keinen automatischen Weg.\n')
      process.exit(1)
    }

    console.log('\n  ACHTUNG: löscht die Events dieses Gastgebers und seine Whiskys/Bewertungen in fremden Events.')
    console.log('  Ranglisten/Historie anderer Mitglieder ändern sich dadurch.\n')

    // 1) Events, in denen der Nutzer Gastgeber ist → komplett weg (CASCADE)
    const { data: hostEv } = await supabase
      .from('tasting_events')
      .select('id')
      .eq('host_id', user.id)
    const hostIds = (hostEv ?? []).map((e) => e.id)
    if (hostIds.length > 0) {
      must(await supabase.from('tasting_events').delete().in('id', hostIds), 'delete host events')
      console.log(`  – ${hostIds.length} Gastgeber-Events gelöscht`)
    }

    // 2) In fremden Events verbliebene Whiskys des Nutzers → über whiskies löschen
    //    (CASCADE räumt whisky_details + ratings darauf)
    const { data: wd } = await supabase
      .from('whisky_details')
      .select('whisky_id')
      .eq('brought_by', user.id)
    const wIds = (wd ?? []).map((r) => r.whisky_id)
    if (wIds.length > 0) {
      must(await supabase.from('whiskies').delete().in('id', wIds), 'delete whiskies')
      console.log(`  – ${wIds.length} mitgebrachte Whiskys (in fremden Events) gelöscht`)
    }

    // 3) Verbliebene eigene Bewertungen
    const del = must(await supabase.from('ratings').delete().eq('profile_id', user.id).select('id'), 'delete ratings')
    if ((del.data ?? []).length > 0) console.log(`  – ${del.data.length} Bewertungen gelöscht`)

    // 4) Nutzer selbst
    must(await supabase.auth.admin.deleteUser(user.id), 'deleteUser')
    console.log('\n  ✓ Nutzer vollständig entfernt.\n')
    return
  }
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
