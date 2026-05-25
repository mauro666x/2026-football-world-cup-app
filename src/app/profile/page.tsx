import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'
import type { Profile } from '@/types'

export const metadata = {
  title: 'Mi Perfil — Mundial 2026',
  description: 'Gestiona tu perfil de usuario y revisa tus estadísticas de predicción.',
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/profile')
  }

  // Fetch user profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch prediction stats for the user
  const { count: totalPredictions } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: correctPredictions } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gt('points_earned', 0)

  return (
    <ProfileClient
      user={user}
      initialProfile={(profile ?? {}) as Profile}
      totalPredictions={totalPredictions ?? 0}
      correctPredictions={correctPredictions ?? 0}
    />
  )
}
