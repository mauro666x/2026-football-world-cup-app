import { Card } from '@/components/ui/Card'
import Flag from '@/components/team/Flag'
import { formatMatchDateShort } from '@/lib/utils'
import type { HeadToHead, Team } from '@/types'

interface Props {
  h2h: HeadToHead
  homeTeam: Team
  awayTeam: Team
}

export default function HeadToHeadSection({ h2h, homeTeam, awayTeam }: Props) {
  const total = h2h.team1_wins + h2h.team2_wins + h2h.draws

  // Determine which team is team1 and which is team2
  const homeIsTeam1 = h2h.team1_id === homeTeam.id
  const homeWins = homeIsTeam1 ? h2h.team1_wins : h2h.team2_wins
  const awayWins = homeIsTeam1 ? h2h.team2_wins : h2h.team1_wins

  const homeWidth = total > 0 ? (homeWins / total) * 100 : 33.3
  const drawWidth = total > 0 ? (h2h.draws / total) * 100 : 33.3
  const awayWidth = total > 0 ? (awayWins / total) * 100 : 33.3

  return (
    <Card>
      <h3 className="font-semibold text-white mb-4">Historial de enfrentamientos</h3>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center w-12">
          <Flag code={homeTeam.code} size="sm" />
          <span className="text-xl font-black text-white mt-1">{homeWins}</span>
          <span className="text-xs text-white/30">V</span>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div
              className="bg-green-500 rounded-full transition-all"
              style={{ width: `${homeWidth}%` }}
            />
            <div
              className="bg-white/20 rounded-full transition-all"
              style={{ width: `${drawWidth}%` }}
            />
            <div
              className="bg-blue-500 rounded-full transition-all"
              style={{ width: `${awayWidth}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>{homeWins} victorias</span>
            <span>{h2h.draws} empates</span>
            <span>{awayWins} victorias</span>
          </div>
        </div>

        <div className="flex flex-col items-center w-12">
          <Flag code={awayTeam.code} size="sm" />
          <span className="text-xl font-black text-white mt-1">{awayWins}</span>
          <span className="text-xs text-white/30">V</span>
        </div>
      </div>

      {/* Last matches */}
      {h2h.matches_data && h2h.matches_data.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-white/30 uppercase tracking-wider">Últimos partidos</p>
          {h2h.matches_data.slice(0, 5).map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-sm py-1.5 border-b border-white/5 last:border-0">
              <span className="text-white/30 text-xs w-16">{formatMatchDateShort(m.date)}</span>
              <span className="flex-1 text-white/70 truncate">{m.home_team}</span>
              <span className="font-bold text-white tabular-nums">
                {m.home_score} – {m.away_score}
              </span>
              <span className="flex-1 text-white/70 truncate text-right">{m.away_team}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
