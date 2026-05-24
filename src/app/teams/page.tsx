import { createClient } from '@/lib/supabase/server'
import TeamCard from '@/components/team/TeamCard'
import { GROUP_LETTERS } from '@/lib/utils'
import type { Team } from '@/types'

export const metadata = {
  title: 'Equipos — Mundial 2026',
  description: 'Los 48 equipos clasificados al Mundial FIFA 2026 con estadísticas y jugadores',
}



export const revalidate = 3600

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter')
    .order('fifa_ranking')

  const teams = (data ?? []) as Team[]

  // Group by confederation
  const byGroup = new Map<string, Team[]>()
  for (const t of teams) {
    const key = t.group_letter ?? 'Sin grupo'
    if (!byGroup.has(key)) byGroup.set(key, [])
    byGroup.get(key)!.push(t)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Selecciones</h1>
        <p className="text-white/40 text-sm mt-1">{teams.length} equipos clasificados</p>
      </div>

      {GROUP_LETTERS.map(letter => {
        const groupTeams = byGroup.get(letter)
        if (!groupTeams?.length) return null
        return (
          <section key={letter}>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
              Grupo {letter}
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              {groupTeams.map((t, i) => (
                <TeamCard key={t.id} team={t} index={i} />
              ))}
            </div>
          </section>
        )
      })}

      {teams.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <p className="text-4xl mb-3">🌍</p>
          <p>Los equipos se cargarán próximamente</p>
        </div>
      )}
    </div>
  )
}
