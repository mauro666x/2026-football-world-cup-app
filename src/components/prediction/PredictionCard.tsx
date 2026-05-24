'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import Badge from '@/components/ui/Badge'
import { formatMatchDate } from '@/lib/utils'
import { calculateMatchPoints, getScoreDescription as getDesc } from '@/lib/scoring'
import type { Prediction } from '@/types'

interface PredictionCardProps {
  prediction: Prediction
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const match = prediction.match
  if (!match) return null

  const home = match.home_team
  const away = match.away_team
  const isFinished = match.status === 'FINISHED'

  let result = null
  if (isFinished && match.home_score !== null && match.away_score !== null) {
    result = calculateMatchPoints(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      match.home_score,
      match.away_score
    )
  }

  return (
    <Link href={`/matches/${match.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-white/40">{formatMatchDate(match.match_date)}</span>
          <div className="flex items-center gap-2">
            {prediction.locked && <Lock className="w-3 h-3 text-white/30" />}
            {result && (
              <Badge variant={result.points > 0 ? result.exact ? 'green' : 'blue' : 'default'}>
                +{result.points} pts
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            {home && <Flag code={home.code} size="sm" />}
            <span className="text-sm font-medium text-white truncate">{home?.name}</span>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-green-400 tabular-nums">
                {prediction.predicted_home_score}
              </span>
              <span className="text-white/30">–</span>
              <span className="text-xl font-black text-green-400 tabular-nums">
                {prediction.predicted_away_score}
              </span>
            </div>
            {isFinished && match.home_score !== null && (
              <div className="text-xs text-white/40 mt-0.5">
                Real: {match.home_score} – {match.away_score}
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="text-sm font-medium text-white truncate text-right">{away?.name}</span>
            {away && <Flag code={away.code} size="sm" />}
          </div>
        </div>

        {result && (
          <p className="text-xs text-center mt-2 text-white/50">{getDesc(result)}</p>
        )}
      </Card>
    </Link>
  )
}
