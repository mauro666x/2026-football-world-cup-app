'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import Flag from '@/components/team/Flag'
import LiveIndicator from './LiveIndicator'
import Badge from '@/components/ui/Badge'
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
  const isLive     = match.status === 'LIVE' || match.status === 'HALFTIME'
  const isFinished = match.status === 'FINISHED'
  const home       = match.home_team
  const away       = match.away_team

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link href={`/matches/${match.id}`}>
        <div className={`${isLive ? 'wc-card-live' : 'wc-card wc-card-hover'} cursor-pointer overflow-hidden`}>
          <div className="px-4 py-3">

            {/* ── Top meta row ── */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-widest text-foreground/35">
                {getStageLabel(match.stage)}
                {match.group_letter ? ` · Grupo ${match.group_letter}` : ''}
              </span>

              <div className="flex items-center gap-2">
                {isLive ? (
                  <LiveIndicator minute={match.minute} size="sm" />
                ) : isFinished ? (
                  <Badge variant="default">FIN</Badge>
                ) : (
                  <span className="text-xs text-foreground/40 tabular-nums">
                    {formatMatchDateShort(match.match_date)} · {formatMatchTime(match.match_date)}
                  </span>
                )}
                {match.status === 'HALFTIME' && (
                  <Badge variant="yellow">MT</Badge>
                )}
              </div>
            </div>

            {/* ── Main match row ── */}
            <div className="flex items-center gap-3">

              {/* Home team */}
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                {home && <Flag code={home.code} size="sm" className="flex-shrink-0 rounded shadow-sm" />}
                <span className={`font-semibold text-sm truncate leading-tight ${isLive ? 'text-foreground' : 'text-foreground/85'}`}>
                  {home?.name ?? '?'}
                </span>
              </div>

              {/* Score / Time */}
              <div className="flex-shrink-0 flex items-center justify-center">
                {isLive || isFinished ? (
                  <div className="flex items-center gap-2 px-2">
                    <span
                      className="font-display text-3xl leading-none tabular-nums"
                      style={{ color: isLive ? '#f0c040' : 'var(--foreground)' }}
                    >
                      {match.home_score ?? 0}
                    </span>
                    <span className="text-foreground/25 font-light text-lg">–</span>
                    <span
                      className="font-display text-3xl leading-none tabular-nums"
                      style={{ color: isLive ? '#f0c040' : 'var(--foreground)' }}
                    >
                      {match.away_score ?? 0}
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="font-display text-xl tracking-widest text-foreground/50 tabular-nums leading-none">
                      {formatMatchTime(match.match_date)}
                    </span>
                  </div>
                )}
              </div>

              {/* Away team */}
              <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
                <span className={`font-semibold text-sm truncate text-right leading-tight ${isLive ? 'text-foreground' : 'text-foreground/85'}`}>
                  {away?.name ?? '?'}
                </span>
                {away && <Flag code={away.code} size="sm" className="flex-shrink-0 rounded shadow-sm" />}
              </div>
            </div>

            {/* ── My prediction ── */}
            {showPrediction && predictedHome !== null && predictedHome !== undefined && (
              <div className="mt-3 pt-3 flex items-center justify-center gap-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-foreground/35">Mi pronóstico</span>
                <span className="text-xs font-display tracking-wider text-gold">
                  {predictedHome} – {predictedAway}
                </span>
              </div>
            )}

            {/* ── Venue ── */}
            {match.city && (
              <div className="mt-2 flex items-center gap-1 text-foreground/22">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{match.city}</span>
              </div>
            )}
          </div>

          {/* Live accent bar */}
          {isLive && (
            <div className="h-px w-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }} />
          )}
        </div>
      </Link>
    </motion.div>
  )
}
