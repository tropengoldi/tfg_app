import Link from 'next/link'
import { CalendarClock, GlassWater } from 'lucide-react'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'
import { formatEventDate } from '@/lib/dates'
import { getDashboard } from '@/lib/queries/dashboard'

export default async function StartPage() {
  const { userId, profile } = await requireUser()
  const state = await getDashboard(userId)

  return (
    <>
      <PageHeader title={`Hallo, ${profile.display_name}`} />

      {state.kind === 'active' ? <DashboardView data={state} /> : null}

      {state.kind === 'preview' ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <p className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-primary" />
              Nächster Abend: {formatEventDate(state.event.event_date)} · {state.event.location}
            </p>
            <p className="text-sm text-muted-foreground">
              Gerade läuft kein Tasting.
            </p>
            <Link
              href={`/tastings/${state.event.id}/whiskies`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <GlassWater className="h-4 w-4" />
              Meine Whiskys
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {state.kind === 'none' ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <GlassWater className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Gerade läuft kein Tasting.</p>
            <Link
              href="/tastings"
              className="text-sm font-medium text-primary hover:underline"
            >
              Vergangene Tastings
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
