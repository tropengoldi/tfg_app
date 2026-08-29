'use client'

import { CheckCircle2, Circle, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { WhiskyOrderList } from '@/components/host/whisky-order-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  saveWhiskyOrderAction,
  startEventAction,
} from '@/lib/actions/host-control'
import { moveDown, moveUp, sameOrder, shuffle } from '@/lib/host-order'
import type { OrderedWhisky } from '@/lib/queries/host-control'

export function DraftControls({
  eventId,
  whiskies,
}: {
  eventId: string
  whiskies: OrderedWhisky[]
}) {
  const router = useRouter()
  const initialIds = whiskies.map((w) => w.whisky_id)
  const nameById = new Map(whiskies.map((w) => [w.whisky_id, w.name]))

  const [ids, setIds] = useState<string[]>(initialIds)
  const [savingOrder, startSaveOrder] = useTransition()
  const [starting, startStarting] = useTransition()

  const changed = !sameOrder(ids, initialIds)
  const busy = savingOrder || starting

  function onSaveOrder() {
    startSaveOrder(async () => {
      const res = await saveWhiskyOrderAction(eventId, ids)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Reihenfolge gespeichert.')
      router.refresh()
    })
  }

  function onStart() {
    startStarting(async () => {
      const res = await startEventAction(eventId, changed ? ids : undefined)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Tasting gestartet.')
      router.refresh()
    })
  }

  const hasWhiskies = ids.length > 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Ausschankreihenfolge</CardTitle>
        </CardHeader>
        <CardContent>
          <WhiskyOrderList
            ids={ids}
            nameById={nameById}
            editable
            changed={changed}
            saving={busy}
            onMoveUp={(i) => setIds((cur) => moveUp(cur, i))}
            onMoveDown={(i) => setIds((cur) => moveDown(cur, i))}
            onShuffle={() => setIds((cur) => shuffle(cur))}
            onSave={onSaveOrder}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Tasting starten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="flex items-center gap-2 text-sm">
            {hasWhiskies ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            {hasWhiskies
              ? `${ids.length} ${ids.length === 1 ? 'Whisky' : 'Whiskys'} eingetragen`
              : 'Es ist noch kein Whisky eingetragen.'}
          </p>
          <Button onClick={onStart} disabled={!hasWhiskies || busy}>
            <Play className="h-4 w-4" />
            {starting ? 'Wird gestartet…' : 'Tasting starten'}
          </Button>
          {changed ? (
            <p className="text-xs text-muted-foreground">
              Die geänderte Reihenfolge wird beim Start automatisch übernommen.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
