'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeCallback<T = unknown> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
}) => void

interface UseRealtimeOptions<T> {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (data: T) => void
  onUpdate?: (data: T) => void
  onDelete?: (data: T) => void
  onChange?: RealtimeCallback<T>
}

export function useRealtime<T = unknown>({
  table,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions<T>) {
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtime = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channelConfig: any = {
        event,
        schema: 'public',
        table,
      }

      if (filter) {
        channelConfig.filter = filter
      }

      channel = supabase
        .channel(`realtime-${table}-${Date.now()}`)
        .on('postgres_changes', channelConfig, (payload) => {
          const typedPayload = payload as unknown as {
            eventType: 'INSERT' | 'UPDATE' | 'DELETE'
            new: T
            old: T
          }

          onChange?.(typedPayload)

          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(typedPayload.new)
              break
            case 'UPDATE':
              onUpdate?.(typedPayload.new)
              break
            case 'DELETE':
              onDelete?.(typedPayload.old)
              break
          }
        })
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, event, filter, onChange, onInsert, onUpdate, onDelete, supabase])
}

// Hook for tracking active users with presence
export function usePresence(roomId: string, userData?: Record<string, unknown>) {
  const supabase = createClient()

  const trackPresence = useCallback(async (channel: RealtimeChannel) => {
    await channel.track({
      online_at: new Date().toISOString(),
      ...userData,
    })
  }, [userData])

  useEffect(() => {
    const channel = supabase.channel(roomId, {
      config: {
        presence: {
          key: userData?.userId as string || 'anonymous',
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Presence state:', state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence(channel)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, userData, supabase, trackPresence])
}
