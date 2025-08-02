'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ensureAnonUid } from '@/lib/identity'
import { useSession } from '@/hooks/useSession'
import { sbBrowser } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog'

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

/* LocalStorage keys so prompts are only shown once per browser */
const SOFT_KEY = 'purpose_upgrade_prompt_5'
const MID_KEY = 'purpose_upgrade_prompt_20'
const HARD_KEY = 'purpose_upgrade_prompt_100'

const getFlag = (k: string): boolean =>
  typeof window !== 'undefined' && localStorage.getItem(k) === '1'
const setFlag = (k: string): void => {
  if (typeof window !== 'undefined') localStorage.setItem(k, '1')
}

/* Soft banner after 5 messages */
const SoftUpgradeBanner = ({
  onUpgrade,
  onDismiss,
}: {
  onUpgrade: () => void
  onDismiss: () => void
}) => (
  <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-3 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur-md sm:flex-row">
    <span className="text-sm">
      Create a free account to sync conversations across devices ↗
    </span>
    <div className="flex gap-2">
      <button
        onClick={onUpgrade}
        className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Upgrade
      </button>
      <button
        onClick={onDismiss}
        className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        Dismiss
      </button>
    </div>
  </div>
)

/* Modal for 20- and 100-message prompts */
interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpgrade: () => void
  /** at 100-message milestone, dismissal is disabled */
  required?: boolean
}
const UpgradeModal = ({
  open,
  onOpenChange,
  onUpgrade,
  required = false,
}: UpgradeModalProps) => (
  <Dialog open={open} onOpenChange={required ? undefined : onOpenChange}>
    <DialogOverlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
    <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle>Create a free account</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Sign up to increase your daily message limit, sync progress, and more.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-6 flex justify-end gap-3">
        {!required && (
          <button
            className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </button>
        )}
        <button
          className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={onUpgrade}
        >
          Upgrade with Email
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [episodeId, setEpisodeId] = useState<string | null>(null)

  /* upgrade-prompt state */
  const [showSoftPrompt, setShowSoftPrompt] = useState(false)
  const [showMidPrompt, setShowMidPrompt] = useState(false)
  const [showHardPrompt, setShowHardPrompt] = useState(false)

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

  /* show upgrade prompts for anonymous users only */
  useEffect(() => {
    if (user) return

    const count = messages.length

    if (count >= 100 && !getFlag(HARD_KEY) && !showHardPrompt) {
      setShowHardPrompt(true)
    } else if (count >= 20 && !getFlag(MID_KEY) && !showMidPrompt) {
      setShowMidPrompt(true)
    } else if (count >= 5 && !getFlag(SOFT_KEY) && !showSoftPrompt) {
      setShowSoftPrompt(true)
    }
  }, [messages.length, user])

  /* helper for navigating to auth page */
  const handleUpgrade = useCallback(() => {
    window.location.href = '/login'
  }, [])

  return (
    <ChatContext.Provider value={{ messages, send, loading, episodeId, resetChat }}>
      {children}

      {/* Soft banner (dismissible) */}
      {showSoftPrompt && (
        <SoftUpgradeBanner
          onUpgrade={() => {
            setFlag(SOFT_KEY)
            handleUpgrade()
          }}
          onDismiss={() => {
            setFlag(SOFT_KEY)
            setShowSoftPrompt(false)
          }}
        />
      )}

      {/* 20-message dismissible modal */}
      <UpgradeModal
        open={showMidPrompt}
        onOpenChange={(open) => {
          if (!open) {
            setFlag(MID_KEY)
            setShowMidPrompt(false)
          }
        }}
        onUpgrade={() => {
          setFlag(MID_KEY)
          handleUpgrade()
        }}
      />

      {/* 100-message REQUIRED modal */}
      <UpgradeModal
        open={showHardPrompt}
        required
        onOpenChange={() => {}}
        onUpgrade={() => {
          setFlag(HARD_KEY)
          handleUpgrade()
        }}
      />
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