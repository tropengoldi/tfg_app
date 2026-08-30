'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PositionBar } from '@/components/rating/position-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { saveRatingAction } from '@/lib/actions/ratings'
import { ratingFormSchema } from '@/lib/schemas/rating'
import {
  NOSE_DEFAULT,
  TASTE_DEFAULT,
  initialFocus,
  ratedPositions as computeRated,
  ratingsKey,
  type MyRating,
  type WhiskyPosition,
} from '@/lib/rating-view'

interface RatingViewProps {
  eventId: string
  currentPosition: number
  total: number
  whiskies: WhiskyPosition[]
  myRatings: MyRating[]
  editable: boolean
}

export function RatingView({
  eventId,
  currentPosition,
  total,
  whiskies,
  myRatings,
  editable,
}: RatingViewProps) {
  const router = useRouter()
  const [pending, startSaving] = useTransition()
  const [refreshing, startRefreshing] = useTransition()

  const whiskyByPosition = useMemo(
    () => new Map(whiskies.map((w) => [w.position, w.whisky_id])),
    [whiskies],
  )
  const ratingByWhisky = useMemo(
    () => new Map(myRatings.map((r) => [r.whisky_id, r])),
    [myRatings],
  )
  const rated = useMemo(() => computeRated(whiskies, myRatings), [whiskies, myRatings])
  const rKey = ratingsKey(myRatings)

  const [focus, setFocus] = useState(() => initialFocus(currentPosition, total))
  const [nose, setNose] = useState(NOSE_DEFAULT)
  const [taste, setTaste] = useState(TASTE_DEFAULT)
  const [notes, setNotes] = useState('')
  const [dirty, setDirty] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null)

  const dirtyRef = useRef(false)
  dirtyRef.current = dirty

  const focusWhiskyId = whiskyByPosition.get(focus)
  const savedForFocus = focusWhiskyId ? ratingByWhisky.get(focusWhiskyId) : undefined

  // Werte für die fokussierte Position aus dem Serverstand übernehmen.
  useEffect(() => {
    const r = focusWhiskyId ? ratingByWhisky.get(focusWhiskyId) : undefined
    setNose(r?.nose_points ?? NOSE_DEFAULT)
    setTaste(r?.taste_points ?? TASTE_DEFAULT)
    setNotes(r?.notes ?? '')
    setDirty(false)
    setNotesError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, rKey, focusWhiskyId])

  // Nach „Aktualisieren": schaltet der Gastgeber weiter, springt der Fokus auf den
  // neuen aktuellen Whisky — aber nur, wenn nichts Ungespeichertes offen ist.
  useEffect(() => {
    if (!dirtyRef.current && editable && currentPosition >= 1) {
      setFocus(Math.min(currentPosition, total))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition])

  function markDirty() {
    setDirty(true)
  }

  function requestSwitch(pos: number) {
    if (pos === focus) return
    if (dirtyRef.current) setPendingSwitch(pos)
    else setFocus(pos)
  }

  function onSave() {
    const check = ratingFormSchema.safeParse({ nose, taste, notes })
    if (!check.success) {
      setNotesError(check.error.issues[0]?.message ?? 'Ungültige Eingabe.')
      return
    }
    if (!focusWhiskyId) return
    startSaving(async () => {
      const res = await saveRatingAction(eventId, focusWhiskyId, { nose, taste, notes })
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setDirty(false)
      toast.success('Bewertung gespeichert.')
      router.refresh()
    })
  }

  const isCurrent = focus === currentPosition
  const alreadySaved = Boolean(savedForFocus) && !dirty

  return (
    <div className="space-y-5">
      <PositionBar
        total={total}
        currentPosition={currentPosition}
        focus={focus}
        ratedPositions={rated}
        onSelect={requestSwitch}
      />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl">
                Whisky {focus} von {total}
              </p>
              <p className="text-sm text-muted-foreground">
                {alreadySaved
                  ? 'Gespeichert — du kannst die Werte noch ändern.'
                  : dirty
                    ? 'Noch nicht gespeichert.'
                    : 'Noch nicht bewertet.'}
              </p>
            </div>
            {editable ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Aktualisieren"
                disabled={pending || refreshing}
                onClick={() => startRefreshing(() => router.refresh())}
              >
                <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              </Button>
            ) : null}
          </div>

          {!isCurrent && editable ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-accent px-3 py-2 text-sm">
              <span>
                Du siehst Whisky {focus} — aktuell ist Whisky {currentPosition}.
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => requestSwitch(currentPosition)}
              >
                Zum aktuellen Whisky
              </Button>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium">Nase</label>
              <span className="font-display text-3xl tabular-nums">{nose}</span>
            </div>
            <Slider
              value={[nose]}
              min={1}
              max={5}
              step={1}
              disabled={!editable}
              aria-label="Nasenpunkte"
              onValueChange={([v]) => {
                setNose(v)
                markDirty()
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium">Geschmack</label>
              <span className="font-display text-3xl tabular-nums">{taste}</span>
            </div>
            <Slider
              value={[taste]}
              min={1}
              max={10}
              step={1}
              disabled={!editable}
              aria-label="Geschmackspunkte"
              onValueChange={([v]) => {
                setTaste(v)
                markDirty()
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="rating-notes">
              Notiz für dich (optional)
            </label>
            <Textarea
              id="rating-notes"
              rows={3}
              value={notes}
              disabled={!editable}
              placeholder="Was riechst und schmeckst du? Sieht sonst niemand."
              onChange={(e) => {
                setNotes(e.target.value)
                setNotesError(null)
                markDirty()
              }}
            />
            {notesError ? (
              <p className="text-sm text-destructive">{notesError}</p>
            ) : null}
          </div>

          {editable ? (
            <Button onClick={onSave} disabled={pending} className="w-full sm:w-auto">
              {pending ? 'Wird gespeichert…' : 'Speichern'}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingSwitch !== null}
        onOpenChange={(o) => !o && setPendingSwitch(null)}
        title="Nicht gespeicherte Bewertung"
        description="Du hast Werte geändert, aber nicht gespeichert. Trotzdem zu einem anderen Whisky wechseln?"
        confirmLabel="Wechseln"
        cancelLabel="Hier bleiben"
        onConfirm={() => {
          if (pendingSwitch !== null) setFocus(pendingSwitch)
          setPendingSwitch(null)
        }}
      />
    </div>
  )
}
