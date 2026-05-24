import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS y email confirmation
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(request: Request) {
  const { email, password, username, display_name } = await request.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const admin = getAdminClient()

  // 1. Verificar que el username no esté en uso
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
  }

  // 2. Crear usuario en Auth
  const { data, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // requiere confirmación de email
    user_metadata: {
      username: username.toLowerCase(),
      display_name: display_name || username,
    },
  })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  // 3. Crear perfil con service role (no depende de sesión ni trigger)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: data.user.id,
      username: username.toLowerCase(),
      display_name: display_name || username,
    })

  if (profileError) {
    // El perfil falló, pero el usuario fue creado — loguear y continuar
    console.error('Profile creation error:', profileError.message)
  }

  return NextResponse.json({ success: true })
}
