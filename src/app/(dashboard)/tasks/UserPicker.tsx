'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi'

interface UserOption {
  id: string
  name: string
  avatar?: string
  activeTasks?: number
  activeProjects?: number
  location?: string
  attendanceStatus?: string
}

interface UserPickerProps {
  users: UserOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  excludeIds?: string[]
  showWorkload?: boolean
  language?: string
}

function getWorkloadLevel(tasks: number) {
  if (tasks === 0) return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20', emoji: '🟢' }
  if (tasks <= 2) return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', emoji: '🔵' }
  if (tasks <= 4) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20', emoji: '🟡' }
  return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', emoji: '🔴' }
}

function getLocationEmoji(location?: string, status?: string) {
  if (status === 'Present' && location === 'Office') return '🏢'
  if (status === 'Present' && location === 'Remote') return '🏠'
  if (status === 'Present') return '✅'
  return '⚫'
}

export default function UserPicker({
  users, value, onChange, placeholder = 'Не назначено',
  excludeIds = [], showWorkload = true, language = 'ru'
}: UserPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedUser = users.find(u => u.id === value)

  // Close on outside click (desktop only)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const filtered = users
    .filter(u => !excludeIds.includes(u.id))
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.activeTasks ?? 0) - (b.activeTasks ?? 0))

  const isRu = language === 'ru'

  const select = (id: string) => {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  const renderList = () => (
    <>
      {/* Unassigned */}
      <button
        type="button"
        onClick={() => select('')}
        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left active:bg-gray-100 dark:active:bg-slate-700 ${!value ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
      >
        <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-400 text-sm shrink-0">—</span>
        <span className="text-sm text-gray-400">{placeholder}</span>
      </button>

      {filtered.map(user => {
        const tasks = user.activeTasks ?? 0
        const wl = getWorkloadLevel(tasks)
        const locEmoji = getLocationEmoji(user.location, user.attendanceStatus)
        const isSelected = user.id === value

        return (
          <button
            key={user.id}
            type="button"
            onClick={() => select(user.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left active:bg-gray-100 dark:active:bg-slate-700 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
              {user.name}
            </span>
            {showWorkload && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs">{locEmoji}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${wl.bg} ${wl.color}`}>
                  {tasks} {isRu ? 'зад.' : 'tasks'}
                </span>
              </div>
            )}
          </button>
        )
      })}

      {filtered.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          {isRu ? 'Никого не найдено' : 'No one found'}
        </div>
      )}
    </>
  )

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-left flex items-center justify-between gap-2"
      >
        {selectedUser ? (
          <span className="flex items-center gap-2 text-gray-900 dark:text-white truncate">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {selectedUser.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{selectedUser.name}</span>
            {showWorkload && selectedUser.activeTasks !== undefined && (
              <span className="text-xs">{getWorkloadLevel(selectedUser.activeTasks).emoji}</span>
            )}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>
        )}
        <FiChevronDown className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      {/* Mobile: bottom sheet */}
      {open && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black/50 z-[60]" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col safe-bottom">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {isRu ? 'Выберите сотрудника' : 'Select member'}
              </span>
              <button type="button" onClick={() => { setOpen(false); setSearch('') }} className="p-1 text-gray-400">
                <FiX size={20} />
              </button>
            </div>
            {/* Search */}
            <div className="px-4 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isRu ? 'Поиск...' : 'Search...'}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-100 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100 dark:divide-slate-700">
              {renderList()}
            </div>
            {showWorkload && (
              <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-3 text-[10px] text-gray-400">
                <span>🟢 0</span> <span>🔵 1-2</span> <span>🟡 3-4</span> <span>🔴 5+</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Desktop: dropdown */}
      {open && (
        <div className="hidden sm:block absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isRu ? 'Поиск...' : 'Search...'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-700/50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-gray-50 dark:divide-slate-700/50">
            {renderList()}
          </div>
          {showWorkload && (
            <div className="px-3 py-1.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-3 text-[10px] text-gray-400">
              <span>🟢 0</span> <span>🔵 1-2</span> <span>🟡 3-4</span> <span>🔴 5+</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
