'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { addWhiskyAction, updateWhiskyAction } from '@/lib/actions/whiskies'
import { whiskyFormSchema, type WhiskyFormInput } from '@/lib/schemas/whiskies'

const EMPTY: WhiskyFormInput = { name: '', videoUrl: '', ownerNotes: '' }

export interface WhiskyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  /** Bearbeiten-Modus: die ID des Whiskys. Fehlt = Anlegen. */
  whiskyId?: string
  /** Startwerte im Bearbeiten-Modus. */
  defaultValues?: WhiskyFormInput
  onSaved: () => void
}

/**
 * Dialog-Formular zum Anlegen **und** Bearbeiten eines Whiskys. Der Aufrufer
 * setzt beim Wechsel zwischen „neu" und „bearbeiten" einen anderen `key`, damit
 * das Formular mit frischen Startwerten neu aufgebaut wird.
 */
export function WhiskyFormDialog({
  open,
  onOpenChange,
  eventId,
  whiskyId,
  defaultValues,
  onSaved,
}: WhiskyFormDialogProps) {
  const isEdit = Boolean(whiskyId)
  const [pending, startTransition] = useTransition()
  const form = useForm<WhiskyFormInput>({
    resolver: zodResolver(whiskyFormSchema),
    defaultValues: defaultValues ?? EMPTY,
  })

  function onSubmit(values: WhiskyFormInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateWhiskyAction(eventId, whiskyId as string, values)
        : await addWhiskyAction(eventId, values)

      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }
      toast.success(isEdit ? 'Whisky aktualisiert.' : 'Whisky eingetragen.')
      onOpenChange(false)
      onSaved()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Whisky bearbeiten' : 'Whisky hinzufügen'}</DialogTitle>
          <DialogDescription>
            Außer dir sieht das nur der Gastgeber — bis der Abend abgeschlossen ist.
          </DialogDescription>
        </DialogHeader>

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

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video-Link (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      autoCapitalize="none"
                      placeholder="https://…"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Verkostungsvideo. Wird erst nach dem Abschluss für alle sichtbar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notiz für dich (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Warum dieser Whisky? Sieht sonst niemand."
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
                {pending
                  ? 'Wird gespeichert…'
                  : isEdit
                    ? 'Änderungen speichern'
                    : 'Eintragen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
