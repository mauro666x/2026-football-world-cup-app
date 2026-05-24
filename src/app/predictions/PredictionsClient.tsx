'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
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

type Tab = 'mis-predicciones' | 'predecir'

export default function PredictionsClient({
  userId,
  predictions,
  upcomingMatches,
  totalPoints,
  correctPredictions,
}: Props) {
  const [tab, setTab] = useState<Tab>('predecir')

  const predictedIds = new Set(predictions.map(p => p.match_id))
  const unpredicted = upcomingMatches.filter(m => !predictedIds.has(m.id))
  const predicted = upcomingMatches.filter(m => predictedIds.has(m.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Mis predicciones</h1>
        <p className="text-white/40 text-sm mt-1">Predice antes del inicio de cada partido</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Star, label: 'Puntos', val: totalPoints, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { icon: Target, label: 'Acertadas', val: correctPredictions, color: 'text-green-400', bg: 'bg-green-400/10' },
          { icon: TrendingUp, label: 'Total', val: predictions.length, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map(({ icon: Icon, label, val, color, bg }) => (
          <Card key={label} padding="sm" className="text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-white/40">{label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {(['predecir', 'mis-predicciones'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'predecir' ? `Predecir (${unpredicted.length})` : `Mis pronós. (${predictions.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'predecir' ? (
        <div className="space-y-4">
          {unpredicted.length > 0 && (
            <section>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Sin predicción</p>
              <div className="space-y-2">
                {unpredicted.map((m, i) => (
                  <MatchCard key={m.id} match={m} index={i} />
                ))}
              </div>
            </section>
          )}
          {predicted.length > 0 && (
            <section>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Ya pronosticados</p>
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
            <div className="text-center py-12 text-white/30">
              <p className="text-4xl mb-3">✅</p>
              <p>¡Todos los próximos partidos pronosticados!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {predictions.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <p className="text-4xl mb-3">🎯</p>
              <p>Aún no has hecho predicciones</p>
            </div>
          ) : (
            predictions.map(p => <PredictionCard key={p.id} prediction={p} />)
          )}
        </div>
      )}
    </div>
  )
}
