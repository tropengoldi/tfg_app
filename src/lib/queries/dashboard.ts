import { createClient } from '@/lib/supabase/server'
import { todayISO } from '@/lib/dates'
import type { EventStatus } from '@/lib/supabase/aliases'
import { getOwnTipPosition } from '@/lib/queries/tips'

export interface DashboardParticipant {
  id: string
  name: string
  isHost: boolean
}

export interface ActiveDashboard {
  kind: 'active'
  event: {
    id: string
    event_date: string
    location: string
    status: EventStatus
    current_position: number
    theme: string | null
    food_info: string | null
    host_notes: string | null
    helper_id: string | null
    /** PROJ-19: 1 = ganze, 0,5 = halbe Punkte. */
    rating_step: number
  }
  participants: DashboardParticipant[]
  whiskyCount: number
  isParticipant: boolean
  isHost: boolean
  isHelper: boolean
  /** PROJ-22: Ausschank-Nummer des eigenen Sieger-Tipps; `null` = noch keiner
   * (nur für Mitverkoster im laufenden Tasting ermittelt). */
  myTipPosition: number | null
}

export interface PreviewDashboard {
  kind: 'preview'
  event: { id: string; event_date: string; location: string }
}

export type DashboardState =
  | ActiveDashboard
  | PreviewDashboard
  | { kind: 'none' }

/**
 * Der „Dashboard-Stand" für die Start-Seite:
 *   - `active`  → das eine laufende (oder gerade abgeschlossene) Event, das der
 *     Nutzer lesen darf (Teilnehmer oder Admin)
 *   - `preview` → sonst: das nächste eigene Event „In Vorbereitung"
 *   - `none`    → sonst nichts
 *
 * Ein Nicht-Teilnehmer bekommt das laufende Event per RLS gar nicht — die
 * „verrät nichts"-Regel ergibt sich automatisch.
 */
export async function getDashboard(userId: string): Promise<DashboardState> {
  const supabase = await createClient()

  // Das laufende Event — oder eines, das gerade eben abgeschlossen wurde, damit
  // der Live-Übergang „läuft → abgeschlossen" sichtbar bleibt. Ein Besuch Stunden
  // später fällt zurück auf Vorschau / nichts.
  const recentCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: active } = await supabase
    .from('tasting_events')
    .select(
      'id, event_date, location, status, current_position, theme, food_info, host_notes, host_id, helper_id, rating_step',
    )
    .or(`status.eq.active,and(status.eq.closed,closed_at.gte.${recentCutoff})`)
    .order('status', { ascending: true })
    .order('closed_at', { ascending: false, nullsFirst: true })
    .limit(1)
    .maybeSingle()

  if (active && active.status !== 'draft') {
    const [{ data: partRows }, { count }] = await Promise.all([
      supabase
        .from('event_participants')
        .select('profile_id')
        .eq('event_id', active.id),
      supabase
        .from('whiskies')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', active.id),
    ])

    const ids = (partRows ?? []).map((p) => p.profile_id)
    // PROJ-26 BUG-2: bewusst KEINE „Test"-Kennzeichnung auf dem Dashboard — mit
    // den Abzeichen übernahm der Router das Live-Neuladen nicht (Ursache offen,
    // siehe Backlog). Kennzeichnung gibt es in allen anderen Listen.
    const names = new Map<string, string>()
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids)
      for (const p of profs ?? []) names.set(p.id, p.display_name)
    }

    const isParticipant = ids.includes(userId)
    const myTipPosition =
      isParticipant && active.status === 'active'
        ? await getOwnTipPosition(active.id, userId)
        : null

    return {
      kind: 'active',
      event: {
        id: active.id,
        event_date: active.event_date,
        location: active.location,
        status: active.status,
        current_position: active.current_position,
        theme: active.theme,
        food_info: active.food_info,
        host_notes: active.host_notes,
        helper_id: active.helper_id,
        rating_step: Number(active.rating_step),
      },
      participants: ids
        .map((id) => ({
          id,
          name: names.get(id) ?? 'Unbekannt',
          isHost: id === active.host_id,
        }))
        .sort((a, b) => Number(b.isHost) - Number(a.isHost) || a.name.localeCompare(b.name)),
      whiskyCount: count ?? 0,
      isParticipant,
      isHost: active.host_id === userId,
      isHelper: active.helper_id === userId,
      myTipPosition,
    }
  }

  // Kein lesbares laufendes Event → nächstes eigenes Draft-Event.
  const { data: mine } = await supabase
    .from('event_participants')
    .select('tasting_events(id, event_date, location, status)')
    .eq('profile_id', userId)

  type Row = {
    tasting_events: {
      id: string
      event_date: string
      location: string
      status: EventStatus
    } | null
  }
  // PROJ-21: auch Abende, bei denen der Nutzer Whisky-Steward ist (er steht
  // nicht in event_participants, darf aber eigene Whiskies eintragen).
  const { data: asSteward } = await supabase
    .from('tasting_events')
    .select('id, event_date, location, status')
    .eq('helper_id', userId)
    .eq('status', 'draft')

  const today = todayISO()
  const upcoming = [
    ...(mine as Row[] | null ?? []).map((r) => r.tasting_events),
    ...(asSteward ?? []),
  ]
    .filter((e): e is NonNullable<Row['tasting_events']> =>
      e !== null && e.status === 'draft' && e.event_date >= today,
    )
    .sort((a, b) => a.event_date.localeCompare(b.event_date))

  if (upcoming.length > 0) {
    return {
      kind: 'preview',
      event: {
        id: upcoming[0].id,
        event_date: upcoming[0].event_date,
        location: upcoming[0].location,
      },
    }
  }

  return { kind: 'none' }
}
