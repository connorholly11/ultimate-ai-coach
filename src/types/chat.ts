export interface ChatMessage {
  id?: string            // local messages use Date.now() fall-back
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequestBody {
  message: string
  anonUid?: string
  episodeId?: string
  reset?: boolean
  /** 'supportive' | 'motivational' | & | 'default' */
  personality?: string
}

export interface ChatResponseBody {
  reply: string
  episodeId: string
  messageId: string
}