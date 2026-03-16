'use client'

import { FiMapPin, FiSave } from 'react-icons/fi'
import dynamic from 'next/dynamic'

const OfficeMap = dynamic(() => import('@/components/map/OfficeMap'), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl" /> 
})

interface OfficeTabProps {
  officeForm: {
    name: string
    address: string
    latitude: number
    longitude: number
    radius: number
  }
  setOfficeForm: (form: any) => void
  handleSaveOffice: () => void
  savingOffice: boolean
  officeLoaded: boolean
  t: (category: string, key: string) => string
  language: string
}

export default function OfficeTab({
  officeForm,
  setOfficeForm,
  handleSaveOffice,
  savingOffice,
  officeLoaded,
  t,
  language
}: OfficeTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl">
                <FiMapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              {t('admin', 'tabOffice')}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              {language === 'ru' ? 'Кликните на карту или перетащите маркер для выбора местоположения офиса.' : 'Click on the map or drag the marker to select the office location.'}
            </p>
          </div>
          <button
            onClick={handleSaveOffice}
            disabled={savingOffice}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none w-full sm:w-auto"
          >
            <FiSave size={20} />
            {savingOffice ? t('settings', 'saving') : t('common', 'save')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50 min-h-[400px]">
            {officeLoaded && (
              <OfficeMap
                latitude={officeForm.latitude}
                longitude={officeForm.longitude}
                radius={officeForm.radius}
                onLocationSelect={(lat: number, lng: number) => setOfficeForm({ ...officeForm, latitude: lat, longitude: lng })}
              />
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Название офиса</label>
              <input
                type="text"
                value={officeForm.name}
                onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="Главный офис"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Адрес</label>
              <input
                type="text"
                value={officeForm.address}
                onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="ул. Примерная, д. 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Широта</label>
                <input
                  type="number"
                  step="0.0001"
                  value={officeForm.latitude}
                  onChange={(e) => setOfficeForm({ ...officeForm, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Долгота</label>
                <input
                  type="number"
                  step="0.0001"
                  value={officeForm.longitude}
                  onChange={(e) => setOfficeForm({ ...officeForm, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Радиус (метры)</label>
              <input
                type="number"
                value={officeForm.radius}
                onChange={(e) => setOfficeForm({ ...officeForm, radius: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 dark:text-white font-mono"
                min="10"
                max="1000"
              />
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-2">
                Сотрудники в пределах этого радиуса будут отмечены как "в офисе"
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Зона офиса</span>
              </div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 leading-relaxed">
                Радиус <strong className="font-bold">{officeForm.radius}м</strong> от маркера. Чекин в этой зоне = "В офисе".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
