'use client'

import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </CurrencyProvider>
  )
}
