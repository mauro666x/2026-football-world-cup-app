import Link from 'next/link'
import { Calendar, Users, TrendingUp, Zap, Trophy, Bell } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const FEATURES = [
  {
    icon: TrendingUp,
    label: 'Predicciones',
    desc: 'Predice el marcador de cada partido',
    href: '/predictions',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Zap,
    label: 'En Vivo',
    desc: 'Scores en tiempo real',
    href: '/live',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
  {
    icon: Users,
    label: 'Grupos',
    desc: 'Tabla de posiciones de los 12 grupos',
    href: '/groups',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Calendar,
    label: 'Partidos',
    desc: 'Calendario completo del torneo',
    href: '/matches',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Trophy,
    label: 'Ranking',
    desc: 'Compite por el primer lugar',
    href: '/leaderboard',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Bell,
    label: 'Alertas',
    desc: 'Notificaciones de tus partidos',
    href: '/predictions',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-8 md:py-16 space-y-4">
        <div className="text-6xl md:text-8xl mb-4">🏆</div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Mundial FIFA{' '}
          <span className="text-gradient">2026</span>
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-md mx-auto">
          48 selecciones · 104 partidos · 3 países anfitriones
        </p>
        <p className="text-white/30 text-sm">11 jun – 19 jul 2026 · USA · México · Canadá</p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            href="/register"
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20"
          >
            Empezar a predecir
          </Link>
          <Link
            href="/matches"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Ver partidos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold text-white/60 mb-4 text-center">¿Qué puedes hacer?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, href, color, bg }) => (
            <Link key={href + label} href={href}>
              <Card hover className="h-full space-y-2">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Scoring system */}
      <section>
        <Card>
          <h2 className="font-semibold text-white mb-4">⚡ Sistema de puntuación</h2>
          <div className="space-y-2">
            {[
              { label: 'Resultado exacto (ej: 2-1 y fue 2-1)', pts: '5 pts', color: 'text-green-400' },
              { label: 'Resultado correcto (victoria/empate)', pts: '3 pts', color: 'text-blue-400' },
              { label: 'Un marcador correcto', pts: '1 pt', color: 'text-yellow-400' },
              { label: 'Fallo total', pts: '0 pts', color: 'text-white/30' },
            ].map(({ label, pts, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-white/60">{label}</span>
                <span className={`font-bold text-sm ${color}`}>{pts}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
