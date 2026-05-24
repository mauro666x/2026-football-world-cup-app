import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isMatchLocked } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { match_id, predicted_home_score, predicted_away_score } = body

  if (match_id === undefined || predicted_home_score === undefined || predicted_away_score === undefined) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // Verify match exists and is not started
  const { data: match } = await supabase
    .from('matches')
    .select('id, match_date, status')
    .eq('id', match_id)
    .single()

  if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })

  if (isMatchLocked(match.match_date) || match.status !== 'SCHEDULED') {
    return NextResponse.json({ error: 'El partido ya comenzó, no se puede predecir' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: user.id,
        match_id,
        predicted_home_score,
        predicted_away_score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,match_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 200 })
}
