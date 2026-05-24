'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import Badge from '@/components/ui/Badge'
import LiveIndicator from './LiveIndicator'
import { formatMatchTime, formatMatchDateShort, getStageLabel } from '@/lib/utils'
import type { Match } from '@/types'

interface MatchCardProps {
  match: Match
  showPrediction?: boolean
  predictedHome?: number | null
  predictedAway?: number | null
  index?: number
}

export default function MatchCard({
  match,
  showPrediction,
  predictedHome,
  predictedAway,
  index = 0,
}: MatchCardProps) {
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
  const isFinished = match.status === 'FINISHED'
  const home = match.home_team
  const away = match.away_team

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/matches/${match.id}`}>
        <Card
          hover
          className={`relative overflow-hidden transition-all ${isLive ? 'border-red-500/30 bg-red-500/5' : ''}`}
        >
          {/* Stage + Date */}
          <div className="flex items-center justify-between mb-3 text-xs text-white/40">
            <span>{getStageLabel(match.stage)}{match.group_letter ? ` — Grupo ${match.group_letter}` : ''}</span>
            <div className="flex items-center gap-2">
              {isLive ? (
                <LiveIndicator minute={match.minute} size="sm" />
              ) : (
                <span>{formatMatchDateShort(match.match_date)} · {formatMatchTime(match.match_date)}</span>
              )}
              {match.status === 'HALFTIME' && (
                <Badge variant="yellow">MT</Badge>
              )}
              {isFinished && (
                <Badge variant="default">FIN</Badge>
              )}
            </div>
          </div>

          {/* Score row */}
          <div className="flex items-center gap-4">
            {/* Home */}
            <div className="flex-1 flex items-center gap-2">
              {home && <Flag code={home.code} size="sm" />}
              <span className="font-semibold text-white text-sm truncate">{home?.name ?? '?'}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLive || isFinished ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-white tabular-nums w-6 text-center">
                    {match.home_score ?? 0}
                  </span>
                  <span className="text-white/30 font-bold">–</span>
                  <span className="text-2xl font-black text-white tabular-nums w-6 text-center">
                    {match.away_score ?? 0}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-white/30 text-center px-2">
                  <div className="font-semibold text-base text-white/50">{formatMatchTime(match.match_date)}</div>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="font-semibold text-white text-sm truncate text-right">{away?.name ?? '?'}</span>
              {away && <Flag code={away.code} size="sm" />}
            </div>
          </div>

          {/* Prediction row */}
          {showPrediction && predictedHome !== null && predictedHome !== undefined && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2">
              <span className="text-xs text-white/40">Mi predicción:</span>
              <span className="text-xs font-bold text-green-400">{predictedHome} – {predictedAway}</span>
            </div>
          )}

          {/* Venue */}
          {match.city && (
            <div className="mt-2 flex items-center gap-1 text-xs text-white/25">
              <MapPin className="w-3 h-3" />
              <span>{match.city}</span>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}
