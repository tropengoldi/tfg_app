'use client'

import Link from 'next/link'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader title="Tastings" />
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground">
          <p>Da ist etwas schiefgelaufen.</p>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline">
              Erneut versuchen
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/events">Zur Liste</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
