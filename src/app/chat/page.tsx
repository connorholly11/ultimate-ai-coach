'use client'

import { Chat } from '@/components/Chat'
import { SaveProgressButton } from '@/components/SaveProgressButton'
import { ChatProvider } from '@/contexts/ChatContext'
import { SyncStatus } from '@/components/SyncStatus'

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Ultimate AI Coach</h1>
            <div className="flex items-center gap-4">
              <SyncStatus />
              <SaveProgressButton />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
          <Chat />
        </main>
      </div>
    </ChatProvider>
  )
}