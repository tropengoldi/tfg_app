'use client'

import { ChevronDown, Trophy } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { useWinnerTip } from '@/components/rating/winner-tip-context'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { OwnRankRow } from '@/lib/own-ranking'
import { formatPoints } from '@/lib/points'
import { cn } from '@/lib/utils'

/** Auf/Zu gilt pro Gerät für alle Tastings. */
const STORAGE_KEY = 'whizzky.own-ranking.open'

function readOpen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Gerätespeicher als „externer Store": der Server kennt ihn nicht (→ zu), der
// Browser liest ihn nach der Hydration. Fällt das Schreiben aus (gesperrter
// Speicher), gilt der Wert wenigstens bis zum Neuladen.
const listeners = new Set<() => void>()
let fallback: boolean | null = null

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): boolean {
  return fallback ?? readOpen()
}

function writeOpen(open: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    fallback = null
  } catch {
    // Gesperrter Speicher (privates Fenster): nur für diese Sitzung merken.
    fallback = open
  }
  listeners.forEach((l) => l())
}

export type OwnRankingRow = OwnRankRow & {
  /** Nur im abgeschlossenen Tasting gesetzt. */
  name?: string | null
}

/**
 * „Meine Rangliste" (PROJ-24): die eigenen gespeicherten Bewertungen, geordnet
 * nach der gemeinsamen Platzierungsregel. Zeile → springt zum Whisky; Pokal →
 * Sieger-Tipp (geteilter Stand mit dem Tipp-Feld).
 */
export function OwnRanking({
  rows,
  total,
  focus,
  onSelect,
}: {
  rows: OwnRankingRow[]
  total: number
  focus: number
  onSelect: (position: number) => void
}) {
  const tip = useWinnerTip()
  const open = useSyncExternalStore(subscribe, getSnapshot, () => false)

  return (
    <Collapsible open={open} onOpenChange={writeOpen}>
      <CollapsibleTrigger className="flex min-h-11 w-full items-center gap-1.5 text-sm font-medium text-primary">
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        Meine Rangliste ({rows.length} von {total} bewertet)
      </CollapsibleTrigger>
      <CollapsibleContent>
        {rows.length === 0 ? (
          <p className="rounded-md border border-border px-3 py-3 text-sm text-muted-foreground">
            Noch nichts bewertet — deine Rangliste füllt sich mit jeder Bewertung.
          </p>
        ) : (
          <ol
            aria-label="Meine Rangliste"
            className="divide-y divide-border rounded-md border border-border"
          >
            {rows.map((r) => {
              const isTip = tip?.position === r.position
              return (
                <li
                  key={r.whiskyId}
                  className={cn('flex items-stretch', r.position === focus && 'bg-accent')}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(r.position)}
                    aria-label={`Platz ${r.place}: Whisky ${r.position}${r.name ? `, ${r.name}` : ''}, ${formatPoints(r.total)} Punkte — anzeigen`}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="w-6 shrink-0 font-display text-lg tabular-nums text-muted-foreground">
                      {r.place}.
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        Whisky {r.position}
                        {r.name ? (
                          <span className="font-normal text-muted-foreground"> · {r.name}</span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Nase {formatPoints(r.nose)} · Gaumen {formatPoints(r.taste)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right font-display text-lg tabular-nums">
                      {formatPoints(r.total)}
                    </span>
                  </button>
                  {tip ? (
                    <button
                      type="button"
                      onClick={() => tip.choose(r.position)}
                      disabled={!tip.editable || tip.pending}
                      aria-pressed={isTip}
                      aria-label={
                        isTip
                          ? `Dein Tipp: Whisky ${r.position}`
                          : tip.editable
                            ? `Whisky ${r.position} als Sieger tippen`
                            : `Whisky ${r.position}, nicht getippt`
                      }
                      className={cn(
                        'flex w-11 shrink-0 items-center justify-center hover:bg-accent disabled:cursor-not-allowed',
                        !isTip && 'disabled:opacity-40',
                      )}
                    >
                      <Trophy
                        className={cn(
                          'h-5 w-5',
                          isTip ? 'fill-gold text-gold' : 'text-muted-foreground',
                        )}
                      />
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
