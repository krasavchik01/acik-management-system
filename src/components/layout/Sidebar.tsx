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
  FiMenu,
  FiX,
  FiGlobe,
  FiMoon,
  FiSun,
  FiBell,
} from 'react-icons/fi'
import { useState, useEffect, useRef, useCallback } from 'react'

const menuItems = [
  { key: 'dashboard', href: '/', icon: FiHome, module: null },
  { key: 'projects', href: '/projects', icon: FiFolder, module: 'projects' },
  { key: 'tasks', href: '/tasks', icon: FiCheckSquare, module: 'tasks' },
  { key: 'members', href: '/members', icon: FiUsers, module: 'members' },
  { key: 'events', href: '/events', icon: FiCalendar, module: 'events' },
  { key: 'finance', href: '/finance', icon: FiDollarSign, module: 'finance' },
  { key: 'sponsors', href: '/sponsors', icon: FiHeart, module: 'sponsors' },
  { key: 'attendance', href: '/attendance', icon: FiClock, module: 'attendance' },
  { key: 'notifications', href: '/notifications', icon: FiBell, module: null },
  { key: 'reports', href: '/reports', icon: FiBarChart2, module: 'reports' },
]

const adminItems = [
  { key: 'admin', href: '/admin', icon: FiShield },
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
        // Play sound if count increased
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

  // Reset badge on visiting notifications page
  useEffect(() => {
    if (pathname === '/notifications') {
      prevCountRef.current = unreadCount
    }
  }, [pathname, unreadCount])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40
          bg-white dark:bg-slate-900
          border-r border-gray-200 dark:border-slate-700
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">ACIK</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('auth', 'managementSystem')}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.filter((item) => {
              if (!item.module) return true
              if (isAdmin) return true
              return (profile?.permissions || []).includes(item.module)
            }).map((item) => {
              const isActive = pathname === item.href
              const isNotification = item.key === 'notifications'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="relative">
                    <item.icon size={20} />
                    {isNotification && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{t('nav', item.key)}</span>
                  {isNotification && unreadCount > 0 && (
                    <span className="ml-auto bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('nav', 'admin')}
                  </p>
                </div>
                {adminItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <item.icon size={20} />
                      <span>{t('nav', item.key)}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              <span>{theme === 'dark' ? t('common', 'lightMode') : t('common', 'darkMode')}</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <FiGlobe size={18} />
                <span>{language === 'ru' ? t('common', 'russian') : t('common', 'english')}</span>
              </button>

              {showLangMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setLanguage('ru')
                      setShowLangMenu(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 ${
                      language === 'ru' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl">🇷🇺</span>
                    <span className="font-medium">{t('common', 'russian')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en')
                      setShowLangMenu(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 ${
                      language === 'en' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl">🇺🇸</span>
                    <span className="font-medium">{t('common', 'english')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {profile?.name || t('common', 'user')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {t('roles', profile?.role || 'Member')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <FiLogOut size={18} />
              <span>{t('nav', 'logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
