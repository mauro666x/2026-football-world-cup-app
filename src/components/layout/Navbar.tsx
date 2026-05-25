'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, Calendar, TrendingUp, Trophy, Zap, Menu, X, ArrowRight, LogOut, User } from 'lucide-react'
import { cn, getAvatarInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/matches', label: 'Partidos', icon: Calendar },
  { href: '/live', label: 'En Vivo', icon: Zap, live: true },
  { href: '/predictions', label: 'Predicciones', icon: TrendingUp },
  { href: '/leaderboard', label: 'Ranking', icon: Trophy },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [points, setPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Fetch points from profile
        supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setPoints(data.points ?? 0)
          })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', session.user.id)
          .single()
        if (data) setPoints(data.points ?? 0)
      } else {
        setPoints(0)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: 'rgba(7,11,20,0.92)',
          borderBottom: '1px solid rgba(201,162,39,0.15)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Image
                src="/worldcup-icon.png"
                alt="Copa del Mundo FIFA 2026"
                width={32}
                height={32}
                className="object-contain drop-shadow-[0_0_6px_rgba(201,162,39,0.5)] group-hover:scale-110 transition-transform duration-200"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="font-display text-lg tracking-wider text-foreground/90 group-hover:text-foreground transition-colors">
                MUNDIAL
              </span>
              <span className="font-display text-lg tracking-wider text-gradient-gold">
                2026
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_ITEMS.map(({ href, label, icon: Icon, live }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-gold'
                      : 'text-foreground/40 hover:text-foreground/75 hover:bg-white/4'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{label}</span>
                  {live && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
                      style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {loading ? (
              <div className="w-8 h-8 rounded-full border border-white/10 animate-pulse hidden sm:block" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Points Badge */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 border border-gold/25 text-gold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{points} pts</span>
                </div>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-white/80 hover:text-white hover:bg-white/5 border border-white/5"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-gold p-0.5 flex items-center justify-center text-[9px] font-bold text-navy">
                    {getAvatarInitials(user.user_metadata?.display_name ?? user.user_metadata?.username ?? 'U')}
                  </div>
                  <span className="max-w-[100px] truncate hidden lg:inline">
                    {user.user_metadata?.display_name ?? user.user_metadata?.username}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center justify-center p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all text-gold hover:text-gold-300"
                style={{ border: '1px solid rgba(201,162,39,0.28)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Entrar
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-14 left-0 right-0 z-30 md:hidden"
            style={{
              background: 'rgba(7,11,20,0.98)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(201,162,39,0.15)',
            }}
          >
            <nav className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon, live }, i) => {
                const isActive = pathname === href
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all w-full',
                        isActive
                          ? 'text-gold'
                          : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                      )}
                      style={isActive ? {
                        background: 'rgba(201,162,39,0.08)',
                        border: '1px solid rgba(201,162,39,0.2)',
                      } : {
                        border: '1px solid transparent',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      {live && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Mobile login / profile */}
            <div className="px-4 pb-4">
              {loading ? (
                <div className="h-11 w-full bg-white/5 rounded-xl animate-pulse" />
              ) : user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all text-white border border-white/10 hover:bg-white/5"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil ({points} pts)
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all text-navy"
                  style={{ background: 'linear-gradient(135deg, #f0c040, #c9a227)' }}
                >
                  Entrar a tu cuenta
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
