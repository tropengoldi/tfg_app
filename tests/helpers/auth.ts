import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, type Page } from '@playwright/test'

export const SEED_PASSWORD = process.env.SEED_DEV_PASSWORD ?? 'tasting-dev-2026'
export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'hermann.hoppen@gmail.com'
export const TEST_EMAIL = process.env.SEED_TEST_EMAIL ?? 'test.teilnehmer@example.com'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasServiceClient = Boolean(SUPABASE_URL && SERVICE)

export function serviceClient(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE) throw new Error('Service-Client-Umgebung fehlt')
  return createClient(SUPABASE_URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Füllt ein RHF-kontrolliertes Feld zuverlässig (WebKit verliert `.fill()` mitunter). */
async function fillField(page: Page, label: string, value: string, exact = false) {
  const field = page.getByLabel(label, { exact })
  await field.click()
  await field.fill('')
  await field.pressSequentially(value, { delay: 10 })
  await field.evaluate((el) => (el as HTMLInputElement).blur())
}

/** Meldet sich über das echte Login-Formular an und wartet auf die Zielseite. */
export async function login(
  page: Page,
  email: string,
  password = SEED_PASSWORD,
  { expectPath = '/' }: { expectPath?: string } = {},
) {
  await page.goto('/login')
  await fillField(page, 'E-Mail', email)
  await fillField(page, 'Passwort', password, true)
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await page.waitForURL((u) => new URL(u).pathname === expectPath, { timeout: 20_000 })
  // Warten, bis die App-Shell wirklich steht (sonst racet ein direkt folgender
  // goto() gegen den noch nicht fertigen RSC-Render).
  if (expectPath !== '/login') {
    await page
      .getByRole('navigation', { name: 'Hauptnavigation' })
      .waitFor({ state: 'visible', timeout: 15_000 })
  }
}

export { fillField }

export function bottomNav(page: Page) {
  return page.getByRole('navigation', { name: 'Hauptnavigation' })
}

/** Legt einen Wegwerf-Auth-Nutzer + Profil an. */
export async function createDisposableUser(
  tag: string,
  { active = true }: { active?: boolean } = {},
) {
  const svc = serviceClient()
  const email = `qa-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `QA ${tag}` },
  })
  if (error || !data.user) throw error ?? new Error('createUser fehlgeschlagen')

  if (!active) {
    const { error: upErr } = await svc
      .from('profiles')
      .update({ is_active: false })
      .eq('id', data.user.id)
    if (upErr) throw upErr
  }

  return { id: data.user.id, email }
}

export async function setActive(userId: string, active: boolean) {
  const { error } = await serviceClient()
    .from('profiles')
    .update({ is_active: active })
    .eq('id', userId)
  if (error) throw error
}

export async function deleteUser(userId: string) {
  await serviceClient()
    .auth.admin.deleteUser(userId)
    .catch(() => {})
}

/**
 * Erzeugt einen Einladungs-/Reset-Link und gibt token_hash + type zurück.
 * Bei `invite` legt Supabase den Nutzer dabei an — dessen id kommt mit zurück,
 * damit der Test hinterher aufräumen kann.
 */
export async function generateAuthLink(
  type: 'invite' | 'recovery',
  email: string,
): Promise<{ tokenHash: string; type: string; userId?: string }> {
  const { data, error } = await serviceClient().auth.admin.generateLink({
    type,
    email,
  })
  if (error || !data.properties) {
    throw error ?? new Error('generateLink fehlgeschlagen')
  }
  return {
    tokenHash: data.properties.hashed_token,
    type,
    userId: data.user?.id,
  }
}

export function disposableEmail(tag: string): string {
  return `qa-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`
}

/** Ruft die Confirm-Route mit einem token_hash auf → Session gesetzt. */
export async function consumeAuthLink(
  page: Page,
  link: { tokenHash: string; type: string },
  next = '/passwort-setzen',
) {
  await page.goto(
    `/auth/confirm?token_hash=${encodeURIComponent(link.tokenHash)}&type=${link.type}&next=${encodeURIComponent(next)}`,
  )
  await expect(page).toHaveURL(new RegExp(next.replace('/', '\\/')))
}
