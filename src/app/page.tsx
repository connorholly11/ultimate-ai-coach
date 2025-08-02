'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingData = localStorage.getItem('purpose_onboarding')
    
    if (onboardingData) {
      // User has completed onboarding, redirect to chat
      router.push('/chat')
    } else {
      // Show onboarding
      setShowOnboarding(true)
      setLoading(false)
    }
  }, [router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  return showOnboarding ? <OnboardingFlow /> : null
}