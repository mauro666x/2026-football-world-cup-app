import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  live?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** @deprecated use default card style */
  glass?: boolean
}

export function Card({
  className,
  hover = false,
  live = false,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4 md:p-5', lg: 'p-6 md:p-8' }

  if (live) {
    return (
      <div
        className={cn('wc-card-live', paddings[padding], hover && 'cursor-pointer', className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'wc-card',
        hover && 'wc-card-hover cursor-pointer',
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
    <h3 className={cn('font-display text-lg tracking-wide text-foreground', className)} {...props}>
      {children}
    </h3>
  )
}
