'use client'

import { Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { setWinnerTipAction } from '@/lib/actions/tips'
import { tipOptions } from '@/lib/winner-tips'

/**
 * „Dein Sieger-Tipp" (PROJ-22): Auswahl Whisky 1 … N, speichert sofort.
 * Bei Fehler springt die Auswahl auf den zuletzt gespeicherten Tipp zurück.
 */
export function WinnerTipField({
  eventId,
  total,
  savedPosition,
  editable,
}: {
  eventId: string
  total: number
  savedPosition: number | null
  editable: boolean
}) {
  const router = useRouter()
  const [pending, startSaving] = useTransition()
  const [saved, setSaved] = useState(savedPosition)
  const [value, setValue] = useState(savedPosition)

  // Serverstand (anderes Gerät, router.refresh) übernehmen.
  useEffect(() => {
    setSaved(savedPosition)
    setValue(savedPosition)
  }, [savedPosition])

  function onChange(next: string) {
    const position = Number(next)
    if (position === saved) return
    setValue(position)
    startSaving(async () => {
      const res = await setWinnerTipAction({ eventId, position })
      if ('error' in res) {
        setValue(saved)
        toast.error(res.error)
        return
      }
      setSaved(position)
      toast.success(`Tipp gespeichert: Whisky ${position}`)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <label
            htmlFor="winner-tip"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Trophy className="h-4 w-4 shrink-0 text-gold" />
            Dein Sieger-Tipp
          </label>
          <p id="winner-tip-hint" className="text-xs text-muted-foreground">
            {editable
              ? 'Welcher Whisky gewinnt? Bis zum Abschluss änderbar.'
              : 'Der Abend ist abgeschlossen — dein Tipp ist eingefroren.'}
          </p>
        </div>
        <Select
          value={value === null ? undefined : String(value)}
          onValueChange={onChange}
          disabled={!editable || pending || total === 0}
        >
          <SelectTrigger
            id="winner-tip"
            className="min-h-11 text-base sm:w-48"
            aria-describedby="winner-tip-hint"
          >
            <SelectValue placeholder="Whisky wählen" />
          </SelectTrigger>
          <SelectContent>
            {tipOptions(total).map((n) => (
              <SelectItem key={n} value={String(n)} className="min-h-11 text-base">
                Whisky {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
