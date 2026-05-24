import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import Providers from './providers'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Mundial 2026 — Predicciones',
    template: '%s | Mundial 2026',
  },
  description: 'App de predicciones y seguimiento en tiempo real del Mundial FIFA 2026',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mundial 2026',
  },
  openGraph: {
    title: 'Mundial 2026 — Predicciones',
    description: 'Predice los resultados del Mundial FIFA 2026 en tiempo real',
    type: 'website',
    images: [{ url: '/fifa-icon.jpg', width: 1200, height: 630 }],
  },
}

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body
        className={`${bebasNeue.variable} ${outfit.variable} font-sans bg-navy text-foreground min-h-screen antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 pb-24 md:pb-10 pt-6">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
