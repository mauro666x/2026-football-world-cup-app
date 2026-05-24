import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWorldCupMatches, mapFDStatus, mapFDStage } from '@/lib/api/football-data'
import { calculateMatchPoints } from '@/lib/scoring'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const fdMatches = await getWorldCupMatches()
    let updated = 0

    for (const fdMatch of fdMatches) {
      const status = mapFDStatus(fdMatch.status)
      const homeScore = fdMatch.score.fullTime.home
      const awayScore = fdMatch.score.fullTime.away

      // Find our match by external_id
      const { data: existing } = await supabase
        .from('matches')
        .select('id, home_score, away_score, status')
        .eq('external_id', fdMatch.id)
        .single()

      if (!existing) continue

      // Only update if something changed
      if (
        existing.status === status &&
        existing.home_score === homeScore &&
        existing.away_score === awayScore
      ) continue

      await supabase
        .from('matches')
        .update({
          status,
          home_score: homeScore,
          away_score: awayScore,
          home_penalties: fdMatch.score.penalties?.home ?? null,
          away_penalties: fdMatch.score.penalties?.away ?? null,
          minute: fdMatch.minute ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      updated++

      // If match just finished, calculate prediction points
      if (status === 'FINISHED' && existing.status !== 'FINISHED' && homeScore !== null && awayScore !== null) {
        await updatePredictionPoints(supabase, existing.id, homeScore, awayScore)
      }
    }

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function updatePredictionPoints(
  supabase: ReturnType<typeof createAdminClient>,
  matchId: number,
  actualHome: number,
  actualAway: number
) {
  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, user_id, predicted_home_score, predicted_away_score')
    .eq('match_id', matchId)

  if (!predictions?.length) return

  for (const pred of predictions) {
    const result = calculateMatchPoints(
      pred.predicted_home_score,
      pred.predicted_away_score,
      actualHome,
      actualAway
    )

    await supabase
      .from('predictions')
      .update({ points_earned: result.points, locked: true })
      .eq('id', pred.id)

    if (result.points > 0) {
      await supabase.rpc('increment_user_points', {
        p_user_id: pred.user_id,
        p_points: result.points,
      })
    }
  }
}
