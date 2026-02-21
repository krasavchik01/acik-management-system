'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiPlus, FiEdit2, FiTrash2, FiVideo, FiX } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

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

  const canManage = profile && ['Admin', 'President', 'CEO', 'ProjectManager'].includes(profile.role)

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
        toast.success(editingEvent ? 'Event updated!' : 'Event created!')
        setShowModal(false)
        resetForm()
        fetchEvents()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Event deleted!')
        fetchEvents()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to delete event')
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
      case 'Planned': return 'bg-blue-100 text-blue-800'
      case 'Ongoing': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <Header
        title="Events"
        subtitle="Manage organization events"
        action={canManage ? {
          label: 'New Event',
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No events yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(event)} className="p-2 text-gray-400 hover:text-blue-600">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <FiMapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.isVirtual && (
                    <div className="flex items-center gap-2">
                      <FiVideo size={14} />
                      <span>Virtual Event</span>
                    </div>
                  )}
                  {event.maxAttendees && (
                    <div className="flex items-center gap-2">
                      <FiUsers size={14} />
                      <span>Max {event.maxAttendees} attendees</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{event.type}</span>
                  {event.budget > 0 && (
                    <span className="text-sm font-medium text-gray-700">${event.budget.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Event location"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={formData.isVirtual}
                  onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isVirtual" className="text-sm text-gray-700">Virtual Event</label>
              </div>
              {formData.isVirtual && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Virtual Link</label>
                  <input
                    type="url"
                    value={formData.virtualLink}
                    onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
