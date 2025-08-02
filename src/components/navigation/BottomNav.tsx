'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Target, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/chat',
      label: 'Chat',
      icon: MessageCircle,
      active: pathname === '/chat'
    },
    {
      href: '/quests',
      label: 'Quests',
      icon: Target,
      active: pathname === '/quests'
    },
    {
      href: '/journey',
      label: 'Journey',
      icon: BookOpen,
      active: pathname === '/journey'
    }
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <nav className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 px-4 transition-colors",
                item.active ? "text-blue-500" : "text-gray-400"
              )}
            >
              <Icon 
                size={24} 
                strokeWidth={item.active ? 2.5 : 2} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}