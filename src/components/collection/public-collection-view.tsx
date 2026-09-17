import { CollectionEntryCard } from '@/components/collection/collection-entry-card'
import type { CollectionEntry } from '@/lib/queries/collection'

/**
 * Read-only Liste einer fremden Sammlung (PROJ-15). Der Aufrufer hat die
 * Sichtbarkeit bereits vorher geprüft (`profiles.show_collection`) — diese
 * Komponente unterscheidet nur noch „leer" von „hat Einträge".
 */
export function PublicCollectionView({ entries }: { entries: CollectionEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <CollectionEntryCard key={entry.id} entry={entry} editable={false} />
      ))}
    </div>
  )
}
