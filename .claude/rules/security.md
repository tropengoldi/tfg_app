---
paths:
  - "supabase/**"
  - "src/lib/actions/**"
  - "src/lib/email/**"
  - "src/proxy.ts"
  - "src/lib/auth*.ts"
  - "src/app/auth/**"
  - ".env*"
  - "next.config.*"
---

# Security Rules

## Secrets
- Keine Secrets im Code oder in Commits. Lokal stehen sie in `.env.local` (gitignored, für Claude gesperrt), live als
  Vercel-Umgebungsvariablen.
- `NEXT_PUBLIC_` nur für Werte, die in den Browser dürfen. Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_*`,
  `FEEDBACK_EMAIL`.
- Jede neue Umgebungsvariable mit Dummy-Wert und Erklärung in `.env.local.example` dokumentieren und dem Nutzer
  sagen, dass er sie lokal und bei Vercel setzen muss.

## Eingaben
- Jede Server Action validiert serverseitig mit Zod; Client-Validierung ist nur Komfort.
- Nutzertext in Mails nur im Klartext-Inhalt, nie in Kopfzeilen; Einzeiler von Steuerzeichen befreien.
- Weiterleitungsziele über `safeInternalPath` (`src/lib/safe-redirect.ts`).

## Zugriff
- RLS und RPC-Prüfungen sind die tragende Schicht; die UI blendet nur aus. Die Blindheit der Verkostung muss in der
  Datenbank halten.
- Änderungen an RLS-Policies, Rechten, Auth-Flow oder `src/proxy.ts` dem Nutzer ausdrücklich vorstellen.
- Ratenbegrenzung für alles, was Mails verschickt oder teure Arbeit auslöst (Muster: PROJ-30 `register_feedback`).

## Security-Header
Bereits in `next.config.ts` gesetzt (X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS); bei Änderungen erhalten.
