import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — uses getUser() for server-side verification (not getSession())
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Pages that require auth
  // Leaderboard is public — anyone can see rankings without logging in
  const protectedPages = ['/predictions']
  const isProtectedPage = protectedPages.some(p => pathname.startsWith(p))

  // API routes that require auth (beyond their own getUser() check — belt & suspenders)
  const protectedApiRoutes = ['/api/predictions', '/api/notifications']
  const isProtectedApi = protectedApiRoutes.some(p => pathname.startsWith(p))

  if ((isProtectedPage || isProtectedApi) && !user) {
    const url = request.nextUrl.clone()

    if (isProtectedApi) {
      // API routes return 401 JSON, not a redirect
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
