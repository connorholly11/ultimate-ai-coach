'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

export function SyncStatus() {
  const { user } = useSession()
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  
  useEffect(() => {
    if (!user) return
    
    // Check online status
    const handleOnline = () => setSyncStatus('synced')
    const handleOffline = () => setSyncStatus('offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial status
    if (!navigator.onLine) {
      setSyncStatus('offline')
    }
    
    // Update last sync time
    const syncTime = localStorage.getItem('last_sync_time')
    if (syncTime) {
      setLastSync(new Date(syncTime))
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])
  
  // Don't show for anonymous users
  if (!user) return null
  
  const getIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'offline':
        return <CloudOff className="h-4 w-4" />
      default:
        return <Cloud className="h-4 w-4" />
    }
  }
  
  const getLabel = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...'
      case 'offline':
        return 'Offline'
      default:
        return lastSync 
          ? `Synced ${formatRelativeTime(lastSync)}`
          : 'Synced'
    }
  }
  
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs",
      syncStatus === 'offline' ? 'text-destructive' : 'text-muted-foreground'
    )}>
      {getIcon()}
      <span>{getLabel()}</span>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}