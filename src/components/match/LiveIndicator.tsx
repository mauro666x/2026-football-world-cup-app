'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  minute?: number | null
  className?: string
  size?: 'sm' | 'md'
}

export default function LiveIndicator({ minute, className, size = 'md' }: LiveIndicatorProps) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="relative flex">
        <motion.span
          className={cn(
            'absolute inline-flex rounded-full bg-red-400 opacity-75',
            size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
          )}
          animate={{ scale: [1, 1.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className={cn(
          'relative inline-flex rounded-full bg-red-500',
          size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
        )} />
      </div>
      <span className={cn(
        'font-bold text-red-400 uppercase tracking-wide',
        size === 'sm' ? 'text-xs' : 'text-xs'
      )}>
        {minute ? `${minute}'` : 'EN VIVO'}
      </span>
    </div>
  )
}
