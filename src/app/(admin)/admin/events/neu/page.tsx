import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { EventForm } from '@/components/admin/event-form'
import { PageHeader } from '@/components/layout/page-header'
import { requireAdmin } from '@/lib/auth'
import { getMembers } from '@/lib/queries/admin'
import type { EventFormInput } from '@/lib/schemas/admin-events'

export const metadata: Metadata = { title: 'Tasting anlegen' }

export default async function NeuesEventPage() {
  await requireAdmin()
  const members = await getMembers()
  const active = members
    .filter((m) => m.is_active)
    .map((m) => ({ id: m.id, display_name: m.display_name }))

  const defaultValues: EventFormInput = {
    eventDate: '',
    location: '',
    hostId: '',
    participantIds: [],
    helperId: '',
    maxWhiskies: '',
    theme: '',
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
      <PageHeader title="Tasting anlegen" />
      <EventForm mode="create" members={active} defaultValues={defaultValues} />
    </>
  )
}
