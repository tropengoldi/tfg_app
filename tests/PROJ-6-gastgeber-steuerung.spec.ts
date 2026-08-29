import { expect, test, type Page } from '@playwright/test'

import {
  ADMIN_EMAIL,
  addParticipant,
  addWhiskyAs,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  fillField,
  closeAllActiveEvents,
  hasServiceClient,
  login,
  logout,
  serviceClient,
  startEventDirect,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA6-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
let member: { id: string; email: string }
let other: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  member = await createDisposableUser(`w6m${STAMP}`, { active: true })
  other = await createDisposableUser(`w6o${STAMP}`, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA6-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (other) await deleteUser(other.id)
})

async function draftEvent(tag: string, whiskyNames: string[] = []) {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC(tag),
  })
  for (const name of whiskyNames) await addWhiskyAs(member.email, evId, name)
  return evId
}

async function openGastgeber(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/gastgeber`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Steuern' }).waitFor()
  // Die Steuer-Blöcke re-rendern nach der Navigation kurz clientseitig neu
  // (Hydration); ohne Settle racen Interaktionen gegen ein transientes Doppel-DOM.
  await page.getByText('Eckdaten', { exact: true }).first().waitFor()
  await page.waitForTimeout(800)
}

function orderNames(page: Page) {
  return page.getByRole('list', { name: 'Ausschankreihenfolge' }).getByRole('listitem')
}

// ===========================================================================
test('„Steuern" erscheint nur beim Gastgeber', async ({ page }) => {
  const evId = await draftEvent('steuern')
  await addParticipant(evId, other.id)

  await login(page, member.email)
  await page.goto('/tastings')
  const hostRow = page.getByRole('listitem').filter({ hasText: LOC('steuern') })
  await expect(hostRow.getByRole('link', { name: 'Steuern', exact: true })).toBeVisible()

  await logout(page)
  await login(page, other.email)
  await page.goto('/tastings')
  const guestRow = page.getByRole('listitem').filter({ hasText: LOC('steuern') })
  await expect(guestRow).toBeVisible()
  await expect(guestRow.getByRole('link', { name: 'Steuern', exact: true })).toHaveCount(0)
})

test('Nicht-Gastgeber bekommt „Seite nicht gefunden"', async ({ page }) => {
  const evId = await draftEvent('forbidden')
  await addParticipant(evId, other.id)
  await login(page, other.email)
  await page.goto(`/tastings/${evId}/gastgeber`)
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Admin kann die Steuer-Seite öffnen', async ({ page }) => {
  const evId = await draftEvent('admin', [`Adm-${STAMP}`])
  await login(page, ADMIN_EMAIL)
  await openGastgeber(page, evId)
  // Der Admin sieht dieselben Steuer-Blöcke (Reihenfolge + Start), obwohl er
  // nicht Teilnehmer ist.
  await expect(page.getByRole('list', { name: 'Ausschankreihenfolge' }).first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.getByRole('button', { name: 'Tasting starten' }).first(),
  ).toBeVisible({ timeout: 15_000 })
})

test('Abgeschlossenes Event: Platzhalter, keine Steuer-Aktionen', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('closed'),
    status: 'closed',
  })
  await login(page, member.email)
  await openGastgeber(page, evId)
  await expect(page.getByText('Der Abend ist abgeschlossen.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tasting starten' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Weiter zu Whisky/ })).toHaveCount(0)
})

// Die schreibenden Fälle laufen auf Chromium: Server-Action-POSTs sind im
// Playwright-WebKit unter Parallel-Last sporadisch instabil (Harness-Eigenheit,
// kein Produktfehler). Rendering/Zugang decken die übrigen Tests auf WebKit ab.
test('Eckdaten speichern und beim erneuten Laden vorhanden', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'schreibender Fall → nur Chromium')
  const evId = await draftEvent('eckdaten')
  const theme = `Islay-${STAMP}`
  await login(page, member.email)
  await openGastgeber(page, evId)
  await fillField(page, 'Thema (optional)', theme)
  await page.getByRole('button', { name: 'Eckdaten speichern' }).click()
  // Der Erfolgs-Toast bestätigt, dass die Server-Aktion durch ist — erst danach
  // neu laden (sonst bricht die Navigation den laufenden POST ab).
  await expect(page.getByText('Eckdaten gespeichert.')).toBeVisible({ timeout: 15_000 })

  await openGastgeber(page, evId)
  await expect(page.getByLabel('Thema (optional)')).toHaveValue(theme, { timeout: 15_000 })
})

test('Kein Whisky: „Tasting starten" ist deaktiviert', async ({ page }) => {
  const evId = await draftEvent('leer')
  await login(page, member.email)
  await openGastgeber(page, evId)
  await expect(page.getByText('Es ist noch kein Whisky eingetragen.').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tasting starten' })).toBeDisabled()
})

test('Reihenfolge umsortieren und speichern', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'schreibender Fall → nur Chromium')
  const evId = await draftEvent('order', [
    `A-${STAMP}`,
    `B-${STAMP}`,
    `C-${STAMP}`,
  ])
  await login(page, member.email)
  await openGastgeber(page, evId)

  await expect(orderNames(page).first()).toContainText(`A-${STAMP}`)
  // A eine Position nach unten
  await orderNames(page)
    .first()
    .getByRole('button', { name: /nach unten/ })
    .click()
  await expect(orderNames(page).nth(1)).toContainText(`A-${STAMP}`)

  const saveOrderBtn = page.getByRole('button', { name: 'Reihenfolge speichern' })
  await expect(saveOrderBtn).toBeVisible()
  await saveOrderBtn.click()
  // Auf den Erfolgs-Toast warten, bevor neu geladen wird — sonst bricht die
  // Navigation den Server-Action-POST ab und die Reihenfolge wird nicht persistiert.
  await expect(page.getByText('Reihenfolge gespeichert.')).toBeVisible({ timeout: 15_000 })

  await openGastgeber(page, evId)
  await expect(orderNames(page).nth(1)).toContainText(`A-${STAMP}`, { timeout: 15_000 })
})

test('„Zufällig mischen" macht die Reihenfolge speicherbar', async ({ page }) => {
  const evId = await draftEvent('shuffle', [
    `S1-${STAMP}`,
    `S2-${STAMP}`,
    `S3-${STAMP}`,
    `S4-${STAMP}`,
    `S5-${STAMP}`,
  ])
  await login(page, member.email)
  await openGastgeber(page, evId)

  // „Zufällig mischen" ordnet 5 Einträge um → die Reihenfolge wird speicherbar.
  // Zweimal klicken macht eine (statistisch praktisch ausgeschlossene) Identität
  // unwahrscheinlicher.
  const shuffle = page.getByRole('button', { name: 'Zufällig mischen' })
  await shuffle.click()
  await shuffle.click()
  await expect(
    page.getByRole('button', { name: 'Reihenfolge speichern' }),
  ).toBeVisible({ timeout: 10_000 })
})

test.describe('Ablauf (läuft)', () => {
  // Global darf nur EIN Event aktiv sein — die parallel laufenden Projekt-Worker
  // würden sich sonst gegenseitig das aktive Event wegschliessen.
  test.skip(({ browserName }) => browserName === 'webkit', 'ein globales aktives Event → nur Chromium')
  // Mehrere Server-Action-Roundtrips pro Test; unter der vollen Parallel-Last
  // (alle Specs, 2 Worker, geteilter prod-Server) einen Retry mehr spendieren.
  test.describe.configure({ retries: 2 })

  // Ein evtl. verwaistes aktives Event (Seed / früherer Lauf) blockiert sonst
  // jeden Start mit „Es läuft bereits ein anderes Tasting".
  test.beforeAll(async () => {
    if (hasServiceClient) await closeAllActiveEvents()
  })

  test('Tasting starten → Lauf-Ansicht', async ({ page }) => {
    const evId = await draftEvent('start', [`P1-${STAMP}`, `P2-${STAMP}`])
    await login(page, member.email)
    await openGastgeber(page, evId)
    await Promise.all([
      page.waitForResponse(
        (r) => r.request().method() === 'POST' && r.url().includes('/gastgeber'),
        { timeout: 15_000 },
      ),
      page.getByRole('button', { name: 'Tasting starten' }).click(),
    ])
    await openGastgeber(page, evId)
    await expect(page.getByText('Whisky 1 von 2')).toBeVisible({ timeout: 15_000 })
  })

  test('Läuft: Reihenfolge ist nur Anzeige', async ({ page }) => {
    const evId = await draftEvent('ro', [`R1-${STAMP}`, `R2-${STAMP}`])
    await startEventDirect(evId, 1)
    await login(page, member.email)
    await openGastgeber(page, evId)
    await expect(orderNames(page)).toHaveCount(2)
    await expect(page.getByRole('button', { name: 'Zufällig mischen' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /nach oben/ })).toHaveCount(0)
  })

  test('Läuft: Bewertungsstand + Weiter zu Whisky 2', async ({ page }) => {
    const evId = await draftEvent('next', [`N1-${STAMP}`, `N2-${STAMP}`])
    await startEventDirect(evId, 1)
    await login(page, member.email)
    await openGastgeber(page, evId)

    await expect(page.getByText(/\d+ von \d+ haben bewertet/)).toBeVisible()
    // Auf den Abschluss des Server-Action-POST warten, dann frisch laden
    // (zuverlässiger als der In-Place-Refresh unter Parallel-Last).
    await Promise.all([
      page.waitForResponse(
        (r) => r.request().method() === 'POST' && r.url().includes('/gastgeber'),
        { timeout: 15_000 },
      ),
      page.getByRole('button', { name: /Weiter zu Whisky 2 von 2/ }).click(),
    ])
    await openGastgeber(page, evId)
    await expect(page.getByText('Whisky 2 von 2')).toBeVisible({ timeout: 15_000 })
    // letzter Whisky → „Tasting abschließen" ist jetzt die Hauptaktion
    await expect(page.getByRole('button', { name: /Weiter zu Whisky/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Tasting abschließen' })).toBeVisible()
  })

  test('Abschließen mit Bestätigung → Platzhalter', async ({ page }) => {
    const evId = await draftEvent('close', [`X1-${STAMP}`, `X2-${STAMP}`])
    await startEventDirect(evId, 2)
    await login(page, member.email)
    await openGastgeber(page, evId)

    await page.getByRole('button', { name: 'Tasting abschließen' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('rückgängig')
    await dialog.getByRole('button', { name: 'Abschließen' }).click()

    await expect(page.getByText('Der Abend ist abgeschlossen.', { exact: false })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('Vorzeitiger Abschluss mitten im Ablauf', async ({ page }) => {
    const evId = await draftEvent('early', [
      `E1-${STAMP}`,
      `E2-${STAMP}`,
      `E3-${STAMP}`,
    ])
    await startEventDirect(evId, 1)
    await login(page, member.email)
    await openGastgeber(page, evId)

    await page.getByRole('button', { name: 'Tasting abschließen' }).click()
    const dialog = page.getByRole('alertdialog')
    await dialog.getByRole('button', { name: 'Abschließen' }).click()
    await expect(page.getByText('Der Abend ist abgeschlossen.', { exact: false })).toBeVisible({
      timeout: 15_000,
    })
  })
})
