import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Admin' }

export default function AdminPage() {
  return (
    <>
      <PageHeader
        title="Admin"
        description="Verwaltung der Runde."
      />
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Teilnehmerverwaltung (einladen, deaktivieren) und die Event-Verwaltung
          entstehen in den nächsten Schritten.
        </CardContent>
      </Card>
    </>
  )
}
