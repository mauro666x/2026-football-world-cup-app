import { User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { getPositionLabel } from '@/lib/utils'
import type { Player } from '@/types'

const positionColors: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  GK: 'yellow',
  DF: 'blue',
  MF: 'green',
  FW: 'red',
}

interface PlayerCardProps {
  player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const color = positionColors[player.position ?? ''] ?? 'default'

  return (
    <Card padding="sm" className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        {player.number ? (
          <span className="text-xs font-bold text-white">{player.number}</span>
        ) : (
          <User className="w-4 h-4 text-white/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{player.name}</p>
        <p className="text-xs text-white/40">{player.club ?? 'N/A'}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {player.position && (
          <Badge variant={color as 'green' | 'blue' | 'yellow' | 'red'}>{getPositionLabel(player.position)}</Badge>
        )}
        {player.goals > 0 && (
          <span className="text-xs text-white/50">⚽ {player.goals}</span>
        )}
      </div>
    </Card>
  )
}
