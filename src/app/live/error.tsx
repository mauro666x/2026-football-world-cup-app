'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold mb-2">No se pudo cargar los partidos en vivo</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        {error.message ?? 'Ocurrió un error inesperado.'}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
