import Link from 'next/link'
import { IconType } from 'react-icons'
import { FiZap } from 'react-icons/fi'

interface ActionItem {
  href: string
  label: string
  icon: IconType
  colorClass: string
  bgColorClass: string
  hoverBgClass: string
  darkBgClass: string
  darkHoverBgClass: string
}

interface QuickActionsProps {
  title: string
  actions: ActionItem[]
}

export function QuickActions({ title, actions }: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
          <FiZap size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className={`flex flex-col items-center p-4 ${action.bgColorClass} ${action.darkBgClass} rounded-xl ${action.hoverBgClass} ${action.darkHoverBgClass} transition-all group`}
          >
            <div className={`p-3 ${action.colorClass} rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
              <action.icon className="text-white" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
