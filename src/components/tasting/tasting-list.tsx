import { GlassWater } from 'lucide-react'

import { TastingRow } from '@/components/tasting/tasting-row'
import { Card, CardContent } from '@/components/ui/card'
import type { MyTastingRow } from '@/lib/queries/tastings'

export function TastingList({ rows }: { rows: MyTastingRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <GlassWater className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch bist du bei keinem Tasting eingetragen. Sobald der Admin dich zu
            einem Abend hinzufügt, erscheint er hier.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ul
      aria-label="Meine Tastings"
      className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    >
      {rows.map((row) => (
        <TastingRow key={row.id} row={row} />
      ))}
    </ul>
  )
}
