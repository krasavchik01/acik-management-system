'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import {
  FiHome, FiCheckSquare, FiBell, FiFolder, FiGrid,
  FiUsers, FiCalendar, FiDollarSign, FiHeart, FiClock,
  FiBarChart2, FiShield, FiSettings, FiX
} from 'react-icons/fi'
import { useState, useEffect, useCallback, useRef } from 'react'

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const prevCountRef = useRef(0)

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'President' || profile?.role === 'CEO'
  const permissions = profile?.permissions || []
  const can = (module: string) => isAdmin || permissions.includes(module)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true&limit=1')
      const data = await res.json()
      if (data.success) {
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!profile) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [profile, fetchUnread])

  const mainTabs = [
    { href: '/', icon: FiHome, label: t('nav', 'dashboard') },
    { href: '/tasks', icon: FiCheckSquare, label: t('nav', 'tasks') },
    { href: '/notifications', icon: FiBell, label: t('nav', 'notifications'), badge: unreadCount },
    { href: '/projects', icon: FiFolder, label: t('nav', 'projects') },
  ]

  const moreItems = [
    { href: '/members', icon: FiUsers, label: t('nav', 'members'), module: 'members' },
    { href: '/events', icon: FiCalendar, label: t('nav', 'events'), module: 'events' },
    { href: '/finance', icon: FiDollarSign, label: t('nav', 'finance'), module: 'finance' },
    { href: '/sponsors', icon: FiHeart, label: t('nav', 'sponsors'), module: 'sponsors' },
    { href: '/attendance', icon: FiClock, label: t('nav', 'attendance'), module: 'attendance' },
    { href: '/reports', icon: FiBarChart2, label: t('nav', 'reports'), module: 'reports' },
    ...(isAdmin ? [
      { href: '/admin', icon: FiShield, label: t('nav', 'admin'), module: null },
      { href: '/settings', icon: FiSettings, label: t('nav', 'settings'), module: null },
    ] : []),
  ].filter(item => !item.module || can(item.module))

  return (
    <>
      {/* "More" overlay panel */}
      {showMore && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMore(false)} />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl safe-bottom animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('nav', 'menu') || 'Menu'}</span>
              <button onClick={() => setShowMore(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 px-3 pb-4">
              {moreItems.map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-slate-400 active:bg-gray-100 dark:active:bg-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                      <item.icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            {mainTabs.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                  <div className="relative">
                    <item.icon
                      size={22}
                      className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className={`text-[10px] font-medium leading-tight transition-colors ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* More button */}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              <FiGrid
                size={22}
                className={`transition-colors ${showMore ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`}
              />
              <span className={`text-[10px] font-medium leading-tight transition-colors ${
                showMore ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {t('nav', 'more') || 'More'}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
