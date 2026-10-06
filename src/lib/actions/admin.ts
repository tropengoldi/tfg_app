'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-rules'
import { messageForDbError } from '@/lib/errors'
import { inviteMemberSchema, uuidSchema } from '@/lib/schemas/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

const MEMBERS_PATH = '/admin/teilnehmer'

async function requireAdminOr(): Promise<{ error: string } | null> {
  const session = await getSessionContext()
  if (!isAdmin(session?.profile)) {
    return { error: 'Dazu fehlt dir die Berechtigung.' }
  }
  return null
}

/** Neuen Teilnehmer per E-Mail einladen. Einzige Stelle mit dem Service-Zugang. */
export async function inviteMemberAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get('email'),
    displayName: formData.get('displayName') ?? '',
    isTest: formData.get('isTest') === 'on' || formData.get('isTest') === 'true',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const displayName = parsed.data.displayName?.trim() || undefined
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // is_test wirkt nur beim Anlegen (Trigger handle_new_user, PROJ-26) — die
  // Registrierung ist gesperrt, also setzt das nur der Admin.
  const metadata: Record<string, unknown> = {}
  if (displayName) metadata.display_name = displayName
  if (parsed.data.isTest) metadata.is_test = true

  const { error } = await createAdminClient().auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: Object.keys(metadata).length > 0 ? metadata : undefined,
      redirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent('/passwort-setzen')}`,
    },
  )

  if (error) {
    if (error.code === 'email_exists' || /already been registered/i.test(error.message)) {
      return { error: 'Diese Person ist schon in der Runde.' }
    }
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
      return { error: 'Zu viele Einladungen in kurzer Zeit. Bitte später erneut versuchen.' }
    }
    return {
      error:
        'Die Einladungs-E-Mail konnte nicht verschickt werden. Falls das Konto angelegt wurde, kann die Person sich über „Passwort vergessen" anmelden.',
    }
  }

  revalidatePath(MEMBERS_PATH)
  return { ok: true }
}

async function runMemberRpc(
  fn: 'deactivate_member' | 'reactivate_member',
  targetId: string,
): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const supabase = await createClient()
  const { error } = await supabase.rpc(fn, { p_target: targetId })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(MEMBERS_PATH)
  return { ok: true }
}

export async function deactivateMemberAction(targetId: string): Promise<ActionResult> {
  return runMemberRpc('deactivate_member', targetId)
}

export async function reactivateMemberAction(targetId: string): Promise<ActionResult> {
  return runMemberRpc('reactivate_member', targetId)
}

export type TestAccountResult = { error: string } | { ok: true; affected: number }

/** PROJ-26: Wie viele Tastings würde das Umlegen der Markierung aus-/einblenden? */
export async function getTestAccountImpactAction(
  targetId: string,
  isTest: boolean,
): Promise<TestAccountResult> {
  const guard = await requireAdminOr()
  if (guard) return guard
  if (!uuidSchema.safeParse(targetId).success) return { error: 'Ungültige Eingabe.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_test_account_impact', {
    p_target: targetId,
    p_value: isTest,
  })
  if (error) return { error: messageForDbError(error) }
  return { ok: true, affected: data ?? 0 }
}

/** PROJ-26: Konto als Testkonto markieren bzw. Markierung entfernen. */
export async function setTestAccountAction(
  targetId: string,
  isTest: boolean,
): Promise<TestAccountResult> {
  const guard = await requireAdminOr()
  if (guard) return guard
  if (!uuidSchema.safeParse(targetId).success) return { error: 'Ungültige Eingabe.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_set_test_account', {
    p_target: targetId,
    p_value: isTest,
  })
  if (error) return { error: messageForDbError(error) }

  // Sichtbarkeit von Profilen und Tastings ändert sich app-weit.
  revalidatePath('/', 'layout')
  return { ok: true, affected: data ?? 0 }
}

export async function setMemberAdminAction(
  targetId: string,
  makeAdmin: boolean,
): Promise<ActionResult> {
  const guard = await requireAdminOr()
  if (guard) return guard

  const supabase = await createClient()
  const { error } = await supabase.rpc('set_member_admin', {
    p_target: targetId,
    p_make_admin: makeAdmin,
  })
  if (error) return { error: messageForDbError(error) }

  revalidatePath(MEMBERS_PATH)
  return { ok: true }
}
