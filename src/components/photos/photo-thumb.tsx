'use client'

/* eslint-disable @next/next/no-img-element -- signierte, kurzlebige Storage-Links;
   next/image würde sie über den Bild-Optimierer laufen lassen und zwischenspeichern. */

import { ImageOff, Wine } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PhotoUrls } from '@/lib/photos/signed'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
} as const

export interface PhotoThumbProps {
  photo: PhotoUrls | null
  /** Whisky-Name — Alt-Text und Titel der Vollbild-Ansicht. */
  name: string
  size?: keyof typeof SIZES
  className?: string
}

/**
 * PROJ-28 · Mini-Bild eines Whiskys; Antippen öffnet das Foto bildschirmfüllend.
 * Ohne Foto: neutraler Platzhalter (nicht antippbar).
 */
export function PhotoThumb({ photo, name, size = 'md', className }: PhotoThumbProps) {
  const [open, setOpen] = useState(false)
  const [broken, setBroken] = useState(false)
  const box = cn(
    SIZES[size],
    'shrink-0 overflow-hidden rounded-md border border-border bg-secondary',
    className,
  )

  if (!photo) {
    return (
      <div className={cn(box, 'flex items-center justify-center')} aria-hidden="true">
        <Wine className="h-5 w-5 text-muted-foreground/60" />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className={cn(box, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
        onClick={() => setOpen(true)}
        aria-label={`Foto von „${name}" vergrößern`}
      >
        {broken ? (
          <span className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-5 w-5 text-muted-foreground/60" />
          </span>
        ) : (
          <img
            src={photo.thumbUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95dvh] w-[calc(100vw-1rem)] max-w-3xl gap-3 p-3 sm:p-4">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="font-display text-lg leading-tight">{name}</DialogTitle>
            <DialogDescription className="sr-only">Foto in voller Größe</DialogDescription>
          </DialogHeader>
          <img
            src={photo.fullUrl}
            alt={`Foto von ${name}`}
            className="max-h-[80dvh] w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
