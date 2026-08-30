import { expect, test, type Page } from '@playwright/test'

import {
  addParticipant,
  addWhiskyAs,
  closeAllActiveEvents,
  createDisposableUser,
  createEventDirect,
  deleteEventsByLocationPrefix,
  deleteUser,
  hasServiceClient,
  insertRatingDirect,
  login,
  serviceClient,
  whiskyIdsByPosition,
} from './helpers/auth'

const STAMP = `${Date.now()}p${process.pid}`
const LOC = (tag: string) => `QA9-${STAMP}-${tag}`

test.describe.configure({ mode: 'serial' })
test.skip(!hasServiceClient, 'Service-Client nötig')
test.beforeEach(() => test.setTimeout(90_000))

let adminId = ''
let member: { id: string; email: string }
let other: { id: string; email: string }
/** Aktives Mitglied, das an KEINEM der Test-Events teilnimmt. */
let bystander: { id: string; email: string }

/** Das reich bestückte, abgeschlossene Haupt-Event (Kopf, Rangliste, Notizen, Video). */
let mainId = ''

async function closeEvent(eventId: string, theme?: string) {
  // events_status_timestamps verlangt bei 'closed' auch started_at ≠ null —
  // createEventDirect legt Entwürfe ohne started_at an, also hier mitsetzen.
  const { error } = await serviceClient()
    .from('tasting_events')
    .update({
      status: 'closed',
      started_at: new Date(Date.now() - 3_600_000).toISOString(),
      closed_at: new Date().toISOString(),
      ...(theme ? { theme } : {}),
    })
    .eq('id', eventId)
  if (error) throw error
}

test.beforeAll(async () => {
  if (!hasServiceClient) return
  const { data } = await serviceClient()
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()
  adminId = data!.id

  member = await createDisposableUser(`r9m${STAMP}`, { active: true })
  other = await createDisposableUser(`r9o${STAMP}`, { active: true })
  bystander = await createDisposableUser(`r9b${STAMP}`, { active: true })

  // --- Haupt-Event: 2 Whiskys, je 2 Bewertungen, Video auf #1, Notizen ---
  mainId = await createEventDirect({
    hostId: member.id,
    createdBy: adminId,
    location: LOC('main'),
    eventDate: '2025-06-14',
  })
  await addParticipant(mainId, other.id)
  await addWhiskyAs(member.email, mainId, 'Ardbeg Uigeadail')
  await addWhiskyAs(other.email, mainId, 'Lagavulin 16')
  const w = await whiskyIdsByPosition(mainId)
  await insertRatingDirect({
    whiskyId: w[0], eventId: mainId, profileId: member.id,
    nose: 5, taste: 9, notes: 'Rauch, Teer, dunkle Schokolade',
  })
  await insertRatingDirect({
    whiskyId: w[0], eventId: mainId, profileId: other.id,
    nose: 4, taste: 8, notes: 'GEHEIME NOTIZ VON OTHER',
  })
  await insertRatingDirect({ whiskyId: w[1], eventId: mainId, profileId: member.id, nose: 3, taste: 6 })
  await insertRatingDirect({ whiskyId: w[1], eventId: mainId, profileId: other.id, nose: 3, taste: 5 })
  await serviceClient()
    .from('whisky_details')
    .update({ video_url: 'https://www.youtube.com/watch?v=proj9demo' })
    .eq('whisky_id', w[0])
  await closeEvent(mainId, 'Islay-Abend')
})

test.afterAll(async () => {
  if (!hasServiceClient) return
  await closeAllActiveEvents()
  await deleteEventsByLocationPrefix(`QA9-${STAMP}-`)
  if (member) await deleteUser(member.id)
  if (other) await deleteUser(other.id)
  if (bystander) await deleteUser(bystander.id)
})

async function openResults(page: Page, eventId: string) {
  await page.goto(`/tastings/${eventId}/ergebnisse`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)
}

function ranking(page: Page) {
  return page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem')
}

// ===========================================================================
// Historien-Liste
// ===========================================================================
test('Historie: ein aktives Mitglied ohne Teilnahme sieht den abgeschlossenen Abend mit Sieger und Link', async ({
  page,
}) => {
  await login(page, bystander.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  const list = page.getByRole('list', { name: 'Vergangene Tastings' })
  const row = list.getByRole('listitem').filter({ hasText: LOC('main') })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Ardbeg Uigeadail')
  await expect(row).toContainText('2025')

  await row.getByRole('link').first().click()
  await expect(page).toHaveURL(new RegExp(`/tastings/${mainId}/ergebnisse`))
})

test('Historie: abgeschlossener Abend ohne jede Bewertung zeigt „— kein Sieger“', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id, createdBy: adminId, location: LOC('nowinner'), eventDate: '2025-03-02',
  })
  await addWhiskyAs(member.email, evId, 'Glenfarclas 12')
  await closeEvent(evId)

  await login(page, member.email)
  await page.goto('/tastings', { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(400)

  const row = page
    .getByRole('list', { name: 'Vergangene Tastings' })
    .getByRole('listitem')
    .filter({ hasText: LOC('nowinner') })
  await expect(row).toContainText('kein Sieger')
})

// ===========================================================================
// Ergebnisseite — Zugang
// ===========================================================================
test('Ergebnis-Kopf: Datum/Ort, Thema, Status „Abgeschlossen“, Teilnehmerliste', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, mainId)

  await expect(page.getByText(LOC('main')).first()).toBeVisible()
  await expect(page.getByText('Islay-Abend')).toBeVisible()
  await expect(page.getByText('Abgeschlossen')).toBeVisible()
  await expect(page.getByText('Wer war dabei (2)')).toBeVisible()
})

test('Ergebnisseite eines noch laufenden (Entwurf-)Events zeigt nur den „läuft noch“-Hinweis', async ({
  page,
}) => {
  const draftId = await createEventDirect({
    hostId: member.id, createdBy: adminId, location: LOC('pending'),
  })

  await login(page, member.email)
  await openResults(page, draftId)

  await expect(page.getByText('Dieses Tasting läuft noch')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zum Dashboard' })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Rangliste' })).toHaveCount(0)
})

test('Unbekannte Event-ID → „Seite nicht gefunden“', async ({ page }) => {
  await login(page, member.email)
  await page.goto('/tastings/00000000-0000-0000-0000-000000000000/ergebnisse')
  await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
})

// ===========================================================================
// Ergebnisseite — Rangliste
// ===========================================================================
test('Rangliste: N Zeilen nach Rang, Sieger hervorgehoben, „mitgebracht von“', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, mainId)

  await expect(ranking(page)).toHaveCount(2)
  const first = ranking(page).first()
  await expect(first).toContainText('Ardbeg Uigeadail')
  await expect(first).toContainText('Sieger des Abends')
  await expect(first).toContainText('mitgebracht von')
  await expect(first).toContainText('26')
})

test('Rangliste: Ø-Zusatzzahl und „k von m Bewertungen“', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, mainId)

  const first = ranking(page).first()
  await expect(first).toContainText('Ø 13,0')
  await expect(first).toContainText('2 von 2 Bewertungen')
})

test('Rangliste: bei exakt gleicher Gesamtpunktzahl steht an beiden Zeilen „punktgleich“', async ({
  page,
}) => {
  const tieId = await createEventDirect({
    hostId: member.id, createdBy: adminId, location: LOC('tie'), eventDate: '2025-01-10',
  })
  await addParticipant(tieId, other.id)
  await addWhiskyAs(member.email, tieId, 'Springbank 10')
  await addWhiskyAs(other.email, tieId, 'Benromach 10')
  const tw = await whiskyIdsByPosition(tieId)
  // beide Whiskys landen bei Gesamt 20
  await insertRatingDirect({ whiskyId: tw[0], eventId: tieId, profileId: member.id, nose: 5, taste: 5 })
  await insertRatingDirect({ whiskyId: tw[0], eventId: tieId, profileId: other.id, nose: 5, taste: 5 })
  await insertRatingDirect({ whiskyId: tw[1], eventId: tieId, profileId: member.id, nose: 4, taste: 6 })
  await insertRatingDirect({ whiskyId: tw[1], eventId: tieId, profileId: other.id, nose: 4, taste: 6 })
  await closeEvent(tieId)

  await login(page, member.email)
  await openResults(page, tieId)

  await expect(page.getByText('punktgleich')).toHaveCount(2)
})

test('Abgeschlossenes Event ohne Bewertungen: Hinweis statt Rangliste, kein Sieger', async ({ page }) => {
  const evId = await createEventDirect({
    hostId: member.id, createdBy: adminId, location: LOC('empty'), eventDate: '2025-02-14',
  })
  await addWhiskyAs(member.email, evId, 'Oban 14')
  await addWhiskyAs(member.email, evId, 'Clynelish 14')
  await closeEvent(evId)

  await login(page, member.email)
  await openResults(page, evId)

  await expect(page.getByText('Für diesen Abend wurden keine Bewertungen abgegeben.')).toBeVisible()
  await expect(page.getByText('Sieger des Abends')).toHaveCount(0)
})

// ===========================================================================
// Ergebnisseite — Einzelbewertungen & Notizen
// ===========================================================================
test('Einzelbewertungen: aufklappen zeigt die Punkte je Person', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, mainId)

  const first = ranking(page).first()
  await first.getByRole('button', { name: /Einzelbewertungen/ }).click()
  await expect(first).toContainText('Nase 5 · Geschmack 9')
  await expect(first).toContainText('Nase 4 · Geschmack 8')
})

test('Notizen: die eigene ist sichtbar, die fremde nie', async ({ page }) => {
  // Als member
  await login(page, member.email)
  await openResults(page, mainId)
  await expect(page.getByText(/Deine Notiz:/)).toBeVisible()
  await expect(page.getByText('Rauch, Teer, dunkle Schokolade')).toBeVisible()
  await expect(page.getByText('GEHEIME NOTIZ VON OTHER')).toHaveCount(0)

  // Als other — sieht die EIGENE, nicht die von member
  await page.context().clearCookies()
  await login(page, other.email)
  await openResults(page, mainId)
  await expect(page.getByText('GEHEIME NOTIZ VON OTHER')).toBeVisible()
  await expect(page.getByText('Rauch, Teer, dunkle Schokolade')).toHaveCount(0)
})

// ===========================================================================
// Ergebnisseite — Video
// ===========================================================================
test('Video: „Video ansehen“ bei hinterlegtem Link, sonst „Auf Whisky.de suchen“', async ({ page }) => {
  await login(page, member.email)
  await openResults(page, mainId)

  const withVideo = ranking(page).first().getByRole('link', { name: /Video ansehen/ })
  await expect(withVideo).toHaveAttribute('href', 'https://www.youtube.com/watch?v=proj9demo')
  await expect(withVideo).toHaveAttribute('target', '_blank')
  await expect(withVideo).toHaveAttribute('rel', /noopener/)

  const withoutVideo = ranking(page).nth(1).getByRole('link', { name: /Auf Whisky\.de suchen/ })
  await expect(withoutVideo).toHaveAttribute(
    'href',
    /youtube\.com\/results\?search_query=Whisky\.de/,
  )
})

// ===========================================================================
// Absprünge
// ===========================================================================
test('Eingefrorene Bewertungsansicht: „Zu den Ergebnissen“ führt auf die Ergebnisseite', async ({
  page,
}) => {
  await login(page, member.email)
  await page.goto(`/tastings/${mainId}/bewerten`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Bewerten' }).waitFor()

  const link = page.getByRole('link', { name: 'Zu den Ergebnissen' })
  await expect(link).toHaveAttribute('href', `/tastings/${mainId}/ergebnisse`)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`/tastings/${mainId}/ergebnisse`))
})

test('Dashboard nach Abschluss: „Zur Rangliste“ führt auf die Ergebnisseite', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'Dashboard-Auswahl (limit 1) racet bei parallelen frisch geschlossenen Events')

  const dashId = await createEventDirect({
    hostId: member.id, createdBy: adminId, location: LOC('dash'), eventDate: '2025-05-05',
  })
  await addWhiskyAs(member.email, dashId, 'Talisker 10')
  await closeEvent(dashId)

  await login(page, member.email) // landet auf „/“ = Dashboard
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForTimeout(600)

  await expect(page.getByText('Der Abend ist abgeschlossen.')).toBeVisible()
  const link = page.getByRole('link', { name: 'Zur Rangliste' })
  await expect(link).toHaveAttribute('href', `/tastings/${dashId}/ergebnisse`)
})
