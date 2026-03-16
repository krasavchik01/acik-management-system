import { IconType } from 'react-icons'

interface StatsCardProps {
  icon: IconType
  value: string | number
  subtitle: string
  trend?: {
    value: string | number
    icon: IconType
    colorClass: string
  }
  footer?: React.ReactNode
  children?: React.ReactNode
  gradientClass: string
  shadowClass: string
}

export function StatsCard({
  icon: Icon,
  value,
  subtitle,
  trend,
  footer,
  children,
  gradientClass,
  shadowClass
}: StatsCardProps) {
  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
      {children}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradientClass} rounded-xl shadow-lg ${shadowClass}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend.colorClass} text-sm font-medium`}>
            <trend.icon size={16} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm">{subtitle}</p>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  )
}
