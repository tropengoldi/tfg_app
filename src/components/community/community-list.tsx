import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { CommunityMember } from '@/lib/queries/community'

export function CommunityList({ members }: { members: CommunityMember[] }) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine aktiven Mitglieder.</p>
  }

  return (
    <ul
      aria-label="Aktive Mitglieder"
      className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    >
      {members.map((member) => (
        <li key={member.id}>
          <Link
            href={`/profil/${member.id}`}
            className="flex min-h-11 items-center justify-between gap-3 p-4 transition-colors hover:bg-accent"
          >
            <span className="font-medium">{member.name}</span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
