'use client'

import { WifiOff } from 'lucide-react'

import { useEventRealtime } from '@/hooks/use-event-realtime'

/**
 * Hängt den geteilten Realtime-Kanal eines Events ein und zeigt — nur wenn die
 * Verbindung weg ist — einen dezenten „Nicht live"-Streifen zum manuellen
 * Nachladen. Kommt einmal auf jede Seite, die live folgen soll.
 */
export function RealtimeRefresher({ eventId }: { eventId: string }) {
  const { isLive, refresh } = useEventRealtime(eventId)
  if (isLive) return null

  return (
    <button
      type="button"
      onClick={refresh}
      className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      Nicht live — tippen zum Aktualisieren
    </button>
  )
}
