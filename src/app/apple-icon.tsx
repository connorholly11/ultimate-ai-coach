import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#A78BFA', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#C084FC', stopOpacity: 0.7 }} />
            </linearGradient>
            
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#DDD6FE', stopOpacity: 0.4 }} />
            </linearGradient>
            
            <linearGradient id="gradient3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#E0E7FF', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#FBBF24', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
          
          {/* Outer ring */}
          <path
            d="M100 30 L150 70 L150 130 L100 170 L50 130 L50 70 Z"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            opacity="0.5"
          />
          
          {/* Middle crystal */}
          <path
            d="M100 50 L135 80 L135 120 L100 150 L65 120 L65 80 Z"
            fill="url(#gradient2)"
            opacity="0.7"
          />
          
          {/* Inner crystal */}
          <path
            d="M100 65 L120 85 L120 115 L100 135 L80 115 L80 85 Z"
            fill="url(#gradient3)"
          />
          
          {/* Center highlight */}
          <path
            d="M100 75 L110 85 L110 95 L100 105 L90 95 L90 85 Z"
            fill="white"
            opacity="0.9"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}