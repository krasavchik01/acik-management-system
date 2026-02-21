'use client'

import { useAuth } from '@/hooks/useAuth'
import { FiBell, FiSearch, FiPlus } from 'react-icons/fi'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { profile } = useAuth()

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            <FiPlus size={18} />
            {action.label}
          </button>
        )}

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-700 rounded-xl px-4 py-2">
            <FiSearch className="text-gray-400 dark:text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none ml-2 w-48 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {profile?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {profile?.role || 'Member'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
