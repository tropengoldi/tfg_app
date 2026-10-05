'use client'

import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatPoints, stepValue, type RatingStep } from '@/lib/points'

interface ScoreFieldProps {
  /** „Nasenpunkte" / „Gaumenpunkte" — sichtbare Beschriftung und Screenreader-Name. */
  label: string
  value: number
  max: number
  step: RatingStep
  disabled?: boolean
  onChange: (value: number) => void
}

/**
 * Ein Punktefeld der Bewertungsansicht (PROJ-19): Slider 0–max in der
 * Schrittweite des Tastings, daneben −/+ für die Feinkorrektur mit dem Daumen.
 */
export function ScoreField({ label, value, max, step, disabled, onChange }: ScoreFieldProps) {
  const shown = formatPoints(value)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-display text-3xl tabular-nums" aria-hidden="true">
          {shown}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label={`${label} verringern`}
          disabled={disabled || value <= 0}
          onClick={() => onChange(stepValue(value, -1, step, 0, max))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          value={[value]}
          min={0}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={shown}
          onValueChange={([v]) => onChange(v)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label={`${label} erhöhen`}
          disabled={disabled || value >= max}
          onClick={() => onChange(stepValue(value, 1, step, 0, max))}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between px-14 text-xs text-muted-foreground">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
