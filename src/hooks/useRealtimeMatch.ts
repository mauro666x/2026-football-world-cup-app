'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Match } from '@/types'

interface UseRealtimeMatchReturn {
  match: Match | null
  loading: boolean
  error: string | null
}

export function useRealtimeMatch(matchId: number): UseRealtimeMatchReturn {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatch = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('id', matchId)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setMatch(data as Match)
    }
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    fetchMatch()

    const supabase = createClient()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          setMatch((prev) => prev ? { ...prev, ...(payload.new as Partial<Match>) } : null)
        }
      )
      .subscribe()

    // Polling fallback every 30s
    const interval = setInterval(fetchMatch, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [matchId, fetchMatch])

  return { match, loading, error }
}
