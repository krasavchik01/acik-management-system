'use client'

import { FiActivity, FiRefreshCw, FiMapPin, FiUsers, FiFolder, FiCheckSquare, FiDollarSign } from 'react-icons/fi'
import { AdminStats, User } from '../types'

interface OverviewTabProps {
  stats: AdminStats | null
  users: User[]
  loading: boolean
  refreshData: () => void
  t: (category: string, key: string) => string
}

const brandDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

export default function OverviewTab({ stats, users, loading, refreshData, t }: OverviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Live Presence Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-600/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-40 -mb-40 group-hover:bg-purple-600/20 transition-all duration-1000" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">{t('admin', 'commandCenter')}</h2>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                {t('admin', 'liveMonitoring')}
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => refreshData()}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                {t('admin', 'refreshData')}
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all">
                {t('admin', 'broadcastAlert')}
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
                    {t('admin', 'whoIsWhere')}
                  </h3>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-lg">
                    {t('admin', 'todaysPresence')}
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
                              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                {p.workType}
                                {user?.activeTasks !== undefined && (
                                  <span className="ml-2 pl-2 border-l border-slate-700 text-indigo-400 font-bold">
                                    {user.activeTasks} {t('tasks', 'activeTasks')}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-indigo-400">{new Date(p.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[80px]">{p.checkInAddress || 'Unknown Location'}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-2 py-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                      <FiUsers className="mx-auto text-slate-600 mb-3" size={32} />
                      <p className="text-slate-500 font-bold italic">{t('admin', 'noActiveSessions')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: System Health */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-4">{t('admin', 'dbHealth')}</h4>
                <div className="space-y-4">
                  {[
                    { label: t('admin', 'totalUsersLabel'), value: stats?.stats.users.total, icon: FiUsers, color: 'text-blue-400' },
                    { label: t('admin', 'financeLogs'), value: (stats?.stats as any)?.system?.financeRecords || 0, icon: FiDollarSign, color: 'text-green-400' },
                    { label: t('admin', 'registeredSponsors'), value: (stats?.stats as any)?.system?.sponsors || 0, icon: FiActivity, color: 'text-purple-400' },
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
                <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4">{t('admin', 'infrastructure')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-bold">{t('admin', 'nodeRuntime')}</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded border border-green-500/20">v20.x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-bold">{t('admin', 'latency')}</span>
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
  )
}
