import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // `tests/` gehört Playwright (E2E); Integrationstests gegen die echte DB
    // laufen separat über `npm run test:rls`.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.integration.test.{ts,tsx}',
      'tests/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
