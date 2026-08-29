'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { saveEckdatenAction } from '@/lib/actions/host-control'
import { eckdatenSchema, type EckdatenInput } from '@/lib/schemas/host'

interface EckdatenFormProps {
  eventId: string
  defaultValues: EckdatenInput
  readOnly?: boolean
}

export function EckdatenForm({ eventId, defaultValues, readOnly }: EckdatenFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const form = useForm<EckdatenInput>({
    resolver: zodResolver(eckdatenSchema),
    defaultValues,
  })

  function onSubmit(values: EckdatenInput) {
    startTransition(async () => {
      const res = await saveEckdatenAction(eventId, values)
      if ('error' in res) {
        form.setError('root', { message: res.error })
        return
      }
      toast.success('Eckdaten gespeichert.')
      router.refresh()
    })
  }

  if (readOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Eckdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ReadRow label="Thema" value={defaultValues.theme} />
          <ReadRow label="Info zum Essen" value={defaultValues.foodInfo} />
          <ReadRow label="Anmerkungen" value={defaultValues.hostNotes} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Eckdaten</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {form.formState.errors.root ? (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thema (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z. B. Islay-Abend"
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
              name="foodInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Info zum Essen (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Was gibt es zu essen?"
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
              name="hostNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anmerkungen (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Alles, was die Runde wissen sollte."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={pending}>
              {pending ? 'Wird gespeichert…' : 'Eckdaten speichern'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ReadRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{value?.trim() ? value : '—'}</dd>
    </div>
  )
}
