/**
 * Löscht ein Tasting-Event KOMPLETT — inkl. Whiskys, Whisky-Details,
 * Bewertungen und Teilnehmerzuordnung (alles über ON DELETE CASCADE).
 * Nutzt den Service-Role-Key, umgeht also die `delete_event`-RPC (die nur
 * leere Entwürfe zulässt) und die RLS.
 *
 * Trockenlauf (zeigt nur, was gelöscht würde):
 *   $env:EVENT_ID='...' ; node --env-file=.env.local scripts/delete-tasting.mjs
 *
 * Wirklich löschen:
 *   $env:EVENT_ID='...' ; $env:CONFIRM='yes' ; node --env-file=.env.local scripts/delete-tasting.mjs
 *   Remove-Item Env:EVENT_ID, Env:CONFIRM
 *
 * bash:
 *   EVENT_ID='...' CONFIRM=yes node --env-file=.env.local scripts/delete-tasting.mjs
 */
import { serviceClient, must } from './_supa.mjs'

const eventId = (process.env.EVENT_ID ?? '').trim()
const confirmed = (process.env.CONFIRM ?? '').trim().toLowerCase() === 'yes'

if (!/^[0-9a-f-]{36}$/i.test(eventId)) {
  console.error('\n  EVENT_ID fehlt oder ist keine UUID.\n')
  process.exit(1)
}

const { url, supabase } = serviceClient()

async function main() {
  console.log(`\n  Projekt : ${url}`)

  const { data: ev } = await supabase
    .from('tasting_events')
    .select('id, event_date, location, status, host_id, created_at')
    .eq('id', eventId)
    .maybeSingle()

  if (!ev) {
    console.error(`\n  Kein Event mit id ${eventId} gefunden.\n`)
    process.exit(1)
  }

  const [{ count: whiskyCount }, { count: ratingCount }, { count: partCount }, host] =
    await Promise.all([
      supabase.from('whiskies').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
      supabase.from('ratings').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
      supabase
        .from('event_participants')
        .select('profile_id', { count: 'exact', head: true })
        .eq('event_id', eventId),
      supabase.from('profiles').select('display_name').eq('id', ev.host_id).maybeSingle(),
    ])

  console.log(`\n  Event    : ${ev.event_date} · ${ev.location}`)
  console.log(`  Status   : ${ev.status}`)
  console.log(`  Gastgeber: ${host.data?.display_name ?? ev.host_id}`)
  console.log(`  Dranhängend: ${whiskyCount ?? 0} Whiskys · ${ratingCount ?? 0} Bewertungen · ${partCount ?? 0} Teilnehmer`)

  if (!confirmed) {
    console.log('\n  Trockenlauf. Zum wirklichen Löschen zusätzlich CONFIRM=yes setzen.\n')
    return
  }

  must(await supabase.from('tasting_events').delete().eq('id', eventId), 'delete tasting_events')
  console.log('\n  ✓ Gelöscht. Whiskys / Details / Bewertungen / Teilnahme sind per CASCADE mit weg.\n')
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
