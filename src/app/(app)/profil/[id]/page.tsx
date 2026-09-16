import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { PublicProfileView } from '@/components/profile/public-profile-view'
import { PageHeader } from '@/components/layout/page-header'
import { requireUser } from '@/lib/auth'
import { getPublicProfile } from '@/lib/queries/public-profile'

export const metadata: Metadata = { title: 'Profil' }

export default async function FremdesProfilPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireUser()

  // Der eigene Name verlinkt überall auf dieselbe Route — hier auf die
  // bearbeitbare Seite umleiten statt eine read-only Ansicht seiner selbst
  // zu zeigen (PROJ-14).
  if (id === userId) redirect('/profil')

  const profile = await getPublicProfile(id)
  if (!profile) notFound()

  return (
    <>
      <PageHeader title={profile.displayName} />
      <PublicProfileView profile={profile} />
    </>
  )
}
