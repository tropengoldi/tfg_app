import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-4xl text-primary">404</p>
      <h1 className="text-lg font-medium">Seite nicht gefunden</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Diese Seite gibt es nicht — oder du hast keinen Zugriff darauf.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Zur Startseite</Link>
      </Button>
    </div>
  )
}
