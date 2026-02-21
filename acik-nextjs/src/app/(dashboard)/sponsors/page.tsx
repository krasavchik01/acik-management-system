'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiDollarSign, FiMail, FiPhone, FiGlobe, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

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
        toast.success(editingSponsor ? 'Sponsor updated!' : 'Sponsor created!')
        setShowModal(false)
        resetForm()
        fetchSponsors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to save sponsor')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Sponsor deleted!')
        fetchSponsors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to delete sponsor')
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
      case 'Diamond': return 'bg-purple-100 text-purple-800'
      case 'Platinum': return 'bg-gray-200 text-gray-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-600'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate totals
  const totalCommitted = sponsors.reduce((sum, s) => sum + (s.totalCommitted || 0), 0)
  const totalReceived = sponsors.reduce((sum, s) => sum + (s.totalReceived || 0), 0)

  return (
    <div>
      <Header
        title="Sponsors"
        subtitle="Manage organization sponsors"
        action={canManage ? {
          label: 'New Sponsor',
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiStar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sponsors</p>
                <p className="text-2xl font-bold text-gray-900">{sponsors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiDollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Committed</p>
                <p className="text-2xl font-bold text-blue-600">${totalCommitted.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Received</p>
                <p className="text-2xl font-bold text-green-600">${totalReceived.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No sponsors yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sponsor.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(sponsor.tier)}`}>
                      {sponsor.tier}
                    </span>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(sponsor)} className="p-2 text-gray-400 hover:text-blue-600">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(sponsor.id)} className="p-2 text-gray-400 hover:text-red-600">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {sponsor.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{sponsor.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  {sponsor.contactEmail && (
                    <div className="flex items-center gap-2">
                      <FiMail size={14} />
                      <span>{sponsor.contactEmail}</span>
                    </div>
                  )}
                  {sponsor.contactPhone && (
                    <div className="flex items-center gap-2">
                      <FiPhone size={14} />
                      <span>{sponsor.contactPhone}</span>
                    </div>
                  )}
                  {sponsor.website && (
                    <div className="flex items-center gap-2">
                      <FiGlobe size={14} />
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Committed:</span>
                    <span className="font-medium text-gray-900">${sponsor.totalCommitted?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Received:</span>
                    <span className="font-medium text-green-600">${sponsor.totalReceived?.toLocaleString() || 0}</span>
                  </div>
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
              <h2 className="text-lg font-semibold">{editingSponsor ? 'Edit Sponsor' : 'New Sponsor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Diamond">Diamond</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Committed ($)</label>
                  <input
                    type="number"
                    value={formData.totalCommitted}
                    onChange={(e) => setFormData({ ...formData, totalCommitted: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Received ($)</label>
                  <input
                    type="number"
                    value={formData.totalReceived}
                    onChange={(e) => setFormData({ ...formData, totalReceived: e.target.value })}
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
                  {editingSponsor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
