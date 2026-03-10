'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave, FiLock } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

export default function SettingsPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseId: profile.supabaseId,
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account settings" />

      <div className="p-6 max-w-2xl">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline-block mr-2" size={16} />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline-block mr-2" size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline-block mr-2" size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+7 (XXX) XXX-XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiBriefcase className="inline-block mr-2" size={16} />
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                <option value="Executive">Executive</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Events">Events</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={profile?.role || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Contact admin to change role</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Account Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Account Type</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.isDemo ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {profile?.isDemo ? 'Demo Account' : 'Regular Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg">
                <FiLock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Last changed: Never</p>
              </div>
            </div>
            <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
