import Link from 'next/link'
import { ChevronRight, MapPin, SlidersHorizontal, UserRound, Wine } from 'lucide-react'

import { EventStatusBadge } from '@/components/common/event-status-badge'
import { formatEventDate } from '@/lib/dates'
import type { MyTastingRow } from '@/lib/queries/tastings'

export function TastingRow({ row }: { row: MyTastingRow }) {
  const running = row.status === 'active'
  // Steuern darf: der Helfer, oder der Gastgeber solange kein Helfer benannt ist
  // (mit Helfer verkostet der Gastgeber blind mit — PROJ-11).
  const canControl = row.is_helper || (row.is_host && !row.has_helper)
  // Der Helfer verkostet nicht mit — seine Startseite ist der Steuern-Bereich.
  const primaryHref = row.is_helper
    ? `/tastings/${row.id}/gastgeber`
    : running
      ? `/tastings/${row.id}/bewerten`
      : `/tastings/${row.id}/whiskies`

  const secondary: { href: string; label: string; icon: typeof Wine }[] = []
  if (running && !row.is_helper) {
    secondary.push({ href: `/tastings/${row.id}/whiskies`, label: 'Whiskys', icon: Wine })
  }
  if (canControl) {
    secondary.push({
      href: `/tastings/${row.id}/gastgeber`,
      label: 'Steuern',
      icon: SlidersHorizontal,
    })
  }

  return (
    <li className="flex items-stretch">
      <Link
        href={primaryHref}
        className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-accent"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{formatEventDate(row.event_date)}</span>
            <EventStatusBadge status={row.status} />
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {row.location}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            Gastgeber: {row.host_name}
          </p>
        </div>
        {secondary.length === 0 ? (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : null}
      </Link>

      {secondary.length > 0 ? (
        <div className="flex shrink-0 flex-col divide-y divide-border border-l border-border">
          {secondary.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-1 items-center gap-1.5 px-4 text-sm font-medium text-primary transition-colors hover:bg-accent"
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </li>
  )
}
