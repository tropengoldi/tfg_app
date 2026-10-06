'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { sendMessageAction } from '@/lib/actions/messages'
import { formatEventDate } from '@/lib/dates'
import type { ComposeData, ComposeRecipient } from '@/lib/queries/messages'

type Mode = 'general' | 'tasting'

export function MessageComposer({ activeMembers, myTastings, testOnly }: ComposeData) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<Mode>('general')
  const [tastingId, setTastingId] = useState<string>(myTastings[0]?.id ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedTasting = myTastings.find((t) => t.id === tastingId) ?? null
  const candidates: ComposeRecipient[] = useMemo(
    () => (mode === 'general' ? activeMembers : (selectedTasting?.participants ?? [])),
    [mode, activeMembers, selectedTasting],
  )

  function switchMode(next: string) {
    const m = next as Mode
    setMode(m)
    setError(null)
    if (m === 'tasting') {
      const t = myTastings.find((x) => x.id === tastingId) ?? myTastings[0] ?? null
      setTastingId(t?.id ?? '')
      setSelected(new Set((t?.participants ?? []).map((p) => p.id)))
    } else {
      setSelected(new Set())
    }
  }

  function switchTasting(id: string) {
    setTastingId(id)
    const t = myTastings.find((x) => x.id === id)
    setSelected(new Set((t?.participants ?? []).map((p) => p.id)))
  }

  function toggleRecipient(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function onSubmit() {
    setError(null)
    const recipientIds = [...selected]
    startTransition(async () => {
      const res = await sendMessageAction({
        body,
        recipientIds,
        eventId: mode === 'tasting' ? tastingId || null : null,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      toast.success('Nachricht verschickt.')
      setBody('')
      setSelected(mode === 'tasting' ? new Set((selectedTasting?.participants ?? []).map((p) => p.id)) : new Set())
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Neue Nachricht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {testOnly ? (
          <Alert>
            <AlertDescription>
              Du bist als Testkonto angemeldet und kannst nur andere Testkonten anschreiben.
            </AlertDescription>
          </Alert>
        ) : null}
        <Tabs value={mode} onValueChange={switchMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="tasting">Zu einem Tasting</TabsTrigger>
          </TabsList>
        </Tabs>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {mode === 'tasting' && myTastings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Du bist noch an keinem Tasting beteiligt.
          </p>
        ) : (
          <>
            {mode === 'tasting' ? (
              <div className="space-y-2">
                <Label htmlFor="tasting-select">Tasting</Label>
                <Select value={tastingId} onValueChange={switchTasting}>
                  <SelectTrigger id="tasting-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {myTastings.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {formatEventDate(t.eventDate)} · {t.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Empfänger</Label>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {mode === 'tasting'
                    ? 'Für dieses Tasting gibt es niemanden zum Anschreiben.'
                    : 'Keine anderen aktiven Mitglieder gefunden.'}
                </p>
              ) : (
                <div className="divide-y divide-border rounded-md border border-border">
                  {candidates.map((c) => (
                    <label
                      key={c.id}
                      htmlFor={`recipient-${c.id}`}
                      className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-1"
                    >
                      <Checkbox
                        id={`recipient-${c.id}`}
                        checked={selected.has(c.id)}
                        onCheckedChange={(checked) => toggleRecipient(c.id, checked === true)}
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-body">Nachricht</Label>
              <Textarea
                id="message-body"
                rows={4}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Was möchtest du der Runde sagen?"
              />
            </div>

            <Button
              type="button"
              disabled={pending}
              onClick={onSubmit}
              className="w-full"
            >
              {pending ? 'Wird gesendet…' : 'Senden'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
