'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import Flag from '@/components/team/Flag'
import Button from '@/components/ui/Button'
import type { Team } from '@/types'

interface ScoreInputProps {
  homeTeam: Team
  awayTeam: Team
  initialHome?: number
  initialAway?: number
  locked?: boolean
  onSave: (home: number, away: number) => Promise<void>
}

export default function ScoreInput({
  homeTeam,
  awayTeam,
  initialHome,
  initialAway,
  locked = false,
  onSave,
}: ScoreInputProps) {
  const [home, setHome] = useState(initialHome ?? '')
  const [away, setAway] = useState(initialAway ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (home === '' || away === '') return
    setSaving(true)
    try {
      await onSave(Number(home), Number(away))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const hasChanged = Number(home) !== initialHome || Number(away) !== initialAway

  return (
    <div className="space-y-4">
      {locked && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Predicción bloqueada — el partido ya comenzó</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <Flag code={homeTeam.code} size="lg" />
          <p className="text-sm font-medium text-white text-center">{homeTeam.name}</p>
          <ScoreButton
            value={home}
            onChange={setHome}
            disabled={locked}
          />
        </div>

        <span className="text-white/30 font-bold text-xl">–</span>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <Flag code={awayTeam.code} size="lg" />
          <p className="text-sm font-medium text-white text-center">{awayTeam.name}</p>
          <ScoreButton
            value={away}
            onChange={setAway}
            disabled={locked}
          />
        </div>
      </div>

      {!locked && (
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={home === '' || away === '' || !hasChanged}
          className="w-full"
        >
          {saved ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Guardado
            </motion.span>
          ) : (
            'Guardar predicción'
          )}
        </Button>
      )}
    </div>
  )
}

function ScoreButton({
  value,
  onChange,
  disabled,
}: {
  value: number | string
  onChange: (v: number | string) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, Number(value) - 1))}
        disabled={disabled || value === '' || Number(value) <= 0}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors"
      >
        –
      </button>
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
        disabled={disabled}
        className="w-14 h-10 text-center text-2xl font-black text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 tabular-nums"
      />
      <button
        onClick={() => onChange(Math.min(20, Number(value === '' ? -1 : value) + 1))}
        disabled={disabled}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors"
      >
        +
      </button>
    </div>
  )
}
