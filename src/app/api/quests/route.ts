import { sbService } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'
import { getAuthUser, authError } from '@/lib/auth-helpers'

export const runtime = 'edge'

// GET /api/quests - Get quest templates and user's active quests
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'all'
    
    const supabase = sbService()
    
    // All quest routes now require authentication
    if (!user) return authError()
    
    // Return quest templates (now requires auth)
    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('quest_templates')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      
      return NextResponse.json({ templates })
    }
    
    if (type === 'active') {
      // Get user's active quests
      const { data: quests, error } = await supabase
        .from('user_quests')
        .select('*, quest_template:quest_templates(*)')
        .eq('status', 'active')
        .eq('uid', user.id)
      
      if (error) throw error
      
      return NextResponse.json({ quests })
    }
    
    // Get both templates and active quests
    const [templatesResult, questsResult] = await Promise.all([
      supabase
        .from('quest_templates')
        .select('*')
        .order('order_index', { ascending: true }),
      supabase
        .from('user_quests')
        .select('*, quest_template:quest_templates(*)')
        .eq('status', 'active')
        .eq('uid', user.id)
    ])
    
    if (templatesResult.error || questsResult.error) {
      throw templatesResult.error || questsResult.error
    }
    
    return NextResponse.json({
      templates: templatesResult.data || [],
      activeQuests: questsResult.data || []
    })
    
  } catch (error) {
    console.error('GET /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
}

// POST /api/quests - Start a new quest
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const body = await req.json()
    const { questTemplateId, customQuest } = body
    
    const supabase = sbService()
    
    // Check if user already has this quest active
    if (questTemplateId) {
      const { data: existing } = await supabase
        .from('user_quests')
        .select('id')
        .eq('quest_template_id', questTemplateId)
        .eq('status', 'active')
        .eq('uid', user.id)
        .single()
      
      if (existing) {
        return NextResponse.json(
          { error: 'Quest already active' },
          { status: 400 }
        )
      }
    }
    
    // Create the quest
    const questData: Record<string, unknown> = {
      uid: user.id,
      status: 'active',
      progress: {}
    }
    
    if (questTemplateId) {
      questData.quest_template_id = questTemplateId
    } else if (customQuest) {
      questData.custom_quest = customQuest
    } else {
      return NextResponse.json(
        { error: 'Must provide either questTemplateId or customQuest' },
        { status: 400 }
      )
    }
    
    const { data: quest, error } = await supabase
      .from('user_quests')
      .insert(questData)
      .select('*, quest_template:quest_templates(*)')
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ quest })
    
  } catch (error) {
    console.error('POST /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to create quest' },
      { status: 500 }
    )
  }
}