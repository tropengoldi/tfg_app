import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Lock } from 'lucide-react'

import { RatingView } from '@/components/rating/rating-view'
import { PageHeader } from '@/components/layout/page-header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import { formatEventDate } from '@/lib/dates'
import { getRatingViewData } from '@/lib/queries/ratings'

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

  const { event, total, whiskies, myRatings } = data

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

      {event.status === 'active' && event.current_position < 1 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Gleich geht&apos;s los — warte auf den ersten Whisky.
          </CardContent>
        </Card>
      ) : null}

      {event.status === 'active' && event.current_position >= 1 ? (
        <RatingView
          eventId={eventId}
          currentPosition={event.current_position}
          total={total}
          whiskies={whiskies}
          myRatings={myRatings}
          editable
        />
      ) : null}

      {event.status === 'closed' ? (
        <div className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Der Abend ist abgeschlossen — Bewertungen sind eingefroren.{' '}
              <Link href="/tastings" className="font-medium text-primary hover:underline">
                Zu den Ergebnissen
              </Link>
            </AlertDescription>
          </Alert>
          {myRatings.length > 0 ? (
            <RatingView
              eventId={eventId}
              currentPosition={event.current_position}
              total={total}
              whiskies={whiskies}
              myRatings={myRatings}
              editable={false}
            />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Du hast an diesem Abend nichts bewertet.
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </>
  )
}
