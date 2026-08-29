'use client'

import { MapPin, MoreVertical, Pencil, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EventStatusBadge } from '@/components/common/event-status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteEventAction } from '@/lib/actions/admin-events'
import { formatEventDate } from '@/lib/dates'
import type { EventListRow } from '@/lib/queries/admin-events'

export function EventRow({ event }: { event: EventListRow }) {
  const router = useRouter()
  const [busy, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isDraft = event.status === 'draft'

  function onDelete() {
    startTransition(async () => {
      const res = await deleteEventAction(event.id)
      setConfirmOpen(false)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Tasting gelöscht.')
      router.refresh()
    })
  }

  return (
    <li className="flex items-start gap-3 p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{formatEventDate(event.event_date)}</span>
          <EventStatusBadge status={event.status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {event.location}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          {event.host_name} · {event.participant_count}{' '}
          {event.participant_count === 1 ? 'Teilnehmer' : 'Teilnehmer'}
          {event.whisky_count > 0 ? ` · ${event.whisky_count} Whiskies` : ''}
        </p>
      </div>

      {isDraft ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Aktionen für ${event.location} am ${formatEventDate(event.event_date)}`}
              disabled={busy}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/${event.id}`}>
                <Pencil className="h-4 w-4" />
                Bearbeiten
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setConfirmOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-9 shrink-0" aria-hidden />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && setConfirmOpen(false)}
        title="Tasting löschen?"
        description="Das geplante Tasting wird endgültig entfernt. Das lässt sich nicht rückgängig machen."
        confirmLabel="Löschen"
        destructive
        pending={busy}
        onConfirm={onDelete}
      />
    </li>
  )
}
