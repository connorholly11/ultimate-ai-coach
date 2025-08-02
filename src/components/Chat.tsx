'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { MicButton } from '@/components/voice/MicButton'

export function Chat() {
  const { messages, send, loading } = useChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      await send(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const handleTranscription = (text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-56px)] bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Start a conversation with your AI coach</p>
              <p className="text-sm mt-2">Share your goals, challenges, or questions</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={message.id || index}>
              {/* Show timestamp for first message or if significant time gap */}
              {(index === 0 ||
                (index > 0 && new Date(message.timestamp || Date.now()).getTime() -
                 new Date(messages[index-1].timestamp || Date.now()).getTime() > 300000)) && (
                <div className="text-center mb-3">
                  <span className="text-xs text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full">
                    {new Date(message.timestamp || Date.now()).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                className="flex-1 bg-transparent outline-none resize-none min-h-0 text-[16px] border-0 p-0 focus-visible:ring-0"
                rows={1}
                disabled={loading}
                style={{ height: 'auto', maxHeight: '120px' }}
              />
              <MicButton
                onTranscription={handleTranscription}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className={`rounded-full transition-all h-10 w-10 ${
                input.trim() && !loading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}