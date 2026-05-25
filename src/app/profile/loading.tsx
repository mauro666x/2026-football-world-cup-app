export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-white/5 rounded-lg" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-56 bg-white/5 rounded-2xl" />
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="h-72 bg-white/5 rounded-2xl" />
    </div>
  )
}
