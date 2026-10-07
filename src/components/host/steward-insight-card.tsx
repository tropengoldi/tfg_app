'use client'

import { ChevronDown, Trophy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatPoints } from '@/lib/points'
import type { StewardInsight } from '@/lib/queries/host-control'
import type { StewardRater } from '@/lib/steward-insight'
import { cn } from '@/lib/utils'

/** Ab dieser Länge wird eine Notiz eingekürzt und lässt sich aufklappen. */
const LONG_NOTE = 140

/**
 * Live-Einblick des Whisky-Stewards (PROJ-20): Einzelwertungen mit Notizen je
 * ausgeschenktem Whisky plus die Sieger-Tipps. Nur für den Steward, nur im
 * laufenden Tasting — die Datenbank liefert sonst gar nichts.
 *
 * Die Whisky-Auswahl lebt hier im Browser und übersteht das Live-Neuladen.
 * Beim Weiterschalten setzt der Aufrufer sie über `key` auf den neuen Whisky.
 */
export function StewardInsightCard({
  insight,
  currentPosition,
}: {
  insight: StewardInsight
  currentPosition: number
}) {
  const [selected, setSelected] = useState(currentPosition)
  const [tipsOpen, setTipsOpen] = useState(false)
  const { whiskies, tips } = insight

  const whisky =
    whiskies.find((w) => w.position === selected) ?? whiskies[whiskies.length - 1] ?? null
  const tipCount = tips.filter((t) => t.position !== null).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Wertungen</CardTitle>
        <p className="text-xs text-muted-foreground">
          Nur du siehst das — bis zum Abschluss.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {whiskies.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Whisky wählen">
            {whiskies.map((w) => (
              <Button
                key={w.whiskyId}
                type="button"
                size="sm"
                variant={w.position === whisky?.position ? 'default' : 'outline'}
                aria-pressed={w.position === whisky?.position}
                className="h-11 min-w-11 px-0 text-base"
                onClick={() => setSelected(w.position)}
              >
                {w.position}
              </Button>
            ))}
          </div>
        ) : null}

        {whisky ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="min-w-0 break-words font-medium">
                #{whisky.position} {whisky.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Ø {whisky.average === null ? '–' : formatPoints(whisky.average)} ·{' '}
                {whisky.ratedCount} von {whisky.raters.length} bewertet
              </p>
            </div>

            <ul className="divide-y divide-border" aria-label={`Wertungen zu Whisky ${whisky.position}`}>
              {whisky.raters.map((r) => (
                <RaterRow key={r.raterId} rater={r} />
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Noch kein Whisky ausgeschenkt.</p>
        )}

        <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
          <CollapsibleTrigger className="flex min-h-11 w-full items-center gap-1.5 text-sm font-medium text-primary">
            <ChevronDown className={cn('h-4 w-4 transition-transform', tipsOpen && 'rotate-180')} />
            Sieger-Tipps ({tipCount} von {tips.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="divide-y divide-border">
              {tips.map((t) => (
                <li
                  key={t.raterId}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 py-2 text-sm"
                >
                  <span className="min-w-0 break-words">{t.name}</span>
                  {t.position === null ? (
                    <span className="text-muted-foreground">kein Tipp</span>
                  ) : (
                    <span className="flex min-w-0 items-center gap-1.5 break-words">
                      <Trophy className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                      #{t.position} {t.whiskyName}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function RaterRow({ rater }: { rater: StewardRater }) {
  const [expanded, setExpanded] = useState(false)
  const long = (rater.notes?.length ?? 0) > LONG_NOTE

  return (
    <li className="space-y-1 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="min-w-0 break-words font-medium">{rater.name}</span>
        {rater.total === null ? (
          <span className="text-muted-foreground">noch offen</span>
        ) : (
          <span className="tabular-nums">
            <span className="text-muted-foreground">
              Nase {formatPoints(rater.nose)} · Gaumen {formatPoints(rater.taste)} ={' '}
            </span>
            <span className="font-medium">{formatPoints(rater.total)}</span>
          </span>
        )}
      </div>
      {rater.notes ? (
        <div className="text-sm text-muted-foreground">
          <p className={cn('whitespace-pre-line break-words', long && !expanded && 'line-clamp-3')}>
            „{rater.notes}“
          </p>
          {long ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-11 px-0 text-xs"
              aria-expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? 'weniger' : 'mehr'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
