import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { EventForm } from '@/components/admin/event-form'
import { PageHeader } from '@/components/layout/page-header'
import { requireAdmin } from '@/lib/auth'
import { getMembers } from '@/lib/queries/admin'
import { getEventForEdit } from '@/lib/queries/admin-events'
import type { EventFormInput } from '@/lib/schemas/admin-events'

export const metadata: Metadata = { title: 'Tasting bearbeiten' }

export default async function EventBearbeitenPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireAdmin()
  const { eventId } = await params

  const loaded = await getEventForEdit(eventId)
  if (!loaded) notFound()
  if (loaded.event.status !== 'draft') redirect('/admin/events')

  const members = await getMembers()
  const active = members
    .filter((m) => m.is_active)
    .map((m) => ({ id: m.id, display_name: m.display_name }))
  // Den aktuellen Gastgeber sicher in der Auswahl halten.
  if (!active.some((m) => m.id === loaded.event.host_id)) {
    const host = members.find((m) => m.id === loaded.event.host_id)
    if (host) active.unshift({ id: host.id, display_name: host.display_name })
  }

  const defaultValues: EventFormInput = {
    eventDate: loaded.event.event_date,
    location: loaded.event.location,
    hostId: loaded.event.host_id,
    participantIds: loaded.participantIds,
    maxWhiskies: loaded.event.max_whiskies_per_participant?.toString() ?? '',
    theme: loaded.event.theme ?? '',
  }

  return (
    <>
      <Link
        href="/admin/events"
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Zur Liste
      </Link>
      <PageHeader title="Tasting bearbeiten" />
      <EventForm
        mode="edit"
        eventId={eventId}
        members={active}
        defaultValues={defaultValues}
      />
    </>
  )
}
