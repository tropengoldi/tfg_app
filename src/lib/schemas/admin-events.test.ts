import { describe, expect, it } from 'vitest'

import { eventFormSchema } from './admin-events'

const HOST = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'
const base = {
  eventDate: '2999-12-31',
  location: 'Bei Hermann',
  hostId: HOST,
  participantIds: [] as string[],
  helperId: '',
  maxWhiskies: '',
  theme: '',
}

function helperMessages(input: typeof base): string[] {
  const r = eventFormSchema.safeParse(input)
  if (r.success) return []
  return r.error.issues.filter((i) => i.path[0] === 'helperId').map((i) => i.message)
}

describe('eventFormSchema — Whisky-Steward (PROJ-11, Begriffe PROJ-18)', () => {
  it('ohne Whisky-Steward ist das Formular gültig', () => {
    expect(eventFormSchema.safeParse(base).success).toBe(true)
  })

  it('Whisky-Steward = Gastgeber wird mit neuem Begriff abgelehnt', () => {
    expect(helperMessages({ ...base, helperId: HOST })).toEqual([
      'Der Whisky-Steward kann nicht der Gastgeber sein',
    ])
  })

  it('Whisky-Steward in der Teilnehmerliste wird mit neuem Begriff abgelehnt', () => {
    expect(helperMessages({ ...base, helperId: OTHER, participantIds: [OTHER] })).toEqual([
      'Der Whisky-Steward kann nicht gleichzeitig Teilnehmer sein',
    ])
  })

  it('keine Meldung nennt noch „Helfer"', () => {
    const msgs = [
      ...helperMessages({ ...base, helperId: HOST }),
      ...helperMessages({ ...base, helperId: OTHER, participantIds: [OTHER] }),
    ]
    for (const m of msgs) expect(m).not.toMatch(/Helfer/)
  })
})

describe('eventFormSchema — Schrittweite (PROJ-19)', () => {
  it('Voreinstellung sind ganze Punkte', () => {
    const r = eventFormSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ratingStep).toBe('1')
  })

  it('halbe Punkte sind wählbar', () => {
    const r = eventFormSchema.safeParse({ ...base, ratingStep: '0.5' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ratingStep).toBe('0.5')
  })

  it('andere Schrittweiten werden abgelehnt', () => {
    expect(eventFormSchema.safeParse({ ...base, ratingStep: '0.25' }).success).toBe(false)
    expect(eventFormSchema.safeParse({ ...base, ratingStep: '2' }).success).toBe(false)
  })
})
