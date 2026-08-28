'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { safeInternalPath } from '@/lib/safe-redirect'
import {
  forgotPasswordSchema,
  loginSchema,
  setPasswordSchema,
} from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/server'

export type FormResult = { error: string } | { ok: true } | void

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

/** Anmelden. Bei Erfolg Weiterleitung (kein Rückgabewert), sonst { error }. */
export async function signInAction(formData: FormData): Promise<FormResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: 'Bitte E-Mail und Passwort eingeben.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) {
    return { error: 'E-Mail oder Passwort stimmt nicht.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile || profile.is_active !== true) {
    await supabase.auth.signOut()
    return {
      error: 'Dein Zugang wurde deaktiviert. Wende dich an den Admin.',
    }
  }

  revalidatePath('/', 'layout')
  redirect(safeInternalPath(formData.get('redirect')))
}

/**
 * Passwort-Zurücksetzen anfordern. Antwort immer gleich (keine Enumeration),
 * außer bei Rate-Limit.
 */
export async function requestPasswordResetAction(
  formData: FormData,
): Promise<FormResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: 'Bitte eine gültige E-Mail-Adresse eingeben.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent('/passwort-setzen')}`,
  })

  if (error && (error.status === 429 || error.code === 'over_email_send_rate_limit')) {
    return { error: 'Zu viele Anfragen. Bitte versuch es später noch einmal.' }
  }

  // Alle anderen Fälle: Erfolg vortäuschen.
  return { ok: true }
}

/** Neues Passwort setzen (Einladung oder Reset). Braucht eine aktive Session. */
export async function updatePasswordAction(formData: FormData): Promise<FormResult> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Der Link ist ungültig oder abgelaufen.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    if (error.code === 'same_password') {
      return { error: 'Das ist dein bisheriges Passwort. Wähle ein neues.' }
    }
    return { error: 'Das Passwort konnte nicht gespeichert werden.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// Abmelden läuft über die Route POST /auth/abmelden (einfaches HTML-Formular),
// nicht über einen Server Action — das vermeidet „unexpected response"-Fälle
// progressiver Formulare.
