import { Badge } from '@/components/ui/badge'
import type { EventStatus } from '@/lib/supabase/aliases'
import { cn } from '@/lib/utils'

const LABEL: Record<EventStatus, string> = {
  draft: 'In Vorbereitung',
  active: 'Läuft',
  closed: 'Abgeschlossen',
}

const STYLE: Record<EventStatus, string> = {
  draft: 'border-transparent bg-primary/15 text-primary',
  active: 'border-transparent bg-success/15 text-success',
  closed: 'border-border bg-muted text-muted-foreground',
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STYLE[status])}>
      {LABEL[status]}
    </Badge>
  )
}
