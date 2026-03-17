'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiDollarSign, FiMail, FiPhone, FiGlobe, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { useLanguage } from '@/lib/i18n'

interface Sponsor {
  id: string
  name: string
  logo: string | null
  website: string | null
  description: string | null
  tier: string
  status: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  contractStart: string | null
  contractEnd: string | null
  totalCommitted: number
  totalReceived: number
  notes: string | null
}

export default function SponsorsPage() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    tier: 'Bronze',
    status: 'Active',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contractStart: '',
    contractEnd: '',
    totalCommitted: '',
    totalReceived: '',
    notes: '',
  })

  const canManage = profile && ['Admin', 'President', 'CEO', 'ProjectManager'].includes(profile.role)

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const res = await fetch('/api/sponsors')
      const data = await res.json()
      if (data.success) {
        setSponsors(data.data)
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSponsor ? `/api/sponsors/${editingSponsor.id}` : '/api/sponsors'
      const method = editingSponsor ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalCommitted: formData.totalCommitted ? parseFloat(formData.totalCommitted) : 0,
          totalReceived: formData.totalReceived ? parseFloat(formData.totalReceived) : 0,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingSponsor ? t('sponsors', 'sponsorUpdated') : t('sponsors', 'sponsorCreated'))
        setShowModal(false)
        resetForm()
        fetchSponsors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('sponsors', 'failedToSave'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('sponsors', 'deleteConfirm'))) return
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('sponsors', 'sponsorDeleted'))
        fetchSponsors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('sponsors', 'failedToDelete'))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      description: '',
      tier: 'Bronze',
      status: 'Active',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contractStart: '',
      contractEnd: '',
      totalCommitted: '',
      totalReceived: '',
      notes: '',
    })
    setEditingSponsor(null)
  }

  const openEditModal = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor)
    setFormData({
      name: sponsor.name,
      website: sponsor.website || '',
      description: sponsor.description || '',
      tier: sponsor.tier,
      status: sponsor.status,
      contactName: sponsor.contactName || '',
      contactEmail: sponsor.contactEmail || '',
      contactPhone: sponsor.contactPhone || '',
      contractStart: sponsor.contractStart?.split('T')[0] || '',
      contractEnd: sponsor.contractEnd?.split('T')[0] || '',
      totalCommitted: sponsor.totalCommitted?.toString() || '',
      totalReceived: sponsor.totalReceived?.toString() || '',
      notes: sponsor.notes || '',
    })
    setShowModal(true)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Platinum': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'Gold': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'Silver': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
      case 'Bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-400'
    }
  }

  // Calculate totals
  const totalCommitted = sponsors.reduce((sum, s) => sum + (s.totalCommitted || 0), 0)
  const totalReceived = sponsors.reduce((sum, s) => sum + (s.totalReceived || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header
        title={t('sponsors', 'title')}
        subtitle={t('sponsors', 'subtitle')}
        action={canManage ? {
          label: t('sponsors', 'newSponsor'),
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiStar className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('sponsors', 'totalSponsors')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{sponsors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiDollarSign className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('sponsors', 'totalCommitted')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${totalCommitted.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('sponsors', 'totalReceived')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${totalReceived.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">{t('sponsors', 'loadingSponsors')}</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiStar className="text-gray-400 dark:text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('sponsors', 'noSponsorsFound')}</h3>
            <p className="text-gray-500 dark:text-slate-400">{t('sponsors', 'noSponsors')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all group relative">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{sponsor.name}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${getTierColor(sponsor.tier)}`}>
                      {sponsor.tier}
                    </span>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(sponsor)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(sponsor.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {sponsor.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 line-clamp-2">{sponsor.description}</p>
                )}

                <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                  {sponsor.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                        <FiMail size={14} className="text-gray-400 dark:text-slate-500" />
                      </div>
                      <span className="truncate">{sponsor.contactEmail}</span>
                    </div>
                  )}
                  {sponsor.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                        <FiPhone size={14} className="text-gray-400 dark:text-slate-500" />
                      </div>
                      <span className="truncate">{sponsor.contactPhone}</span>
                    </div>
                  )}
                  {sponsor.website && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <FiGlobe size={14} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate">
                        {sponsor.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">{t('sponsors', 'committed')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">${sponsor.totalCommitted?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">{t('sponsors', 'received')}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">${sponsor.totalReceived?.toLocaleString() || 0}</span>
                  </div>
                  {sponsor.totalCommitted > 0 && (
                    <div className="mt-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, ((sponsor.totalReceived || 0) / sponsor.totalCommitted) * 100)}%` }}
                      />
                    </div>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingSponsor ? t('sponsors', 'editSponsor') : t('sponsors', 'newSponsor')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Diamond">Diamond</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Total Committed ($)</label>
                  <input
                    type="number"
                    value={formData.totalCommitted}
                    onChange={(e) => setFormData({ ...formData, totalCommitted: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Total Received ($)</label>
                  <input
                    type="number"
                    value={formData.totalReceived}
                    onChange={(e) => setFormData({ ...formData, totalReceived: e.target.value })}
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
                  {editingSponsor ? t('sponsors', 'updateSponsor') : t('sponsors', 'createSponsor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
