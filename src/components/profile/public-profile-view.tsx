import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEventDate } from '@/lib/dates'
import { ordinalPlace } from '@/lib/personal-balance'
import type { PublicProfileData } from '@/lib/queries/public-profile'

/**
 * Read-only Ansicht eines fremden Profils (PROJ-14). Jedes Feld ist bereits
 * vom Server maskiert — verborgene Felder fehlen hier einfach, es gibt keine
 * „verborgen"-Kennzeichnung. Sind Stammdaten und Bilanz komplett verborgen,
 * bleibt nur die Kopfzeile mit dem Anzeigenamen übrig.
 */
export function PublicProfileView({ profile }: { profile: PublicProfileData }) {
  const hasStammdaten = Boolean(
    profile.favoriteDram || profile.favoriteRegion || profile.bio,
  )
  const balance = profile.balance

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">{profile.displayName}</CardTitle>
        </CardHeader>
        {hasStammdaten ? (
          <CardContent className="space-y-3 text-sm">
            {profile.favoriteDram ? <Row label="Lieblings-Dram" value={profile.favoriteDram} /> : null}
            {profile.favoriteRegion ? (
              <Row label="Lieblingsregion" value={profile.favoriteRegion} />
            ) : null}
            {profile.bio ? <Row label="Über" value={profile.bio} /> : null}
          </CardContent>
        ) : null}
      </Card>

      {profile.showAnyBalance ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Bilanz</CardTitle>
          </CardHeader>
          <CardContent>
            {balance === null ? (
              <p className="text-sm text-muted-foreground">Bilanz gerade nicht verfügbar.</p>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                {balance.tastingCount !== undefined ? (
                  <Stat label="Tastings" value={String(balance.tastingCount)} />
                ) : null}
                {balance.whiskyCount !== undefined ? (
                  <Stat label="Mitgebrachte Whiskys" value={String(balance.whiskyCount)} />
                ) : null}
                {balance.bestPlacement !== undefined ? (
                  <Stat
                    label="Beste Platzierung"
                    value={
                      balance.bestPlacement ? ordinalPlace(balance.bestPlacement.rank) : '—'
                    }
                    sub={
                      balance.bestPlacement
                        ? `${balance.bestPlacement.whiskyName} · ${formatEventDate(balance.bestPlacement.eventDate)}`
                        : 'noch keine Platzierung'
                    }
                  />
                ) : null}
                {balance.avgPointsGiven !== undefined ? (
                  <Stat
                    label="Ø vergebene Punkte"
                    value={balance.avgPointsGiven ? balance.avgPointsGiven.avg : '—'}
                    sub={
                      balance.avgPointsGiven
                        ? `aus ${balance.avgPointsGiven.count} Bewertungen`
                        : 'noch nichts bewertet'
                    }
                  />
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
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
