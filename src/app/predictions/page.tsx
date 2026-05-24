import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PredictionsClient from './PredictionsClient'
import type { Match, Prediction } from '@/types'

export const metadata = {
  title: 'Mis Predicciones — Mundial 2026',
  description: 'Gestiona tus predicciones para los partidos del Mundial FIFA 2026',
}



export const dynamic = 'force-dynamic'

export default async function PredictionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/predictions')

  const [{ data: predictions }, { data: upcoming }] = await Promise.all([
    supabase
      .from('predictions')
      .select(`*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('matches')
      .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
      .eq('status', 'SCHEDULED')
      .eq('stage', 'GROUP')
      .order('match_date')
      .limit(20),
  ])

  const userPredictions = (predictions ?? []) as Prediction[]
  const upcomingMatches = (upcoming ?? []) as Match[]

  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points_earned ?? 0), 0)
  const correct = userPredictions.filter(p => p.points_earned > 0).length

  return (
    <PredictionsClient
      userId={user.id}
      predictions={userPredictions}
      upcomingMatches={upcomingMatches}
      totalPoints={totalPoints}
      correctPredictions={correct}
    />
  )
}
