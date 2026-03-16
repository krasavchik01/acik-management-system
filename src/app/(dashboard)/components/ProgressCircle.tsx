interface ProgressCircleProps {
  percentage: number
  label: string
  subtitle: string
  gradientId: string
  colors: {
    start: string
    end: string
  }
  icon: React.ReactNode
  stats: {
    label: string
    value: string | number
    colorClass?: string
  }[]
}

export function ProgressCircle({
  percentage,
  label,
  subtitle,
  gradientId,
  colors,
  icon,
  stats
}: ProgressCircleProps) {
  const dashArray = 351
  const dashOffset = dashArray - (percentage * dashArray) / 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{label}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              className="text-gray-200 dark:text-slate-700"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={`url(#${gradientId})`}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              style={{ strokeDashoffset: dashOffset }}
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</span>
              <span className={`font-medium ${stat.colorClass || 'text-gray-900 dark:text-white'}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
