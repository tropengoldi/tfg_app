'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  addCollectionEntryAction,
  updateCollectionEntryAction,
  type CollectionOrigin,
} from '@/lib/actions/collection'
import { formatEventDate, toISODate } from '@/lib/dates'
import type { CollectionEntry } from '@/lib/queries/collection'
import {
  collectionEntryFormSchema,
  type CollectionEntryFormInput,
} from '@/lib/schemas/collection'
import { cn } from '@/lib/utils'

const EMPTY: CollectionEntryFormInput = {
  name: '',
  distillery: '',
  region: '',
  ageLabel: '',
  tastedOn: '',
  valueNote: '',
  rating: '',
  notes: '',
  owned: false,
}

export interface CollectionEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Bearbeiten-Modus: der bestehende Eintrag. Fehlt = Anlegen. */
  entry?: CollectionEntry
  /** Nur beim Anlegen über den PROJ-9-„Zur Sammlung hinzufügen"-Button:
   * füllt Name + Notiz vor und setzt das Herkunftsfeld beim Speichern. */
  origin?: CollectionOrigin & { whiskyName: string; note: string | null }
  onSaved: () => void
}

/**
 * Dialog-Formular zum Anlegen **und** Bearbeiten eines Sammlungs-Eintrags
 * (PROJ-15). Spiegelt `whisky-form-dialog.tsx` (PROJ-5): ein Formular für
 * beide Modi, Server-Action-Aufruf, Toast, Button-Sperre während des
 * Speicherns. Der Aufrufer setzt beim Wechsel zwischen „neu" und
 * „bearbeiten" einen anderen `key`, damit das Formular mit frischen
 * Startwerten neu aufgebaut wird.
 */
export function CollectionEntryDialog({
  open,
  onOpenChange,
  entry,
  origin,
  onSaved,
}: CollectionEntryDialogProps) {
  const isEdit = Boolean(entry)
  const [pending, startTransition] = React.useTransition()

  const defaultValues: CollectionEntryFormInput = entry
    ? {
        name: entry.name,
        distillery: entry.distillery ?? '',
        region: entry.region ?? '',
        ageLabel: entry.ageLabel ?? '',
        tastedOn: entry.tastedOn ?? '',
        valueNote: entry.valueNote ?? '',
        rating: entry.rating ? String(entry.rating) : '',
        notes: entry.notes ?? '',
        owned: entry.owned,
      }
    : origin
      ? { ...EMPTY, name: origin.whiskyName, notes: origin.note ?? '' }
      : EMPTY

  const form = useForm<CollectionEntryFormInput>({
    resolver: zodResolver(collectionEntryFormSchema),
    defaultValues,
  })

  // Herkunfts-Zeile: beim Anlegen aus `origin`, beim Bearbeiten aus dem
  // bereits gespeicherten Eintrag — in beiden Fällen reine Anzeige, nie Teil
  // des Formulars.
  const originDisplay = entry
    ? entry.sourceEventDate
      ? { eventId: entry.sourceEventId, eventDate: entry.sourceEventDate }
      : null
    : origin
      ? { eventId: origin.eventId, eventDate: origin.eventDate }
      : null

  function onSubmit(values: CollectionEntryFormInput) {
    startTransition(async () => {
      const result =
        isEdit && entry
          ? await updateCollectionEntryAction(entry.id, values)
          : await addCollectionEntryAction(
              values,
              origin ? { eventId: origin.eventId, eventDate: origin.eventDate } : undefined,
            )

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }
      toast.success(isEdit ? 'Eintrag aktualisiert.' : 'Eintrag gespeichert.')
      onOpenChange(false)
      onSaved()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</DialogTitle>
        </DialogHeader>

        {originDisplay ? (
          <p className="text-sm text-muted-foreground">
            Von TFG-Tasting am{' '}
            {originDisplay.eventId ? (
              <Link
                href={`/tastings/${originDisplay.eventId}/ergebnisse`}
                className="text-primary hover:underline"
              >
                {formatEventDate(originDisplay.eventDate)}
              </Link>
            ) : (
              formatEventDate(originDisplay.eventDate)
            )}
          </p>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {form.formState.errors.root ? (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z. B. Lagavulin 16"
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distillery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destillerie (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z. B. Lagavulin"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z. B. Islay"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ageLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alter/Jahrgang (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z. B. 16 Jahre"
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bewertung (optional)</FormLabel>
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Bewertung</SelectItem>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} / 10
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tastedOn"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Verkostet am (optional)</FormLabel>
                  <TastedOnField value={field.value ?? ''} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valueNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preis-Leistung (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z. B. gutes Preis-Leistungs-Verhältnis"
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owned"
              render={({ field }) => (
                <FormItem className="flex min-h-11 flex-row items-center justify-between rounded-md border border-border px-3">
                  <FormLabel className="font-normal">Besitze ich</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Deine eigene Erinnerung an diesen Whisky."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Wird gespeichert…' : isEdit ? 'Änderungen speichern' : 'Eintragen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/** Datumsauswahl über einen Kalender; Tage nach heute sind gesperrt — man
 * kann nichts verkosten, was noch nicht passiert ist. */
function TastedOnField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? parseISO(value) : undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className="h-4 w-4" />
            {value ? formatEventDate(value) : 'Datum wählen'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? today}
          disabled={{ after: today }}
          onSelect={(d) => {
            onChange(d ? toISODate(d) : '')
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
