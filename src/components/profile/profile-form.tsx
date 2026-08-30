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
import { updateProfileAction } from '@/lib/actions/profile'
import { profileFormSchema, type ProfileFormInput } from '@/lib/schemas/profile'

export function ProfileForm({ defaultValues }: { defaultValues: ProfileFormInput }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  function onSubmit(values: ProfileFormInput) {
    startTransition(async () => {
      const res = await updateProfileAction(values)
      if ('error' in res) {
        form.setError('root', { message: res.error })
        return
      }
      form.clearErrors('root')
      toast.success('Profil gespeichert.')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Deine Daten</CardTitle>
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
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anzeigename</FormLabel>
                  <FormControl>
                    <Input maxLength={80} autoComplete="nickname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favoriteDram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieblings-Dram (optional)</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={120}
                      placeholder="z. B. Lagavulin 16"
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
              name="favoriteRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieblingsregion (optional)</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={120}
                      placeholder="z. B. Islay"
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
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kurzbeschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Ein, zwei Sätze über dich und deinen Whisky-Geschmack."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={pending}>
              {pending ? 'Wird gespeichert…' : 'Speichern'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
