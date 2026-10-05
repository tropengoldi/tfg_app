import { Coins, Handshake, Flame, Wind, Target } from 'lucide-react'
import type { ReactNode } from 'react'

import { MetricBarChart } from '@/components/results/metric-bar-chart'
import { MetricScatterChart } from '@/components/results/metric-scatter-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResultStats, StatsWhisky } from '@/lib/result-stats'

function label(w: StatsWhisky): string {
  return `#${w.position} ${w.name}`
}

function de1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',')
}

/**
 * Abschnitt „Statistiken" unter der Rangliste (PROJ-25): Hervorhebungs-Karten
 * (je nur, wenn ihre Bedingung erfüllt ist) und die beiden Diagramme.
 */
export function StatsSection({
  whiskies,
  stats,
}: {
  whiskies: StatsWhisky[]
  stats: ResultStats
}) {
  const { priceValue, spread, noseVsPalate, agreement } = stats
  const hasCards = priceValue || spread.consensus || noseVsPalate || agreement

  return (
    <section className="space-y-3" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="font-display text-lg text-foreground">
        Statistiken
      </h2>

      {hasCards ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {priceValue ? (
            <StatCard icon={<Coins className="h-4 w-4" />} title="Preis-Leistungs-Sieger">
              <p className="font-medium">{label(priceValue.whisky)}</p>
              <p className="text-muted-foreground">
                {de1(priceValue.pointsPer10)} Punkte pro 10 €
              </p>
            </StatCard>
          ) : null}
          {spread.consensus ? (
            <StatCard icon={<Handshake className="h-4 w-4" />} title="Konsens-Whisky">
              <p className="font-medium">{label(spread.consensus.whisky)}</p>
              <p className="text-muted-foreground">
                Hier war sich die Runde am einigsten.
              </p>
            </StatCard>
          ) : null}
          {spread.controversial ? (
            <StatCard icon={<Flame className="h-4 w-4" />} title="Umstrittenster Whisky">
              <p className="font-medium">{label(spread.controversial.whisky)}</p>
              <p className="text-muted-foreground">
                Hier lagen die Bewertungen am weitesten auseinander.
              </p>
            </StatCard>
          ) : null}
          {noseVsPalate ? (
            <StatCard icon={<Wind className="h-4 w-4" />} title="Nase gegen Gaumen">
              <p className="font-medium">{label(noseVsPalate.whisky)}</p>
              <p className="text-muted-foreground">
                Nase Platz {noseVsPalate.noseRank}, Gaumen Platz {noseVsPalate.palateRank}
                {noseVsPalate.noseRank < noseVsPalate.palateRank
                  ? ' — die Nase versprach mehr.'
                  : ' — am Gaumen besser als in der Nase.'}
              </p>
            </StatCard>
          ) : null}
          {agreement ? (
            <StatCard icon={<Target className="h-4 w-4" />} title="Deine Übereinstimmung">
              {agreement.avgDistance === 0 ? (
                <p className="text-muted-foreground">
                  Deine Reihenfolge stimmte{' '}
                  <span className="font-medium text-foreground">genau</span> mit der Runde
                  überein.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Deine Plätze lagen im Schnitt{' '}
                  <span className="font-medium text-foreground">
                    {de1(agreement.avgDistance)} Plätze
                  </span>{' '}
                  neben der Runde.
                </p>
              )}
              <p className="text-muted-foreground">
                Dein Favorit {label(agreement.favorite)} landete in der Runde auf Platz{' '}
                {agreement.favoriteOverallRank}.
              </p>
            </StatCard>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Whiskies im Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricBarChart whiskies={whiskies} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Zusammenhänge</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricScatterChart whiskies={whiskies} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Punkte sind jeweils die Summe aller Bewertungen. Fehlt das Alter, werden 3 Jahre
        angenommen.
      </p>
    </section>
  )
}

function StatCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-1 pt-5 text-sm">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
          {icon}
          {title}
        </p>
        {children}
      </CardContent>
    </Card>
  )
}
