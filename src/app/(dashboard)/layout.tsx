'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CurrencyProvider } from '@/lib/currency/CurrencyContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] dark:bg-[#080d14]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(at 40% 20%, hsla(228,100%,74%,0.12) 0px, transparent 50%),
              radial-gradient(at 80% 0%, hsla(262,100%,70%,0.09) 0px, transparent 50%),
              radial-gradient(at 0% 50%, hsla(228,100%,74%,0.08) 0px, transparent 50%)
            `
          }}
        />
        <div className="relative flex flex-col items-center gap-5">
          {/* Animated logo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center animate-float">
              <span className="text-white font-black text-2xl" style={{ fontFamily: 'var(--font-display)' }}>A</span>
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-300/30 dark:border-indigo-400/20 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"
                style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#080d14]">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0 animate-fade-in">
          {children}
        </main>
        <MobileNav />
      </div>
    </CurrencyProvider>
  )
}
