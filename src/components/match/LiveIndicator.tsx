'use client'

import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  minute?: number | null
  className?: string
  size?: 'sm' | 'md'
}

export default function LiveIndicator({ minute, className, size = 'md' }: LiveIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      {/* Pulsing dot */}
      <div className="relative flex items-center justify-center">
        <span
          className={cn('absolute rounded-full bg-red-500 live-ring', dotSize)}
        />
        <span className={cn('relative rounded-full bg-red-500', dotSize)} />
      </div>

      <span
        className={cn(
          'font-display tracking-widest text-red-400',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {minute ? `${minute}'` : 'EN VIVO'}
      </span>
    </div>
  )
}
