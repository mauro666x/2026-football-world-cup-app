import type { ScoreResult } from '@/types'

/**
 * Calcula los puntos de una predicción de partido
 */
export function calculateMatchPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): ScoreResult {
  // Resultado exacto
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return { exact: true, correct: true, oneTeam: true, points: 5 }
  }

  const predictedWinner = Math.sign(predictedHome - predictedAway) // -1, 0, 1
  const actualWinner = Math.sign(actualHome - actualAway)

  // Resultado correcto (ganador o empate)
  if (predictedWinner === actualWinner) {
    return { exact: false, correct: true, oneTeam: true, points: 3 }
  }

  // Un equipo con score correcto
  if (predictedHome === actualHome || predictedAway === actualAway) {
    return { exact: false, correct: false, oneTeam: true, points: 1 }
  }

  return { exact: false, correct: false, oneTeam: false, points: 0 }
}

/**
 * Puntos para predicciones de fase
 */
export const STAGE_POINTS = {
  GROUP_QUALIFIER: 2,   // Equipo pasa de grupo
  GROUP_WINNER: 3,      // Ganador de grupo
  ROUND_32: 3,
  ROUND_16: 4,
  QUARTER: 5,
  SEMI: 7,
  RUNNER_UP: 10,
  CHAMPION: 20,
} as const

export type StagePointsKey = keyof typeof STAGE_POINTS

/**
 * Descripción de la puntuación para mostrar en la UI
 */
export function getScoreDescription(result: ScoreResult): string {
  if (result.exact) return '¡Resultado exacto! +5 pts'
  if (result.correct) return 'Resultado correcto +3 pts'
  if (result.oneTeam) return 'Un marcador correcto +1 pt'
  return 'Sin puntos'
}

/**
 * Calcula las posiciones de grupo
 */
export function calculateGroupStandings(
  teams: { id: number; name: string; code: string; flag_url?: string | null }[],
  matches: {
    home_team_id: number
    away_team_id: number
    home_score: number | null
    away_score: number | null
    status: string
  }[]
) {
  const standings = new Map(
    teams.map(t => [t.id, {
      team: t,
      played: 0, won: 0, drawn: 0, lost: 0,
      goals_for: 0, goals_against: 0, goal_difference: 0, points: 0
    }])
  )

  for (const match of matches) {
    if (match.status !== 'FINISHED') continue
    if (match.home_score === null || match.away_score === null) continue

    const home = standings.get(match.home_team_id)
    const away = standings.get(match.away_team_id)
    if (!home || !away) continue

    home.played++; away.played++
    home.goals_for += match.home_score; home.goals_against += match.away_score
    away.goals_for += match.away_score; away.goals_against += match.home_score

    if (match.home_score > match.away_score) {
      home.won++; home.points += 3
      away.lost++
    } else if (match.home_score < match.away_score) {
      away.won++; away.points += 3
      home.lost++
    } else {
      home.drawn++; home.points++
      away.drawn++; away.points++
    }
  }

  return Array.from(standings.values())
    .map(s => ({ ...s, goal_difference: s.goals_for - s.goals_against }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
      return a.team.name.localeCompare(b.team.name)
    })
}
