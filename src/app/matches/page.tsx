import { createClient } from '@/lib/supabase/server'
import MatchCard from '@/components/match/MatchCard'
import { getStageLabel } from '@/lib/utils'
import type { Match, MatchStage } from '@/types'

export const revalidate = 60

const STAGE_ORDER: MatchStage[] = ['GROUP', 'ROUND_32', 'ROUND_16', 'QUARTER', 'SEMI', 'THIRD', 'FINAL']

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order('match_date')

  const matches = (data ?? []) as Match[]

  // Group by stage
  const byStage = new Map<MatchStage, Match[]>()
  for (const m of matches) {
    const key = m.stage as MatchStage
    if (!byStage.has(key)) byStage.set(key, [])
    byStage.get(key)!.push(m)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Calendario</h1>
        <p className="text-white/40 text-sm mt-1">{matches.length} partidos · 11 jun – 19 jul 2026</p>
      </div>

      {STAGE_ORDER.map(stage => {
        const stageMatches = byStage.get(stage)
        if (!stageMatches?.length) return null

        return (
          <section key={stage}>
            <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-3">
              {getStageLabel(stage)}
            </h2>
            <div className="space-y-2">
              {stageMatches.map((m, i) => (
                <MatchCard key={m.id} match={m} index={i} />
              ))}
            </div>
          </section>
        )
      })}

      {matches.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <p className="text-4xl mb-3">📅</p>
          <p>El calendario se cargará próximamente</p>
        </div>
      )}
    </div>
  )
}
