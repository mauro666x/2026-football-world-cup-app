import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import webpush from 'web-push'
import { addMinutes, parseISO, isWithinInterval, subMinutes } from 'date-fns'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Initialize VAPID lazily (avoids build-time errors)
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_CONTACT_EMAIL ?? 'admin@mundial2026.app'),
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const supabase = createAdminClient()
  const now = new Date()

  // Find matches starting in ~60 min or ~5 min
  const { data: rawMatches } = await supabase
    .from('matches')
    .select('id, match_date, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .eq('status', 'SCHEDULED')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches = (rawMatches ?? []) as unknown as Array<{
    id: number
    match_date: string
    home_team: { name: string } | null
    away_team: { name: string } | null
  }>

  let sent = 0

  for (const match of matches) {
    const matchTime = parseISO(match.match_date)

    const is1hBefore = isWithinInterval(now, {
      start: subMinutes(matchTime, 62),
      end: subMinutes(matchTime, 58),
    })
    const isKickoff = isWithinInterval(now, {
      start: subMinutes(matchTime, 3),
      end: addMinutes(matchTime, 3),
    })

    if (!is1hBefore && !isKickoff) continue

    // Get users with alerts for this match
    const { data: alerts } = await supabase
      .from('match_alerts')
      .select('user_id, alert_1h_before, alert_kickoff')
      .eq('match_id', match.id)
      .eq(is1hBefore ? 'alert_1h_before' : 'alert_kickoff', true)

    if (!alerts?.length) continue

    const userIds = alerts.map(a => a.user_id)

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id')
      .in('user_id', userIds)

    const title = is1hBefore
      ? `⏰ En 1 hora: ${match.home_team?.name} vs ${match.away_team?.name}`
      : `🚨 ¡Ahora! ${match.home_team?.name} vs ${match.away_team?.name}`

    const body = is1hBefore
      ? 'Tienes tiempo para hacer tu predicción'
      : '¡El partido está por comenzar!'

    for (const sub of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          sub.subscription as webpush.PushSubscription,
          JSON.stringify({ title, body, icon: '/icons/icon-192.png', badge: '/icons/badge-72.png' })
        )
        sent++
      } catch (err) {
        // Subscription expired — remove it
        await supabase.from('push_subscriptions').delete().eq('user_id', sub.user_id)
      }
    }
  }

  return NextResponse.json({ success: true, sent })
}
