'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiFileText, FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Stats {
  projects: { total: number; active: number; completed: number }
  tasks: { total: number; completed: number }
  members: { total: number; active: number }
  finance: { income: number; expenses: number }
}

export default function ReportsPage() {
  const { profile } = useAuth()
  const { language } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [projectsRes, membersRes] = await Promise.all([
        fetch('/api/projects/stats'),
        fetch('/api/members/stats'),
      ])

      const projectsData = await projectsRes.json()
      const membersData = await membersRes.json()

      setStats({
        projects: {
          total: projectsData.data?.total || 0,
          active: projectsData.data?.byStatus?.active || 0,
          completed: projectsData.data?.byStatus?.completed || 0,
        },
        tasks: {
          total: 0,
          completed: 0,
        },
        members: {
          total: membersData.data?.total || 0,
          active: membersData.data?.byStatus?.active || 0,
        },
        finance: {
          income: projectsData.data?.budget?.totalAllocated || 0,
          expenses: projectsData.data?.budget?.totalSpent || 0,
        },
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    {
      title: 'Projects Overview',
      description: 'Summary of all projects, their status, and progress',
      icon: FiBarChart2,
      color: 'bg-blue-500',
    },
    {
      title: 'Financial Report',
      description: 'Income, expenses, and budget utilization',
      icon: FiTrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Member Statistics',
      description: 'Membership growth and category distribution',
      icon: FiPieChart,
      color: 'bg-purple-500',
    },
    {
      title: 'Task Completion',
      description: 'Task metrics and team productivity',
      icon: FiFileText,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header
        title={language === 'ru' ? 'Отчеты' : 'Reports'}
        subtitle={language === 'ru' ? 'Просмотр отчетов и аналитики' : 'View organization reports and analytics'}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiBarChart2 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                {language === 'ru' ? 'Проекты' : 'Projects'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {loading ? '...' : stats?.projects.total || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{stats?.projects.active || 0}</span> {language === 'ru' ? 'активных' : 'active'}, <span className="text-gray-900 dark:text-slate-300 font-bold">{stats?.projects.completed || 0}</span> {language === 'ru' ? 'завершено' : 'completed'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 bg-purple-50 dark:bg-purple-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiPieChart className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                {language === 'ru' ? 'Участники' : 'Members'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {loading ? '...' : stats?.members.total || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                <span className="text-purple-600 dark:text-purple-400 font-bold">{stats?.members.active || 0}</span> {language === 'ru' ? 'активных участников' : 'active members'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 bg-green-50 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                {language === 'ru' ? 'Доход' : 'Income'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${(stats?.finance.income || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 w-max px-2 py-0.5 rounded-md mt-1">
                {language === 'ru' ? 'Выделенный бюджет' : 'Budget allocated'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 bg-red-50 dark:bg-red-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiFileText className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                {language === 'ru' ? 'Расходы' : 'Expenses'}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${(stats?.finance.expenses || 0).toLocaleString()}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/30 w-max px-2 py-0.5 rounded-md mt-1">
                {language === 'ru' ? 'Потраченный бюджет' : 'Budget spent'}
              </p>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {language === 'ru' ? 'Доступные отчеты' : 'Available Reports'}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report, index) => {
            const Icon = report.icon
            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${report.color} opacity-5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform`} />
                <div className="flex items-start gap-5">
                  <div className={`p-4 ${report.color} shadow-lg shadow-${report.color.split('-')[1]}-500/30 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{report.title}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 leading-relaxed">{report.description}</p>
                    <button className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-xl transition-colors w-max">
                      <FiDownload size={16} />
                      {language === 'ru' ? 'Скачать отчет' : 'Download Report'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
            {language === 'ru' ? 'Ежемесячный обзор' : 'Monthly Overview'}
          </h2>
          <div className="h-[300px] flex items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-xl shadow-indigo-600/10 dark:shadow-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <FiBarChart2 size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {language === 'ru' ? 'Построение графика скоро будет доступно' : 'Chart visualization coming soon'}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {language === 'ru' ? 'Мы работаем над интеграцией графиков' : 'We are working on integrating charts'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
