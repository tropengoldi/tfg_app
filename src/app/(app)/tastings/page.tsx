import type { Metadata } from 'next'

import { PastTastingsSection } from '@/components/results/past-tastings-section'
import { PageHeader } from '@/components/layout/page-header'
import { TastingList } from '@/components/tasting/tasting-list'
import { requireUser } from '@/lib/auth'
import { getPastTastings } from '@/lib/queries/results'
import { getMyTastings } from '@/lib/queries/tastings'

export const metadata: Metadata = { title: 'Tastings' }

export default async function TastingsPage() {
  const { userId } = await requireUser()
  const [mine, past] = await Promise.all([getMyTastings(userId), getPastTastings()])
  const upcoming = mine.filter((r) => r.status !== 'closed')

  return (
    <>
      <PageHeader
        title="Tastings"
        description="Deine Abende — trag hier ein, was du mitbringst."
      />

      <h2 className="mb-3 font-display text-lg text-foreground">Deine Abende</h2>
      <TastingList rows={upcoming} />

      <PastTastingsSection rows={past} />
    </>
  )
}
