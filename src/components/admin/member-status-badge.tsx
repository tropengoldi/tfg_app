import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL, type MemberStatus } from '@/lib/member-status'
import { cn } from '@/lib/utils'

const STYLES: Record<MemberStatus, string> = {
  active: 'border-transparent bg-success/15 text-success',
  invited: 'border-transparent bg-primary/15 text-primary',
  deactivated: 'border-border bg-muted text-muted-foreground',
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STYLES[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
