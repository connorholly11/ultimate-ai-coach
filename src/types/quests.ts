export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuestTask {
  id: number
  title: string
  required: boolean
  /** how many times the task must be completed (optional) */
  repeat?: number
}

export interface QuestTemplate {
  id: string
  title: string
  description: string
  category: 'productivity' | 'health' | 'career' | 'personal' | 'habits'
  difficulty: Difficulty
  durationDays: number
  tasks: QuestTask[]
  rewards?: { points: number }
}

/** Numeric-keyed progress map—task ID → bool | count */
export type ProgressMap = Record<number, boolean | number>

export interface UserQuest {
  id: string
  status: 'active' | 'completed' | 'abandoned'
  startedAt: string
  progress: ProgressMap
  /* Either a template-based quest… */
  questTemplateId?: string
  questTemplate?: QuestTemplate
  /* …or an ad-hoc custom quest */
  customQuest?: Omit<QuestTemplate, 'id' | 'difficulty' | 'durationDays'>
}

export interface QuestAchievement {
  id: string
  uid: string
  questId: string
  title: string
  category: string
  timeTakenDays: number
  pointsEarned: number
  completedAt: string
}