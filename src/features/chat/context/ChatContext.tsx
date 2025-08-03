'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { sbBrowser } from '@/lib/supabase'
import { STORAGE_KEYS } from '@/lib/constants'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
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
  
  // Helper to create messages with timestamp
  const makeMessage = (role: 'user' | 'assistant', content: string): Message => ({
    id: Date.now() + Math.random(), // Add random to avoid exact duplicate timestamps
    role,
    content,
    timestamp: Date.now(),
  })

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
    
    // Require authentication
    if (!user) {
      throw new Error('Authentication required to send messages')
    }

    setLoading(true)
    
    try {
      const supabase = sbBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }
      
      // Get personality from onboarding data
      const onboardingData = localStorage.getItem('purpose_onboarding')
      let personality = 'default'
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData)
          personality = parsed.personality || 'default'
        } catch (e) {
          console.error('Failed to parse onboarding data:', e)
        }
      }

      // Get profile data from localStorage
      const profileData = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
      let profile = undefined
      
      if (profileData) {
        try {
          const parsed = JSON.parse(profileData)
          profile = {
            goals: parsed.goals,
            personality: parsed.personality,
            bigFive: parsed.bigFive,
            values: parsed.valuesRanking,
            attachmentStyle: parsed.attachmentStyle
          }
        } catch (e) {
          console.error('Failed to parse profile data:', e)
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: text,
          episodeId,
          reset: false,
          personality,
          profile
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
        makeMessage('user', text),
        makeMessage('assistant', data.reply)
      ])
    } catch (error) {
      console.error('Send error:', error)
      // Re-throw error so components can handle it
      throw error
    } finally {
      setLoading(false)
    }
  }, [loading, user, episodeId])

  const resetChat = useCallback(() => {
    if (!user) {
      throw new Error('Authentication required to reset chat')
    }
    
    setMessages([])
    setEpisodeId(null)
    localStorage.removeItem('purpose_messages')
  }, [user])

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