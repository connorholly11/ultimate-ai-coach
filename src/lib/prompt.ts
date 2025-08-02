import { PERSONALITY_STYLES } from './constants'
import type { FTUEData } from '@/types/auth'

export function buildSystemPrompt(
  personalityProfile?: Partial<FTUEData>,
  coachStyle?: string
): string {
  const basePrompt = `You are an empathetic, insightful AI coach dedicated to helping users achieve their goals and grow personally and professionally. You provide supportive, actionable guidance tailored to each person's unique situation.`
  
  let personalityContext = ''
  
  if (personalityProfile) {
    const parts: string[] = []
    
    // Add goals context
    if (personalityProfile.goals) {
      parts.push(`User's Goals: ${personalityProfile.goals}`)
    }
    
    // Add personality style context
    if (personalityProfile.personality) {
      const styleDescriptions = {
        [PERSONALITY_STYLES.SUPPORTIVE]: 'Be warm, encouraging, and always in their corner. Offer emotional support and celebrate small wins.',
        [PERSONALITY_STYLES.MOTIVATIONAL]: 'Be high-energy and push them to reach their potential. Use inspiring language and challenge them positively.',
        [PERSONALITY_STYLES.STRATEGIC]: 'Be analytical and focused on planning and optimization. Provide structured approaches and data-driven insights.',
        [PERSONALITY_STYLES.ACCOUNTABILITY]: 'Be direct, honest, and keep them on track. Ask probing questions and hold them responsible for their commitments.'
      }
      
      const styleDesc = styleDescriptions[personalityProfile.personality] || styleDescriptions[PERSONALITY_STYLES.SUPPORTIVE]
      parts.push(`Coaching Style: ${styleDesc}`)
    }
    
    // Add Big Five context
    if (personalityProfile.bigFive) {
      const traits: string[] = []
      
      Object.entries(personalityProfile.bigFive).forEach(([trait, score]) => {
        const percentage = Math.round(score * 20)
        if (percentage > 60) {
          traits.push(`High ${trait} (${percentage}%)`)
        } else if (percentage < 40) {
          traits.push(`Low ${trait} (${percentage}%)`)
        }
      })
      
      if (traits.length > 0) {
        parts.push(`Personality Traits: ${traits.join(', ')}`)
      }
    }
    
    // Add values context
    if (personalityProfile.valuesRanking && personalityProfile.valuesRanking.length > 0) {
      parts.push(`Core Values (ranked): ${personalityProfile.valuesRanking.slice(0, 3).join(', ')}`)
    }
    
    // Add attachment style context
    if (personalityProfile.attachmentStyle) {
      const attachmentDescriptions = {
        'secure': 'User has secure attachment - comfortable with intimacy and independence',
        'anxious': 'User has anxious attachment - may need extra reassurance and validation',
        'avoidant': 'User has avoidant attachment - respect their independence and avoid being pushy',
        'fearful-avoidant': 'User has fearful-avoidant attachment - be patient and consistent in building trust'
      }
      
      const attachDesc = attachmentDescriptions[personalityProfile.attachmentStyle]
      if (attachDesc) {
        parts.push(`Attachment Style: ${attachDesc}`)
      }
    }
    
    if (parts.length > 0) {
      personalityContext = `\n\nUser Profile:\n${parts.join('\n')}\n\nTailor your responses to match their personality, values, and preferred coaching style.`
    }
  }
  
  return `${basePrompt}${personalityContext}`
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