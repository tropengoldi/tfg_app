import { MapPin, UserRound } from 'lucide-react'

import { EventStatusBadge } from '@/components/common/event-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEventDate } from '@/lib/dates'
import type { EventResults } from '@/lib/queries/results'

export function ResultsHeader({
  head,
  participants,
}: {
  head: EventResults['head']
  participants: EventResults['participants']
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="font-display text-lg">
            {formatEventDate(head.event_date)}
          </CardTitle>
          <EventStatusBadge status="closed" />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {head.location}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {head.theme ? (
          <div>
            <dt className="text-muted-foreground">Thema</dt>
            <dd className="whitespace-pre-wrap">{head.theme}</dd>
          </div>
        ) : null}

        <p className="flex items-center gap-1.5 text-muted-foreground">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          Gastgeber: {head.host_name}
        </p>

        {head.helper_name ? (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            Helfer: {head.helper_name}
          </p>
        ) : null}

        <div>
          <p className="mb-1.5 text-muted-foreground">
            Wer war dabei ({participants.length})
          </p>
          <ul className="space-y-1.5">
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
        </div>
      </CardContent>
    </Card>
  )
}
