'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'
import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiHeart,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiShield,
  FiLogOut,
  FiGlobe,
  FiMoon,
  FiSun,
  FiBell,
} from 'react-icons/fi'
import { useState, useEffect, useRef, useCallback } from 'react'

const menuItems = [
  { key: 'dashboard',      href: '/',             icon: FiHome,       module: null },
  { key: 'projects',       href: '/projects',     icon: FiFolder,     module: 'projects' },
  { key: 'tasks',          href: '/tasks',        icon: FiCheckSquare,module: 'tasks' },
  { key: 'members',        href: '/members',      icon: FiUsers,      module: 'members' },
  { key: 'events',         href: '/events',       icon: FiCalendar,   module: 'events' },
  { key: 'finance',        href: '/finance',      icon: FiDollarSign, module: 'finance' },
  { key: 'sponsors',       href: '/sponsors',     icon: FiHeart,      module: 'sponsors' },
  { key: 'attendance',     href: '/attendance',   icon: FiClock,      module: 'attendance' },
  { key: 'notifications',  href: '/notifications',icon: FiBell,       module: null },
  { key: 'reports',        href: '/reports',      icon: FiBarChart2,  module: 'reports' },
]

const adminItems = [
  { key: 'admin',    href: '/admin',    icon: FiShield },
  { key: 'settings', href: '/settings', icon: FiSettings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const prevCountRef = useRef(0)

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'President' || profile?.role === 'CEO'

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true&limit=1')
      const data = await res.json()
      if (data.success) {
        const newCount = data.unreadCount || 0
        if (newCount > prevCountRef.current && prevCountRef.current >= 0) {
          playNotificationSound()
        }
        prevCountRef.current = newCount
        setUnreadCount(newCount)
      }
    } catch {}
  }, [playNotificationSound])

  useEffect(() => {
    if (!profile) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [profile, fetchUnreadCount])

  useEffect(() => {
    if (pathname === '/notifications') {
      prevCountRef.current = unreadCount
    }
  }, [pathname, unreadCount])

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.module) return true
    if (isAdmin) return true
    return (profile?.permissions || []).includes(item.module)
  })

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40
          flex flex-col
          bg-white/90 dark:bg-[#0a1020]/95
          border-r border-slate-200/60 dark:border-white/[0.06]
          backdrop-blur-xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          boxShadow: '4px 0 32px rgba(0,0,0,0.06)',
        }}
      >
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-80" />

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-white/[0.05]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                <span className="text-white font-black text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>A</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0a1020] shadow-sm" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>ACIK</h1>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {t('auth', 'managementSystem')}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-0.5">
          {visibleMenuItems.map((item, i) => {
            const isActive = pathname === item.href
            const isNotif = item.key === 'notifications'
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }
                `}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-indigo-500" />
                )}

                {/* Icon */}
                <span className={`relative flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <item.icon size={18} />
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>

                <span className="flex-1 truncate">{t('nav', item.key)}</span>

                {isNotif && unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Admin section */}
          {isAdmin && (
            <div className="pt-3">
              <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                {t('nav', 'admin')}
              </p>
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 relative
                      ${isActive
                        ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-violet-500" />
                    )}
                    <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <item.icon size={18} />
                    </span>
                    <span className="flex-1 truncate">{t('nav', item.key)}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-slate-100 dark:border-white/[0.05] px-3 py-3 space-y-0.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all duration-200"
          >
            <span className="flex-shrink-0 transition-transform duration-300" style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </span>
            <span>{theme === 'dark' ? t('common', 'lightMode') : t('common', 'darkMode')}</span>
          </button>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            >
              <FiGlobe size={18} className="flex-shrink-0" />
              <span>{language === 'ru' ? t('common', 'russian') : t('common', 'english')}</span>
            </button>

            {showLangMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#111927] rounded-xl shadow-xl border border-slate-100 dark:border-white/[0.06] overflow-hidden z-50 animate-slide-down">
                {[
                  { code: 'ru', flag: '🇷🇺', label: t('common', 'russian') },
                  { code: 'en', flag: '🇺🇸', label: t('common', 'english') },
                ].map(({ code, flag, label }) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code as 'ru' | 'en'); setShowLangMenu(false) }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors ${
                      language === code
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-base">{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User profile */}
        <div className="px-3 pb-4 border-t border-slate-100 dark:border-white/[0.05] pt-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                {profile?.name || t('common', 'user')}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {t('roles', profile?.role || 'Member')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-all duration-200"
          >
            <FiLogOut size={16} className="flex-shrink-0" />
            <span>{t('nav', 'logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
