'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave, FiLock, FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

export default function SettingsPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
  })

  // Synchronize form data when profile is loaded
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
    if (!profile) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseId: profile.supabaseId,
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Профиль успешно обновлен!')
      } else {
        toast.error(data.message || 'Ошибка обновления профиля')
      }
    } catch {
      toast.error('Ошибка обновления профиля. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50 pb-20">
      <Header title="Настройки" subtitle="Управление аккаунтом и профилем" />

      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/30 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Информация профиля</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Отредактируйте свои личные данные</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-black shadow-md border-4 border-white dark:border-slate-800">
                    {profile?.name?.charAt(0) || <FiUser />}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
                  
                  {/* Email & Role display - disabled inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-slate-700/50">
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
                      <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-2">Email не может быть изменен</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                        <FiShield className="inline-block mr-2 text-indigo-500" size={16} />
                        Роль в системе
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profile?.role || ''}
                          disabled
                          className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 font-medium font-mono cursor-not-allowed uppercase"
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-2">Свяжитесь с администратором для изменения</p>
                    </div>
                  </div>

                  {/* Mutable fields */}
                  <div className="space-y-6 pt-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                        <FiUser className="inline-block mr-2 text-indigo-500" size={16} />
                        Полное имя
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        placeholder="Иван Иванов"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                          <FiPhone className="inline-block mr-2 text-indigo-500" size={16} />
                          Номер телефона
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
                          Отдел
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-5 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white cursor-pointer appearance-none"
                        >
                          <option value="">Выберите отдел</option>
                          <option value="Executive">Руководство</option>
                          <option value="Operations">Операции (Operations)</option>
                          <option value="Marketing">Маркетинг (Marketing)</option>
                          <option value="Finance">Финансы (Finance)</option>
                          <option value="IT">Информационные Технологии (IT)</option>
                          <option value="HR">Кадры (HR)</option>
                          <option value="Events">Мероприятия (Events)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-slate-700/50 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !formData.name}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                      <FiSave size={20} />
                      {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Security */}
          <div className="space-y-6">
            
            {/* Account Info */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Статус аккаунта</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-slate-700/50">
                  <span className="text-gray-600 dark:text-slate-400 font-bold">Активен</span>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${
                    profile?.isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50' 
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                  }`}>
                    {profile?.isActive ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                    {profile?.isActive ? 'Да' : 'Нет'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-slate-700/50">
                  <span className="text-gray-600 dark:text-slate-400 font-bold">Тип аккаунта</span>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                    profile?.isDemo 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50' 
                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                  }`}>
                    {profile?.isDemo ? 'Демонстрационный' : 'Стандартный'}
                  </div>
                </div>
                
                {(profile as any)?.modules && ((profile as any).modules as string[]).length > 0 && (
                   <div className="pt-4">
                     <span className="block text-gray-600 dark:text-slate-400 font-bold mb-3">Доступные модули:</span>
                     <div className="flex flex-wrap gap-2">
                       {((profile as any).modules as string[]).map((mod: string) => (
                         <span key={mod} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-600">
                           {mod}
                         </span>
                       ))}
                     </div>
                   </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-slate-700/50 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Безопасность</h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl">
                  <div className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-xl">
                    <FiLock className="text-indigo-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">Пароль</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400 leading-relaxed mb-4">Регулярно обновляйте пароль, чтобы обеспечить безопасность вашей учетной записи.</p>
                    <button 
                      type="button" 
                      disabled
                      className="px-5 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-slate-700 rounded-xl font-bold transition-all text-sm w-full shadow-sm opacity-60 cursor-not-allowed"
                    >
                      Сменить пароль
                    </button>
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-3 text-center uppercase tracking-wider">Функция в разработке</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
