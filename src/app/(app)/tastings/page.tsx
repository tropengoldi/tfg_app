import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { TastingList } from '@/components/tasting/tasting-list'
import { requireUser } from '@/lib/auth'
import { getMyTastings } from '@/lib/queries/tastings'

export const metadata: Metadata = { title: 'Tastings' }

export default async function TastingsPage() {
  const { userId } = await requireUser()
  const rows = await getMyTastings(userId)

  return (
    <>
      <PageHeader
        title="Tastings"
        description="Deine Abende — trag hier ein, was du mitbringst."
      />
      <TastingList rows={rows} />
    </>
  )
}
