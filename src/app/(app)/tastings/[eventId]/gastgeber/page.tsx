import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { HostPanel } from '@/components/host/host-panel'
import { PageHeader } from '@/components/layout/page-header'
import { requireHost } from '@/lib/auth'
import { formatEventDate } from '@/lib/dates'
import { getHostControlData } from '@/lib/queries/host-control'

export const metadata: Metadata = { title: 'Steuern' }

export default async function GastgeberPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  await requireHost(eventId)

  const data = await getHostControlData(eventId)
  if (!data) notFound()

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
        title="Steuern"
        description={`${formatEventDate(data.event.event_date)} · ${data.event.location}`}
      />
      <HostPanel data={data} />
    </>
  )
}
