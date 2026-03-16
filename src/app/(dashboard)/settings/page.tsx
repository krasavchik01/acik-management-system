'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave, FiLock, FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { useLanguage } from '@/lib/i18n'

export default function SettingsPage() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        department: profile.department || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('settings', 'profileUpdated'))
      } else {
        toast.error(data.message || t('settings', 'profileUpdateError'))
      }
    } catch {
      toast.error(t('settings', 'profileUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50 pb-20">
      <Header title={t('settings', 'title')} subtitle={t('settings', 'subtitle')} />

      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/30 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('settings', 'profileInfo')}</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">{t('settings', 'editPersonal')}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                      <FiMail className="inline-block mr-2 text-indigo-500" size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-2">{t('settings', 'emailCannotChange')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                      <FiShield className="inline-block mr-2 text-indigo-500" size={16} />
                      {t('settings', 'roleInSystem')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile?.role || ''}
                        disabled
                        className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 font-medium font-mono cursor-not-allowed uppercase"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-2">{t('settings', 'contactAdminToChange')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                      <FiUser className="inline-block mr-2 text-indigo-500" size={16} />
                      {t('settings', 'fullName')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                      placeholder={t('settings', 'fullNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                      <FiPhone className="inline-block mr-2 text-indigo-500" size={16} />
                      {t('settings', 'phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                      placeholder="+7 (XXX) XXX-XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                      <FiBriefcase className="inline-block mr-2 text-indigo-500" size={16} />
                      {t('settings', 'department')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white cursor-pointer appearance-none"
                      >
                        <option value="">{t('settings', 'selectDepartment')}</option>
                        <option value="Executive">{language === 'ru' ? 'Руководство' : 'Executive'}</option>
                        <option value="Operations">{language === 'ru' ? 'Операции' : 'Operations'}</option>
                        <option value="Marketing">{language === 'ru' ? 'Маркетинг' : 'Marketing'}</option>
                        <option value="Finance">{language === 'ru' ? 'Финансы' : 'Finance'}</option>
                        <option value="IT">{language === 'ru' ? 'IT' : 'IT'}</option>
                        <option value="HR">{language === 'ru' ? 'Кадры' : 'HR'}</option>
                        <option value="Events">{language === 'ru' ? 'Мероприятия' : 'Events'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full sm:w-max px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:transform-none"
                  >
                    <FiSave size={20} />
                    {loading ? t('settings', 'saving') : t('settings', 'saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">{t('settings', 'accountStatus')}</h2>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-slate-700/50">
                  <span className="text-gray-600 dark:text-slate-400 font-bold">{t('settings', 'active')}</span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${
                    profile?.isActive 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {profile?.isActive ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                    {profile?.isActive ? t('settings', 'yes') : t('settings', 'no')}
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-slate-700/50">
                  <span className="text-gray-600 dark:text-slate-400 font-bold">{t('settings', 'accountType')}</span>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                    profile?.isDemo
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {profile?.isDemo ? t('settings', 'demoAccount') : t('settings', 'standardAccount')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">{t('settings', 'security')}</h2>
              
              <div className="flex start gap-4 p-5 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm h-max">
                  <FiLock className="text-indigo-500" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{t('settings', 'password')}</p>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 leading-relaxed mb-4">{t('settings', 'updatePasswordDesc')}</p>
                  <button 
                    type="button" 
                    disabled
                    className="px-5 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-slate-700 rounded-xl font-bold transition-all text-sm w-full shadow-sm opacity-60 cursor-not-allowed"
                  >
                    {t('settings', 'changePassword')}
                  </button>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-3 text-center uppercase tracking-wider">{t('settings', 'featureInDevelopment')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
