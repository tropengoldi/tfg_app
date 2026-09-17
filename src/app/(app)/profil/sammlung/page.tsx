import type { Metadata } from 'next'

import { CollectionList } from '@/components/collection/collection-list'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { getCollectionEntries } from '@/lib/queries/collection'

export const metadata: Metadata = { title: 'Meine Sammlung' }

export default async function MeineSammlungPage() {
  const { userId } = await requireUser()
  const entries = await getCollectionEntries(userId)

  return (
    <>
      <PageHeader title="Meine Sammlung" />
      <CollectionList entries={entries} />
    </>
  )
}
