import Link from 'next/link'
import { ClipboardList, GlassWater, SlidersHorizontal, Trophy, Wine } from 'lucide-react'

import { GlassStrip } from '@/components/dashboard/glass-strip'
import { EventStatusBadge } from '@/components/common/event-status-badge'
import { RealtimeRefresher } from '@/components/common/realtime-refresher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { canRateNow, glassStates, progressLabel } from '@/lib/dashboard'
import { formatEventDate } from '@/lib/dates'
import type { ActiveDashboard } from '@/lib/queries/dashboard'

export function DashboardView({ data }: { data: ActiveDashboard }) {
  const { event, participants, whiskyCount, isParticipant, isHost, isHelper } = data
  // Mit Helfer steuert der Helfer den Abend, nicht der Gastgeber (PROJ-11).
  const canControl = isHelper || (isHost && !event.helper_id)
  const states = glassStates(whiskyCount, event.current_position, event.status)
  const label = progressLabel(whiskyCount, event.current_position, event.status)
  const closed = event.status === 'closed'

  return (
    <div className="space-y-4">
      <RealtimeRefresher eventId={event.id} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display text-lg">
              {formatEventDate(event.event_date)}
            </CardTitle>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="text-sm text-muted-foreground">{event.location}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <GlassStrip states={states} label={label} />

          {closed ? (
            <p className="text-sm text-muted-foreground">
              Der Abend ist abgeschlossen.
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {canRateNow(event.status, isParticipant) ? (
              <Jump href={`/tastings/${event.id}/bewerten`} icon={Wine} primary>
                Jetzt bewerten
              </Jump>
            ) : null}
            {canControl ? (
              <Jump href={`/tastings/${event.id}/gastgeber`} icon={SlidersHorizontal}>
                Steuern
              </Jump>
            ) : null}
            {isHelper ? null : (
              <Jump href={`/tastings/${event.id}/whiskies`} icon={GlassWater}>
                Meine Whiskys
              </Jump>
            )}
            {closed ? (
              <Jump href={`/tastings/${event.id}/ergebnisse`} icon={Trophy}>
                Zur Rangliste
              </Jump>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {event.theme || event.food_info || event.host_notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Eckdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {event.theme ? <Row label="Thema" value={event.theme} /> : null}
            {event.food_info ? <Row label="Essen" value={event.food_info} /> : null}
            {event.host_notes ? (
              <Row label="Anmerkungen" value={event.host_notes} />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Wer ist dabei ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                {p.name}
                {p.isHost ? (
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                    Gastgeber
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Link
        href="/tastings"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ClipboardList className="h-4 w-4" />
        Vergangene Tastings
      </Link>
    </div>
  )
}

function Jump({
  href,
  icon: Icon,
  primary,
  children,
}: {
  href: string
  icon: typeof Wine
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? 'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          : 'inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent'
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
