'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi'

interface UserOption {
  id: string
  name: string
  avatar?: string
  role?: string
  department?: string
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

function getWorkloadLevel(tasks: number): { label: string; color: string; bg: string; emoji: string } {
  if (tasks === 0) return { label: 'Свободен', color: 'text-emerald-400', bg: 'bg-emerald-500/20', emoji: '🟢' }
  if (tasks <= 2) return { label: 'Норм', color: 'text-blue-400', bg: 'bg-blue-500/20', emoji: '🔵' }
  if (tasks <= 4) return { label: 'Загружен', color: 'text-amber-400', bg: 'bg-amber-500/20', emoji: '🟡' }
  return { label: 'Перегружен', color: 'text-red-400', bg: 'bg-red-500/20', emoji: '🔴' }
}

function getWorkloadLevelEn(tasks: number): { label: string } {
  if (tasks === 0) return { label: 'Free' }
  if (tasks <= 2) return { label: 'Normal' }
  if (tasks <= 4) return { label: 'Busy' }
  return { label: 'Overloaded' }
}

function getLocationInfo(location?: string, status?: string): { emoji: string; label: string; labelRu: string } {
  if (status === 'Present' && location === 'Office') return { emoji: '🏢', label: 'Office', labelRu: 'Офис' }
  if (status === 'Present' && location === 'Remote') return { emoji: '🏠', label: 'Remote', labelRu: 'Удалённо' }
  if (status === 'Present') return { emoji: '✅', label: 'Online', labelRu: 'Онлайн' }
  return { emoji: '⚫', label: 'Offline', labelRu: 'Оффлайн' }
}

function getRoleShort(role?: string): string {
  const map: Record<string, string> = {
    Admin: 'ADM', President: 'PRES', VicePresident: 'VP',
    CEO: 'CEO', ProjectManager: 'PM', MarketingManager: 'MM',
    Member: 'MBR', Moderator: 'MOD'
  }
  return map[role || ''] || role?.slice(0, 3).toUpperCase() || ''
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
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = users
    .filter(u => !excludeIds.includes(u.id))
    .filter(u =>
      !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.activeTasks ?? 0) - (b.activeTasks ?? 0))

  const isRu = language === 'ru'

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-left flex items-center justify-between gap-2"
      >
        {selectedUser ? (
          <span className="flex items-center gap-2 text-gray-900 dark:text-white truncate">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {selectedUser.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{selectedUser.name}</span>
            {showWorkload && selectedUser.activeTasks !== undefined && (
              <span className="text-xs opacity-70">
                {getWorkloadLevel(selectedUser.activeTasks).emoji}
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>
        )}
        <FiChevronDown className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isRu ? 'Поиск сотрудника...' : 'Search member...'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-700/50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {/* Unassigned option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                !value ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-400 text-sm">—</span>
              <span className="text-sm text-gray-500 dark:text-slate-400">{placeholder}</span>
            </button>

            {filtered.map(user => {
              const wl = getWorkloadLevel(user.activeTasks ?? 0)
              const wlEn = getWorkloadLevelEn(user.activeTasks ?? 0)
              const loc = getLocationInfo(user.location, user.attendanceStatus)
              const isSelected = user.id === value

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => { onChange(user.id); setOpen(false); setSearch('') }}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    {/* Online indicator */}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                      user.attendanceStatus === 'Present' ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-slate-600'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 shrink-0">
                        {getRoleShort(user.role)}
                      </span>
                    </div>
                    {user.department && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 truncate block">
                        {user.department}
                      </span>
                    )}
                  </div>

                  {/* Workload badges */}
                  {showWorkload && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Location */}
                      <span className="text-xs" title={isRu ? loc.labelRu : loc.label}>
                        {loc.emoji}
                      </span>

                      {/* Tasks count */}
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${wl.bg} ${wl.color} shrink-0`}
                        title={`${user.activeTasks} ${isRu ? 'задач' : 'tasks'}, ${user.activeProjects} ${isRu ? 'проектов' : 'projects'}`}
                      >
                        {wl.emoji} {user.activeTasks}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                {isRu ? 'Никого не найдено' : 'No one found'}
              </div>
            )}
          </div>

          {/* Legend */}
          {showWorkload && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
              <span>🟢 {isRu ? 'Свободен' : 'Free'}</span>
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
