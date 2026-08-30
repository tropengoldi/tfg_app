import { expect, test } from '@playwright/test'

import {
  ADMIN_EMAIL,
  bottomNav,
  fillField,
  consumeAuthLink,
  createDisposableUser,
  deleteUser,
  disposableEmail,
  generateAuthLink,
  hasServiceClient,
  login,
  setActive,
  SEED_PASSWORD,
  TEST_EMAIL,
} from './helpers/auth'

// ===========================================================================
// Anmeldung
// ===========================================================================
test.describe('Anmeldung', () => {
  test('aktives Konto: Login führt auf die Startseite', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await expect(page.getByText(/Hallo,/)).toBeVisible()
  })

  test('Login mit gemerktem Zielpfad landet dort', async ({ page }) => {
    await page.goto('/tastings')
    await expect(page).toHaveURL(/\/login\?redirect=%2Ftastings/)
    await fillField(page, 'E-Mail', TEST_EMAIL)
    await fillField(page, 'Passwort', SEED_PASSWORD, true)
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await page.waitForURL((u) => new URL(u).pathname === '/tastings')
  })

  test('falsche Kombination: allgemeiner Fehler, E-Mail bleibt stehen', async ({ page }) => {
    await page.goto('/login')
    await fillField(page, 'E-Mail', TEST_EMAIL)
    await fillField(page, 'Passwort', 'falsch-falsch', true)
    await page.getByRole('button', { name: 'Anmelden' }).click()
    // Meldung erscheint sowohl als Alert als auch als Toast → .first()
    await expect(page.getByText('E-Mail oder Passwort stimmt nicht.').first()).toBeVisible()
    await expect(page.getByLabel('E-Mail')).toHaveValue(TEST_EMAIL)
    await expect(page).toHaveURL(/\/login/)
  })

  test('bereits angemeldet: /login leitet auf die Startseite', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await page.goto('/login')
    await page.waitForURL((u) => new URL(u).pathname === '/')
  })

  test('Passwort ein- und ausblenden über das Augensymbol', async ({ page }) => {
    await page.goto('/login')
    const pw = page.getByLabel('Passwort', { exact: true })
    await pw.fill('geheim123')
    await expect(pw).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Passwort anzeigen' }).click()
    await expect(pw).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Passwort verbergen' }).click()
    await expect(pw).toHaveAttribute('type', 'password')
  })

  test('leeres Formular: Validierungsmeldungen, kein Absenden', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await expect(page.getByText('E-Mail ist erforderlich')).toBeVisible()
    await expect(page.getByText('Passwort ist erforderlich')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})

// ===========================================================================
// Deaktivierte Konten
// ===========================================================================
test.describe('Deaktivierte Konten', () => {
  test.skip(!hasServiceClient, 'Service-Role-Client nötig')
  test.describe.configure({ mode: 'serial' })

  test('deaktiviert: Login wird abgewiesen und Session beendet', async ({ page }) => {
    const user = await createDisposableUser('deakt-login', { active: false })
    try {
      await page.goto('/login')
      await fillField(page, 'E-Mail', user.email)
      await fillField(page, 'Passwort', SEED_PASSWORD, true)
      await page.getByRole('button', { name: 'Anmelden' }).click()
      await expect(
        page
          .getByText('Dein Zugang wurde deaktiviert. Wende dich an den Admin.')
          .first(),
      ).toBeVisible()
      // Kein Zugriff auf geschützte Seiten:
      await page.goto('/')
      await expect(page).toHaveURL(/\/login/)
    } finally {
      await deleteUser(user.id)
    }
  })

  test('offene Session + nachträgliche Deaktivierung → beim Seitenaufruf raus', async ({
    page,
  }) => {
    const user = await createDisposableUser('deakt-session', { active: true })
    try {
      await login(page, user.email)
      await setActive(user.id, false)
      await page.goto('/profil')
      await expect(page).toHaveURL(/\/login\?reason=deactivated/)
      await expect(
        page.getByText('Dein Zugang wurde deaktiviert. Wende dich an den Admin.'),
      ).toBeVisible()
    } finally {
      await deleteUser(user.id)
    }
  })
})

// ===========================================================================
// Einladung annehmen / Passwort setzen
// ===========================================================================
test.describe('Einladung & Passwort setzen', () => {
  test.skip(!hasServiceClient, 'Service-Role-Client nötig')

  test('gültiger Einladungslink → Passwort vergeben → angemeldet', async ({ page }) => {
    // invite legt den Nutzer selbst an (nicht vorher createUser).
    const link = await generateAuthLink('invite', disposableEmail('invite'))
    try {
      await consumeAuthLink(page, link)
      await fillField(page, 'Neues Passwort', 'neuespasswort1')
      await fillField(page, 'Passwort wiederholen', 'neuespasswort1')
      await page.getByRole('button', { name: 'Passwort speichern' }).click()
      await page.waitForURL((u) => new URL(u).pathname === '/')
      await expect(page.getByText(/Hallo,/)).toBeVisible()
    } finally {
      if (link.userId) await deleteUser(link.userId)
    }
  })

  test('gültiger Reset-Link → neues Passwort → danach Login damit', async ({ page }) => {
    const user = await createDisposableUser('reset', { active: true })
    const newPw = 'ganzneuespw9'
    try {
      const link = await generateAuthLink('recovery', user.email)
      await consumeAuthLink(page, link)
      await fillField(page, 'Neues Passwort', newPw)
      await fillField(page, 'Passwort wiederholen', newPw)
      await page.getByRole('button', { name: 'Passwort speichern' }).click()
      await page.waitForURL((u) => new URL(u).pathname === '/')

      await page.goto('/auth/abmelden')
      await page.waitForURL(/\/login/)
      await login(page, user.email, newPw)
      await expect(page.getByText(/Hallo,/)).toBeVisible()
    } finally {
      await deleteUser(user.id)
    }
  })

  test('ungültiger Link → Hinweis + Verweis auf neuen Link', async ({ page }) => {
    await page.goto('/passwort-setzen?fehler=link')
    await expect(page.getByText(/ungültig oder abgelaufen/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Neuen Link anfordern' })).toBeVisible()
  })

  test('ohne Session → /passwort-setzen zeigt den Ungültig-Hinweis', async ({ page }) => {
    await page.goto('/passwort-setzen')
    await expect(page.getByText(/ungültig oder abgelaufen/)).toBeVisible()
  })

  test('Passwort < 6 Zeichen wird abgelehnt', async ({ page }) => {
    const user = await createDisposableUser('minlen', { active: true })
    try {
      await consumeAuthLink(page, await generateAuthLink('recovery', user.email))
      await fillField(page, 'Neues Passwort', '12345')
      await fillField(page, 'Passwort wiederholen', '12345')
      await page.getByRole('button', { name: 'Passwort speichern' }).click()
      // exact: sonst matcht auch der Hinweistext „Mindestens 6 Zeichen."
      await expect(page.getByText('Mindestens 6 Zeichen', { exact: true })).toBeVisible()
      await expect(page).toHaveURL(/\/passwort-setzen/)
    } finally {
      await deleteUser(user.id)
    }
  })

  test('Passwort und Wiederholung müssen übereinstimmen', async ({ page }) => {
    const user = await createDisposableUser('mismatch', { active: true })
    try {
      await consumeAuthLink(page, await generateAuthLink('recovery', user.email))
      await fillField(page, 'Neues Passwort', 'passwortA1')
      await fillField(page, 'Passwort wiederholen', 'passwortB2')
      await page.getByRole('button', { name: 'Passwort speichern' }).click()
      await expect(page.getByText('Die Passwörter stimmen nicht überein')).toBeVisible()
    } finally {
      await deleteUser(user.id)
    }
  })
})

// ===========================================================================
// Passwort vergessen
// ===========================================================================
test.describe('Passwort vergessen', () => {
  test('unbekannte Adresse: gleiche Bestätigung (keine Enumeration)', async ({ page }) => {
    await page.goto('/passwort-vergessen')
    await fillField(page, 'E-Mail', `gibt-es-nicht-${Date.now()}@example.com`)
    await page.getByRole('button', { name: 'Link anfordern' }).click()
    await expect(
      page.getByText(/Falls ein Konto zu dieser Adresse existiert/),
    ).toBeVisible()
  })
})

// ===========================================================================
// Abmelden
// ===========================================================================
test.describe('Abmelden', () => {
  test('Abmelden führt auf /login mit Hinweis', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await page.goto('/profil')
    const abmelden = page.getByRole('button', { name: 'Abmelden' })
    await expect(abmelden).toBeVisible({ timeout: 10_000 })
    await abmelden.click()
    await expect(page).toHaveURL(/\/login\?reason=signed-out/, { timeout: 15_000 })
    await expect(page.getByText('Du wurdest abgemeldet')).toBeVisible()
  })

  test('nach Abmelden: Zurück auf eine geschützte Seite → /login', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await page.goto('/profil')
    const abmelden = page.getByRole('button', { name: 'Abmelden' })
    await expect(abmelden).toBeVisible({ timeout: 10_000 })
    await abmelden.click()
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    await page.goBack()
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  })
})

// ===========================================================================
// Geschützte Bereiche & Rollen
// ===========================================================================
test.describe('Geschützte Bereiche & Rollen', () => {
  test('nicht angemeldet: geschützte Seite → /login mit gemerktem Zielpfad', async ({
    page,
  }) => {
    await page.goto('/profil')
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprofil/)
  })

  test('Teilnehmer: /admin liefert „Seite nicht gefunden"', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await page.goto('/admin')
    await expect(page.getByText(/nicht gefunden/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Admin' })).toHaveCount(0)
  })

  test('Admin: /admin zeigt die Admin-Startseite', async ({ page }) => {
    await login(page, ADMIN_EMAIL)
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
  })
})

// ===========================================================================
// App-Shell & Navigation
// ===========================================================================
test.describe('App-Shell & Navigation', () => {
  test('Bottom-Nav zeigt Start, Tastings, Profil', async ({ page }) => {
    await login(page, TEST_EMAIL)
    const nav = bottomNav(page)
    await expect(nav.getByRole('link', { name: 'Start' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Tastings' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Profil' })).toBeVisible()
  })

  test('„Admin" nur für Admins in der Bottom-Nav', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await expect(bottomNav(page).getByRole('link', { name: 'Admin' })).toHaveCount(0)

    await page.goto('/auth/abmelden')
    await page.waitForURL(/\/login/)

    await login(page, ADMIN_EMAIL)
    await expect(bottomNav(page).getByRole('link', { name: 'Admin' })).toBeVisible()
  })

  test('aktueller Eintrag ist als aktiv markiert', async ({ page }) => {
    await login(page, TEST_EMAIL)
    await bottomNav(page).getByRole('link', { name: 'Tastings' }).click()
    await page.waitForURL((u) => new URL(u).pathname === '/tastings')
    await expect(
      bottomNav(page).getByRole('link', { name: 'Tastings' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  test('fehlende Session beim Seitenwechsel → /login', async ({ page, context }) => {
    await login(page, TEST_EMAIL)
    await context.clearCookies()
    await page.goto('/tastings')
    await expect(page).toHaveURL(/\/login/)
  })
})
