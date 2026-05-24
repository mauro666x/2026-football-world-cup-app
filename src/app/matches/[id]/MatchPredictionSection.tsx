'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import ScoreInput from '@/components/match/ScoreInput'
import { usePrediction, useUpsertPrediction } from '@/hooks/usePredictions'
import { isMatchLocked } from '@/lib/utils'
import type { Match } from '@/types'

interface Props {
  match: Match
  userId: string | undefined
}

export default function MatchPredictionSection({ match, userId }: Props) {
  const locked = isMatchLocked(match.match_date) || match.status !== 'SCHEDULED'
  const { data: prediction } = usePrediction(userId, match.id)
  const upsert = useUpsertPrediction()

  if (!userId) {
    return (
      <Card className="text-center space-y-2 py-6">
        <p className="text-white/50 text-sm">Inicia sesión para predecir este partido</p>
        <Link
          href="/login"
          className="inline-block bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          Iniciar sesión
        </Link>
      </Card>
    )
  }

  if (!match.home_team || !match.away_team) return null

  return (
    <Card>
      <h3 className="font-semibold text-white mb-4">Tu predicción</h3>
      <ScoreInput
        homeTeam={match.home_team}
        awayTeam={match.away_team}
        initialHome={prediction?.predicted_home_score}
        initialAway={prediction?.predicted_away_score}
        locked={locked}
        onSave={async (home, away) => {
          await upsert.mutateAsync({
            userId,
            matchId: match.id,
            homeScore: home,
            awayScore: away,
          })
        }}
      />
    </Card>
  )
}
