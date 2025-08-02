'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Welcome } from './Welcome'
import { GoalSetting } from './GoalSetting'
import { PersonalityChoice } from './PersonalityChoice'
import { ValuesRankingStep } from './ValuesRankingStep'
import { FTUEProvider, useFTUE } from '@/contexts/FTUEContext'
import { ensureAnonUid } from '@/lib/identity'
import { STORAGE_KEYS, API_ENDPOINTS } from '@/lib/constants'
import type { FTUEData } from '@/types/auth'

type FTUEStep = 'welcome' | 'goals' | 'personalityStyle' | 'valuesRanking' | 'done'

function FTUEFlowContent() {
  const [step, setStep] = useState<FTUEStep>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const { data, updateData } = useFTUE()
  const router = useRouter()
  
  const handleGoalsNext = (goals: string) => {
    updateData({ goals })
    setStep('personalityStyle')
  }
  
  const handlePersonalityNext = (personality: string) => {
    updateData({ personality: personality as FTUEData['personality'] })
    setStep('valuesRanking')
  }
  
  const handleValuesNext = async (values: string[]) => {
    setIsLoading(true)
    try {
      // Update context
      updateData({ valuesRanking: values })
      
      // Ensure anonymous UID is created
      const anonUid = ensureAnonUid()
      
      // Prepare complete FTUE data
      const ftueData: FTUEData = {
        goals: data.goals || '',
        personality: data.personality || 'supportive',
        valuesRanking: values,
        completedAt: new Date().toISOString()
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(ftueData))
      
      // Save to server
      await fetch(API_ENDPOINTS.PROFILE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: ftueData, anonUid })
      })
      
      // Navigate to chat
      router.push('/chat')
    } catch (error) {
      console.error('Failed to save FTUE data:', error)
      // Still navigate to chat even if server save fails
      router.push('/chat')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleBack = () => {
    if (step === 'goals') setStep('welcome')
    else if (step === 'personalityStyle') setStep('goals')
    else if (step === 'valuesRanking') setStep('personalityStyle')
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
      
      {step === 'personalityStyle' && (
        <PersonalityChoice
          onNext={handlePersonalityNext}
          onBack={handleBack}
        />
      )}
      
      {step === 'valuesRanking' && (
        <ValuesRankingStep
          onNext={handleValuesNext}
          onBack={handleBack}
        />
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Setting up your profile...</p>
          </div>
        </div>
      )}
    </>
  )
}

export function FTUEFlow() {
  return (
    <FTUEProvider>
      <FTUEFlowContent />
    </FTUEProvider>
  )
}