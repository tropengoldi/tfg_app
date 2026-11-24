import Link from 'next/link'
import { Medal } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { formatPoints } from '@/lib/points'
import {
  sortStewardScores,
  stewardSummaryLine,
  summarizeStewardScores,
  type RevealedStewardScore,
} from '@/lib/steward-scores'

/**
 * „Whisky-Steward" auf der Ergebnisseite (PROJ-29): Schnitt, Anzahl und alle
 * Noten mit Namen und Kommentar. Ohne Noten wird nichts gerendert.
 */
export function StewardSection({
  stewardId,
  stewardName,
  scores,
}: {
  stewardId: string | null
  stewardName: string | null
  scores: RevealedStewardScore[]
}) {
  if (scores.length === 0) return null
  const summary = summarizeStewardScores(scores)
  const sorted = sortStewardScores(scores)
  const name = stewardName ?? 'Steward'

  return (
    <section className="space-y-3" aria-labelledby="steward-section-title">
      <h2 id="steward-section-title" className="font-display text-lg text-foreground">
        Whisky-Steward
      </h2>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <Medal className="h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {stewardId ? (
                  <Link href={`/profil/${stewardId}`} className="hover:underline">
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </p>
              <p className="font-display text-2xl tabular-nums leading-tight">
                {stewardSummaryLine(summary)}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-border rounded-md border border-border">
            {sorted.map((s) => (
              <li key={s.profileId} className="space-y-0.5 px-3 py-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/profil/${s.profileId}`} className="min-w-0 truncate hover:underline">
                    {s.name}
                  </Link>
                  <span className="shrink-0 font-medium tabular-nums">{formatPoints(s.score)}</span>
                </div>
                {s.comment ? (
                  <p className="break-words text-muted-foreground">{s.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
