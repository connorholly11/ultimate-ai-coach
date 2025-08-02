'use client'

import { useEffect, useState, useCallback } from 'react'
import { QuestCard } from './QuestCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { ensureAnonUid } from '@/lib/identity'
import { sbBrowser } from '@/lib/supabase'

interface QuestTemplate {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration_days: number
  tasks: any[]
  rewards?: {
    points: number
  }
}

interface UserQuest {
  id: string
  quest_template_id?: string
  quest_template?: QuestTemplate
  custom_quest?: {
    title: string
    description: string
    category: string
    tasks: any[]
  }
  status: string
  progress: Record<string, boolean | number>
  started_at: string
}

export function QuestList() {
  const [templates, setTemplates] = useState<QuestTemplate[]>([])
  const [activeQuests, setActiveQuests] = useState<UserQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user } = useSession()
  
  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])
  
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
  
  const categories = ['all', 'productivity', 'health', 'career', 'personal', 'habits']
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)
  
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
              return (
                <QuestCard
                  key={quest.id}
                  quest={{ ...questData, id: quest.id }}
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
        
        {activeQuests.length >= 3 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have reached the maximum number of active quests. Complete or abandon a quest to start a new one.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map(template => (
                <QuestCard
                  key={template.id}
                  quest={template}
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