'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  FiCalendar, FiMapPin, FiUsers, FiUser, FiMail, FiPhone,
  FiBriefcase, FiCheck, FiAlertCircle, FiLoader, FiSend
} from 'react-icons/fi'

interface EventInfo {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate?: string
  locationVenue?: string
  locationCity?: string
  locationIsVirtual?: boolean
  capacity: number
  _count?: { registrations: number }
}

export default function PublicRegistrationPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyPosition: '',
  })

  // Detect language from browser
  const isRu = typeof navigator !== 'undefined' && navigator.language?.startsWith('ru')

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/register/${eventId}`)
        const data = await res.json()
        if (data.success) {
          setEvent(data.data)
        } else {
          setError(isRu ? 'Мероприятие не найдено' : 'Event not found')
        }
      } catch {
        setError(isRu ? 'Ошибка загрузки' : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    if (eventId) loadEvent()
  }, [eventId, isRu])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...form }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        setSubmitError(data.message || (isRu ? 'Ошибка регистрации' : 'Registration failed'))
      }
    } catch {
      setSubmitError(isRu ? 'Ошибка сервера' : 'Server error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      isRu ? 'ru-RU' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    )
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  // --- Error ---
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{isRu ? 'Мероприятие не найдено' : 'Event Not Found'}</h2>
          <p className="text-sm text-slate-500">{error || (isRu ? 'Проверьте ссылку' : 'Please check the link')}</p>
        </div>
      </div>
    )
  }

  // --- Cancelled ---
  if (event.status === 'Cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h2>
          <p className="text-sm text-red-500 font-medium">{isRu ? 'Мероприятие отменено' : 'This event has been cancelled'}</p>
        </div>
      </div>
    )
  }

  // --- Success ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <FiCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            {isRu ? 'Регистрация отправлена!' : 'Registration Submitted!'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {isRu
              ? 'Ваша заявка на участие отправлена. После подтверждения организатором вы получите билет с QR-кодом.'
              : 'Your registration has been submitted. You will receive your ticket with a QR code after the organizer approves it.'}
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-sm font-semibold text-indigo-700">{event.title}</p>
            <p className="text-xs text-indigo-500 mt-1">{formatDate(event.startDate)}</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Full capacity ---
  const isFull = event.capacity > 0 && event._count && event._count.registrations >= event.capacity

  // --- Registration Form ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">ACIK</span>
        </div>

        {/* Event info card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">{event.type}</span>
            <h1 className="text-2xl font-black mt-2 leading-tight">{event.title}</h1>
            {event.description && (
              <p className="text-sm text-indigo-100 mt-2 line-clamp-3">{event.description}</p>
            )}
          </div>

          {/* Event details */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FiCalendar className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            {event.locationVenue && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiMapPin className="w-4 h-4 text-indigo-500" />
                <span>{[event.locationVenue, event.locationCity].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {event.locationIsVirtual && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiMapPin className="w-4 h-4 text-emerald-500" />
                <span>{isRu ? 'Онлайн' : 'Virtual'}</span>
              </div>
            )}
            {event.capacity > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiUsers className="w-4 h-4 text-indigo-500" />
                <span>{event._count?.registrations || 0} / {event.capacity}</span>
              </div>
            )}
          </div>

          {/* Registration form */}
          {isFull ? (
            <div className="px-6 py-10 text-center">
              <FiUsers className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                {isRu ? 'Все места заняты' : 'Event is full'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {isRu ? 'К сожалению, регистрация закрыта' : 'Registration is closed'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {isRu ? 'Регистрация' : 'Registration'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {isRu ? '* — обязательные поля' : '* — required fields'}
              </p>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {isRu ? 'Имя' : 'First Name'} *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder={isRu ? 'Иван' : 'John'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {isRu ? 'Фамилия' : 'Last Name'} *
                  </label>
                  <input
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={isRu ? 'Иванов' : 'Doe'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {isRu ? 'Телефон' : 'Phone'} *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {isRu ? 'Компания' : 'Company'}
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.companyName}
                      onChange={e => setForm({ ...form, companyName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder={isRu ? 'Название' : 'Company name'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {isRu ? 'Должность' : 'Position'}
                  </label>
                  <input
                    value={form.companyPosition}
                    onChange={e => setForm({ ...form, companyPosition: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={isRu ? 'Директор' : 'CEO'}
                  />
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {submitting ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
                {submitting
                  ? (isRu ? 'Отправка...' : 'Submitting...')
                  : (isRu ? 'Зарегистрироваться' : 'Register')}
              </button>

              <p className="text-[10px] text-center text-slate-400 mt-2">
                {isRu
                  ? 'После подтверждения организатором вы получите билет с QR-кодом'
                  : 'You will receive a ticket with QR code after organizer approval'}
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Powered by ACIK Management System
        </div>
      </div>
    </div>
  )
}
