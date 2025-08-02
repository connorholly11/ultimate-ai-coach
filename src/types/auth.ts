import type { Session, User } from '@supabase/supabase-js'
import type {
  BigFiveTraits,
  ValuesDimensions,
  ValuesMetaDimensions,
  AttachmentDimensions,
  RegulatoryFocus,
  SelfEfficacy
} from './assessments'

export type SupaUser   = User
export type SupaSession = Session

export interface OnboardingData {
  goals: string
  personality: 'supportive' | 'motivational' | 'strategic' | 'accountability'
  completedAt: string
}

export interface FTUEData extends OnboardingData {
  valuesRanking?: string[]
  bigFive?: BigFiveTraits
  attachmentStyle?: string
  
  // Extended assessment data
  values?: ValuesDimensions
  valuesMeta?: ValuesMetaDimensions
  attachment?: AttachmentDimensions
  regulatoryFocus?: RegulatoryFocus
  selfEfficacy?: SelfEfficacy
}