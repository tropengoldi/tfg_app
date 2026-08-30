import { PastTastingRow } from '@/components/results/past-tasting-row'
import type { PastTastingRow as Row } from '@/lib/queries/results'

export function PastTastingsSection({ rows }: { rows: Row[] }) {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="font-display text-lg text-foreground">Vergangene Tastings</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch kein Tasting abgeschlossen.</p>
      ) : (
        <ul
          aria-label="Vergangene Tastings"
          className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
        >
          {rows.map((row) => (
            <PastTastingRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  )
}
