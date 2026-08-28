import type { Metadata } from 'next'

import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { safeInternalPath } from '@/lib/safe-redirect'

export const metadata: Metadata = { title: 'Anmelden' }

const NOTICES: Record<string, string> = {
  deactivated: 'Dein Zugang wurde deaktiviert. Wende dich an den Admin.',
  'signed-out': 'Du wurdest abgemeldet.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const reason = typeof params.reason === 'string' ? params.reason : undefined
  const notice = reason ? NOTICES[reason] : undefined
  const redirectTo =
    typeof params.redirect === 'string'
      ? safeInternalPath(params.redirect, '')
      : ''

  return (
    <AuthCard title="Anmelden">
      <div className="space-y-4">
        {notice ? (
          <Alert variant={reason === 'deactivated' ? 'destructive' : 'default'}>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
        <LoginForm redirectTo={redirectTo || undefined} />
      </div>
    </AuthCard>
  )
}
