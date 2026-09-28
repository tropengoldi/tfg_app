'use server'

import { revalidatePath } from 'next/cache'

import { getSessionContext } from '@/lib/auth'
import { sendMessageEmails } from '@/lib/email/send-message'
import { messageForDbError } from '@/lib/errors'
import { sendMessageSchema } from '@/lib/schemas/messages'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string } | { ok: true }

/**
 * Verschickt eine Nachricht (PROJ-16) in zwei Schritten, damit nie eine
 * Nachricht gespeichert wird, die tatsächlich niemanden erreicht hat:
 *
 *   1. `resolve_message_recipients` prüft serverseitig (aktive Mitglieder,
 *      bei Tasting-Bezug: Absender + Empfänger wirklich beteiligt) und löst
 *      die E-Mail-Adressen auf — ohne irgendetwas zu speichern.
 *   2. Die App verschickt die E-Mails einzeln per Nodemailer.
 *   3. Nur die Empfänger, die tatsächlich erreicht wurden, werden über
 *      `record_sent_message` als Nachricht + Empfängerliste gespeichert.
 *      Schlägt der Versand komplett fehl, passiert Schritt 3 gar nicht erst.
 *
 * Für Schritt 3 wird bewusst ein FRISCHER Supabase-Client erzeugt statt des
 * Clients aus Schritt 1 wiederzuverwenden: Der Nodemailer-Versand (echte
 * TLS-Verbindung nach außen) korrumpiert sonst reproduzierbar den
 * Auth-Zustand des bestehenden Server-Clients — der zweite RPC-Aufruf
 * scheitert dann mit „Dazu fehlt dir die Berechtigung." (TS004), obwohl
 * dieselbe Person weiterhin angemeldet ist. Mit einem frischen Client tritt
 * das nicht auf.
 */
export async function sendMessageAction(input: unknown): Promise<ActionResult> {
  const session = await getSessionContext()
  if (!session) return { error: 'Bitte melde dich neu an.' }

  const parsed = sendMessageSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.' }
  }
  const { body, recipientIds, eventId } = parsed.data

  const supabase = await createClient()

  const resolved = await supabase.rpc('resolve_message_recipients', {
    p_recipient_ids: recipientIds,
    p_event_id: eventId ?? undefined,
  })
  if (resolved.error) return { error: messageForDbError(resolved.error) }
  if (!resolved.data || resolved.data.length === 0) {
    return { error: 'Keiner der gewählten Empfänger ist noch erreichbar.' }
  }

  let tasting: { eventDate: string; location: string } | null = null
  if (eventId) {
    const { data: event } = await supabase
      .from('tasting_events')
      .select('event_date, location')
      .eq('id', eventId)
      .maybeSingle()
    if (event) tasting = { eventDate: event.event_date, location: event.location }
  }

  let succeeded: { email: string; name: string }[]
  try {
    ;({ succeeded } = await sendMessageEmails(
      resolved.data.map((r) => ({ email: r.recipient_email, name: r.recipient_name })),
      {
        senderName: session.profile.display_name,
        senderEmail: session.email ?? '',
        body,
        tasting,
      },
    ))
  } catch {
    // z. B. fehlende/falsche SMTP_*-Konfiguration — kein einzelner
    // Zustellfehler, sondern der Versandweg selbst ist nicht nutzbar.
    return { error: 'Die Nachricht konnte gerade nicht verschickt werden.' }
  }

  if (succeeded.length === 0) {
    return { error: 'Die Nachricht konnte an niemanden verschickt werden.' }
  }

  const supabaseAfterSend = await createClient()
  const recorded = await supabaseAfterSend.rpc('record_sent_message', {
    p_body: body,
    p_event_id: eventId ?? undefined,
    p_recipient_ids: resolved.data
      .filter((r) => succeeded.some((s) => s.email === r.recipient_email))
      .map((r) => r.recipient_id),
  })
  if (recorded.error) return { error: messageForDbError(recorded.error) }

  revalidatePath('/nachrichten')
  return { ok: true }
}
