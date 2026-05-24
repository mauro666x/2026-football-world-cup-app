import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import PlayerCard from '@/components/team/PlayerCard'
import MatchCard from '@/components/match/MatchCard'
import Badge from '@/components/ui/Badge'
import { getPositionLabel } from '@/lib/utils'
import type { Team, Player, Match } from '@/types'

export const revalidate = 3600

interface Props {
  params: Promise<{ id: string }>
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: team }, { data: players }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', id).single(),
    supabase
      .from('players')
      .select('*')
      .eq('team_id', id)
      .order('position')
      .order('number'),
    supabase
      .from('matches')
      .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .order('match_date'),
  ])

  if (!team) notFound()

  const t = team as Team
  const teamPlayers = (players ?? []) as Player[]
  const teamMatches = (matches ?? []) as Match[]

  const posOrder = ['GK', 'DF', 'MF', 'FW']
  const byPosition = new Map<string, Player[]>()
  for (const p of teamPlayers) {
    const pos = p.position ?? 'N/A'
    if (!byPosition.has(pos)) byPosition.set(pos, [])
    byPosition.get(pos)!.push(p)
  }

  // Team stats
  const finished = teamMatches.filter(m => m.status === 'FINISHED')
  const won = finished.filter(m =>
    (m.home_team_id === t.id && (m.home_score ?? 0) > (m.away_score ?? 0)) ||
    (m.away_team_id === t.id && (m.away_score ?? 0) > (m.home_score ?? 0))
  ).length
  const drawn = finished.filter(m => m.home_score === m.away_score).length
  const lost = finished.length - won - drawn

  return (
    <div className="space-y-6">
      <Link href="/teams" className="text-sm text-white/40 hover:text-white/70">
        ← Selecciones
      </Link>

      {/* Header */}
      <Card>
        <div className="flex items-center gap-5">
          <Flag code={t.code} name={t.name} size="xl" className="shadow-lg" />
          <div>
            <h1 className="text-2xl font-black text-white">{t.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {t.group_letter && <Badge variant="blue">Grupo {t.group_letter}</Badge>}
              {t.confederation && <Badge variant="default">{t.confederation}</Badge>}
              {t.fifa_ranking && <span className="text-sm text-white/40">#{t.fifa_ranking} FIFA</span>}
            </div>
            {t.coach && (
              <p className="text-sm text-white/40 mt-2">DT: {t.coach}</p>
            )}
          </div>
        </div>

        {finished.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
            {[
              { label: 'Victorias', val: won, color: 'text-green-400' },
              { label: 'Empates', val: drawn, color: 'text-yellow-400' },
              { label: 'Derrotas', val: lost, color: 'text-red-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <span className={`text-2xl font-black ${color}`}>{val}</span>
                <p className="text-xs text-white/30">{label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Matches */}
      {teamMatches.length > 0 && (
        <section>
          <h2 className="font-semibold text-white mb-3">Partidos</h2>
          <div className="space-y-2">
            {teamMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Players */}
      {teamPlayers.length > 0 && (
        <section>
          <h2 className="font-semibold text-white mb-3">Plantel ({teamPlayers.length} jugadores)</h2>
          {posOrder.map(pos => {
            const group = byPosition.get(pos)
            if (!group?.length) return null
            return (
              <div key={pos} className="mb-4">
                <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">
                  {getPositionLabel(pos)}s
                </h3>
                <div className="space-y-1.5">
                  {group.map(p => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
