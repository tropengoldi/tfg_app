import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, type Page } from '@playwright/test'

export const SEED_PASSWORD = process.env.SEED_DEV_PASSWORD ?? 'tasting-dev-2026'
export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'hermann.hoppen@gmail.com'
export const TEST_EMAIL = process.env.SEED_TEST_EMAIL ?? 'test.teilnehmer@example.com'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

/** Meldet den aktuellen Nutzer ab, indem die Session-Cookies gelöscht werden. */
export async function logout(page: Page) {
  await page.context().clearCookies()
}

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

/** Meldet einen Nutzer einmalig an (setzt last_sign_in_at → Status „Aktiv"). */
export async function signInOnce(email: string, password = SEED_PASSWORD) {
  if (!SUPABASE_URL || !ANON) throw new Error('Anon-Umgebung fehlt')
  const c = createClient(SUPABASE_URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function setRole(userId: string, role: 'admin' | 'teilnehmer') {
  const { error } = await serviceClient()
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

/** Löscht alle qa-Wegwerf-Nutzer, deren E-Mail mit einem Präfix beginnt. */
export async function deleteUsersByPrefix(prefix: string) {
  const svc = serviceClient()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    for (const u of data.users) {
      if (u.email?.startsWith(prefix)) {
        await svc.auth.admin.deleteUser(u.id).catch(() => {})
      }
    }
    if (data.users.length < 200) break
  }
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

// --- Events (PROJ-4) ---------------------------------------------------------

interface CreateEventOpts {
  hostId: string
  createdBy: string
  location: string
  eventDate?: string
  status?: 'draft' | 'active' | 'closed'
  maxWhiskies?: number
}

/** Legt ein Event direkt an (Service-Client, umgeht die Server Action). */
export async function createEventDirect(opts: CreateEventOpts): Promise<string> {
  const svc = serviceClient()
  const now = new Date().toISOString()
  const status = opts.status ?? 'draft'
  const row: Record<string, unknown> = {
    event_date: opts.eventDate ?? '2026-12-24',
    location: opts.location,
    host_id: opts.hostId,
    created_by: opts.createdBy,
    status,
    max_whiskies_per_participant: opts.maxWhiskies ?? null,
  }
  if (status !== 'draft') {
    row.started_at = now
    row.current_position = 1
  }
  if (status === 'closed') row.closed_at = now

  // Es darf global nur EIN aktives Event geben (one_active_event_at_a_time).
  // Ein noch offenes aus einem früheren Test vorher wegschliessen.
  if (status === 'active') {
    await svc
      .from('tasting_events')
      .update({ status: 'closed', closed_at: now })
      .eq('status', 'active')
      .then(undefined, () => {})
  }

  const { data, error } = await svc
    .from('tasting_events')
    .insert(row)
    .select('id')
    .single()
  if (error) throw error

  await svc
    .from('event_participants')
    .insert({ event_id: data.id, profile_id: opts.hostId })
    .then(undefined, () => {})

  return data.id as string
}

/** Fügt einen weiteren Teilnehmer direkt zur Event-Teilnehmerliste hinzu. */
export async function addParticipant(eventId: string, profileId: string) {
  await serviceClient()
    .from('event_participants')
    .insert({ event_id: eventId, profile_id: profileId })
    .then(undefined, () => {})
}

/** Schliesst jedes gerade aktive Event (Testhygiene für die „läuft"-Fälle). */
export async function closeAllActiveEvents() {
  await serviceClient()
    .from('tasting_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('status', 'active')
    .then(undefined, () => {})
}

/** Setzt ein Event direkt auf „läuft" (schliesst ein evtl. anderes aktives weg). */
export async function startEventDirect(eventId: string, position = 1) {
  const svc = serviceClient()
  const now = new Date().toISOString()
  await svc
    .from('tasting_events')
    .update({ status: 'closed', closed_at: now })
    .eq('status', 'active')
    .then(undefined, () => {})
  const { error } = await svc
    .from('tasting_events')
    .update({ status: 'active', started_at: now, current_position: position })
    .eq('id', eventId)
  if (error) throw error
}

export async function deleteEventsByLocationPrefix(prefix: string) {
  await serviceClient()
    .from('tasting_events')
    .delete()
    .like('location', `${prefix}%`)
    .then(undefined, () => {})
}

/** Meldet einen Nutzer an und ruft `add_whisky` — für „Event mit Whisky"-Fälle. */
export async function addWhiskyAs(
  email: string,
  eventId: string,
  name: string,
  password = SEED_PASSWORD,
) {
  if (!SUPABASE_URL || !ANON) throw new Error('Anon-Umgebung fehlt')
  const c = createClient(SUPABASE_URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const s = await c.auth.signInWithPassword({ email, password })
  if (s.error) throw s.error
  const { error } = await c.rpc('add_whisky', { p_event: eventId, p_name: name })
  if (error) throw error
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
