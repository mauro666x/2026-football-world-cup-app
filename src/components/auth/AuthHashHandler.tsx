'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Detecta tokens de Supabase en el hash de la URL y redirige al flujo correcto.
 * Se monta en el layout raíz para interceptar cualquier link de email de Supabase
 * que aterrice en la raíz (ej: https://app/#access_token=...&type=recovery).
 *
 * Tipos manejados:
 *   - type=recovery  → /auth/reset-password (cambio de contraseña)
 *   - type=signup    → el código de confirmación ya lo maneja /api/auth/[...supabase]
 */
export default function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')

    if (type === 'recovery' && accessToken) {
      // Preservar todos los parámetros del hash como query string
      // para que la página de reset los lea desde searchParams (server-safe).
      router.replace(`/auth/reset-password?${hash}`)
    }
  }, [router])

  return null
}
