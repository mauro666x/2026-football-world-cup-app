import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con privilegios de admin (service role).
 * Bypasses RLS — usar SOLO en API routes del servidor, nunca en el cliente.
 *
 * Lee la key desde la variable de entorno SUPABASE_SERVICE_ROLE_KEY.
 * Acepta tanto el formato legacy JWT como el nuevo formato sb_secret_...
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
