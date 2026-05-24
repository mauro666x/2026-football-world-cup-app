'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Calendar, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/live', label: 'En Vivo', icon: Zap, live: true },
  { href: '/matches', label: 'Partidos', icon: Calendar },
  { href: '/predictions', label: 'Pronós.', icon: TrendingUp },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-pb"
      style={{
        background: 'rgba(7,11,20,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,162,39,0.15)',
      }}
    >
      <div className="grid grid-cols-5 h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon, live }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-all',
                isActive ? 'text-gold' : 'text-foreground/30 hover:text-foreground/60'
              )}
            >
              {/* Top pill indicator */}
              {isActive && <span className="nav-pill-top" />}

              <div className="relative">
                <Icon className={cn('transition-transform', isActive ? 'w-5 h-5 scale-110' : 'w-5 h-5')} />
                {live && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500"
                    style={{ boxShadow: '0 0 5px rgba(239,68,68,0.8)' }} />
                )}
              </div>

              <span className={cn(
                'text-[10px] font-medium tracking-tight leading-none',
                isActive ? 'text-gold' : ''
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
