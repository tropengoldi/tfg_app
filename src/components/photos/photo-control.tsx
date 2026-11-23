'use client'

import { Camera, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PhotoThumb } from '@/components/photos/photo-thumb'
import { Button } from '@/components/ui/button'
import type { PhotoActionResult } from '@/lib/actions/photos'
import type { PhotoPaths } from '@/lib/photos/paths'
import type { PhotoUrls } from '@/lib/photos/signed'
import { uploadPhoto } from '@/lib/photos/upload'
import { cn } from '@/lib/utils'

export interface PhotoControlProps {
  photo: PhotoUrls | null
  name: string
  /** Darf der Betrachter das Foto pflegen? Sonst nur Mini-Bild. */
  canEdit: boolean
  /** Bucket-Ordner, z. B. `tasting/<event>/<whisky>`. */
  folder: string
  /** Server-Aktion: Pfade setzen (`null` = entfernen). */
  save: (paths: PhotoPaths | null) => Promise<PhotoActionResult>
  size?: 'sm' | 'md'
  /** `stacked`: Aktionen unter dem Bild (schmale Spalten); `inline`: daneben. */
  layout?: 'inline' | 'stacked'
  /** Nur die Aktionen zeigen (das Mini-Bild steht anderswo, z. B. in der Ranglisten-Kopfzeile). */
  hideThumb?: boolean
  className?: string
}

/**
 * PROJ-28 · Mini-Bild + „Foto hinzufügen" / „Ersetzen" / „Entfernen".
 * Speichert sofort (unabhängig von anderen Formularen): Foto prüfen, im Browser
 * verkleinern, in den Bucket laden, dann per Server-Aktion eintragen.
 * Das Datei-Feld ohne `capture` lässt das Handy selbst „Kamera" oder „Galerie"
 * anbieten.
 */
export function PhotoControl({
  photo,
  name,
  canEdit,
  folder,
  save,
  size = 'md',
  layout = 'inline',
  hideThumb = false,
  className,
}: PhotoControlProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFile, setLastFile] = useState<File | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  async function handleFile(file: File) {
    setLastFile(file)
    setError(null)
    setBusy('upload')
    try {
      const up = await uploadPhoto(file, folder)
      if (!up.ok) {
        setError(up.error)
        return
      }
      const res = await save(up.paths)
      if ('error' in res) {
        setError(res.error)
        return
      }
      setLastFile(null)
      toast.success(photo ? 'Foto ersetzt.' : 'Foto gespeichert.')
      router.refresh()
    } catch {
      setError('Keine Verbindung. Bitte noch einmal versuchen.')
    } finally {
      setBusy(null)
    }
  }

  async function handleRemove() {
    setBusy('remove')
    setError(null)
    try {
      const res = await save(null)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Foto entfernt.')
      router.refresh()
    } catch {
      toast.error('Keine Verbindung. Bitte noch einmal versuchen.')
    } finally {
      setBusy(null)
      setConfirmRemove(false)
    }
  }

  if (!canEdit) return <PhotoThumb photo={photo} name={name} size={size} className={className} />

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex gap-2', layout === 'stacked' ? 'flex-col items-start' : 'items-center')}>
        <div className={cn('relative', hideThumb && 'hidden')}>
          <PhotoThumb photo={photo} name={name} size={size} />
          {busy === 'upload' ? (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70"
              role="status"
              aria-label="Foto wird hochgeladen"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
          >
            {busy === 'upload' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {busy === 'upload' ? 'Lädt…' : photo ? (hideThumb ? 'Foto ersetzen' : 'Ersetzen') : 'Foto hinzufügen'}
          </Button>
          {photo ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 text-destructive hover:text-destructive"
              disabled={busy !== null}
              onClick={() => setConfirmRemove(true)}
              aria-label={`Foto von „${name}" entfernen`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Entfernen</span>
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
          <span>{error}</span>
          {lastFile ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              disabled={busy !== null}
              onClick={() => handleFile(lastFile)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Erneut versuchen
            </Button>
          ) : null}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void handleFile(file)
        }}
      />

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={(o) => !o && busy === null && setConfirmRemove(false)}
        title="Foto entfernen?"
        description="Das Foto ist danach endgültig weg."
        confirmLabel="Entfernen"
        destructive
        pending={busy === 'remove'}
        onConfirm={handleRemove}
      />
    </div>
  )
}
