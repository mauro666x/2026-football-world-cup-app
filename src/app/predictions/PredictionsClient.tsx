'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Star, TrendingUp, CheckCircle } from 'lucide-react'
import PredictionCard from '@/components/prediction/PredictionCard'
import MatchCard from '@/components/match/MatchCard'
import type { Match, Prediction } from '@/types'

interface Props {
  userId: string
  predictions: Prediction[]
  upcomingMatches: Match[]
  totalPoints: number
  correctPredictions: number
}

type Tab = 'predecir' | 'mis-predicciones'

export default function PredictionsClient({
  userId,
  predictions,
  upcomingMatches,
  totalPoints,
  correctPredictions,
}: Props) {
  const [tab, setTab] = useState<Tab>('predecir')

  const predictedIds  = new Set(predictions.map(p => p.match_id))
  const unpredicted   = upcomingMatches.filter(m => !predictedIds.has(m.id))
  const predicted     = upcomingMatches.filter(m => predictedIds.has(m.id))

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="section-title font-display text-3xl tracking-wider text-foreground">
          MIS PREDICCIONES
        </h1>
        <p className="text-foreground/40 text-sm mt-2 ml-3.5">
          Pronostica antes del inicio de cada partido
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Star,
            val: totalPoints,
            label: 'Puntos',
            sub: 'totales',
            color: 'text-gold-300',
            bg: 'rgba(201,162,39,0.1)',
            border: 'rgba(201,162,39,0.2)',
          },
          {
            icon: CheckCircle,
            val: correctPredictions,
            label: 'Acertadas',
            sub: 'predicciones',
            color: 'text-green-400',
            bg: 'rgba(34,197,94,0.08)',
            border: 'rgba(34,197,94,0.2)',
          },
          {
            icon: TrendingUp,
            val: predictions.length,
            label: 'Total',
            sub: 'realizadas',
            color: 'text-blue-400',
            bg: 'rgba(59,130,246,0.08)',
            border: 'rgba(59,130,246,0.2)',
          },
        ].map(({ icon: Icon, val, label, sub, color, bg, border }) => (
          <div
            key={label}
            className="wc-card p-4 text-center"
            style={{ background: bg, borderColor: border }}
          >
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2 opacity-80`} />
            <div className={`font-display text-4xl leading-none ${color}`}>{val}</div>
            <div className="text-sm font-semibold text-foreground/60 mt-1">{label}</div>
            <div className="text-xs text-foreground/25">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['predecir', 'mis-predicciones'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              color: tab === t ? '#c9a227' : 'rgba(238,242,247,0.4)',
            }}
          >
            {tab === t && (
              <motion.span
                layoutId="pred-tab"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">
              {t === 'predecir'
                ? `Predecir (${unpredicted.length})`
                : `Mis pronós. (${predictions.length})`
              }
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'predecir' ? (
            <div className="space-y-6">
              {unpredicted.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-foreground/30 uppercase tracking-widest mb-3">
                    SIN PRONÓSTICO ({unpredicted.length})
                  </p>
                  <div className="space-y-2">
                    {unpredicted.map((m, i) => (
                      <MatchCard key={m.id} match={m} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {predicted.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-foreground/30 uppercase tracking-widest mb-3">
                    YA PRONOSTICADOS ({predicted.length})
                  </p>
                  <div className="space-y-2">
                    {predicted.map((m, i) => {
                      const pred = predictions.find(p => p.match_id === m.id)
                      return (
                        <MatchCard
                          key={m.id}
                          match={m}
                          index={i}
                          showPrediction
                          predictedHome={pred?.predicted_home_score}
                          predictedAway={pred?.predicted_away_score}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

              {unpredicted.length === 0 && predicted.length === 0 && (
                <div className="wc-card p-12 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="font-display text-xl tracking-wider text-foreground/30">
                    TODO PRONOSTICADO
                  </p>
                  <p className="text-sm text-foreground/20 mt-2">
                    ¡Has pronosticado todos los próximos partidos!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.length === 0 ? (
                <div className="wc-card p-12 text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <p className="font-display text-xl tracking-wider text-foreground/30">
                    SIN PREDICCIONES
                  </p>
                  <p className="text-sm text-foreground/20 mt-2">
                    Aún no has hecho ningún pronóstico
                  </p>
                </div>
              ) : (
                predictions.map(p => <PredictionCard key={p.id} prediction={p} />)
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
