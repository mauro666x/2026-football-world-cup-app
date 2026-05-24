import { createClient } from '@/lib/supabase/server'
import MatchCard from '@/components/match/MatchCard'
import type { Match } from '@/types'

export const metadata = {
  title: 'En Vivo — Mundial 2026',
  description: 'Marcadores en tiempo real de los partidos del Mundial FIFA 2026',
}



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
      .limit(8),
  ])

  const liveMatches  = (live ?? []) as Match[]
  const upcomingMatches = (upcoming ?? []) as Match[]

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* Pulsing live badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="relative flex">
                <span className="absolute w-2 h-2 rounded-full bg-red-500 live-ring" />
                <span className="relative w-2 h-2 rounded-full bg-red-500" />
              </div>
              <span className="font-display text-sm tracking-widest text-red-400">EN VIVO</span>
            </div>
            <h1 className="font-display text-3xl tracking-wider text-foreground">
              MARCADORES
            </h1>
          </div>
          <p className="text-foreground/35 text-sm mt-2 ml-0.5">
            Actualización automática cada 30 segundos
          </p>
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mt-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-foreground/30">Auto</span>
        </div>
      </div>

      {/* ── Live matches ── */}
      {liveMatches.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="section-title font-display text-lg tracking-wider text-red-400">
              PARTIDOS EN CURSO
            </span>
            <span className="text-xs text-foreground/30 font-medium tracking-wider">
              {liveMatches.length} PARTIDO{liveMatches.length !== 1 ? 'S' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {liveMatches.map((m, i) => (
              <MatchCard key={m.id} match={m} index={i} />
            ))}
          </div>
        </section>
      ) : (
        <div className="wc-card p-12 text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="font-display text-xl tracking-wider text-foreground/30">SIN PARTIDOS EN VIVO</p>
          <p className="text-sm text-foreground/20 mt-2">
            No hay partidos en curso en este momento
          </p>
        </div>
      )}

      {/* ── Upcoming matches ── */}
      {upcomingMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="section-title font-display text-lg tracking-wider text-foreground/50">
              PRÓXIMOS PARTIDOS
            </span>
            <span className="text-xs text-foreground/25 font-medium tracking-wider">
              SIGUIENTES {upcomingMatches.length}
            </span>
          </div>
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
