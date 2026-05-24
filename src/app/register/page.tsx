import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Crear Cuenta — Mundial 2026',
  description: 'Regístrate gratis para hacer tus predicciones del Mundial FIFA 2026',
}

export default function RegisterPage() {
  return <RegisterForm />
}
