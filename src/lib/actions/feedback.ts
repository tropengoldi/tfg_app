'use server'

import { headers } from 'next/headers'

import { getSessionContext } from '@/lib/auth'
import { sendFeedbackEmail } from '@/lib/email/send-feedback'
import { messageForDbError } from '@/lib/errors'
import { buildFeedbackMail } from '@/lib/feedback-mail'
import { feedbackSchema } from '@/lib/schemas/feedback'
import { createClient } from '@/lib/supabase/server'

export type FeedbackResult = { error: string } | { ok: true }

const SEND_FAILED = 'Deine Nachricht konnte gerade nicht verschickt werden. Bitte versuch es gleich noch einmal.'

/**
 * Feedback an den Admin (PROJ-30). Der Inhalt wird NICHT gespeichert:
 *   1. Sitzung + Eingaben prüfen (gleiche Regeln wie im Formular)
 *   2. Empfänger `FEEDBACK_EMAIL` vorhanden? Sonst Fehlermeldung, nichts gezählt
 *   3. `register_feedback` reserviert einen Platz im Stundenlimit (TS029)
 *   4. Mail per SMTP, Reply-To = Absender
 * Ein fehlgeschlagener Versand zählt bewusst mit (Tech Design).
 */
export async function sendFeedbackAction(input: unknown): Promise<FeedbackResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = feedbackSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const { kind, description, from } = parsed.data

  const to = process.env.FEEDBACK_EMAIL?.trim()
  if (!to) {
    console.error('[feedback] FEEDBACK_EMAIL ist nicht gesetzt — kein Versand möglich.')
    return { error: SEND_FAILED }
  }

  const supabase = await createClient()
  const reserved = await supabase.rpc('register_feedback')
  if (reserved.error) return { error: messageForDbError(reserved.error) }

  const h = await headers()
  const { subject, text } = buildFeedbackMail({
    kind,
    description,
    senderName: session.profile.display_name,
    senderEmail: session.email ?? '',
    isTest: Boolean(session.profile.is_test),
    fromPage: from,
    userAgent: h.get('user-agent'),
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    now: new Date(),
  })

  try {
    await sendFeedbackEmail({ to, replyTo: session.email ?? '', subject, text })
  } catch (err) {
    console.error('[feedback] Versand fehlgeschlagen:', err instanceof Error ? err.message : err)
    return { error: SEND_FAILED }
  }

  return { ok: true }
}
