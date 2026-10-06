import { z } from 'zod'

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Keine gültige E-Mail-Adresse'),
  displayName: z
    .string()
    .trim()
    .max(80, 'Höchstens 80 Zeichen')
    .optional()
    .or(z.literal('')),
  /** PROJ-26: Konto ab der Einladung als Testkonto anlegen. */
  isTest: z.boolean().optional(),
})

export const uuidSchema = z.string().uuid()

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
