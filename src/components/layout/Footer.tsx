export default function Footer() {
  return (
    <footer className="mt-20 pb-4 hidden md:block">
      <div className="gold-divider mb-6" />
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚽</span>
          <span className="font-display text-sm tracking-wider text-foreground/30">MUNDIAL 2026</span>
        </div>
        <p className="text-foreground/20 text-xs text-center">
          USA · México · Canadá · 11 jun – 19 jul 2026
        </p>
        <p className="text-foreground/15 text-xs text-right">
          football-data.org · flagcdn.com
        </p>
      </div>
    </footer>
  )
}
