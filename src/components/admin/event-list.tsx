import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

import { EventRow } from '@/components/admin/event-row'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { EventListRow } from '@/lib/queries/admin-events'

export function EventList({ events }: { events: EventListRow[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Noch kein Tasting angelegt.</p>
          <Button asChild>
            <Link href="/admin/events/neu">
              <CalendarPlus className="h-4 w-4" />
              Erstes Tasting anlegen
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/events/neu">
            <CalendarPlus className="h-4 w-4" />
            Tasting anlegen
          </Link>
        </Button>
      </div>
      <ul
        aria-label="Tasting-Liste"
        className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
      >
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>
    </div>
  )
}
