import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { EventBasicsView } from '@/components/host/event-basics-view'
import { HostPanel } from '@/components/host/host-panel'
import { RealtimeRefresher } from '@/components/common/realtime-refresher'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { canAccessHostArea, isEventHost } from '@/lib/auth-rules'
import { formatEventDate } from '@/lib/dates'
import { getEventBasics, getHostControlData } from '@/lib/queries/host-control'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Steuern' }

export default async function GastgeberPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const session = await requireUser()

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('tasting_events')
    .select('id, host_id, helper_id')
    .eq('id', eventId)
    .maybeSingle()
  if (!event) notFound()

  const backLink = (
    <Link
      href="/tastings"
      className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      Zu meinen Tastings
    </Link>
  )

  // Gastgeber-mit-Helfer: den vollen Steuern-Bereich hat der Helfer, aber die
  // Eckdaten (Thema / Essen / Anmerkungen) pflegt weiter der Gastgeber.
  if (!canAccessHostArea(session.userId, session.profile, event)) {
    if (!isEventHost(session.userId, event)) notFound()
    const basics = await getEventBasics(eventId)
    if (!basics) notFound()
    return (
      <>
        {backLink}
        <PageHeader
          title="Eckdaten"
          description={`${formatEventDate(basics.event_date)} · ${basics.location}`}
        />
        <EventBasicsView basics={basics} />
      </>
    )
  }

  const data = await getHostControlData(eventId)
  if (!data) notFound()

  return (
    <>
      {backLink}
      <PageHeader
        title="Steuern"
        description={`${formatEventDate(data.event.event_date)} · ${data.event.location}`}
      />
      <RealtimeRefresher eventId={eventId} />
      <HostPanel data={data} />
    </>
  )
}
