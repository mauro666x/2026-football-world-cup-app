import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, glass = true, hover = false, padding = 'md', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4 md:p-5', lg: 'p-6 md:p-8' }

  return (
    <div
      className={cn(
        'rounded-2xl border',
        glass
          ? 'bg-white/5 dark:bg-white/5 backdrop-blur-sm border-white/10'
          : 'bg-neutral-900 border-white/5',
        hover && 'hover:border-white/20 transition-colors cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-semibold text-white text-base', className)} {...props}>
      {children}
    </h3>
  )
}
