'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  FiDownload, FiSearch, FiCheck, FiX, FiCalendar,
  FiMapPin, FiUsers, FiLoader, FiFileText, FiCopy,
  FiCheckCircle, FiXCircle, FiClock, FiExternalLink,
  FiAlertCircle
} from 'react-icons/fi'

interface Event {
  id: string
  title: string
  startDate: string
  endDate?: string
  locationVenue?: string
  locationCity?: string
  status: string
  type: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  companyPosition?: string
  category: string
}

interface Registration {
  id: string
  eventId: string
  memberId: string
  registeredAt: string
  attended: boolean
  ticketType?: string
  paymentStatus: 'Pending' | 'Paid' | 'Completed' | 'Cancelled' | 'Refunded' | 'Failed'
  member: Member
}

interface TicketsTabProps {
  t: (ns: string, key: string) => string
  language: string
}

const STATUS_MAP = {
  Pending: { label_ru: 'Ожидает', label_en: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FiClock },
  Completed: { label_ru: 'Одобрено', label_en: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiCheckCircle },
  Paid: { label_ru: 'Оплачено', label_en: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiCheckCircle },
  Cancelled: { label_ru: 'Отклонено', label_en: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiXCircle },
  Refunded: { label_ru: 'Возврат', label_en: 'Refunded', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: FiXCircle },
  Failed: { label_ru: 'Ошибка', label_en: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiAlertCircle },
}

export default function TicketsTab({ t, language }: TicketsTabProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Fetch events
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        if (data.success) setEvents(data.data || [])
      } catch {
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  // Fetch registrations
  const fetchRegistrations = useCallback(async (eventId: string) => {
    setLoadingRegs(true)
    try {
      const res = await fetch(`/api/tickets?eventId=${eventId}`)
      const data = await res.json()
      if (data.success) {
        setRegistrations(data.data || [])
        setSelectedEvent(data.event)
      }
    } catch {
      toast.error('Failed to load registrations')
    } finally {
      setLoadingRegs(false)
    }
  }, [])

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId)
    if (eventId) fetchRegistrations(eventId)
    else { setRegistrations([]); setSelectedEvent(null) }
  }

  // Approve registration — generates PDF and downloads it
  const handleApprove = async (regId: string) => {
    setProcessingIds(prev => new Set(prev).add(regId))
    try {
      const res = await fetch(`/api/tickets/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const data = await res.json()

      if (data.success) {
        // Download PDF
        if (data.pdf) {
          const link = document.createElement('a')
          link.href = data.pdf
          const memberName = data.member ? `${data.member.firstName}-${data.member.lastName}` : 'ticket'
          link.download = `ticket-${memberName}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        // Update local state
        setRegistrations(prev => prev.map(r =>
          r.id === regId ? { ...r, paymentStatus: 'Completed' } : r
        ))
        toast.success(language === 'ru' ? 'Одобрено! Билет скачан.' : 'Approved! Ticket downloaded.')
      } else {
        toast.error(data.message || 'Failed to approve')
      }
    } catch {
      toast.error('Failed to approve registration')
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(regId); return n })
    }
  }

  // Reject registration
  const handleReject = async (regId: string) => {
    setProcessingIds(prev => new Set(prev).add(regId))
    try {
      const res = await fetch(`/api/tickets/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })
      const data = await res.json()

      if (data.success) {
        setRegistrations(prev => prev.map(r =>
          r.id === regId ? { ...r, paymentStatus: 'Cancelled' } : r
        ))
        toast.success(language === 'ru' ? 'Регистрация отклонена' : 'Registration rejected')
      } else {
        toast.error(data.message || 'Failed')
      }
    } catch {
      toast.error('Failed to reject')
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(regId); return n })
    }
  }

  // Re-download ticket for already approved
  const handleDownloadTicket = async (regId: string) => {
    setProcessingIds(prev => new Set(prev).add(regId))
    try {
      const res = await fetch(`/api/tickets/${regId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const data = await res.json()
      if (data.success && data.pdf) {
        const link = document.createElement('a')
        link.href = data.pdf
        const memberName = data.member ? `${data.member.firstName}-${data.member.lastName}` : 'ticket'
        link.download = `ticket-${memberName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(language === 'ru' ? 'Билет скачан' : 'Ticket downloaded')
      }
    } catch {
      toast.error('Failed to download')
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(regId); return n })
    }
  }

  // Bulk approve all pending
  const handleApproveAll = async () => {
    const pending = filteredRegistrations.filter(r => r.paymentStatus === 'Pending')
    if (pending.length === 0) return

    for (const reg of pending) {
      await handleApprove(reg.id)
    }
  }

  // Copy registration link
  const copyRegLink = () => {
    if (!selectedEventId) return
    const url = `${window.location.origin}/register/${selectedEventId}`
    navigator.clipboard.writeText(url)
    toast.success(language === 'ru' ? 'Ссылка скопирована!' : 'Link copied!')
  }

  // Filter
  const filteredRegistrations = registrations.filter(r => {
    if (statusFilter !== 'all' && r.paymentStatus !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.member.firstName.toLowerCase().includes(q) ||
      r.member.lastName.toLowerCase().includes(q) ||
      r.member.email.toLowerCase().includes(q) ||
      (r.member.companyName || '').toLowerCase().includes(q)
    )
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'ru' ? 'ru-RU' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    )
  }

  const pendingCount = registrations.filter(r => r.paymentStatus === 'Pending').length
  const approvedCount = registrations.filter(r => r.paymentStatus === 'Completed' || r.paymentStatus === 'Paid').length
  const attendedCount = registrations.filter(r => r.attended).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-indigo-500" />
          {language === 'ru' ? 'Билеты и регистрации' : 'Tickets & Registrations'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {language === 'ru'
            ? 'Управление регистрациями на мероприятия. Одобряйте заявки и скачивайте PDF билеты с QR-кодами.'
            : 'Manage event registrations. Approve applications and download PDF tickets with QR codes.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {language === 'ru' ? 'Мероприятие' : 'Event'}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">{language === 'ru' ? '— Выберите мероприятие —' : '— Select event —'}</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({formatDate(ev.startDate)})
                </option>
              ))}
            </select>
          </div>

          {/* Registration link + event info */}
          {selectedEvent && (
            <div className="flex flex-col justify-end gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <FiCalendar className="w-3.5 h-3.5" /> {formatDate(selectedEvent.startDate)}
                </span>
                {selectedEvent.locationVenue && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <FiMapPin className="w-3.5 h-3.5" /> {selectedEvent.locationVenue}
                  </span>
                )}
              </div>
              <button
                onClick={copyRegLink}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <FiCopy className="w-3.5 h-3.5" />
                {language === 'ru' ? 'Скопировать ссылку регистрации' : 'Copy registration link'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats + Registrations */}
      {selectedEventId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-white">{registrations.length}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{language === 'ru' ? 'Всего заявок' : 'Total'}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-800/30 p-4 text-center">
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
              <p className="text-xs text-amber-500 font-semibold mt-1">{language === 'ru' ? 'Ожидают' : 'Pending'}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-800/30 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">{approvedCount}</p>
              <p className="text-xs text-emerald-500 font-semibold mt-1">{language === 'ru' ? 'Одобрено' : 'Approved'}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-800/30 p-4 text-center">
              <p className="text-2xl font-black text-blue-600">{attendedCount}</p>
              <p className="text-xs text-blue-500 font-semibold mt-1">{language === 'ru' ? 'Присутствовали' : 'Attended'}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                <option value="all">{language === 'ru' ? 'Все статусы' : 'All statuses'}</option>
                <option value="Pending">{language === 'ru' ? 'Ожидающие' : 'Pending'}</option>
                <option value="Completed">{language === 'ru' ? 'Одобренные' : 'Approved'}</option>
                <option value="Cancelled">{language === 'ru' ? 'Отклонённые' : 'Rejected'}</option>
              </select>

              {/* Approve all pending */}
              {pendingCount > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  {language === 'ru' ? `Одобрить все (${pendingCount})` : `Approve all (${pendingCount})`}
                </button>
              )}

              {/* Scan link */}
              <a
                href="/scan"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FiExternalLink className="w-3.5 h-3.5" />
                {language === 'ru' ? 'QR сканер' : 'QR Scanner'}
              </a>
            </div>

            {/* Table */}
            {loadingRegs ? (
              <div className="flex items-center justify-center py-16">
                <FiLoader className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiUsers className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {registrations.length === 0
                    ? (language === 'ru' ? 'Нет регистраций. Отправьте ссылку гостям!' : 'No registrations yet. Share the link with guests!')
                    : (language === 'ru' ? 'Ничего не найдено' : 'No results found')}
                </p>
                {registrations.length === 0 && (
                  <button onClick={copyRegLink} className="mt-3 text-xs text-indigo-500 font-semibold hover:text-indigo-600 flex items-center gap-1">
                    <FiCopy className="w-3 h-3" /> {language === 'ru' ? 'Скопировать ссылку' : 'Copy link'}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Участник' : 'Attendee'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                        {language === 'ru' ? 'Компания' : 'Company'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Статус' : 'Status'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Посещение' : 'Attended'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'ru' ? 'Действия' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => {
                      const statusInfo = STATUS_MAP[reg.paymentStatus] || STATUS_MAP.Pending
                      const StatusIcon = statusInfo.icon
                      const isProcessing = processingIds.has(reg.id)
                      const isPending = reg.paymentStatus === 'Pending'
                      const isApproved = reg.paymentStatus === 'Completed' || reg.paymentStatus === 'Paid'

                      return (
                        <tr key={reg.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {reg.member.firstName[0]}{reg.member.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                  {reg.member.firstName} {reg.member.lastName}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{reg.member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {reg.member.companyName ? (
                              <div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{reg.member.companyName}</p>
                                {reg.member.companyPosition && (
                                  <p className="text-xs text-slate-400">{reg.member.companyPosition}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {language === 'ru' ? statusInfo.label_ru : statusInfo.label_en}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {reg.attended ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <FiCheck className="w-4 h-4 text-emerald-600" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800">
                                <FiX className="w-4 h-4 text-slate-400" />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {isProcessing ? (
                                <FiLoader className="w-4 h-4 animate-spin text-indigo-500" />
                              ) : (
                                <>
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(reg.id)}
                                        title={language === 'ru' ? 'Одобрить' : 'Approve'}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                      >
                                        <FiCheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleReject(reg.id)}
                                        title={language === 'ru' ? 'Отклонить' : 'Reject'}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      >
                                        <FiXCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  {isApproved && (
                                    <button
                                      onClick={() => handleDownloadTicket(reg.id)}
                                      title={language === 'ru' ? 'Скачать билет' : 'Download ticket'}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                      <FiDownload className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {registrations.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {language === 'ru' ? 'Всего:' : 'Total:'} {registrations.length} |{' '}
                  {language === 'ru' ? 'Ожидают:' : 'Pending:'} {pendingCount} |{' '}
                  {language === 'ru' ? 'Одобрено:' : 'Approved:'} {approvedCount} |{' '}
                  {language === 'ru' ? 'Посетили:' : 'Attended:'} {attendedCount}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
