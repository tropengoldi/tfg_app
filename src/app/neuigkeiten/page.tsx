import type { Metadata } from 'next'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Neuigkeiten',
  description: 'Was es Neues in Whizzky gibt — die Release Notes für die Runde.',
  // Öffentlich teilbar (PROJ-27), aber nicht für Suchmaschinen.
  robots: { index: false, follow: false },
}

/**
 * Release Notes zu PROJ-18 … PROJ-26 (PROJ-27). Öffentlich ohne Anmeldung
 * (`PUBLIC_PATHS` in `src/proxy.ts`), reiner Inhalt. Hintergrund = der dezente
 * Marken-Hintergrund aus PROJ-13; der Text liegt auf einer ruhigen Karte.
 */
export default function NeuigkeitenPage() {
  return (
    <div className="relative min-h-dvh px-4 py-10 sm:py-14">
      <div aria-hidden className="brand-surface pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-0.5 text-center">
          <p className="font-display text-3xl leading-none text-primary">Whizzky</p>
          <p className="text-sm text-muted-foreground">Treffpunkt feiner Geister</p>
        </div>

        <Card className="border-gold/20 shadow-lg">
          <CardContent className="space-y-8 px-5 py-8 sm:px-10 sm:py-10">
            <header className="space-y-3 border-b border-gold/25 pb-6">
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">
                Was gibt&apos;s Neues im Glas?
              </h1>
              <p className="text-sm text-muted-foreground">Stand 9. Oktober 2026</p>
              <p className="leading-relaxed">
                Whizzky hat seit dem letzten Abend ordentlich nachgeschenkt: neun Neuerungen, von
                halben Punkten bis zum Sieger-Tipp. Hier der Überblick in einem Schluck – ohne
                Abgang, aber mit viel Nachhall.
              </p>
              <p className="leading-relaxed">
                Kurz vorweg: Ihr müsst nichts installieren und nichts einstellen. Die App
                aktualisiert sich von selbst, beim nächsten Öffnen ist alles da.
              </p>
            </header>

            <Section title="Neue Begriffe: Nase, Gaumen, Steward">
              <p>
                Wir reden jetzt wie die Profis. Aus „Nase“ wurden <b>Nasenpunkte</b>, aus
                „Geschmack“ die <b>Gaumenpunkte</b>. Und der frühere „Helfer“ trägt ab sofort den
                Titel, den er verdient: <b>Whisky-Steward</b>. Er schenkt aus, steuert den Abend und
                verkostet selbst nicht mit – die ehrenvollste Form der Abstinenz.
              </p>
            </Section>

            <Section title="Punkte: jetzt auch null und halb">
              <p>
                Manche Drams verdienen schlicht <b>0 Punkte</b> – das geht jetzt ganz offiziell.
                Nasenpunkte reichen von 0 bis 5, Gaumenpunkte von 0 bis 10.
              </p>
              <p>
                Wer zwischen 7 und 8 schwankt, muss sich nicht mehr quälen: Der Admin kann pro
                Tasting <b>halbe Punkte</b> erlauben. Die Regler starten bei 0 und haben Plus- und
                Minus-Knöpfe für zittrige Hände. Und wer zweimal 0 vergibt, wird sicherheitshalber
                gefragt, ob das wirklich so gemeint war.
              </p>
            </Section>

            <Section title="Der Whisky-Steward wird mächtiger">
              <p>
                <b>Er sieht live mit.</b> Während des Abends sieht der Steward auf seiner
                Steuerungsseite alle Wertungen: wer wie viele Punkte vergeben hat, eure{' '}
                <b>Notizen</b> und eure Sieger-Tipps. So kann er nachhaken, wenn jemand dem
                Lieblings-Islay nur drei Gaumenpunkte gönnt.
              </p>
              <p>
                Wichtig für euch: Gibt es einen Steward, steht beim Notizfeld und beim Tipp ein
                kleiner Hinweis mit Auge. Schreibt also nichts in die Notiz, was ihr ihm nicht auch
                ins Gesicht sagen würdet. Nach dem Abschluss sind eure Notizen wieder nur für euch –
                und Gastgeber, Admin und Mitverkoster sehen sie nie.
              </p>
              <p>
                <b>Er bringt auch eine Flasche mit.</b> Der Steward darf jetzt eigene Whiskies
                eintragen, mit demselben Limit wie alle anderen. Ihr bewertet sie blind wie jeden
                anderen Dram. In seiner Bilanz zählen sie als mitgebrachte Whiskies, als Tasting
                zählt der Abend für ihn aber nicht – er hat ja nicht mitgetrunken.
              </p>
            </Section>

            <Section title="Sieger-Tipp und „Kenner der Woche“">
              <p>
                Während des Abends tippt jeder blind, welcher Whisky am Ende gewinnt – „Whisky 3“,
                mehr weiß ja keiner. Den Tipp könnt ihr bis zum Abschluss ändern, die Tipps der
                anderen bleiben bis dahin geheim.
              </p>
              <p>
                Wer richtig lag, wird auf der Ergebnisseite als <b>Kenner der Woche</b> gefeiert.
                Unter „Alle Tipps“ sieht man, wer sonst noch daneben lag. In eurer Bilanz zählt ein
                eigener Zähler mit, wie oft ihr schon Kenner wart – und ob andere das sehen dürfen,
                entscheidet ihr selbst im Profil.
              </p>
            </Section>

            <Section title="Neu während des Abends">
              <p>
                <b>Meine Rangliste.</b> Unter der Bewertung klappt ihr eure persönliche Rangliste
                auf, berechnet nur aus euren eigenen Punkten. Ein Tippen auf eine Zeile springt zu
                dem Whisky, ein Tippen auf den Pokal macht ihn zu eurem Sieger-Tipp. Nach dem
                Abschluss stehen dort auch die Namen.
              </p>
              <p>
                <b>Vergleichen mit.</b> „Die 2 und die 5 will ich nochmal nebeneinander“ – dafür
                gibt es jetzt den Vergleichs-Merker. Unter „Speichern“ tippt ihr die Nummern der
                Whiskies an, die ihr zusammen nachprobieren wollt. Daraus wird eine Gruppe, die bei
                jedem ihrer Whiskies erscheint („In Gruppe mit 5 und 7“). Ein Tippen speichert
                sofort, ein zweites nimmt den Whisky wieder raus. Das sieht niemand außer euch, auch
                nicht der Steward, und nach dem Abend ist alles wieder weg.
              </p>
            </Section>

            <Section title="Neu nach dem Abend: Statistik für Nerds">
              <p>Die Ergebnisseite hat deutlich mehr Körper bekommen:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-gold">
                <li>
                  <b>Ausschank-Nummer und „Dein Platz“:</b> Bei jedem Whisky steht, als wievielter
                  er ausgeschenkt wurde und auf welchen Platz ihr ihn persönlich gesetzt habt.
                  Ideal, um festzustellen, wie weit man vom Rest der Runde entfernt liegt.
                </li>
                <li>
                  <b>Statistik-Karten:</b> Preis-Leistungs-Sieger, der Whisky mit der größten
                  Einigkeit und der umstrittenste, wo Nase und Gaumen am weitesten auseinanderlagen
                  und wie gut euer Geschmack zur Runde passt.
                </li>
                <li>
                  <b>Diagramme:</b> ein Balkendiagramm zum Umschalten (Platz, Nase, Gaumen, Alkohol,
                  Alter, Preis) und ein Punktdiagramm mit frei wählbaren Achsen – etwa: Macht Alter
                  wirklich besser?
                </li>
              </ul>
              <p>
                Damit das klappt, hat das Eintrage-Formular drei neue, freiwillige Felder:{' '}
                <b>Alkohol (%)</b>, <b>Alter</b> und <b>Preis (€)</b>. Die bleiben bis zum
                Abschluss geheim und werden erst dann für alle aufgedeckt. Bitte tragt sie ein,
                sonst bleibt die Preis-Leistungs-Karte traurig leer.
              </p>
            </Section>

            <Section title="Hinter den Kulissen">
              <p>
                <b>Unsichtbare Testkonten.</b> Für Probeläufe gibt es jetzt Testkonten, die ihr
                nirgends seht – weder in Teilnehmerlisten noch in der Historie, und Test-Tastings
                tauchen auch nicht in eurer Bilanz auf. Kurz: Wenn die App heimlich mit sich selbst
                trinkt, merkt ihr nichts davon.
              </p>
              <p>
                <b>Kleinigkeiten:</b> Das Dashboard springt beim Weiterschalten zuverlässiger mit,
                auch wenn ihr genau beim Laden die Seite öffnet. Auf „Meine Whiskys“ steht jetzt
                korrekt, wer eure Angaben vor dem Abschluss sieht (Gastgeber oder Steward). Und die
                Diagramme lassen sich auch mit dem Screenreader erkunden.
              </p>
            </Section>

            <Section title="Zum Wohl">
              <p>
                Findet ihr etwas, das klemmt, oder habt ihr eine Idee für den nächsten Abend:
                einfach beim Admin melden. Bis dahin gilt die alte Regel – halbe Punkte für den
                Whisky, volle Punkte für die Runde. <span lang="gd">Slàinte mhath!</span>
              </p>
            </Section>
          </CardContent>
        </Card>

        <p className="text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
          >
            Zur App
          </Link>
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl leading-snug">{title}</h2>
      <div className="space-y-3 leading-relaxed [&_b]:font-semibold [&_b]:text-foreground">
        {children}
      </div>
    </section>
  )
}
