'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPlus, FiEdit2, FiTrash2, FiX, FiFilter } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'Income' | 'Expense'
  category: string
  status: string
  date: string
  reference: string | null
  notes: string | null
}

export default function FinancePage() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState({ type: '', category: '', status: '' })
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Income' as 'Income' | 'Expense',
    category: 'Other',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  })

  const canManage = profile && ['Admin', 'President', 'CEO', 'ProjectManager'].includes(profile.role)

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.type) params.append('type', filter.type)
      if (filter.category) params.append('category', filter.category)
      if (filter.status) params.append('status', filter.status)

      const res = await fetch(`/api/finance?${params}`)
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTransaction ? `/api/finance/${editingTransaction.id}` : '/api/finance'
      const method = editingTransaction ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingTransaction ? 'Transaction updated!' : 'Transaction created!')
        setShowModal(false)
        resetForm()
        fetchTransactions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to save transaction')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Transaction deleted!')
        fetchTransactions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to delete transaction')
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'Income',
      category: 'Other',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    })
    setEditingTransaction(null)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      status: transaction.status,
      date: transaction.date,
      reference: transaction.reference || '',
      notes: transaction.notes || '',
    })
    setShowModal(true)
  }

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div>
      <Header
        title="Finance"
        subtitle="Manage organization finances"
        action={canManage ? {
          label: 'New Transaction',
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FiTrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiDollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  {canManage && <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No transactions yet</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          t.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          t.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right ${
                        t.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditModal(t)} className="p-2 text-gray-400 hover:text-blue-600">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-600">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Membership">Membership</option>
                    <option value="Events">Events</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Salary">Salary</option>
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
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Invoice #, Receipt #, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
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
                  {editingTransaction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
