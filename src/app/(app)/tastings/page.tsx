import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Tastings' }

export default function TastingsPage() {
  return (
    <>
      <PageHeader
        title="Tastings"
        description="Vergangene Abende zum Nachschlagen."
      />
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Die Liste der vergangenen Tastings mit Datum, Gastgeber und Sieger-Whisky
          entsteht in einem späteren Schritt.
        </CardContent>
      </Card>
    </>
  )
}
