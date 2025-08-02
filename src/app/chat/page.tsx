'use client'

import { Chat } from '@/components/Chat'
import { SaveProgressButton } from '@/components/SaveProgressButton'
import { ChatProvider } from '@/contexts/ChatContext'
import { SyncStatus } from '@/components/SyncStatus'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'

function ChatPageContent() {
  const { resetChat } = useChat()
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SyncStatus />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AI Coach</h1>
          <div className="flex items-center gap-2">
            <SaveProgressButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-blue-500"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      <Chat />
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
}