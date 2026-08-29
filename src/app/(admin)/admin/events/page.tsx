import type { Metadata } from 'next'

import { EventList } from '@/components/admin/event-list'
import { PageHeader } from '@/components/layout/page-header'
import { requireAdmin } from '@/lib/auth'
import { getEvents } from '@/lib/queries/admin-events'

export const metadata: Metadata = { title: 'Tastings' }

export default async function EventsPage() {
  await requireAdmin()
  const events = await getEvents()

  return (
    <>
      <PageHeader
        title="Tastings"
        description="Abende anlegen und vorbereiten."
      />
      <EventList events={events} />
    </>
  )
}
