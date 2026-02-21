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
  const { language } = useLanguage()
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

  const canManage = profile && ['Admin', 'President', 'CEO', 'ProjectManager'].includes(profile.role)
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
    fetchTodayAttendance()
    fetchMyAttendance()
    if (canManage) {
      fetchTeamAttendance()
    }
  }, [])

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
        toast.success(language === 'ru' ? 'Вы отметились!' : 'Checked in successfully!')
        setTodayRecord(data.data)
        fetchMyAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при отметке' : 'Failed to check in')
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
        toast.success(language === 'ru' ? 'Вы отметились об уходе!' : 'Checked out successfully!')
        setTodayRecord(data.data)
        fetchMyAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка при отметке' : 'Failed to check out')
    } finally {
      setCheckingOut(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
      case 'Absent': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
      case 'Late': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
      case 'HalfDay': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
      case 'Working': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
      default: return 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        title={language === 'ru' ? 'Посещаемость' : 'Attendance'}
        subtitle={new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <FiClock size={18} />
            {language === 'ru' ? 'Сегодня' : 'Today'}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <FiCalendar size={18} />
            {language === 'ru' ? 'Календарь' : 'Calendar'}
          </button>
          {canManage && (
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === 'team'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              <FiUsers size={18} />
              {language === 'ru' ? 'Команда' : 'Team'}
            </button>
          )}
        </div>

        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Check In/Out Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="text-center mb-8">
                  <p className="text-white/70 text-sm mb-2">
                    {language === 'ru' ? 'Текущее время' : 'Current Time'}
                  </p>
                  <h1 className="text-5xl font-bold tracking-wider">{time}</h1>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <FiLoader className="animate-spin" size={32} />
                  </div>
                ) : todayRecord ? (
                  <div className="space-y-6">
                    {/* Status Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <FiLogIn className="mx-auto mb-2" size={24} />
                        <p className="text-white/70 text-xs mb-1">
                          {language === 'ru' ? 'Приход' : 'Check In'}
                        </p>
                        <p className="text-xl font-bold">{formatTime(todayRecord.checkIn)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <FiLogOut className="mx-auto mb-2" size={24} />
                        <p className="text-white/70 text-xs mb-1">
                          {language === 'ru' ? 'Уход' : 'Check Out'}
                        </p>
                        <p className="text-xl font-bold">{formatTime(todayRecord.checkOut)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <FiClock className="mx-auto mb-2" size={24} />
                        <p className="text-white/70 text-xs mb-1">
                          {language === 'ru' ? 'Отработано' : 'Hours'}
                        </p>
                        <p className="text-xl font-bold">{formatHours(todayRecord.hoursWorked)}</p>
                      </div>
                    </div>

                    {/* Location Info */}
                    {todayRecord.location && (
                      <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                        <FiMapPin size={16} />
                        <span>{language === 'ru' ? 'Геолокация зафиксирована' : 'Location recorded'}</span>
                      </div>
                    )}

                    {/* Check Out Button */}
                    {!todayRecord.checkOut && (
                      <button
                        onClick={handleCheckOut}
                        disabled={checkingOut}
                        className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {checkingOut ? (
                          <>
                            <FiLoader className="animate-spin" size={20} />
                            {gettingLocation
                              ? (language === 'ru' ? 'Получение геолокации...' : 'Getting location...')
                              : (language === 'ru' ? 'Отметка...' : 'Checking out...')
                            }
                          </>
                        ) : (
                          <>
                            <FiLogOut size={20} />
                            {language === 'ru' ? 'Отметить уход' : 'Check Out'}
                          </>
                        )}
                      </button>
                    )}

                    {/* Already checked out message */}
                    {todayRecord.checkOut && (
                      <div className="text-center py-4">
                        <FiCheckCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">
                          {language === 'ru' ? 'Рабочий день завершён' : 'Work day completed'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Location Status */}
                    <div className="flex items-center justify-center gap-3 py-4">
                      {gettingLocation ? (
                        <>
                          <FiLoader className="animate-spin" size={20} />
                          <span className="text-white/80">
                            {language === 'ru' ? 'Получение геолокации...' : 'Getting location...'}
                          </span>
                        </>
                      ) : locationError ? (
                        <>
                          <FiAlertCircle size={20} className="text-yellow-300" />
                          <span className="text-yellow-200 text-sm">{locationError}</span>
                        </>
                      ) : location ? (
                        <>
                          <FiMapPin size={20} className="text-green-300" />
                          <span className="text-green-200 text-sm">
                            {language === 'ru' ? 'Геолокация доступна' : 'Location available'}
                          </span>
                        </>
                      ) : (
                        <>
                          <FiMapPin size={20} className="text-white/60" />
                          <span className="text-white/60 text-sm">
                            {language === 'ru' ? 'Геолокация будет запрошена' : 'Location will be requested'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Check In Button */}
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {checkingIn ? (
                        <>
                          <FiLoader className="animate-spin" size={20} />
                          {gettingLocation
                            ? (language === 'ru' ? 'Получение геолокации...' : 'Getting location...')
                            : (language === 'ru' ? 'Отметка...' : 'Checking in...')
                          }
                        </>
                      ) : (
                        <>
                          <FiLogIn size={20} />
                          {language === 'ru' ? 'Отметить приход' : 'Check In'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Month Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                    <FiCheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthStats.present}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Присутствий' : 'Present'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl">
                    <FiAlertCircle className="text-red-600 dark:text-red-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthStats.absent}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Пропусков' : 'Absent'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
                    <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthStats.late}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Опозданий' : 'Late'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                    <FiClock className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(monthStats.totalHours)}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Часов' : 'Hours'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <FiChevronLeft size={20} className="text-gray-600 dark:text-slate-400" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {monthName}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <FiChevronRight size={20} className="text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before start of month */}
              {Array.from({ length: (firstDayOfMonth + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 h-24 border-b border-r border-gray-50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50" />
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
                    className={`p-2 h-24 border-b border-r border-gray-50 dark:border-slate-700/50 transition-colors ${
                      isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' :
                      isWeekend ? 'bg-gray-50 dark:bg-slate-800/50' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-indigo-600 dark:text-indigo-400' :
                      isWeekend ? 'text-gray-400 dark:text-slate-500' :
                      'text-gray-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </div>
                    {dayAttendance && (
                      <div className="space-y-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(dayAttendance.status)}`}>
                          {dayAttendance.status === 'Present' ? (language === 'ru' ? 'Был' : 'P') :
                           dayAttendance.status === 'Late' ? (language === 'ru' ? 'Опозд' : 'L') :
                           dayAttendance.status === 'Working' ? (language === 'ru' ? 'Работ' : 'W') :
                           dayAttendance.status === 'Absent' ? (language === 'ru' ? 'Нет' : 'A') : dayAttendance.status}
                        </span>
                        {dayAttendance.hoursWorked && (
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {formatHours(dayAttendance.hoursWorked)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-500" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {language === 'ru' ? 'Присутствовал' : 'Present'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {language === 'ru' ? 'Опоздание' : 'Late'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {language === 'ru' ? 'Работает' : 'Working'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {language === 'ru' ? 'Отсутствовал' : 'Absent'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab (for managers) */}
        {activeTab === 'team' && canManage && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <FiCalendar className="text-gray-400 dark:text-slate-500" size={20} />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Team Attendance Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Сотрудник' : 'Employee'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Приход' : 'Check In'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Уход' : 'Check Out'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Часы' : 'Hours'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Статус' : 'Status'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Локация' : 'Location'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <FiUsers size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                          <p className="text-gray-500 dark:text-slate-400">
                            {language === 'ru' ? 'Нет записей за эту дату' : 'No attendance records for this date'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {record.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {record.user?.name || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                  {record.user?.role || '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiLogIn className="text-green-500" size={16} />
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatTime(record.checkIn)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiLogOut className="text-red-500" size={16} />
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatTime(record.checkOut)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatHours(record.hoursWorked)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {record.location ? (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <FiMapPin size={14} />
                                <span className="text-xs">{language === 'ru' ? 'Есть' : 'Yes'}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500 text-xs">
                                {language === 'ru' ? 'Нет' : 'No'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
