'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ensureAnonUid } from '@/lib/identity'
import { useSession } from '@/hooks/useSession'
import { sbBrowser } from '@/lib/supabase'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

interface ChatContextShape {
  messages: Message[]
  send: (text: string) => Promise<void>
  loading: boolean
  episodeId: string | null
  resetChat: () => void
}

const ChatContext = createContext<ChatContextShape | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [episodeId, setEpisodeId] = useState<string | null>(null)
  const { user } = useSession()

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('purpose_messages')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMessages(parsed.messages || [])
        setEpisodeId(parsed.episodeId || null)
      } catch (e) {
        console.error('Failed to parse stored messages:', e)
      }
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      // Limit to last 100 messages to prevent localStorage bloat
      const toStore = messages.length > 100 
        ? messages.slice(messages.length - 100) 
        : messages
      
      localStorage.setItem('purpose_messages', JSON.stringify({
        messages: toStore,
        episodeId
      }))
    }
  }, [messages, episodeId])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    setLoading(true)
    
    try {
      const anonUid = user ? undefined : ensureAnonUid()
      const supabase = sbBrowser()
      const token = user ? (await supabase.auth.getSession()).data.session?.access_token : undefined

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text,
          anonUid,
          episodeId,
          reset: false
        })
      })

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update episode ID if this was the first message
      if (!episodeId) {
        setEpisodeId(data.episodeId)
      }

      // Add messages to state
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'user', content: text },
        { id: Date.now() + 1, role: 'assistant', content: data.reply }
      ])
    } catch (error) {
      console.error('Send error:', error)
      // Could show a toast here
    } finally {
      setLoading(false)
    }
  }, [loading, user, episodeId])

  const resetChat = useCallback(() => {
    setMessages([])
    setEpisodeId(null)
    localStorage.removeItem('purpose_messages')
  }, [])

  return (
    <ChatContext.Provider value={{ messages, send, loading, episodeId, resetChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}