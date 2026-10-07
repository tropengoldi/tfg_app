import { describe, expect, it } from 'vitest'

import { tastingRowTargets, type TastingRowRoles } from './tasting-row'

const row = (over: Partial<TastingRowRoles>): TastingRowRoles => ({
  id: 'e1',
  status: 'draft',
  is_host: false,
  is_helper: false,
  has_helper: false,
  ...over,
})

const labels = (r: TastingRowRoles) => tastingRowTargets(r).secondary.map((a) => a.label)

describe('tastingRowTargets', () => {
  it('Teilnehmer im Entwurf: Zeile → Meine Whiskys, keine Zusatz-Aktion', () => {
    const t = tastingRowTargets(row({}))
    expect(t.primaryHref).toBe('/tastings/e1/whiskies')
    expect(t.secondary).toEqual([])
  })

  it('Teilnehmer im laufenden Tasting: Zeile → Bewerten, daneben Whiskys', () => {
    const t = tastingRowTargets(row({ status: 'active' }))
    expect(t.primaryHref).toBe('/tastings/e1/bewerten')
    expect(labels(row({ status: 'active' }))).toEqual(['Whiskys'])
  })

  it('Gastgeber ohne Steward: Steuern', () => {
    expect(labels(row({ is_host: true }))).toEqual(['Steuern'])
  })

  it('Gastgeber mit Steward: Eckdaten statt Steuern', () => {
    expect(labels(row({ is_host: true, has_helper: true }))).toEqual(['Eckdaten'])
  })

  it('PROJ-21: Steward im Entwurf: Meine Whiskys + Steuern, Zeile → Steuern', () => {
    const r = row({ is_helper: true, has_helper: true })
    expect(tastingRowTargets(r).primaryHref).toBe('/tastings/e1/gastgeber')
    expect(labels(r)).toEqual(['Meine Whiskys', 'Steuern'])
    expect(tastingRowTargets(r).secondary[0].href).toBe('/tastings/e1/whiskies')
  })

  it('Steward im laufenden oder abgeschlossenen Tasting: nur Steuern', () => {
    expect(labels(row({ is_helper: true, has_helper: true, status: 'active' }))).toEqual(['Steuern'])
    expect(labels(row({ is_helper: true, has_helper: true, status: 'closed' }))).toEqual(['Steuern'])
  })
})
