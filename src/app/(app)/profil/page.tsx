import type { Metadata } from 'next'
import Link from 'next/link'
import { Users } from 'lucide-react'

import { BalanceCard } from '@/components/profile/balance-card'
import { ProfileForm } from '@/components/profile/profile-form'
import { VisibilitySettings } from '@/components/profile/visibility-settings'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import type { PersonalBalance } from '@/lib/personal-balance'
import { getOwnStammdaten, getPersonalBalance } from '@/lib/queries/profile'

export const metadata: Metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const { userId, profile, email } = await requireUser()

  // Bio/Lieblings-Dram/-region kommen seit PROJ-14 über die Sicht
  // profiles_public (die eigene Zeile liefert dort immer den vollen Wert),
  // nicht mehr über die Session — der Direktzugriff auf die Basistabelle ist
  // für diese drei Felder entzogen.
  const stammdaten = await getOwnStammdaten(userId)

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
            favoriteDram: stammdaten.favoriteDram ?? '',
            favoriteRegion: stammdaten.favoriteRegion ?? '',
            bio: stammdaten.bio ?? '',
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

        <VisibilitySettings
          defaultValues={{
            show_favorite_dram: profile.show_favorite_dram,
            show_favorite_region: profile.show_favorite_region,
            show_bio: profile.show_bio,
            show_tasting_count: profile.show_tasting_count,
            show_whisky_count: profile.show_whisky_count,
            show_best_placement: profile.show_best_placement,
            show_avg_points: profile.show_avg_points,
          }}
        />

        <Link
          href="/community"
          className="flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          Die Runde ansehen
        </Link>

        <form method="post" action="/auth/abmelden">
          <Button type="submit" variant="outline" className="w-full">
            Abmelden
          </Button>
        </form>
      </div>
    </>
  )
}
