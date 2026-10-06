import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { RankingList } from '@/components/results/ranking-list'
import { ResultsHeader } from '@/components/results/results-header'
import { StatsSection } from '@/components/results/stats-section'
import { TipsSection } from '@/components/results/tips-section'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import { formatEventDate } from '@/lib/dates'
import { getEventResults } from '@/lib/queries/results'
import { getRevealedTips } from '@/lib/queries/tips'
import { kennerSummary, type RevealedTip } from '@/lib/winner-tips'

export const metadata: Metadata = { title: 'Ergebnisse' }

export default async function ErgebnissePage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const { userId } = await requireUser()

  const data = await getEventResults(eventId, userId)
  if (data === null) notFound()

  // PROJ-22: Tipps sind Beiwerk — schlägt das Laden fehl, bleibt die Seite nutzbar.
  let tips: RevealedTip[] = []
  if (data.phase === 'closed') {
    try {
      tips = await getRevealedTips(eventId)
    } catch {
      tips = []
    }
  }
  const kenner = data.phase === 'closed' ? kennerSummary(tips, data.hasAnyRatings) : undefined

  return (
    <>
      <Link
        href="/tastings"
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Zu den Tastings
      </Link>

      {data.phase === 'pending' ? (
        <>
          <PageHeader title="Ergebnisse" />
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Dieses Tasting läuft noch — die Rangliste erscheint nach dem Abschluss.
              </p>
              <Link href="/" className="text-sm font-medium text-primary hover:underline">
                Zum Dashboard
              </Link>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <PageHeader
            title="Ergebnisse"
            description={`${formatEventDate(data.head.event_date)} · ${data.head.location}`}
          />
          <div className="space-y-6">
            <ResultsHeader head={data.head} participants={data.participants} />
            <RankingList
              ranking={data.ranking}
              participantCount={data.participants.length}
              hasAnyRatings={data.hasAnyRatings}
              eventId={eventId}
              eventDate={data.head.event_date}
              viewerHasRated={data.viewerHasRated}
              kenner={kenner}
            />
            {kenner ? <TipsSection tips={tips} summary={kenner} /> : null}
            {data.hasAnyRatings ? (
              <StatsSection whiskies={data.statsWhiskies} stats={data.stats} />
            ) : null}
          </div>
        </>
      )}
    </>
  )
}
