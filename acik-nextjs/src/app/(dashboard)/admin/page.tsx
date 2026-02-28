'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  FiUsers, FiFolder, FiCheckSquare, FiDollarSign, FiEdit2, FiTrash2,
  FiShield, FiActivity, FiDatabase, FiServer,
  FiSearch, FiPlus, FiX, FiCheck, FiRefreshCw,
  FiSettings, FiUserPlus, FiLock, FiMail, FiEye, FiEyeOff, FiKey
} from 'react-icons/fi'

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
  }
  recent: {
    users: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>
    projects: Array<{ id: string; name: string; status: string; createdAt: string }>
  }
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
  { key: 'events.manage', label: 'Управление мероприятиями', category: 'Мероприятия' },
  { key: 'reports.view', label: 'Просмотр отчётов', category: 'Отчёты' },
  { key: 'reports.manage', label: 'Управление отчётами', category: 'Отчёты' },
  { key: 'admin.access', label: 'Доступ к админке', category: 'Админ' },
]

export default function AdminPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
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
  const [showPassword, setShowPassword] = useState(false)

  // Create form
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    department: 'Operations',
    isDemo: false,
    permissions: [] as string[],
  })

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'Member',
    department: 'Operations',
    isActive: true,
    isDemo: false,
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })

  // Permissions form
  const [permissionsForm, setPermissionsForm] = useState<string[]>([])

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

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'Member',
      department: 'Operations',
      isDemo: false,
      permissions: [],
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
        body: JSON.stringify(createForm),
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
      department: user.department || 'Operations',
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
        body: JSON.stringify(editForm),
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

  const openPermissionsModal = (user: User) => {
    setEditingUser(user)
    setPermissionsForm(user.permissions || [])
    setShowPermissionsModal(true)
  }

  const togglePermission = (key: string) => {
    if (permissionsForm.includes(key)) {
      setPermissionsForm(permissionsForm.filter(p => p !== key))
    } else {
      setPermissionsForm([...permissionsForm, key])
    }
  }

  const handleSavePermissions = async () => {
    if (!editingUser) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: permissionsForm }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Права сохранены!')
        setShowPermissionsModal(false)
        fetchData()
      } else {
        toast.error(data.message || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      toast.error('Ошибка сохранения')
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
      <div className="min-h-screen bg-gray-50">
        <Header title="Админ панель" subtitle="Доступ запрещён" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <FiShield size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Доступ запрещён</h2>
            <p className="text-red-600">У вас нет прав для доступа к админ панели.</p>
            <p className="text-red-500 text-sm mt-2">Обратитесь к администратору.</p>
          </div>
        </div>
      </div>
    )
  }

  const filteredUsers = users

  // Группировка прав по категориям
  const permissionsByCategory = permissionsList.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, typeof permissionsList>)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Админ панель" subtitle="Управление системой и пользователями" />

      <div className="p-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex gap-2">
          {[
            { id: 'overview', label: 'Обзор', icon: FiActivity },
            { id: 'users', label: 'Пользователи', icon: FiUsers },
            { id: 'system', label: 'Система', icon: FiSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">Загрузка данных...</p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                    <FiUsers className="text-white" size={24} />
                  </div>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    {stats?.stats.users.active || 0} активных
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.stats.users.total || 0}</h3>
                <p className="text-gray-500 text-sm">Пользователей</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-200">
                    <FiFolder className="text-white" size={24} />
                  </div>
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {stats?.stats.projects.active || 0} активных
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.stats.projects.total || 0}</h3>
                <p className="text-gray-500 text-sm">Проектов</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-200">
                    <FiCheckSquare className="text-white" size={24} />
                  </div>
                  <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                    {stats?.stats.tasks.completed || 0} завершено
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.stats.tasks.total || 0}</h3>
                <p className="text-gray-500 text-sm">Задач</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-200">
                    <FiDollarSign className="text-white" size={24} />
                  </div>
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                    Доход
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  ${(stats?.stats.finance.totalIncome || 0).toLocaleString()}
                </h3>
                <p className="text-gray-500 text-sm">Общий доход</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FiUserPlus className="text-indigo-600" size={20} />
                    Новые пользователи
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {stats?.recent.users.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Нет пользователей</div>
                  ) : (
                    stats?.recent.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-medium">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleStyle(user.role).color}`}>
                              {getRoleStyle(user.role).label}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FiFolder className="text-green-600" size={20} />
                    Последние проекты
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {stats?.recent.projects.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Нет проектов</div>
                  ) : (
                    stats?.recent.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            project.status === 'Active' ? 'bg-green-100 text-green-700' :
                            project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {project.status === 'Active' ? 'Активный' :
                             project.status === 'Completed' ? 'Завершён' : project.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'users' ? (
          <>
            {/* Users Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 min-w-[250px]">
                    <FiSearch className="text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Поиск по имени или email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option value="">Все роли</option>
                    {roleOptions.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={demoFilter}
                      onChange={(e) => setDemoFilter(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Только демо</span>
                  </label>

                  <button
                    onClick={() => fetchData()}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Обновить"
                  >
                    <FiRefreshCw size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Найдено: {filteredUsers.length}
                  </span>
                  <button
                    onClick={() => {
                      resetCreateForm()
                      setShowCreateModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    <FiPlus size={18} />
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Пользователь</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Роль</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Отдел</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Статус</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Права</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleStyle = getRoleStyle(user.role)

                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-medium">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                {user.name}
                                {user.isDemo && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                    ДЕМО
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyle.color}`}>
                            {roleStyle.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {departmentOptions.find(d => d.value === user.department)?.label || user.department || '—'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.isActive ? <FiCheck size={12} /> : <FiX size={12} />}
                            {user.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                          >
                            <FiShield size={14} />
                            {(user.permissions || []).length} прав
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openPasswordModal(user)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Сменить пароль"
                            >
                              <FiKey size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`p-2 rounded-lg transition-all ${
                                user.isActive
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Деактивировать' : 'Активировать'}
                            >
                              {user.isActive ? <FiLock size={16} /> : <FiCheck size={16} />}
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Редактировать"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingUser(user)
                                setShowDeleteModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Удалить"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Пользователи не найдены</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Добавить первого пользователя
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* System Tab */
          <div className="space-y-6">
            {/* System Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FiServer className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Сервер</h3>
                    <p className="text-sm text-gray-500">Vercel Edge</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Статус</span>
                    <span className="text-green-600 font-medium">Онлайн</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Регион</span>
                    <span className="text-gray-900">Global Edge</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FiDatabase className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">База данных</h3>
                    <p className="text-sm text-gray-500">Supabase Postgres</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Статус</span>
                    <span className="text-green-600 font-medium">Подключено</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Таблиц</span>
                    <span className="text-gray-900">9</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FiShield className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Аутентификация</h3>
                    <p className="text-sm text-gray-500">Supabase Auth</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Статус</span>
                    <span className="text-green-600 font-medium">Активна</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Провайдеры</span>
                    <span className="text-gray-900">Email/Пароль</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Технологии</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Next.js 15', color: 'bg-black text-white' },
                  { name: 'React 19', color: 'bg-cyan-500 text-white' },
                  { name: 'TypeScript', color: 'bg-blue-600 text-white' },
                  { name: 'Supabase', color: 'bg-green-600 text-white' },
                  { name: 'Prisma', color: 'bg-gray-800 text-white' },
                  { name: 'Tailwind CSS', color: 'bg-sky-500 text-white' },
                ].map((tech) => (
                  <div key={tech.name} className={`${tech.color} rounded-xl p-4 text-center font-medium`}>
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Info */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Окружение</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/60 text-sm">Node.js</p>
                  <p className="font-semibold">v22+</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/60 text-sm">Платформа</p>
                  <p className="font-semibold">Vercel</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/60 text-sm">База данных</p>
                  <p className="font-semibold">Supabase</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/60 text-sm">Сборка</p>
                  <p className="font-semibold">Production</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Создать пользователя</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Иван Иванов"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Минимум 6 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {roleOptions.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отдел
                  </label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {departmentOptions.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions/Modules selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Модули доступа
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="mb-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{category}</div>
                      <div className="grid grid-cols-2 gap-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.key}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-all ${
                              createForm.permissions.includes(perm.key)
                                ? 'bg-indigo-100 border border-indigo-500'
                                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={createForm.permissions.includes(perm.key)}
                              onChange={() => {
                                if (createForm.permissions.includes(perm.key)) {
                                  setCreateForm({ ...createForm, permissions: createForm.permissions.filter(p => p !== perm.key) })
                                } else {
                                  setCreateForm({ ...createForm, permissions: [...createForm.permissions, perm.key] })
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, permissions: permissionsList.map(p => p.key) })}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, permissions: [] })}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Сбросить
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isDemo"
                  checked={createForm.isDemo}
                  onChange={(e) => setCreateForm({ ...createForm, isDemo: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="isDemo" className="text-sm font-medium text-gray-700">
                  Демо аккаунт (появится на странице входа)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Редактировать</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Роль
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {roleOptions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Отдел
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {departmentOptions.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Активен</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isDemo}
                    onChange={(e) => setEditForm({ ...editForm, isDemo: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Демо</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Сменить пароль</h2>
                <p className="text-sm text-gray-500">{editingUser.name}</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новый пароль
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Минимум 6 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Смена...' : 'Сменить пароль'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Права доступа</h2>
                <p className="text-sm text-gray-500">{editingUser.name} ({editingUser.email})</p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          permissionsForm.includes(perm.key)
                            ? 'bg-indigo-100 border-2 border-indigo-500'
                            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={permissionsForm.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setPermissionsForm([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Снять все
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionsForm(permissionsList.map(p => p.key))}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Выбрать все
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : `Сохранить (${permissionsForm.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Удалить пользователя</h3>
              <p className="text-gray-500 mb-6">
                Вы уверены, что хотите удалить <span className="font-medium text-gray-900">&quot;{deletingUser.name}&quot;</span>?
                Это также удалит аккаунт аутентификации.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingUser(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
