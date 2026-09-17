'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader title="Meine Sammlung" />
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground">
          <p>Deine Sammlung liess sich gerade nicht laden.</p>
          <Button onClick={reset} variant="outline" className="w-fit">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
