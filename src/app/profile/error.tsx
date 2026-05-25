'use client'

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto wc-card p-12 text-center space-y-4 mt-8">
      <div className="text-4xl">⚠️</div>
      <p className="font-display text-xl tracking-wider text-foreground/50">ERROR AL CARGAR PERFIL</p>
      <p className="text-sm text-foreground/30">No se pudo cargar tu perfil. Intenta de nuevo.</p>
      <button
        onClick={reset}
        className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227' }}
      >
        Reintentar
      </button>
    </div>
  )
}
