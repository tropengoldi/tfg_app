'use client'

import { Eye, Trophy } from 'lucide-react'

import { useWinnerTip } from '@/components/rating/winner-tip-context'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StewardNotice } from '@/lib/queries/ratings'
import { stewardTipHint } from '@/lib/steward-insight'
import { tipOptions } from '@/lib/winner-tips'

/**
 * „Dein Sieger-Tipp" (PROJ-22): Auswahl Whisky 1 … N, speichert sofort.
 * Stand und Speichern kommen aus dem `WinnerTipProvider` — geteilt mit den
 * Pokal-Knöpfen der eigenen Rangliste (PROJ-24).
 * Liest ein Whisky-Steward mit, steht das darunter (PROJ-20).
 */
export function WinnerTipField({
  total,
  steward = null,
}: {
  total: number
  steward?: StewardNotice | null
}) {
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
          {steward && editable ? (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {stewardTipHint(steward.name)}
            </p>
          ) : null}
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
