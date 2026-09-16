'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateVisibilityAction } from '@/lib/actions/profile-visibility'
import { type VisibilityField } from '@/lib/schemas/profile-visibility'

const FIELD_LABELS: Record<VisibilityField, string> = {
  show_favorite_dram: 'Lieblings-Dram',
  show_favorite_region: 'Lieblingsregion',
  show_bio: 'Kurzbeschreibung',
  show_tasting_count: 'Anzahl Tastings',
  show_whisky_count: 'Mitgebrachte Whiskys',
  show_best_placement: 'Beste Platzierung',
  show_avg_points: 'Ø vergebene Punkte',
}

const GROUPS: { title: string; fields: VisibilityField[] }[] = [
  {
    title: 'Stammdaten',
    fields: ['show_favorite_dram', 'show_favorite_region', 'show_bio'],
  },
  {
    title: 'Persönliche Bilanz',
    fields: [
      'show_tasting_count',
      'show_whisky_count',
      'show_best_placement',
      'show_avg_points',
    ],
  },
]

export function VisibilitySettings({
  defaultValues,
}: {
  defaultValues: Record<VisibilityField, boolean>
}) {
  const [values, setValues] = useState(defaultValues)
  const [, startTransition] = useTransition()

  function toggle(field: VisibilityField, next: boolean) {
    const previous = values[field]
    setValues((v) => ({ ...v, [field]: next }))
    startTransition(async () => {
      const res = await updateVisibilityAction({ field, value: next })
      if ('error' in res) {
        setValues((v) => ({ ...v, [field]: previous }))
        toast.error(res.error)
        return
      }
      toast.success('Gespeichert.')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Sichtbarkeit für andere</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Dein Anzeigename ist immer sichtbar. Für alles andere entscheidest du hier einzeln,
          was die Runde von dir sieht.
        </p>
        {GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{group.title}</h3>
            <div className="divide-y divide-border">
              {group.fields.map((field) => (
                <div
                  key={field}
                  className="flex min-h-11 items-center justify-between gap-4 py-1"
                >
                  <Label htmlFor={field} className="text-sm font-normal">
                    {FIELD_LABELS[field]}
                  </Label>
                  <Switch
                    id={field}
                    checked={values[field]}
                    onCheckedChange={(checked) => toggle(field, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
