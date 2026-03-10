'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  FiPlus, FiSearch, FiX, FiMail, FiPhone, FiGrid, FiList,
  FiEdit2, FiTrash2, FiUsers, FiUserCheck, FiUserX, FiStar,
  FiBriefcase, FiCalendar, FiMapPin, FiMoreVertical, FiAward
} from 'react-icons/fi'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName?: string
  companyPosition?: string
  category: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
  status: 'Active' | 'Inactive' | 'Suspended' | 'Alumni'
  joinDate: string
  address?: string
  notes?: string
  createdAt: string
}

const categoryOptions = [
  { value: 'Diamond', label: 'Diamond', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300', icon: '💎' },
  { value: 'Platinum', label: 'Platinum', color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-400', icon: '🥈' },
  { value: 'Gold', label: 'Gold', color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-400', icon: '🥇' },
  { value: 'Silver', label: 'Silver', color: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-300', icon: '🥈' },
  { value: 'Bronze', label: 'Bronze', color: 'bg-gradient-to-r from-orange-100 to-amber-50 text-orange-700 border-orange-300', icon: '🥉' },
]

const statusOptions = [
  { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { value: 'Inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  { value: 'Suspended', label: 'Suspended', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  { value: 'Alumni', label: 'Alumni', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
]

export default function MembersPage() {
  const { profile } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyPosition: '',
    category: 'Bronze' as Member['category'],
    status: 'Active' as Member['status'],
    joinDate: new Date().toISOString().split('T')[0],
    address: '',
    notes: '',
  })

  const canManage = profile?.role && ['Admin', 'President', 'CEO'].includes(profile.role)

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const res = await fetch(`/api/members?${params}`)
      const data = await res.json()
      if (data.success) {
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, categoryFilter])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMembers()
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, statusFilter, categoryFilter, fetchMembers])

  const openCreateModal = () => {
    setEditingMember(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      companyPosition: '',
      category: 'Bronze',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      address: '',
      notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      companyName: member.companyName || '',
      companyPosition: member.companyPosition || '',
      category: member.category,
      status: member.status,
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
      address: member.address || '',
      notes: member.notes || '',
    })
    setShowModal(true)
    setOpenDropdown(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('First name, last name, and email are required')
      return
    }

    setSaving(true)
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingMember ? 'Member updated!' : 'Member added!')
        setShowModal(false)
        fetchMembers()
      } else {
        toast.error(data.message || 'Failed to save member')
      }
    } catch (error) {
      console.error('Error saving member:', error)
      toast.error('Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMember) return

    setSaving(true)
    try {
      const res = await fetch(`/api/members/${deletingMember.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Member removed!')
        setShowDeleteModal(false)
        setDeletingMember(null)
        fetchMembers()
      } else {
        toast.error(data.message || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Failed to remove member')
    } finally {
      setSaving(false)
    }
  }

  const getCategoryStyle = (category: string) => {
    return categoryOptions.find(c => c.value === category) || categoryOptions[4]
  }

  const getStatusStyle = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[1]
  }

  // Stats
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    inactive: members.filter(m => m.status === 'Inactive').length,
    diamond: members.filter(m => m.category === 'Diamond').length,
    platinum: members.filter(m => m.category === 'Platinum').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Members" subtitle="Manage organization members" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <FiUsers className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Members</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <FiUserCheck className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-xl">
                <FiUserX className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <FiAward className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.diamond}</p>
                <p className="text-sm text-gray-500">Diamond</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <FiStar className="text-slate-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.platinum}</p>
                <p className="text-sm text-gray-500">Platinum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 min-w-[200px]">
                <FiSearch className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="">All Status</option>
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categoryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {canManage && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-200"
              >
                <FiPlus size={18} />
                <span>Add Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500">Loading members...</p>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center">
            <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No members found</p>
            {canManage && (
              <button
                onClick={openCreateModal}
                className="text-indigo-600 hover:underline"
              >
                Add your first member
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => {
              const categoryStyle = getCategoryStyle(member.category)
              const statusStyle = getStatusStyle(member.status)

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative"
                >
                  {canManage && (
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiMoreVertical size={18} />
                      </button>

                      {openDropdown === member.id && (
                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[140px]">
                          <button
                            onClick={() => openEditModal(member)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeletingMember(member)
                              setShowDeleteModal(true)
                              setOpenDropdown(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <FiTrash2 size={14} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-lg">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {member.companyPosition || 'Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryStyle.color}`}>
                      {categoryStyle.icon} {member.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {member.status}
                    </span>
                  </div>

                  {member.companyName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <FiBriefcase size={14} className="text-gray-400" />
                      <span className="truncate">{member.companyName}</span>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiMail size={14} className="text-gray-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiPhone size={14} className="text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiCalendar size={14} />
                      <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Member</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Company</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined</th>
                  {canManage && <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const categoryStyle = getCategoryStyle(member.category)
                  const statusStyle = getStatusStyle(member.status)

                  return (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.companyPosition || 'Member'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="text-gray-900">{member.email}</p>
                          <p className="text-gray-500">{member.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{member.companyName || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryStyle.color}`}>
                          {categoryStyle.icon} {member.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </td>
                      {canManage && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingMember(member)
                                setShowDeleteModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-2" size={14} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" size={14} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="+7 (XXX) XXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiBriefcase className="inline mr-2" size={14} />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Company Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.companyPosition}
                    onChange={(e) => setFormData({ ...formData, companyPosition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="CEO, Director, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Member['category'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {categoryOptions.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Member['status'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" size={14} />
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" size={14} />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Additional notes about this member..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Member</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to remove <span className="font-medium text-gray-900">"{deletingMember.firstName} {deletingMember.lastName}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingMember(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside dropdown to close */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  )
}
