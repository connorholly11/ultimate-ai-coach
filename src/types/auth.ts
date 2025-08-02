import type { Session, User } from '@supabase/supabase-js'

export type SupaUser   = User
export type SupaSession = Session

export interface OnboardingData {
  goals: string
  personality: 'supportive' | 'motivational' | 'strategic' | 'accountability'
  completedAt: string
}

export interface FTUEData extends OnboardingData {
  valuesRanking?: string[]
  bigFive?: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  attachmentStyle?: string
}