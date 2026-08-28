import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Users } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Admin' }

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" description="Verwaltung der Runde." />

      <Card>
        <CardContent className="p-0">
          <Link
            href="/admin/teilnehmer"
            className="flex items-center gap-3 p-4 transition-colors hover:bg-accent"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="flex-1 font-medium">Teilnehmer verwalten</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Die Event-Verwaltung entsteht in einem späteren Schritt.
      </p>
    </>
  )
}
