'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'

type Stage = 'loading' | 'form' | 'success' | 'error'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = useState<Stage>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)

  /** Establece la sesión a partir del access_token recibido por email */
  const initSession = useCallback(async () => {
    // Los params pueden venir como query string (redirigidos por AuthHashHandler)
    // o directamente desde el hash (si el usuario entra directo a esta URL).
    const accessToken =
      searchParams.get('access_token') ??
      new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.slice(1) : '').get('access_token')

    const refreshToken =
      searchParams.get('refresh_token') ??
      new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.slice(1) : '').get('refresh_token')

    if (!accessToken || !refreshToken) {
      setErrorMsg('El enlace de recuperación es inválido o ya expiró. Solicita uno nuevo.')
      setStage('error')
      return
    }

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) {
      setErrorMsg('El enlace expiró o ya fue usado. Solicita un nuevo email de recuperación.')
      setStage('error')
      return
    }

    setStage('form')
  }, [searchParams, supabase.auth])

  useEffect(() => {
    initSession()
  }, [initSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    setSaving(true)
    setErrorMsg('')

    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setStage('success')
    setTimeout(() => router.push('/'), 3000)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* ── Loading ── */}
        {stage === 'loading' && (
          <div className="wc-card p-10 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-foreground/50 text-sm">Verificando enlace…</p>
          </div>
        )}

        {/* ── Error ── */}
        {stage === 'error' && (
          <div className="wc-card p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="font-display text-2xl tracking-wider text-foreground">ENLACE INVÁLIDO</h1>
            <p className="text-sm text-foreground/50">{errorMsg}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227' }}
            >
              Volver al login
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {stage === 'success' && (
          <div className="wc-card p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h1 className="font-display text-2xl tracking-wider text-foreground">CONTRASEÑA ACTUALIZADA</h1>
            <p className="text-sm text-foreground/50">Redirigiendo al inicio…</p>
          </div>
        )}

        {/* ── Form ── */}
        {stage === 'form' && (
          <div className="wc-card p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}>
                <Lock className="w-6 h-6 text-gold" />
              </div>
              <h1 className="font-display text-2xl tracking-wider text-foreground">NUEVA CONTRASEÑA</h1>
              <p className="text-sm text-foreground/40">Elige una contraseña de al menos 8 caracteres</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/50 uppercase tracking-widest">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-gold/40 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/50 uppercase tracking-widest">
                  Confirmar contraseña
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-gold/40 focus:bg-white/8 transition-all"
                />
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving || !password || !confirm}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saving || !password || !confirm
                    ? 'rgba(201,162,39,0.15)'
                    : 'linear-gradient(135deg, #c9a227, #a07d1a)',
                  border: '1px solid rgba(201,162,39,0.3)',
                  color: saving || !password || !confirm ? '#c9a227' : '#070b14',
                }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Guardando…
                  </span>
                ) : (
                  'Guardar contraseña'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
