import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Lock } from 'lucide-react'

import { RatingView } from '@/components/rating/rating-view'
import { WinnerTipProvider } from '@/components/rating/winner-tip-context'
import { WinnerTipField } from '@/components/rating/winner-tip-field'
import { PageHeader } from '@/components/layout/page-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import { formatEventDate } from '@/lib/dates'
import { getRatingViewData } from '@/lib/queries/ratings'
import { getOwnTipPosition } from '@/lib/queries/tips'

export const metadata: Metadata = { title: 'Bewerten' }

export default async function BewertenPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const { userId } = await requireUser()

  const data = await getRatingViewData(eventId, userId)
  if (!data) notFound()

  const { event, total, whiskies, myRatings, whiskyNames, steward, compareMarks } = data
  // PROJ-22: nur Teilnehmer erreichen diese Seite (der Steward ist keiner).
  const tipPosition =
    event.status === 'draft' ? null : await getOwnTipPosition(eventId, userId)

  return (
    <>
      <Link
        href="/tastings"
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Zu meinen Tastings
      </Link>
      <PageHeader
        title="Bewerten"
        description={`${formatEventDate(event.event_date)} · ${event.location}`}
      />

      {event.status === 'draft' ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Der Abend hat noch nicht begonnen.
            </p>
            <Link
              href={`/tastings/${eventId}/whiskies`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Zur Whisky-Erfassung
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {event.status === 'active' ? (
        // PROJ-24: Tipp-Feld und Pokal-Knöpfe der eigenen Rangliste teilen den Tipp.
        <WinnerTipProvider eventId={eventId} savedPosition={tipPosition} editable>
          <div className="mb-5">
            <WinnerTipField total={total} steward={steward} />
          </div>

          {event.current_position < 1 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Gleich geht&apos;s los — warte auf den ersten Whisky.
              </CardContent>
            </Card>
          ) : (
            <RatingView
              eventId={eventId}
              currentPosition={event.current_position}
              total={total}
              whiskies={whiskies}
              myRatings={myRatings}
              ratingStep={event.rating_step}
              editable
              steward={steward}
              compareMarks={compareMarks}
            />
          )}
        </WinnerTipProvider>
      ) : null}

      {event.status === 'closed' ? (
        <WinnerTipProvider eventId={eventId} savedPosition={tipPosition} editable={false}>
          <div className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Der Abend ist abgeschlossen — Bewertungen sind eingefroren.{' '}
                <Link
                  href={`/tastings/${eventId}/ergebnisse`}
                  className="font-medium text-primary hover:underline"
                >
                  Zu den Ergebnissen
                </Link>
              </AlertDescription>
            </Alert>
            {tipPosition !== null ? <WinnerTipField total={total} /> : null}
            {myRatings.length > 0 ? (
              <RatingView
                eventId={eventId}
                currentPosition={event.current_position}
                total={total}
                whiskies={whiskies}
                myRatings={myRatings}
                ratingStep={event.rating_step}
                editable={false}
                whiskyNames={whiskyNames}
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Du hast an diesem Abend nichts bewertet.
                </CardContent>
              </Card>
            )}
          </div>
        </WinnerTipProvider>
      ) : null}
    </>
  )
}
