import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import Flag from './Flag'
import Badge from '@/components/ui/Badge'
import type { Team } from '@/types'

interface TeamCardProps {
  team: Team
  index?: number
}

export default function TeamCard({ team, index = 0 }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/teams/${team.id}`}>
        <Card hover className="flex items-center gap-3">
          <Flag code={team.code} name={team.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{team.name}</p>
            <p className="text-xs text-white/50">{team.confederation}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {team.group_letter && (
              <Badge variant="blue">Grupo {team.group_letter}</Badge>
            )}
            {team.fifa_ranking && (
              <p className="text-xs text-white/40 mt-1">#{team.fifa_ranking} FIFA</p>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
