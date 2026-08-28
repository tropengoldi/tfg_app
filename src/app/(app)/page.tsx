import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/lib/auth'

export default async function StartPage() {
  const { profile } = await requireUser()

  return (
    <>
      <PageHeader title="Start" />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Willkommen, {profile.display_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hier entsteht das Dashboard des aktuellen Tastings — mit Eckdaten,
          Gläser-Fortschritt und dem Sprung in die Bewertung. Noch ist es ein
          Platzhalter.
        </CardContent>
      </Card>
    </>
  )
}
