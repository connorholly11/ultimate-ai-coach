'use client'

import { useEffect, useState, useCallback } from 'react'
import { QuestCard } from './QuestCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { ensureAnonUid } from '@/lib/identity'
import { sbBrowser } from '@/lib/supabase'
import type { QuestTemplate, UserQuest } from '@/types'

// Types that account for API snake_case format
interface ApiQuestTemplate extends Omit<QuestTemplate, 'durationDays' | 'isAssessment' | 'orderIndex'> {
  duration_days: number
  is_assessment?: boolean
  order_index?: number
}

interface ApiUserQuest extends Omit<UserQuest, 'questTemplateId' | 'questTemplate' | 'customQuest' | 'startedAt'> {
  quest_template_id?: string
  quest_template?: ApiQuestTemplate
  custom_quest?: Omit<QuestTemplate, 'id' | 'difficulty' | 'durationDays'>
  started_at: string
}

export function QuestList() {
  const [templates, setTemplates] = useState<ApiQuestTemplate[]>([])
  const [activeQuests, setActiveQuests] = useState<ApiUserQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user } = useSession()
  
  const fetchQuests = useCallback(async () => {
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
      
      const url = new URL('/api/quests', window.location.origin)
      if (anonUid) {
        url.searchParams.set('anonUid', anonUid)
      }
      
      const response = await fetch(url, { headers })
      const data = await response.json()
      
      setTemplates(data.templates || [])
      setActiveQuests(data.activeQuests || [])
    } catch (error) {
      console.error('Failed to fetch quests:', error)
    } finally {
      setLoading(false)
    }
  }, [user])
  
  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])
  
  const startQuest = async (templateId: string) => {
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
      
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          questTemplateId: templateId,
          anonUid
        })
      })
      
      if (response.ok) {
        await fetchQuests()
      }
    } catch (error) {
      console.error('Failed to start quest:', error)
    }
  }
  
  const updateQuest = async (questId: string, progress: Record<string, boolean | number>) => {
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
      
      await fetch(`/api/quests/${questId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          progress,
          anonUid
        })
      })
      
      // Update local state
      setActiveQuests(prev =>
        prev.map(q => q.id === questId ? { ...q, progress } : q)
      )
    } catch (error) {
      console.error('Failed to update quest:', error)
    }
  }
  
  const completeQuest = async (questId: string) => {
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
      
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: 'completed',
          anonUid
        })
      })
      
      if (response.ok) {
        await fetchQuests()
      }
    } catch (error) {
      console.error('Failed to complete quest:', error)
    }
  }
  
  const abandonQuest = async (questId: string) => {
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
      
      const url = new URL(`/api/quests/${questId}`, window.location.origin)
      if (anonUid) {
        url.searchParams.set('anonUid', anonUid)
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      })
      
      if (response.ok) {
        await fetchQuests()
      }
    } catch (error) {
      console.error('Failed to abandon quest:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading quests...</p>
        </div>
      </div>
    )
  }
  
  const categories = ['all', 'assessments', 'productivity', 'health', 'career', 'personal', 'habits']
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : selectedCategory === 'assessments'
    ? templates.filter(t => t.is_assessment)
    : templates.filter(t => t.category === selectedCategory && !t.is_assessment)
  
  // Get active quest IDs
  const activeQuestTemplateIds = activeQuests.map(q => q.quest_template_id).filter(Boolean)
  
  return (
    <div className="space-y-6">
      {activeQuests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Quests</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeQuests.map(quest => {
              const questData = quest.quest_template || quest.custom_quest
              if (!questData) return null
              
              // For custom quests, provide default values for missing fields
              const fullQuestData = quest.quest_template || {
                ...quest.custom_quest!,
                difficulty: 'medium' as const,
                duration_days: 30
              }
              
              return (
                <QuestCard
                  key={quest.id}
                  quest={{
                    ...fullQuestData,
                    id: quest.id,
                    durationDays: fullQuestData.duration_days,
                    isAssessment: (quest.quest_template as ApiQuestTemplate)?.is_assessment,
                    orderIndex: (quest.quest_template as ApiQuestTemplate)?.order_index
                  }}
                  isActive
                  progress={quest.progress}
                  onUpdate={(progress) => updateQuest(quest.id, progress)}
                  onComplete={() => completeQuest(quest.id)}
                  onAbandon={() => abandonQuest(quest.id)}
                />
              )
            })}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Quests</h3>
        
        {(() => {
          const activeAssessments = activeQuests.filter(q =>
            q.quest_template?.is_assessment || false
          ).length
          const activeRegularQuests = activeQuests.filter(q =>
            !q.quest_template?.is_assessment
          ).length
          
          if (selectedCategory === 'assessments' && activeAssessments >= 1) {
            return (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can only have one active assessment at a time. Complete your current assessment to start a new one.
                </AlertDescription>
              </Alert>
            )
          }
          
          if (selectedCategory !== 'assessments' && activeRegularQuests >= 3) {
            return (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You have reached the maximum number of active quests. Complete or abandon a quest to start a new one.
                </AlertDescription>
              </Alert>
            )
          }
          
          return null
        })()}
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-7">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize text-xs sm:text-sm">
                {cat === 'assessments' ? '🧠 Assess' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map(template => (
                <QuestCard
                  key={template.id}
                  quest={{
                    ...template,
                    durationDays: template.duration_days,
                    isAssessment: template.is_assessment,
                    orderIndex: template.order_index
                  }}
                  onStart={() => startQuest(template.id)}
                  isActive={activeQuestTemplateIds.includes(template.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}