'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, ChevronUp, Check, Lock } from 'lucide-react'
import Flag from '@/components/team/Flag'
import { usePrediction, useUpsertPrediction } from '@/hooks/usePredictions'
import { formatMatchDateShort, formatMatchTime, isMatchLocked } from '@/lib/utils'
import type { Match } from '@/types'

interface Props {
  match: Match
  userId: string
  index?: number
}

/**
 * Tarjeta de partido con formulario de predicción inline.
 * Se usa en /predictions para que el usuario pueda predecir sin
 * navegar al detalle del partido.
 */
export default function InlineMatchCard({ match, userId, index = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const [homeVal, setHomeVal] = useState<number | ''>('')
  const [awayVal, setAwayVal] = useState<number | ''>('')
  const [saved, setSaved] = useState(false)

  const locked = isMatchLocked(match.match_date) || match.status !== 'SCHEDULED'
  const { data: existing } = usePrediction(userId, match.id)
  const upsert = useUpsertPrediction()

  const hasPrediction = existing !== null && existing !== undefined

  // Sincronizar valores del input con predicción existente al abrir
  const handleToggle = () => {
    if (!open && hasPrediction && existing) {
      setHomeVal(existing.predicted_home_score)
      setAwayVal(existing.predicted_away_score)
    }
    setOpen(v => !v)
  }

  const handleSave = async () => {
    if (homeVal === '' || awayVal === '') return
    await upsert.mutateAsync({
      userId,
      matchId: match.id,
      homeScore: Number(homeVal),
      awayScore: Number(awayVal),
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setOpen(false)
    }, 1500)
  }

  const home = match.home_team
  const away = match.away_team

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <div
        className="wc-card overflow-hidden transition-all"
        style={{ borderColor: hasPrediction ? 'rgba(201,162,39,0.25)' : undefined }}
      >
        {/* ── Header row: click to expand ── */}
        <button
          onClick={handleToggle}
          className="w-full px-4 py-3 text-left"
          aria-expanded={open}
        >
          {/* Meta */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-widest text-foreground/35">
              Grupo {match.group_letter}
            </span>
            <div className="flex items-center gap-2">
              {hasPrediction && (
                <span className="text-xs font-display tracking-wider text-gold">
                  {existing!.predicted_home_score} – {existing!.predicted_away_score}
                </span>
              )}
              <span className="text-xs text-foreground/40 tabular-nums">
                {formatMatchDateShort(match.match_date)} · {formatMatchTime(match.match_date)}
              </span>
              {open
                ? <ChevronUp className="w-4 h-4 text-foreground/30" />
                : <ChevronDown className="w-4 h-4 text-foreground/30" />
              }
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              {home && <Flag code={home.code} size="sm" className="flex-shrink-0 rounded shadow-sm" />}
              <span className="font-semibold text-sm truncate text-foreground/85">
                {home?.name ?? '?'}
              </span>
            </div>

            <div className="flex-shrink-0 px-3 py-1.5 rounded-lg text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-display text-lg tracking-widest text-foreground/50 tabular-nums leading-none">
                vs
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
              <span className="font-semibold text-sm truncate text-right text-foreground/85">
                {away?.name ?? '?'}
              </span>
              {away && <Flag code={away.code} size="sm" className="flex-shrink-0 rounded shadow-sm" />}
            </div>
          </div>

          {/* Venue */}
          {match.city && (
            <div className="mt-1.5 flex items-center gap-1 text-foreground/22">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{match.city}</span>
            </div>
          )}
        </button>

        {/* ── Expandable prediction form ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-4 py-4 space-y-4">

                {locked ? (
                  <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Predicción bloqueada — el partido ya comenzó</span>
                  </div>
                ) : (
                  <>
                    {/* Score inputs */}
                    <div className="flex items-center gap-4">
                      {/* Home */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        {home && <Flag code={home.code} size="md" />}
                        <p className="text-xs font-medium text-foreground/60 text-center leading-tight">
                          {home?.name}
                        </p>
                        <ScoreSpinner value={homeVal} onChange={setHomeVal} />
                      </div>

                      <span className="text-foreground/30 font-bold text-xl flex-shrink-0">–</span>

                      {/* Away */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        {away && <Flag code={away.code} size="md" />}
                        <p className="text-xs font-medium text-foreground/60 text-center leading-tight">
                          {away?.name}
                        </p>
                        <ScoreSpinner value={awayVal} onChange={setAwayVal} />
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSave}
                      disabled={homeVal === '' || awayVal === '' || upsert.isPending}
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: saved
                          ? 'rgba(34,197,94,0.15)'
                          : homeVal === '' || awayVal === ''
                            ? 'rgba(201,162,39,0.08)'
                            : 'linear-gradient(135deg, #c9a227, #a07d1a)',
                        border: saved
                          ? '1px solid rgba(34,197,94,0.3)'
                          : '1px solid rgba(201,162,39,0.3)',
                        color: saved ? '#4ade80' : homeVal === '' || awayVal === '' ? '#c9a227' : '#070b14',
                      }}
                    >
                      {saved ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Guardado
                        </span>
                      ) : upsert.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Guardando…
                        </span>
                      ) : hasPrediction ? (
                        'Actualizar predicción'
                      ) : (
                        'Guardar predicción'
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Score spinner sub-component ──────────────────────────────────────────────

function ScoreSpinner({
  value,
  onChange,
}: {
  value: number | ''
  onChange: (v: number | '') => void
}) {
  const dec = () => onChange(Math.max(0, Number(value === '' ? 0 : value) - 1))
  const inc = () => onChange(Math.min(20, Number(value === '' ? -1 : value) + 1))

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={dec}
        disabled={value === '' || value <= 0}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors text-lg leading-none flex items-center justify-center"
      >
        –
      </button>
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={e => {
          const v = e.target.value
          onChange(v === '' ? '' : Math.min(20, Math.max(0, parseInt(v) || 0)))
        }}
        placeholder="–"
        className="w-14 h-10 text-center text-2xl font-black text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 tabular-nums"
      />
      <button
        onClick={inc}
        disabled={value !== '' && value >= 20}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors text-lg leading-none flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}
