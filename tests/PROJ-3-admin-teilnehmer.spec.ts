import { expect, test } from '@playwright/test'

import {
  createDisposableAdmin,
  createDisposableUser,
  deleteUser,
  deleteUsersByPrefix,
  fillField,
  hasServiceClient,
  login,
  serviceClient,
  setRole,
  signInOnce,
} from './helpers/auth'

// PROJ-26: Wegwerf-Konten statt der Seed-Konten — das echte Admin-Konto und
// test.teilnehmer@example.com werden von der Suite nicht mehr benutzt.
let seedAdmin: { id: string; email: string }
let seedMember: { id: string; email: string }
test.beforeAll(async () => {
  if (!hasServiceClient) return
  seedAdmin = await createDisposableAdmin(`adm${Date.now()}p${process.pid}`)
  seedMember = await createDisposableUser(`mem${Date.now()}p${process.pid}`)
})
test.afterAll(async () => {
  if (!hasServiceClient) return
  // Vom Wegwerf-Admin angelegte Tastings halten ihn fest (created_by) → zuerst weg.
  if (seedAdmin) await serviceClient().from('tasting_events').delete().eq('created_by', seedAdmin.id)
  if (seedAdmin) await deleteUser(seedAdmin.id)
  if (seedMember) await deleteUser(seedMember.id)
})

const RUN_STAMP = Date.now()
const invitePrefix = `qa3-inv-${RUN_STAMP}-`
const inviteEmail = (tag: string) => `${invitePrefix}${tag}@example.com`

test.describe.configure({ mode: 'serial' })

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteUsersByPrefix('qa3-') // alle Wegwerf-Einladungen dieses Feature-Tests
})

function row(page: import('@playwright/test').Page, name: string) {
  return page
    .getByRole('list', { name: 'Teilnehmerliste' })
    .getByRole('listitem')
    .filter({ hasText: name })
}

async function openRowMenu(page: import('@playwright/test').Page, name: string) {
  await row(page, name)
    .getByRole('button', { name: new RegExp(`Aktionen für ${name}`) })
    .click()
}

// ===========================================================================
test('Teilnehmer: /admin/teilnehmer liefert „Seite nicht gefunden"', async ({ page }) => {
  await login(page, seedMember.email)
  await page.goto('/admin/teilnehmer')
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Admin sieht die Liste mit eigener Zeile, E-Mail und Status', async ({ page }) => {
  await login(page, seedAdmin.email)
  await page.goto('/admin/teilnehmer')
  const me = row(page, seedAdmin.email)
  await expect(me).toBeVisible()
  await expect(me.getByText(seedAdmin.email)).toBeVisible()
  await expect(me.getByText('Aktiv')).toBeVisible()
  // Admin-Badge: „QA promo" wird im Beförderungs-Test geprüft (Name ohne „Admin").
})

test('Admin kann sich in der eigenen Zeile nicht deaktivieren', async ({ page }) => {
  await login(page, seedAdmin.email)
  await page.goto('/admin/teilnehmer')
  const me = row(page, 'Admin')
  const menuBtn = me.getByRole('button', { name: /Aktionen für Admin/ })
  // Solange der Seed-Admin der einzige aktive Admin ist, hat seine Zeile gar
  // keine Aktion; gibt es einen weiteren, wäre höchstens „Admin-Rechte entziehen"
  // dabei — aber „Deaktivieren" (self) niemals.
  if (await menuBtn.count()) {
    await menuBtn.click()
    await expect(page.getByRole('menuitem', { name: 'Deaktivieren' })).toHaveCount(0)
  }
})

// --- Einladen -------------------------------------------------------------
test.describe('Einladen', () => {
  test.skip(!hasServiceClient, 'Service-Client nötig')

  // Der Happy-Path braucht funktionierenden E-Mail-Versand auf dem Supabase-
  // Projekt (Standard-SMTP hat sehr enge Limits). Gegen so ein Projekt sonst grün
  // — hier `fixme`, bis SMTP eingerichtet ist (/deploy-Voraussetzung).
  test.fixme(
    'mit E-Mail + Name → Erfolg, Zeile erscheint als „Eingeladen"',
    async ({ page }) => {
      await login(page, seedAdmin.email)
      await page.goto('/admin/teilnehmer')
      await page.getByRole('button', { name: 'Teilnehmer einladen' }).click()
      await fillField(page, 'E-Mail', inviteEmail('named'))
      await fillField(page, 'Anzeigename (optional)', 'QA Gustav')
      await page.getByRole('button', { name: 'Einladen' }).click()
      await expect(page.getByText('Einladung verschickt.')).toBeVisible()
      const r = row(page, 'QA Gustav')
      await expect(r).toBeVisible()
      await expect(r.getByText('Eingeladen')).toBeVisible()
    },
  )

  test.fixme('ohne Name → Anzeigename ist der Teil vor dem @', async ({ page }) => {
    await login(page, seedAdmin.email)
    await page.goto('/admin/teilnehmer')
    await page.getByRole('button', { name: 'Teilnehmer einladen' }).click()
    await fillField(page, 'E-Mail', inviteEmail('noname'))
    await page.getByRole('button', { name: 'Einladen' }).click()
    await expect(page.getByText('Einladung verschickt.')).toBeVisible()
    await expect(row(page, `${invitePrefix}noname`)).toBeVisible()
  })

  test('schon vorhandene E-Mail → „schon in der Runde"', async ({ page }) => {
    await login(page, seedAdmin.email)
    await page.goto('/admin/teilnehmer')
    await page.getByRole('button', { name: 'Teilnehmer einladen' }).click()
    await fillField(page, 'E-Mail', seedMember.email)
    await page.getByRole('button', { name: 'Einladen' }).click()
    await expect(page.getByText('Diese Person ist schon in der Runde.')).toBeVisible()
  })

  test('ungültige E-Mail → Validierungsmeldung, kein Absenden', async ({ page }) => {
    await login(page, seedAdmin.email)
    await page.goto('/admin/teilnehmer')
    await page.getByRole('button', { name: 'Teilnehmer einladen' }).click()
    await fillField(page, 'E-Mail', 'keine-email')
    await page.getByRole('button', { name: 'Einladen' }).click()
    await expect(page.getByText('Keine gültige E-Mail-Adresse')).toBeVisible()
  })
})

// --- Deaktivieren / Reaktivieren / Rollen ------------------------------
test.describe('Aktionen an Wegwerf-Teilnehmern', () => {
  test.skip(!hasServiceClient, 'Service-Client nötig')

  test('deaktivieren (mit Bestätigung) und wieder reaktivieren', async ({ page }) => {
    const u = await createDisposableUser('deakt', { active: true })
    await signInOnce(u.email)
    try {
      await login(page, seedAdmin.email)
      await page.goto('/admin/teilnehmer')
      await openRowMenu(page, 'QA deakt')
      await page.getByRole('menuitem', { name: 'Deaktivieren' }).click()

      const dialog = page.getByRole('alertdialog')
      await expect(dialog).toContainText('kann sich nicht mehr anmelden')
      await dialog.getByRole('button', { name: 'Deaktivieren' }).click()

      await expect(page.getByText('Teilnehmer deaktiviert.')).toBeVisible()
      await expect(row(page, 'QA deakt').getByText('Deaktiviert')).toBeVisible()

      await openRowMenu(page, 'QA deakt')
      await page.getByRole('menuitem', { name: 'Reaktivieren' }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Reaktivieren' }).click()
      await expect(page.getByText('Teilnehmer reaktiviert.')).toBeVisible()
      await expect(row(page, 'QA deakt').getByText('Aktiv')).toBeVisible()
    } finally {
      await deleteUser(u.id)
    }
  })

  test('Gastgeber eines nicht abgeschlossenen Events lässt sich nicht deaktivieren', async ({
    page,
  }) => {
    const host = await createDisposableUser('gastg', { active: true })
    await signInOnce(host.email)
    const svc = serviceClient()
    // Admin-RPC braucht eine Admin-Session; hier direkt per Service-Client anlegen.
    const { data: adminProfile } = await svc
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()
    const { data: ev } = await svc
      .from('tasting_events')
      .insert({
        event_date: '2026-12-01',
        location: 'QA',
        host_id: host.id,
        created_by: adminProfile!.id,
      })
      .select('id')
      .single()
    try {
      await login(page, seedAdmin.email)
      await page.goto('/admin/teilnehmer')
      await openRowMenu(page, 'QA gastg')
      await page.getByRole('menuitem', { name: 'Deaktivieren' }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Deaktivieren' }).click()
      await expect(
        page.getByText(/Gastgeber oder Whisky-Steward eines Tastings, das noch nicht abgeschlossen ist/),
      ).toBeVisible()
      await expect(row(page, 'QA gastg').getByText('Aktiv')).toBeVisible()
    } finally {
      if (ev) await svc.from('tasting_events').delete().eq('id', ev.id)
      await deleteUser(host.id)
    }
  })

  test('„Eingeladen"-Teilnehmer: kein „Zum Admin machen"', async ({ page }) => {
    const u = await createDisposableUser('invited', { active: true }) // nie angemeldet
    try {
      await login(page, seedAdmin.email)
      await page.goto('/admin/teilnehmer')
      await openRowMenu(page, 'QA invited')
      await expect(page.getByRole('menuitem', { name: 'Zum Admin machen' })).toHaveCount(0)
      await expect(page.getByRole('menuitem', { name: 'Deaktivieren' })).toBeVisible()
    } finally {
      await deleteUser(u.id)
    }
  })

  test('befördern und wieder degradieren', async ({ page }) => {
    // Testkonten können keine Admins werden (PROJ-26) → bewusst normales Mitglied.
    const u = await createDisposableUser('promo', { active: true, test: false })
    await signInOnce(u.email)
    try {
      await login(page, seedAdmin.email)
      await page.goto('/admin/teilnehmer')

      await openRowMenu(page, 'QA promo')
      await page.getByRole('menuitem', { name: 'Zum Admin machen' }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Zum Admin machen' }).click()
      await expect(page.getByText('Ist jetzt Admin.')).toBeVisible()
      await expect(row(page, 'QA promo').getByText('Admin', { exact: true })).toBeVisible()

      await openRowMenu(page, 'QA promo')
      await page.getByRole('menuitem', { name: 'Admin-Rechte entziehen' }).click()
      await page
        .getByRole('alertdialog')
        .getByRole('button', { name: 'Rechte entziehen' })
        .click()
      await expect(page.getByText('Admin-Rechte entzogen.')).toBeVisible()
      await expect(row(page, 'QA promo').getByText('Admin', { exact: true })).toHaveCount(0)
    } finally {
      await setRole(u.id, 'teilnehmer').catch(() => {})
      await deleteUser(u.id)
    }
  })
})
