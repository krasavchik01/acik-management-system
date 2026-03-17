'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtime } from '@/hooks/useRealtime'
import { useLanguage } from '@/lib/i18n'
import Link from 'next/link'
import { FiBell, FiSearch, FiPlus, FiCheck, FiCheckCircle, FiClock, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  } | React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { profile } = useAuth()
  const { language } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length


  // Play a simple notification "pop" sound
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  // Real-time notification subscription
  useRealtime<Notification>({
    table: 'Notification',
    filter: profile?.id ? `userId=eq.${profile.id}` : undefined,
    onInsert: (newNotif: Notification) => {
      setNotifications(prev => [newNotif, ...prev])
      playNotificationSound()
      toast.info(newNotif.title, { hideProgressBar: true, position: 'bottom-right' })
    },
    onUpdate: (updatedNotif: Notification) => {
      setNotifications(prev =>
        prev.map(n => n.id === updatedNotif.id ? updatedNotif : n)
      )
    },
    onDelete: (deletedNotif: Notification) => {
      setNotifications(prev => prev.filter(n => n.id !== deletedNotif.id))
    }
  })

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications()
    }
  }, [profile?.id])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPushWorker = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notifications are not supported in this browser.');
        return;
      }
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      const response = await fetch('/api/web-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        setPushEnabled(true);
        toast.success(language === 'ru' ? 'Уведомления включены!' : 'Push Notifications enabled!');
      } else {
        toast.error('Failed to save subscription.');
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.error(language === 'ru' ? 'Разрешение на уведомления отклонено.' : 'Notification permission denied.');
      } else {
        console.error('Push subscription error:', error);
        toast.error('Could not subscribe to push notifications.');
      }
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return language === 'ru' ? 'Только что' : 'Just now'
    if (diffMins < 60) return language === 'ru' ? `${diffMins} мин назад` : `${diffMins}m ago`
    if (diffHours < 24) return language === 'ru' ? `${diffHours} ч назад` : `${diffHours}h ago`
    if (diffDays < 7) return language === 'ru' ? `${diffDays} дн назад` : `${diffDays}d ago`
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TaskAssigned':
      case 'TaskUpdated':
        return <FiCheckCircle className="text-blue-500" size={18} />
      case 'TaskCompleted':
        return <FiCheck className="text-green-500" size={18} />
      case 'TaskOverdue':
        return <FiClock className="text-red-500" size={18} />
      default:
        return <FiBell className="text-indigo-500" size={18} />
    }
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#080d14]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.05] px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="min-w-0">
          <h1
            className="text-xl font-bold text-slate-900 dark:text-white truncate tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Action button */}
          {action && (
            <>
              {typeof action === 'object' && 'label' in action && 'onClick' in action ? (
                <button
                  onClick={(action as { onClick: () => void }).onClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-px"
                >
                  <FiPlus size={16} />
                  {(action as { label: string }).label}
                </button>
              ) : (
                action
              )}
            </>
          )}

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 w-48 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400/50 transition-all">
            <FiSearch className="text-slate-400 flex-shrink-0" size={15} />
            <input
              type="text"
              placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
              className="bg-transparent border-none outline-none w-full text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600"
              style={{ boxShadow: 'none' }}
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 transition-all duration-200 ${
                showNotifications
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#080d14]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[360px] bg-white/95 dark:bg-[#0f1623]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-white/[0.06] z-50 overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {language === 'ru' ? 'Уведомления' : 'Notifications'}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={loading}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      >
                        {language === 'ru' ? 'Прочитать всё' : 'Mark all read'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                      <FiX size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                        <FiBell size={20} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        {language === 'ru' ? 'Нет уведомлений' : 'No notifications'}
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.isRead) markAsRead(notification.id)
                          if (notification.link) window.location.href = notification.link
                        }}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-white/[0.03] last:border-0 ${
                          !notification.isRead
                            ? 'bg-indigo-50/60 dark:bg-indigo-500/[0.05] hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.08]'
                            : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] leading-snug ${!notification.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 font-medium">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-white/[0.05] p-2 space-y-1.5">
                    {!pushEnabled && (
                      <button
                        onClick={subscribeToPushWorker}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold transition-all shadow-sm"
                      >
                        <FiBell size={13} />
                        {language === 'ru' ? 'Включить Push-уведомления' : 'Enable Push Notifications'}
                      </button>
                    )}
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block w-full text-center py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl font-semibold transition-colors"
                    >
                      {language === 'ru' ? 'Смотреть все' : 'View all'}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {profile?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {profile?.role || 'Member'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
