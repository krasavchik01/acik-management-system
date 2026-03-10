'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiFileText, FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

interface Stats {
  projects: { total: number; active: number; completed: number }
  tasks: { total: number; completed: number }
  members: { total: number; active: number }
  finance: { income: number; expenses: number }
}

export default function ReportsPage() {
  const { profile } = useAuth()
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
    <div>
      <Header title="Reports" subtitle="View organization reports and analytics" />

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats?.projects.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiBarChart2 className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{stats?.projects.active || 0} active, {stats?.projects.completed || 0} completed</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats?.members.total || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiPieChart className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{stats?.members.active || 0} active members</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${(stats?.finance.income || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Budget allocated</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${(stats?.finance.expenses || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiFileText className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Budget spent</p>
          </div>
        </div>

        {/* Reports Grid */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 ${report.color} rounded-xl`}>
                  <report.icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <button className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    <FiDownload size={16} />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
            <div className="text-center text-gray-400">
              <FiBarChart2 size={48} className="mx-auto mb-2" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
