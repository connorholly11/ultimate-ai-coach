'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { EmailCapture } from './EmailCapture'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  allowAnonymous?: boolean
}

export function AuthGuard({ 
  children, 
  fallback,
  allowAnonymous = false 
}: AuthGuardProps) {
  const { user, loading } = useSession()
  const [showContent, setShowContent] = useState(false)
  
  useEffect(() => {
    if (!loading) {
      setShowContent(user !== null || allowAnonymous)
    }
  }, [user, loading, allowAnonymous])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user && !allowAnonymous) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-4">
        {fallback || <EmailCapture />}
      </div>
    )
  }
  
  return <>{children}</>
}