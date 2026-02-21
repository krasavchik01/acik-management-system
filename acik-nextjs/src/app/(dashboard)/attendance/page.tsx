'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiClock, FiCheckCircle, FiXCircle, FiUser, FiCalendar } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  notes: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export default function AttendancePage() {
  const { profile } = useAuth()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const canManage = profile && ['Admin', 'President', 'CEO', 'ProjectManager'].includes(profile.role)

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`)
      const data = await res.json()
      if (data.success) {
        setAttendance(data.data)
        // Find today's record for current user
        const today = new Date().toISOString().split('T')[0]
        if (selectedDate === today && profile) {
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

  const handleCheckIn = async () => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Checked in successfully!')
        fetchAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return
    try {
      const res = await fetch(`/api/attendance/${todayRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkOut: new Date().toISOString() }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Checked out successfully!')
        fetchAttendance()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to check out')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      case 'Late': return 'bg-yellow-100 text-yellow-800'
      case 'HalfDay': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div>
      <Header title="Attendance" subtitle="Track daily attendance" />

      <div className="p-6">
        {/* Check In/Out Card */}
        {isToday && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <h2 className="text-xl font-bold mb-2">Today's Attendance</h2>
            <p className="text-indigo-100 mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {todayRecord ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-sm text-indigo-100">Check In</p>
                    <p className="text-lg font-semibold">
                      {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '-'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-sm text-indigo-100">Check Out</p>
                    <p className="text-lg font-semibold">
                      {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : '-'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-sm text-indigo-100">Status</p>
                    <p className="text-lg font-semibold">{todayRecord.status}</p>
                  </div>
                </div>
                {!todayRecord.checkOut && (
                  <button
                    onClick={handleCheckOut}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
                  >
                    <FiClock className="inline-block mr-2" />
                    Check Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
              >
                <FiCheckCircle className="inline-block mr-2" />
                Check In
              </button>
            )}
          </div>
        )}

        {/* Date Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <FiCalendar className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Attendance List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No attendance records for this date</td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {record.user?.avatar ? (
                              <img src={record.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                              <FiUser className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.user?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{record.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
