import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

/**
 * Konfiguration für die RLS-Integrationstests (`npm run test:rls`).
 *
 * Läuft in Node (nicht jsdom) und nimmt nur *.integration.test.ts. Die normale
 * `npm test`-Suite schließt diese Dateien aus.
 *
 * Lädt .env.local selbst (kein dotenv-Paket nötig), damit
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY und
 * SUPABASE_SERVICE_ROLE_KEY in den Tests verfügbar sind.
 */
function loadEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const raw = readFileSync(resolve(__dirname, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      out[key] = value
    }
  } catch {
    // keine .env.local → Tests erkennen fehlende Variablen selbst und skippen
  }
  return out
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.integration.test.{ts,tsx}'],
    env: loadEnvLocal(),
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
