'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import {
  FiHome, FiCheckSquare, FiBell, FiMenu, FiFolder
} from 'react-icons/fi'
import { useState, useEffect, useCallback, useRef } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)
  const prevCountRef = useRef(0)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true&limit=1')
      const data = await res.json()
      if (data.success) {
        const count = data.unreadCount || 0
        prevCountRef.current = count
        setUnreadCount(count)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!profile) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [profile, fetchUnread])

  const items = [
    { href: '/', icon: FiHome, label: t('nav', 'dashboard') },
    { href: '/tasks', icon: FiCheckSquare, label: t('nav', 'tasks') },
    { href: '/projects', icon: FiFolder, label: t('nav', 'projects') },
    { href: '/notifications', icon: FiBell, label: t('nav', 'notifications'), badge: unreadCount },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon size={22} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
