'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { setWinnerTipAction } from '@/lib/actions/tips'

interface WinnerTipState {
  /** Angezeigter Tipp (während des Speicherns schon der neue). */
  position: number | null
  pending: boolean
  editable: boolean
  choose: (position: number) => void
}

const WinnerTipContext = createContext<WinnerTipState | null>(null)

/**
 * Gemeinsamer Stand des Sieger-Tipps (PROJ-22) für das Tipp-Feld und die
 * Pokal-Knöpfe der eigenen Rangliste (PROJ-24): ein Speicherweg, eine
 * Fehlerbehandlung, beide Anzeigen immer synchron.
 */
export function WinnerTipProvider({
  eventId,
  savedPosition,
  editable,
  children,
}: {
  eventId: string
  savedPosition: number | null
  editable: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const [pending, startSaving] = useTransition()
  const [saved, setSaved] = useState(savedPosition)
  const [position, setPosition] = useState(savedPosition)

  // Serverstand (anderes Gerät, router.refresh) übernehmen.
  useEffect(() => {
    setSaved(savedPosition)
    setPosition(savedPosition)
  }, [savedPosition])

  function choose(next: number) {
    if (!editable || next === saved) return
    setPosition(next)
    startSaving(async () => {
      // Ein Netzwerkfehler lässt die Server-Action werfen — abfangen, sonst
      // ersetzt die Fehlergrenze die ganze Bewertungsansicht (PROJ-22 BUG-1).
      const res = await setWinnerTipAction({ eventId, position: next }).catch(() => ({
        error: 'Verbindung fehlgeschlagen — Tipp nicht gespeichert.',
      }))
      if ('error' in res) {
        setPosition(saved)
        toast.error(res.error)
        return
      }
      setSaved(next)
      toast.success(`Tipp gespeichert: Whisky ${next}`)
      router.refresh()
    })
  }

  return (
    <WinnerTipContext.Provider value={{ position, pending, editable, choose }}>
      {children}
    </WinnerTipContext.Provider>
  )
}

/** `null` außerhalb eines Providers (z. B. kein Tipp im Spiel). */
export function useWinnerTip(): WinnerTipState | null {
  return useContext(WinnerTipContext)
}
