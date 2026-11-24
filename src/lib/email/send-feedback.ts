import { fromAddress, getTransport } from '@/lib/email/transport'

/**
 * Verschickt eine Feedback-Mail (PROJ-30) an `to`, Reply-To = Absender.
 *
 * Trockenlauf: Ist `FEEDBACK_DRY_RUN=1` gesetzt (nur in der E2E-Umgebung,
 * siehe playwright.config.ts), wird nichts verschickt — sonst liefe das
 * Postfach des Admins bei jedem Testlauf voll. Niemals in Produktion setzen.
 */
export async function sendFeedbackEmail(mail: {
  to: string
  replyTo: string
  subject: string
  text: string
}): Promise<void> {
  if (process.env.FEEDBACK_DRY_RUN === '1') {
    console.info(`[feedback] Trockenlauf, nicht verschickt: ${mail.subject}`)
    return
  }
  const transport = getTransport()
  await transport.sendMail({
    from: `"Whizzky" <${fromAddress()}>`,
    to: mail.to,
    replyTo: mail.replyTo || undefined,
    subject: mail.subject,
    text: mail.text,
  })
}
