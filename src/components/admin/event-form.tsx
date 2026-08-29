'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { EventDateField } from '@/components/admin/event-date-field'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEventAction, updateEventAction } from '@/lib/actions/admin-events'
import { eventFormSchema, type EventFormInput } from '@/lib/schemas/admin-events'

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

  function onSubmit(values: EventFormInput) {
    startTransition(async () => {
      const participantIds = hostId
        ? [...new Set([...(values.participantIds ?? []), hostId])]
        : (values.participantIds ?? [])
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
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
    </Form>
  )
}
