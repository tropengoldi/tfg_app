import type { Metadata } from 'next'

import { ParticipantList } from '@/components/admin/participant-list'
import { PageHeader } from '@/components/layout/page-header'
import { requireAdmin } from '@/lib/auth'
import { getMembers } from '@/lib/queries/admin'

export const metadata: Metadata = { title: 'Teilnehmer' }

export default async function TeilnehmerPage() {
  const { userId } = await requireAdmin()
  const members = await getMembers()

  return (
    <>
      <PageHeader
        title="Teilnehmer"
        description="Einladen, Status verwalten, Admin-Rechte vergeben."
      />
      <ParticipantList members={members} currentUserId={userId} />
    </>
  )
}
