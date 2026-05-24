import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getFlagUrl } from '@/lib/utils'

interface FlagProps {
  code: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  rounded?: boolean
}

const sizes = {
  xs: { width: 20, height: 15, cls: 'w-5' },
  sm: { width: 28, height: 21, cls: 'w-7' },
  md: { width: 40, height: 30, cls: 'w-10' },
  lg: { width: 56, height: 42, cls: 'w-14' },
  xl: { width: 80, height: 60, cls: 'w-20' },
}

export default function Flag({ code, name, size = 'md', className, rounded = false }: FlagProps) {
  const { width, height, cls } = sizes[size]

  return (
    <Image
      src={getFlagUrl(code)}
      alt={name ? `Bandera de ${name}` : code}
      width={width}
      height={height}
      className={cn(
        cls,
        'object-cover',
        rounded ? 'rounded-full aspect-square object-center' : 'rounded-sm',
        'shadow-sm',
        className
      )}
      unoptimized // FlagCDN no necesita optimización de Next.js
    />
  )
}
