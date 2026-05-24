// Supabase Edge Function — send-alerts
// Envía push notifications 1h antes y al inicio de cada partido
// Se ejecuta cada 5 minutos via pg_cron

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @deno-types="https://esm.sh/@types/web-push@3"
import webpush from 'https://esm.sh/web-push@3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

Deno.serve(async () => {
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidEmail = Deno.env.get('VAPID_EMAIL') ?? 'admin@mundial2026.app'

  if (!vapidPublic || !vapidPrivate) {
    return new Response('VAPID keys no configuradas', { status: 500 })
  }

  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate)

  const now = new Date()
  const in1h = new Date(now.getTime() + 60 * 60 * 1000)
  const in5min = new Date(now.getTime() + 5 * 60 * 1000)

  // Partidos que arrancan entre ahora+0 y ahora+65min
  const { data: upcoming } = await supabase
    .from('matches')
    .select(`
      id, match_date,
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name)
    `)
    .eq('status', 'SCHEDULED')
    .gte('match_date', now.toISOString())
    .lte('match_date', in1h.toISOString())

  let sent = 0

  for (const match of (upcoming ?? []) as any[]) {
    const matchTime = new Date(match.match_date)
    const msUntil = matchTime.getTime() - now.getTime()
    const is1hBefore = msUntil > 55 * 60 * 1000   // entre 55min y 65min
    const isKickoff  = msUntil <= 5 * 60 * 1000    // menos de 5min

    if (!is1hBefore && !isKickoff) continue

    const { data: alerts } = await supabase
      .from('match_alerts')
      .select('user_id')
      .eq('match_id', match.id)
      .eq(is1hBefore ? 'alert_1h_before' : 'alert_kickoff', true)

    if (!alerts?.length) continue

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription')
      .in('user_id', alerts.map((a: any) => a.user_id))

    const title = is1hBefore
      ? `⏰ En 1 hora: ${match.home_team?.name} vs ${match.away_team?.name}`
      : `🚨 ¡Ya empieza! ${match.home_team?.name} vs ${match.away_team?.name}`

    const body = is1hBefore
      ? 'Todavía puedes hacer tu predicción'
      : '¡El partido está por comenzar!'

    for (const sub of (subs ?? []) as any[]) {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({ title, body, icon: '/icons/icon-192.png' })
        )
        sent++
      } catch {
        await supabase.from('push_subscriptions').delete().eq('user_id', sub.user_id)
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
