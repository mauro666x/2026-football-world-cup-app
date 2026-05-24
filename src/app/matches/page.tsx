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
    <div className="space-y-10">

      {/* ── Header ── */}
      <div>
        <h1 className="section-title font-display text-3xl tracking-wider text-foreground">
          CALENDARIO
        </h1>
        <p className="text-foreground/40 text-sm mt-2 ml-3.5">
          {matches.length} partidos · 11 jun – 19 jul 2026
        </p>
      </div>

      {/* ── Empty state ── */}
      {matches.length === 0 && (
        <div className="wc-card p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="font-display text-xl tracking-wider text-foreground/30">CALENDARIO PRÓXIMAMENTE</p>
          <p className="text-sm text-foreground/20 mt-2">Los partidos se cargarán cuando comience el torneo</p>
        </div>
      )}

      {/* ── Stages ── */}
      {STAGE_ORDER.map(stage => {
        const stageMatches = byStage.get(stage)
        if (!stageMatches?.length) return null

        return (
          <section key={stage}>
            <div className="flex items-center gap-3 mb-4">
              <div className="section-title font-display text-lg tracking-wider text-foreground/60">
                {getStageLabel(stage).toUpperCase()}
              </div>
              <span className="ml-auto text-xs text-foreground/25 font-medium tracking-wider">
                {stageMatches.length} PARTIDOS
              </span>
            </div>
            <div className="space-y-2">
              {stageMatches.map((m, i) => (
                <MatchCard key={m.id} match={m} index={i} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
