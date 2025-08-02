import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#C084FC', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          
          <path
            d="M100 50 L135 80 L135 120 L100 150 L65 120 L65 80 Z"
            fill="url(#gradient)"
          />
          
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