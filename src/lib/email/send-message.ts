import { formatEventDate } from '@/lib/dates'
import { fromAddress as appFromAddress, getTransport } from '@/lib/email/transport'

interface Recipient {
  email: string
  name: string
}

export interface MessageMailContext {
  senderName: string
  senderEmail: string
  body: string
  tasting: { eventDate: string; location: string } | null
}

/**
 * Verschickt eine Nachricht einzeln an jeden Empfänger (PROJ-16) — niemand
 * sieht die Adressen der anderen Empfänger. Feste App-Absenderadresse,
 * Reply-To auf die echte Adresse des Absenders (Gmail lässt über SMTP keine
 * beliebige Absenderadresse zu, siehe Tech Design).
 *
 * Wirft nicht bei einzelnen Fehlschlägen — gibt stattdessen zurück, wer
 * tatsächlich erreicht wurde, damit der Aufrufer nur diese als „gesendet"
 * vermerkt.
 */
export async function sendMessageEmails(
  recipients: Recipient[],
  ctx: MessageMailContext,
): Promise<{ succeeded: Recipient[]; failed: Recipient[] }> {
  const transport = getTransport()
  const fromAddress = appFromAddress()

  const subject = ctx.tasting
    ? `Neue Nachricht von ${ctx.senderName} zum Tasting am ${formatEventDate(ctx.tasting.eventDate)}`
    : `Neue Nachricht von ${ctx.senderName}`

  const succeeded: Recipient[] = []
  const failed: Recipient[] = []

  await Promise.all(
    recipients.map(async (r) => {
      try {
        await transport.sendMail({
          from: `"Whizzky" <${fromAddress}>`,
          to: r.email,
          replyTo: ctx.senderEmail,
          subject,
          text: ctx.body,
        })
        succeeded.push(r)
      } catch {
        failed.push(r)
      }
    }),
  )

  return { succeeded, failed }
}
