import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'
import { getAvatarInitials } from '@/lib/utils'
import type { Profile } from '@/types'

export const revalidate = 300

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)

  const profiles = (data ?? []) as Profile[]

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Ranking Global
        </h1>
        <p className="text-white/40 text-sm mt-1">Top 50 jugadores por puntos totales</p>
      </div>

      <Card padding="none">
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>El ranking se activará cuando empiecen los partidos</p>
          </div>
        ) : (
          <div>
            {profiles.map((profile, i) => {
              const isTop3 = i < 3
              const isMe = profile.id === user?.id
              const medals = ['🥇', '🥈', '🥉']

              return (
                <div
                  key={profile.id}
                  className={`
                    flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0
                    ${isMe ? 'bg-green-500/5' : ''}
                    ${isTop3 ? '' : ''}
                  `}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    {isTop3 ? (
                      <span className="text-lg">{medals[i]}</span>
                    ) : (
                      <span className="text-sm text-white/30 tabular-nums">{i + 1}</span>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {getAvatarInitials(profile.display_name ?? profile.username)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-green-400' : 'text-white'}`}>
                      {profile.display_name ?? profile.username}
                      {isMe && <span className="text-xs ml-1 opacity-60">(tú)</span>}
                    </p>
                    <p className="text-xs text-white/30">@{profile.username}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-lg">{profile.points}</p>
                    <p className="text-xs text-white/30">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
