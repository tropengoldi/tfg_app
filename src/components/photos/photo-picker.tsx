'use client'

/* eslint-disable @next/next/no-img-element -- lokale Vorschau (Object-URL), kein Server-Bild. */

import { Camera, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { validatePhotoFile } from '@/lib/photos/resize'

export interface PhotoPickerProps {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  /** Zusatzhinweis unter dem Knopf. */
  hint?: string
}

/**
 * PROJ-28 · Foto-Auswahl in einem Anlege-Formular. Merkt sich nur die Datei —
 * hochgeladen wird erst nach dem Speichern, wenn die ID des neuen Eintrags
 * feststeht.
 */
export function PhotoPicker({ file, onChange, disabled, hint }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Foto (optional)</p>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
          {preview ? (
            <img src={preview} alt="Vorschau des gewählten Fotos" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-5 w-5 text-muted-foreground/60" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {file ? 'Anderes Foto' : 'Foto wählen'}
          </Button>
          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              disabled={disabled}
              onClick={() => onChange(null)}
              aria-label="Gewähltes Foto verwerfen"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null
          e.target.value = ''
          if (!picked) return
          const valid = validatePhotoFile(picked)
          if (!valid.ok) {
            setError(valid.error)
            return
          }
          setError(null)
          onChange(picked)
        }}
      />
    </div>
  )
}
