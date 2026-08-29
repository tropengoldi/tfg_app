import Link from 'next/link'
import { ChevronRight, MapPin, SlidersHorizontal, UserRound } from 'lucide-react'

import { EventStatusBadge } from '@/components/common/event-status-badge'
import { formatEventDate } from '@/lib/dates'
import type { MyTastingRow } from '@/lib/queries/tastings'

export function TastingRow({ row }: { row: MyTastingRow }) {
  return (
    <li className="flex items-stretch">
      <Link
        href={`/tastings/${row.id}/whiskies`}
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
        {!row.is_host ? (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : null}
      </Link>

      {row.is_host ? (
        <Link
          href={`/tastings/${row.id}/gastgeber`}
          className="flex shrink-0 items-center gap-1.5 border-l border-border px-4 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Steuern
        </Link>
      ) : null}
    </li>
  )
}
