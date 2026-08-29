'use client'

import { CheckCheck, ChevronRight, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { WhiskyOrderList } from '@/components/host/whisky-order-list'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { closeEventAction, nextRoundAction } from '@/lib/actions/host-control'
import { isLastWhisky, nextRoundLabel } from '@/lib/host-order'
import type { OrderedWhisky, RatingProgress } from '@/lib/queries/host-control'

interface RunPanelProps {
  eventId: string
  currentPosition: number
  whiskies: OrderedWhisky[]
  progress: RatingProgress | null
}

export function RunPanel({ eventId, currentPosition, whiskies, progress }: RunPanelProps) {
  const router = useRouter()
  const total = whiskies.length
  const last = isLastWhisky(currentPosition, total)
  const nameById = new Map(whiskies.map((w) => [w.whisky_id, w.name]))

  const [advancing, startAdvancing] = useTransition()
  const [closing, startClosing] = useTransition()
  const [refreshing, startRefreshing] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const busy = advancing || closing || refreshing

  function onNext() {
    startAdvancing(async () => {
      const res = await nextRoundAction(eventId, currentPosition)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      router.refresh()
    })
  }

  function onClose() {
    startClosing(async () => {
      const res = await closeEventAction(eventId)
      setConfirmOpen(false)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Tasting abgeschlossen.')
      router.refresh()
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Läuft gerade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-display text-2xl">
            Whisky {currentPosition} von {total}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {progress
                ? `${progress.rated} von ${progress.participants} haben bewertet`
                : 'Bewertungen werden gezählt …'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Bewertungsstand aktualisieren"
              disabled={busy}
              onClick={() => startRefreshing(() => router.refresh())}
            >
              <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            </Button>
          </div>

          {last ? (
            <Button onClick={() => setConfirmOpen(true)} disabled={busy} className="w-full">
              <CheckCheck className="h-4 w-4" />
              Tasting abschließen
            </Button>
          ) : (
            <>
              <Button onClick={onNext} disabled={busy} className="w-full">
                {advancing ? 'Wird weitergeschaltet…' : nextRoundLabel(currentPosition, total)}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen(true)}
                disabled={busy}
                className="w-full text-muted-foreground"
              >
                Tasting abschließen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Reihenfolge</CardTitle>
        </CardHeader>
        <CardContent>
          <WhiskyOrderList
            ids={whiskies.map((w) => w.whisky_id)}
            nameById={nameById}
            editable={false}
            changed={false}
            saving={false}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            onShuffle={() => {}}
            onSave={() => {}}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && setConfirmOpen(false)}
        title="Tasting abschließen?"
        description="Danach werden die Whisky-Namen aufgelöst und die Rangliste erscheint. Keine Bewertung lässt sich mehr ändern — das kann nicht rückgängig gemacht werden."
        confirmLabel="Abschließen"
        destructive
        pending={closing}
        onConfirm={onClose}
      />
    </>
  )
}
