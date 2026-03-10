'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (section: string, key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Загружаем язык из localStorage при монтировании
    const savedLang = localStorage.getItem('acik-language') as Language
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('acik-language', lang)
  }

  const t = (section: string, key: string): string => {
    try {
      const sectionObj = translations[section as keyof typeof translations]
      if (!sectionObj) return key

      const translation = sectionObj[key as keyof typeof sectionObj]
      if (!translation) return key

      return (translation as Record<Language, string>)[language] || key
    } catch {
      return key
    }
  }

  // Предотвращаем мигание до загрузки языка
  if (!mounted) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
