'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { requestPasswordResetAction } from '@/lib/actions/auth'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth'

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('email', values.email)
      const result = await requestPasswordResetAction(fd)
      if (result && 'error' in result) {
        form.setError('root', { message: result.error })
        toast.error(result.error)
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <Alert>
        <AlertDescription>
          Falls ein Konto zu dieser Adresse existiert, ist eine E-Mail mit einem Link
          zum Zurücksetzen unterwegs. Prüf auch den Spam-Ordner.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {form.formState.errors.root ? (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholder="du@beispiel.de"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Wird gesendet…' : 'Link anfordern'}
        </Button>
      </form>
    </Form>
  )
}
