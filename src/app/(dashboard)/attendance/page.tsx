'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/lib/i18n'
import { toast } from 'react-toastify'
import {
  FiClock, FiCheckCircle, FiMapPin, FiCalendar,
  FiChevronLeft, FiChevronRight, FiLogIn, FiLogOut,
  FiAlertCircle, FiLoader, FiUsers
} from 'react-icons/fi'

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  hoursWorked: number | null
  status: string
  workType?: string
  location: string | null
  notes: string | null
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
}

export default function AttendancePage() {
  const { profile } = useAuth()
  const { language, t } = useLanguage()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'team'>('today')

  const canManage = profile && ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager'].includes(profile.role)
  const today = new Date().toISOString().split('T')[0]

  const getLocation = useCallback(async () => {
    setGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError(language === 'ru' ? 'Геолокация не поддерживается' : 'Geolocation not supported')
      setGettingLocation(false)
      return null
    }

    return new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }

          // Try to get address from coordinates
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
            )
            const data = await res.json()
            if (data.display_name) {
              loc.address = data.display_name
            }
          } catch {
            // Ignore address lookup errors
          }

          setLocation(loc)
          setGettingLocation(false)
          resolve(loc)
        },
        (error) => {
          let errMsg = language === 'ru' ? 'Не удалось получить местоположение' : 'Failed to get location'
          if (error.code === 1) {
            errMsg = language === 'ru' ? 'Доступ к геолокации запрещён' : 'Location access denied'
          } else if (error.code === 2) {
            errMsg = language === 'ru' ? 'Местоположение недоступно' : 'Location unavailable'
          } else if (error.code === 3) {
            errMsg = language === 'ru' ? 'Превышено время ожидания' : 'Location timeout'
          }
          setLocationError(errMsg)
          setGettingLocation(false)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }, [language])

  useEffect(() => {
    if (!profile) return
    fetchTodayAttendance()
    fetchMyAttendance()
    if (canManage) {
      fetchTeamAttendance()
    }
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTodayAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?date=${today}`)
      const data = await res.json()
      if (data.success) {
        if (profile) {
          const myRecord = data.data.find((r: AttendanceRecord) => r.userId === profile.id)
          setTodayRecord(myRecord || null)
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyAttendance = async () => {
    try {
      // Get current month attendance
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

      const res = await fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}&userId=${profile?.id}`)
      const data = await res.json()
      if (data.success) {
        setMyAttendance(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching my attendance:', error)
    }
  }

  const fetchTeamAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate.toISOString().split('T')[0]}`)
      const data = await res.json()
      if (data.success) {
        setAttendance(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching team attendance:', error)
    }
  }

  useEffect(() => {
    fetchMyAttendance()
  }, [currentMonth])

  useEffect(() => {
    if (canManage && activeTab === 'team') {
      fetchTeamAttendance()
    }
  }, [selectedDate, activeTab])

  const handleCheckIn = async () => {
    setCheckingIn(true)

    // Get location first
    const loc = await getLocation()

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: loc ? `${loc.latitude},${loc.longitude}` : null,
          locationAddress: loc?.address || null
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('attendance', 'checkInSuccess') || 'Checked in successfully!')
        setTodayRecord(data.data)
        fetchMyAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('attendance', 'checkInError') || 'Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return
    setCheckingOut(true)

    // Get location first
    const loc = await getLocation()

    try {
      const res = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todayRecord.id,
          checkOutLocation: loc ? `${loc.latitude},${loc.longitude}` : null
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(t('attendance', 'checkOutSuccess') || 'Checked out successfully!')
        setTodayRecord(data.data)
        fetchMyAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('attendance', 'checkOutError') || 'Failed to check out')
    } finally {
      setCheckingOut(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/50'
      case 'Absent': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/50'
      case 'Late': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/50'
      case 'HalfDay': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50'
      case 'Working': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50'
      default: return 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 overflow-hidden dark:border-slate-700'
    }
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHours = (hours: number | null) => {
    if (!hours) return '-'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}${language === 'ru' ? 'ч' : 'h'} ${m}${language === 'ru' ? 'м' : 'm'}`
  }

  // Calendar helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })

  const getAttendanceForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return myAttendance.find(a => a.date === dateStr)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const currentTime = new Date().toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const [time, setTime] = useState(currentTime)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [language])

  const dayNames = language === 'ru'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Calculate stats for current month
  const monthStats = {
    present: myAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length,
    absent: myAttendance.filter(a => a.status === 'Absent').length,
    late: myAttendance.filter(a => a.status === 'Late').length,
    totalHours: myAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header
        title={t('attendance', 'title')}
        subtitle={new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 custom-scrollbar">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === 'today'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 -translate-y-0.5'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900'
              }`}
          >
            <FiClock size={18} className={activeTab === 'today' ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'} />
            {t('attendance', 'today')}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 -translate-y-0.5'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900'
              }`}
          >
            <FiCalendar size={18} className={activeTab === 'calendar' ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'} />
            {t('attendance', 'calendar')}
          </button>
          {canManage && (
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === 'team'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 -translate-y-0.5'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900'
                }`}
            >
              <FiUsers size={18} className={activeTab === 'team' ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'} />
              {t('attendance', 'team')}
            </button>
          )}
        </div>

        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Check In/Out Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 dark:shadow-indigo-900/30">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="text-center mb-8">
                  <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">
                    {t('attendance', 'currentTime')}
                  </p>
                  <h1 className="text-6xl font-black tracking-wider drop-shadow-md">{time}</h1>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <FiLoader className="animate-spin text-white/50" size={32} />
                  </div>
                ) : todayRecord ? (
                  <div className="space-y-6">
                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                        <FiLogIn className="mx-auto mb-3 text-white/80" size={28} />
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                          {t('attendance', 'checkIn')}
                        </p>
                        <p className="text-2xl font-bold">{formatTime(todayRecord.checkIn)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                        <FiLogOut className="mx-auto mb-3 text-white/80" size={28} />
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                          {t('attendance', 'checkOut')}
                        </p>
                        <p className="text-2xl font-bold">{formatTime(todayRecord.checkOut)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition-all">
                        <FiClock className="mx-auto mb-3 text-white/80" size={28} />
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                          {t('attendance', 'hoursWorked')}
                        </p>
                        <p className="text-2xl font-bold">{formatHours(todayRecord.hoursWorked)}</p>
                      </div>
                    </div>

                    {/* Location Info */}
                    {todayRecord.location && (
                      <div className="flex items-center justify-center gap-2 text-white/80 text-sm bg-white/5 py-2 px-4 rounded-full w-max mx-auto border border-white/10">
                        <FiMapPin size={16} />
                        <span className="font-medium">{t('attendance', 'locationRecorded')}</span>
                      </div>
                    )}

                    {/* Check Out Button */}
                    {!todayRecord.checkOut && (
                      <button
                        onClick={handleCheckOut}
                        disabled={checkingOut}
                        className="w-full py-4 mt-2 bg-white text-indigo-700 rounded-2xl font-black text-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 shadow-xl"
                      >
                        {checkingOut ? (
                          <>
                            <FiLoader className="animate-spin" size={22} />
                            {gettingLocation
                              ? t('common', 'gettingLocation')
                              : t('attendance', 'checkingOut')
                            }
                          </>
                        ) : (
                          <>
                            <FiLogOut size={22} />
                            {t('attendance', 'checkOut')}
                          </>
                        )}
                      </button>
                    )}

                    {/* Already checked out message */}
                    {todayRecord.checkOut && (
                      <div className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm mt-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiCheckCircle className="text-white" size={32} />
                        </div>
                        <p className="font-bold text-lg">
                          {t('attendance', 'dayCompleted')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Location Status */}
                    <div className="flex items-center justify-center py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center gap-3 px-4">
                        {gettingLocation ? (
                          <>
                            <FiLoader className="animate-spin text-white" size={20} />
                            <span className="text-white/90 font-medium">
                              {t('common', 'gettingLocation')}
                            </span>
                          </>
                        ) : locationError ? (
                          <>
                            <div className="p-2 bg-yellow-400/20 rounded-full">
                              <FiAlertCircle size={20} className="text-yellow-300" />
                            </div>
                            <span className="text-yellow-200 font-medium text-sm">{locationError}</span>
                          </>
                        ) : location ? (
                          <>
                            <div className="p-2 bg-green-400/20 rounded-full">
                              <FiMapPin size={20} className="text-green-300" />
                            </div>
                            <span className="text-green-200 font-medium text-sm">
                              {t('attendance', 'locationAvailable')}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-white/10 rounded-full">
                              <FiMapPin size={20} className="text-white/60" />
                            </div>
                            <span className="text-white/60 font-medium text-sm">
                              {t('attendance', 'locationRequested')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Check In Button */}
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full py-4 mt-2 bg-white text-indigo-700 rounded-2xl font-black text-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 shadow-xl"
                    >
                      {checkingIn ? (
                        <>
                          <FiLoader className="animate-spin" size={22} />
                          {gettingLocation
                            ? t('common', 'gettingLocation')
                            : t('attendance', 'checkingIn')
                          }
                        </>
                      ) : (
                        <>
                          <FiLogIn size={22} />
                          {t('attendance', 'checkIn')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Month Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-green-50 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <FiCheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {t('attendance', 'present')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{monthStats.present}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-red-50 dark:bg-red-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {t('attendance', 'absent')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{monthStats.absent}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <FiClock className="text-yellow-600 dark:text-yellow-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {t('attendance', 'late')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{monthStats.late}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <FiClock className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {t('attendance', 'hours')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(monthStats.totalHours)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700/50">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm"
              >
                <FiChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize tracking-wide">
                {monthName}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm"
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/80">
              {dayNames.map(day => (
                <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-gray-50/50 dark:bg-slate-900/20 gap-[1px]">
              {/* Empty cells for days before start of month */}
              {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-3 min-h-[120px] bg-white dark:bg-slate-800/50" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayAttendance = getAttendanceForDay(day)
                const isToday = new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear()
                const isWeekend = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay() % 6 === 0

                return (
                  <div
                    key={day}
                    className={`p-3 min-h-[120px] bg-white dark:bg-slate-800 transition-colors relative group hover:bg-gray-50/80 dark:hover:bg-slate-700/50 ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' :
                      isWeekend ? 'bg-gray-50/30 dark:bg-slate-800/80' : ''
                      }`}
                  >
                    <div className={`text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' :
                      isWeekend ? 'text-gray-400 dark:text-slate-500' :
                        'text-gray-700 dark:text-slate-300'
                      }`}>
                      {day}
                    </div>
                    {dayAttendance && (
                      <div className="space-y-1.5 mt-2">
                        <span className={`flex w-full px-2 py-1 rounded-md text-xs font-bold justify-center items-center shadow-sm ${getStatusColor(dayAttendance.status)}`}>
                          {t('attendance', `status${dayAttendance.status}`)}
                        </span>
                        {dayAttendance.hoursWorked && (
                          <div className="text-[11px] font-medium text-gray-500 dark:text-slate-400 text-center bg-gray-50 dark:bg-slate-700/50 rounded-md py-1 border border-gray-100 dark:border-slate-600/50">
                            {formatHours(dayAttendance.hoursWorked)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 p-6 border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('attendance', 'statusPresent')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('attendance', 'statusLate')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('attendance', 'statusWorking')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('attendance', 'statusAbsent')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab (for managers) */}
        {activeTab === 'team' && canManage && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Date Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <FiCalendar className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('attendance', 'teamRegister')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t('attendance', 'viewSelectedDate')}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="pl-4 pr-10 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors w-full sm:w-auto appearance-none cursor-pointer"
                />
                <FiCalendar className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Team Attendance Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700/50">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('attendance', 'employee')}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('attendance', 'checkIn')}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('attendance', 'checkOut')}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('attendance', 'hours')}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('common', 'status')}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                        {t('attendance', 'location')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUsers size={32} className="text-gray-400 dark:text-slate-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('attendance', 'noRecords')}
                          </h3>
                          <p className="text-gray-500 dark:text-slate-400">
                            {t('attendance', 'noRecordsDate')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-inner flex items-center justify-center transform group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold">
                                  {record.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {record.user?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-medium mt-0.5">
                                  {record.user?.role || '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {record.checkIn ? (
                                <>
                                  <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                    <FiLogIn className="text-green-600 dark:text-green-400" size={14} />
                                  </div>
                                  <span className="text-gray-900 dark:text-white font-semibold">
                                    {formatTime(record.checkIn)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {record.checkOut ? (
                                <>
                                  <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                    <FiLogOut className="text-red-600 dark:text-red-400" size={14} />
                                  </div>
                                  <span className="text-gray-900 dark:text-white font-semibold">
                                    {formatTime(record.checkOut)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-indigo-600 dark:text-indigo-400 font-black tracking-tight bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                              {formatHours(record.hoursWorked)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${getStatusColor(record.status)}`}>
                              {t('attendance', `status${record.status}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {record.workType === 'Office' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm w-max">
                                  <FiMapPin size={12} />
                                  {language === 'ru' ? 'ОФИС' : 'OFFICE'}
                                </span>
                              ) : record.workType === 'Remote' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm w-max">
                                  <FiClock size={12} />
                                  {language === 'ru' ? 'УДАЛЁННО' : 'REMOTE'}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500 text-xs font-medium uppercase tracking-tighter">
                                  {record.workType || '—'}
                                </span>
                              )}
                              <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px] mt-1 italic">
                                {record.location || '—'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Presence Intelligence Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-600/20 transition-all duration-1000" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-2">Presence Intelligence</h3>
                  <p className="text-slate-400 font-medium">Real-time team distribution and operational status.</p>
                </div>
                
                <div className="flex items-center gap-8 px-8 py-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl">
                  <div className="text-center">
                    <p className="text-4xl font-black text-emerald-400 mb-1">
                      {attendance.filter(a => a.workType === 'Office' || a.status === 'Present').length}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Office</p>
                  </div>
                  <div className="w-px h-12 bg-slate-700" />
                  <div className="text-center">
                    <p className="text-4xl font-black text-indigo-400 mb-1">
                      {attendance.filter(a => a.workType === 'Remote' || a.status === 'Working').length}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remote</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
