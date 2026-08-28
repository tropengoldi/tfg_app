import { z } from 'zod'

const email = z
  .string()
  .min(1, 'E-Mail ist erforderlich')
  .email('Keine gültige E-Mail-Adresse')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export const forgotPasswordSchema = z.object({ email })

export const setPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mindestens 6 Zeichen'),
    confirm: z.string().min(1, 'Bitte das Passwort wiederholen'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirm'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type SetPasswordInput = z.infer<typeof setPasswordSchema>
