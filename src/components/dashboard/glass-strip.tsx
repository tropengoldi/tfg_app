import { Wine } from 'lucide-react'

import type { GlassState } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

export function GlassStrip({
  states,
  label,
}: {
  states: GlassState[]
  label: string
}) {
  return (
    <div className="space-y-2">
      <ul aria-label="Whisky-Fortschritt" className="flex flex-wrap gap-1.5">
        {states.map((s, i) => (
          <li key={i}>
            <Wine
              aria-hidden
              className={cn(
                'h-7 w-7',
                s === 'tasted' && 'text-muted-foreground/30',
                s === 'pending' && 'text-primary/50',
                s === 'current' &&
                  'rounded-full text-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
              )}
            />
          </li>
        ))}
      </ul>
      <p className="font-display text-lg">{label}</p>
    </div>
  )
}
