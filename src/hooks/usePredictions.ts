'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Prediction } from '@/types'

export function usePredictions(userId: string | undefined) {
  return useQuery({
    queryKey: ['predictions', userId],
    queryFn: async () => {
      if (!userId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('predictions')
        .select(`*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Prediction[]
    },
    enabled: !!userId,
  })
}

export function usePrediction(userId: string | undefined, matchId: number) {
  return useQuery({
    queryKey: ['prediction', userId, matchId],
    queryFn: async () => {
      if (!userId) return null
      const supabase = createClient()
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle()

      return data as Prediction | null
    },
    enabled: !!userId,
  })
}

export function useUpsertPrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      matchId,
      homeScore,
      awayScore,
    }: {
      userId: string
      matchId: number
      homeScore: number
      awayScore: number
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('predictions')
        .upsert(
          {
            user_id: userId,
            match_id: matchId,
            predicted_home_score: homeScore,
            predicted_away_score: awayScore,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,match_id' }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['prediction', variables.userId, variables.matchId] })
    },
  })
}
