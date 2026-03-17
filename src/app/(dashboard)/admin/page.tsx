'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  FiUsers, FiActivity, FiMapPin, FiSettings, FiShield, FiX
} from 'react-icons/fi'
import { useLanguage } from '@/lib/i18n'

import { User, AdminStats, ROLES, DEPARTMENTS, getPermissionsList } from './types'
import OverviewTab from './components/OverviewTab'
import UsersTab from './components/UsersTab'
import OfficeTab from './components/OfficeTab'
import SystemTab from './components/SystemTab'
import UserModals from './components/UserModals'

export default function AdminPage() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'office' | 'system'>('overview')

  // Office settings
  const [officeForm, setOfficeForm] = useState({
    name: '',
    latitude: 41.2995,
    longitude: 69.2401,
    radius: 100,
    address: '',
  })
  const [officeLoaded, setOfficeLoaded] = useState(false)
  const [savingOffice, setSavingOffice] = useState(false)
  
  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [demoFilter, setDemoFilter] = useState(false)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states (kept here for easy syncing between modals if needed)
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    department: 'Operations',
    permissions: [],
    isDemo: false
  })

  const [pwdData, setPwdData] = useState({
    password: '',
    confirmPassword: ''
  })

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'President' || profile?.role === 'CEO'

  const fetchData = useCallback(async () => {
    if (!isAdmin) return
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/users'),
      ])

      const dashboardData = await dashboardRes.json()
      const usersData = await usersRes.json()

      if (dashboardData.success) {
        setStats(dashboardData.data)
      }
      if (usersData.success) {
        setUsers(usersData.data || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error(t('common', 'error'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin, t])

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [isAdmin, fetchData])

  const fetchOfficeSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/office')
      const data = await res.json()
      if (data.success && data.data) {
        setOfficeForm({
          name: data.data.name || '',
          latitude: data.data.latitude || 41.2995,
          longitude: data.data.longitude || 69.2401,
          radius: data.data.radius || 100,
          address: data.data.address || '',
        })
      }
    } catch (error) {
      console.error('Error fetching office settings:', error)
    } finally {
      setOfficeLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'office' && !officeLoaded) {
      fetchOfficeSettings()
    }
  }, [activeTab, officeLoaded, fetchOfficeSettings])

  const handleSaveOffice = async () => {
    setSavingOffice(true)
    try {
      const res = await fetch('/api/admin/office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('admin', 'officeSaved'))
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error saving office settings:', error)
      toast.error(t('common', 'error'))
    } finally {
      setSavingOffice(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      toast.error(t('auth', 'fillRequired'))
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          isDemo: formData.isDemo,
          permissions: formData.permissions,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('admin', 'userCreated'))
        setShowCreateModal(false)
        fetchData()
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(t('common', 'error'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingUser) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          department: formData.department,
          permissions: formData.permissions,
          isActive: formData.isActive,
          isDemo: formData.isDemo,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('admin', 'userUpdated'))
        setShowEditModal(false)
        setShowPermissionsModal(false)
        fetchData()
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(t('common', 'error'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (pwdData.password !== pwdData.confirmPassword) {
      toast.error(t('auth', 'passwordsNotMatch'))
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwdData.password }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('admin', 'passwordChanged'))
        setShowPasswordModal(false)
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(t('common', 'error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('admin', 'userDeleted'))
        setShowDeleteModal(false)
        setDeletingUser(null)
        fetchData()
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(t('common', 'error'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(user.isActive ? t('admin', 'userDeactivated') : t('admin', 'userActivated'))
        fetchData()
      } else {
        toast.error(data.message || t('common', 'error'))
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error(t('common', 'error'))
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Operations',
      permissions: user.permissions || [],
      isActive: user.isActive,
      isDemo: user.isDemo,
    })
    setShowEditModal(true)
  }

  const openPasswordModal = (user: User) => {
    setEditingUser(user)
    setPwdData({ password: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesSearch = !search || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesDept = deptFilter === 'all' || user.department === deptFilter
    const matchesDemo = !demoFilter || user.isDemo === true
    return matchesSearch && matchesRole && matchesDept && matchesDemo
  }), [users, search, roleFilter, deptFilter, demoFilter])

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title={t('admin', 'title')} subtitle={t('admin', 'accessDenied')} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-[3rem] p-12 text-center shadow-2xl max-w-lg w-full">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiShield size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">{t('admin', 'accessDenied')}</h2>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">{t('admin', 'adminOnlyAccess')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={t('admin', 'title')} subtitle={t('admin', 'subtitle')} />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: t('admin', 'tabOverview'), icon: FiActivity },
            { id: 'users', label: t('admin', 'tabUsers'), icon: FiUsers },
            { id: 'office', label: t('admin', 'tabOffice'), icon: FiMapPin },
            { id: 'system', label: t('admin', 'tabSystem'), icon: FiSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] font-bold sm:font-black uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs transition-all duration-300 flex-1 sm:flex-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="relative min-h-[600px]">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              users={users} 
              loading={loading} 
              refreshData={fetchData} 
              t={t} 
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={filteredUsers}
              loading={loading}
              searchQuery={search}
              setSearchQuery={setSearch}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              deptFilter={deptFilter}
              setDeptFilter={setDeptFilter}
              demoFilter={demoFilter}
              setDemoFilter={setDemoFilter}
              t={t}
              toggleUserStatus={handleToggleActive}
              handleDeleteUser={(userId) => {
                const user = users.find(u => u.id === userId)
                if (user) {
                  setDeletingUser(user)
                  setShowDeleteModal(true)
                }
              }}
              handleEditClick={openEditModal}
              handleChangePasswordClick={openPasswordModal}
              handlePermissionsClick={(user) => {
                setEditingUser(user)
                setFormData({
                  ...formData,
                  permissions: user.permissions || []
                })
                setShowPermissionsModal(true)
              }}
              setShowCreateModal={setShowCreateModal}
              ROLES={ROLES}
              DEPARTMENTS={DEPARTMENTS}
            />
          )}

          {activeTab === 'office' && (
            <OfficeTab
              officeForm={officeForm}
              setOfficeForm={setOfficeForm}
              handleSaveOffice={handleSaveOffice}
              savingOffice={savingOffice}
              officeLoaded={officeLoaded}
              t={t}
              language={language}
            />
          )}

          {activeTab === 'system' && (
            <SystemTab stats={stats} t={t} language={language} />
          )}
        </div>
      </div>

      <UserModals
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showPasswordModal={showPasswordModal}
        setShowPasswordModal={setShowPasswordModal}
        showPermissionsModal={showPermissionsModal}
        setShowPermissionsModal={setShowPermissionsModal}
        selectedUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        pwdData={pwdData}
        setPwdData={setPwdData}
        handleCreateUser={handleCreateUser}
        handleUpdateUser={handleUpdateUser}
        handleChangePassword={handleChangePassword}
        handleSavePermissions={handleUpdateUser}
        t={t}
        ROLES={ROLES}
        DEPARTMENTS={DEPARTMENTS}
        permissionsList={getPermissionsList(t)}
      />

      {/* Extreme Delete Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3.5rem] p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xl shadow-red-600/10">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce">
              <FiX size={48} />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
              {t('common', 'delete')}?
            </h3>
            <p className="text-slate-500 font-bold mb-12 leading-relaxed text-sm">
              {t('admin', 'deleteConfirmText')} <br/>
              <span className="text-red-600 font-black text-lg block mt-2">{deletingUser.name}</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-[2rem] uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={saving}
                className="flex-1 py-5 bg-red-600 text-white font-black rounded-[2rem] shadow-xl shadow-red-600/30 uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all hover:-translate-y-1 disabled:opacity-50"
              >
                {saving ? '...' : t('common', 'delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
