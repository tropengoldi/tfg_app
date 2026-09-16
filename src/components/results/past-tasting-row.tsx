import Link from 'next/link'
import { ChevronRight, MapPin, Trophy, UserRound } from 'lucide-react'

import { formatEventDate } from '@/lib/dates'
import type { PastTastingRow as Row } from '@/lib/queries/results'

export function PastTastingRow({ row }: { row: Row }) {
  return (
    <li className="flex flex-col">
      <Link
        href={`/tastings/${row.id}/ergebnisse`}
        className="flex flex-1 items-center gap-3 px-4 pb-1 pt-4 transition-colors hover:bg-accent"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <span className="font-medium">{formatEventDate(row.event_date)}</span>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {row.location}
          </p>
          <p className="flex items-center gap-1.5 text-sm">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-gold" />
            {row.winner_name ? (
              <span className="font-display">{row.winner_name}</span>
            ) : (
              <span className="text-muted-foreground">— kein Sieger</span>
            )}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>

      {row.host_id ? (
        <Link
          href={`/profil/${row.host_id}`}
          className="ml-4 flex min-h-11 w-fit items-center gap-1.5 px-0 pb-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          Gastgeber: {row.host_name}
        </Link>
      ) : (
        <p className="ml-4 flex items-center gap-1.5 pb-3 text-sm text-muted-foreground">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          Gastgeber: {row.host_name}
        </p>
      )}
    </li>
  )
}
