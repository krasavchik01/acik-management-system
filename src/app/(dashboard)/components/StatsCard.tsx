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
    <div className="relative bg-white dark:bg-[#0f1623] rounded-2xl p-6 border border-slate-100 dark:border-white/[0.05] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Subtle background glow */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} opacity-[0.07] dark:opacity-[0.12] blur-2xl group-hover:opacity-[0.12] dark:group-hover:opacity-[0.18] transition-opacity duration-500`} />

      {children}

      <div className="relative flex items-start justify-between mb-5">
        <div className={`p-3 bg-gradient-to-br ${gradientClass} rounded-xl shadow-lg ${shadowClass}`}>
          <Icon className="text-white" size={22} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 ${trend.colorClass} text-xs font-semibold bg-current/5 px-2.5 py-1.5 rounded-xl`}
            style={{ backgroundColor: 'currentColor', opacity: 1 }}
          >
            <span className={`flex items-center gap-1.5 ${trend.colorClass}`}>
              <trend.icon size={13} />
              {trend.value}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-0.5 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {value}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{subtitle}</p>
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
          {footer}
        </div>
      )}
    </div>
  )
}
