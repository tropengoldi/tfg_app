'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { inviteMemberAction } from '@/lib/actions/admin'
import { inviteMemberSchema, type InviteMemberInput } from '@/lib/schemas/admin'

export function InviteParticipantDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', displayName: '', isTest: false },
  })

  function onSubmit(values: InviteMemberInput) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('email', values.email)
      fd.set('displayName', values.displayName ?? '')
      if (values.isTest) fd.set('isTest', 'true')
      const result = await inviteMemberAction(fd)
      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }
      toast.success(values.isTest ? 'Einladung verschickt (Testkonto).' : 'Einladung verschickt.')
      form.reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Teilnehmer einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teilnehmer einladen</DialogTitle>
          <DialogDescription>
            Die Person bekommt eine E-Mail mit einem Link, um ihr Passwort zu setzen.
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="off"
                      autoCapitalize="none"
                      placeholder="freund@beispiel.de"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anzeigename (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="z. B. Hermann" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leer lassen: dann wird der Teil vor dem @ genommen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">Testkonto</FormLabel>
                    <FormDescription>
                      Für normale Mitglieder unsichtbar, ebenso jedes Tasting, an dem es
                      beteiligt ist.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Wird eingeladen…' : 'Einladen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
