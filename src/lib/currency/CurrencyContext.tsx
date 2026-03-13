'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CurrencyCode = 'USD' | 'EUR' | 'KZT'

interface ExchangeRates {
  USD: { buy: number; sell: number }
  EUR: { buy: number; sell: number }
}

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  rates: ExchangeRates | null
  formatCurrency: (amountInUSD: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD')
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem('acik-currency') as CurrencyCode
    if (savedCurrency && ['USD', 'EUR', 'KZT'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency)
    }
    
    // Fetch live exchange rates
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/exchange-rates')
        const data = await res.json()
        if (data.rates) {
          setRates(data.rates)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
      }
    }
    
    fetchRates()
    setMounted(true)
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem('acik-currency', code)
  }

  const formatCurrency = (amountInUSD: number): string => {
    let finalAmount = amountInUSD
    let currencyOptions: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }

    if (currency === 'KZT' && rates?.USD) {
      finalAmount = amountInUSD * rates.USD.buy
      currencyOptions = { style: 'currency', currency: 'KZT', minimumFractionDigits: 0, maximumFractionDigits: 0 }
    } else if (currency === 'EUR' && rates?.USD && rates?.EUR) {
      // Convert USD to KZT, then KZT to EUR
      const amountInKZT = amountInUSD * rates.USD.buy
      finalAmount = amountInKZT / rates.EUR.sell
      currencyOptions = { style: 'currency', currency: 'EUR' }
    } else if (currency === 'EUR' || currency === 'KZT') {
      // Fallback if rates aren't loaded yet but user selected a different currency
      currencyOptions = { style: 'currency', currency }
    }

    // Try catch just in case of environment formatting issues
    try {
      return new Intl.NumberFormat('en-US', currencyOptions).format(finalAmount)
    } catch {
      return `${currency === 'KZT' ? '₸' : currency === 'EUR' ? '€' : '$'}${finalAmount.toFixed(2)}`
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
