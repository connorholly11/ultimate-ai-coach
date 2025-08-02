'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Welcome } from './Welcome'
import { GoalSetting } from './GoalSetting'
import { PersonalityChoice } from './PersonalityChoice'
import { ensureAnonUid } from '@/lib/identity'

type OnboardingStep = 'welcome' | 'goals' | 'personality'

export function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [userData, setUserData] = useState({
    goals: '',
    personality: ''
  })
  const router = useRouter()
  
  const handleGoalsNext = (goals: string) => {
    setUserData(prev => ({ ...prev, goals }))
    setStep('personality')
  }
  
  const handlePersonalityNext = async (personality: string) => {
    // Save to localStorage
    ensureAnonUid() // Ensure anonymous UID is created
    const onboardingData = {
      goals: userData.goals,
      personality,
      completedAt: new Date().toISOString()
    }
    
    localStorage.setItem('purpose_onboarding', JSON.stringify(onboardingData))
    
    // TODO: Save to database when user upgrades
    // For now, just store locally
    
    // Navigate to chat
    router.push('/chat')
  }
  
  const handleBack = () => {
    if (step === 'goals') setStep('welcome')
    else if (step === 'personality') setStep('goals')
  }
  
  return (
    <>
      {step === 'welcome' && (
        <Welcome onNext={() => setStep('goals')} />
      )}
      
      {step === 'goals' && (
        <GoalSetting 
          onNext={handleGoalsNext}
          onBack={handleBack}
        />
      )}
      
      {step === 'personality' && (
        <PersonalityChoice
          onNext={handlePersonalityNext}
          onBack={handleBack}
        />
      )}
    </>
  )
}