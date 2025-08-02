'use client'

import { useEffect } from 'react'

export function GenerateIcons() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    sizes.forEach(size => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, size, size)

      // Scale factor for drawing
      const scale = size / 200
      ctx.save()
      ctx.scale(scale, scale)

      // Draw outer glow
      const glow = ctx.createRadialGradient(100, 100, 0, 100, 100, 80)
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.3)')
      glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)')
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(100, 100, 80, 0, Math.PI * 2)
      ctx.fill()

      // Draw crystal
      const gradient1 = ctx.createLinearGradient(50, 50, 150, 150)
      gradient1.addColorStop(0, 'rgba(96, 165, 250, 0.9)')
      gradient1.addColorStop(0.5, 'rgba(167, 139, 250, 0.8)')
      gradient1.addColorStop(1, 'rgba(192, 132, 252, 0.7)')

      const gradient2 = ctx.createLinearGradient(50, 50, 150, 150)
      gradient2.addColorStop(0, 'rgba(147, 197, 253, 0.6)')
      gradient2.addColorStop(1, 'rgba(221, 214, 254, 0.4)')

      const gradient3 = ctx.createLinearGradient(100, 50, 100, 150)
      gradient3.addColorStop(0, 'rgba(224, 231, 255, 0.8)')
      gradient3.addColorStop(1, 'rgba(251, 191, 36, 0.6)')

      // Outer crystal
      ctx.strokeStyle = gradient1
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(100, 30)
      ctx.lineTo(150, 70)
      ctx.lineTo(150, 130)
      ctx.lineTo(100, 170)
      ctx.lineTo(50, 130)
      ctx.lineTo(50, 70)
      ctx.closePath()
      ctx.stroke()

      // Middle crystal
      ctx.fillStyle = gradient2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(100, 50)
      ctx.lineTo(135, 80)
      ctx.lineTo(135, 120)
      ctx.lineTo(100, 150)
      ctx.lineTo(65, 120)
      ctx.lineTo(65, 80)
      ctx.closePath()
      ctx.fill()

      // Inner crystal
      ctx.fillStyle = gradient3
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(100, 65)
      ctx.lineTo(120, 85)
      ctx.lineTo(120, 115)
      ctx.lineTo(100, 135)
      ctx.lineTo(80, 115)
      ctx.lineTo(80, 85)
      ctx.closePath()
      ctx.fill()

      // Center highlight
      ctx.fillStyle = 'white'
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.moveTo(100, 75)
      ctx.lineTo(110, 85)
      ctx.lineTo(110, 95)
      ctx.lineTo(100, 105)
      ctx.lineTo(90, 95)
      ctx.lineTo(90, 85)
      ctx.closePath()
      ctx.fill()

      ctx.restore()

      // Convert to blob and download
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `icon-${size}x${size}.png`
        // Uncomment to actually download
        // a.click()
        URL.revokeObjectURL(url)
      })
    })
  }, [])

  return null
}