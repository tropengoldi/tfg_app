/**
 * Rendert die App-Icons aus der Quell-SVG (PROJ-12).
 *
 *   npm run icons:gen
 *
 * Liest  public/icon.svg  und schreibt (alles unter public/, siehe unten):
 *   public/favicon-32.png       32×32   (PNG-Favicon-Fallback ohne SVG-Support)
 *   public/apple-icon.png      180×180  (iOS „Zum Home-Bildschirm")
 *   public/icon-192.png        192×192  (Manifest, purpose "any")
 *   public/icon-512.png        512×512  (Manifest, purpose "any")
 *   public/icon-512-maskable.png 512×512 (Manifest, purpose "maskable",
 *                                         Motiv in der inneren 80%-Safe-Zone)
 *
 * Warum public/ statt src/app/: Turbopack (Next 16.1) paniert beim Build, wenn
 * eine icon.svg als app/-Metadatei liegt. Die Icons werden daher statisch aus
 * public/ ausgeliefert und in src/app/layout.tsx über `metadata.icons`
 * ausdrücklich verlinkt.
 *
 * Die Ergebnisse werden eingecheckt. sharp ist eine devDependency, läuft nie
 * im Browser oder auf dem Server.
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(root, 'public/icon.svg')
const BG = '#161310'

const targets = [
  { size: 32, out: 'public/favicon-32.png' },
  { size: 180, out: 'public/apple-icon.png' },
  { size: 192, out: 'public/icon-192.png' },
  { size: 512, out: 'public/icon-512.png' },
]

async function main() {
  const svg = await readFile(SRC)

  for (const { size, out } of targets) {
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(resolve(root, out))
    console.log(`  + ${out.padEnd(28)} ${size}×${size}`)
  }

  // Maskable: Motiv auf 80 % skalieren, mit BG auf volle Größe auffüllen.
  const inner = Math.round(512 * 0.8)
  const pad = Math.round((512 - inner) / 2)
  await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BG })
    .png()
    .toFile(resolve(root, 'public/icon-512-maskable.png'))
  console.log(`  + ${'public/icon-512-maskable.png'.padEnd(28)} 512×512 (safe-zone)`)

  console.log('\n  Fertig.\n')
}

main().catch((err) => {
  console.error('\n  Fehlgeschlagen:\n', err?.message ?? err, '\n')
  process.exit(1)
})
