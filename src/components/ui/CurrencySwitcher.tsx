'use client'

import { useCurrency, CurrencyCode } from '@/lib/currency/CurrencyContext'
import { FiDollarSign } from 'react-icons/fi'

export function CurrencySwitcher() {
  const { currency, setCurrency, rates } = useCurrency()

  const options: { label: string; value: CurrencyCode; symbol: string }[] = [
    { label: 'USD', value: 'USD', symbol: '$' },
    { label: 'EUR', value: 'EUR', symbol: '€' },
    { label: 'KZT', value: 'KZT', symbol: '₸' },
  ]

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-slate-700/50">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setCurrency(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            currency === opt.value
              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
          }`}
          title={rates === null && opt.value !== 'USD' ? 'Loading rates...' : `Switch to ${opt.label}`}
        >
          <span className="opacity-70 font-mono">{opt.symbol}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
