'use client'

import { MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { MemberStatusBadge } from '@/components/admin/member-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  type ActionResult,
  deactivateMemberAction,
  reactivateMemberAction,
  setMemberAdminAction,
} from '@/lib/actions/admin'
import { memberStatus } from '@/lib/member-status'
import type { MemberRow } from '@/lib/queries/admin'

type Pending = 'deactivate' | 'reactivate' | 'promote' | 'demote' | null

export function ParticipantRow({
  member,
  isSelf,
  activeAdminCount,
}: {
  member: MemberRow
  isSelf: boolean
  activeAdminCount: number
}) {
  const router = useRouter()
  const [busy, startTransition] = useTransition()
  const [dialog, setDialog] = useState<Pending>(null)

  const status = memberStatus(member)
  const isLastActiveAdmin =
    member.role === 'admin' && member.is_active && activeAdminCount <= 1

  const canDeactivate = status !== 'deactivated' && !isSelf && !isLastActiveAdmin
  const canReactivate = status === 'deactivated'
  const canPromote = status === 'active' && member.role !== 'admin'
  const canDemote = member.role === 'admin' && !isLastActiveAdmin
  const hasAction = canDeactivate || canReactivate || canPromote || canDemote

  function run(action: () => Promise<ActionResult>, successMsg: string) {
    startTransition(async () => {
      const res = await action()
      setDialog(null)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success(successMsg)
      router.refresh()
    })
  }

  return (
    <li className="flex items-center gap-3 p-3">
      <div
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium"
      >
        {member.display_name.slice(0, 1).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{member.display_name}</span>
          {member.role === 'admin' ? (
            <Badge variant="secondary" className="shrink-0">
              Admin
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
      </div>

      <MemberStatusBadge status={status} />

      {hasAction ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Aktionen für ${member.display_name}`}
              disabled={busy}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canPromote ? (
              <DropdownMenuItem onSelect={() => setDialog('promote')}>
                Zum Admin machen
              </DropdownMenuItem>
            ) : null}
            {canDemote ? (
              <DropdownMenuItem onSelect={() => setDialog('demote')}>
                Admin-Rechte entziehen
              </DropdownMenuItem>
            ) : null}
            {canReactivate ? (
              <DropdownMenuItem onSelect={() => setDialog('reactivate')}>
                Reaktivieren
              </DropdownMenuItem>
            ) : null}
            {canDeactivate ? (
              <DropdownMenuItem
                onSelect={() => setDialog('deactivate')}
                className="text-destructive focus:text-destructive"
              >
                Deaktivieren
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-9 shrink-0" aria-hidden />
      )}

      <ConfirmDialog
        open={dialog === 'promote'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Zum Admin machen?"
        description={`${member.display_name} erhält Zugriff auf den Admin-Bereich.`}
        confirmLabel="Zum Admin machen"
        pending={busy}
        onConfirm={() => run(() => setMemberAdminAction(member.id, true), 'Ist jetzt Admin.')}
      />
      <ConfirmDialog
        open={dialog === 'demote'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Admin-Rechte entziehen?"
        description={`${member.display_name} verliert den Zugriff auf den Admin-Bereich.`}
        confirmLabel="Rechte entziehen"
        destructive
        pending={busy}
        onConfirm={() => run(() => setMemberAdminAction(member.id, false), 'Admin-Rechte entzogen.')}
      />
      <ConfirmDialog
        open={dialog === 'deactivate'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Teilnehmer deaktivieren?"
        description={`${member.display_name} kann sich nicht mehr anmelden. Bisherige Bewertungen und mitgebrachte Whiskies bleiben erhalten.`}
        confirmLabel="Deaktivieren"
        destructive
        pending={busy}
        onConfirm={() => run(() => deactivateMemberAction(member.id), 'Teilnehmer deaktiviert.')}
      />
      <ConfirmDialog
        open={dialog === 'reactivate'}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Teilnehmer reaktivieren?"
        description={`${member.display_name} kann sich wieder anmelden.`}
        confirmLabel="Reaktivieren"
        pending={busy}
        onConfirm={() => run(() => reactivateMemberAction(member.id), 'Teilnehmer reaktiviert.')}
      />
    </li>
  )
}
