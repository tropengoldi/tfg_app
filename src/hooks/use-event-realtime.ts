'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RealtimeChannel } from '@supabase/supabase-js'

import { eventChannelName } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/client'

/** ms, die die Neu-Berechnung bei schnellen Mehrfach-Ereignissen gebündelt wird. */
const REFRESH_DEBOUNCE = 400
/** ms ohne Verbindung, bevor der „Nicht live"-Hinweis erscheint. */
const OFFLINE_HINT_DELAY = 5_000

/**
 * Abonniert den geteilten Realtime-Kanal eines Events (`event:<id>`).
 * Auf jede Änderung an `tasting_events` / `whiskies` oder einen inhaltslosen
 * Broadcast-Ping berechnet sich die aufrufende Seite neu (`router.refresh`).
 *
 * - `isLive`: false, wenn der Kanal seit ein paar Sekunden getrennt ist.
 * - `refresh()`: manuelles Nachladen (für den „Nicht live"-Hinweis).
 * - `ping()`: inhaltslose Broadcast-Nachricht auf den Kanal — der speichernde
 *   Client meldet damit „da hat sich was geändert", ohne Daten mitzusenden.
 */
export function useEventRealtime(eventId: string | null) {
  const router = useRouter()
  const [isLive, setIsLive] = useState(true)

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wasLiveRef = useRef(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const doRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(doRefresh, REFRESH_DEBOUNCE)
  }, [doRefresh])

  useEffect(() => {
    if (!eventId) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null
    let cancelled = false

    function onVisible() {
      if (document.visibilityState === 'visible') doRefresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    void (async () => {
      // Erst den Auth-Token auf die Realtime-Verbindung setzen — sonst greift die
      // RLS auf `postgres_changes` und der Client bekommt gar keine Zeilen.
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)

      channel = supabase.channel(eventChannelName(eventId), {
        config: { broadcast: { self: false } },
      })
      channelRef.current = channel

      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasting_events', filter: `id=eq.${eventId}` },
          scheduleRefresh,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'whiskies', filter: `event_id=eq.${eventId}` },
          scheduleRefresh,
        )
        .on('broadcast', { event: 'touch' }, scheduleRefresh)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(hintTimer.current)
            if (!wasLiveRef.current) doRefresh() // Reconnect → einmal nachziehen
            wasLiveRef.current = true
            setIsLive(true)
          } else if (
            status === 'CHANNEL_ERROR' ||
            status === 'TIMED_OUT' ||
            status === 'CLOSED'
          ) {
            clearTimeout(hintTimer.current)
            hintTimer.current = setTimeout(() => {
              wasLiveRef.current = false
              setIsLive(false)
            }, OFFLINE_HINT_DELAY)
          }
        })
    })()

    return () => {
      cancelled = true
      clearTimeout(refreshTimer.current)
      clearTimeout(hintTimer.current)
      document.removeEventListener('visibilitychange', onVisible)
      channelRef.current = null
      if (channel) supabase.removeChannel(channel)
    }
  }, [eventId, scheduleRefresh, doRefresh])

  const ping = useCallback(() => {
    channelRef.current?.send({ type: 'broadcast', event: 'touch', payload: {} })
  }, [])

  return { isLive, refresh: doRefresh, ping }
}
