import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={cn(sizes[size], 'relative', className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="crystal-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.7" />
          </linearGradient>
          
          <linearGradient id="crystal-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="crystal-gradient-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.6" />
          </linearGradient>
          
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer glow effect */}
        <circle cx="100" cy="100" r="80" fill="url(#glow)" />
        
        {/* Outer ring */}
        <path
          d="M100 30 L150 70 L150 130 L100 170 L50 130 L50 70 Z"
          fill="none"
          stroke="url(#crystal-gradient-1)"
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Middle crystal layer */}
        <path
          d="M100 50 L135 80 L135 120 L100 150 L65 120 L65 80 Z"
          fill="url(#crystal-gradient-2)"
          opacity="0.7"
        />
        
        {/* Inner crystal core */}
        <path
          d="M100 65 L120 85 L120 115 L100 135 L80 115 L80 85 Z"
          fill="url(#crystal-gradient-3)"
          filter="url(#glow-filter)"
        />
        
        {/* Center highlight */}
        <path
          d="M100 75 L110 85 L110 95 L100 105 L90 95 L90 85 Z"
          fill="white"
          opacity="0.9"
        />
        
        {/* Sparkle effects */}
        <circle cx="140" cy="60" r="2" fill="#FBBF24" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="140" r="1.5" fill="#F59E0B" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="100" r="1" fill="#FBBF24" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}

export function LogoWithText({ className, size = 'md' }: LogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Logo size={size} />
      <span className={cn('font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent', textSizes[size])}>
        AI Coach
      </span>
    </div>
  )
}