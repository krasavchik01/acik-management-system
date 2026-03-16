'use client'

import { FiSearch, FiFilter, FiUserPlus, FiMoreHorizontal, FiKey, FiShield, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSend } from 'react-icons/fi'
import { User } from '../types'

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
  users,
  loading,
  searchQuery, setSearchQuery,
  roleFilter, setRoleFilter,
  deptFilter, setDeptFilter,
  demoFilter, setDemoFilter,
  t,
  toggleUserStatus,
  handleDeleteUser,
  handleEditClick,
  handleChangePasswordClick,
  handlePermissionsClick,
  setShowCreateModal,
  ROLES,
  DEPARTMENTS
}: UsersTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-sm">
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('admin', 'searchPlaceholder') || "Search users by name or email..."}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <FiFilter className="text-slate-400" />
            <select 
              className="bg-transparent font-black text-xs uppercase tracking-widest text-slate-500 outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">{t('admin', 'allRoles')}</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{t('roles', role)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <FiFilter className="text-slate-400" />
            <select 
              className="bg-transparent font-black text-xs uppercase tracking-widest text-slate-500 outline-none cursor-pointer"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{t('departments', dept)}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setDemoFilter(!demoFilter)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest ${
              demoFilter 
                ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/20' 
                : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/50 dark:border-slate-700/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${demoFilter ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
            Demo Only
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
          >
            <FiUserPlus size={18} />
            {t('admin', 'createUser')}
          </button>
        </div>
      </div>

      {/* Users Statistics Cards - Mini version */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-indigo-600' },
          { label: 'Active', value: users.filter(u => u.isActive).length, color: 'text-emerald-500' },
          { label: 'Demo', value: users.filter(u => u.isDemo).length, color: 'text-amber-500' },
          { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
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
                            <span className="font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</span>
                            {user.isDemo && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-200 dark:border-amber-800/50">DEMO</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-400 lowercase">{user.email}</p>
                          <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter mt-1">{user.department}</p>
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
                        className={`group/status flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => handlePermissionsClick(user)}
                          className="p-3 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title={t('admin', 'permissions')}
                        >
                          <FiShield size={16} />
                        </button>
                        <button 
                          onClick={() => handleChangePasswordClick(user)}
                          className="p-3 bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          title={t('admin', 'changePassword')}
                        >
                          <FiKey size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-3 bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title={t('common', 'edit')}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-3 bg-rose-50 dark:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title={t('common', 'delete')}
                        >
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
                    <div className="max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <FiUserPlus className="text-slate-300" size={32} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('admin', 'noUsers')}</h4>
                      <p className="text-slate-500 font-bold mb-8">No users found matching your search criteria.</p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                      >
                        {t('admin', 'addFirstUser')}
                      </button>
                    </div>
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
