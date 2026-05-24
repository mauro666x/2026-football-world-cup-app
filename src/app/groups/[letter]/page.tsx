import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import MatchCard from '@/components/match/MatchCard'
import Link from 'next/link'
import { GROUP_LETTERS } from '@/lib/utils'
import { calculateGroupStandings } from '@/lib/scoring'
import type { Team, Match } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ letter: string }>
}

export default async function GroupPage({ params }: Props) {
  const { letter } = await params
  const upper = letter.toUpperCase()

  if (!GROUP_LETTERS.includes(upper)) notFound()

  const supabase = await createClient()

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('*').eq('group_letter', upper),
    supabase
      .from('matches')
      .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
      .eq('stage', 'GROUP')
      .eq('group_letter', upper)
      .order('match_date'),
  ])

  const groupTeams = (teams ?? []) as Team[]
  const groupMatches = (matches ?? []) as Match[]
  const standings = calculateGroupStandings(groupTeams, groupMatches)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/groups" className="text-sm text-white/40 hover:text-white/70 mb-2 inline-block">
          ← Grupos
        </Link>
        <h1 className="text-2xl font-black text-white">Grupo {upper}</h1>
      </div>

      {/* Standings table */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Tabla de posiciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs">
                <th className="text-left pb-2 font-normal">#</th>
                <th className="text-left pb-2 font-normal">Equipo</th>
                <th className="text-center pb-2 font-normal w-8">PJ</th>
                <th className="text-center pb-2 font-normal w-8">G</th>
                <th className="text-center pb-2 font-normal w-8">E</th>
                <th className="text-center pb-2 font-normal w-8">P</th>
                <th className="text-center pb-2 font-normal w-8">GD</th>
                <th className="text-center pb-2 font-bold text-white/50 w-8">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr key={s.team.id} className={`border-t border-white/5 ${i < 3 ? '' : 'opacity-60'}`}>
                  <td className="py-2 text-white/40 w-6">
                    {i < 3 ? (
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-white/30">{i + 1}</span>
                    )}
                  </td>
                  <td className="py-2">
                    <Link href={`/teams/${s.team.id}`} className="flex items-center gap-2 hover:opacity-80">
                      <Flag code={s.team.code} name={s.team.name} size="xs" />
                      <span className="text-white font-medium">{s.team.name}</span>
                    </Link>
                  </td>
                  <td className="py-2 text-center text-white/50">{s.played}</td>
                  <td className="py-2 text-center text-white/50">{s.won}</td>
                  <td className="py-2 text-center text-white/50">{s.drawn}</td>
                  <td className="py-2 text-center text-white/50">{s.lost}</td>
                  <td className="py-2 text-center text-white/50">
                    {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                  </td>
                  <td className="py-2 text-center font-black text-white">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/25 mt-3">Top 3 clasifican a ronda de 32</p>
      </Card>

      {/* Matches */}
      <div>
        <h2 className="font-semibold text-white mb-3">Partidos del grupo</h2>
        <div className="space-y-2">
          {groupMatches.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
