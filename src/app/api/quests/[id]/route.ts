import { sbService } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// PATCH /api/quests/[id] - Update quest progress or status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id
    const body = await req.json()
    const { progress, status, anonUid } = body
    
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
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (progress !== undefined) updateData.progress = progress
    if (status !== undefined) updateData.status = status
    if (status === 'completed') updateData.completed_at = new Date().toISOString()
    
    // Update the quest
    const query = supabase
      .from('user_quests')
      .update(updateData)
      .eq('id', questId)
    
    if (userId) {
      query.eq('uid', userId)
    } else {
      query.eq('anon_uid', anonUid)
    }
    
    const { data: quest, error } = await query
      .select('*, quest_template:quest_templates(*)')
      .single()
    
    if (error) throw error
    
    // If quest was completed, create achievement
    if (status === 'completed' && quest) {
      const achievementData: Record<string, unknown> = {
        quest_id: questId,
        title: quest.quest_template?.title || quest.custom_quest?.title,
        category: quest.quest_template?.category || quest.custom_quest?.category || 'custom',
        time_taken_days: Math.ceil(
          (new Date().getTime() - new Date(quest.started_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        points_earned: quest.quest_template?.rewards?.points || 100
      }
      
      if (userId) {
        achievementData.uid = userId
      } else {
        achievementData.anon_uid = anonUid
      }
      
      await supabase.from('quest_achievements').insert(achievementData)
    }
    
    return NextResponse.json({ quest })
    
  } catch (error) {
    console.error('PATCH /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to update quest' },
      { status: 500 }
    )
  }
}

// DELETE /api/quests/[id] - Abandon a quest
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id
    const url = new URL(req.url)
    const anonUid = url.searchParams.get('anonUid')
    
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
    
    // Update quest status to abandoned
    const query = supabase
      .from('user_quests')
      .update({ status: 'abandoned' })
      .eq('id', questId)
    
    if (userId) {
      query.eq('uid', userId)
    } else {
      query.eq('anon_uid', anonUid)
    }
    
    const { error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('DELETE /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to abandon quest' },
      { status: 500 }
    )
  }
}