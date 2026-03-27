'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { FiFileText, FiDownload, FiBarChart2, FiPieChart, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ReportStats {
  projects: {
    distribution: { status: string; _count: { id: number } }[]
    categories: { category: string; _count: { id: number } }[]
  }
  budget: {
    allocated: number
    spent: number
    remaining: number
  }
  tasks: {
    distribution: { status: string; _count: { id: number } }[]
  }
  trends: {
    month: string
    projects: number
    tasksCompleted: number
  }[]
}

export default function ReportsPage() {
  useAuth()
  const { t, language } = useLanguage()
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const exportToCSV = () => {
    if (!stats) return
    
    // Create simple CSV content for projects
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Metric,Value\n"
    csvContent += `Total Budget Allocated,${stats.budget.allocated}\n`
    csvContent += `Total Budget Spent,${stats.budget.spent}\n`
    csvContent += `Remaining Budget,${stats.budget.remaining}\n\n`
    
    csvContent += "Month,Projects Created,Tasks Completed\n"
    stats.trends.forEach(row => {
      csvContent += `${row.month},${row.projects},${row.tasksCompleted}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ACIK_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Chart Data Configurations
  const projectStatusData = {
    labels: stats?.projects.distribution.map(d => d.status) || [],
    datasets: [{
      data: stats?.projects.distribution.map(d => d._count.id) || [],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
      borderWidth: 0,
    }]
  }

  const budgetData = {
    labels: [t('reports', 'budgetAllocated'), t('reports', 'budgetSpent')],
    datasets: [{
      label: '$',
      data: [stats?.budget.allocated || 0, stats?.budget.spent || 0],
      backgroundColor: ['#3b82f6', '#ef4444'],
      borderRadius: 12,
    }]
  }

  const trendData = {
    labels: stats?.trends.map(t => t.month) || [],
    datasets: [
      {
        label: t('nav', 'projects'),
        data: stats?.trends.map(t => t.projects) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: t('nav', 'tasks'),
        data: stats?.trends.map(t => t.tasksCompleted) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'inherit', size: 12, weight: 'bold' as any }
        }
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={t('reports', 'title')}
        subtitle={t('reports', 'subtitle')}
        action={
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            <FiDownload size={18} />
            {t('reports', 'downloadReport')}
          </button>
        }
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                <FiBarChart2 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('nav', 'projects')}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {loading ? '...' : stats?.projects.distribution.reduce((acc, curr) => acc + curr._count.id, 0) || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl">
                <FiActivity className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('nav', 'tasks')}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {loading ? '...' : stats?.tasks.distribution.reduce((acc, curr) => acc + curr._count.id, 0) || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                <FiTrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('finance', 'income')}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              ${(stats?.budget.allocated || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl">
                <FiPieChart className="text-rose-600 dark:text-rose-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('finance', 'expense')}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              ${(stats?.budget.spent || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiPieChart className="text-indigo-600" />
              {t('dashboard', 'projectsDistribution')}
            </h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              {loading ? <div className="animate-pulse w-full h-full bg-gray-50 dark:bg-slate-700 rounded-2xl" /> : <Doughnut data={projectStatusData} options={chartOptions} />}
            </div>
          </div>

          {/* Budget vs Spent */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 flex flex-col">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiTrendingUp className="text-blue-600" />
              {t('reports', 'financialReport')}
            </h3>
            <div className="flex-1 min-h-[300px]">
              {loading ? <div className="animate-pulse w-full h-full bg-gray-50 dark:bg-slate-700 rounded-2xl" /> : <Bar data={budgetData} options={chartOptions} />}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 lg:col-span-2 flex flex-col">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <FiActivity className="text-green-600" />
              {t('reports', 'monthlyOverview')}
            </h3>
            <div className="flex-1 min-h-[350px]">
              {loading ? <div className="animate-pulse w-full h-full bg-gray-50 dark:bg-slate-700 rounded-2xl" /> : <Line data={trendData} options={{...chartOptions, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
