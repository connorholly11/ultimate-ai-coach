// Assessment-specific types and interfaces

export interface BigFiveTraits {
  openness: number          // O: 0-1 scaled
  conscientiousness: number // C: 0-1 scaled
  extraversion: number      // E: 0-1 scaled
  agreeableness: number     // A: 0-1 scaled
  neuroticism: number       // N: 0-1 scaled
}

export interface ValuesDimensions {
  // 10 basic values (0-1 scaled)
  selfDirection: number
  stimulation: number
  hedonism: number
  achievement: number
  power: number
  security: number
  conformity: number
  tradition: number
  benevolence: number
  universalism: number
}

export interface ValuesMetaDimensions {
  // 4 meta-motives (0-1 scaled)
  opennessToChange: number
  selfEnhancement: number
  conservation: number
  selfTranscendence: number
}

export interface AttachmentDimensions {
  anxiety: number    // 1-5 raw score
  avoidance: number  // 1-5 raw score
  style: 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant'
}

export interface RegulatoryFocus {
  promotion: number   // 0-1 scaled
  prevention: number  // 0-1 scaled
}

export interface SelfEfficacy {
  score: number      // 0-1 scaled (raw 10-50)
  raw: number        // 10-50 raw score
}

// Complete personality profile
export interface PersonalityProfile {
  bigFive: BigFiveTraits
  values: ValuesDimensions
  valuesMeta: ValuesMetaDimensions
  attachment: AttachmentDimensions
  regulatoryFocus: RegulatoryFocus
  selfEfficacy: SelfEfficacy
}

// Assessment task with Likert scale metadata
export interface AssessmentTask {
  id: number
  title: string
  required: boolean
  repeat?: number
  // Assessment-specific metadata
  trait?: string      // For Big Five
  dimension?: string  // For Attachment
  focus?: string      // For Regulatory Focus
  reversed?: boolean  // For reverse-scored items
  value?: string      // For Values
}

// Assessment response format
export type AssessmentResponse = Record<number, number> // taskId -> 1-5 rating

// Assessment quest template extension
export interface AssessmentQuestTemplate {
  assessmentType: 'big-five' | 'values' | 'attachment' | 'regulatory-focus' | 'self-efficacy'
  scoringFunction: string // Name of the scoring function to use
}