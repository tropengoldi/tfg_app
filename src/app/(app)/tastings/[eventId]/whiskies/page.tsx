import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Lock } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { WhiskySection } from '@/components/tasting/whisky-section'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatEventDate } from '@/lib/dates'
import { requireUser } from '@/lib/auth'
import { getWhiskyEntryData } from '@/lib/queries/tastings'
import { computeQuota } from '@/lib/whisky-quota'

export const metadata: Metadata = { title: 'Meine Whiskys' }

export default async function WhiskyEntryPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const { userId } = await requireUser()

  const data = await getWhiskyEntryData(eventId, userId)
  if (!data) notFound()

  const editable = data.event.status === 'draft'
  const quota = computeQuota({
    limit: data.limit,
    isHost: data.isHost,
    ownCount: data.whiskies.length,
    eventWhiskyCount: data.eventWhiskyCount,
  })

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
        title="Meine Whiskys"
        description={`${formatEventDate(data.event.event_date)} · ${data.event.location}`}
      />

      {!editable ? (
        <Alert className="mb-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Das Eintragen für diesen Abend ist geschlossen.
          </AlertDescription>
        </Alert>
      ) : null}

      <WhiskySection
        eventId={eventId}
        editable={editable}
        whiskies={data.whiskies}
        quota={quota}
      />
    </>
  )
}
