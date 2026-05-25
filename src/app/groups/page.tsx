import { createClient } from '@/lib/supabase/server'
import Flag from '@/components/team/Flag'
import Link from 'next/link'
import { GROUP_LETTERS } from '@/lib/utils'
import { calculateGroupStandings } from '@/lib/scoring'
import type { Team, Match } from '@/types'

export const metadata = {
  title: 'Grupos — Mundial 2026',
  description: 'Tabla de posiciones de los 12 grupos del Mundial FIFA 2026',
}



export const revalidate = 60

const POS_COLORS = [
  { cls: 'pos-q', title: 'Clasifica directamente' },
  { cls: 'pos-q', title: 'Clasifica directamente' },
  { cls: 'pos-p', title: 'Posible repechaje' },
  { cls: 'pos-o', title: 'Eliminado' },
]

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
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="section-title font-display text-3xl tracking-wider text-foreground">
          FASE DE GRUPOS
        </h1>
        <p className="text-foreground/40 text-sm mt-2 ml-3.5">
          12 grupos · 4 equipos cada uno · 72 partidos
        </p>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm pos-q block" />
          <span className="text-xs text-foreground/40">Clasificado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm pos-p block" />
          <span className="text-xs text-foreground/40">Repechaje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm pos-o block" />
          <span className="text-xs text-foreground/40">Eliminado</span>
        </div>
      </div>

      {/* ── Groups grid ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUP_LETTERS.map(letter => {
          const groupTeams = allTeams.filter(t => t.group_letter === letter)
          const groupMatches = allMatches.filter(m => m.group_letter === letter)
          const standings = calculateGroupStandings(groupTeams, groupMatches)
          const displayTeams = standings.length > 0 ? standings.map(s => s.team) : groupTeams.slice(0, 4)

          return (
            <Link key={letter} href={`/groups/${letter}`}>
              <div className="wc-card wc-card-hover cursor-pointer overflow-hidden">
                {/* Group header */}
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(201,162,39,0.1)', background: 'rgba(201,162,39,0.04)' }}>
                  <span className="font-display text-xl tracking-wider text-gold">
                    GRUPO {letter}
                  </span>
                  <span className="text-xs text-foreground/30 font-medium tracking-wider">
                    {groupTeams.length} EQUIPOS
                  </span>
                </div>

                {/* Standings table */}
                <div>
                  {/* Column headers */}
                  {standings.length > 0 && (
                    <div className="px-4 py-1.5 flex items-center gap-2 text-[10px] font-medium text-foreground/25 uppercase tracking-widest"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="w-3" />
                      <span className="w-4 text-center">#</span>
                      <span className="flex-1">Equipo</span>
                      <span className="w-6 text-center">PJ</span>
                      <span className="w-6 text-center">G</span>
                      <span className="w-6 text-center">E</span>
                      <span className="w-6 text-center">P</span>
                      <span className="w-8 text-center font-bold text-foreground/35">Pts</span>
                    </div>
                  )}

                  {standings.length > 0
                    ? standings.map((s, i) => {
                        const posColor = s.played > 0 ? POS_COLORS[i] : { cls: 'bg-white/10', title: 'Por jugar' }
                        return (
                          <div
                            key={s.team.id}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/2 transition-colors"
                            style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                          >
                            {/* Position indicator */}
                            <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${posColor.cls}`} />

                            {/* Position number */}
                            <span className="w-4 text-center text-xs text-foreground/35 font-medium tabular-nums">
                              {i + 1}
                            </span>

                            {/* Flag */}
                            <Flag code={s.team.code} name={s.team.name} size="xs" className="flex-shrink-0" />

                            {/* Name */}
                            <span className="flex-1 text-sm text-foreground/80 truncate font-medium">
                              {s.team.name}
                            </span>

                            {/* Stats */}
                            <span className="w-6 text-center text-xs text-foreground/30 tabular-nums">{s.played}</span>
                            <span className="w-6 text-center text-xs text-foreground/30 tabular-nums">{s.won}</span>
                            <span className="w-6 text-center text-xs text-foreground/30 tabular-nums">{s.drawn}</span>
                            <span className="w-6 text-center text-xs text-foreground/30 tabular-nums">{s.lost}</span>
                            <span className="w-8 text-center font-display text-lg text-foreground/70 tabular-nums leading-none">
                              {s.points}
                            </span>
                          </div>
                        )
                      })
                    : displayTeams.map((team, i) => (
                        <div
                          key={team.id}
                          className="flex items-center gap-2 px-4 py-2.5"
                          style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                        >
                          <div className="w-0.5 h-4 rounded-full pos-o flex-shrink-0" />
                          <span className="w-4 text-center text-xs text-foreground/25">{i + 1}</span>
                          <Flag code={team.code} name={team.name} size="xs" className="flex-shrink-0" />
                          <span className="flex-1 text-sm text-foreground/70 truncate">{team.name}</span>
                        </div>
                      ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
