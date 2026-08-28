'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-rules'
import { messageForDbError } from '@/lib/errors'
import { inviteMemberSchema } from '@/lib/schemas/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

const MEMBERS_PATH = '/admin/teilnehmer'

async function requireAdminOr(): Promise<ActionResult | null> {
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
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }

  const displayName = parsed.data.displayName?.trim() || undefined
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await createAdminClient().auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: displayName ? { display_name: displayName } : undefined,
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
