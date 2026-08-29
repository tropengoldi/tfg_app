import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Users } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Admin' }

const ENTRIES = [
  { href: '/admin/teilnehmer', label: 'Teilnehmer verwalten', icon: Users },
  { href: '/admin/events', label: 'Tastings verwalten', icon: CalendarDays },
]

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" description="Verwaltung der Runde." />

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {ENTRIES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-accent"
                >
                  <e.icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 font-medium">{e.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
