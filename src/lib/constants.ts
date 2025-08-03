// Centralized constants for the application

// Assessment quest IDs
export const ASSESSMENT_QUEST_IDS = {
  BIG_FIVE: 'big-five',
  VALUES: 'values',
  ATTACHMENT: 'attachment'
} as const

// Model IDs
export const MODEL_IDS = {
  SONNET: 'claude-3-5-sonnet-20241022',
  WHISPER: 'whisper-large-v3-turbo'
} as const

// Personality styles
export const PERSONALITY_STYLES = {
  SUPPORTIVE: 'supportive',
  MOTIVATIONAL: 'motivational',
  STRATEGIC: 'strategic',
  ACCOUNTABILITY: 'accountability'
} as const

// Memory types
export const MEMORY_TYPES = {
  REALIZATION: 'realization',
  GROWTH: 'growth',
  MILESTONE: 'milestone'
} as const

// Quest categories
export const QUEST_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  HEALTH: 'health',
  CAREER: 'career',
  PERSONAL: 'personal',
  HABITS: 'habits'
} as const

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  QUESTS: '/api/quests',
  PROFILE: '/api/profile',
  JOURNEY: '/api/journey',
  TRANSCRIBE: '/api/transcribe',
  BREAKTHROUGH: '/api/breakthrough'
} as const

// Local storage keys
export const STORAGE_KEYS = {
  ONBOARDING: 'purpose_onboarding',
  MESSAGES: 'purpose_messages',
  EPISODE_ID: 'purpose_episode_id'
} as const

// UI constants
export const UI_CONSTANTS = {
  MAX_ACTIVE_QUESTS: 3,
  MAX_ACTIVE_ASSESSMENTS: 1,
  MESSAGE_BATCH_SIZE: 100,
  BREAKTHROUGH_CHECK_INTERVAL: 5
} as const