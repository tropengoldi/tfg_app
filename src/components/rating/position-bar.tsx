'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PositionBarProps {
  total: number
  currentPosition: number
  focus: number
  ratedPositions: Set<number>
  onSelect: (position: number) => void
}

export function PositionBar({
  total,
  currentPosition,
  focus,
  ratedPositions,
  onSelect,
}: PositionBarProps) {
  return (
    <ol aria-label="Whisky-Positionen" className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((pos) => {
        const poured = pos <= currentPosition
        const isFocus = pos === focus
        const isCurrent = pos === currentPosition
        const isRated = ratedPositions.has(pos)
        return (
          <li key={pos}>
            <button
              type="button"
              disabled={!poured}
              aria-current={isFocus ? 'true' : undefined}
              aria-label={
                `Whisky ${pos}` +
                (isRated ? ', bewertet' : '') +
                (isCurrent ? ', aktuell' : '') +
                (!poured ? ', noch nicht ausgeschenkt' : '')
              }
              onClick={() => onSelect(pos)}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                !poured && 'cursor-not-allowed border-dashed border-border text-muted-foreground/50',
                poured && !isFocus && 'border-border hover:bg-accent',
                isFocus && 'border-primary bg-primary text-primary-foreground',
                isCurrent && !isFocus && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
              )}
            >
              {isRated && !isFocus ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                pos
              )}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
