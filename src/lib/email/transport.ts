import nodemailer from 'nodemailer'

/**
 * Gemeinsamer SMTP-Zugang (Gmail) für alle App-Mails — Nachrichten (PROJ-16)
 * und Feedback (PROJ-30). Wirft, wenn die Konfiguration fehlt.
 */
export function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !port || !user || !pass) {
    throw new Error('SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS sind nicht gesetzt (App-Mailversand).')
  }
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  })
}

/** Feste Absenderadresse — Gmail lässt über SMTP keine beliebige zu. */
export function fromAddress(): string {
  return process.env.SMTP_FROM || process.env.SMTP_USER || ''
}
