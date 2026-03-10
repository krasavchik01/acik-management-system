'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import Link from 'next/link'
import {
  FiFolder, FiCheckSquare, FiUsers, FiDollarSign, FiTrendingUp,
  FiCalendar, FiClock, FiActivity, FiPieChart, FiBarChart2,
  FiArrowRight, FiPlus, FiStar, FiAward, FiTarget, FiZap
} from 'react-icons/fi'

interface Stats {
  projects: {
    total: number
    active: number
    completed: number
    onHold: number
  }
  tasks: {
    total: number
    todo: number
    inProgress: number
    done: number
    overdue: number
  }
  members: {
    total: number
    active: number
    diamond: number
    platinum: number
  }
  finance: {
    totalBudget: number
    totalSpent: number
    balance: number
  }
}

interface RecentProject {
  id: string
  name: string
  status: string
  progress: number
  dueDate?: string
}

interface RecentTask {
  id: string
  title: string
  status: string
  priority: string
  project?: { name: string }
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { language, t } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, membersRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/members'),
        fetch('/api/tasks'),
      ])

      const projectsData = await projectsRes.json()
      const membersData = await membersRes.json()
      const tasksData = await tasksRes.json()

      const projects = projectsData.data || []
      const members = membersData.data || []
      const tasks = tasksData.data || []

      // Calculate stats
      setStats({
        projects: {
          total: projects.length,
          active: projects.filter((p: RecentProject) => p.status === 'Active').length,
          completed: projects.filter((p: RecentProject) => p.status === 'Completed').length,
          onHold: projects.filter((p: RecentProject) => p.status === 'OnHold').length,
        },
        tasks: {
          total: tasks.length,
          todo: tasks.filter((t: RecentTask) => t.status === 'TODO').length,
          inProgress: tasks.filter((t: RecentTask) => t.status === 'InProgress').length,
          done: tasks.filter((t: RecentTask) => t.status === 'Done').length,
          overdue: tasks.filter((t: { dueDate?: string; status: string }) => {
            if (!t.dueDate) return false
            return new Date(t.dueDate) < new Date() && t.status !== 'Done'
          }).length,
        },
        members: {
          total: members.length,
          active: members.filter((m: { status: string }) => m.status === 'Active').length,
          diamond: members.filter((m: { category: string }) => m.category === 'Diamond').length,
          platinum: members.filter((m: { category: string }) => m.category === 'Platinum').length,
        },
        finance: {
          totalBudget: projects.reduce((sum: number, p: { budget?: number }) => sum + (p.budget || 0), 0),
          totalSpent: projects.reduce((sum: number, p: { spent?: number }) => sum + (p.spent || 0), 0),
          balance: projects.reduce((sum: number, p: { budget?: number; spent?: number }) => sum + ((p.budget || 0) - (p.spent || 0)), 0),
        },
      })

      // Get recent items
      setRecentProjects(projects.slice(0, 5).map((p: { id: string; name: string; status: string }) => ({
        ...p,
        progress: Math.floor(Math.random() * 100),
      })))
      setRecentTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (language === 'ru') {
      if (hour < 12) return 'Доброе утро'
      if (hour < 18) return 'Добрый день'
      return 'Добрый вечер'
    }
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
      case 'Completed': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
      case 'OnHold': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
      case 'TODO': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      case 'InProgress': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
      case 'Done': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
      case 'High': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
      case 'Low': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate task completion percentage
  const taskCompletionRate = stats?.tasks.total
    ? Math.round((stats.tasks.done / stats.tasks.total) * 100)
    : 0

  // Calculate project progress
  const projectCompletionRate = stats?.projects.total
    ? Math.round((stats.projects.completed / stats.projects.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        title={`${getGreeting()}, ${profile?.name?.split(' ')[0] || 'User'}!`}
        subtitle={new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Projects Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                <FiFolder className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                <FiTrendingUp size={16} />
                <span>{stats?.projects.active || 0} {language === 'ru' ? 'активных' : 'active'}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats?.projects.total || 0}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('dashboard', 'activeProjects')}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>{stats?.projects.completed || 0} {language === 'ru' ? 'завершено' : 'completed'}</span>
                <span>{stats?.projects.onHold || 0} {language === 'ru' ? 'на паузе' : 'on hold'}</span>
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/30">
                <FiCheckSquare className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <FiActivity size={16} />
                <span>{stats?.tasks.inProgress || 0} {language === 'ru' ? 'в работе' : 'in progress'}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats?.tasks.total || 0}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('dashboard', 'totalTasks')}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 dark:text-green-400">{stats?.tasks.done || 0} {language === 'ru' ? 'готово' : 'done'}</span>
                <span className="text-red-600 dark:text-red-400">{stats?.tasks.overdue || 0} {language === 'ru' ? 'просрочено' : 'overdue'}</span>
              </div>
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
                <FiUsers className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <FiStar size={16} />
                <span>{stats?.members.diamond || 0} diamond</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats?.members.total || 0}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('dashboard', 'teamMembers')}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>{stats?.members.active || 0} active</span>
                <span>{stats?.members.platinum || 0} platinum</span>
              </div>
            </div>
          </div>

          {/* Finance Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                <FiDollarSign className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                <FiTrendingUp size={16} />
                <span>Balance</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : formatCurrency(stats?.finance.balance || 0)}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('dashboard', 'monthlyBudget')}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>Total: {formatCurrency(stats?.finance.totalBudget || 0)}</span>
                <span>Spent: {formatCurrency(stats?.finance.totalSpent || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'ru' ? 'Выполнение задач' : 'Task Completion'}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">{language === 'ru' ? 'Общий прогресс' : 'Overall progress this period'}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <FiTarget className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-slate-700"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient1)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${taskCompletionRate * 3.51} 351`}
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{taskCompletionRate}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">To Do</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats?.tasks.todo || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">In Progress</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{stats?.tasks.inProgress || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Done</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{stats?.tasks.done || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Overdue</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{stats?.tasks.overdue || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard', 'projectProgress')}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">{language === 'ru' ? 'Распределение по статусу' : 'Project status distribution'}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <FiPieChart className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    className="text-gray-200 dark:text-slate-700"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient2)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${projectCompletionRate * 3.51} 351`}
                  />
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{projectCompletionRate}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Active</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats?.projects.active || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats?.projects.total ? (stats.projects.active / stats.projects.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-slate-400">Completed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats?.projects.completed || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats?.projects.total ? (stats.projects.completed / stats.projects.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-slate-400">On Hold</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats?.projects.onHold || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${stats?.projects.total ? (stats.projects.onHold / stats.projects.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Projects */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard', 'recentProjects')}</h2>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                {t('dashboard', 'viewAll')}
                <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {recentProjects.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-slate-400">
                  <FiFolder size={32} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  <p>{language === 'ru' ? 'Проектов пока нет' : 'No projects yet'}</p>
                </div>
              ) : (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <FiFolder className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{project.progress}%</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard', 'myTasks')}</h2>
              <Link
                href="/tasks"
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                {t('dashboard', 'viewAll')}
                <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {recentTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-slate-400">
                  <FiCheckSquare size={32} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  <p>{language === 'ru' ? 'Задач пока нет' : 'No tasks yet'}</p>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        task.status === 'Done' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'
                      }`}>
                        <FiCheckSquare className={task.status === 'Done' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{task.title}</p>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{task.project?.name || 'No project'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status === 'TODO' ? 'To Do' : task.status === 'InProgress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard', 'quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              href="/projects"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all group"
            >
              <div className="p-3 bg-blue-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiPlus className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('dashboard', 'newProject')}</span>
            </Link>
            <Link
              href="/tasks"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all group"
            >
              <div className="p-3 bg-green-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiCheckSquare className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('dashboard', 'newTask')}</span>
            </Link>
            <Link
              href="/members"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/50 dark:hover:to-violet-900/50 transition-all group"
            >
              <div className="p-3 bg-purple-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiUsers className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('nav', 'members')}</span>
            </Link>
            <Link
              href="/events"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-900/50 dark:hover:to-rose-900/50 transition-all group"
            >
              <div className="p-3 bg-pink-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiCalendar className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('nav', 'events')}</span>
            </Link>
            <Link
              href="/finance"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50 transition-all group"
            >
              <div className="p-3 bg-orange-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiDollarSign className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('nav', 'finance')}</span>
            </Link>
            <Link
              href="/sponsors"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/30 dark:to-sky-900/30 rounded-xl hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-900/50 dark:hover:to-sky-900/50 transition-all group"
            >
              <div className="p-3 bg-cyan-500 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                <FiAward className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('nav', 'sponsors')}</span>
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <FiZap size={24} />
              <span className="text-lg font-semibold">ACIK Management System</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {language === 'ru' ? 'Добро пожаловать в новую эру управления' : 'Welcome to the new era of management'}
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl">
              {language === 'ru'
                ? 'Создано на Next.js 15, Supabase и развёрнуто на Vercel. Быстрая загрузка, обновления в реальном времени и современный интерфейс.'
                : 'Powered by Next.js 15, Supabase, and deployed on Vercel. Experience faster load times, real-time updates, and a beautiful modern interface.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Next.js 15</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Supabase</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">TypeScript</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Vercel Edge</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
