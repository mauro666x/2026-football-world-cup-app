import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isBefore, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { MatchStatus, MatchStage } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchDate(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, "EEE d MMM · HH:mm", { locale: es })
}

export function formatMatchDateShort(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, "d MMM", { locale: es })
}

export function formatMatchTime(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, "HH:mm", { locale: es })
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: es })
}

export function isMatchLocked(matchDate: string): boolean {
  return isBefore(parseISO(matchDate), new Date())
}

export function getStatusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    SCHEDULED: 'Programado',
    LIVE: 'En vivo',
    HALFTIME: 'Medio tiempo',
    FINISHED: 'Finalizado',
    POSTPONED: 'Pospuesto',
    CANCELLED: 'Cancelado',
  }
  return labels[status] ?? status
}

export function getStageLabel(stage: MatchStage): string {
  const labels: Record<MatchStage, string> = {
    GROUP: 'Fase de grupos',
    ROUND_32: 'Ronda de 32',
    ROUND_16: 'Octavos de final',
    QUARTER: 'Cuartos de final',
    SEMI: 'Semifinal',
    THIRD: 'Tercer puesto',
    FINAL: 'Final',
  }
  return labels[stage] ?? stage
}

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`
}

export function getPositionLabel(position: string | null): string {
  const labels: Record<string, string> = {
    GK: 'Portero',
    DF: 'Defensa',
    MF: 'Mediocampista',
    FW: 'Delantero',
  }
  return position ? (labels[position] ?? position) : 'N/A'
}

export function getGroupTeams(teams: { group_letter: string | null }[], letter: string) {
  return teams.filter(t => t.group_letter === letter)
}

export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getAvatarInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}
