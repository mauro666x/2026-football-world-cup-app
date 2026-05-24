import { createClient } from '@/lib/supabase/server'
import MatchCard from '@/components/match/MatchCard'
import type { Match } from '@/types'

export const revalidate = 30

export default async function LivePage() {
  const supabase = await createClient()

  const [{ data: live }, { data: upcoming }] = await Promise.all([
    supabase
      .from('matches')
      .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
      .in('status', ['LIVE', 'HALFTIME'])
      .order('match_date'),
    supabase
      .from('matches')
      .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
      .eq('status', 'SCHEDULED')
      .order('match_date')
      .limit(6),
  ])

  const liveMatches = (live ?? []) as Match[]
  const upcomingMatches = (upcoming ?? []) as Match[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          En vivo
        </h1>
        <p className="text-white/40 text-sm mt-1">Actualización automática cada 30 segundos</p>
      </div>

      {liveMatches.length > 0 ? (
        <section>
          <div className="space-y-2">
            {liveMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">😴</span>
          <p className="text-white/40">No hay partidos en vivo en este momento</p>
        </div>
      )}

      {upcomingMatches.length > 0 && (
        <section>
          <h2 className="font-semibold text-white/50 text-sm uppercase tracking-wider mb-3">
            Próximos partidos
          </h2>
          <div className="space-y-2">
            {upcomingMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
