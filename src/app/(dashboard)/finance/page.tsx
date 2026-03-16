'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPlus, FiEdit2, FiTrash2, FiX, FiFilter } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { useCurrency } from '@/lib/currency/CurrencyContext'
import { CurrencySwitcher } from '@/components/ui/CurrencySwitcher'
import { useLanguage } from '@/lib/i18n'

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
  const { language, t } = useLanguage()
  const { formatCurrency } = useCurrency()
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
        toast.success(editingTransaction ? t('finance', 'transactionUpdated') : t('finance', 'transactionCreated'))
        setShowModal(false)
        resetForm()
        fetchTransactions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('finance', 'failedToSave'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('finance', 'deleteConfirm'))) return
    try {
      const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('finance', 'transactionDeleted'))
        fetchTransactions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(t('finance', 'failedToDelete'))
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900/50">
      <Header
        title={t('finance', 'title')}
        subtitle={t('finance', 'subtitle')}
        action={canManage ? {
          label: t('finance', 'newTransaction'),
          onClick: () => { resetForm(); setShowModal(true) }
        } : undefined}
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'totalIncome')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiTrendingDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'totalExpenses')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                <FiDollarSign className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'balance')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className={`text-3xl font-bold ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                  <CurrencySwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-wrap items-center gap-4 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <FiFilter className="text-gray-400 dark:text-slate-500" size={16} />
            </div>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="">{t('finance', 'allTypes')}</option>
              <option value="Income">{t('finance', 'income')}</option>
              <option value="Expense">{t('finance', 'expense')}</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="pl-4 pr-8 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="">{t('finance', 'allStatuses')}</option>
              <option value="Pending">{t('common', 'pending')}</option>
              <option value="Approved">{t('projects', 'statusActive')}</option>
              <option value="Completed">{t('common', 'completed')}</option>
              <option value="Rejected">{t('projects', 'statusCancelled')}</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">{t('finance', 'loadingTransactions')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="text-gray-400 dark:text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('finance', 'noTransactionsFound')}</h3>
            <p className="text-gray-500 dark:text-slate-400">{t('finance', 'noTransactionsMatching')}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50">
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'date')}</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'description')}</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'category')}</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'type')}</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('finance', 'status')}</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('finance', 'amount')}</th>
                    {canManage && <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('finance', 'actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                        {new Date(transaction.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {transaction.description}
                        {transaction.reference && <div className="text-xs font-normal text-gray-400 dark:text-slate-500 mt-1">Ref: {transaction.reference}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                        {transaction.category === 'Sponsorship' ? t('finance', 'catSponsorship') :
                         transaction.category === 'Membership' ? t('finance', 'catMembership') :
                         transaction.category === 'Events' ? t('finance', 'catEvents') :
                         transaction.category === 'Operations' ? t('finance', 'catOperations') :
                         transaction.category === 'Marketing' ? t('finance', 'catMarketing') :
                         transaction.category === 'Salary' ? t('finance', 'catSalary') :
                         t('finance', 'catOther')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${transaction.type === 'Income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {transaction.type === 'Income' ? t('finance', 'income') : t('finance', 'expense')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${transaction.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            transaction.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                              transaction.status === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {transaction.status === 'Completed' ? t('common', 'completed') :
                            transaction.status === 'Pending' ? t('common', 'pending') :
                            transaction.status === 'Approved' ? t('projects', 'statusActive') :
                            t('projects', 'statusCancelled')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${transaction.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(transaction)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                              <FiEdit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(transaction.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700/50">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingTransaction ? t('finance', 'editTransaction') : t('finance', 'newTransaction')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'descriptionRequired')}</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'amountRequired')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'typeRequired')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Income">{t('finance', 'income')}</option>
                    <option value="Expense">{t('finance', 'expense')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'categoryLabel')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Sponsorship">{t('finance', 'catSponsorship')}</option>
                    <option value="Membership">{t('finance', 'catMembership')}</option>
                    <option value="Events">{t('finance', 'catEvents')}</option>
                    <option value="Operations">{t('finance', 'catOperations')}</option>
                    <option value="Marketing">{t('finance', 'catMarketing')}</option>
                    <option value="Salary">{t('finance', 'catSalary')}</option>
                    <option value="Other">{t('finance', 'catOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'statusLabel')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  >
                    <option value="Pending">{t('common', 'pending')}</option>
                    <option value="Approved">{t('projects', 'statusActive')}</option>
                    <option value="Completed">{t('common', 'completed')}</option>
                    <option value="Rejected">{t('projects', 'statusCancelled')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'dateLabel')}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'referenceLabel')}</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder={t('finance', 'referencePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('finance', 'notesLabel')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                  rows={3}
                />
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
                  {editingTransaction ? t('finance', 'updateTransaction') : t('finance', 'createTransaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
