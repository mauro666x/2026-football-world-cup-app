import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import Link from 'next/link'
import { GROUP_LETTERS } from '@/lib/utils'
import { calculateGroupStandings } from '@/lib/scoring'
import type { Team, Match } from '@/types'

export const revalidate = 60

export default async function GroupsPage() {
  const supabase = await createClient()

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from('teams').select('*').order('group_letter').order('fifa_ranking'),
    supabase
      .from('matches')
      .select('*')
      .eq('stage', 'GROUP')
      .in('status', ['FINISHED', 'LIVE']),
  ])

  const allTeams = (teams ?? []) as Team[]
  const allMatches = (matches ?? []) as Match[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Fase de Grupos</h1>
        <p className="text-white/40 text-sm mt-1">12 grupos · 4 equipos cada uno</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUP_LETTERS.map(letter => {
          const groupTeams = allTeams.filter(t => t.group_letter === letter)
          const groupMatches = allMatches.filter(
            m => m.group_letter === letter
          )
          const standings = calculateGroupStandings(groupTeams, groupMatches)

          return (
            <Link key={letter} href={`/groups/${letter}`}>
              <Card hover>
                <CardHeader>
                  <CardTitle>Grupo {letter}</CardTitle>
                  <span className="text-xs text-white/30">{groupTeams.length} equipos</span>
                </CardHeader>

                <div className="space-y-1">
                  {standings.length > 0
                    ? standings.map((s, i) => (
                        <div key={s.team.id} className="flex items-center gap-2 py-1">
                          <span className="text-xs text-white/30 w-4 tabular-nums">{i + 1}</span>
                          <Flag code={s.team.code} name={s.team.name} size="xs" />
                          <span className="flex-1 text-sm text-white truncate">{s.team.name}</span>
                          <span className="text-xs font-bold text-white tabular-nums w-6 text-right">
                            {s.points}
                          </span>
                        </div>
                      ))
                    : groupTeams.slice(0, 4).map(team => (
                        <div key={team.id} className="flex items-center gap-2 py-1">
                          <Flag code={team.code} name={team.name} size="xs" />
                          <span className="flex-1 text-sm text-white truncate">{team.name}</span>
                        </div>
                      ))}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
