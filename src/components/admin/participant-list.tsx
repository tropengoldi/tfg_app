import { InviteParticipantDialog } from '@/components/admin/invite-participant-dialog'
import { ParticipantRow } from '@/components/admin/participant-row'
import type { MemberRow } from '@/lib/queries/admin'

export function ParticipantList({
  members,
  currentUserId,
}: {
  members: MemberRow[]
  currentUserId: string
}) {
  const activeAdminCount = members.filter(
    (m) => m.role === 'admin' && m.is_active,
  ).length

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <InviteParticipantDialog />
      </div>

      <ul
        aria-label="Teilnehmerliste"
        className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
      >
        {members.map((member) => (
          <ParticipantRow
            key={member.id}
            member={member}
            isSelf={member.id === currentUserId}
            activeAdminCount={activeAdminCount}
          />
        ))}
      </ul>
    </div>
  )
}
