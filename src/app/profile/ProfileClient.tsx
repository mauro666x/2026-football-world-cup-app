'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getAvatarInitials } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { Trophy, Mail, Calendar, UserCheck, ShieldAlert, Award } from 'lucide-react'

interface Props {
  user: User
  initialProfile: Profile
  totalPredictions: number
  correctPredictions: number
}

export default function ProfileClient({
  user,
  initialProfile,
  totalPredictions,
  correctPredictions,
}: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialProfile.display_name ?? '')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    if (!displayName.trim()) {
      setErrorMsg('El nombre de muestra no puede estar vacío.')
      setLoading(false)
      return
    }

    if (displayName.length > 50) {
      setErrorMsg('El nombre de muestra no puede superar los 50 caracteres.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setSuccessMsg('¡Perfil actualizado con éxito!')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error al actualizar el perfil.'
      console.error('[profile update error]', err)
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Full redirect to home to refresh navbar auth state
      window.location.href = '/'
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const creationDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Mi Perfil</h1>
        <p className="text-white/40 text-sm mt-1">Configura tu perfil y visualiza tus estadísticas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <Card className="md:col-span-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-gold p-0.5 flex items-center justify-center shadow-lg shadow-gold/10">
            <div className="w-full h-full rounded-full bg-navy-800 flex items-center justify-center text-xl font-bold text-gradient-gold">
              {getAvatarInitials(initialProfile.display_name ?? initialProfile.username ?? 'U')}
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white truncate max-w-full">
              {initialProfile.display_name}
            </h2>
            <p className="text-xs text-white/40">@{initialProfile.username}</p>
          </div>
          <div className="w-full pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Puntos</span>
              <span className="font-bold text-gold">{initialProfile.points ?? 0} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Posición</span>
              <span className="font-semibold text-white/80">#Rankings</span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="flex flex-col justify-between p-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{totalPredictions}</span>
              <p className="text-xs text-white/35">Predicciones realizadas</p>
            </div>
          </Card>
          <Card className="flex flex-col justify-between p-5">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{correctPredictions}</span>
              <p className="text-xs text-white/35">Aciertos (puntos &gt; 0)</p>
            </div>
          </Card>
          <Card className="flex flex-col justify-between p-5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white truncate max-w-full">
                {initialProfile.username}
              </span>
              <p className="text-xs text-white/35">Usuario único</p>
            </div>
          </Card>
          <Card className="flex flex-col justify-between p-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{creationDate}</span>
              <p className="text-xs text-white/35">Miembro desde</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="p-6">
        <h3 className="font-bold text-white mb-4 text-base">Editar Perfil</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Correo Electrónico"
            value={user.email}
            disabled
            className="opacity-60 cursor-not-allowed"
            helperText="El correo electrónico no puede ser modificado."
          />

          <Input
            label="Nombre de Usuario"
            value={initialProfile.username ?? ''}
            disabled
            className="opacity-60 cursor-not-allowed"
            helperText="El nombre de usuario es tu identificador único."
          />

          <Input
            label="Nombre de Muestra"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Introduce tu nombre"
            error={errorMsg}
            helperText="Este nombre se mostrará públicamente en el ranking general."
          />

          {successMsg && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2">
              <Award className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="danger"
              onClick={handleLogout}
              className="text-xs"
            >
              Cerrar Sesión
            </Button>

            <Button type="submit" variant="primary" loading={loading} className="text-xs">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
