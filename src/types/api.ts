import type { UserQuest, ProgressMap, QuestTemplate } from './quests'
import type { ChatRequestBody, ChatResponseBody } from './chat'

/* ---- /api/quests endpoints ---- */

export interface GetQuestsQuery {
  type?: 'templates' | 'active' | 'all'
  anonUid?: string
}

export interface GetQuestsResponse {
  templates?: QuestTemplate[]
  activeQuests?: UserQuest[]
}

export interface PostQuestBody {
  questTemplateId?: string
  customQuest?: Omit<QuestTemplate, 'id' | 'difficulty' | 'durationDays'>
  anonUid?: string
}

export interface PatchQuestBody {
  progress?: ProgressMap
  status?: 'completed' | 'abandoned'
  anonUid?: string
}

/* ---- /api/chat endpoint ---- */
export type ChatPOSTBody       = ChatRequestBody
export type ChatPOSTResponse   = ChatResponseBody

/* …add other route contracts (upgrade, referral, etc.) here */