'use client'

import { GitCompareArrows } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { toggleCompareMarkAction } from '@/lib/actions/compare'
import {
  groupLabel,
  groupMates,
  toggleCompare,
  type CompareMark,
} from '@/lib/compare-groups'

/**
 * Vergleichs-Merker (PROJ-23) in der Bewertungskarte: „Vergleichen mit" und
 * Nummern-Knöpfe der ausgeschenkten Whiskies. Ein Tippen zeigt den neuen Stand
 * sofort und speichert im Hintergrund; bei Fehler zurück auf den letzten Stand.
 * Unabhängig von der (evtl. ungespeicherten) Bewertung.
 *
 * Der Aufrufer setzt `key` aus dem Serverstand, damit ein neuer Serverstand
 * (Neuladen) den lokalen Zustand ersetzt.
 */
export function CompareMarker({
  eventId,
  focus,
  currentPosition,
  initialMarks,
}: {
  eventId: string
  focus: number
  currentPosition: number
  initialMarks: CompareMark[]
}) {
  const [marks, setMarks] = useState(initialMarks)
  const savedRef = useRef(initialMarks)
  const [pending, startSaving] = useTransition()

  const mates = groupMates(marks, focus)
  const options = Array.from({ length: currentPosition }, (_, i) => i + 1).filter(
    (p) => p !== focus,
  )

  function onToggle(to: number) {
    const next = toggleCompare(marks, focus, to)
    setMarks(next)
    startSaving(async () => {
      // Netzwerkfehler abfangen, sonst ersetzt die Fehlergrenze die Seite (vgl. PROJ-22 BUG-1).
      const res = await toggleCompareMarkAction({ eventId, from: focus, to }).catch(() => ({
        error: 'Verbindung fehlgeschlagen — Merker nicht gespeichert.',
      }))
      if ('error' in res) {
        setMarks(savedRef.current)
        toast.error(res.error)
        return
      }
      savedRef.current = res.marks
      setMarks(res.marks)
    })
  }

  return (
    <section aria-labelledby="compare-heading" className="space-y-2 border-t border-border pt-4">
      <h3 id="compare-heading" className="flex items-center gap-1.5 text-sm font-medium">
        <GitCompareArrows className="h-4 w-4 text-muted-foreground" aria-hidden />
        Vergleichen mit
      </h3>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          … sobald weitere Whiskies ausgeschenkt sind.
        </p>
      ) : (
        <>
          {mates.length > 0 ? (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {groupLabel(mates)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tippe an, was du nochmal direkt vergleichen willst. Nur du siehst das.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Vergleichen mit">
            {options.map((p) => {
              const on = mates.includes(p)
              return (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={on ? 'default' : 'outline'}
                  aria-pressed={on}
                  aria-label={`Whisky ${p}`}
                  disabled={pending}
                  className="h-11 min-w-11 px-0 text-base"
                  onClick={() => onToggle(p)}
                >
                  {p}
                </Button>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
