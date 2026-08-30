import { Info } from 'lucide-react'

import { RankingRow } from '@/components/results/ranking-row'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { EventResults } from '@/lib/queries/results'
import { tieRanks } from '@/lib/results'

export function RankingList({
  ranking,
  participantCount,
  hasAnyRatings,
}: {
  ranking: EventResults['ranking']
  participantCount: number
  hasAnyRatings: boolean
}) {
  const ties = tieRanks(
    ranking.map((r) => ({ rank: r.rank, totalPoints: r.totalPoints })),
  )

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-foreground">Rangliste</h2>

      {!hasAnyRatings ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Für diesen Abend wurden keine Bewertungen abgegeben.
          </AlertDescription>
        </Alert>
      ) : null}

      <ol aria-label="Rangliste" className="space-y-3">
        {ranking.map((row) => (
          <RankingRow
            key={row.whiskyId}
            row={row}
            participantCount={participantCount}
            isWinnerRow={row.rank === 1 && hasAnyRatings}
            isTie={ties.has(row.rank)}
          />
        ))}
      </ol>
    </section>
  )
}
