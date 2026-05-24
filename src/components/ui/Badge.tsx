import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-white/8 text-foreground/60 border-white/10',
    gold:    'bg-gold/12 text-gold border-gold/25',
    green:   'bg-green-500/15 text-green-400 border-green-500/25',
    red:     'bg-red-500/15 text-red-400 border-red-500/25',
    yellow:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    blue:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
    purple:  'bg-purple-500/15 text-purple-400 border-purple-500/25',
  }
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
