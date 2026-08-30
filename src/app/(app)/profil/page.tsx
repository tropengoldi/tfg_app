import type { Metadata } from 'next'

import { BalanceCard } from '@/components/profile/balance-card'
import { ProfileForm } from '@/components/profile/profile-form'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import type { PersonalBalance } from '@/lib/personal-balance'
import { getPersonalBalance } from '@/lib/queries/profile'

export const metadata: Metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const { userId, profile, email } = await requireUser()

  let balance: PersonalBalance | null = null
  try {
    balance = await getPersonalBalance(userId)
  } catch {
    balance = null
  }

  return (
    <>
      <PageHeader title="Profil" />

      <div className="space-y-6">
        <ProfileForm
          defaultValues={{
            displayName: profile.display_name,
            favoriteDram: profile.favorite_dram ?? '',
            favoriteRegion: profile.favorite_region ?? '',
            bio: profile.bio ?? '',
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Konto</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">E-Mail</dt>
                <dd className="text-right">{email ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rolle</dt>
                <dd className="text-right">
                  {profile.role === 'admin' ? 'Admin' : 'Teilnehmer'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <BalanceCard balance={balance} />

        <form method="post" action="/auth/abmelden">
          <Button type="submit" variant="outline" className="w-full">
            Abmelden
          </Button>
        </form>
      </div>
    </>
  )
}
