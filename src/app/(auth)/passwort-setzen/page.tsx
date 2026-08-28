import type { Metadata } from 'next'

import { AuthCard, AuthLink } from '@/components/auth/auth-card'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Passwort setzen' }

export default async function PasswortSetzenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const linkError = params.fehler === 'link'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (linkError || !user) {
    return (
      <AuthCard
        title="Passwort setzen"
        footer={<AuthLink href="/passwort-vergessen">Neuen Link anfordern</AuthLink>}
      >
        <Alert variant="destructive">
          <AlertDescription>
            Der Link ist ungültig oder abgelaufen. Fordere unten einen neuen an.
          </AlertDescription>
        </Alert>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Passwort setzen"
      description="Vergib ein Passwort für deinen Zugang. Danach bist du angemeldet."
    >
      <SetPasswordForm />
    </AuthCard>
  )
}
