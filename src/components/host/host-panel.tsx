import Link from 'next/link'

import { DraftControls } from '@/components/host/draft-controls'
import { EckdatenForm } from '@/components/host/eckdaten-form'
import { RunPanel } from '@/components/host/run-panel'
import { Card, CardContent } from '@/components/ui/card'
import type { HostControlData } from '@/lib/queries/host-control'

export function HostPanel({ data }: { data: HostControlData }) {
  const { event, whiskies, progress } = data
  const eckdaten = {
    theme: event.theme ?? '',
    foodInfo: event.food_info ?? '',
    hostNotes: event.host_notes ?? '',
  }
  const whiskyKey = whiskies.map((w) => w.whisky_id).join(',')

  return (
    <div className="space-y-4">
      <EckdatenForm
        eventId={event.id}
        defaultValues={eckdaten}
        readOnly={event.status === 'closed'}
      />

      {event.status === 'draft' ? (
        <DraftControls key={whiskyKey} eventId={event.id} whiskies={whiskies} />
      ) : null}

      {event.status === 'active' ? (
        <RunPanel
          eventId={event.id}
          currentPosition={event.current_position}
          whiskies={whiskies}
          progress={progress}
        />
      ) : null}

      {event.status === 'closed' ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Der Abend ist abgeschlossen. Die Rangliste und die Auflösung findest du
              in den Ergebnissen.
            </p>
            <Link
              href="/tastings"
              className="text-sm font-medium text-primary hover:underline"
            >
              Zurück zu meinen Tastings
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
