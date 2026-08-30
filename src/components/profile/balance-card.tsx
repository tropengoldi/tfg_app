import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEventDate } from '@/lib/dates'
import { ordinalPlace, type PersonalBalance } from '@/lib/personal-balance'

export function BalanceCard({ balance }: { balance: PersonalBalance | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Persönliche Bilanz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balance === null ? (
          <p className="text-sm text-muted-foreground">Bilanz gerade nicht verfügbar.</p>
        ) : (
          <>
            {balance.isFresh ? (
              <p className="text-sm text-muted-foreground">
                Deine Bilanz füllt sich, sobald dein erstes Tasting abgeschlossen ist.
              </p>
            ) : null}

            <dl className="grid grid-cols-2 gap-4">
              <Stat label="Tastings" value={String(balance.tastingCount)} />
              <Stat label="Mitgebrachte Whiskys" value={String(balance.whiskyCount)} />

              <Stat
                label="Beste Platzierung"
                value={balance.bestPlacement ? ordinalPlace(balance.bestPlacement.rank) : '—'}
                sub={
                  balance.bestPlacement
                    ? `${balance.bestPlacement.whiskyName} · ${formatEventDate(balance.bestPlacement.eventDate)}`
                    : 'noch keine Platzierung'
                }
              />

              <Stat
                label="Ø vergebene Punkte"
                value={balance.avgPointsGiven ? balance.avgPointsGiven.avg : '—'}
                sub={
                  balance.avgPointsGiven
                    ? `aus ${balance.avgPointsGiven.count} Bewertungen`
                    : 'noch nichts bewertet'
                }
              />
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-2xl tabular-nums leading-tight">{value}</dd>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}
