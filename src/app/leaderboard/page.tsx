import { createClient } from '@/lib/supabase/server'
import { Trophy, Medal, Star } from 'lucide-react'
import { getAvatarInitials } from '@/lib/utils'
import type { Profile } from '@/types'

export const metadata = {
  title: 'Clasificación — Mundial 2026',
  description: 'Tabla de líderes con los mejores pronosticadores del Mundial FIFA 2026',
}



export const revalidate = 300

const MEDAL_CONFIG = [
  { bg: 'from-gold/20 to-gold/5', border: 'rgba(201,162,39,0.4)', text: 'text-gold-300', label: '🥇', size: 'text-3xl' },
  { bg: 'from-slate-400/20 to-slate-400/5', border: 'rgba(148,163,184,0.4)', text: 'text-slate-300', label: '🥈', size: 'text-2xl' },
  { bg: 'from-amber-700/20 to-amber-700/5', border: 'rgba(180,83,9,0.4)', text: 'text-amber-500', label: '🥉', size: 'text-2xl' },
]

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)

  const profiles = (data ?? []) as Profile[]
  const { data: { user } } = await supabase.auth.getUser()

  const top3 = profiles.slice(0, 3)
  const rest = profiles.slice(3)

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="section-title font-display text-3xl tracking-wider text-foreground">
          RANKING GLOBAL
        </h1>
        <p className="text-foreground/40 text-sm mt-2 ml-3.5">
          Top {profiles.length} jugadores · Actualizado cada 5 min
        </p>
      </div>

      {/* ── Empty state ── */}
      {profiles.length === 0 && (
        <div className="wc-card p-16 text-center">
          <Trophy className="w-12 h-12 text-gold/30 mx-auto mb-4" />
          <p className="font-display text-xl tracking-wider text-foreground/30">RANKING EN ESPERA</p>
          <p className="text-sm text-foreground/20 mt-2">Se activará cuando comiencen los partidos</p>
        </div>
      )}

      {/* ── Top 3 podium ── */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((profile, i) => {
            const medal = MEDAL_CONFIG[i]
            const isMe = profile.id === user?.id

            return (
              <div
                key={profile.id}
                className={`wc-card p-4 md:p-5 text-center relative overflow-hidden bg-gradient-to-b ${medal.bg}`}
                style={{ border: `1px solid ${medal.border}` }}
              >
                {/* Rank */}
                <div className={`font-display ${medal.size} mb-2`}>{medal.label}</div>

                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-display text-lg"
                  style={{ background: `rgba(255,255,255,0.08)`, border: `1px solid ${medal.border}` }}
                >
                  {getAvatarInitials(profile.display_name ?? profile.username)}
                </div>

                {/* Name */}
                <p className={`font-semibold text-sm truncate ${isMe ? 'text-gold' : 'text-foreground'}`}>
                  {profile.display_name ?? profile.username}
                  {isMe && <span className="block text-xs text-gold/60 font-normal">(tú)</span>}
                </p>

                {/* Points */}
                <div className="mt-3">
                  <span className={`font-display text-4xl leading-none ${medal.text}`}>
                    {profile.points}
                  </span>
                  <span className="block text-xs text-foreground/30 mt-0.5 tracking-widest uppercase">puntos</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Rest of ranking ── */}
      {rest.length > 0 && (
        <div className="wc-card overflow-hidden">
          {/* Table header */}
          <div className="px-4 py-2.5 flex items-center gap-3"
            style={{ borderBottom: '1px solid rgba(201,162,39,0.1)', background: 'rgba(201,162,39,0.04)' }}>
            <span className="w-8 text-center text-xs font-medium text-foreground/30 uppercase tracking-widest">#</span>
            <span className="flex-1 text-xs font-medium text-foreground/30 uppercase tracking-widest">Jugador</span>
            <span className="text-xs font-medium text-foreground/30 uppercase tracking-widest">Pts</span>
          </div>

          <div>
            {rest.map((profile, idx) => {
              const i = idx + 3
              const isMe = profile.id === user?.id

              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/2"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isMe ? 'rgba(201,162,39,0.05)' : undefined,
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="font-display text-lg text-foreground/25 tabular-nums leading-none">
                      {i + 1}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-foreground/60"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {getAvatarInitials(profile.display_name ?? profile.username)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-gold' : 'text-foreground/80'}`}>
                      {profile.display_name ?? profile.username}
                      {isMe && <span className="text-xs ml-1 text-gold/50">(tú)</span>}
                    </p>
                    <p className="text-xs text-foreground/25 truncate">@{profile.username}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <span className={`font-display text-2xl leading-none tabular-nums ${isMe ? 'text-gold' : 'text-foreground/70'}`}>
                      {profile.points}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
