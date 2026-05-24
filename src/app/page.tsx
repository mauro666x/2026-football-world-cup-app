import Link from 'next/link'
import { Calendar, Users, TrendingUp, Zap, Trophy, Bell, ArrowRight, Target, Star } from 'lucide-react'

export const metadata = {
  title: 'Mundial 2026 — Predicciones',
  description: 'Predice los resultados del Mundial FIFA 2026 y compite con tus amigos',
}



const FEATURES = [
  {
    icon: TrendingUp,
    emoji: '🎯',
    label: 'Predicciones',
    desc: 'Pronostica el marcador exacto de cada partido',
    href: '/predictions',
  },
  {
    icon: Zap,
    emoji: '⚡',
    label: 'En Vivo',
    desc: 'Marcadores en tiempo real con actualización automática',
    href: '/live',
    live: true,
  },
  {
    icon: Users,
    emoji: '🗂️',
    label: 'Grupos',
    desc: 'Tabla de posiciones de los 12 grupos del Mundial',
    href: '/groups',
  },
  {
    icon: Calendar,
    emoji: '📅',
    label: 'Partidos',
    desc: 'Calendario completo de los 104 partidos',
    href: '/matches',
  },
  {
    icon: Trophy,
    emoji: '🏆',
    label: 'Ranking',
    desc: 'Clasificación global de jugadores por puntos',
    href: '/leaderboard',
  },
  {
    icon: Bell,
    emoji: '🔔',
    label: 'Alertas',
    desc: 'Notificaciones antes de que empiecen tus partidos',
    href: '/predictions',
  },
]

const SCORING = [
  { label: 'Resultado exacto', eg: '2-1 y fue 2-1', pts: 5, color: 'text-gold-300', bar: 'bg-gold' },
  { label: 'Resultado correcto', eg: 'Victoria o empate acertado', pts: 3, color: 'text-blue-400', bar: 'bg-blue-500' },
  { label: 'Un marcador correcto', eg: 'Solo local o visitante', pts: 1, color: 'text-foreground/50', bar: 'bg-foreground/20' },
  { label: 'Fallo total', eg: 'Ningún marcador correcto', pts: 0, color: 'text-foreground/25', bar: 'bg-transparent' },
]

const HOSTS = [
  { flag: '🇺🇸', name: 'USA', stadiums: 11 },
  { flag: '🇲🇽', name: 'MÉXICO', stadiums: 3 },
  { flag: '🇨🇦', name: 'CANADÁ', stadiums: 2 },
]

export default function HomePage() {
  return (
    <div className="space-y-12">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl hero-mesh stadium-pattern min-h-[460px] md:min-h-[520px] flex flex-col items-center justify-center text-center px-6 py-16">

        {/* Decorative glow blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

        {/* Corner badge */}
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)', color: '#c9a227' }}>
          FIFA 2026
        </div>

        {/* Floating ball */}
        <div className="animate-trophy text-5xl md:text-6xl mb-6 select-none" aria-hidden>⚽</div>

        {/* Title */}
        <div className="animate-fade-up">
          <div className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-foreground/90 leading-none">
            MUNDIAL FIFA
          </div>
          <div className="font-display text-6xl sm:text-8xl md:text-[9rem] lg:text-[10rem] text-gradient-gold leading-none -mt-1">
            2026
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 md:gap-6 mt-8 animate-fade-up delay-2">
          {[
            { val: '48', label: 'EQUIPOS' },
            { val: '104', label: 'PARTIDOS' },
            { val: '16', label: 'ESTADIOS' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl md:text-3xl text-foreground/80">{val}</div>
              <div className="text-[10px] tracking-widest text-foreground/35 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Date */}
        <p className="mt-3 text-xs tracking-widest text-foreground/30 uppercase animate-fade-up delay-3">
          11 Jun – 19 Jul 2026
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 animate-fade-up delay-4">
          <Link
            href="/register"
            className="flex items-center gap-2 font-display text-base tracking-widest px-7 py-3.5 rounded-xl text-navy transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f0c040 0%, #c9a227 100%)' }}
          >
            PREDECIR AHORA
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/matches"
            className="flex items-center gap-2 font-display text-base tracking-widest px-7 py-3.5 rounded-xl text-gold transition-all hover:bg-gold/8 active:scale-95"
            style={{ border: '1px solid rgba(201,162,39,0.3)' }}
          >
            VER PARTIDOS
          </Link>
        </div>

        {/* Host countries */}
        <div className="flex items-center justify-center gap-6 mt-10 animate-fade-up delay-5">
          {HOSTS.map(({ flag, name, stadiums }) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="text-base">{flag}</span>
              <div className="text-left">
                <div className="text-xs font-display tracking-wider text-foreground/50">{name}</div>
                <div className="text-[10px] text-foreground/25">{stadiums} estadios</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════ */}
      <section>
        <h2 className="section-title font-display text-xl tracking-wider text-foreground/70 mb-5">
          QUÉ PUEDES HACER
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map(({ emoji, label, desc, href, live }, i) => (
            <Link key={href + label} href={href}>
              <div
                className={`wc-card wc-card-hover cursor-pointer p-4 md:p-5 h-full animate-fade-up delay-${i + 1} relative overflow-hidden`}
              >
                <div className="text-2xl mb-3">{emoji}</div>
                <div className="font-display text-xl tracking-wide text-foreground leading-tight">
                  {label.toUpperCase()}
                </div>
                <p className="text-xs text-foreground/40 mt-1 leading-relaxed">{desc}</p>

                {live && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"
                      style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
                    <span className="text-[9px] font-medium tracking-wider text-red-400 uppercase">Live</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SCORING SYSTEM
      ══════════════════════════════════════════════ */}
      <section>
        <div className="wc-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}>
              ⚡
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wide text-foreground">SISTEMA DE PUNTUACIÓN</h2>
              <p className="text-xs text-foreground/35 mt-0.5">Más precisión = más puntos</p>
            </div>
          </div>

          <div className="space-y-3">
            {SCORING.map(({ label, eg, pts, color, bar }) => (
              <div key={label} className="flex items-center gap-4">
                {/* Points badge */}
                <div className="w-14 flex-shrink-0 text-center">
                  <span className={`font-display text-2xl leading-none ${color}`}>
                    {pts > 0 ? pts : '–'}
                  </span>
                  {pts > 0 && <span className="block text-[10px] text-foreground/30 -mt-0.5">pts</span>}
                </div>

                {/* Bar + text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-1.5 rounded-full flex-shrink-0 ${bar}`}
                      style={{ width: `${(pts / 5) * 48 + 8}px` }} />
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                  </div>
                  <p className="text-xs text-foreground/30 truncate">{eg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOURNAMENT STATS
      ══════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Star, val: '48', label: 'Selecciones', sub: 'de 6 confederaciones' },
            { icon: Target, val: '12', label: 'Grupos', sub: '4 equipos por grupo' },
            { icon: Zap, val: '104', label: 'Partidos', sub: 'fase de grupos y KO' },
            { icon: Trophy, val: '1', label: 'Campeón', sub: '19 julio 2026' },
          ].map(({ icon: Icon, val, label, sub }) => (
            <div key={label} className="wc-card p-4 text-center">
              <Icon className="w-5 h-5 text-gold/60 mx-auto mb-2" />
              <div className="font-display text-3xl text-foreground">{val}</div>
              <div className="text-sm font-semibold text-foreground/70 mt-0.5">{label}</div>
              <div className="text-xs text-foreground/30 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
