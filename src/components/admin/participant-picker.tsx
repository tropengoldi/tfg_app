'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export interface PickerMember {
  id: string
  display_name: string
}

interface ParticipantPickerProps {
  members: PickerMember[]
  /** ausgewählte IDs (der Gastgeber ist immer dabei und wird hier erwartet) */
  value: string[]
  onChange: (ids: string[]) => void
  /** diese Person ist gesetzt und nicht abwählbar */
  lockedId?: string
  /** diese Personen tauchen gar nicht in der Liste auf (PROJ-11: der Helfer) */
  excludeIds?: string[]
}

export function ParticipantPicker({
  members,
  value,
  onChange,
  lockedId,
  excludeIds,
}: ParticipantPickerProps) {
  const visible = excludeIds?.length
    ? members.filter((m) => !excludeIds.includes(m.id))
    : members

  function toggle(id: string, checked: boolean) {
    if (id === lockedId) return
    onChange(checked ? [...new Set([...value, id])] : value.filter((v) => v !== id))
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine aktiven Mitglieder. Lade zuerst Teilnehmer ein.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {visible.map((m) => {
        const checked = value.includes(m.id) || m.id === lockedId
        const locked = m.id === lockedId
        return (
          <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
            <Checkbox
              id={`participant-${m.id}`}
              checked={checked}
              disabled={locked}
              onCheckedChange={(c) => toggle(m.id, c === true)}
            />
            <Label
              htmlFor={`participant-${m.id}`}
              className="flex-1 cursor-pointer font-normal"
            >
              {m.display_name}
              {locked ? (
                <span className="ml-2 text-xs text-muted-foreground">(Gastgeber)</span>
              ) : null}
            </Label>
          </li>
        )
      })}
    </ul>
  )
}
