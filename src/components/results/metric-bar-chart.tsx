'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  METRIC_LABELS,
  formatMetric,
  metricValue,
  type MetricKey,
  type StatsWhisky,
} from '@/lib/result-stats'

const BAR_METRICS: MetricKey[] = ['rank', 'nose', 'taste', 'abv', 'age', 'price']
const SHORT: Record<MetricKey, string> = {
  rank: 'Platz',
  nose: 'Nase',
  taste: 'Gaumen',
  abv: 'Alkohol',
  age: 'Alter',
  price: 'Preis',
  total: 'Gesamt',
}

const config = {
  value: { label: 'Wert', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

function truncate(s: string, n = 13): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

interface Row {
  key: string
  label: string
  fullName: string
  /** Balkenlänge; bei „Platzierung" invertiert (Platz 1 = längster). */
  bar: number
  text: string
  assumed: boolean
  missing: boolean
}

/** Balkendiagramm mit Kennzahl-Umschalter (PROJ-25). */
export function MetricBarChart({ whiskies }: { whiskies: StatsWhisky[] }) {
  const [metric, setMetric] = useState<MetricKey>('rank')
  const n = whiskies.length

  const rows: Row[] = useMemo(
    () =>
      [...whiskies]
        .sort((a, b) => a.rank - b.rank)
        .map((w) => {
          const { value, assumed } = metricValue(w, metric)
          const missing = value === null
          return {
            key: w.whiskyId,
            label: truncate(`#${w.position} ${w.name}`),
            fullName: `#${w.position} ${w.name}`,
            bar: missing ? 0 : metric === 'rank' ? n + 1 - value! : value!,
            text: formatMetric(metric, value) + (assumed ? ' (angenommen)' : ''),
            assumed,
            missing,
          }
        }),
    [whiskies, metric, n],
  )

  return (
    <div className="space-y-3">
      <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
        <TabsList
          aria-label="Kennzahl"
          className="grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-6"
        >
          {BAR_METRICS.map((m) => (
            <TabsTrigger key={m} value={m} className="min-h-9 text-xs" aria-label={METRIC_LABELS[m]}>
              {SHORT[m]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height: Math.max(120, rows.length * 34 + 16) }}
        aria-label={`Balkendiagramm: ${METRIC_LABELS[metric]}`}
      >
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 96, top: 4, bottom: 4 }}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const r = payload?.[0]?.payload as Row | undefined
              if (!active || !r) return null
              return (
                <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs shadow">
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-muted-foreground">
                    {METRIC_LABELS[metric]}: {r.text}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="bar" radius={4} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell
                key={r.key}
                fill="var(--color-value)"
                fillOpacity={r.assumed ? 0.4 : 1}
              />
            ))}
            {/* Eigene Beschriftung: Recharts würde „3 J. (angenommen)" sonst umbrechen. */}
            <LabelList
              dataKey="text"
              content={({ x, y, width, height, value }) => (
                <text
                  x={Number(x) + Number(width) + 6}
                  y={Number(y) + Number(height) / 2}
                  dominantBaseline="central"
                  className="fill-foreground"
                  fontSize={11}
                >
                  {String(value)}
                </text>
              )}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
