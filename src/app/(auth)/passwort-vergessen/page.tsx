import type { Metadata } from 'next'

import { AuthCard, AuthLink } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Passwort vergessen' }

export default function PasswortVergessenPage() {
  return (
    <AuthCard
      title="Passwort vergessen"
      description="Trag deine E-Mail ein — wir schicken dir einen Link zum Zurücksetzen."
      footer={<AuthLink href="/login">Zurück zur Anmeldung</AuthLink>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
