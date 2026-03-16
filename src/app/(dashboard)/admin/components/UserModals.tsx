'use client'

import { useState } from 'react'
import { FiX, FiCheck, FiMail, FiUser, FiLock, FiPhone, FiGrid, FiShield, FiToggleLeft } from 'react-icons/fi'
import { User } from '../types'

interface UserModalsProps {
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  showPasswordModal: boolean
  setShowPasswordModal: (show: boolean) => void
  showPermissionsModal: boolean
  setShowPermissionsModal: (show: boolean) => void
  selectedUser: User | null
  formData: any
  setFormData: (data: any) => void
  pwdData: any
  setPwdData: (data: any) => void
  handleCreateUser: (e: React.FormEvent) => void
  handleUpdateUser: (e: React.FormEvent) => void
  handleChangePassword: (e: React.FormEvent) => void
  handleSavePermissions: () => void
  t: (category: string, key: string) => string
  ROLES: string[]
  DEPARTMENTS: string[]
  permissionsList: Array<{ id: string; label: string; category: string }>
}

export default function UserModals({
  showCreateModal, setShowCreateModal,
  showEditModal, setShowEditModal,
  showPasswordModal, setShowPasswordModal,
  showPermissionsModal, setShowPermissionsModal,
  selectedUser,
  formData, setFormData,
  pwdData, setPwdData,
  handleCreateUser,
  handleUpdateUser,
  handleChangePassword,
  handleSavePermissions,
  t,
  ROLES,
  DEPARTMENTS,
  permissionsList
}: UserModalsProps) {
  return (
    <>
      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin', 'createUser')}</h3>
                <p className="text-slate-500 font-bold">{t('projects', 'fillDetails')}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'name')}</label>
                  <div className="relative">
                    <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('settings', 'fullNamePlaceholder')}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'email')}</label>
                  <div className="relative">
                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'password')}</label>
                  <div className="relative">
                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('admin', 'minPassword')}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'phone')}</label>
                  <div className="relative">
                    <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7..."
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'role')}</label>
                  <div className="relative">
                    <FiShield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{t('roles', role)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'department')}</label>
                  <div className="relative">
                    <FiGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{t('departments', dept)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                      <FiToggleLeft className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('admin', 'demoAccount')}</p>
                      <p className="text-xs font-bold text-slate-400">{t('admin', 'demoAccountHint')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isDemo}
                      onChange={(e) => setFormData({ ...formData, isDemo: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                >
                  {t('common', 'cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                >
                  {t('common', 'create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin', 'editUser')}</h3>
                <p className="text-slate-500 font-bold">{selectedUser.name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'name')}</label>
                  <div className="relative">
                    <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-300 uppercase tracking-widest px-2 opacity-50">{t('common', 'email')}</label>
                  <div className="relative">
                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                    <input
                      disabled
                      type="email"
                      value={formData.email}
                      className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'phone')}</label>
                  <div className="relative">
                    <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'role')}</label>
                  <div className="relative">
                    <FiShield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{t('roles', role)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'department')}</label>
                  <div className="relative">
                    <FiGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{t('departments', dept)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tighter">{t('admin', 'demoAccount')}</p>
                    <p className="text-[10px] font-bold text-slate-400">{t('admin', 'demoAccountHint')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isDemo}
                      onChange={(e) => setFormData({ ...formData, isDemo: e.target.checked })}
                    />
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                >
                  {t('common', 'cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
                >
                  {t('common', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin', 'changePassword')}</h3>
                <p className="text-slate-500 font-bold">{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{t('common', 'password')}</label>
                <div className="relative">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={pwdData.password}
                    onChange={(e) => setPwdData({ ...pwdData, password: e.target.value })}
                    placeholder={t('admin', 'minPassword')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Confirm Password</label>
                <div className="relative">
                  <FiCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={pwdData.confirmPassword}
                    onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs mt-4"
              >
                {t('common', 'save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin', 'permissions')}</h3>
                <p className="text-slate-500 font-bold">{selectedUser.name}</p>
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Projects', 'Tasks', 'Members', 'Finance', 'Events', 'Reports', 'Admin'].map(category => (
                  <div key={category} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 text-xs">{t('permissionCategories', category)}</h4>
                    <div className="space-y-3">
                      {permissionsList.filter(p => p.category === category).map(perm => {
                        const isChecked = (formData.permissions || []).includes(perm.id)
                        return (
                          <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newPerms = e.target.checked
                                  ? [...(formData.permissions || []), perm.id]
                                  : (formData.permissions || []).filter((id: string) => id !== perm.id)
                                setFormData({ ...formData, permissions: newPerms })
                              }}
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-all dark:bg-slate-700"
                            />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{perm.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex gap-4">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleSavePermissions}
                className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
              >
                {t('common', 'save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
