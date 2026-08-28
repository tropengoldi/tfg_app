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
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
