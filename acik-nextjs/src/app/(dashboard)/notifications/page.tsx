'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { useLanguage } from '@/lib/i18n'
import {
  FiBell, FiCheckCircle, FiCheck, FiClock, FiTrash2, FiFilter,
  FiInbox, FiAlertCircle, FiUsers, FiFolder, FiCalendar
} from 'react-icons/fi'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

type FilterType = 'all' | 'unread' | 'tasks' | 'projects' | 'system'

export default function NotificationsPage() {
  const { language } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=100')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
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
      console.error('Error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return language === 'ru' ? 'Только что' : 'Just now'
    if (diffMins < 60) return language === 'ru' ? `${diffMins} мин назад` : `${diffMins} minutes ago`
    if (diffHours < 24) return language === 'ru' ? `${diffHours} ч назад` : `${diffHours} hours ago`
    if (diffDays < 7) return language === 'ru' ? `${diffDays} дн назад` : `${diffDays} days ago`
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TaskAssigned':
        return <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl"><FiCheckCircle className="text-blue-600 dark:text-blue-400" size={20} /></div>
      case 'TaskUpdated':
        return <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl"><FiClock className="text-yellow-600 dark:text-yellow-400" size={20} /></div>
      case 'TaskCompleted':
        return <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl"><FiCheck className="text-green-600 dark:text-green-400" size={20} /></div>
      case 'TaskOverdue':
        return <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl"><FiAlertCircle className="text-red-600 dark:text-red-400" size={20} /></div>
      case 'ProjectUpdate':
        return <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl"><FiFolder className="text-purple-600 dark:text-purple-400" size={20} /></div>
      case 'MemberJoined':
        return <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl"><FiUsers className="text-indigo-600 dark:text-indigo-400" size={20} /></div>
      case 'EventReminder':
        return <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-xl"><FiCalendar className="text-pink-600 dark:text-pink-400" size={20} /></div>
      default:
        return <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl"><FiBell className="text-gray-600 dark:text-slate-400" size={20} /></div>
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'tasks') return n.type.startsWith('Task')
    if (filter === 'projects') return n.type === 'ProjectUpdate'
    if (filter === 'system') return ['SystemAlert', 'AttendanceReminder'].includes(n.type)
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filters: { key: FilterType; label: string; labelRu: string }[] = [
    { key: 'all', label: 'All', labelRu: 'Все' },
    { key: 'unread', label: 'Unread', labelRu: 'Непрочитанные' },
    { key: 'tasks', label: 'Tasks', labelRu: 'Задачи' },
    { key: 'projects', label: 'Projects', labelRu: 'Проекты' },
    { key: 'system', label: 'System', labelRu: 'Системные' },
  ]

  // Group notifications by date
  const groupedNotifications: { [key: string]: Notification[] } = {}
  filteredNotifications.forEach(n => {
    const date = new Date(n.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key: string
    if (date.toDateString() === today.toDateString()) {
      key = language === 'ru' ? 'Сегодня' : 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = language === 'ru' ? 'Вчера' : 'Yesterday'
    } else {
      key = date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long'
      })
    }

    if (!groupedNotifications[key]) {
      groupedNotifications[key] = []
    }
    groupedNotifications[key].push(n)
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        title={language === 'ru' ? 'Уведомления' : 'Notifications'}
        subtitle={unreadCount > 0
          ? (language === 'ru' ? `${unreadCount} непрочитанных` : `${unreadCount} unread`)
          : (language === 'ru' ? 'Все прочитано' : 'All caught up')
        }
      />

      <div className="p-6">
        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                }`}
              >
                {language === 'ru' ? f.labelRu : f.label}
                {f.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl text-sm font-medium transition-all"
            >
              <FiCheck size={16} />
              {language === 'ru' ? 'Прочитать все' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-700">
            <FiInbox size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ru' ? 'Нет уведомлений' : 'No notifications'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400">
              {filter === 'unread'
                ? (language === 'ru' ? 'Все уведомления прочитаны' : 'All notifications have been read')
                : (language === 'ru' ? 'Здесь будут появляться ваши уведомления' : 'Your notifications will appear here')
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 px-1">
                  {date}
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        !notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      {getNotificationIcon(notification.type)}

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          if (!notification.isRead) markAsRead(notification.id)
                          if (notification.link) window.location.href = notification.link
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                            title={language === 'ru' ? 'Отметить прочитанным' : 'Mark as read'}
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          title={language === 'ru' ? 'Удалить' : 'Delete'}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
