import { sbService } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// GET /api/quests - Get quest templates and user's active quests
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'all'
    
    const supabase = sbService()
    
    // Get user ID from auth or anonymous
    let userId: string | null = null
    let anonUid: string | null = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    } else {
      anonUid = url.searchParams.get('anonUid')
    }
    
    if (type === 'templates') {
      // Get all quest templates
      const { data: templates, error } = await supabase
        .from('quest_templates')
        .select('*')
        .order('category', { ascending: true })
      
      if (error) throw error
      
      return NextResponse.json({ templates })
    }
    
    if (type === 'active') {
      // Get user's active quests
      const query = supabase
        .from('user_quests')
        .select('*, quest_template:quest_templates(*)')
        .eq('status', 'active')
      
      if (userId) {
        query.eq('uid', userId)
      } else if (anonUid) {
        query.eq('anon_uid', anonUid)
      } else {
        return NextResponse.json({ quests: [] })
      }
      
      const { data: quests, error } = await query
      
      if (error) throw error
      
      return NextResponse.json({ quests })
    }
    
    // Get both templates and active quests
    const [templatesResult, questsResult] = await Promise.all([
      supabase.from('quest_templates').select('*').order('category'),
      userId || anonUid
        ? supabase
            .from('user_quests')
            .select('*, quest_template:quest_templates(*)')
            .eq('status', 'active')
            .or(`uid.eq.${userId},anon_uid.eq.${anonUid}`)
        : Promise.resolve({ data: [], error: null })
    ])
    
    if (templatesResult.error || questsResult.error) {
      throw templatesResult.error || questsResult.error
    }
    
    return NextResponse.json({
      templates: templatesResult.data,
      activeQuests: questsResult.data
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
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { questTemplateId, customQuest, anonUid } = body
    
    const authHeader = req.headers.get('Authorization')
    const supabase = sbService()
    
    // Get user ID from auth
    let userId: string | null = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }
    
    if (!userId && !anonUid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user already has this quest active
    if (questTemplateId) {
      const existingQuery = supabase
        .from('user_quests')
        .select('id')
        .eq('quest_template_id', questTemplateId)
        .eq('status', 'active')
      
      if (userId) {
        existingQuery.eq('uid', userId)
      } else {
        existingQuery.eq('anon_uid', anonUid)
      }
      
      const { data: existing } = await existingQuery.single()
      
      if (existing) {
        return NextResponse.json(
          { error: 'Quest already active' },
          { status: 400 }
        )
      }
    }
    
    // Create the quest
    const questData: any = {
      status: 'active',
      progress: {}
    }
    
    if (userId) {
      questData.uid = userId
    } else {
      questData.anon_uid = anonUid
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