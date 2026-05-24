'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const metadata = {
  title: 'Crear Cuenta — Mundial 2026',
  description: 'Regístrate gratis para hacer tus predicciones del Mundial FIFA 2026',
}



export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: username.toLowerCase(),
          display_name: displayName || username,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al crear la cuenta')
        return
      }

      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm space-y-4"
        >
          <span className="text-6xl">✅</span>
          <h2 className="text-2xl font-black text-white">¡Cuenta creada!</h2>
          <p className="text-white/50 text-sm">
            Revisa tu email para confirmar tu cuenta y empezar a predecir.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Ir a iniciar sesión
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <span className="text-5xl">⚽</span>
          <h1 className="text-2xl font-black text-white mt-3">Crear cuenta</h1>
          <p className="text-white/40 text-sm mt-1">Únete al Mundial 2026</p>
        </div>

        <Card>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Usuario"
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              helperText="Aparecerá en el ranking público"
              required
            />
            <Input
              label="Nombre para mostrar"
              type="text"
              placeholder="Tu nombre"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Crear cuenta
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-white/40 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
            Iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
