'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { toast } from 'react-toastify'
import {
  FiPlus, FiSearch, FiX, FiCalendar, FiUser, FiFlag, FiFolder,
  FiMoreVertical, FiEdit2, FiTrash2, FiCheckCircle, FiClock,
  FiAlertCircle, FiList, FiGrid, FiChevronDown
} from 'react-icons/fi'
import UserPicker from './UserPicker'

interface Project {
  id: string
  name: string
}

interface User {
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

interface TaskStage {
  id: string
  title: string
  isCompleted: boolean
  order: number
}

interface CoExecutor {
  userId: string
  user: User
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'InProgress' | 'Review' | 'Done' | 'Blocked'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate?: string
  projectId?: string
  assignedToId?: string
  reviewerId?: string
  parentId?: string
  isApprovalRequired: boolean
  approvedAt?: string
  project?: Project
  assignedTo?: User
  reviewer?: User
  coExecutors?: CoExecutor[]
  stages?: TaskStage[]
  subtasks?: Task[]
  parent?: { id: string, title: string }
  createdAt: string
  _count?: {
    subtasks: number
    stages: number
  }
}

// Statuses and Priorities are now dynamic inside the component

export default function TasksPage() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()

  const statusColumns = useMemo(() => [
    { key: 'TODO', label: t('tasks', 'todo'), color: 'bg-gray-50/50 dark:bg-slate-800/50', headerColor: 'bg-gray-500 dark:bg-slate-400', icon: FiList },
    { key: 'InProgress', label: t('tasks', 'inProgress'), color: 'bg-blue-50/50 dark:bg-blue-900/20', headerColor: 'bg-blue-500 dark:bg-blue-400', icon: FiClock },
    { key: 'Review', label: t('tasks', 'review'), color: 'bg-purple-50/50 dark:bg-purple-900/20', headerColor: 'bg-purple-500 dark:bg-purple-400', icon: FiCheckCircle },
    { key: 'Done', label: t('tasks', 'done'), color: 'bg-emerald-50/50 dark:bg-emerald-900/20', headerColor: 'bg-emerald-500 dark:bg-emerald-400', icon: FiCheckCircle },
  ], [t])

  const priorityOptions = useMemo(() => [
    { value: 'Low', label: t('tasks', 'priorityLow'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
    { value: 'Medium', label: t('tasks', 'priorityMedium'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' },
    { value: 'High', label: t('tasks', 'priorityHigh'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
    { value: 'Critical', label: t('tasks', 'priorityUrgent'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  ], [t])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [activeTab, setActiveTab] = useState<'my' | 'assignedByMe' | 'all'>('my')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as Task['status'],
    priority: 'Medium' as Task['priority'],
    dueDate: '',
    projectId: '',
    assignedToId: '',
    reviewerId: '',
    isApprovalRequired: false,
    parentId: '',
    coExecutors: [] as string[],
    stages: [] as { title: string, isCompleted: boolean }[],
  })

  const canManage = profile?.role && ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager'].includes(profile.role)

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (projectFilter) params.append('projectId', projectFilter)
      if (priorityFilter) params.append('priority', priorityFilter)

      if (activeTab === 'my') {
        params.append('my', 'true')
      } else if (activeTab === 'assignedByMe' && profile?.id) {
        params.append('createdBy', profile.id)
      }

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      if (data.success) {
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [search, projectFilter, priorityFilter, activeTab, profile?.id])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.success) {
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Initial load — parallel fetch
  useEffect(() => {
    Promise.all([fetchTasks(), fetchProjects(), fetchUsers()])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced refetch on filter changes
  useEffect(() => {
    if (!loading) {
      const debounce = setTimeout(() => {
        fetchTasks()
      }, 300)
      return () => clearTimeout(debounce)
    }
  }, [search, projectFilter, priorityFilter, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreateModal = (status?: Task['status']) => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      status: status || 'TODO',
      priority: 'Medium',
      dueDate: '',
      projectId: '',
      assignedToId: '',
      reviewerId: '',
      isApprovalRequired: false,
      parentId: '',
      coExecutors: [],
      stages: [],
    })
    setShowModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId || '',
      assignedToId: task.assignedToId || '',
      reviewerId: task.reviewerId || '',
      isApprovalRequired: task.isApprovalRequired || false,
      parentId: task.parentId || '',
      coExecutors: task.coExecutors?.map(ce => ce.userId) || [],
      stages: task.stages?.map(s => ({ title: s.title, isCompleted: s.isCompleted })) || [],
    })
    setShowModal(true)
    setOpenDropdown(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setSaving(true)
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
          projectId: formData.projectId || null,
          assignedToId: formData.assignedToId || null,
          reviewerId: formData.reviewerId || null,
          parentId: formData.parentId || null,
          createdById: profile?.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingTask ? 'Task updated!' : 'Task created!')
        setShowModal(false)
        fetchTasks()
      } else {
        toast.error(data.message || 'Failed to save task')
      }
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTask) return

    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Task deleted!')
        setShowDeleteModal(false)
        setDeletingTask(null)
        fetchTasks()
      } else {
        toast.error(data.message || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Task moved to ${newStatus}`)
        fetchTasks()
      } else {
        toast.error(data.message || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
    setOpenDropdown(null)
  }

  const getPriorityStyle = (priority: string) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1]
  }

  const formatDate = (date?: string) => {
    if (!date) return null
    const d = new Date(date)
    const today = new Date()
    const diffTime = d.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: t('tasks', 'overdueTasks'), color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' }
    if (diffDays === 0) return { text: t('tasks', 'dueToday'), color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' }
    if (diffDays === 1) return { text: t('tasks', 'dueTomorrow'), color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' }
    return {
      text: d.toLocaleDateString(t('common', 'language') === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' }),
      color: 'text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50'
    }
  }

  const groupedTasks = statusColumns.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key)
    return acc
  }, {} as Record<string, Task[]>)

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'InProgress').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate) return false
      return new Date(t.dueDate) < new Date() && t.status !== 'Done'
    }).length,
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header title={t('tasks', 'title')} subtitle={t('tasks', 'subtitle')} />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                <FiList className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'totalTasks')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                <FiClock className="text-gray-600 dark:text-slate-400" size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.todo}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'todo')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                <FiClock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.inProgress}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'inProgress')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.done}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'completedTasks')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.overdue}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'overdueTasks')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'my'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            {t('tasks', 'myTasksTab')}
          </button>
          <button
            onClick={() => setActiveTab('assignedByMe')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'assignedByMe'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            {t('tasks', 'assignedByMeTab')}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            {t('tasks', 'allTasksTab')}
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="flex-1 lg:flex-none flex items-center bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all min-w-[200px]">
                <FiSearch className="text-gray-400 dark:text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={t('tasks', 'searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Project Filter */}
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">{t('tasks', 'allProjects')}</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">{t('tasks', 'allPriorities')}</option>
                {priorityOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-700/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white'}`}
                >
                  <FiList size={18} />
                </button>
              </div>

              {canManage && (
                <button
                  onClick={() => openCreateModal()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 font-medium"
                >
                  <FiPlus size={18} />
                  <span className="hidden sm:inline">{t('tasks', 'newTask')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">{t('tasks', 'loadingTasks')}</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map(column => (
              <div key={column.key} className={`${column.color} rounded-3xl p-5 min-h-[500px] border border-transparent dark:border-slate-700/30`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${column.headerColor} rounded-full`} />
                    <h3 className="font-semibold text-gray-700 dark:text-slate-300">{column.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                      {groupedTasks[column.key]?.length || 0}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => openCreateModal(column.key as Task['status'])}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <FiPlus size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {groupedTasks[column.key]?.map(task => {
                    const dateInfo = formatDate(task.dueDate)
                    const priorityStyle = getPriorityStyle(task.priority)

                    return (                      <div
                        key={task.id}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.1)] hover:shadow-xl dark:hover:shadow-indigo-900/30 transition-all cursor-pointer border ${task.status === 'Review' ? 'border-purple-400 dark:border-purple-500/50 ring-2 ring-purple-400/10' : 'border-gray-100 dark:border-slate-700/50'} hover:-translate-y-1 group relative overflow-hidden`}
                        onClick={() => canManage && openEditModal(task)}
                      >
                        {/* Review Badge */}
                        {task.status === 'Review' && (
                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-500 text-[10px] font-bold text-white uppercase tracking-tighter rounded-bl-lg animate-pulse">
                            {t('tasks', 'reviewNeeded')}
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${priorityStyle.color}`}>
                            {task.priority}
                          </span>

                          {canManage && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenDropdown(openDropdown === task.id ? null : task.id)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <FiMoreVertical size={16} />
                              </button>

                              {openDropdown === task.id && (
                                <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-20 min-w-[160px] animate-in zoom-in-95">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openEditModal(task)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <FiEdit2 size={14} />
                                    {t('tasks', 'editTask')}
                                  </button>
                                  <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                                  <div className="px-4 py-1 text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">{t('tasks', 'moveTo')}</div>
                                  {statusColumns.filter(c => c.key !== task.status).map(col => (
                                    <button
                                      key={col.key}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusChange(task, col.key as Task['status'])
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                      <div className={`w-2 h-2 ${col.headerColor} rounded-full`} />
                                      {col.label}
                                    </button>
                                  ))}
                                  <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDeletingTask(task)
                                      setShowDeleteModal(true)
                                      setOpenDropdown(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 font-medium"
                                  >
                                    <FiTrash2 size={14} />
                                    {t('common', 'delete')}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                        )}

                        {/* Progress Infographic */}
                        {(task._count?.stages || 0) > 0 && (
                          <div className="mb-4">
                             <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                              <span>{t('common', 'progress')}</span>
                              <span>{Math.round(((task.stages?.filter(s => s.isCompleted).length || 0) / (task.stages?.length || 1)) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5">
                              {task.stages?.map((stage, idx) => (
                                <div 
                                  key={idx} 
                                  className={`h-full flex-1 transition-all duration-500 ${stage.isCompleted ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-gray-200 dark:bg-slate-600'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-2">
                            {task.project && (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/50 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/30 uppercase tracking-tight">
                                <FiFolder size={10} className="text-gray-400" />
                                {task.project.name.substring(0, 15)}
                              </span>
                            )}
                            {task._count?.subtasks !== undefined && task._count.subtasks > 0 && (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                               <FiList size={10} />
                               {task._count.subtasks}
                             </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {dateInfo && (
                              <span className={`text-[10px] font-bold px-2 py-1.5 rounded-lg uppercase tracking-tight ${dateInfo.color}`}>
                                {dateInfo.text}
                              </span>
                            )}
                            
                            <div className="flex -space-x-2">
                                {/* Assignee */}
                                {task.assignedTo ? (
                                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm relative z-10" title={`${t('tasks', 'assignedTo')}: ${task.assignedTo.name}`}>
                                    <span className="text-[10px] font-black text-white">{task.assignedTo.name.charAt(0)}</span>
                                </div>
                                ) : (
                                <div className="w-7 h-7 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800" title={t('tasks', 'unassigned')}>
                                    <FiUser className="text-gray-400 dark:text-slate-500" size={12} />
                                </div>
                                )}

                                {/* Co-executors */}
                                {task.coExecutors?.slice(0, 2).map((ce, idx) => (
                                    <div key={idx} className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm relative z-0" title={`${t('tasks', 'coExecutors')}: ${ce.user.name}`}>
                                        <span className="text-[10px] font-black text-white">{ce.user.name.charAt(0)}</span>
                                    </div>
                                ))}

                                {task.coExecutors && task.coExecutors.length > 2 && (
                                    <div className="w-7 h-7 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm relative z-0">
                                        <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300">+{task.coExecutors.length - 2}</span>
                                    </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>

                    )
                  })}

                  {(!groupedTasks[column.key] || groupedTasks[column.key].length === 0) && (
                    <div className="text-center py-12 text-gray-400">
                      <FiList size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('tasks', 'noTasks')}</p>
                      {canManage && (
                        <button
                          onClick={() => openCreateModal(column.key as Task['status'])}
                          className="mt-2 text-xs text-indigo-600 hover:underline"
                        >
                          + {t('common', 'add')} {t('tasks', 'title').toLowerCase()}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'taskTitle')}</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'project')}</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'status')}</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'priority')}</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('tasks', 'assignedTo')}</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'deadline')}</th>
                    {canManage && <th className="text-right py-4 px-6 text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('common', 'actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {tasks.map(task => {
                    const dateInfo = formatDate(task.dueDate)
                    const priorityStyle = getPriorityStyle(task.priority)
                    const statusCol = statusColumns.find(c => c.key === task.status)

                    return (
                      <tr key={task.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors group ${task.status === 'Review' ? 'bg-purple-50/20 dark:bg-purple-900/10' : ''}`}>
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                {task.status === 'Review' && (
                                    <span className="px-1.5 py-0.5 bg-purple-500 text-[8px] font-black text-white uppercase rounded-md tracking-tighter">{t('tasks', 'review')}</span>
                                )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-400 dark:text-slate-500 line-clamp-1 italic">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {task.project ? (
                            <span className="text-xs font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg uppercase tracking-wider">{task.project.name}</span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                           <div className="space-y-1.5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusCol?.color || 'bg-gray-100'}`}>
                                    <div className={`w-2 h-2 ${statusCol?.headerColor || 'bg-gray-500'} rounded-full`} />
                                    {statusCol?.label || task.status}
                                </span>
                                {(task._count?.stages || 0) > 0 && (
                                    <div className="w-24 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                        {task.stages?.map((s, idx) => (
                                            <div key={idx} className={`h-full flex-1 ${s.isCompleted ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-600'}`} />
                                        ))}
                                    </div>
                                )}
                           </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${priorityStyle.color}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex -space-x-2">
                                {task.assignedTo && (
                                    <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm z-10" title={`Assignee: ${task.assignedTo.name}`}>
                                        <span className="text-[10px] font-bold text-white uppercase">{task.assignedTo.name.charAt(0)}</span>
                                    </div>
                                )}
                                {task.coExecutors?.slice(0, 2).map((ce, idx) => (
                                    <div key={idx} className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm" title={`Co-executor: ${ce.user.name}`}>
                                        <span className="text-[10px] font-bold text-white uppercase">{ce.user.name.charAt(0)}</span>
                                    </div>
                                ))}
                           </div>
                        </td>
                        <td className="py-4 px-6">
                          {dateInfo ? (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tight ${dateInfo.color}`}>{dateInfo.text}</span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        {canManage && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingTask(task)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 7 : 6} className="py-20 text-center">
                        <FiList size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">{t('tasks', 'noTasks')}</p>
                        {canManage && (
                          <button
                            onClick={() => openCreateModal()}
                            className="mt-4 text-indigo-600 hover:underline"
                          >
                            {t('tasks', 'createFirst')}
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTask ? t('tasks', 'editTask') : t('tasks', 'newTask')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tasks', 'taskTitle')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder={t('tasks', 'enterTaskTitle')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common', 'description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder={t('tasks', 'describeTask')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFolder className="inline mr-2" size={14} />
                  {t('tasks', 'project')}
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  <option value="">{t('tasks', 'noProject')}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <FiUser className="inline mr-2 text-indigo-500" size={14} />
                  {t('tasks', 'assignedTo')}
                </label>
                <UserPicker
                  users={users}
                  value={formData.assignedToId}
                  onChange={(id) => setFormData({ ...formData, assignedToId: id })}
                  placeholder={t('tasks', 'unassigned')}
                  language={language}
                  showWorkload
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <FiCheckCircle className="inline mr-2 text-blue-500" size={14} />
                  {t('tasks', 'reviewer')}
                </label>
                <UserPicker
                  users={users}
                  value={formData.reviewerId}
                  onChange={(id) => setFormData({ ...formData, reviewerId: id })}
                  placeholder={t('tasks', 'noReviewer')}
                  language={language}
                  showWorkload={false}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isApprovalRequired"
                  checked={formData.isApprovalRequired}
                  onChange={(e) => setFormData({ ...formData, isApprovalRequired: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isApprovalRequired" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                  {t('tasks', 'mandatoryConfirmation')}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <FiFolder className="inline mr-2 text-purple-500" size={14} />
                  {t('tasks', 'parentTask')}
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  <option value="">{t('tasks', 'topLevelTask')}</option>
                  {tasks.filter(t => t.id !== editingTask?.id && !t.parentId).map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  {t('tasks', 'coExecutors')}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.coExecutors.map(userId => {
                    const u = users.find(user => user.id === userId)
                    return (
                      <span key={userId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                        {u?.name || 'User'}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coExecutors: formData.coExecutors.filter(id => id !== userId) })}
                          className="hover:text-red-500 ml-1"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    )
                  })}
                  <select
                    onChange={(e) => {
                      if (e.target.value && !formData.coExecutors.includes(e.target.value)) {
                        setFormData({ ...formData, coExecutors: [...formData.coExecutors, e.target.value] })
                      }
                      e.target.value = ''
                    }}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">+ {t('common', 'add')} {t('tasks', 'coExecutors')}</option>
                    {users.filter(u => u.id !== formData.assignedToId && !formData.coExecutors.includes(u.id)).map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                  <span>{t('tasks', 'taskStages')}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stages: [...formData.stages, { title: '', isCompleted: false }] })}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    <FiPlus size={12} /> {t('tasks', 'addStage')}
                  </button>
                </label>
                <div className="space-y-3">
                  {formData.stages.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                       <input
                        type="checkbox"
                        checked={stage.isCompleted}
                        onChange={(e) => {
                          const newStages = [...formData.stages]
                          newStages[index].isCompleted = e.target.checked
                          setFormData({ ...formData, stages: newStages })
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={stage.title}
                        onChange={(e) => {
                          const newStages = [...formData.stages]
                          newStages[index].title = e.target.value
                          setFormData({ ...formData, stages: newStages })
                        }}
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={t('tasks', 'stageTitle')}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, stages: formData.stages.filter((_, i) => i !== index) })}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.stages.length === 0 && (
                    <p className="text-xs text-center py-4 text-gray-400 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                      —
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common', 'status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {statusColumns.map(col => (
                      <option key={col.key} value={col.key}>{col.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFlag className="inline mr-2" size={14} />
                    {t('common', 'priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {priorityOptions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" size={14} />
                  {t('common', 'deadline')}
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  {t('common', 'cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t('common', 'loading') : editingTask ? t('common', 'save') : t('common', 'create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="text-red-600 dark:text-red-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('tasks', 'deleteConfirmTitle')}</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-8">
                {t('tasks', 'deleteConfirmText')} <span className="font-semibold text-gray-900 dark:text-white">&quot;{deletingTask?.title}&quot;</span>?
                {t('tasks', 'actionUndone')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingTask(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  {t('common', 'cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {saving ? t('common', 'loading') : t('common', 'delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside dropdown to close */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  )
}
