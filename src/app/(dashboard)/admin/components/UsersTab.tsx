'use client'

import { FiSearch, FiFilter, FiUserPlus, FiMoreHorizontal, FiKey, FiShield, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { User } from '../types'
import { useState } from 'react'

interface UsersTabProps {
  users: User[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  roleFilter: string
  setRoleFilter: (role: string) => void
  deptFilter: string
  setDeptFilter: (dept: string) => void
  demoFilter: boolean
  setDemoFilter: (demo: boolean) => void
  t: (category: string, key: string) => string
  toggleUserStatus: (user: User) => void
  handleDeleteUser: (userId: string) => void
  handleEditClick: (user: User) => void
  handleChangePasswordClick: (user: User) => void
  handlePermissionsClick: (user: User) => void
  setShowCreateModal: (show: boolean) => void
  ROLES: string[]
  DEPARTMENTS: string[]
}

const brandDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function UsersTab({
  users, loading,
  searchQuery, setSearchQuery,
  roleFilter, setRoleFilter,
  deptFilter, setDeptFilter,
  demoFilter, setDemoFilter,
  t,
  toggleUserStatus, handleDeleteUser,
  handleEditClick, handleChangePasswordClick,
  handlePermissionsClick, setShowCreateModal,
  ROLES, DEPARTMENTS
}: UsersTabProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:gap-6 bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
        {/* Search + Create */}
        <div className="flex gap-2 sm:gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('admin', 'searchPlaceholder') || "Search..."}
              className="w-full pl-10 pr-4 py-3 sm:py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl sm:rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium sm:font-bold text-sm text-slate-700 dark:text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 sm:px-8 py-3 sm:py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl sm:rounded-3xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm sm:text-xs sm:uppercase sm:tracking-widest sm:font-black shrink-0"
          >
            <FiUserPlus size={18} />
            <span className="hidden sm:inline">{t('admin', 'createUser')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl font-bold text-xs text-slate-500 outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">{t('admin', 'allRoles')}</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{t('roles', role)}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl font-bold text-xs text-slate-500 outline-none"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All Depts</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{t('departments', dept)}</option>
            ))}
          </select>

          <button
            onClick={() => setDemoFilter(!demoFilter)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              demoFilter
                ? 'bg-amber-100 border-amber-200 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/50 dark:border-slate-700/50'
            }`}
          >
            Demo
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total', value: users.length, color: 'text-indigo-600' },
          { label: 'Active', value: users.filter(u => u.isActive).length, color: 'text-emerald-500' },
          { label: 'Demo', value: users.filter(u => u.isDemo).length, color: 'text-amber-500' },
          { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-3 sm:p-6 rounded-xl sm:rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm text-center sm:text-left">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className={`text-lg sm:text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Mobile: Card view */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 animate-pulse">
              <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            </div>
          ))
        ) : users.length > 0 ? (
          users.map(user => {
            const isExpanded = expandedUser === user.id
            return (
              <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                {/* User info row */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</span>
                      {user.isDemo && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-bold rounded">DEMO</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                      user.role === 'Admin' || user.role === 'President'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {t('roles', user.role)}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  </div>
                </button>

                {/* Expanded actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-slate-700/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{user.department}</span>
                      <span>{user.lastLogin ? brandDate(user.lastLogin) : 'Never logged in'}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        onClick={() => handlePermissionsClick(user)}
                        className="flex flex-col items-center gap-1 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl active:bg-indigo-100"
                      >
                        <FiShield size={16} />
                        <span className="text-[9px] font-bold">Rights</span>
                      </button>
                      <button
                        onClick={() => handleChangePasswordClick(user)}
                        className="flex flex-col items-center gap-1 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl active:bg-amber-100"
                      >
                        <FiKey size={16} />
                        <span className="text-[9px] font-bold">Pass</span>
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="flex flex-col items-center gap-1 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl active:bg-emerald-100"
                      >
                        <FiEdit2 size={16} />
                        <span className="text-[9px] font-bold">Edit</span>
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl ${
                          user.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {user.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        <span className="text-[9px] font-bold">{user.isActive ? 'On' : 'Off'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex flex-col items-center gap-1 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl active:bg-rose-100"
                      >
                        <FiTrash2 size={16} />
                        <span className="text-[9px] font-bold">Del</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700/50 text-center">
            <FiUserPlus className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm font-bold text-slate-500">{t('admin', 'noUsers')}</p>
          </div>
        )}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('common', 'user')}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('common', 'role')}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('common', 'status')}</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t('common', 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 dark:text-white">{user.name}</span>
                            {user.isDemo && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-md">DEMO</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-400 lowercase">{user.email}</p>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-1">{user.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border ${
                        user.role === 'Admin' || user.role === 'President'
                          ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                          : user.role === 'ProjectManager' || user.role === 'CEO'
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {t('roles', user.role)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                        }`}
                      >
                        {user.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {user.isActive ? t('common', 'active') : t('common', 'inactive')}
                        </span>
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last seen</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-300 italic">
                        {user.lastLogin ? brandDate(user.lastLogin) : 'Never'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handlePermissionsClick(user)} className="p-3 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Permissions">
                          <FiShield size={16} />
                        </button>
                        <button onClick={() => handleChangePasswordClick(user)} className="p-3 bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all" title="Password">
                          <FiKey size={16} />
                        </button>
                        <button onClick={() => handleEditClick(user)} className="p-3 bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Edit">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-3 bg-rose-50 dark:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all" title="Delete">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <div className="group-hover:hidden">
                        <FiMoreHorizontal className="ml-auto text-slate-400" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <FiUserPlus className="mx-auto text-slate-300 mb-4" size={32} />
                    <p className="font-bold text-slate-500">{t('admin', 'noUsers')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
