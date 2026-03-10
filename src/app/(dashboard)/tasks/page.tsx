'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  FiPlus, FiSearch, FiX, FiCalendar, FiUser, FiFlag, FiFolder,
  FiMoreVertical, FiEdit2, FiTrash2, FiCheckCircle, FiClock,
  FiAlertCircle, FiList, FiGrid, FiChevronDown
} from 'react-icons/fi'

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  avatar?: string
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
  project?: Project
  assignedTo?: User
  createdAt: string
}

const statusColumns = [
  { key: 'TODO', label: 'To Do', color: 'bg-gray-100', headerColor: 'bg-gray-500', icon: FiList },
  { key: 'InProgress', label: 'In Progress', color: 'bg-blue-50', headerColor: 'bg-blue-500', icon: FiClock },
  { key: 'Review', label: 'Review', color: 'bg-purple-50', headerColor: 'bg-purple-500', icon: FiCheckCircle },
  { key: 'Done', label: 'Done', color: 'bg-green-50', headerColor: 'bg-green-500', icon: FiCheckCircle },
]

const priorityOptions = [
  { value: 'Low', label: 'Low', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { value: 'High', label: 'High', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { value: 'Critical', label: 'Critical', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
]

export default function TasksPage() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

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
  })

  const canManage = profile?.role && ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager'].includes(profile.role)

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (projectFilter) params.append('projectId', projectFilter)
      if (priorityFilter) params.append('priority', priorityFilter)

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
  }, [search, projectFilter, priorityFilter])

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
  }, [search, projectFilter, priorityFilter]) // eslint-disable-line react-hooks/exhaustive-deps

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

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 bg-red-50' }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600 bg-orange-50' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600 bg-yellow-50' }
    return {
      text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-gray-600 bg-gray-50'
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
    <div className="min-h-screen bg-gray-50">
      <Header title="Tasks" subtitle="Manage and track all your tasks" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <FiList className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-xl">
                <FiClock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
                <p className="text-sm text-gray-500">To Do</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FiClock className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <FiCheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <FiAlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 min-w-[200px]">
                <FiSearch className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                />
              </div>

              {/* Project Filter */}
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => openCreateModal()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-200"
              >
                <FiPlus size={18} />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">Loading tasks...</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map(column => (
              <div key={column.key} className={`${column.color} rounded-2xl p-4 min-h-[500px]`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${column.headerColor} rounded-full`} />
                    <h3 className="font-semibold text-gray-700">{column.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-lg">
                      {groupedTasks[column.key]?.length || 0}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => openCreateModal(column.key as Task['status'])}
                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
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

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
                        onClick={() => canManage && openEditModal(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle.color}`}>
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
                                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[160px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openEditModal(task)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <FiEdit2 size={14} />
                                    Edit Task
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <div className="px-4 py-1 text-xs text-gray-400 uppercase">Move to</div>
                                  {statusColumns.filter(c => c.key !== task.status).map(col => (
                                    <button
                                      key={col.key}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusChange(task, col.key as Task['status'])
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <div className={`w-2 h-2 ${col.headerColor} rounded-full`} />
                                      {col.label}
                                    </button>
                                  ))}
                                  <div className="border-t border-gray-100 my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDeletingTask(task)
                                      setShowDeleteModal(true)
                                      setOpenDropdown(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <FiTrash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>

                        {task.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            {task.project && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                <FiFolder size={12} />
                                {task.project.name.substring(0, 12)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {dateInfo && (
                              <span className={`text-xs px-2 py-1 rounded-lg ${dateInfo.color}`}>
                                {dateInfo.text}
                              </span>
                            )}
                            {task.assignedTo ? (
                              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center" title={task.assignedTo.name}>
                                <span className="text-xs font-medium text-white">
                                  {task.assignedTo.name.charAt(0)}
                                </span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <FiUser className="text-gray-400" size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {(!groupedTasks[column.key] || groupedTasks[column.key].length === 0) && (
                    <div className="text-center py-12 text-gray-400">
                      <FiList size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks</p>
                      {canManage && (
                        <button
                          onClick={() => openCreateModal(column.key as Task['status'])}
                          className="mt-2 text-xs text-indigo-600 hover:underline"
                        >
                          Add a task
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Task</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Project</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Assignee</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Due Date</th>
                  {canManage && <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const dateInfo = formatDate(task.dueDate)
                  const priorityStyle = getPriorityStyle(task.priority)
                  const statusCol = statusColumns.find(c => c.key === task.status)

                  return (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {task.project ? (
                          <span className="text-sm text-gray-600">{task.project.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusCol?.color || 'bg-gray-100'}`}>
                          <div className={`w-2 h-2 ${statusCol?.headerColor || 'bg-gray-500'} rounded-full`} />
                          {statusCol?.label || task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyle.color}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">{task.assignedTo.name.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {dateInfo ? (
                          <span className={`text-xs px-2 py-1 rounded-lg ${dateInfo.color}`}>{dateInfo.text}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingTask(task)
                                setShowDeleteModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                      <p className="text-gray-500">No tasks found</p>
                      {canManage && (
                        <button
                          onClick={() => openCreateModal()}
                          className="mt-4 text-indigo-600 hover:underline"
                        >
                          Create your first task
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
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
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the task..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFolder className="inline mr-2" size={14} />
                    Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">No project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" size={14} />
                    Assignee
                  </label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
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
                    Priority
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
                  Due Date
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Task</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{deletingTask.title}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingTask(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete'}
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
