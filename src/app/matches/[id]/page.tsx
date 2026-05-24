import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import Badge from '@/components/ui/Badge'
import LiveIndicator from '@/components/match/LiveIndicator'
import MatchPredictionSection from './MatchPredictionSection'
import HeadToHeadSection from './HeadToHeadSection'
import { formatMatchDate, getStageLabel, getStatusLabel } from '@/lib/utils'
import type { Match, HeadToHead } from '@/types'

export const revalidate = 30

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  const m = match as Match
  const home = m.home_team!
  const away = m.away_team!
  const isLive = m.status === 'LIVE' || m.status === 'HALFTIME'
  const isFinished = m.status === 'FINISHED'

  // Head to head
  const { data: h2h } = await supabase
    .from('head_to_head')
    .select('*')
    .or(
      `and(team1_id.eq.${home.id},team2_id.eq.${away.id}),and(team1_id.eq.${away.id},team2_id.eq.${home.id})`
    )
    .maybeSingle()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <div className="text-sm text-white/40 mb-1">
          {getStageLabel(m.stage)}
          {m.group_letter ? ` — Grupo ${m.group_letter}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-white">{home.name} vs {away.name}</h1>
        </div>
      </div>

      {/* Main score card */}
      <Card className={isLive ? 'border-red-500/30' : ''}>
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <LiveIndicator minute={m.minute} />
          ) : (
            <Badge variant={isFinished ? 'default' : 'blue'}>
              {getStatusLabel(m.status)}
            </Badge>
          )}
          <span className="text-xs text-white/30">{formatMatchDate(m.match_date)}</span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={home.code} name={home.name} size="xl" />
            <span className="font-semibold text-white text-center">{home.name}</span>
          </div>

          <div className="text-center px-4">
            {isLive || isFinished ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-5xl font-black text-white tabular-nums">
                    {m.home_score ?? 0}
                  </span>
                  <span className="text-white/30 text-2xl">–</span>
                  <span className="text-5xl font-black text-white tabular-nums">
                    {m.away_score ?? 0}
                  </span>
                </div>
                {(m.home_penalties !== null) && (
                  <p className="text-xs text-white/40 mt-1">
                    Penales: {m.home_penalties} – {m.away_penalties}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-3xl font-black text-white/20">VS</span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <Flag code={away.code} name={away.name} size="xl" />
            <span className="font-semibold text-white text-center">{away.name}</span>
          </div>
        </div>

        {m.venue && (
          <p className="text-xs text-center text-white/25 mt-2">
            📍 {m.venue}{m.city ? `, ${m.city}` : ''}
          </p>
        )}
      </Card>

      {/* Prediction section (client component) */}
      <MatchPredictionSection match={m} userId={user?.id} />

      {/* Head to Head */}
      {h2h && <HeadToHeadSection h2h={h2h as HeadToHead} homeTeam={home} awayTeam={away} />}
    </div>
  )
}
