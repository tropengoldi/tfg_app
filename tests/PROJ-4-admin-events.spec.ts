import { addDays, format } from 'date-fns'
import { expect, test } from '@playwright/test'

import {
  ADMIN_EMAIL,
  addWhiskyAs,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  fillField,
  hasServiceClient,
  login,
  serviceClient,
  TEST_EMAIL,
} from './helpers/auth'

const STAMP = Date.now()
const LOC = (tag: string) => `QA4-${STAMP}-${tag}`
const FUTURE = format(addDays(new Date(), 21), 'yyyy-MM-dd')
// Pro Worker ein eindeutiger Gastgebername (STAMP allein kann zwischen parallel
// startenden Projekt-Workern auf dieselbe Millisekunde fallen → zwei „QA ev…"-
// Profile mit gleichem Anzeigenamen → mehrdeutige Select-Option).
const MEMBER_TAG = `ev${STAMP}p${process.pid}`
const MEMBER_NAME = `QA ${MEMBER_TAG}`

test.describe.configure({ mode: 'serial' })

let adminId = ''
let member: { id: string; email: string }

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id
  member = await createDisposableUser(MEMBER_TAG, { active: true })
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await deleteEventsByLocationPrefix(`QA4-${STAMP}-`)
  if (member) await deleteUser(member.id)
})

// Öffnet eine Formularseite und wartet, bis die Hydration wirklich durch ist.
// (Das Event-Formular re-rendert nach der Navigation kurz clientseitig neu –
//  siehe QA-Bug „doppelte Formularfelder"; ohne Settle racet der erste Klick
//  gegen das kurzzeitige Doppel-DOM.)
async function gotoForm(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Tasting anlegen|Änderungen speichern/ }).waitFor()
  await expect(page.getByLabel('Ort')).toHaveCount(1)
}

// Wählt im Kalender den letzten wählbaren Tag des angezeigten Monats
// (immer >= heute, weil Vergangenheitstage gesperrt sind).
async function pickFutureDate(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Datum', exact: true }).click()
  const dayButtons = await page.getByRole('gridcell').getByRole('button').all()
  for (let i = dayButtons.length - 1; i >= 0; i--) {
    if (await dayButtons[i].isEnabled()) {
      await dayButtons[i].click()
      return
    }
  }
  throw new Error('Kein wählbarer Tag im Kalender gefunden')
}

// ===========================================================================
test('Teilnehmer: /admin/events liefert „Seite nicht gefunden"', async ({ page }) => {
  await login(page, TEST_EMAIL)
  await page.goto('/admin/events')
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

test('Admin sieht die Liste mit „Tasting anlegen"', async ({ page }) => {
  await login(page, ADMIN_EMAIL)
  await page.goto('/admin/events')
  await expect(
    page.getByRole('link', { name: /Tasting anlegen|Erstes Tasting anlegen/ }),
  ).toBeVisible()
})

test.describe('Anlegen & Bearbeiten', () => {
  test.skip(!hasServiceClient, 'Service-Client nötig')

  test('Pflichtfelder: leeres Formular zeigt Validierungsmeldungen', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, '/admin/events/neu')
    await page.getByRole('button', { name: 'Tasting anlegen' }).click()
    await expect(page.getByText('Datum ist erforderlich')).toBeVisible()
    await expect(page.getByText('Ort ist erforderlich')).toBeVisible()
    await expect(page.getByText('Gastgeber ist erforderlich')).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/events\/neu/)
  })

  test('Kalender sperrt Tage in der Vergangenheit', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, '/admin/events/neu')
    await page.getByRole('button', { name: 'Datum', exact: true }).click()
    // react-day-picker benennt die Zellen per aria-label „… August 28th, 2026".
    const dayLabel = (d: Date) => format(d, 'MMMM do, yyyy')
    const yesterdayCell = page.getByRole('gridcell', {
      name: new RegExp(dayLabel(addDays(new Date(), -1))),
    })
    // Nur relevant, wenn „gestern" im aktuell gezeigten Monat sichtbar ist.
    if (await yesterdayCell.count()) {
      await expect(yesterdayCell.getByRole('button')).toBeDisabled()
    }
    // Gegenprobe: „heute" ist wählbar.
    await expect(
      page
        .getByRole('gridcell', { name: new RegExp(dayLabel(new Date())) })
        .getByRole('button'),
    ).toBeEnabled()
  })

  test('Limit außerhalb 1–10 wird abgelehnt', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, '/admin/events/neu')
    await fillField(page, 'Max. Whiskies pro Person', '11')
    await page.getByRole('button', { name: 'Tasting anlegen' }).click()
    await expect(page.getByText('Zwischen 1 und 10')).toBeVisible()
  })

  test('anlegen (Draft) → erscheint in der Liste', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, '/admin/events/neu')
    await pickFutureDate(page)
    await fillField(page, 'Ort', LOC('create'))
    // Gastgeber wählen
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: MEMBER_NAME }).click()

    await page.getByRole('button', { name: 'Tasting anlegen' }).click()
    await page.waitForURL(/\/admin\/events$/)
    const row = page.getByRole('listitem').filter({ hasText: LOC('create') })
    await expect(row).toBeVisible()
    await expect(row.getByText('In Vorbereitung')).toBeVisible()
    await expect(row.getByText(MEMBER_NAME)).toBeVisible()
  })

  test('Teilnehmer-Picker: der Gastgeber ist gesetzt und gesperrt', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, '/admin/events/neu')
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: MEMBER_NAME }).click()
    const hostCheckbox = page
      .getByRole('listitem')
      .filter({ hasText: MEMBER_NAME })
      .getByRole('checkbox')
    await expect(hostCheckbox).toBeChecked()
    await expect(hostCheckbox).toBeDisabled()
  })

  test('Draft bearbeiten: Ort ändern', async ({ page }) => {
    const evId = await createEventDirect({
      hostId: member.id,
      createdBy: adminId,
      location: LOC('edit'),
      eventDate: FUTURE,
    })
    await login(page, ADMIN_EMAIL)
    await gotoForm(page, `/admin/events/${evId}`)
    await fillField(page, 'Ort', LOC('edit-neu'))
    await page.getByRole('button', { name: 'Änderungen speichern' }).click()
    await page.waitForURL(/\/admin\/events$/)
    await expect(
      page.getByRole('listitem').filter({ hasText: LOC('edit-neu') }),
    ).toBeVisible()
  })

  test('abgeschlossenes Event: keine Aktionen, Bearbeiten-Seite leitet zurück', async ({
    page,
  }) => {
    const evId = await createEventDirect({
      hostId: member.id,
      createdBy: adminId,
      location: LOC('closed'),
      eventDate: FUTURE,
      status: 'closed',
    })
    await login(page, ADMIN_EMAIL)
    await page.goto('/admin/events')
    const row = page.getByRole('listitem').filter({ hasText: LOC('closed') })
    await expect(row.getByText('Abgeschlossen')).toBeVisible()
    await expect(row.getByRole('button', { name: /Aktionen/ })).toHaveCount(0)

    await page.goto(`/admin/events/${evId}`)
    await expect(page).toHaveURL(/\/admin\/events$/)
  })
})

test.describe('Löschen', () => {
  test.skip(!hasServiceClient, 'Service-Client nötig')

  test('Draft ohne Whiskies löschen (mit Bestätigung)', async ({ page }) => {
    const evId = await createEventDirect({
      hostId: member.id,
      createdBy: adminId,
      location: LOC('del-ok'),
      eventDate: FUTURE,
    })
    void evId
    await login(page, ADMIN_EMAIL)
    await page.goto('/admin/events')
    const row = page.getByRole('listitem').filter({ hasText: LOC('del-ok') })
    await row.getByRole('button', { name: /Aktionen/ }).click()
    await page.getByRole('menuitem', { name: 'Löschen' }).click()

    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('endgültig')
    await dialog.getByRole('button', { name: 'Löschen' }).click()

    await expect(page.getByText('Tasting gelöscht.')).toBeVisible()
    await expect(
      page.getByRole('listitem').filter({ hasText: LOC('del-ok') }),
    ).toHaveCount(0)
  })

  test('Draft mit Whisky: Löschen wird abgelehnt', async ({ page }) => {
    const evId = await createEventDirect({
      hostId: member.id,
      createdBy: adminId,
      location: LOC('del-whisky'),
      eventDate: FUTURE,
    })
    await addWhiskyAs(member.email, evId, 'Sperr-Dram')

    await login(page, ADMIN_EMAIL)
    await page.goto('/admin/events')
    const row = page.getByRole('listitem').filter({ hasText: LOC('del-whisky') })
    await row.getByRole('button', { name: /Aktionen/ }).click()
    await page.getByRole('menuitem', { name: 'Löschen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Löschen' }).click()

    await expect(page.getByText(/hängen bereits Whiskies/)).toBeVisible()
    await expect(
      page.getByRole('listitem').filter({ hasText: LOC('del-whisky') }),
    ).toBeVisible()
  })
})
