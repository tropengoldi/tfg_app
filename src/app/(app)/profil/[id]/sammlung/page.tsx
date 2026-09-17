import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { PublicCollectionView } from '@/components/collection/public-collection-view'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { getCollectionEntries } from '@/lib/queries/collection'
import { getPublicProfile } from '@/lib/queries/public-profile'

export const metadata: Metadata = { title: 'Sammlung' }

export default async function FremdeSammlungPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireUser()

  if (id === userId) redirect('/profil/sammlung')

  const profile = await getPublicProfile(id)
  if (!profile) notFound()

  return (
    <>
      <PageHeader title={`Sammlung von ${profile.displayName}`} />
      {profile.collectionVisible ? (
        <PublicCollectionView entries={await getCollectionEntries(id)} />
      ) : (
        <p className="text-sm text-muted-foreground">Diese Sammlung ist nicht sichtbar.</p>
      )}
    </>
  )
}
