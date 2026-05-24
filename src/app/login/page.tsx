import { Suspense } from 'react'
import type { Metadata } from 'next'
import Spinner from '@/components/ui/Spinner'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — Mundial 2026',
  description: 'Inicia sesión para gestionar tus predicciones del Mundial FIFA 2026',
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
