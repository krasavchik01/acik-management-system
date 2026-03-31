'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiPlus, FiEdit2, FiTrash2, FiVideo, FiX } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { useLanguage } from '@/lib/i18n'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  startDate: string
  endDate: string | null
  location: string | null
  isVirtual: boolean
  virtualLink: string | null
  maxAttendees: number | null
  budget: number
  tags: string[]
}

export default function EventsPage() {
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Meeting',
    status: 'Planned',
    startDate: '',
    endDate: '',
    location: '',
    isVirtual: false,
    virtualLink: '',
    maxAttendees: '',
    budget: '',
  })

  const isAdminRole = profile && ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager'].includes(profile.role)
  const permissions = profile?.permissions || []
  const canManage = isAdminRole || permissions.includes('events.manage')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          budget: formData.budget ? parseFloat(formData.budget) : 0,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingEvent ? t('events', 'eventUpdated') : t('events', 'eventCreated'))
        setShowModal(false)
        resetForm()
        fetchEvents()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('events', 'failedToSave'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('events', 'deleteConfirm'))) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('events', 'eventDeleted'))
        fetchEvents()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('events', 'failedToDelete'))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Meeting',
      status: 'Planned',
      startDate: '',
      endDate: '',
      location: '',
      isVirtual: false,
      virtualLink: '',
      maxAttendees: '',
      budget: '',
    })
    setEditingEvent(null)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      status: event.status,
      startDate: event.startDate?.split('T')[0] || '',
      endDate: event.endDate?.split('T')[0] || '',
      location: event.location || '',
      isVirtual: event.isVirtual,
      virtualLink: event.virtualLink || '',
      maxAttendees: event.maxAttendees?.toString() || '',
      budget: event.budget?.toString() || '',
    })
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-400'
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Planned': return t('events', 'statusPlanned')
      case 'Ongoing': return t('events', 'statusOngoing')
      case 'Completed': return t('events', 'statusCompleted')
      case 'Cancelled': return t('events', 'statusCancelled')
      default: return status
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={t('events', 'title')}
        subtitle={t('events', 'subtitle')}
        action={canManage ? {
          label: t('events', 'newEvent'),
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">{t('events', 'loadingEvents')}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="text-gray-400 dark:text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('events', 'noEventsFound')}</h3>
            <p className="text-gray-500 dark:text-slate-400">{t('events', 'noEventsScheduled')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all group relative">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{event.title}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(event)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                      <FiCalendar size={14} className="text-gray-400 dark:text-slate-500" />
                    </div>
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1.5 bg-gray-50 dark:bg-slate-700/30 rounded-lg flex-shrink-0">
                        <FiMapPin size={14} className="text-gray-400 dark:text-slate-500" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.isVirtual && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <FiVideo size={14} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">{t('events', 'virtualEvent')}</span>
                    </div>
                  )}
                  {event.maxAttendees && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <FiUsers size={14} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>{t('events', 'maxAttendees')}: {event.maxAttendees}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full uppercase tracking-wider font-bold border border-indigo-100 dark:border-indigo-800/50">{event.type}</span>
                  {event.budget > 0 && (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${event.budget.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700/50">
             <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingEvent ? t('events', 'editEvent') : t('events', 'newEvent')}</h2>
               <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all">
                <FiX size={20} />
              </button>
            </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-5">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'titleRequired')}</label>
                 <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  required
                />
               </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'descriptionLabel')}</label>
                 <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  rows={3}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'typeLabel')}</label>
                   <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Social">Social</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                   </select>
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'statusLabel')}</label>
                   <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                   >
                    <option value="Planned">{t('events', 'statusPlanned')}</option>
                    <option value="Ongoing">{t('events', 'statusOngoing')}</option>
                    <option value="Completed">{t('events', 'statusCompleted')}</option>
                    <option value="Cancelled">{t('events', 'statusCancelled')}</option>
                   </select>
                 </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'startDateRequired')}</label>
                   <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    required
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'endDateLabel')}</label>
                   <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
               </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'locationLabel')}</label>
                 <input
                   type="text"
                   value={formData.location}
                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                   className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder={t('events', 'locationPlaceholder')}
                 />
               </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={formData.isVirtual}
                   onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                   className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                 />
                <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">{t('events', 'isVirtualLabel')}</label>
               </div>
               {formData.isVirtual && (
                 <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'virtualLinkLabel')}</label>
                   <input
                    type="text"
                    value={formData.virtualLink}
                    onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'maxAttendeesLabel')}</label>
                   <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('events', 'budgetLabel')}</label>
                   <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                   onClick={() => setShowModal(false)}
                   className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                 >
                  {t('common', 'cancel')}
                 </button>
                <button
                   type="submit"
                   className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
                 >
                  {editingEvent ? t('events', 'updateEvent') : t('events', 'createEvent')}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
