'use client'

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFlag?: boolean
  className?: string
}

export function Logo({ variant = 'auto', size = 'md', showFlag = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 80, height: 32, flagHeight: 4 },
    md: { width: 120, height: 48, flagHeight: 6 },
    lg: { width: 160, height: 64, flagHeight: 8 },
    xl: { width: 240, height: 96, flagHeight: 12 },
  }

  const { width, height, flagHeight } = sizes[size]

  // Цвета для светлой версии (на тёмном фоне)
  const lightColors = {
    primary: '#ffffff',
    secondary: '#e0e7ff',
    accent: '#a5b4fc',
  }

  // Цвета для тёмной версии (на светлом фоне)
  const darkColors = {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#60a5fa',
  }

  // Градиентные цвета
  const gradientColors = {
    start: '#4f46e5',
    middle: '#7c3aed',
    end: '#a855f7',
  }

  const colors = variant === 'light' ? lightColors : darkColors

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 240 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`logo-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="50%" stopColor={gradientColors.middle} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
          <linearGradient id={`text-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>

        {/* A */}
        <path
          d="M5 70 L30 10 L55 70 M15 50 L45 50"
          stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* C с узором */}
        <g transform="translate(60, 10)">
          <circle
            cx="30"
            cy="30"
            r="28"
            stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
            strokeWidth="6"
            fill="none"
            strokeDasharray="140 40"
          />
          {/* Внутренний узор - пересечения */}
          <line x1="10" y1="10" x2="50" y2="50" stroke={variant === 'light' ? 'rgba(255,255,255,0.6)' : colors.accent} strokeWidth="3" />
          <line x1="50" y1="10" x2="10" y2="50" stroke={variant === 'light' ? 'rgba(255,255,255,0.6)' : colors.accent} strokeWidth="3" />
          <line x1="30" y1="5" x2="30" y2="55" stroke={variant === 'light' ? 'rgba(255,255,255,0.6)' : colors.accent} strokeWidth="3" />
          <line x1="5" y1="30" x2="55" y2="30" stroke={variant === 'light' ? 'rgba(255,255,255,0.6)' : colors.accent} strokeWidth="3" />
        </g>

        {/* I - колонна */}
        <g transform="translate(130, 5)">
          {/* Капитель (верх колонны) */}
          <path
            d="M5 15 Q15 5 25 15 Q35 5 45 15"
            stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
            strokeWidth="4"
            fill="none"
          />
          <ellipse cx="25" cy="18" rx="18" ry="5" fill={variant === 'light' ? 'white' : colors.secondary} />

          {/* Волюты (завитки) */}
          <circle cx="8" cy="12" r="6" stroke={variant === 'light' ? 'white' : colors.secondary} strokeWidth="2" fill="none" />
          <circle cx="42" cy="12" r="6" stroke={variant === 'light' ? 'white' : colors.secondary} strokeWidth="2" fill="none" />

          {/* Ствол колонны */}
          <rect x="12" y="22" width="26" height="40" fill={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`} rx="2" />

          {/* Каннелюры (вертикальные желобки) */}
          <line x1="18" y1="24" x2="18" y2="60" stroke={variant === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)'} strokeWidth="2" />
          <line x1="25" y1="24" x2="25" y2="60" stroke={variant === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)'} strokeWidth="2" />
          <line x1="32" y1="24" x2="32" y2="60" stroke={variant === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)'} strokeWidth="2" />

          {/* База колонны */}
          <rect x="8" y="62" width="34" height="6" fill={variant === 'light' ? 'white' : colors.secondary} rx="1" />
        </g>

        {/* K */}
        <g transform="translate(180, 10)">
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="60"
            stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="30"
            x2="50"
            y2="0"
            stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="30"
            x2="50"
            y2="60"
            stroke={variant === 'light' ? 'white' : `url(#logo-gradient-${variant})`}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Флаг Италии */}
      {showFlag && (
        <div
          className="flex w-full mt-1"
          style={{ height: flagHeight }}
        >
          <div className="flex-1 bg-green-500 rounded-l-full" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-red-500 rounded-r-full" />
        </div>
      )}
    </div>
  )
}

// Простой текстовый логотип для компактных мест
export function LogoText({ variant = 'dark', className = '' }: { variant?: 'light' | 'dark', className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        variant === 'light'
          ? 'bg-white/20 backdrop-blur'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      }`}>
        <span className={`font-bold text-lg ${variant === 'light' ? 'text-white' : 'text-white'}`}>
          A
        </span>
      </div>
      <span className={`font-bold text-xl ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
        ACIK
      </span>
      {/* Мини флаг */}
      <div className="flex h-4 w-6 rounded overflow-hidden">
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-500" />
      </div>
    </div>
  )
}
