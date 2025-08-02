/* eslint-disable @typescript-eslint/no-unused-vars */
import { PERSONALITY_STYLES } from './constants'
import type { FTUEData } from '@/types/auth'

export function buildSystemPrompt(
  personalityProfile?: Partial<FTUEData>,
  coachStyle?: string
): string {
  // Base coach personality
  let basePrompt = ''
  if (coachStyle && personalityProfile?.personality) {
    const styleDescriptions = {
      [PERSONALITY_STYLES.SUPPORTIVE]: 'You are a warm, encouraging AI coach, always in the user\'s corner.',
      [PERSONALITY_STYLES.MOTIVATIONAL]: 'You are a high-energy, motivational AI coach.',
      [PERSONALITY_STYLES.STRATEGIC]: 'You are an analytical, strategic AI coach.',
      [PERSONALITY_STYLES.ACCOUNTABILITY]: 'You are a direct, accountability-focused AI coach.'
    }
    basePrompt = styleDescriptions[personalityProfile.personality] || styleDescriptions[PERSONALITY_STYLES.SUPPORTIVE]
  } else {
    basePrompt = 'You are an empathetic, insightful AI coach.'
  }
  
  let traitSnapshot = ''
  
  if (personalityProfile) {
    const parts: string[] = []
    
    // User Trait Snapshot (0-1 scaled unless noted)
    parts.push('\n\nUser Trait Snapshot (0-1 scaled unless noted):')
    
    // Big Five traits
    if (personalityProfile.bigFive) {
      const bf = personalityProfile.bigFive
      parts.push(`• Big Five  O:${bf.openness.toFixed(2)}  C:${bf.conscientiousness.toFixed(2)} E:${bf.extraversion.toFixed(2)}  A:${bf.agreeableness.toFixed(2)}  N:${bf.neuroticism.toFixed(2)}`)
    }
    
    // Values meta-dimensions
    if (personalityProfile.valuesMeta) {
      const vm = personalityProfile.valuesMeta
      parts.push(`• Values  OTCh:${vm.opennessToChange.toFixed(2)}  SE:${vm.selfEnhancement.toFixed(2)} Con:${vm.conservation.toFixed(2)}  ST:${vm.selfTranscendence.toFixed(2)}`)
    }
    
    // Attachment style
    if (personalityProfile.attachment) {
      parts.push(`• Attachment style: ${personalityProfile.attachment.style}`)
    }
    
    // Regulatory focus
    if (personalityProfile.regulatoryFocus) {
      const rf = personalityProfile.regulatoryFocus
      parts.push(`• Regulatory focus  promotion:${rf.promotion.toFixed(2)} prevention:${rf.prevention.toFixed(2)}`)
    }
    
    // Self-efficacy
    if (personalityProfile.selfEfficacy) {
      const rawScore = Math.round(personalityProfile.selfEfficacy.score * 40 + 10)
      parts.push(`• Self-efficacy: ${rawScore}/50`)
    }
    
    // Add goals if present
    if (personalityProfile.goals) {
      parts.push(`\n• Goals: ${personalityProfile.goals}`)
    }
    
    if (parts.length > 1) { // More than just the header
      traitSnapshot = parts.join('\n')
      traitSnapshot += '\n\nAdapt language, goal framing, and accountability tactics accordingly.'
    }
  }
  
  return `${basePrompt}${traitSnapshot}`
}

export function buildBreakthroughPrompt(conversation: Array<{ role: string; content: string }>): string {
  const conversationText = conversation
    .slice(-10) // Last 10 messages
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n')
  
  return `Analyze this coaching conversation and identify if there was a breakthrough moment or key insight. If yes, create a brief, inspiring memory card entry (max 50 words). If no significant breakthrough, respond with "none".

Conversation:
${conversationText}

Respond with JSON: {"hasBreakthrough": boolean, "title": "string", "insight": "string", "type": "realization|growth|milestone"}`
}