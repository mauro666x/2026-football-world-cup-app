// Supabase Edge Function — sync-scores
// Sincroniza scores del Mundial desde Football-Data.org hacia Supabase
// Se ejecuta cada minuto via Supabase cron (gratis, sin límite de Vercel Hobby)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FOOTBALL_DATA_URL = 'https://api.football-data.org/v4'
const COMPETITION_CODE = 'WC'

const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'SCHEDULED', TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE', PAUSED: 'HALFTIME',
  FINISHED: 'FINISHED', POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED', SUSPENDED: 'POSTPONED',
}

function calcPoints(ph: number, pa: number, ah: number, aa: number): number {
  if (ph === ah && pa === aa) return 5
  if (Math.sign(ph - pa) === Math.sign(ah - aa)) return 3
  if (ph === ah || pa === aa) return 1
  return 0
}

Deno.serve(async (req) => {
  // Acepta llamadas del cron de Supabase (sin auth header necesario desde el propio Supabase)
  const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY') ?? ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!apiKey) return new Response('FOOTBALL_DATA_API_KEY no configurada', { status: 500 })

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  try {
    // Traer solo partidos LIVE y los próximos 24h para no gastar el rate limit
    const res = await fetch(
      `${FOOTBALL_DATA_URL}/competitions/${COMPETITION_CODE}/matches?status=LIVE,IN_PLAY,PAUSED,TIMED,SCHEDULED`,
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (!res.ok) {
      const body = await res.text()
      return new Response(`Football-Data error ${res.status}: ${body}`, { status: 502 })
    }

    const { matches } = await res.json()
    let updated = 0

    for (const m of matches) {
      const status = STATUS_MAP[m.status] ?? 'SCHEDULED'
      const homeScore = m.score?.fullTime?.home ?? null
      const awayScore = m.score?.fullTime?.away ?? null

      const { data: existing } = await supabase
        .from('matches')
        .select('id, home_score, away_score, status')
        .eq('external_id', m.id)
        .maybeSingle()

      if (!existing) continue

      // Solo actualizar si cambió algo
      if (existing.status === status && existing.home_score === homeScore && existing.away_score === awayScore) continue

      await supabase.from('matches').update({
        status,
        home_score: homeScore,
        away_score: awayScore,
        home_penalties: m.score?.penalties?.home ?? null,
        away_penalties: m.score?.penalties?.away ?? null,
        minute: m.minute ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)

      updated++

      // Partido recién terminado → calcular puntos
      if (status === 'FINISHED' && existing.status !== 'FINISHED' && homeScore !== null && awayScore !== null) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('id, user_id, predicted_home_score, predicted_away_score')
          .eq('match_id', existing.id)

        for (const pred of preds ?? []) {
          const pts = calcPoints(pred.predicted_home_score, pred.predicted_away_score, homeScore, awayScore)
          await supabase.from('predictions').update({ points_earned: pts, locked: true }).eq('id', pred.id)
          if (pts > 0) await supabase.rpc('increment_user_points', { p_user_id: pred.user_id, p_points: pts })
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, updated, total: matches.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(String(err), { status: 500 })
  }
})
