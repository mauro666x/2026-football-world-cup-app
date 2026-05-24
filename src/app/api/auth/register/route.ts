import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede superar 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  display_name: z.string().max(50).optional(),
})

export async function POST(request: NextRequest) {
  // 1. Input validation
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, password, username, display_name } = parsed.data

  try {
    const admin = createAdminClient()

    // 2. Verificar que el username no esté en uso
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
    }

    // 3. Crear usuario en Auth
    const { data, error: signUpError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        username: username.toLowerCase(),
        display_name: display_name ?? username,
      },
    })

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    // 4. Crear perfil con service role (no depende de sesión ni trigger)
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: display_name ?? username,
      })

    if (profileError) {
      console.error('[register] profile creation error', {
        userId: data.user.id,
        error: profileError.message,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[register] unexpected error', { error: (error as Error).message })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
