import type { Metadata } from 'next'

import { CommunityList } from '@/components/community/community-list'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { getActiveMembers } from '@/lib/queries/community'

export const metadata: Metadata = { title: 'Die Runde' }

export default async function CommunityPage() {
  await requireUser()
  const members = await getActiveMembers()

  return (
    <>
      <PageHeader title="Die Runde" description="Alle aktiven Mitglieder." />
      <CommunityList members={members} />
    </>
  )
}
