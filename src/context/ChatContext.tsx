'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import clsx from 'clsx'
import * as Dialog from '@radix-ui/react-dialog'

interface SoftUpgradeBannerProps {
  className?: string
  onUpgrade: () => void
  onDismiss: () => void
}

function SoftUpgradeBanner({
  className,
  onUpgrade,
  onDismiss
}: SoftUpgradeBannerProps) {
  return (
    <div
      className={clsx(
        'fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-3 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur-md sm:flex-row',
        className
      )}
    >
      <span className="text-sm">
        Save your progress across devices ↗
      </span>

      <div className="flex gap-2">
        <button
          className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={onUpgrade}
        >
          Upgrade
        </button>
        <button
          className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatContextValue {
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

/**
 * Helper to persist prompt-shown flags in localStorage so users
 * don’t see the same prompt multiple times.
 */
function hasSeenFlag(flag: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(flag) === '1'
}

function setSeenFlag(flag: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(flag, '1')
}

interface ChatProviderProps {
  children: ReactNode
  /**
   * Current user object – `null` / `undefined` for anonymous sessions.
   * The provider only cares about `email` property.
   */
  user?: { email?: string | null }
  onUpgrade?: () => void
}

/**
 * ChatProvider maintains message state AND displays upgrade
 * prompts based on message-count milestones for anonymous users.
 */
export function ChatProvider({
  children,
  user,
  onUpgrade
}: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }, [])

  const clearMessages = useCallback(() => setMessages([]), [])

  /* ------------------------------------------------------------------ */
  /*              Upgrade-prompt milestone handling (anon only)         */
  /* ------------------------------------------------------------------ */

  const isAnon = !user?.email
  const count = messages.length

  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalRequired, setModalRequired] = useState(false)

  // centralised upgrade handler
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // fallback: navigate to upgrade page
      window.location.href = '/upgrade'
    }
  }

  useEffect(() => {
    if (!isAnon) return

    // Soft banner after 5 messages
    if (count >= 5 && !hasSeenFlag('prompt_soft_5')) {
      setShowBanner(true)
      setSeenFlag('prompt_soft_5')
      return
    }

    // Modal at 20 messages
    if (count >= 20 && !hasSeenFlag('prompt_modal_20')) {
      setShowModal(true)
      setModalRequired(false)
      setSeenFlag('prompt_modal_20')
      return
    }

    // Forced modal at >=100 messages
    if (count >= 100 && !hasSeenFlag('prompt_force_100')) {
      setShowModal(true)
      setModalRequired(true)
      setSeenFlag('prompt_force_100')
      return
    }
  }, [count, isAnon])

  /* ------------------------------------------------------------------ */
  /*                                  UI                               */
  /* ------------------------------------------------------------------ */

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}

      {/* Banner after 5 messages */}
      {showBanner && (
        <SoftUpgradeBanner
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Modal at 20 / 100 messages */}
      <UpgradeModal
        open={showModal}
        required={modalRequired}
        onOpenChange={open => setShowModal(open)}
        onUpgrade={handleUpgrade}
      />
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error('useChat must be used within <ChatProvider>')
  }
  return ctx
}

interface UpgradeModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onUpgrade: () => void
  /**
   * If `true`, the modal cannot be dismissed without upgrading (shown at 100 messages).
   */
  required?: boolean
}

function UpgradeModal({
  open,
  onOpenChange,
  onUpgrade,
  required = false
}: UpgradeModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={required ? undefined : onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-xl">
          <Dialog.Title className="mb-2 text-lg font-semibold">
            Create a free account
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-muted-foreground">
            Sign up with your email to sync conversations across devices,
            unlock a higher daily limit, and never lose your progress.
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            {!required && (
              <Dialog.Close asChild>
                <button className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent">
                  Maybe later
                </button>
              </Dialog.Close>
            )}
            <button
              className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={onUpgrade}
            >
              Upgrade with Email
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}