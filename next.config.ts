import type { NextConfig } from 'next'

/**
 * Sicherheits-Header für alle Antworten (siehe docs/production/security-headers.md).
 * CSP bleibt bewusst außen vor, bis sie gegen die App getestet ist.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

const nextConfig: NextConfig = {
  // `output: 'standalone'` (für den pausierten VPS-Docker-Pfad, siehe
  // docs/production/vps-self-hosted.md) ist hier bewusst NICHT gesetzt:
  // "next start" — das Playwright lokal für alle E2E-Tests nutzt — läuft
  // damit nicht mehr richtig (Next warnt explizit davor). Bei Bedarf des
  // VPS-Pfads separat wieder aktivieren und dabei playwright.config.ts
  // (webServer-Befehl) mitziehen, statt es hier dauerhaft zu setzen.
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
