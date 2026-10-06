'use client'

import { RefreshCw, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { OwnRanking } from '@/components/rating/own-ranking'
import { PositionBar } from '@/components/rating/position-bar'
import { ScoreField } from '@/components/rating/score-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useEventRealtime } from '@/hooks/use-event-realtime'
import { saveRatingAction } from '@/lib/actions/ratings'
import { rankOwnRatings } from '@/lib/own-ranking'
import type { RatingStep } from '@/lib/points'
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
  /** PROJ-19: 1 = ganze, 0,5 = halbe Punkte. */
  ratingStep: RatingStep
  editable: boolean
  /** PROJ-24: Whisky-Namen je ID — nur im abgeschlossenen Tasting gesetzt. */
  whiskyNames?: Record<string, string>
}

export function RatingView({
  eventId,
  currentPosition,
  total,
  whiskies,
  myRatings,
  ratingStep,
  editable,
  whiskyNames,
}: RatingViewProps) {
  const router = useRouter()
  const { isLive, refresh, ping } = useEventRealtime(editable ? eventId : null)
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

  // PROJ-24: eigene Rangliste nur aus gespeicherten Bewertungen.
  const ownRows = useMemo(() => {
    const positionById = new Map(whiskies.map((w) => [w.whisky_id, w.position]))
    return rankOwnRatings(
      myRatings
        .filter((r) => positionById.has(r.whisky_id))
        .map((r) => ({
          whiskyId: r.whisky_id,
          position: positionById.get(r.whisky_id)!,
          nose: r.nose_points,
          taste: r.taste_points,
        })),
    ).map((r) => ({ ...r, name: whiskyNames?.[r.whiskyId] ?? null }))
  }, [whiskies, myRatings, whiskyNames])

  const [focus, setFocus] = useState(() => initialFocus(currentPosition, total))
  const [nose, setNose] = useState(NOSE_DEFAULT)
  const [taste, setTaste] = useState(TASTE_DEFAULT)
  const [notes, setNotes] = useState('')
  const [dirty, setDirty] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null)
  const [confirmZero, setConfirmZero] = useState(false)

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
    // PROJ-19: 0/0 ist erlaubt, aber meist ein Versehen (Slider nicht bewegt).
    if (nose === 0 && taste === 0) {
      setConfirmZero(true)
      return
    }
    save()
  }

  function save() {
    if (!focusWhiskyId) return
    startSaving(async () => {
      // Netzwerkfehler abfangen: Eingaben bleiben stehen (PROJ-22 BUG-1).
      const res = await saveRatingAction(eventId, focusWhiskyId, { nose, taste, notes }).catch(
        () => ({ error: 'Verbindung fehlgeschlagen — Bewertung nicht gespeichert.' }),
      )
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setDirty(false)
      toast.success('Bewertung gespeichert.')
      ping()
      router.refresh()
    })
  }

  const isCurrent = focus === currentPosition
  const alreadySaved = Boolean(savedForFocus) && !dirty

  return (
    <div className="space-y-5">
      {editable && !isLive ? (
        <button
          type="button"
          onClick={refresh}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          Nicht live — tippen zum Aktualisieren
        </button>
      ) : null}

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

          <ScoreField
            label="Nasenpunkte"
            value={nose}
            max={5}
            step={ratingStep}
            disabled={!editable}
            onChange={(v) => {
              setNose(v)
              markDirty()
            }}
          />

          <ScoreField
            label="Gaumenpunkte"
            value={taste}
            max={10}
            step={ratingStep}
            disabled={!editable}
            onChange={(v) => {
              setTaste(v)
              markDirty()
            }}
          />

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

      <OwnRanking rows={ownRows} total={total} focus={focus} onSelect={requestSwitch} />

      <ConfirmDialog
        open={confirmZero}
        onOpenChange={setConfirmZero}
        title="0 Punkte vergeben?"
        description="Wirklich 0 Nasen- und 0 Gaumenpunkte vergeben?"
        confirmLabel="Ja, speichern"
        cancelLabel="Zurück"
        onConfirm={() => {
          setConfirmZero(false)
          save()
        }}
      />

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
