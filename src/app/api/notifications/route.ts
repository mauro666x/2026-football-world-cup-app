import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Save push subscription
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, subscription: body })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// Delete push subscription
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  await supabase.from('push_subscriptions').delete().eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
