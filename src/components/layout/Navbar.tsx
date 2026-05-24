'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, Calendar, TrendingUp, Trophy, Zap, Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)' }}>
              ⚽
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

            {/* Mobile login */}
            <div className="px-4 pb-4">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all text-navy"
                style={{ background: 'linear-gradient(135deg, #f0c040, #c9a227)' }}
              >
                Entrar a tu cuenta
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
