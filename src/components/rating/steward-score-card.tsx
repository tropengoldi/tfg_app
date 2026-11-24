'use client'

import { ChevronDown, Eye, Medal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ScoreField } from '@/components/rating/score-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { clearStewardScoreAction, setStewardScoreAction } from '@/lib/actions/steward-scores'
import { formatPoints, type RatingStep } from '@/lib/points'
import { STEWARD_COMMENT_MAX } from '@/lib/schemas/steward-scores'
import { stewardScorePrivacyHint } from '@/lib/steward-scores'
import { cn } from '@/lib/utils'

const NETWORK_ERROR = 'Verbindung fehlgeschlagen — nicht gespeichert.'

export interface StewardScoreCardProps {
  eventId: string
  stewardName: string | null
  ratingStep: RatingStep
  /** Gespeicherte eigene Note, `null` = noch nicht bewertet. */
  saved: { score: number; comment: string | null } | null
  /** Der letzte Whisky ist im Glas → dezenter Hinweis, falls noch offen. */
  lastWhiskyPoured: boolean
}

/**
 * „Den Steward bewerten" (PROJ-29): aufklappbare Karte unter dem Sieger-Tipp.
 * Note 0–10 in der Schrittweite des Tastings, optionaler Kommentar, Speichern
 * mit 0-Rückfrage, Zurückziehen mit Rückfrage. Alle Regeln prüft die DB (TS028).
 */
export function StewardScoreCard({
  eventId,
  stewardName,
  ratingStep,
  saved,
  lastWhiskyPoured,
}: StewardScoreCardProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState(saved?.score ?? 0)
  const [comment, setComment] = useState(saved?.comment ?? '')
  const [confirmZero, setConfirmZero] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [pending, startTransition] = useTransition()

  const name = stewardName ?? 'Steward'
  const tooLong = comment.trim().length > STEWARD_COMMENT_MAX
  const unchanged =
    saved !== null && saved.score === score && (saved.comment ?? '') === comment.trim()

  function onSave() {
    if (tooLong) return
    if (score === 0) {
      setConfirmZero(true)
      return
    }
    save()
  }

  function save() {
    setConfirmZero(false)
    startTransition(async () => {
      const res = await setStewardScoreAction({ eventId, score, comment }).catch(() => ({
        error: NETWORK_ERROR,
      }))
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setComment((c) => c.trim())
      toast.success(`Note für ${name} gespeichert.`)
      router.refresh()
    })
  }

  function clear() {
    startTransition(async () => {
      const res = await clearStewardScoreAction({ eventId }).catch(() => ({ error: NETWORK_ERROR }))
      setConfirmClear(false)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setScore(0)
      setComment('')
      toast.success('Bewertung zurückgezogen.')
      router.refresh()
    })
  }

  const status = saved ? (
    <span className="font-medium tabular-nums text-foreground">
      Deine Note: {formatPoints(saved.score)}
    </span>
  ) : (
    <span className={cn(lastWhiskyPoured && 'font-medium text-gold')}>Noch nicht bewertet</span>
  )

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-h-14 w-full items-center gap-3 px-6 py-3 text-left"
            aria-label={`Den Steward bewerten: ${name}`}
          >
            <Medal className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Den Steward bewerten</span>
              <span className="flex min-w-0 gap-1 text-xs text-muted-foreground">
                <span className="truncate">{name}</span>
                <span aria-hidden>·</span>
                <span className="shrink-0">{status}</span>
              </span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {stewardScorePrivacyHint(stewardName)}
            </p>

            <ScoreField
              label={`Note für ${name}`}
              value={score}
              max={10}
              step={ratingStep}
              disabled={pending}
              onChange={setScore}
            />

            <div className="space-y-1.5">
              <Label htmlFor="steward-comment">Kommentar (optional)</Label>
              <Textarea
                id="steward-comment"
                rows={2}
                value={comment}
                disabled={pending}
                placeholder="Was war gut, was geht besser?"
                className="text-base"
                aria-invalid={tooLong}
                aria-describedby="steward-comment-count"
                onChange={(e) => setComment(e.target.value)}
              />
              <p
                id="steward-comment-count"
                className={cn('text-right text-xs', tooLong ? 'text-destructive' : 'text-muted-foreground')}
              >
                {comment.trim().length}/{STEWARD_COMMENT_MAX}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {saved ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 text-muted-foreground"
                  disabled={pending}
                  onClick={() => setConfirmClear(true)}
                >
                  Bewertung zurückziehen
                </Button>
              ) : null}
              <Button
                type="button"
                className="min-h-11"
                disabled={pending || tooLong || unchanged}
                onClick={onSave}
              >
                {pending ? 'Wird gespeichert…' : saved ? 'Note ändern' : 'Note speichern'}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <ConfirmDialog
        open={confirmZero}
        onOpenChange={setConfirmZero}
        title="0 Punkte vergeben?"
        description={`Wirklich 0 von 10 Punkten für ${name}?`}
        confirmLabel="Ja, speichern"
        cancelLabel="Zurück"
        pending={pending}
        onConfirm={save}
      />

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Bewertung zurückziehen?"
        description="Deine Note und dein Kommentar werden gelöscht. Du kannst bis zum Abschluss neu bewerten."
        confirmLabel="Zurückziehen"
        destructive
        pending={pending}
        onConfirm={clear}
      />
    </Card>
  )
}
