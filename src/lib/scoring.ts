// Assessment scoring algorithms

import type { 
  BigFiveTraits, 
  ValuesDimensions, 
  ValuesMetaDimensions,
  AttachmentDimensions,
  RegulatoryFocus,
  SelfEfficacy,
  AssessmentResponse 
} from '@/types/assessments'

// Helper functions
const flip = (v: number) => 6 - v  // For reverse-scored items (1-5 scale)
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
const normalize = (score: number) => (score - 1) / 4  // Convert 1-5 to 0-1

// Big Five scoring
export function scoreBigFive(responses: AssessmentResponse): BigFiveTraits {
  // Reverse-scored items (1-indexed in spec, 0-indexed in code)
  const reverseItems = [2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30].map(i => i - 1)
  
  // Apply reverse scoring
  const scored = Object.entries(responses).map(([id, value]) => {
    const index = parseInt(id) - 1  // Convert to 0-indexed
    return reverseItems.includes(index) ? flip(value) : value
  })
  
  // Trait indices (1-indexed in spec, convert to 0-indexed)
  const indices = {
    extraversion: [1, 2, 3, 4, 5, 6].map(i => i - 1),
    openness: [7, 8, 9, 10, 11, 12].map(i => i - 1),
    agreeableness: [13, 14, 15, 16, 17, 18].map(i => i - 1),
    conscientiousness: [19, 20, 21, 22, 23, 24].map(i => i - 1),
    neuroticism: [25, 26, 27, 28, 29, 30].map(i => i - 1)
  }
  
  // Calculate trait scores and normalize to 0-1
  return {
    openness: normalize(mean(indices.openness.map(i => scored[i]))),
    conscientiousness: normalize(mean(indices.conscientiousness.map(i => scored[i]))),
    extraversion: normalize(mean(indices.extraversion.map(i => scored[i]))),
    agreeableness: normalize(mean(indices.agreeableness.map(i => scored[i]))),
    neuroticism: normalize(mean(indices.neuroticism.map(i => scored[i])))
  }
}

// PVQ-21 Values scoring
export function scoreValues(responses: AssessmentResponse): { 
  values: ValuesDimensions, 
  meta: ValuesMetaDimensions 
} {
  // Map question numbers to value dimensions (1-indexed)
  const valueMapping: Record<string, number[]> = {
    selfDirection: [1, 11],
    stimulation: [2, 12],
    hedonism: [3, 13],
    achievement: [4, 14],
    power: [5, 15],
    security: [6, 16],
    conformity: [7, 17],
    tradition: [8, 18],
    benevolence: [9, 19],
    universalism: [10, 20, 21]
  }
  
  // Calculate value scores
  const values: ValuesDimensions = {
    selfDirection: 0,
    stimulation: 0,
    hedonism: 0,
    achievement: 0,
    power: 0,
    security: 0,
    conformity: 0,
    tradition: 0,
    benevolence: 0,
    universalism: 0
  }
  
  for (const [value, indices] of Object.entries(valueMapping)) {
    const scores = indices.map(i => responses[i] || 3)  // Default to neutral if missing
    values[value as keyof ValuesDimensions] = normalize(mean(scores))
  }
  
  // Calculate meta-dimensions
  const meta: ValuesMetaDimensions = {
    opennessToChange: mean([values.selfDirection, values.stimulation]),
    selfEnhancement: mean([values.achievement, values.power, values.hedonism]),
    conservation: mean([values.security, values.tradition, values.conformity]),
    selfTranscendence: mean([values.benevolence, values.universalism])
  }
  
  return { values, meta }
}

// ECR-S Attachment scoring
export function scoreAttachment(responses: AssessmentResponse): AttachmentDimensions {
  // Reverse-scored items (1-indexed)
  const reverseItems = [2, 6, 10, 12].map(i => i - 1)
  
  // Apply reverse scoring
  const scored: Record<number, number> = {}
  for (const [id, value] of Object.entries(responses)) {
    const index = parseInt(id) - 1
    scored[parseInt(id)] = reverseItems.includes(index) ? flip(value) : value
  }
  
  // Dimension indices (1-indexed)
  const anxietyIndices = [1, 3, 5, 7, 9, 11]
  const avoidanceIndices = [2, 4, 6, 8, 10, 12]
  
  // Calculate dimension scores (keep as 1-5 raw scores)
  const anxiety = mean(anxietyIndices.map(i => scored[i] || 3))
  const avoidance = mean(avoidanceIndices.map(i => scored[i] || 3))
  
  // Determine attachment style
  let style: AttachmentDimensions['style']
  if (anxiety < 3 && avoidance < 3) {
    style = 'secure'
  } else if (anxiety >= 3 && avoidance < 3) {
    style = 'anxious'
  } else if (anxiety < 3 && avoidance >= 3) {
    style = 'avoidant'
  } else {
    style = 'fearful-avoidant'
  }
  
  return { anxiety, avoidance, style }
}

// GRFM Regulatory Focus scoring
export function scoreRegulatoryFocus(responses: AssessmentResponse): RegulatoryFocus {
  // Promotion items: 1-9, Prevention items: 10-18 (1-indexed)
  const promotionIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const preventionIndices = [10, 11, 12, 13, 14, 15, 16, 17, 18]
  
  // Calculate and normalize scores
  const promotion = normalize(mean(promotionIndices.map(i => responses[i] || 3)))
  const prevention = normalize(mean(preventionIndices.map(i => responses[i] || 3)))
  
  return { promotion, prevention }
}

// GSE-10 Self-Efficacy scoring
export function scoreSelfEfficacy(responses: AssessmentResponse): SelfEfficacy {
  // Sum all 10 items (no reverse scoring)
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const raw = items.reduce((sum, i) => sum + (responses[i] || 3), 0)
  
  // Normalize: (raw - 10) / 40 to get 0-1 scale
  const score = (raw - 10) / 40
  
  return { score, raw }
}

// Master scoring function that routes to appropriate scorer
export function scoreAssessment(
  assessmentType: string, 
  responses: AssessmentResponse
): Partial<{
  bigFive: BigFiveTraits
  values: ValuesDimensions
  valuesMeta: ValuesMetaDimensions
  attachment: AttachmentDimensions
  regulatoryFocus: RegulatoryFocus
  selfEfficacy: SelfEfficacy
}> {
  switch (assessmentType) {
    case 'big-five':
      return { bigFive: scoreBigFive(responses) }
    
    case 'values':
      const { values, meta } = scoreValues(responses)
      return { values, valuesMeta: meta }
    
    case 'attachment':
      return { attachment: scoreAttachment(responses) }
    
    case 'regulatory-focus':
      return { regulatoryFocus: scoreRegulatoryFocus(responses) }
    
    case 'self-efficacy':
      return { selfEfficacy: scoreSelfEfficacy(responses) }
    
    default:
      throw new Error(`Unknown assessment type: ${assessmentType}`)
  }
}