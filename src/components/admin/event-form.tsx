'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { EventDateField } from '@/components/admin/event-date-field'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { TestBadge } from '@/components/common/test-badge'
import {
  ParticipantPicker,
  type PickerMember,
} from '@/components/admin/participant-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEventAction, updateEventAction } from '@/lib/actions/admin-events'
import { eventFormSchema, type EventFormInput } from '@/lib/schemas/admin-events'
import { tastingMix } from '@/lib/test-accounts'

interface EventFormProps {
  members: PickerMember[]
  mode: 'create' | 'edit'
  eventId?: string
  defaultValues: EventFormInput
}

export function EventForm({ members, mode, eventId, defaultValues }: EventFormProps) {
  const [pending, startTransition] = useTransition()
  const form = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  })

  const hostId = useWatch({ control: form.control, name: 'hostId' })
  const helperId = useWatch({ control: form.control, name: 'helperId' }) ?? ''
  const participantIds = useWatch({ control: form.control, name: 'participantIds' }) ?? []

  // Helfer-Auswahl: alle aktiven Mitglieder außer Gastgeber und Teilnehmern.
  // Der aktuell gesetzte Helfer bleibt sichtbar, damit die Auswahl nicht springt.
  const helperOptions = members.filter(
    (m) =>
      m.id === helperId ||
      (m.id !== hostId && !participantIds.includes(m.id)),
  )
  // Gastgeber-Auswahl: der Helfer darf nicht zugleich Gastgeber sein.
  const hostOptions = members.filter((m) => m.id === hostId || m.id !== helperId)

  // PROJ-26: echte Mitglieder + Testkonto → Tasting wird für die Runde unsichtbar.
  const mix = tastingMix(members, [hostId ?? '', helperId, ...participantIds])
  const [mixedPending, setMixedPending] = useState<EventFormInput | null>(null)

  function onValid(values: EventFormInput) {
    if (mix === 'mixed') {
      setMixedPending(values)
      return
    }
    onSubmit(values)
  }

  function onSubmit(values: EventFormInput) {
    startTransition(async () => {
      const helper = values.helperId ?? ''
      const base = (values.participantIds ?? []).filter((id) => id !== helper)
      const participantIds = hostId
        ? [...new Set([...base, hostId])]
        : base
      const payload = { ...values, participantIds }

      const result =
        mode === 'create'
          ? await createEventAction(payload)
          : await updateEventAction(eventId!, payload)

      if (result && 'error' in result) {
        form.setError('root', { message: result.error })
        toast.error(result.error)
      }
      // Erfolg: die Server Action leitet zur Liste weiter.
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-5" noValidate>
        {form.formState.errors.root ? (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum</FormLabel>
              <FormControl>
                <EventDateField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ort</FormLabel>
              <FormControl>
                <Input placeholder="z. B. bei Hermann" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gastgeber</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Gastgeber wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hostOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
                      {m.is_test ? <TestBadge className="ml-2" /> : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participantIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teilnehmer</FormLabel>
              <ParticipantPicker
                members={members}
                value={field.value ?? []}
                onChange={field.onChange}
                lockedId={hostId || undefined}
                excludeIds={helperId ? [helperId] : undefined}
              />
              <FormDescription>
                Der Gastgeber ist immer dabei. Weitere lassen sich jederzeit
                ergänzen, solange das Tasting in Vorbereitung ist.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helperId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Whisky-Steward (optional)</FormLabel>
              <Select
                value={field.value || 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kein Whisky-Steward" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Kein Whisky-Steward</SelectItem>
                  {helperOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
                      {m.is_test ? <TestBadge className="ml-2" /> : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Der Whisky-Steward schenkt aus und steuert den Abend, verkostet
                aber selbst nicht mit. Ist ein Whisky-Steward benannt, verkostet der Gastgeber
                blind wie alle anderen. Nur solange das Tasting in Vorbereitung
                ist änderbar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxWhiskies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max. Whiskies pro Person</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  placeholder="kein Limit"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Leer lassen = keine Begrenzung. Der Gastgeber darf einen mehr.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ratingStep"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Bewertung in</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value ?? '1'}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                >
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="1" />
                    </FormControl>
                    <FormLabel className="font-normal">ganzen Punkten</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="0.5" />
                    </FormControl>
                    <FormLabel className="font-normal">halben Punkten</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Nasenpunkte 0–5, Gaumenpunkte 0–10 — in 1er- oder 0,5er-Schritten. Nur
                solange das Tasting in Vorbereitung ist änderbar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thema (optional)</FormLabel>
              <FormControl>
                <Input placeholder="z. B. Islay-Abend" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mix === 'mixed' ? (
          <Alert>
            <AlertDescription>
              Hier sind echte Mitglieder und Testkonten gemischt. Dieses Tasting wird für die
              Runde unsichtbar — auch für die echten Teilnehmer.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? 'Wird gespeichert…'
              : mode === 'create'
                ? 'Tasting anlegen'
                : 'Änderungen speichern'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={mixedPending !== null}
        onOpenChange={(o) => !o && setMixedPending(null)}
        title="Tasting wird unsichtbar"
        description="Dieses Tasting wird für die Runde unsichtbar, weil ein Testkonto beteiligt ist. Trotzdem speichern?"
        confirmLabel="Trotzdem speichern"
        cancelLabel="Zurück"
        pending={pending}
        onConfirm={() => {
          const values = mixedPending
          setMixedPending(null)
          if (values) onSubmit(values)
        }}
      />
    </Form>
  )
}
