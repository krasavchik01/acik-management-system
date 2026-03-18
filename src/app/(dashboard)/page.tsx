'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency/CurrencyContext'
import { CurrencySwitcher } from '@/components/ui/CurrencySwitcher'
import Link from 'next/link'
import {
  FiFolder, FiCheckSquare, FiUsers, FiDollarSign, FiTrendingUp,
  FiCalendar, FiActivity, FiPieChart,
  FiPlus, FiStar, FiAward, FiTarget
} from 'react-icons/fi'
import { StatsCard } from './components/StatsCard'
import { ProgressCircle } from './components/ProgressCircle'
import { RecentList } from './components/RecentList'
import { QuickActions } from './components/QuickActions'

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
  const { formatCurrency } = useCurrency()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'President' || profile?.role === 'CEO'
  const permissions = profile?.permissions || []

  const can = (module: string) => isAdmin || permissions.some(p => p.startsWith(module + '.'))

  const fetchDashboardData = useCallback(async () => {
    try {
      const fetches: Promise<Response>[] = []
      const keys: string[] = []

      // Only fetch data the user has access to
      if (can('projects')) { fetches.push(fetch('/api/projects')); keys.push('projects') }
      if (can('members')) { fetches.push(fetch('/api/members')); keys.push('members') }
      if (can('tasks')) { fetches.push(fetch('/api/tasks')); keys.push('tasks') }

      const responses = await Promise.all(fetches)
      // Parse all JSON in parallel instead of sequentially
      const parsed = await Promise.all(responses.map(r => r.json()))
      const results: Record<string, any[]> = {}
      keys.forEach((key, i) => { results[key] = parsed[i].data || [] })

      const projects = results.projects || []
      const members = results.members || []
      const tasks = results.tasks || []

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

      setRecentProjects(projects.slice(0, 5).map((p: any) => ({
        ...p,
        progress: p.taskCount > 0 ? Math.round((p.completedTasks / p.taskCount) * 100) : 0,
      })))
      setRecentTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, permissions]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile) fetchDashboardData()
  }, [profile, fetchDashboardData])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
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

  const taskCompletionRate = stats?.tasks.total ? Math.round((stats.tasks.done / stats.tasks.total) * 100) : 0
  const projectCompletionRate = stats?.projects.total ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0

  // Build stats cards based on permissions
  const statsCards = []

  if (can('projects')) {
    statsCards.push(
      <StatsCard
        key="projects"
        icon={FiFolder}
        value={loading ? '...' : (stats?.projects.total || 0).toString()}
        subtitle={t('dashboard', 'activeProjects')}
        trend={{ value: `${stats?.projects.active || 0} ${language === 'ru' ? 'активных' : 'active'}`, icon: FiTrendingUp, colorClass: 'text-green-600 dark:text-green-400' }}
        gradientClass="from-blue-500 to-blue-600"
        shadowClass="shadow-blue-200 dark:shadow-blue-900/30"
        footer={
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>{stats?.projects.completed || 0} {language === 'ru' ? 'завершено' : 'completed'}</span>
            <span>{stats?.projects.onHold || 0} {language === 'ru' ? 'на паузе' : 'on hold'}</span>
          </div>
        }
      />
    )
  }

  if (can('tasks')) {
    statsCards.push(
      <StatsCard
        key="tasks"
        icon={FiCheckSquare}
        value={loading ? '...' : (stats?.tasks.total || 0).toString()}
        subtitle={t('dashboard', 'totalTasks')}
        trend={{ value: `${stats?.tasks.inProgress || 0} ${language === 'ru' ? 'в работе' : 'in progress'}`, icon: FiActivity, colorClass: 'text-blue-600 dark:text-blue-400' }}
        gradientClass="from-green-500 to-emerald-600"
        shadowClass="shadow-green-200 dark:shadow-green-900/30"
        footer={
          <div className="flex justify-between text-xs">
            <span className="text-green-600 dark:text-green-400">{stats?.tasks.done || 0} {language === 'ru' ? 'готово' : 'done'}</span>
            <span className="text-red-600 dark:text-red-400">{stats?.tasks.overdue || 0} {language === 'ru' ? 'просрочено' : 'overdue'}</span>
          </div>
        }
      />
    )
  }

  if (can('members')) {
    statsCards.push(
      <StatsCard
        key="members"
        icon={FiUsers}
        value={loading ? '...' : (stats?.members.total || 0).toString()}
        subtitle={t('dashboard', 'teamMembers')}
        trend={{ value: `${stats?.members.diamond || 0} diamond`, icon: FiStar, colorClass: 'text-purple-600 dark:text-purple-400' }}
        gradientClass="from-purple-500 to-violet-600"
        shadowClass="shadow-purple-200 dark:shadow-purple-900/30"
        footer={
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>{stats?.members.active || 0} active</span>
            <span>{stats?.members.platinum || 0} platinum</span>
          </div>
        }
      />
    )
  }

  if (can('finance')) {
    statsCards.push(
      <StatsCard
        key="finance"
        icon={FiDollarSign}
        value={loading ? '...' : formatCurrency(stats?.finance.balance || 0)}
        subtitle={t('dashboard', 'monthlyBudget')}
        gradientClass="from-orange-500 to-amber-600"
        shadowClass="shadow-orange-200 dark:shadow-orange-900/30"
        trend={undefined}
        footer={
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>Total: {formatCurrency(stats?.finance.totalBudget || 0)}</span>
            <span>Spent: {formatCurrency(stats?.finance.totalSpent || 0)}</span>
          </div>
        }
      >
        <div className="absolute top-6 right-6">
          <CurrencySwitcher />
        </div>
      </StatsCard>
    )
  }

  // Dynamic grid cols based on card count
  const gridCols = statsCards.length <= 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : statsCards.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  // Quick actions filtered by permissions
  const allActions = [
    { href: '/projects', label: t('dashboard', 'newProject'), icon: FiPlus, module: 'projects', colorClass: 'bg-blue-500', bgColorClass: 'bg-gradient-to-br from-blue-50 to-indigo-50', hoverBgClass: 'hover:from-blue-100 hover:to-indigo-100', darkBgClass: 'dark:from-blue-900/30 dark:to-indigo-900/30', darkHoverBgClass: 'dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50' },
    { href: '/tasks', label: t('dashboard', 'newTask'), icon: FiCheckSquare, module: 'tasks', colorClass: 'bg-green-500', bgColorClass: 'bg-gradient-to-br from-green-50 to-emerald-50', hoverBgClass: 'hover:from-green-100 hover:to-emerald-100', darkBgClass: 'dark:from-green-900/30 dark:to-emerald-900/30', darkHoverBgClass: 'dark:hover:from-green-900/50 dark:hover:to-emerald-900/50' },
    { href: '/members', label: t('nav', 'members'), icon: FiUsers, module: 'members', colorClass: 'bg-purple-500', bgColorClass: 'bg-gradient-to-br from-purple-50 to-violet-50', hoverBgClass: 'hover:from-purple-100 hover:to-violet-100', darkBgClass: 'dark:from-purple-900/30 dark:to-violet-900/30', darkHoverBgClass: 'dark:hover:from-purple-900/50 dark:hover:to-violet-900/50' },
    { href: '/events', label: t('nav', 'events'), icon: FiCalendar, module: 'events', colorClass: 'bg-pink-500', bgColorClass: 'bg-gradient-to-br from-pink-50 to-rose-50', hoverBgClass: 'hover:from-pink-100 hover:to-rose-100', darkBgClass: 'dark:from-pink-900/30 dark:to-rose-900/30', darkHoverBgClass: 'dark:hover:from-pink-900/50 dark:hover:to-rose-900/50' },
    { href: '/finance', label: t('nav', 'finance'), icon: FiDollarSign, module: 'finance', colorClass: 'bg-orange-500', bgColorClass: 'bg-gradient-to-br from-orange-50 to-amber-50', hoverBgClass: 'hover:from-orange-100 hover:to-amber-100', darkBgClass: 'dark:from-orange-900/30 dark:to-amber-900/30', darkHoverBgClass: 'dark:hover:from-orange-900/50 dark:hover:to-amber-900/50' },
    { href: '/sponsors', label: t('nav', 'sponsors'), icon: FiAward, module: 'sponsors', colorClass: 'bg-cyan-500', bgColorClass: 'bg-gradient-to-br from-cyan-50 to-sky-50', hoverBgClass: 'hover:from-cyan-100 hover:to-sky-100', darkBgClass: 'dark:from-cyan-900/30 dark:to-sky-900/30', darkHoverBgClass: 'dark:hover:from-cyan-900/50 dark:hover:to-sky-900/50' },
  ]

  const filteredActions = allActions.filter(a => can(a.module))

  return (
    <div className="min-h-screen">
      <Header
        title={`${getGreeting()}, ${profile?.name?.split(' ')[0] || 'User'}!`}
        subtitle={new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        action={
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center p-2 text-gray-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-200 rounded-xl transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            disabled={isRefreshing}
          >
            <FiActivity className={isRefreshing ? 'animate-spin' : ''} size={20} />
          </button>
        }
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Stats cards — only modules user has access to */}
        {statsCards.length > 0 && (
          <div className={`grid ${gridCols} gap-6`}>
            {statsCards}
          </div>
        )}

        {/* Progress circles — only if user has access */}
        {(can('tasks') || can('projects')) && (
          <div className={`grid grid-cols-1 ${can('tasks') && can('projects') ? 'lg:grid-cols-2' : ''} gap-6`}>
            {can('tasks') && (
              <ProgressCircle
                label={language === 'ru' ? 'Выполнение задач' : 'Task Completion'}
                subtitle={language === 'ru' ? 'Общий прогресс' : 'Overall progress this period'}
                percentage={taskCompletionRate}
                gradientId="gradient1"
                colors={{ start: '#10b981', end: '#34d399' }}
                icon={<FiTarget className="text-green-600 dark:text-green-400" size={20} />}
                stats={[
                  { label: t('tasks', 'todo'), value: stats?.tasks.todo || 0 },
                  { label: t('tasks', 'inProgress'), value: stats?.tasks.inProgress || 0, colorClass: 'text-blue-600 dark:text-blue-400' },
                  { label: t('tasks', 'done'), value: stats?.tasks.done || 0, colorClass: 'text-green-600 dark:text-green-400' },
                  { label: t('tasks', 'overdueTasks'), value: stats?.tasks.overdue || 0, colorClass: 'text-red-600 dark:text-red-400' },
                ]}
              />
            )}
            {can('projects') && (
              <ProgressCircle
                label={t('dashboard', 'projectProgress')}
                subtitle={t('dashboard', 'projectsDistribution')}
                percentage={projectCompletionRate}
                gradientId="gradient2"
                colors={{ start: '#6366f1', end: '#8b5cf6' }}
                icon={<FiPieChart className="text-blue-600 dark:text-blue-400" size={20} />}
                stats={[
                  { label: t('projects', 'statusActive'), value: stats?.projects.active || 0 },
                  { label: t('projects', 'statusCompleted'), value: stats?.projects.completed || 0 },
                  { label: t('projects', 'statusOnHold'), value: stats?.projects.onHold || 0 },
                ]}
              />
            )}
          </div>
        )}

        {/* Recent lists — only if user has access */}
        {(can('projects') || can('tasks')) && (
          <div className={`grid grid-cols-1 ${can('projects') && can('tasks') ? 'lg:grid-cols-2' : ''} gap-6`}>
            {can('projects') && (
              <RecentList
                title={t('dashboard', 'recentProjects')}
                viewAllHref="/projects"
                viewAllLabel={t('dashboard', 'viewAll')}
                items={recentProjects}
                emptyState={{ icon: FiFolder, message: t('dashboard', 'noProjects') }}
                renderItem={(project) => (
                  <Link href="/projects" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <FiFolder className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{project.progress}%</span>
                    </div>
                  </Link>
                )}
              />
            )}
            {can('tasks') && (
              <RecentList
                title={t('dashboard', 'myTasks')}
                viewAllHref="/tasks"
                viewAllLabel={t('dashboard', 'viewAll')}
                items={recentTasks}
                emptyState={{ icon: FiCheckSquare, message: t('dashboard', 'noTasks') }}
                renderItem={(task) => (
                  <Link href="/tasks" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.status === 'Done' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                        <FiCheckSquare className={task.status === 'Done' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{task.title}</p>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{task.project?.name || t('dashboard', 'noProject')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>{t('tasks', `priority${task.priority}`)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status === 'TODO' ? t('tasks', 'todo') : task.status === 'InProgress' ? t('tasks', 'inProgress') : t('tasks', task.status.toLowerCase())}
                      </span>
                    </div>
                  </Link>
                )}
              />
            )}
          </div>
        )}

        {/* Quick actions — filtered by permissions */}
        {filteredActions.length > 0 && (
          <QuickActions
            title={t('dashboard', 'quickActions')}
            actions={filteredActions}
          />
        )}
      </div>
    </div>
  )
}
