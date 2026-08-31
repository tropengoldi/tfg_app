import type { MetadataRoute } from 'next'

/**
 * Web-App-Manifest (PROJ-12). Next serviert es unter /manifest.webmanifest und
 * injiziert <link rel="manifest"> automatisch. Kein Service-Worker, keine
 * Offline-Fähigkeit — nur Icon + Name auf dem Homescreen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Whizzky – Treffpunkt feiner Geister',
    short_name: 'Whizzky',
    description: 'Digitale Verkostung für unsere Runde',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#161310',
    background_color: '#161310',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
