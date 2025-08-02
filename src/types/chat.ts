export interface ChatMessage {
  id?: string            // local messages use Date.now() fall-back
  role: 'user' | 'assistant'
  content: string
  /** epoch-ms when the message was generated */
  timestamp?: number
}

export interface ChatRequestBody {
  message: string
  anonUid?: string
  episodeId?: string
  reset?: boolean
  /** 'supportive' | 'motivational' | & | 'default' */
  personality?: string
  profile?: {
    goals?: string
    personality?: string
    bigFive?: Record<string, number>
    values?: string[]
    attachmentStyle?: string
  }
}

export interface ChatResponseBody {
  reply: string
  episodeId: string
  messageId: string
}