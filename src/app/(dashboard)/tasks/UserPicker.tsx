'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'

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
  if (tasks === 0) return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', emoji: '🟢' }
  if (tasks <= 2) return { color: 'text-blue-400', bg: 'bg-blue-500/20', emoji: '🔵' }
  if (tasks <= 4) return { color: 'text-amber-400', bg: 'bg-amber-500/20', emoji: '🟡' }
  return { color: 'text-red-400', bg: 'bg-red-500/20', emoji: '🔴' }
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = users
    .filter(u => !excludeIds.includes(u.id))
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.activeTasks ?? 0) - (b.activeTasks ?? 0))

  const isRu = language === 'ru'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-left flex items-center justify-between gap-2"
      >
        {selectedUser ? (
          <span className="flex items-center gap-2 text-gray-900 dark:text-white truncate">
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

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isRu ? 'Поиск...' : 'Search...'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-700/50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {/* Unassigned */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left ${!value ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
            >
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
                  onClick={() => { onChange(user.id); setOpen(false); setSearch('') }}
                  className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
                >
                  {/* Name */}
                  <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
                    {user.name}
                  </span>

                  {showWorkload && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Location */}
                      <span className="text-xs">{locEmoji}</span>
                      {/* Workload */}
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${wl.bg} ${wl.color}`}>
                        {wl.emoji} {tasks} {isRu ? 'зад.' : 'tasks'}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                {isRu ? 'Никого не найдено' : 'No one found'}
              </div>
            )}
          </div>

          {showWorkload && (
            <div className="px-3 py-1.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
              <span>🟢 0</span>
              <span>🔵 1-2</span>
              <span>🟡 3-4</span>
              <span>🔴 5+</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
