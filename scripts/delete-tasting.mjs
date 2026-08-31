/**
 * Tasting-Events auflisten und komplett löschen. Nutzt den Service-Role-Key,
 * umgeht also die `delete_event`-RPC (die nur leere Entwürfe zulässt) und die RLS.
 * Löschen räumt Whiskys, Whisky-Details, Bewertungen und Teilnehmerzuordnung
 * per ON DELETE CASCADE mit weg.
 *
 * Alle Events auflisten (Datum · ID · Ort · Status):
 *   node --env-file=.env.local scripts/delete-tasting.mjs
 *   node --env-file=.env.local scripts/delete-tasting.mjs   # == npm run tasting:list
 *
 * Ein Event ansehen (Trockenlauf, zeigt was gelöscht würde):
 *   $env:EVENT_ID='...' ; node --env-file=.env.local scripts/delete-tasting.mjs
 *
 * Wirklich löschen:
 *   $env:EVENT_ID='...' ; $env:CONFIRM='yes' ; node --env-file=.env.local scripts/delete-tasting.mjs
 *   Remove-Item Env:EVENT_ID, Env:CONFIRM
 *
 * bash:
 *   node --env-file=.env.local scripts/delete-tasting.mjs
 *   EVENT_ID='...' CONFIRM=yes node --env-file=.env.local scripts/delete-tasting.mjs
 */
import { serviceClient, must } from './_supa.mjs'

const eventId = (process.env.EVENT_ID ?? '').trim()
const confirmed = (process.env.CONFIRM ?? '').trim().toLowerCase() === 'yes'

const { url, supabase } = serviceClient()

/** Zählt Zeilen je event_id, indem alle event_ids einer Tabelle geholt werden. */
async function tallyByEvent(table) {
  const { data } = await supabase.from(table).select('event_id')
  const m = new Map()
  for (const r of data ?? []) m.set(r.event_id, (m.get(r.event_id) ?? 0) + 1)
  return m
}

async function listAll() {
  const { data: events } = await supabase
    .from('tasting_events')
    .select('id, event_date, location, status, host_id, closed_at')
    .order('event_date', { ascending: false })

  if (!events || events.length === 0) {
    console.log('\n  Keine Events vorhanden.\n')
    return
  }

  const [whiskies, ratings] = await Promise.all([tallyByEvent('whiskies'), tallyByEvent('ratings')])
  const hostIds = [...new Set(events.map((e) => e.host_id))]
  const names = new Map()
  if (hostIds.length > 0) {
    const { data: p } = await supabase.from('profiles').select('id, display_name').in('id', hostIds)
    for (const row of p ?? []) names.set(row.id, row.display_name)
  }

  console.log(`\n  ${events.length} Event(s) — neueste zuerst:\n`)
  console.log(
    '  Datum       Status      Whiskys/Bew.  Gastgeber              ID                                    Ort',
  )
  console.log('  ' + '-'.repeat(112))
  for (const e of events) {
    const w = whiskies.get(e.id) ?? 0
    const r = ratings.get(e.id) ?? 0
    console.log(
      '  ' +
        `${e.event_date}`.padEnd(12) +
        `${e.status}`.padEnd(12) +
        `${w}/${r}`.padEnd(14) +
        `${names.get(e.host_id) ?? e.host_id}`.slice(0, 20).padEnd(22) +
        `${e.id}  ` +
        `${e.location}`,
    )
  }
  console.log('\n  Zum Löschen:  $env:EVENT_ID=\'<ID>\' ; $env:CONFIRM=\'yes\' ; npm run tasting:delete\n')
}

async function handleOne() {
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
  console.log(
    `  Dranhängend: ${whiskyCount ?? 0} Whiskys · ${ratingCount ?? 0} Bewertungen · ${partCount ?? 0} Teilnehmer`,
  )

  if (!confirmed) {
    console.log('\n  Trockenlauf. Zum wirklichen Löschen zusätzlich CONFIRM=yes setzen.\n')
    return
  }

  must(await supabase.from('tasting_events').delete().eq('id', eventId), 'delete tasting_events')
  console.log('\n  ✓ Gelöscht. Whiskys / Details / Bewertungen / Teilnahme sind per CASCADE mit weg.\n')
}

async function main() {
  console.log(`\n  Projekt : ${url}`)
  if (!eventId) {
    await listAll()
    return
  }
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) {
    console.error('\n  EVENT_ID ist keine UUID.\n')
    process.exit(1)
  }
  await handleOne()
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
