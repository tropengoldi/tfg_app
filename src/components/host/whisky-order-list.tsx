'use client'

import { ArrowDown, ArrowUp, Shuffle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface WhiskyOrderListProps {
  /** IDs in aktueller Anzeige-Reihenfolge (Index 0 = Position 1). */
  ids: string[]
  nameById: Map<string, string>
  editable: boolean
  changed: boolean
  saving: boolean
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onShuffle: () => void
  onSave: () => void
}

export function WhiskyOrderList({
  ids,
  nameById,
  editable,
  changed,
  saving,
  onMoveUp,
  onMoveDown,
  onShuffle,
  onSave,
}: WhiskyOrderListProps) {
  if (ids.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Noch keine Whiskys — die Teilnehmer tragen sie selbst ein.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {editable ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onShuffle} disabled={saving}>
            <Shuffle className="h-4 w-4" />
            Zufällig mischen
          </Button>
          {changed ? (
            <Button type="button" size="sm" onClick={onSave} disabled={saving}>
              {saving ? 'Wird gespeichert…' : 'Reihenfolge speichern'}
            </Button>
          ) : null}
        </div>
      ) : null}

      <ol
        aria-label="Ausschankreihenfolge"
        className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
      >
        {ids.map((id, index) => (
          <li key={id} className="flex items-center gap-3 p-3">
            <span className="w-6 shrink-0 text-center font-display text-lg text-muted-foreground">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {nameById.get(id) ?? '—'}
            </span>
            {editable ? (
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`„${nameById.get(id) ?? ''}" nach oben`}
                  disabled={index === 0 || saving}
                  onClick={() => onMoveUp(index)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`„${nameById.get(id) ?? ''}" nach unten`}
                  disabled={index === ids.length - 1 || saving}
                  onClick={() => onMoveDown(index)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
