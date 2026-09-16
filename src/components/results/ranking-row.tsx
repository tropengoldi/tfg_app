'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Play, Trophy } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import type { RankingRow as Row } from '@/lib/queries/results'
import {
  formatAverage,
  medalClass,
  sortBreakdown,
  whiskySearchUrl,
} from '@/lib/results'
import { cn } from '@/lib/utils'

export function RankingRow({
  row,
  participantCount,
  isWinnerRow,
  isTie,
}: {
  row: Row
  participantCount: number
  isWinnerRow: boolean
  isTie: boolean
}) {
  const [open, setOpen] = useState(false)

  const avg = formatAverage(row.totalPoints, row.ratingCount)
  const medal = medalClass(row.rank)
  const breakdown = sortBreakdown(row.breakdown)

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
              <p className="font-display text-xl leading-tight">{row.name}</p>
              {row.distillery || row.region ? (
                <p className="text-xs text-muted-foreground">
                  {[row.distillery, row.region].filter(Boolean).join(' · ')}
                </p>
              ) : null}
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
            </div>

            <div className="shrink-0 text-right">
              <p className="font-display text-3xl tabular-nums leading-none">
                {row.totalPoints}
              </p>
              <p className="text-xs text-muted-foreground">Punkte</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              Nase {row.noseTotal} · Geschmack {row.tasteTotal}
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
                        Nase {b.nose} · Geschmack {b.taste} ·{' '}
                        <span className="font-medium text-foreground">{b.total}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardContent>
      </Card>
    </li>
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
