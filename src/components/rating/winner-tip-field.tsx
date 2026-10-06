'use client'

import { Trophy } from 'lucide-react'

import { useWinnerTip } from '@/components/rating/winner-tip-context'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tipOptions } from '@/lib/winner-tips'

/**
 * „Dein Sieger-Tipp" (PROJ-22): Auswahl Whisky 1 … N, speichert sofort.
 * Stand und Speichern kommen aus dem `WinnerTipProvider` — geteilt mit den
 * Pokal-Knöpfen der eigenen Rangliste (PROJ-24).
 */
export function WinnerTipField({ total }: { total: number }) {
  const tip = useWinnerTip()
  if (!tip) return null
  const { position, pending, editable, choose } = tip

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
          value={position === null ? undefined : String(position)}
          onValueChange={(v) => choose(Number(v))}
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
