'use client'

import { useMemo, useState } from 'react'
import { CartesianGrid, Cell, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts'

import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  METRIC_LABELS,
  chartSummary,
  formatMetric,
  metricValue,
  type MetricKey,
  type StatsWhisky,
} from '@/lib/result-stats'

const AXIS_METRICS: MetricKey[] = ['total', 'nose', 'taste', 'abv', 'age', 'price']

const config = {
  whisky: { label: 'Whisky', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

interface Point {
  key: string
  name: string
  x: number
  y: number
  xText: string
  yText: string
  assumed: boolean
}

/** Punktdiagramm mit frei wählbaren Achsen (PROJ-25). Start: Alter × Gesamtpunkte. */
export function MetricScatterChart({ whiskies }: { whiskies: StatsWhisky[] }) {
  const [xMetric, setX] = useState<MetricKey>('age')
  const [yMetric, setY] = useState<MetricKey>('total')

  const { points, omitted } = useMemo(() => {
    const pts: Point[] = []
    let skipped = 0
    for (const w of whiskies) {
      const x = metricValue(w, xMetric)
      const y = metricValue(w, yMetric)
      if (x.value === null || y.value === null) {
        skipped++
        continue
      }
      pts.push({
        key: w.whiskyId,
        name: `#${w.position} ${w.name}`,
        x: x.value,
        y: y.value,
        xText: formatMetric(xMetric, x.value) + (x.assumed ? ' (angenommen)' : ''),
        yText: formatMetric(yMetric, y.value) + (y.assumed ? ' (angenommen)' : ''),
        assumed: x.assumed || y.assumed,
      })
    }
    return { points: pts, omitted: skipped }
  }, [whiskies, xMetric, yMetric])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <AxisSelect id="scatter-x" label="Waagerecht" value={xMetric} onChange={setX} />
        <AxisSelect id="scatter-y" label="Senkrecht" value={yMetric} onChange={setY} />
      </div>

      {points.length < 2 ? (
        <p className="rounded-md bg-muted px-3 py-6 text-center text-sm text-muted-foreground">
          Zu wenige Angaben für dieses Diagramm.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-64 w-full"
          role="img"
          aria-label={chartSummary(
            `Punktdiagramm ${METRIC_LABELS[xMetric]} gegen ${METRIC_LABELS[yMetric]}`,
            points.map((p) => ({ name: p.name, text: `${p.xText}, ${p.yText}` })),
          )}
        >
          <ScatterChart margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={METRIC_LABELS[xMetric]}
              domain={['auto', 'auto']}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={METRIC_LABELS[yMetric]}
              domain={['auto', 'auto']}
              width={36}
              tickLine={false}
            />
            <ZAxis range={[90, 90]} />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as Point | undefined
                if (!active || !p) return null
                return (
                  <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs shadow">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground">
                      {METRIC_LABELS[xMetric]}: {p.xText}
                    </p>
                    <p className="text-muted-foreground">
                      {METRIC_LABELS[yMetric]}: {p.yText}
                    </p>
                  </div>
                )
              }}
            />
            <Scatter data={points} isAnimationActive={false}>
              {points.map((p) => (
                <Cell
                  key={p.key}
                  fill="var(--color-whisky)"
                  fillOpacity={p.assumed ? 0.35 : 0.9}
                  stroke="var(--color-whisky)"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ChartContainer>
      )}

      {omitted > 0 ? (
        <p className="text-xs text-muted-foreground">
          {omitted === 1 ? '1 Whisky' : `${omitted} Whiskies`} ohne Angabe nicht dargestellt.
        </p>
      ) : null}
      {points.some((p) => p.assumed) ? (
        <p className="text-xs text-muted-foreground">
          Blasse Punkte: Alter nicht angegeben, 3 Jahre angenommen.
        </p>
      ) : null}
    </div>
  )
}

function AxisSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: MetricKey
  onChange: (m: MetricKey) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as MetricKey)}>
        <SelectTrigger id={id} className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AXIS_METRICS.map((m) => (
            <SelectItem key={m} value={m}>
              {METRIC_LABELS[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
