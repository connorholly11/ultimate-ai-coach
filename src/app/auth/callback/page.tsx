'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sbBrowser } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  
  useEffect(() => {
    const handleCallback = async () => {
      const supabase = sbBrowser()
      
      // Get the session from the URL
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/')
        return
      }
      
      if (session) {
        // Check if we have an anonymous UID to migrate
        const anonUid = localStorage.getItem('purpose_uid')
        
        if (anonUid) {
          // Call the upgrade endpoint to merge accounts
          try {
            // Get onboarding data before the API call
            const onboardingData = localStorage.getItem('purpose_onboarding')
            
            const response = await fetch('/api/upgrade', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                email: session.user.email,
                anonUid,
                onboardingData: onboardingData ? JSON.parse(onboardingData) : null
              })
            })
            
            if (response.ok) {
              // Clear anonymous UID
              localStorage.removeItem('purpose_uid')
              if (onboardingData) {
                // TODO: Save to user profile in database
                console.log('TODO: Sync onboarding data to user profile')
              }
            }
          } catch (error) {
            console.error('Upgrade error:', error)
          }
        }
        
        // Redirect to chat
        router.push('/chat')
      } else {
        router.push('/')
      }
    }
    
    handleCallback()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}