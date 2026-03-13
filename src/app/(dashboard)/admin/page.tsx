'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  FiUsers, FiFolder, FiCheckSquare, FiDollarSign, FiEdit2, FiTrash2,
  FiShield, FiActivity, FiDatabase, FiServer,
  FiSearch, FiPlus, FiX, FiCheck, FiRefreshCw,
  FiSettings, FiUserPlus, FiLock, FiMail, FiEye, FiEyeOff, FiKey,
  FiMapPin, FiSave
} from 'react-icons/fi'

const OfficeMap = dynamic(() => import('@/components/map/OfficeMap'), { ssr: false })

interface User {
  id: string
  supabaseId: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  isDemo: boolean
  permissions: string[]
  lastLogin?: string
  createdAt: string
}

interface AdminStats {
  stats: {
    users: { total: number; active: number }
    projects: { total: number; active: number }
    tasks: { total: number; completed: number }
    members: { total: number; active: number }
    events: { total: number }
    finance: { totalIncome: number }
    system?: {
      financeRecords: number
      sponsors: number
      members: number
    }
  }
  recent: {
    users: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>
    projects: Array<{ id: string; name: string; status: string; createdAt: string }>
  }
  presence?: Array<{
    id: string
    userId: string
    status: string
    workType: string
    checkInTime: string
    checkInAddress?: string
  }>
}

// Brand helper for bold dates
const brandDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const roleOptions = [
  { value: 'Admin', label: 'Администратор', color: 'bg-red-100 text-red-700' },
  { value: 'President', label: 'Президент', color: 'bg-purple-100 text-purple-700' },
  { value: 'CEO', label: 'Директор', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'ProjectManager', label: 'Менеджер проектов', color: 'bg-blue-100 text-blue-700' },
  { value: 'Member', label: 'Участник', color: 'bg-gray-100 text-gray-700' },
]

const departmentOptions = [
  { value: 'Executive', label: 'Руководство' },
  { value: 'Operations', label: 'Операции' },
  { value: 'Marketing', label: 'Маркетинг' },
  { value: 'Finance', label: 'Финансы' },
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Events', label: 'Мероприятия' },
]

// Модули системы
const modulesList = [
  { key: 'projects', label: 'Проекты', icon: '📁' },
  { key: 'tasks', label: 'Задачи', icon: '✅' },
  { key: 'members', label: 'Участники', icon: '👥' },
  { key: 'finance', label: 'Финансы', icon: '💰' },
  { key: 'events', label: 'Мероприятия', icon: '📅' },
  { key: 'attendance', label: 'Посещаемость', icon: '📊' },
  { key: 'sponsors', label: 'Спонсоры', icon: '🤝' },
  { key: 'reports', label: 'Отчёты', icon: '📈' },
  { key: 'notifications', label: 'Уведомления', icon: '🔔' },
  { key: 'admin', label: 'Админ панель', icon: '⚙️' },
]

const permissionsList = [
  { key: 'projects.view', label: 'Просмотр проектов', category: 'Проекты' },
  { key: 'projects.create', label: 'Создание проектов', category: 'Проекты' },
  { key: 'projects.edit', label: 'Редактирование проектов', category: 'Проекты' },
  { key: 'projects.delete', label: 'Удаление проектов', category: 'Проекты' },
  { key: 'tasks.view', label: 'Просмотр задач', category: 'Задачи' },
  { key: 'tasks.create', label: 'Создание задач', category: 'Задачи' },
  { key: 'tasks.edit', label: 'Редактирование задач', category: 'Задачи' },
  { key: 'tasks.delete', label: 'Удаление задач', category: 'Задачи' },
  { key: 'members.view', label: 'Просмотр участников', category: 'Участники' },
  { key: 'members.manage', label: 'Управление участниками', category: 'Участники' },
  { key: 'finance.view', label: 'Просмотр финансов', category: 'Финансы' },
  { key: 'finance.manage', label: 'Управление финансами', category: 'Финансы' },
  { key: 'events.view', label: 'Просмотр мероприятий', category: 'Мероприятия' },
  { key: 'events.manage', label: 'Управление мероприятий', category: 'Мероприятия' },
  { key: 'reports.view', label: 'Просмотр отчётов', category: 'Отчёты' },
  { key: 'reports.manage', label: 'Управление отчётами', category: 'Отчёты' },
  { key: 'admin.access', label: 'Доступ к админке', category: 'Админ' },
]

export default function AdminPage() {
  const { profile } = useAuth()
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
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [demoFilter, setDemoFilter] = useState(false)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Create form
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    modules: [] as string[],
    isDemo: false,
  })

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'Member',
    modules: [] as string[],
    isActive: true,
    isDemo: false,
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })


  const isAdmin = profile?.role === 'Admin' || profile?.role === 'President' || profile?.role === 'CEO'

  const fetchData = useCallback(async () => {
    if (!isAdmin) return
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      if (demoFilter) params.append('demoOnly', 'true')

      const [dashboardRes, usersRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch(`/api/admin/users?${params}`),
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
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, search, roleFilter, demoFilter])

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin, fetchData])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (isAdmin) fetchData()
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, roleFilter, demoFilter, isAdmin, fetchData])

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
        toast.success('Настройки офиса сохранены!')
      } else {
        toast.error(data.message || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('Error saving office settings:', error)
      toast.error('Ошибка сохранения настроек офиса')
    } finally {
      setSavingOffice(false)
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'Member',
      modules: [],
      isDemo: false,
    })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Заполните все обязательные поля')
      return
    }

    if (createForm.password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role,
          isDemo: createForm.isDemo,
          permissions: createForm.modules,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Пользователь ${createForm.name} создан!`)
        setShowCreateModal(false)
        resetCreateForm()
        fetchData()
      } else {
        toast.error(data.message || 'Ошибка создания пользователя')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Ошибка создания пользователя')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      role: user.role,
      modules: user.permissions || [],
      isActive: user.isActive,
      isDemo: user.isDemo,
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          role: editForm.role,
          permissions: editForm.modules,
          isActive: editForm.isActive,
          isDemo: editForm.isDemo,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Пользователь обновлён!')
        setShowEditModal(false)
        fetchData()
      } else {
        toast.error(data.message || 'Ошибка обновления')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Ошибка обновления')
    } finally {
      setSaving(false)
    }
  }

  const openPasswordModal = (user: User) => {
    setEditingUser(user)
    setPasswordForm({ password: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    if (passwordForm.password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordForm.password }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Пароль изменён!')
        setShowPasswordModal(false)
      } else {
        toast.error(data.message || 'Ошибка смены пароля')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Ошибка смены пароля')
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
        toast.success('Пользователь удалён!')
        setShowDeleteModal(false)
        setDeletingUser(null)
        fetchData()
      } else {
        toast.error(data.message || 'Ошибка удаления')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Ошибка удаления')
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
        toast.success(user.isActive ? 'Пользователь деактивирован' : 'Пользователь активирован')
        fetchData()
      } else {
        toast.error(data.message || 'Ошибка')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Ошибка')
    }
  }

  const getRoleStyle = (role: string) => {
    return roleOptions.find(r => r.value === role) || roleOptions[4]
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
        <Header title="Админ панель" subtitle="Доступ запрещён" />
        <div className="p-6 max-w-[800px] mx-auto animate-in fade-in duration-500">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl p-12 text-center shadow-sm">
            <FiShield size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-black text-red-800 dark:text-red-400 mb-2 tracking-tight">Доступ запрещён</h2>
            <p className="text-red-600 dark:text-red-300 font-medium">У вас нет прав для доступа к админ панели.</p>
            <p className="text-red-500 dark:text-red-400/80 text-sm mt-3 bg-red-100 dark:bg-red-500/10 w-max mx-auto px-3 py-1.5 rounded-xl font-medium">Обратитесь к администратору.</p>
          </div>
        </div>
      </div>
    )
  }

  const filteredUsers = users

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header title="Админ панель" subtitle="Управление системой и пользователями" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-2 inline-flex gap-2 overflow-x-auto max-w-full custom-scrollbar">
          {[
            { id: 'overview', label: 'Обзор', icon: FiActivity },
            { id: 'users', label: 'Пользователи', icon: FiUsers },
            { id: 'office', label: 'Офис', icon: FiMapPin },
            { id: 'system', label: 'Система', icon: FiSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'office' | 'system')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 -translate-y-0.5'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Live Presence Command Center */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              {/* Animated Background Accents */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-600/20 transition-all duration-1000" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-40 -mb-40 group-hover:bg-purple-600/20 transition-all duration-1000" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Command Center</h2>
                    <p className="text-slate-400 font-medium flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      Live system monitoring & presence tracking
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => fetchData()}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                    >
                      <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                      Refresh Data
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all">
                      Broadcast Alert
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Presence Feed */}
                  <div className="lg:col-span-8">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <FiMapPin className="text-indigo-400" />
                          Who is where
                        </h3>
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-lg">
                          Today's Presence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(stats as any)?.presence?.length > 0 ? (
                          (stats as any).presence.map((p: any) => {
                            const user = users.find(u => u.id === p.userId)
                            return (
                              <div key={p.id} className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 group/item transition-all hover:bg-slate-900">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg group-hover/item:scale-110 transition-transform">
                                  {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold truncate">{user?.name || 'Unknown'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${p.status === 'Present' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{p.workType}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-indigo-400">{new Date(p.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[80px]">{p.checkInAddress || 'Unknown Location'}</p>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="col-span-2 py-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                            <FiUsers className="mx-auto text-slate-600 mb-3" size={32} />
                            <p className="text-slate-500 font-bold italic">No active sessions for today</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: System Health */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                      <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Database Health</h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Total Users', value: stats?.stats.users.total, icon: FiUsers, color: 'text-blue-400' },
                          { label: 'Finance Logs', value: (stats?.stats as any)?.system?.financeRecords || 0, icon: FiDollarSign, color: 'text-green-400' },
                          { label: 'Registered Sponsors', value: (stats?.stats as any)?.system?.sponsors || 0, icon: FiActivity, color: 'text-purple-400' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <item.icon className={item.color} size={18} />
                              <span className="text-slate-300 text-sm font-semibold">{item.label}</span>
                            </div>
                            <span className="text-white font-black">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6">
                      <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Infrastructure</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-sm font-bold">Node.js Runtime</span>
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded border border-green-500/20">v20.x</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-sm font-bold">Latency</span>
                          <span className="text-white font-black text-xs">24ms</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-6">
                          <div className="bg-indigo-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold text-center">System performance 85% optimal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Users', value: stats?.stats.users.total, active: stats?.stats.users.active, icon: FiUsers, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                { title: 'Projects', value: stats?.stats.projects.total, active: stats?.stats.projects.active, icon: FiFolder, color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
                { title: 'Tasks', value: stats?.stats.tasks.total, active: stats?.stats.tasks.completed, icon: FiCheckSquare, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
                { title: 'Finance', value: `$${(stats?.stats.finance.totalIncome || 0).toLocaleString()}`, icon: FiDollarSign, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20' },
              ].map((card, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 bg-gradient-to-br ${card.color} rounded-2xl shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                      <card.icon className="text-white" size={24} />
                    </div>
                    {card.active !== undefined && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                        {card.active} active
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{card.value}</h3>
                  <p className="text-slate-500 font-bold text-sm tracking-tight">{card.title}</p>
                </div>
              ))}
            </div>

            {/* Recent Items with new Bold styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Users */}
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-lg overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl">
                      <FiUsers className="text-white" size={22} />
                    </div>
                    Recent Recruits
                  </h3>
                  <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700/30">
                  {stats?.recent.users.map((user) => (
                    <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase mb-1">Joined</p>
                        <p className="text-sm font-bold text-slate-500 italic">{brandDate(user.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700/50 shadow-lg overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 rounded-xl">
                      <FiFolder className="text-white" size={22} />
                    </div>
                    Active Frontline
                  </h3>
                  <button className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">All Operations</button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700/30">
                  {stats?.recent.projects.map((project) => (
                    <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group">
                      <div className="flex-1">
                        <p className="font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">{project.name}</p>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          project.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase mb-1">Deployed</p>
                        <p className="text-sm font-bold text-slate-500 italic">{brandDate(project.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <>
            {/* Users Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center bg-gray-50 dark:bg-slate-900/50 rounded-2xl px-4 py-2.5 min-w-[280px] border border-gray-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                    <FiSearch className="text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      placeholder="Поиск по имени или email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent border-none outline-none ml-3 w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 text-sm outline-none cursor-pointer text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    <option value="">Все роли</option>
                    {roleOptions.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={demoFilter}
                      onChange={(e) => setDemoFilter(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Только демо</span>
                  </label>

                  <button
                    onClick={() => fetchData()}
                    className="p-3 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 ml-auto lg:ml-0"
                    title="Обновить"
                  >
                    <FiRefreshCw size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-slate-700/50">
                  <span className="text-sm font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl">
                    Найдено: <span className="text-gray-900 dark:text-white">{filteredUsers.length}</span>
                  </span>
                  <button
                    onClick={() => {
                      resetCreateForm()
                      setShowCreateModal(true)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5"
                  >
                    <FiPlus size={20} />
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Пользователь</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Роль</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Модули</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Статус</th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {filteredUsers.map((user) => {
                      const roleStyle = getRoleStyle(user.role)

                      return (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold">{user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-0.5">
                                  {user.name}
                                  {user.isDemo && (
                                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] rounded-md font-bold uppercase tracking-wider">
                                      ДЕМО
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${roleStyle.color.replace('bg-', 'bg-').replace('text-', 'text-')} dark:bg-opacity-20`}>
                              {roleStyle.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              {(user.permissions || []).length > 0 ? (
                                (user.permissions || []).map((mod: string) => (
                                  <span key={mod} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] rounded-md font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                                    {permissionsList.find(m => m.key === mod)?.label || mod}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500 text-sm font-medium">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${user.isActive 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40' 
                                : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'}
                              `}
                              title={user.isActive ? 'Нажмите чтобы деактивировать' : 'Нажмите чтобы активировать'}
                            >
                              <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-500'}`} />
                              {user.isActive ? 'Активен' : 'Неактивен'}
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openPasswordModal(user)}
                                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                title="Сменить пароль"
                              >
                                <FiKey size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                title="Редактировать"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingUser(user)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                title="Удалить"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUsers size={32} className="text-gray-400 dark:text-slate-500" />
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Пользователи не найдены</p>
                          <p className="text-gray-500 dark:text-slate-400 mb-6">Измените параметры поиска или добавьте нового</p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            <FiPlus size={18} />
                            Создать пользователя
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'office' ? (
          /* Office Tab */
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                      <FiMapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    Расположение офиса
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Кликните на карту или перетащите маркер для выбора местоположения офиса.
                  </p>
                </div>
                <button
                  onClick={handleSaveOffice}
                  disabled={savingOffice}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none w-full sm:w-auto"
                >
                  <FiSave size={20} />
                  {savingOffice ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50 min-h-[400px]">
                  {officeLoaded && (
                    <OfficeMap
                      latitude={officeForm.latitude}
                      longitude={officeForm.longitude}
                      radius={officeForm.radius}
                      onLocationSelect={(lat, lng) => setOfficeForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Название офиса</label>
                    <input
                      type="text"
                      value={officeForm.name}
                      onChange={(e) => setOfficeForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                      placeholder="Главный офис"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Адрес</label>
                    <input
                      type="text"
                      value={officeForm.address}
                      onChange={(e) => setOfficeForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                      placeholder="ул. Примерная, д. 1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Широта</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={officeForm.latitude}
                        onChange={(e) => setOfficeForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Долгота</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={officeForm.longitude}
                        onChange={(e) => setOfficeForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Радиус (метры)</label>
                    <input
                      type="number"
                      value={officeForm.radius}
                      onChange={(e) => setOfficeForm(prev => ({ ...prev, radius: parseInt(e.target.value) || 100 }))}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white font-mono"
                      min="10"
                      max="1000"
                    />
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-2">
                      Сотрудники в пределах этого радиуса будут отмечены как &quot;в офисе&quot;
                    </p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Зона офиса</span>
                    </div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 leading-relaxed">
                      Радиус <strong className="font-bold">{officeForm.radius}м</strong> от маркера. Чекин в этой зоне = &quot;В офисе&quot;.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* System Tab */
          <div className="space-y-6">
            {/* System Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-5 mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <FiServer className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Сервер</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vercel Edge</p>
                  </div>
                </div>
                <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Статус</span>
                    <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">Онлайн</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Регион</span>
                    <span className="text-gray-900 dark:text-white font-bold">Global Edge</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-5 mb-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <FiDatabase className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">База данных</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Supabase Postgres</p>
                  </div>
                </div>
                <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Статус</span>
                    <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">Подключено</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Таблиц</span>
                    <span className="text-gray-900 dark:text-white font-bold text-base">9</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-5 mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <FiShield className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Аутентификация</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Supabase Auth</p>
                  </div>
                </div>
                <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Статус</span>
                    <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">Активна</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Провайдеры</span>
                    <span className="text-gray-900 dark:text-white font-bold">Email / Pass</span>
                  </div>
                </div>
              </div>
            </div>

            </div>
          )}
        </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar border border-gray-100 dark:border-slate-700/50 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-slate-700/50 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Создать пользователя</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2.5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Имя <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Иван Иванов"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Email <span className="text-indigo-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full pl-13 pr-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Пароль <span className="text-indigo-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full pl-13 pr-14 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Минимум 6 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Роль
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Modules selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                  Доступные модули
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissionsList.map((module) => (
                    <label
                      key={module.key}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${createForm.modules.includes(module.key)
                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={createForm.modules.includes(module.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateForm({ ...createForm, modules: [...createForm.modules, module.key] })
                          } else {
                            setCreateForm({ ...createForm, modules: createForm.modules.filter(m => m !== module.key) })
                          }
                        }}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                      />
                      <span className="text-sm font-bold">{module.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 px-1">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, modules: permissionsList.map(m => m.key) })}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold transition-colors"
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, modules: [] })}
                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-bold transition-colors"
                  >
                    Снять все
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl cursor-pointer transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/30">
                <input
                  type="checkbox"
                  checked={createForm.isDemo}
                  onChange={(e) => setCreateForm({ ...createForm, isDemo: e.target.checked })}
                  className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-800"
                />
                <span className="text-sm font-bold text-amber-800 dark:text-amber-400">
                  Демо аккаунт (появится на странице входа)
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-1/2 px-6 py-3.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-1/2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {saving ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar border border-gray-100 dark:border-slate-700/50 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-slate-700/50 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-10">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Редактировать {editingUser?.name}</h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2.5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Роль
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white cursor-pointer"
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                  Доступные модули
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissionsList.map((mod) => (
                    <label
                      key={mod.key}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${editForm.modules.includes(mod.key)
                        ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.modules.includes(mod.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({ ...editForm, modules: [...editForm.modules, mod.key] })
                          } else {
                            setEditForm({ ...editForm, modules: editForm.modules.filter(m => m !== mod.key) })
                          }
                        }}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                      />
                      <span className="text-sm font-bold">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors cursor-pointer ${editForm.isActive 
                  ? 'bg-green-50/50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300' 
                  : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}>
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-green-500 focus:ring-green-500 bg-white dark:bg-slate-800"
                  />
                  <span className="text-sm font-bold text-inherit">Активен</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors cursor-pointer ${editForm.isDemo 
                  ? 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-300' 
                  : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}>
                  <input
                    type="checkbox"
                    checked={editForm.isDemo}
                    onChange={(e) => setEditForm({ ...editForm, isDemo: e.target.checked })}
                    className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-800"
                  />
                  <span className="text-sm font-bold text-inherit">Демо</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-1/2 px-6 py-3.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-1/2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-md border border-gray-100 dark:border-slate-700/50 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-slate-700/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Сменить пароль</h2>
                <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 mt-1">{editingUser?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-2.5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Новый пароль
                </label>
                <div className="relative">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full pl-13 pr-14 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Минимум 6 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-13 pr-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-full sm:w-1/2 px-6 py-3.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-1/2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:transform-none"
                >
                  {saving ? 'Смена...' : 'Сменить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-red-900/20 w-full max-w-md p-8 text-center border border-gray-100 dark:border-slate-700/50 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
              <FiTrash2 className="text-red-600 dark:text-red-400" size={36} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Удалить пользователя</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
              Вы уверены, что хотите удалить <span className="font-bold text-gray-900 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-md">&quot;{deletingUser?.name}&quot;</span>?
              Это также удалит аккаунт аутентификации.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingUser(null)
                }}
                className="w-full sm:w-1/2 px-6 py-3.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={saving}
                className="w-full sm:w-1/2 px-6 py-3.5 bg-red-600 dark:bg-red-500 text-white rounded-2xl font-bold hover:bg-red-700 dark:hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20 dark:shadow-red-900/30 hover:-translate-y-0.5"
              >
                {saving ? 'Удаление...' : 'Да, Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
