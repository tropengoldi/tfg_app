'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader title="Teilnehmer" />
      <Card>
        <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
          <p>Die Teilnehmerliste konnte nicht geladen werden.</p>
          <Button onClick={reset} variant="outline">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
