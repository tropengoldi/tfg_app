import { z } from 'zod'

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Bitte eine Nachricht eingeben.')
    .max(2000, 'Höchstens 2000 Zeichen.'),
  recipientIds: z
    .array(z.string().uuid())
    .min(1, 'Bitte mindestens einen Empfänger wählen.')
    .max(50, 'Höchstens 50 Empfänger auf einmal.'),
  eventId: z.string().uuid().nullable(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
