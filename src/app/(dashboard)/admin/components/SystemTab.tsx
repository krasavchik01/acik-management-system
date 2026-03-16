'use client'

import { FiServer, FiDatabase, FiShield } from 'react-icons/fi'
import { AdminStats } from '../types'

interface SystemTabProps {
  stats: AdminStats | null
  t: (category: string, key: string) => string
  language: string
}

export default function SystemTab({ stats, t, language }: SystemTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Server Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <FiServer className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin', 'server')}</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vercel Edge</p>
            </div>
          </div>
          <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('common', 'status')}</span>
              <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">{t('admin', 'connected')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('admin', 'platform')}</span>
              <span className="text-gray-900 dark:text-white font-bold">Global Edge</span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <FiDatabase className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin', 'database')}</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Supabase Postgres</p>
            </div>
          </div>
          <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('common', 'status')}</span>
              <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">{t('admin', 'connected')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('admin', 'tables')}</span>
              <span className="text-gray-900 dark:text-white font-bold text-base">9</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <FiShield className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin', 'authentication')}</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Supabase Auth</p>
            </div>
          </div>
          <div className="space-y-3 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('common', 'status')}</span>
              <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">{t('common', 'active')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">{t('admin', 'providers')}</span>
              <span className="text-gray-900 dark:text-white font-bold">Email / Pass</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-all duration-1000" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin', 'technologies')}</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Next.js 14', category: 'Frontend' },
              { name: 'React 18', category: 'Library' },
              { name: 'TypeScript', category: 'Language' },
              { name: 'Tailwind CSS', category: 'Styling' },
              { name: 'Prisma', category: 'ORM' },
              { name: 'Supabase', category: 'Backend/DB' }
            ].map((tech, i) => (
              <div key={i} className="bg-gray-50/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all text-center group/tech shadow-inner">
                <p className="text-lg font-black text-gray-900 dark:text-white group-hover/tech:text-indigo-600 dark:group-hover/tech:text-indigo-400 transition-colors mb-1">{tech.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
