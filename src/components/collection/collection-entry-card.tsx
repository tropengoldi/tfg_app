import Link from 'next/link'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatEventDate } from '@/lib/dates'
import type { CollectionEntry } from '@/lib/queries/collection'

export interface CollectionEntryCardProps {
  entry: CollectionEntry
  /** Eigene, bearbeitbare Sammlung vs. read-only Fremdansicht. */
  editable: boolean
  onEdit?: (entry: CollectionEntry) => void
  onDelete?: (entry: CollectionEntry) => void
}

export function CollectionEntryCard({
  entry,
  editable,
  onEdit,
  onDelete,
}: CollectionEntryCardProps) {
  const meta = [entry.distillery, entry.region, entry.ageLabel].filter(Boolean).join(' · ')

  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-display text-lg leading-tight">{entry.name}</p>
            {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.owned ? <Badge variant="secondary">Besitze ich</Badge> : null}
              {entry.tastedOn ? (
                <span className="text-xs text-muted-foreground">
                  Verkostet am {formatEventDate(entry.tastedOn)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {entry.rating ? (
              <span className="font-display text-2xl tabular-nums leading-none">
                {entry.rating}
                <span className="text-sm text-muted-foreground">/10</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}

            {editable ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Aktionen für „${entry.name}"`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(entry)}>
                    <Pencil className="h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {entry.valueNote ? (
          <p className="text-sm text-muted-foreground">Preis-Leistung: {entry.valueNote}</p>
        ) : null}

        {entry.notes ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.notes}</p>
        ) : null}

        {entry.sourceEventDate ? (
          <p className="text-xs text-muted-foreground">
            Von TFG-Tasting am{' '}
            {entry.sourceEventId ? (
              <Link
                href={`/tastings/${entry.sourceEventId}/ergebnisse`}
                className="text-primary hover:underline"
              >
                {formatEventDate(entry.sourceEventDate)}
              </Link>
            ) : (
              formatEventDate(entry.sourceEventDate)
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
