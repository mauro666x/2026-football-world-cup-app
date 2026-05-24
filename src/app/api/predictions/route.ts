import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isMatchLocked } from '@/lib/utils'

const predictionSchema = z.object({
  match_id: z.number().int().positive(),
  predicted_home_score: z
    .number()
    .int()
    .min(0, 'El marcador no puede ser negativo')
    .max(99, 'El marcador no puede superar 99'),
  predicted_away_score: z
    .number()
    .int()
    .min(0, 'El marcador no puede ser negativo')
    .max(99, 'El marcador no puede superar 99'),
})

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 2. Input validation
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = predictionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { match_id, predicted_home_score, predicted_away_score } = parsed.data

  // 3. Business logic
  try {
    const { data: match } = await supabase
      .from('matches')
      .select('id, match_date, status')
      .eq('id', match_id)
      .single()

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
    }

    if (isMatchLocked(match.match_date) || match.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'El partido ya comenzó, no se puede predecir' },
        { status: 403 }
      )
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

    if (error) {
      console.error('[predictions POST]', { userId: user.id, matchId: match_id, error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('[predictions POST] unexpected', { userId: user.id, error: (error as Error).message })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
