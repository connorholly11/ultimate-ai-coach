'use client'

import { useEffect, useState } from 'react'
import { MemoryCard } from '@/components/journey/MemoryCard'
import { TimelineItem } from '@/components/journey/TimelineItem'
import { Sparkles, MessageCircle, Star } from 'lucide-react'
import { sbBrowser } from '@/lib/supabase'
import { ensureAnonUid } from '@/lib/identity'
import { useSession } from '@/hooks/useSession'
import { API_ENDPOINTS } from '@/lib/constants'

interface Memory {
  id: string
  title: string
  insight: string
  type: 'realization' | 'growth' | 'milestone'
  conversationId: string
  createdAt: string
}

interface Conversation {
  id: string
  startedAt: string
  endedAt?: string
  summary?: string
  messageCount: number
}

interface PersonalityProfile {
  bigFive?: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  values?: string[]
  attachmentStyle?: string
}

export default function JourneyPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useSession()
  
  useEffect(() => {
    fetchJourneyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  const fetchJourneyData = async () => {
    try {
      const supabase = sbBrowser()
      const anonUid = user ? undefined : ensureAnonUid()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (user) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }
      
      const url = new URL(API_ENDPOINTS.JOURNEY, window.location.origin)
      if (anonUid) {
        url.searchParams.set('anonUid', anonUid)
      }
      
      const response = await fetch(url, { headers })
      const data = await response.json()
      
      setMemories(data.memories || [])
      setConversations(data.conversations || [])
      
      // Fetch profile separately
      const profileUrl = new URL(API_ENDPOINTS.PROFILE, window.location.origin)
      if (anonUid) {
        profileUrl.searchParams.set('anonUid', anonUid)
      }
      
      const profileResponse = await fetch(profileUrl, { headers })
      const profileData = await profileResponse.json()
      
      if (profileData.profile) {
        setProfile({
          bigFive: profileData.profile.big_five,
          values: profileData.profile.values,
          attachmentStyle: profileData.profile.attachment_style
        })
      }
    } catch (error) {
      console.error('Failed to fetch journey data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Your Journey</h1>
      </div>
      
      {/* Personality Summary */}
      {profile && (profile.bigFive || profile.values) && (
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star size={20} />
              Your Personality Profile
            </h3>
            
            {profile.bigFive && (
              <div className="space-y-3 mb-4">
                {Object.entries(profile.bigFive).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{trait}</span>
                      <span>{(score * 20).toFixed(0)}%</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${score * 20}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {profile.values && profile.values.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-white/80 mb-2">Top Values:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.values.slice(0, 3).map((value) => (
                    <span key={value} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.attachmentStyle && (
              <div className="mt-4">
                <p className="text-sm text-white/80">Attachment Style:</p>
                <p className="text-sm font-medium capitalize">{profile.attachmentStyle.replace('-', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Memories & Breakthroughs */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-500" />
          Memories & Breakthroughs
        </h3>
        
        {memories.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-gray-400 mb-3">
              <Sparkles size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600">Your breakthrough moments will appear here as you chat with your AI coach.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </div>
      
      {/* Past Conversations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-500" />
          Past Conversations
        </h3>
        
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-600">Your conversation history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <TimelineItem key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}