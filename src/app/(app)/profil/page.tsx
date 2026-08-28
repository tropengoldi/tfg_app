import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const { profile, email } = await requireUser()

  return (
    <>
      <PageHeader title="Profil" />

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">{profile.display_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <p className="text-sm text-muted-foreground">
            Anzeigename, Lieblings-Dram und die persönliche Bilanz kannst du in einem
            späteren Schritt bearbeiten.
          </p>
        </CardContent>
      </Card>

      <form method="post" action="/auth/abmelden" className="mt-6">
        <Button type="submit" variant="outline" className="w-full">
          Abmelden
        </Button>
      </form>
    </>
  )
}
