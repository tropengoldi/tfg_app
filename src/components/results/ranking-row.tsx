'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Library, Play, Trophy } from 'lucide-react'

import { CollectionEntryDialog } from '@/components/collection/collection-entry-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPoints } from '@/lib/points'
import type { RankingRow as Row } from '@/lib/queries/results'
import { detailsLine } from '@/lib/result-stats'
import {
  formatAverage,
  medalClass,
  sortBreakdown,
  whiskySearchUrl,
} from '@/lib/results'
import { cn } from '@/lib/utils'
import type { KennerSummary } from '@/lib/winner-tips'

export function RankingRow({
  row,
  participantCount,
  isWinnerRow,
  isTie,
  eventId,
  eventDate,
  viewerHasRated,
  kenner,
}: {
  row: Row
  /** PROJ-22: nur an der Sieger-Zeile gesetzt. */
  kenner?: KennerSummary
  /** PROJ-25: nur wer selbst bewertet hat, sieht „Dein Platz". */
  viewerHasRated: boolean
  participantCount: number
  isWinnerRow: boolean
  isTie: boolean
  eventId: string
  eventDate: string
}) {
  const [open, setOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)

  const avg = formatAverage(row.totalPoints, row.ratingCount)
  const medal = medalClass(row.rank)
  const breakdown = sortBreakdown(row.breakdown)
  const details = detailsLine(row)

  return (
    <li>
      <Card className={cn(isWinnerRow && 'border-gold/60 bg-gold/5')}>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                'font-display text-3xl tabular-nums leading-none',
                medal ?? 'text-muted-foreground',
              )}
              aria-label={`Rang ${row.rank}`}
            >
              {row.rank}
            </span>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-display text-xl leading-tight">
                <span className="mr-1.5 align-middle font-sans text-sm tabular-nums text-muted-foreground">
                  #{row.position}
                </span>
                {row.name}
              </p>
              {row.distillery || row.region ? (
                <p className="text-xs text-muted-foreground">
                  {[row.distillery, row.region].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              {details ? <p className="text-xs text-muted-foreground">{details}</p> : null}
              <p className="text-sm text-muted-foreground">
                mitgebracht von{' '}
                {row.broughtById ? (
                  <Link href={`/profil/${row.broughtById}`} className="hover:underline">
                    {row.broughtBy}
                  </Link>
                ) : (
                  row.broughtBy
                )}
              </p>
              {isWinnerRow ? (
                <p className="flex items-center gap-1.5 text-sm font-medium text-gold">
                  <Trophy className="h-4 w-4 shrink-0" />
                  Sieger des Abends
                </p>
              ) : null}
              {isWinnerRow && kenner ? <KennerLine summary={kenner} /> : null}
            </div>

            <div className="shrink-0 text-right">
              <p className="font-display text-3xl tabular-nums leading-none">
                {formatPoints(row.totalPoints)}
              </p>
              <p className="text-xs text-muted-foreground">Punkte</p>
              {viewerHasRated ? (
                <p className="mt-1 whitespace-nowrap text-xs font-medium text-foreground">
                  Dein Platz: {row.ownPlace ?? '—'}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              Nase {formatPoints(row.noseTotal)} · Gaumen {formatPoints(row.tasteTotal)}
            </span>
            {avg ? <span>{avg}</span> : null}
            <span>
              {row.ratingCount} von {participantCount} Bewertungen
            </span>
            {isTie ? (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                punktgleich
              </span>
            ) : null}
          </div>

          <VideoRow name={row.name} videoUrl={row.videoUrl} />

          {row.ownNote ? (
            <p className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-sm italic text-muted-foreground">
              Deine Notiz: {row.ownNote}
            </p>
          ) : null}

          {row.hasOwnRating ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setCollectionOpen(true)}
            >
              <Library className="h-4 w-4" />
              Zur Sammlung hinzufügen
            </Button>
          ) : null}

          {breakdown.length > 0 ? (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                />
                Einzelbewertungen ({breakdown.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 divide-y divide-border rounded-md border border-border">
                  {breakdown.map((b, i) => (
                    <li
                      key={`${b.raterName}-${i}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate">{b.raterName}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        Nase {formatPoints(b.nose)} · Gaumen {formatPoints(b.taste)} ·{' '}
                        <span className="font-medium text-foreground">{formatPoints(b.total)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardContent>
      </Card>

      {row.hasOwnRating ? (
        <CollectionEntryDialog
          open={collectionOpen}
          onOpenChange={setCollectionOpen}
          origin={{
            eventId,
            eventDate,
            whiskyName: row.name,
            note: row.ownNote,
          }}
          onSaved={() => {}}
        />
      ) : null}
    </li>
  )
}

function KennerLine({ summary }: { summary: KennerSummary }) {
  if (summary.kind === 'no-kenner') {
    return <p className="text-sm text-muted-foreground">Diesmal kein Kenner</p>
  }
  if (summary.kind !== 'kenner') return null
  return (
    <p className="text-sm">
      <span className="font-medium text-gold">Kenner der Woche:</span>{' '}
      {summary.kenner.map((k, i) => (
        <span key={k.id}>
          {i > 0 ? ', ' : null}
          <Link href={`/profil/${k.id}`} className="hover:underline">
            {k.name}
          </Link>
        </span>
      ))}
    </p>
  )
}

function VideoRow({ name, videoUrl }: { name: string; videoUrl: string | null }) {
  const href = videoUrl ?? whiskySearchUrl(name)
  const label = videoUrl ? 'Video ansehen' : 'Auf Whisky.de suchen'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <Play className="h-3.5 w-3.5 shrink-0" />
      {label}
      <span className="sr-only"> (öffnet YouTube in einem neuen Tab)</span>
    </a>
  )
}
