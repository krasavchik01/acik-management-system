'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { Logo } from '@/components/ui/Logo'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiLoader, FiZap, FiCheckCircle, FiGlobe } from 'react-icons/fi'

interface DemoAccount {
  label: string
  email: string
  password: string
  name: string
}

export default function LoginPage() {
  const { login, register } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    const init = async () => {
      try {
        const pingRes = await fetch('/api/health')
        if (pingRes.ok) {
          setServerStatus('online')
        } else {
          setServerStatus('offline')
        }
      } catch {
        setServerStatus('offline')
      }
    }

    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      await login(formData.email, formData.password)
    } else {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
    }

    setLoading(false)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
          >
            <FiGlobe size={18} />
            <span className="font-medium">{language === 'ru' ? 'Русский' : 'English'}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl overflow-hidden z-50">
              <button
                onClick={() => {
                  setLanguage('ru')
                  setShowLangMenu(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  language === 'ru' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">🇷🇺</span>
                <span className="font-medium">Русский</span>
              </button>
              <button
                onClick={() => {
                  setLanguage('en')
                  setShowLangMenu(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  language === 'en' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">🇺🇸</span>
                <span className="font-medium">English</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo - Светлая версия для тёмного фона */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="lg" showFlag={true} />
          </div>
          <p className="text-white/80 text-lg">{t('auth', 'managementSystem')}</p>

          {/* Server Status */}
          <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm ${
            serverStatus === 'checking' ? 'bg-white/20 text-white/70' :
            serverStatus === 'online' ? 'bg-green-400/20 text-green-100' :
            'bg-red-400/20 text-red-100'
          }`}>
            {serverStatus === 'checking' ? (
              <>
                <FiLoader className="animate-spin" size={14} />
                {t('auth', 'serverChecking')}
              </>
            ) : serverStatus === 'online' ? (
              <>
                <FiCheckCircle size={14} />
                {t('auth', 'serverOnline')}
              </>
            ) : (
              <>
                <FiZap size={14} />
                {t('auth', 'serverWarming')}
              </>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? t('auth', 'welcome') : t('auth', 'createAccount')}
          </h2>
          <p className="text-gray-500 mb-6">
            {isLogin ? t('auth', 'signInSubtitle') : t('auth', 'signUpSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth', 'fullName')}
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder={language === 'ru' ? 'Иван Иванов' : 'John Doe'}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common', 'email')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common', 'password')}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  {t('auth', 'pleaseWait')}
                </>
              ) : isLogin ? t('auth', 'signIn') : t('auth', 'signUp')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {isLogin ? t('auth', 'noAccount') : t('auth', 'hasAccount')}
            </button>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          Next.js + Supabase + Vercel
        </p>
      </div>
    </div>
  )
}
