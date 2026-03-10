'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import {
  FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiEdit2, FiTrash2, FiX,
  FiCalendar, FiDollarSign, FiUsers, FiCheckCircle, FiClock, FiMoreVertical
} from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

interface Project {
  id: string
  name: string
  description: string | null
  category: string
  status: string
  priority: string
  progress: number
  startDate: string
  endDate: string | null
  budgetAllocated: number
  budgetSpent: number
  tags: string[]
  manager?: { id: string; name: string; email: string; avatar: string | null }
  taskCount?: number
  completedTasks?: number
}

export default function ProjectsPage() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budgetAllocated: '',
  })

  const canManage = profile && ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager'].includes(profile.role)

  useEffect(() => {
    fetchProjects()
  }, [statusFilter])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/projects?${params}`)
      const data = await res.json()
      if (data.success) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budgetAllocated: formData.budgetAllocated ? parseFloat(formData.budgetAllocated) : 0,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingProject ? 'Project updated successfully!' : 'Project created successfully!')
        setShowModal(false)
        resetForm()
        fetchProjects()
      } else {
        toast.error(data.message || 'Failed to save project')
      }
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Project deleted successfully!')
        setShowDeleteConfirm(null)
        fetchProjects()
      } else {
        toast.error(data.message || 'Failed to delete project')
      }
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Technology',
      status: 'Planning',
      priority: 'Medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budgetAllocated: '',
    })
    setEditingProject(null)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      category: project.category,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
      budgetAllocated: project.budgetAllocated?.toString() || '',
    })
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Planning': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'OnHold': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-amber-500'
    return 'bg-gray-400'
  }

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        title="Projects"
        subtitle="Manage and track all your projects"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FiGrid className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Total Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalBudget.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Total Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <FiSearch className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
                  className="bg-transparent border-none outline-none ml-2 w-48 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                <option value="">All Status</option>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2.5 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  <FiList size={18} />
                </button>
              </div>

              {/* Add Button */}
              {canManage && (
                <button
                  onClick={() => { resetForm(); setShowModal(true) }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-medium"
                >
                  <FiPlus size={18} />
                  <span>New Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGrid className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Get started by creating your first project</p>
            {canManage && (
              <button
                onClick={() => { resetForm(); setShowModal(true) }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                <FiPlus size={18} />
                Create Project
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-100 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  {canManage && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{project.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[40px]">{project.description || 'No description'}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-slate-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(project.progress || 0)}`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <FiCalendar size={14} />
                    <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                  {project.budgetAllocated > 0 && (
                    <div className="flex items-center gap-1">
                      <FiDollarSign size={14} />
                      <span>${project.budgetAllocated.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {project.manager && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {project.manager.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{project.manager.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                    <FiCheckCircle size={14} />
                    <span className="text-sm">{project.completedTasks || 0}/{project.taskCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Manager</th>
                  {canManage && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{project.name}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{project.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{project.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getProgressColor(project.progress || 0)}`}
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">${(project.budgetAllocated || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {project.manager && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {project.manager.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{project.manager.name}</span>
                        </div>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(project.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Fill in the details below</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Describe your project"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Events">Events</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budgetAllocated}
                    onChange={(e) => setFormData({ ...formData, budgetAllocated: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-200"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 className="text-red-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Project?</h3>
            <p className="text-gray-500 dark:text-slate-400 text-center mb-8">This action cannot be undone. All tasks associated with this project will also be deleted.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
