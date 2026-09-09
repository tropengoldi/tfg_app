import { EckdatenForm } from '@/components/host/eckdaten-form'
import { Card, CardContent } from '@/components/ui/card'
import type { EventBasics } from '@/lib/queries/host-control'

/**
 * Sicht des Gastgebers auf ein Event mit Helfer (PROJ-11-Verfeinerung): den
 * Ablauf steuert der Helfer, aber Thema / Info zum Essen / Anmerkungen pflegt
 * weiterhin der Gastgeber. Nur das Eckdaten-Formular, keine geheimen Details,
 * kein Reihenfolge-/Runden-Block.
 */
export function EventBasicsView({ basics }: { basics: EventBasics }) {
  const eckdaten = {
    theme: basics.theme ?? '',
    foodInfo: basics.food_info ?? '',
    hostNotes: basics.host_notes ?? '',
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          {basics.helper_name
            ? `Den Ablauf dieses Abends steuert ${basics.helper_name}. Thema, Info zum Essen und Anmerkungen pflegst weiterhin du.`
            : 'Thema, Info zum Essen und Anmerkungen für diesen Abend.'}
        </CardContent>
      </Card>

      <EckdatenForm
        eventId={basics.id}
        defaultValues={eckdaten}
        readOnly={basics.status === 'closed'}
      />
    </div>
  )
}
