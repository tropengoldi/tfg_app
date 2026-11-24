'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Bug, CheckCircle2, Info, Lightbulb, Loader2, MessageCircle, type LucideIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { sendFeedbackAction } from '@/lib/actions/feedback'
import {
  FEEDBACK_KIND_LABEL,
  FEEDBACK_KINDS,
  FEEDBACK_MAX,
  feedbackSchema,
  type FeedbackKind,
} from '@/lib/schemas/feedback'
import { cn } from '@/lib/utils'

const KIND_ICON: Record<FeedbackKind, LucideIcon> = {
  bug: Bug,
  wish: Lightbulb,
  other: MessageCircle,
}

const PLACEHOLDER: Record<FeedbackKind | 'none', string> = {
  none: 'Worum geht es?',
  bug: 'Was hast du gemacht, was ist passiert, was hättest du erwartet?',
  wish: 'Was würdest du dir wünschen – und wofür wäre es gut?',
  other: 'Was möchtest du loswerden?',
}

const NETWORK_ERROR = 'Keine Verbindung – bitte versuch es gleich noch einmal.'

interface FieldErrors {
  kind?: string
  description?: string
}

export function FeedbackForm({ from }: { from: string | null }) {
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState<FeedbackKind | ''>('')
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const length = description.trim().length
  const tooLong = length > FEEDBACK_MAX

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setError(null)

    const parsed = feedbackSchema.safeParse({ kind: kind || undefined, description })
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if ((key === 'kind' || key === 'description') && !next[key]) next[key] = issue.message
      }
      setFieldErrors(next)
      return
    }
    setFieldErrors({})

    startTransition(async () => {
      try {
        const res = await sendFeedbackAction({ ...parsed.data, from: from ?? undefined })
        if ('error' in res) {
          setError(res.error)
          return
        }
        setSent(true)
        setKind('')
        setDescription('')
      } catch {
        setError(NETWORK_ERROR)
      }
    })
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
          <p role="status" className="font-display text-lg">
            Danke! Deine Nachricht ist beim Admin angekommen.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild className="min-h-11">
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => setSent(false)}>
              Noch etwas melden
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Deine Nachricht</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Worum geht es?</legend>
            <RadioGroup
              value={kind}
              onValueChange={(v) => {
                setKind(v as FeedbackKind)
                setFieldErrors((f) => ({ ...f, kind: undefined }))
              }}
              className="grid grid-cols-3 gap-2"
              aria-invalid={Boolean(fieldErrors.kind)}
              aria-describedby={fieldErrors.kind ? 'feedback-kind-error' : undefined}
            >
              {FEEDBACK_KINDS.map((k) => {
                const Icon = KIND_ICON[k]
                const id = `feedback-kind-${k}`
                return (
                  <Label
                    key={k}
                    htmlFor={id}
                    className={cn(
                      'flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-border p-2 text-center text-sm font-medium transition-colors hover:bg-accent',
                      kind === k && 'border-primary bg-accent text-primary',
                    )}
                  >
                    <RadioGroupItem value={k} id={id} className="sr-only" />
                    <Icon className="h-5 w-5" aria-hidden />
                    {FEEDBACK_KIND_LABEL[k]}
                  </Label>
                )
              })}
            </RadioGroup>
            {fieldErrors.kind ? (
              <p id="feedback-kind-error" className="text-sm text-destructive">
                {fieldErrors.kind}
              </p>
            ) : null}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="feedback-description">Beschreibung</Label>
            <Textarea
              id="feedback-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (fieldErrors.description) setFieldErrors((f) => ({ ...f, description: undefined }))
              }}
              placeholder={PLACEHOLDER[kind || 'none']}
              rows={6}
              aria-invalid={Boolean(fieldErrors.description) || tooLong}
              aria-describedby="feedback-description-count feedback-description-error"
            />
            <div className="flex items-start justify-between gap-3 text-xs">
              <p id="feedback-description-error" className="text-sm text-destructive">
                {fieldErrors.description ?? ''}
              </p>
              <p
                id="feedback-description-count"
                className={cn('shrink-0 tabular-nums text-muted-foreground', tooLong && 'font-medium text-destructive')}
              >
                {length} / {FEEDBACK_MAX}
              </p>
            </div>
          </div>

          <p className="flex gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Deine Nachricht geht mit deinem Namen und deiner E-Mail-Adresse an den Admin – dazu technische Angaben
            (Seite, Gerät/Browser), damit sich ein Fehler nachvollziehen lässt.
          </p>

          <Button type="submit" className="min-h-11 w-full" disabled={pending || tooLong}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird gesendet …
              </>
            ) : (
              'Absenden'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
