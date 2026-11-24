/**
 * PROJ-30 · Feedback-Formular (Fehler & Wünsche) — E2E.
 *
 * Der Versand läuft im Trockenlauf (FEEDBACK_DRY_RUN=1, gesetzt vom
 * Playwright-Webserver) — es geht keine echte Mail raus. Betreff/Inhalt der
 * Mail prüfen die Unit-Tests (src/lib/feedback-mail.test.ts), das Stundenlimit
 * zusätzlich der Integrationstest (feedback.integration.test.ts).
 *
 * Jeder Test nutzt ein eigenes Wegwerf-Konto (das Limit gilt pro Person).
 */
import { expect, test, type Page } from '@playwright/test'

import { createDisposableUser, deleteUser, hasServiceClient, login, setActive } from './helpers/auth'

test.skip(!hasServiceClient, 'Service-Client nötig')

const DONE = 'Danke! Deine Nachricht ist beim Admin angekommen.'

async function withUser(tag: string, fn: (u: { id: string; email: string }) => Promise<void>) {
  const u = await createDisposableUser(`p30${tag}${Date.now()}`)
  try {
    await fn(u)
  } finally {
    await deleteUser(u.id)
  }
}

async function openForm(page: Page, email: string) {
  await login(page, email)
  await page.goto('/feedback?von=/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1, name: 'Fehler & Wünsche' })).toBeVisible()
}

async function fillValid(page: Page, text = 'Testlauf: der Knopf reagiert nicht.') {
  await page.getByText('Fehler', { exact: true }).click()
  await page.getByLabel('Beschreibung').fill(text)
}

test('Startseite: dezenter Link führt zum Formular', async ({ page }) => {
  await withUser('link', async (u) => {
    await login(page, u.email)
    const nav = page.getByRole('navigation', { name: 'Rund um die App' })
    await expect(nav.getByRole('link', { name: /Was gibt.s Neues in Whizzky/ })).toBeVisible()
    await nav.getByRole('link', { name: 'Fehler gefunden oder eine Idee?' }).click()
    await page.waitForURL((url) => new URL(url).pathname === '/feedback')
    await expect(page.getByRole('heading', { level: 1, name: 'Fehler & Wünsche' })).toBeVisible()
  })
})

test('ohne Anmeldung: /feedback leitet zur Anmeldung um', async ({ page }) => {
  await page.goto('/feedback')
  await page.waitForURL((u) => new URL(u).pathname === '/login')
})

test('Formular: Art-Auswahl ohne Vorauswahl, Platzhalter je Art, Hinweis auf mitgeschickte Angaben', async ({ page }) => {
  await withUser('form', async (u) => {
    await openForm(page, u.email)
    for (const name of ['Fehler', 'Wunsch', 'Sonstiges']) {
      await expect(page.getByRole('radio', { name })).not.toBeChecked()
    }
    const text = page.getByLabel('Beschreibung')
    await page.getByText('Fehler', { exact: true }).click()
    await expect(page.getByRole('radio', { name: 'Fehler' })).toBeChecked()
    await expect(text).toHaveAttribute('placeholder', /Was hast du gemacht/)
    await page.getByText('Wunsch', { exact: true }).click()
    await expect(text).toHaveAttribute('placeholder', /Was würdest du dir wünschen/)
    await expect(page.getByText(/mit deinem Namen und deiner E-Mail-Adresse an den Admin/)).toBeVisible()
    await expect(page.getByText('0 / 2000')).toBeVisible()
  })
})

test('Validierung: ohne Art und mit zu kurzem Text → Hinweise an den Feldern, nichts gesendet', async ({ page }) => {
  await withUser('val', async (u) => {
    await openForm(page, u.email)
    await page.getByLabel('Beschreibung').fill('   kurz    ')
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByText('Bitte wähle aus, worum es geht.')).toBeVisible()
    await expect(page.getByText('Bitte mindestens 10 Zeichen.')).toBeVisible()
    await expect(page.getByText(DONE)).toHaveCount(0)
  })
})

test('über 2000 Zeichen: Zähler warnt, Absenden gesperrt', async ({ page }) => {
  await withUser('long', async (u) => {
    await openForm(page, u.email)
    await page.getByText('Sonstiges', { exact: true }).click()
    await page.getByLabel('Beschreibung').fill('x'.repeat(2001))
    await expect(page.getByText('2001 / 2000')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Absenden' })).toBeDisabled()
    await page.getByLabel('Beschreibung').fill('x'.repeat(2000))
    await expect(page.getByRole('button', { name: 'Absenden' })).toBeEnabled()
  })
})

test('Erfolg: Bestätigung, Formular geleert, Weg zurück zur Startseite', async ({ page }) => {
  await withUser('ok', async (u) => {
    await openForm(page, u.email)
    await fillValid(page, '<script>alert(1)</script> Umlaute äöü und 🥃 bleiben')
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByRole('status').filter({ hasText: DONE })).toBeVisible({ timeout: 30_000 })

    await page.getByRole('button', { name: 'Noch etwas melden' }).click()
    await expect(page.getByLabel('Beschreibung')).toHaveValue('')
    await expect(page.getByRole('radio', { name: 'Fehler' })).not.toBeChecked()

    await fillValid(page)
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByText(DONE)).toBeVisible({ timeout: 30_000 })
    await page.getByRole('link', { name: 'Zur Startseite' }).click()
    await page.waitForURL((url) => new URL(url).pathname === '/')
  })
})

test('Doppelklick auf Absenden: nur eine Einreichung', async ({ page }) => {
  await withUser('dbl', async (u) => {
    await openForm(page, u.email)
    let posts = 0
    page.on('request', (r) => {
      if (r.method() === 'POST' && new URL(r.url()).pathname === '/feedback') posts++
    })
    await fillValid(page)
    await page.getByRole('button', { name: 'Absenden' }).dblclick()
    await expect(page.getByText(DONE)).toBeVisible({ timeout: 30_000 })
    expect(posts).toBe(1)
  })
})

test('Netzwerkfehler: Meldung, Eingaben bleiben, kein Absturz', async ({ page }) => {
  await withUser('net', async (u) => {
    await openForm(page, u.email)
    await fillValid(page, 'Dieser Text darf nicht verloren gehen.')
    await page.route('**/feedback**', (route) =>
      route.request().method() === 'POST' ? route.abort() : route.continue(),
    )
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByText('Keine Verbindung – bitte versuch es gleich noch einmal.')).toBeVisible()
    await expect(page.getByLabel('Beschreibung')).toHaveValue('Dieser Text darf nicht verloren gehen.')
    await expect(page.getByRole('radio', { name: 'Fehler' })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Absenden' })).toBeEnabled()
  })
})

test('Stundenlimit: die 6. Nachricht wird abgelehnt, der Text bleibt', async ({ page }) => {
  test.setTimeout(120_000)
  await withUser('rate', async (u) => {
    await openForm(page, u.email)
    for (let i = 1; i <= 5; i++) {
      await fillValid(page, `Limit-Test Nummer ${i} von fünf`)
      await page.getByRole('button', { name: 'Absenden' }).click()
      await expect(page.getByText(DONE)).toBeVisible({ timeout: 30_000 })
      await page.getByRole('button', { name: 'Noch etwas melden' }).click()
    }
    await fillValid(page, 'Die sechste Nachricht in dieser Stunde')
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(
      page.getByText('Du hast gerade viele Nachrichten geschickt – bitte versuch es später noch einmal.'),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByLabel('Beschreibung')).toHaveValue('Die sechste Nachricht in dieser Stunde')
  })
})

test('Konto während des Ausfüllens deaktiviert → kein Versand', async ({ page }) => {
  await withUser('inact', async (u) => {
    await openForm(page, u.email)
    await fillValid(page)
    await setActive(u.id, false)
    await page.getByRole('button', { name: 'Absenden' }).click()
    await expect(page.getByText('Dazu fehlt dir die Berechtigung.')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(DONE)).toHaveCount(0)
  })
})

test('Sitzung weg (Cookies gelöscht) → kein Versand, Fehlermeldung, Text bleibt', async ({ page }) => {
  await withUser('nosess', async (u) => {
    await openForm(page, u.email)
    await fillValid(page)
    await page.context().clearCookies()
    await page.getByRole('button', { name: 'Absenden' }).click()
    // Die Middleware leitet den Aufruf ohne Sitzung zur Anmeldung um, bevor die
    // Aktion läuft — das Formular zeigt dann die allgemeine Verbindungsmeldung
    // (PROJ-30 BUG-1, Low: besser wäre „Bitte melde dich neu an.").
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(DONE)).toHaveCount(0)
    await expect(page.getByLabel('Beschreibung')).toHaveValue('Testlauf: der Knopf reagiert nicht.')
  })
})

for (const width of [360, 768, 1440]) {
  test(`${width} px: kein horizontales Scrollen`, async ({ page }) => {
    await withUser(`w${width}`, async (u) => {
      await page.setViewportSize({ width, height: 900 })
      await openForm(page, u.email)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  })
}
